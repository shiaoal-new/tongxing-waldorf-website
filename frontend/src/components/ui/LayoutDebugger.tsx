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

        const checkOverflow = () => {
            const innerWidth = window.innerWidth;
            const scrollWidth = document.documentElement.scrollWidth;

            // 允許 1px 的誤差（處理瀏覽器渲染取整問題）
            if (scrollWidth > innerWidth + 1) {
                const elements = Array.from(document.querySelectorAll('*'));
                const offending = elements
                    .map(el => {
                        const rect = el.getBoundingClientRect();
                        return {
                            el,
                            tag: el.tagName,
                            className: el.className,
                            id: el.id,
                            right: rect.right,
                            amount: rect.right - innerWidth
                        };
                    })
                    .filter(item => item.amount > 1)
                    // 只保留最外層的錯誤元素，避免列出所有子元素
                    .filter((item, index, self) => {
                        return !self.some((other, otherIndex) =>
                            otherIndex !== index && other.el.contains(item.el)
                        );
                    })
                    .map(({ tag, className, id, amount }) => ({ tag, className, id, amount }));

                if (offending.length > 0) {
                    setOverflowElements(offending);
                    setIsVisible(true);

                    // 同時輸出到 Console 方便偵錯
                    console.warn(`[Layout Check] ⚠️ 偵測到橫向溢出 (${scrollWidth - innerWidth}px)`);
                    console.table(offending);
                } else {
                    setIsVisible(false);
                }
            } else {
                setIsVisible(false);
            }
        };

        // 在加載後、改變視窗大小後、或操作 Swiper 後進行檢測
        window.addEventListener('load', checkOverflow);
        window.addEventListener('resize', checkOverflow);

        // 延遲檢測，確保動態組件載入完成
        const timer = setTimeout(checkOverflow, 2000);

        return () => {
            window.removeEventListener('load', checkOverflow);
            window.removeEventListener('resize', checkOverflow);
            clearTimeout(timer);
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
