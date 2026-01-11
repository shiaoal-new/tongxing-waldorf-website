import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';

const TimelineBlock = ({ data }) => {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState(null);

    const rawItems = data.items || [];

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') setSelectedDetail(null);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    if (!mounted) return null;

    return (
        <div className="w-full py-8 timeline-container">
            <style jsx global>{`
                /* 時間軸容器樣式 */
                .timeline-container {
                    font-family: var(--font-body), sans-serif;
                }

                /* 時間軸線條顏色 */
                .vertical-timeline::before {
                    background: #f2a154 !important;
                }

                /* 時間軸元素樣式 */
                .vertical-timeline-element-content {
                    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.1) !important;
                    border-radius: 8px !important;
                    padding: 1.5rem !important;
                    background: ${theme === 'dark' ? '#1a1a1a' : '#fff'} !important;
                    color: ${theme === 'dark' ? '#fdfcf8' : '#333'} !important;
                }

                .vertical-timeline-element-content-arrow {
                    border-right-color: ${theme === 'dark' ? '#1a1a1a' : '#fff'} !important;
                }

                /* 時間軸圖標樣式 */
                .vertical-timeline-element-icon {
                    background: white !important;
                    border: 3px solid #f2a154 !important;
                    box-shadow: 0 2px 8px rgba(242, 161, 84, 0.3) !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    font-size: 1.5rem !important;
                }

                /* 隱藏外部日期顯示 */
                .vertical-timeline-element-date {
                    display: none !important;
                }

                /* 標題樣式 */
                .timeline-title {
                    color: #f2a154;
                    font-weight: bold;
                    font-size: 1.25rem;
                    margin-bottom: 0.5rem;
                    display: flex;
                    align-items: baseline;
                    gap: 0.5rem;
                }

                /* 年份樣式 */
                .timeline-year {
                    color: #f2a154;
                    font-weight: bold;
                    font-size: 1.1rem;
                    white-space: nowrap;
                }

                /* 副標題樣式 */
                .timeline-subtitle {
                    color: #2d5a27;
                    font-weight: 600;
                    margin-bottom: 1rem;
                    font-size: 1rem;
                }

                /* 內容樣式 */
                .timeline-content {
                    line-height: 1.6;
                    font-size: 0.95rem;
                    color: ${theme === 'dark' ? '#fdfcf8' : '#666'};
                }

                /* 可點擊卡片樣式 */
                .timeline-clickable {
                    cursor: pointer;
                }

                /* 時間軸元素 hover 效果 */
                .vertical-timeline-element-content:hover {
                    box-shadow: 0 6px 16px rgba(242, 161, 84, 0.25) !important;
                    transform: translateY(-2px);
                    transition: all 0.2s ease;
                }

                /* 詳情提示 */
                .detail-hint {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-top: 1rem;
                    color: #f2a154;
                    font-size: 0.9rem;
                    opacity: 0.8;
                }

                /* Modal 樣式 */
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 9999;
                    padding: 1rem;
                }

                .modal-content {
                    background: ${theme === 'dark' ? '#1a1a1a' : 'white'};
                    color: ${theme === 'dark' ? '#fdfcf8' : '#333'};
                    border-radius: 12px;
                    max-width: 800px;
                    width: 100%;
                    max-height: 80vh;
                    overflow-y: auto;
                    padding: 2rem;
                    position: relative;
                }

                .modal-close {
                    position: absolute;
                    top: 1rem;
                    right: 1rem;
                    background: transparent;
                    border: none;
                    font-size: 2rem;
                    cursor: pointer;
                    color: ${theme === 'dark' ? '#fdfcf8' : '#333'};
                    opacity: 0.6;
                    transition: opacity 0.2s;
                }

                .modal-close:hover {
                    opacity: 1;
                }

                .modal-title {
                    color: #f2a154;
                    font-size: 1.5rem;
                    font-weight: bold;
                    margin-bottom: 0.5rem;
                }

                .modal-subtitle {
                    color: #2d5a27;
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin-bottom: 1.5rem;
                }

                .modal-detail {
                    line-height: 1.8;
                    font-size: 1rem;
                    white-space: pre-wrap;
                }
            `}</style>

            <VerticalTimeline lineColor="#f2a154">
                {rawItems.map((item, index) => (
                    <VerticalTimelineElement
                        key={index}
                        date={item.year}
                        icon={<span>{item.icon || '⭐'}</span>}
                        iconStyle={{
                            background: 'white',
                            border: '3px solid #f2a154',
                            boxShadow: '0 2px 8px rgba(242, 161, 84, 0.3)',
                        }}
                        contentStyle={{
                            background: theme === 'dark' ? '#1a1a1a' : '#fff',
                            color: theme === 'dark' ? '#fdfcf8' : '#333',
                        }}
                        contentArrowStyle={{
                            borderRight: `7px solid ${theme === 'dark' ? '#1a1a1a' : '#fff'}`,
                        }}
                    >
                        <div
                            className={item.detail ? 'timeline-clickable' : ''}
                            onClick={() => item.detail && setSelectedDetail(item)}
                        >
                            <h3 className="timeline-title">
                                <span className="timeline-year">{item.year}</span>
                                {' '}
                                {item.title}
                            </h3>
                            {item.subtitle && (
                                <h4 className="timeline-subtitle">{item.subtitle}</h4>
                            )}
                            <p className="timeline-content">{item.content}</p>
                            {item.detail && (
                                <div className="detail-hint">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <circle cx="5" cy="12" r="2"></circle>
                                        <circle cx="12" cy="12" r="2"></circle>
                                        <circle cx="19" cy="12" r="2"></circle>
                                    </svg>
                                    <span>點擊查看詳細故事</span>
                                </div>
                            )}
                        </div>
                    </VerticalTimelineElement>
                ))}
            </VerticalTimeline>

            {/* Modal Dialog */}
            <AnimatePresence>
                {selectedDetail && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedDetail(null)}
                    >
                        <motion.div
                            className="modal-content"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                className="modal-close"
                                onClick={() => setSelectedDetail(null)}
                                aria-label="關閉"
                            >
                                ×
                            </button>
                            <div className="modal-title">
                                {selectedDetail.year} - {selectedDetail.title}
                            </div>
                            {selectedDetail.subtitle && (
                                <div className="modal-subtitle">{selectedDetail.subtitle}</div>
                            )}
                            <div className="modal-detail">{selectedDetail.detail}</div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TimelineBlock;
