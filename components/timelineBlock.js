import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import styles from './timelineBlock.module.css';
import Modal from './modal';


const TimelineBlock = ({ data, anchor = 'timeline' }) => {
    const { theme, resolvedTheme } = useTheme();
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
        <div className={`w-full py-8 ${styles['timeline-container']}`} data-theme={theme}>
            <VerticalTimeline lineColor="#f2a154">
                {rawItems.map((item, index) => {
                    const isHeader = item.type === 'header';

                    if (isHeader) {
                        return (
                            <VerticalTimelineElement
                                key={index}
                                icon={<span className={styles['header-icon-inner']}>🚩</span>}
                                iconStyle={{
                                    background: '#f2a154',
                                    border: '3px solid white',
                                    boxShadow: '0 2px 8px rgba(242, 161, 84, 0.4)',
                                }}
                                contentStyle={{
                                    background: 'transparent',
                                    boxShadow: 'none',
                                    padding: '0',
                                    textAlign: 'center'
                                }}
                                contentArrowStyle={{ display: 'none' }}
                                className={styles['phase-header-element']}
                            >
                                <div id={`${anchor}-header-${index}`} className={styles['phase-header-content']}>
                                    <h2 className={styles['phase-header-title']}>{item.title}</h2>
                                </div>
                            </VerticalTimelineElement>
                        );
                    }

                    return (
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
                                className={item.detail ? styles['timeline-clickable'] : ''}
                                onClick={() => item.detail && setSelectedDetail(item)}
                            >
                                <h3 className={styles['timeline-title']}>
                                    <span className={styles['timeline-year']}>{item.year}</span>
                                    {' '}
                                    {item.title}
                                </h3>
                                {item.subtitle && (
                                    <h4 className={styles['timeline-subtitle']}>{item.subtitle}</h4>
                                )}
                                <p className={styles['timeline-content']}>{item.content}</p>
                                {/* {item.detail && (
                                    <div className={styles['detail-hint']}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                            <circle cx="5" cy="12" r="2"></circle>
                                            <circle cx="12" cy="12" r="2"></circle>
                                            <circle cx="19" cy="12" r="2"></circle>
                                        </svg>
                                        <span>點擊查看詳細故事</span>
                                    </div>
                                )} */}
                            </div>
                        </VerticalTimelineElement>
                    );
                })}
            </VerticalTimeline>

            <Modal
                isOpen={!!selectedDetail}
                onClose={() => setSelectedDetail(null)}
                title={selectedDetail ? `${selectedDetail.year} - ${selectedDetail.title}` : ''}
                maxWidth="max-w-3xl"
            >
                {selectedDetail && (
                    <div className="timeline-modal-body">
                        {selectedDetail.subtitle && (
                            <div className={styles['modal-subtitle']}>{selectedDetail.subtitle}</div>
                        )}
                        <div className={styles['modal-detail']}>{selectedDetail.detail}</div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default TimelineBlock;

export function getTOC(block, sectionId) {
    if (!block?.items) return [];

    return block.items
        .map((item, index) => {
            if (item.type === 'header' && item.title) {
                const id = sectionId || 'timeline';
                return {
                    id: `${id}-header-${index}`,
                    title: `${item.title}`
                };
            }
            return null;
        })
        .filter(Boolean);
}
