import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import styles from './TimelineBlock.module.css';
import Modal from '../ui/Modal';
import { TimelineBlock as TimelineBlockType, TimelineItem } from '../../types/content';
import { motion, useInView } from 'framer-motion';

interface TimelineBlockProps {
    data: TimelineBlockType;
    anchor?: string;
}

const TimelineBlock = ({ data, anchor = 'timeline' }: TimelineBlockProps) => {
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [selectedDetail, setSelectedDetail] = useState<TimelineItem | null>(null);

    const rawItems = data.items || [];

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setSelectedDetail(null);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    if (!mounted) return null;

    // Group items by phase (headers define phase boundaries)
    const phases: { phaseNumber: number; header?: TimelineItem; items: TimelineItem[] }[] = [];
    let currentPhase: { phaseNumber: number; header?: TimelineItem; items: TimelineItem[] } | null = null;
    let phaseCounter = 0;

    rawItems.forEach((item) => {
        if (item.type === 'header') {
            // Start a new phase
            if (currentPhase) {
                phases.push(currentPhase);
            }
            phaseCounter++;
            currentPhase = {
                phaseNumber: phaseCounter,
                header: item,
                items: []
            };
        } else if (currentPhase) {
            // Add item to current phase
            currentPhase.items.push(item);
        }
    });

    // Push the last phase
    if (currentPhase) {
        phases.push(currentPhase);
    }

    return (
        <div className={`w-full py-20 ${styles['timeline-container']}`} data-theme={theme}>
            <div className="max-w-7xl mx-auto relative px-4 sm:px-6 lg:px-8">
                {/* Central Line */}
                <div className={`absolute left-4 md:left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-800 ${styles['timeline-axis']}`} />


                <div className="relative flex flex-col">
                    {phases.map((phase, phaseIndex) => (
                        <PhaseSection
                            key={phaseIndex}
                            phase={phase}
                            phaseIndex={phaseIndex}
                            anchor={anchor}
                            onSelectDetail={setSelectedDetail}
                        />
                    ))}
                </div>
            </div>

            <Modal
                isOpen={!!selectedDetail}
                onClose={() => setSelectedDetail(null)}
                title=""
                padding="p-0"
                maxWidth="max-w-md"
            >
                {selectedDetail && (
                    <div className={styles['museum-label']}>
                        {/* Image at top */}
                        {selectedDetail.image && (
                            <div className="w-full h-auto overflow-hidden">
                                <img
                                    src={selectedDetail.image}
                                    alt={selectedDetail.title}
                                    className="w-full h-auto object-cover max-h-[400px]"
                                />
                            </div>
                        )}

                        <div className={styles['label-content']}>
                            <h2 className={styles['label-title']}>
                                {selectedDetail.title}
                            </h2>

                            <div className={styles['label-metadata']}>
                                <span>{selectedDetail.year}</span>
                                <span>Timeline Collection</span>
                            </div>

                            <div className={styles['label-description']}>
                                {selectedDetail.detail}
                            </div>

                            {/* Museum label footer style */}
                            <div className={styles['label-footer']}>
                                <div className={styles['footer-item']}>
                                    <span className={styles['footer-item-label']}>Exhibition</span>
                                    <span className={styles['footer-item-value']}>The Heart of Waldorf</span>
                                </div>
                                <div className={styles['footer-item']}>
                                    <span className={styles['footer-item-label']}>Accession</span>
                                    <span className={styles['footer-item-value']}>Tongxing Official Archives</span>
                                </div>
                            </div>

                            <div className={styles['label-brand']}>
                                <span>tongxing.edu.tw</span>
                                <span>
                                    <span className="opacity-50 text-xs mr-2 font-normal">INSTITUTION</span>
                                    TONG XING
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

interface PhaseSectionProps {
    phase: { phaseNumber: number; header?: TimelineItem; items: TimelineItem[] };
    phaseIndex: number;
    anchor: string;
    onSelectDetail: (item: TimelineItem) => void;
}

const PhaseSection = ({ phase, phaseIndex, anchor, onSelectDetail }: PhaseSectionProps) => {
    return (
        <div
            className={styles['phase-section']}
            data-phase={phase.phaseNumber}
        >
            {/* Sticky Background Layer - automatically sticky via CSS */}
            <div
                className={styles['phase-background']}
                data-phase={phase.phaseNumber}
            />

            {/* Content Wrapper for Grid Overlay - ID moved here for TOC scroll tracking */}
            <div
                id={`${anchor}-header-${phaseIndex}`}
                className={styles['phase-content']}
            >
                {/* Phase Header */}
                {phase.header && (
                    <div className="relative z-10 flex justify-center w-full my-8">
                        <div className={`${styles['phase-header']} bg-white dark:bg-gray-900 px-8 py-3 `}>
                            <h2 className="text-xl md:text-2xl font-bold text-[var(--timeline-text)] m-0">{phase.header.title}</h2>
                        </div>
                    </div>
                )}

                {/* Phase Items */}
                <div className="relative z-10 flex flex-col gap-24">
                    {phase.items.map((item, itemIndex) => {
                        const isEven = itemIndex % 2 === 0;

                        return (
                            <TimelineEntry
                                key={itemIndex}
                                item={item}
                                isEven={isEven}
                                onSelect={() => item.detail && onSelectDetail(item)}
                            />
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

interface TimelineEntryProps {
    item: TimelineItem;
    isEven: boolean;
    onSelect: () => void;
}

const TimelineEntry = ({ item, isEven, onSelect }: TimelineEntryProps) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    return (
        <div ref={ref} className={`relative w-full ${styles['timeline-entry']}`}>
            {/* Axis Dot */}
            <div className="absolute top-0 z-20 flex flex-col items-center
                left-4 transform -translate-x-1/2
                md:left-1/2
             ">
                <div className="w-3 h-3 rounded-full bg-[var(--accent-primary)] border-4 border-white dark:border-gray-900 shadow-sm" />
            </div>

            {/* Content Container */}
            <div className="w-full pl-12 pr-4 md:pl-0 md:pr-0 flex flex-col md:block">

                {/* Content Box Positioned via Margins on Desktop */}
                <div
                    className={`
                        relative group
                        w-full md:w-[45%] lg:w-[42%]
                        ${isEven ? 'md:mr-auto md:text-right' : 'md:ml-auto md:text-left'}
                        ${item.detail ? 'cursor-pointer' : ''}
                    `}
                    onClick={onSelect}
                >
                    {/* Desktop Connection Line */}
                    <div
                        className={`hidden md:block absolute top-[1.2rem] w-full max-w-[4rem] h-px bg-gray-300 dark:bg-gray-700
                            ${isEven ? '-right-[4rem]' : '-left-[4rem]'}
                        `}
                    />

                    {/* Year Label */}
                    <div className={`
                        text-3xl md:text-5xl font-light text-[var(--accent-primary)] opacity-90 mb-2 font-display ${styles['big-year']}
                        ${isEven ? 'md:origin-right' : 'md:origin-left'}
                    `}>
                        {item.year}
                    </div>

                    <div className="p-0 bg-transparent flex flex-col md:block">
                        {/* Image - Museum Frame style */}
                        {item.image && (
                            <div className={`mb-6 ${styles['museum-frame-container']} ${isEven ? 'md:ml-auto' : 'md:mr-auto'}`}>
                                <div className={styles['museum-frame']}>
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="max-w-full h-auto object-cover max-h-[200px] md:max-h-[240px]"
                                    />
                                </div>
                            </div>
                        )}

                        <h3 className="text-xl font-bold text-[var(--timeline-text)] mb-2 group-hover:text-[var(--accent-primary)] transition-colors">
                            {item.title}
                        </h3>
                        {item.subtitle && (
                            <h4 className="text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 border-none p-0">
                                {item.subtitle}
                            </h4>
                        )}
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm md:text-base">
                            {item.content}
                        </p>

                        {item.detail && (
                            <div className={`mt-4 text-sm font-medium text-[var(--accent-primary)] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1
                                ${isEven ? 'md:justify-end' : 'md:justify-start'}
                            `}>
                                閱讀更多 <span className="text-lg">→</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}


export default TimelineBlock;

export function getTOC(block: TimelineBlockType, sectionId?: string) {
    if (!block?.items) {
        return [];
    }

    let headerCount = 0;
    const result: { id: string; title: string }[] = [];

    block.items.forEach((item) => {
        if (item.type === 'header' && item.title) {
            const id = sectionId || 'timeline';
            // Match the ID generation logic in the render function (phaseIndex)
            const tocItem = {
                id: `${id}-header-${headerCount}`,
                title: `${item.title}`
            };
            result.push(tocItem);
            headerCount++;
        }
    });

    return result;
}

