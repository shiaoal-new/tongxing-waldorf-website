import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';

// 動態導入 Chrono 以避免 SSR 問題
const Chrono = dynamic(
    () => import('react-chrono').then((mod) => mod.Chrono),
    { ssr: false }
);

const TimelineBlock = ({ data }) => {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        setMounted(true);
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    if (!mounted) return null;

    const items = (data.items || []).map(item => ({
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
                
                /* 修正在小螢幕下的文字溢出 */
                @media (max-width: 640px) {
                    .timeline-container .card-content-title {
                        font-size: 1.1rem !important;
                    }
                }
            `}</style>
            <Chrono
                items={items}
                mode={isMobile ? "VERTICAL" : "VERTICAL_ALTERNATING"}
                theme={timelineTheme}
                cardHeight="auto"
                cardWidth={isMobile ? 300 : 450}
                disableToolbar={true} // 關閉那個讓頁面變亂的工具欄
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
        </div>
    );
};

export default TimelineBlock;
