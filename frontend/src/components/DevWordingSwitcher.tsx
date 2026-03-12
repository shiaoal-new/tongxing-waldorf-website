import React, { useState } from 'react';
import { useWordingContext } from '../context/WordingContext';
import { isDevEnvironment } from '../lib/env';

const AVAILABLE_STYLES = ['default', 'funny', 'professional']; // 這裡可以擴展或自動偵測

export default function DevWordingSwitcher({ pageId }: { pageId: string }) {
    const { styles, setStyle, getStyle } = useWordingContext();
    const [isOpen, setIsOpen] = useState(false);

    if (!isDevEnvironment()) return null;


    const currentStyle = getStyle(pageId);

    return (
        <div className="fixed bottom-4 left-4 z-[9999] font-sans">
            {/* 浮動按鈕 */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-brand-600 text-white p-2 rounded-full shadow-lg hover:bg-brand-700 transition-colors flex items-center justify-center"
                title="Wording Style Switcher"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
            </button>

            {/* 面板 */}
            {isOpen && (
                <div className="absolute bottom-12 left-0 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl p-4 w-64 animate-in fade-in slide-in-from-bottom-2">
                    <h3 className="text-sm font-bold mb-3 border-bottom pb-2 dark:text-white flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                            <span>文案風格切換 (Dev)</span>
                            <span className="text-[10px] bg-brand-100 dark:bg-brand-900/50 text-brand-600 px-1 rounded uppercase">
                                {process.env.NEXT_PUBLIC_APP_ENV || 'prod'}
                            </span>
                        </div>
                        <span className="text-[10px] text-neutral-400 font-normal uppercase">Page: {pageId}</span>
                    </h3>

                    <div className="space-y-2">
                        {AVAILABLE_STYLES.map(style => (
                            <label
                                key={style}
                                className={`flex items-center space-x-2 p-2 rounded cursor-pointer transition-colors ${currentStyle === style
                                    ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                                    : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 dark:text-neutral-400'
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name="wording-style"
                                    checked={currentStyle === style}
                                    onChange={() => setStyle(pageId, style)}
                                    className="w-4 h-4 text-brand-600 focus:ring-brand-500"
                                />
                                <span className="capitalize text-sm">{style}</span>
                            </label>
                        ))}
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-800 text-[10px] text-neutral-400">
                        僅在 dev / dev:local 環境顯示
                    </div>
                </div>
            )}
        </div>
    );
}
