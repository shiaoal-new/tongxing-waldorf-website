import React, { useEffect, useState, useRef } from 'react';
import DebuggerPopup from './DebuggerPopup';

/**
 * LayoutDebugger - 僅在開發模式下運行的佈局偵測器
 * 用於自動偵測手機版橫向溢出問題 (Horizontal Overflow)
 */
export default function LayoutDebugger() {
    const isVisibleRef = useRef(false);
    const [overflowElements, setOverflowElements] = useState<{ tag: string; className: string; id: string; amount: number; el: Element }[]>([]);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // 僅在開發模式且客戶端運行
        if (process.env.NODE_ENV === 'production' || typeof window === 'undefined') return;

        let throttleTimer: NodeJS.Timeout | undefined;
        let confirmationTimer: NodeJS.Timeout | undefined;

        const scan = () => {
            const innerWidth = window.innerWidth;
            const scrollWidth = document.documentElement.scrollWidth;
            const bodyScrollWidth = document.body.scrollWidth;
            const vv = window.visualViewport;
            const currentScrollX = window.scrollX;
            const vvOffset = vv ? vv.offsetLeft : 0;

            // 檢查是否被父層裁切 (Overflow Hidden)
            const isClippedByAncestor = (el: Element, viewportWidth: number) => {
                let parent = el.parentElement;
                while (parent && parent !== document.body && parent !== document.documentElement) {
                    const style = window.getComputedStyle(parent);
                    const overflowX = style.overflowX;
                    const overflow = style.overflow;

                    // 如果父層設有隱藏或滾動，且父層本身沒有溢出視窗太嚴重 (給予 2px 寬限)
                    if (['hidden', 'scroll', 'auto', 'clip'].includes(overflowX) || ['hidden', 'scroll', 'auto', 'clip'].includes(overflow)) {
                        const parentRect = parent.getBoundingClientRect();
                        // 檢查父層右邊界是否在大致安全的範圍內
                        if (parentRect.right <= viewportWidth + 2) {
                            return true;
                        }
                    }
                    parent = parent.parentElement;
                }
                return false;
            };

            // 檢查所有元素
            const elements = Array.from(document.querySelectorAll('*'));
            const offendingRawFull = elements
                .map(el => {
                    const rect = el.getBoundingClientRect();
                    const overflowRight = rect.right - innerWidth;
                    const overflowLeft = -rect.left;
                    return {
                        el,
                        tag: el.tagName,
                        className: el.className,
                        id: el.id,
                        amount: Math.max(overflowRight, overflowLeft)
                    };
                });

            let offending = offendingRawFull
                .filter(item => item.amount > 1.0) // 避免 1px 以內的精密誤差
                .filter(item => {
                    // 1. 忽略完全在視窗右側以外的元素 (通常是 Off-screen Menu / Drawer)
                    if (item.el.getBoundingClientRect().left >= innerWidth) return false;

                    // 2. 忽略 Aria Hidden 的元素
                    if (item.el.getAttribute('aria-hidden') === 'true') return false;

                    // 3. 忽略正在做半透明動畫或不可見的元素
                    const style = window.getComputedStyle(item.el);
                    if (parseFloat(style.opacity) < 1 || style.pointerEvents === 'none') return false;

                    // 忽略高 z-index 的絕對定位元素 (通常是 Modal/Drawer，溢出多為有意)
                    if ((style.position === 'absolute' || style.position === 'fixed') && parseInt(style.zIndex) > 10) return false;

                    // 4. 檢查是否被父層裁切
                    return !isClippedByAncestor(item.el, innerWidth);
                })
                .filter((item, index, self) => {
                    // 只保留最外層的錯誤元素
                    return !self.some((other, otherIndex) =>
                        otherIndex !== index && other.el.contains(item.el)
                    );
                })
                .map(({ tag, className, id, amount, el }) => ({ tag, className, id, amount, el }));

            // 修正：如果 offending 為空但有明顯捲動偏移，且非 Pinch Zoom，塞入一個視覺提示
            if (offending.length === 0 && (currentScrollX > 1 || Math.abs(vvOffset) > 1)) {
                if (!(vv && Math.abs(vv.scale - 1) > 0.01)) {
                    offending = [{
                        tag: 'VIEWPORT',
                        className: 'viewport-shift',
                        id: 'visual-viewport',
                        amount: Math.max(Math.abs(vvOffset), currentScrollX),
                        el: document.body
                    }];
                }
            }

            const hasActualOverflow = (scrollWidth > innerWidth + 1) || (bodyScrollWidth > innerWidth + 1) || offending.length > 0;

            return { offending, hasActualOverflow };
        };

        const checkOverflow = () => {
            const { offending, hasActualOverflow } = scan();

            if (hasActualOverflow && offending.length > 0) {
                // 如果已經顯示中，直接更新內容
                if (isVisibleRef.current) {
                    setOverflowElements(offending);
                    return;
                }

                // 如果還沒顯示，且沒在計時，就進入 0.5s 確認期
                if (!confirmationTimer) {
                    confirmationTimer = setTimeout(() => {
                        const secondResult = scan();
                        if (secondResult.hasActualOverflow && secondResult.offending.length > 0) {
                            setOverflowElements(secondResult.offending);
                            setIsVisible(true);
                            isVisibleRef.current = true;
                            console.warn(`[Layout Check] ⚠️ 偵測到持續橫向溢出！(已確認 0.5s)`);
                            console.table(secondResult.offending);
                        }
                        confirmationTimer = undefined;
                    }, 500);
                }
            } else {
                // 沒有溢出，清除確認計時器
                if (confirmationTimer) {
                    clearTimeout(confirmationTimer);
                    confirmationTimer = undefined;
                }
            }
        };

        const throttledCheck = () => {
            if (throttleTimer) return;
            throttleTimer = setTimeout(() => {
                checkOverflow();
                throttleTimer = undefined;
            }, 200); // 縮短觀察延遲，讓「確認期」的主導權回到 0.5s 計時器
        };

        const observer = new MutationObserver(throttledCheck);
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['style', 'class']
        });

        window.addEventListener('load', throttledCheck);
        window.addEventListener('resize', throttledCheck);

        const onScroll = () => {
            const vv = window.visualViewport;
            const currentScrollX = window.scrollX;
            const vvOffset = vv ? vv.offsetLeft : 0;

            if (currentScrollX > 1 || Math.abs(vvOffset) > 1) {
                // 排除 Pinch Zoom
                if (vv && Math.abs(vv.scale - 1) > 0.01) return;
                checkOverflow();
            }
        };

        window.addEventListener('scroll', onScroll);

        if (window.visualViewport) {
            window.visualViewport.addEventListener('scroll', onScroll);
            window.visualViewport.addEventListener('resize', throttledCheck);
        }

        throttledCheck();

        return () => {
            observer.disconnect();
            window.removeEventListener('load', throttledCheck);
            window.removeEventListener('resize', throttledCheck);
            window.removeEventListener('scroll', onScroll);
            if (window.visualViewport) {
                window.visualViewport.removeEventListener('scroll', onScroll);
                window.visualViewport.removeEventListener('resize', throttledCheck);
            }
            if (throttleTimer) clearTimeout(throttleTimer);
            if (confirmationTimer) clearTimeout(confirmationTimer);
        };
    }, []);

    const handleElementClick = (targetEl: Element) => {
        const container = targetEl.closest('[data-yml-src]');
        if (container) {
            const rawValue = container.getAttribute('data-yml-src');
            if (rawValue) {
                // 解析 path:line 格式
                const lastColon = rawValue.lastIndexOf(':');
                let filePath = rawValue;
                let lineNum = '';
                if (lastColon > 0 && /^\d+$/.test(rawValue.slice(lastColon + 1))) {
                    filePath = rawValue.slice(0, lastColon);
                    lineNum = rawValue.slice(lastColon + 1);
                }

                const url = lineNum
                    ? `antigravity://file${filePath}:${lineNum}:1`
                    : `antigravity://file${filePath}`;
                window.location.href = url;
            }
        }
    };

    if (!isVisible || overflowElements.length === 0) return null;

    return (
        <DebuggerPopup
            title="佈局溢出警告 (Layout Overflow)"
            icon="⚠️"
            colorClass="bg-red-600"
            onClose={() => {
                setIsVisible(false);
                isVisibleRef.current = false;
            }}
            positionClass="bottom-4 right-4"
        >
            <div className="space-y-1">
                <p>手機版寬度超標，可能導致左右晃動。</p>
                <div className="bg-black/20 p-2 rounded-lg mt-2 max-h-32 overflow-auto custom-scrollbar">
                    {overflowElements.slice(0, 2).map((el, i) => (
                        <div
                            key={i}
                            className="mb-1 border-b border-white/10 pb-1 last:border-0 cursor-pointer hover:bg-white/10 transition-colors group"
                            onClick={() => handleElementClick(el.el)}
                            title="Click to jump to source YAML"
                        >
                            <span className="font-mono text-[10px] text-yellow-300 group-hover:text-yellow-200">
                                {el.tag.toLowerCase()}{el.id ? `#${el.id}` : ''}{typeof el.className === 'string' && el.className ? `.${el.className.split(' ')[0]}` : ''}
                            </span>
                            <div className="text-[10px] text-white/70">溢出: {Math.round(el.amount)}px</div>
                        </div>
                    ))}
                    {overflowElements.length > 2 && <div className="text-[10px]">...及其他 {overflowElements.length - 2} 個元素</div>}
                </div>
            </div>
        </DebuggerPopup>
    );
}
