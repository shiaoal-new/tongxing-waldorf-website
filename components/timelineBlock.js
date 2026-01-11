import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';

// 動態導入 Chrono 以避免 SSR 問題
const Chrono = dynamic(
    () => import('react-chrono').then((mod) => mod.Chrono),
    { ssr: false }
);

const TimelineBlock = ({ data }) => {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState(null);

    const rawItems = data.items || [];

    useEffect(() => {
        setMounted(true);
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // 處理 ESC 鍵關閉 modal
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') setSelectedDetail(null);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    // 為有詳情的卡片添加點擊事件
    useEffect(() => {
        if (!mounted) return;

        // 等待 Chrono 渲染完成
        const timer = setTimeout(() => {
            // 移除所有已存在的圖標（防止重複）
            document.querySelectorAll('.detail-indicator').forEach(el => el.remove());

            const cards = document.querySelectorAll('.timeline-container [class*="timeline-card-content"]');

            cards.forEach((card, index) => {
                const item = rawItems[index];
                if (!item || !item.detail) return;

                // 添加點擊提示樣式
                card.style.cursor = 'pointer';
                card.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease';

                // 添加視覺提示圖標
                const indicator = document.createElement('div');
                indicator.className = 'detail-indicator';
                indicator.innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <circle cx="5" cy="12" r="2"></circle>
                        <circle cx="12" cy="12" r="2"></circle>
                        <circle cx="19" cy="12" r="2"></circle>
                    </svg>
                `;
                indicator.title = '點擊查看詳細故事';
                card.appendChild(indicator);

                // 添加 hover 效果
                card.onmouseenter = () => {
                    card.style.transform = 'translateY(-2px)';
                    card.style.boxShadow = '0 4px 12px rgba(242, 161, 84, 0.2)';
                };

                card.onmouseleave = () => {
                    card.style.transform = 'translateY(0)';
                    card.style.boxShadow = '';
                };

                // 點擊事件 - 使用閉包確保正確的 item
                card.onclick = (e) => {
                    e.stopPropagation();
                    setSelectedDetail(item);
                };
            });
        }, 800);

        return () => clearTimeout(timer);
    }, [mounted, rawItems]);

    if (!mounted) return null;

    const items = rawItems.map(item => ({
        title: item.year || item.title,
        cardTitle: item.cardTitle || item.title,
        cardSubtitle: item.subtitle,
        cardDetailedText: item.content,
        media: item.media ? {
            type: item.media.type === 'video' ? 'VIDEO' : 'IMAGE',
            name: item.title,
            source: {
                url: item.media.image || item.media.video || item.media.url
            }
        } : undefined
    }));

    // 定義主題色彩 (與專案品牌色一致)
    const timelineTheme = {
        primary: '#f2a154', // brand-accent
        secondary: '#2d5a27', // brand-secondary
        cardBgColor: theme === 'dark' ? '#1a1a1a' : '#fff',
        cardForeColor: theme === 'dark' ? '#fdfcf8' : '#333',
        titleColor: '#f2a154',
        titleColorActive: '#f2a154',
        toolbarBgColor: 'transparent',
        toolbarBtnColor: '#f2a154',
        toolbarTextColor: '#f2a154',
    };

    return (
        <div className="w-full py-8 timeline-container max-w-7xl mx-auto px-4">
            <style jsx global>{`
                /* 完全移除 react-chrono 的內部滾動 */
                .timeline-container,
                .timeline-container * {
                    overflow: visible !important;
                    overflow-x: visible !important;
                    overflow-y: visible !important;
                }
                
                .timeline-container .chrono-container,
                .timeline-container .chrono-container > div,
                .timeline-container [class*="timeline"],
                .timeline-container [class*="wrapper"] {
                   height: auto !important;
                   max-height: none !important;
                   min-height: 0 !important;
                   font-family: var(--font-body), sans-serif !important;
                }
                
                /* 強制所有內部容器自動高度 */
                .timeline-container .rc-timeline-card-content,
                .timeline-container .rc-timeline-item-content {
                    height: auto !important;
                    max-height: none !important;
                }
                
                .timeline-container .card-content-title {
                    color: #f2a154 !important;
                    font-weight: bold !important;
                    font-size: 1.25rem !important;
                    margin-bottom: 0.5rem !important;
                }
                .timeline-container .card-subtitle {
                    font-weight: 600 !important;
                    color: #2d5a27 !important;
                    margin-bottom: 1rem !important;
                }
                .timeline-container .card-description {
                    line-height: 1.6 !important;
                    font-size: 0.95rem !important;
                }
                
                /* 隱藏多餘的 Outline */
                .timeline-container .rc-timeline-outline {
                    display: none;
                }
                
                /* 為每個時間軸卡片添加相對定位 */
                .timeline-container [class*="timeline-card-content"] {
                    position: relative;
                }
                
                /* 詳情提示圖標 */
                .detail-indicator {
                    position: absolute;
                    top: 0.75rem;
                    right: 0.75rem;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #f2a154;
                    opacity: 0.7;
                    transition: all 0.3s ease;
                    pointer-events: none;
                    background: rgba(255, 255, 255, 0.9);
                    border-radius: 50%;
                    padding: 2px;
                }
                
                .detail-indicator svg {
                    width: 100%;
                    height: 100%;
                }
                
                .timeline-container [class*="timeline-card-content"]:hover .detail-indicator {
                    opacity: 1;
                    transform: scale(1.15);
                    background: rgba(242, 161, 84, 0.1);
                }
                
                /* 修正在小螢幕下的文字溢出 */
                @media (max-width: 640px) {
                    .timeline-container .card-content-title {
                        font-size: 1.1rem !important;
                    }
                }
            `}</style>

            {/* 時間軸組件 */}
            <Chrono
                items={items}
                mode={isMobile ? "VERTICAL" : "VERTICAL_ALTERNATING"}
                theme={timelineTheme}
                cardHeight="auto"
                cardWidth={isMobile ? 300 : 450}
                disableToolbar={true}
                disableClickOnCircle={true}
                enableOutline={false}
                useReadMore={false}
                scrollable={false}
                mediaSettings={{ align: 'center', fit: 'cover' }}
                fontSizes={{
                    cardSubtitle: '0.9rem',
                    cardText: '0.95rem',
                    cardTitle: '1.25rem',
                    title: '1.1rem',
                }}
            />

            {/* Modal Dialog */}
            <AnimatePresence>
                {selectedDetail && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                        onClick={() => setSelectedDetail(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            transition={{ type: "spring", duration: 0.3 }}
                            className="bg-brand-bg dark:bg-brand-structural rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8 relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* 關閉按鈕 */}
                            <button
                                onClick={() => setSelectedDetail(null)}
                                className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-brand-accent/10 hover:bg-brand-accent/20 transition-colors"
                                aria-label="關閉"
                            >
                                <svg className="w-6 h-6 text-brand-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            {/* 內容 */}
                            <div className="pr-8">
                                <div className="text-sm font-bold tracking-wider text-brand-accent uppercase mb-2">
                                    {selectedDetail.year}
                                </div>
                                <h2 className="text-2xl font-bold text-brand-text dark:text-brand-bg mb-2">
                                    {selectedDetail.title}
                                </h2>
                                <p className="text-brand-accent font-semibold mb-4">
                                    {selectedDetail.subtitle}
                                </p>
                                <div className="prose prose-lg dark:prose-invert max-w-none">
                                    <p className="text-brand-taupe dark:text-brand-taupe leading-relaxed whitespace-pre-wrap">
                                        {selectedDetail.detail}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TimelineBlock;
