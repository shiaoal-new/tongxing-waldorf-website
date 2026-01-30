import React, { useEffect, useState } from 'react';

/**
 * LayoutDebugger - 僅在開發模式下運行的佈局偵測器
 * 用於自動偵測手機版橫向溢出問題 (Horizontal Overflow)
 */
export default function LayoutDebugger() {
    const [overflowElements, setOverflowElements] = useState<{ tag: string; className: string; id: string; amount: number }[]>([]);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // 僅在開發模式且客戶端運行
        if (process.env.NODE_ENV === 'production' || typeof window === 'undefined') return;

        let timeoutId: NodeJS.Timeout;

        const checkOverflow = () => {
            const innerWidth = window.innerWidth;
            const scrollWidth = document.documentElement.scrollWidth;
            const bodyScrollWidth = document.body.scrollWidth;

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
                            // 被一個安全的父層裁切或管理，視為安全
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

            // Debug: log top 3 distinct overflows
            // code removed


            const offendingRaw = offendingRawFull
                .filter(item => item.amount > 1.0) // 回歸 1.0，避免 0.5px 的精密誤差
                .filter(item => {
                    // 1. 忽略完全在視窗右側以外的元素 (通常是 Off-screen Menu / Drawer)
                    if (item.el.getBoundingClientRect().left >= innerWidth) return false;

                    // 2. 忽略 Aria Hidden 的元素 (無障礙隱藏元素，通常也視覺隱藏)
                    if (item.el.getAttribute('aria-hidden') === 'true') return false;

                    // 3. 忽略正在做半透明動畫或不可見的元素 (例如 Exit Animation)
                    const style = window.getComputedStyle(item.el);
                    if (parseFloat(style.opacity) < 1 || style.pointerEvents === 'none') return false;
                    // 忽略高 z-index 的絕對定位元素 (通常是 Modal/Drawer/Overlay，溢出多為有意)
                    if ((style.position === 'absolute' || style.position === 'fixed') && parseInt(style.zIndex) > 10) return false;

                    // 4. 檢查是否被父層裁切
                    const clipped = isClippedByAncestor(item.el, innerWidth);
                    return !clipped;
                }); // 過濾掉被安全裁切和其他無害元素

            if (offendingRaw.length > 0 && offendingRaw.length !== elements.filter(item => {
                const rect = item.getBoundingClientRect();
                return Math.max(rect.right - innerWidth, -rect.left) > 1.0;
            }).length) {
                // Double check count logic
            }

            const offending = offendingRaw
                // 只保留最外層的錯誤元素，避免列出所有子元素
                .filter((item, index, self) => {
                    return !self.some((other, otherIndex) =>
                        otherIndex !== index && other.el.contains(item.el)
                    );
                })
                .map(({ tag, className, id, amount }) => ({ tag, className, id, amount }));

            // 判斷是否真的有溢出 (scrollWidth 大於 innerWidth 或者有明顯的 offending 元素)
            const hasActualOverflow = (scrollWidth > innerWidth + 1) || (bodyScrollWidth > innerWidth + 1) || offending.length > 0;

            if (hasActualOverflow && offending.length > 0) {
                setOverflowElements(offending);
                setIsVisible(true);

                // 頻率限制的 Console 輸出
                console.warn(`[Layout Check] ⚠️ 偵測到橫向溢出！`);
                console.table(offending);
            }
            // else if (!hasActualOverflow) {
            //      // previously auto-closed
            // }
        };

        const throttledCheck = () => {
            if (timeoutId) return;
            timeoutId = setTimeout(() => {
                checkOverflow();
                timeoutId = undefined as any;
            }, 500);
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
        // 新增：監聽捲動事件，這是最直接的證據
        // 如果使用者能橫向捲動，代表一定有溢出
        const onScroll = (e: Event) => {
            const vv = window.visualViewport;


            const currentScrollX = window.scrollX;
            const vvOffset = vv ? vv.offsetLeft : 0;

            if (currentScrollX > 1 || Math.abs(vvOffset) > 1) {
                // 確認不是因為放大 (Pinch Zoom) 造成的
                if (vv && Math.abs(vv.scale - 1) > 0.01) {
                    return;
                }

                // 再次執行檢查以找出元兇
                checkOverflow();

                // 強制顯示警告
                setIsVisible(true);

                // 如果 checkOverflow 沒找到元素（overflowElements 為空），手動塞一個「不明原因」讓它顯示
                setOverflowElements(prev => {
                    if (prev.length === 0) {
                        return [{
                            tag: 'VIEWPORT',
                            className: 'viewport-shift',
                            id: 'visual-viewport',
                            amount: Math.abs(vvOffset) || window.scrollX
                        }];
                    }
                    return prev;
                });
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
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, []);

    if (!isVisible || overflowElements.length === 0) return null;

    return (
        <div
            className="fixed bottom-4 right-4 z-[9999] max-w-xs animate-bounce-subtle"
            style={{ pointerEvents: 'none' }}
        >
            <div
                className="bg-red-600 text-white p-4 rounded-2xl shadow-2xl border-2 border-white/20 backdrop-blur-md"
                style={{ pointerEvents: 'auto' }}
            >
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">⚠️</span>
                    <span className="font-bold text-sm">佈局溢出警告 (Layout Overflow)</span>
                </div>
                <div className="text-xs opacity-90 space-y-1">
                    <p>手機版寬度超標，可能導致左右晃動。</p>
                    <div className="bg-black/20 p-2 rounded-lg mt-2 max-h-32 overflow-auto">
                        {overflowElements.slice(0, 2).map((el, i) => (
                            <div key={i} className="mb-1 border-b border-white/10 pb-1 last:border-0">
                                <span className="font-mono text-[10px] text-yellow-300">
                                    {el.tag.toLowerCase()}{el.id ? `#${el.id}` : ''}{el.className ? `.${el.className.split(' ')[0]}` : ''}
                                </span>
                                <div className="text-[10px] text-white/70">溢出: {Math.round(el.amount)}px</div>
                            </div>
                        ))}
                        {overflowElements.length > 2 && <div className="text-[10px]">...及其他 {overflowElements.length - 2} 個元素</div>}
                    </div>
                </div>
                <button
                    onClick={() => setIsVisible(false)}
                    className="mt-3 w-full py-1 bg-white/10 hover:bg-white/20 rounded text-[10px] transition-colors"
                >
                    暫時關閉
                </button>
            </div>
        </div>
    );
}
