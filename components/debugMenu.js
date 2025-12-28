import { useState, useEffect } from 'react';

export default function DebugMenu() {
    const [isOpen, setIsOpen] = useState(false);
    const [showBackgroundGrid, setShowBackgroundGrid] = useState(false);

    // Sync with localStorage
    useEffect(() => {
        const saved = localStorage.getItem('debug_background_grid');
        if (saved) setShowBackgroundGrid(saved === 'true');
    }, []);

    useEffect(() => {
        localStorage.setItem('debug_background_grid', showBackgroundGrid.toString());
        // Dispatch custom event to notify ParallaxBackground
        window.dispatchEvent(new CustomEvent('debugGridToggle', { detail: showBackgroundGrid }));
    }, [showBackgroundGrid]);

    return (
        <>
            {/* Debug Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-4 right-4 z-50 w-12 h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all"
                title="Debug Menu"
            >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
            </button>

            {/* Debug Menu Panel */}
            {isOpen && (
                <div className="fixed bottom-20 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4 w-72 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Debug Menu</h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="space-y-3">
                        {/* Background Grid Toggle */}
                        <label className="flex items-center justify-between cursor-pointer">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Background Grid
                            </span>
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    className="sr-only"
                                    checked={showBackgroundGrid}
                                    onChange={(e) => setShowBackgroundGrid(e.target.checked)}
                                />
                                <div className={`w-11 h-6 rounded-full transition-colors ${showBackgroundGrid ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                                    <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${showBackgroundGrid ? 'translate-x-6' : 'translate-x-1'} mt-1`} />
                                </div>
                            </div>
                        </label>

                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            顯示背景圖片的 10% 間隔格線，用於除錯位置和大小
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
