import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTheme } from 'next-themes';
import styles from './TimelineBlock.module.css';
import TimelineDetailModal from '../ui/TimelineDetailModal';

import { TimelineBlock as TimelineBlockType, TimelineItem } from '../../types/content';
import { motion, useScroll, useTransform, useSpring, useInView, useMotionValueEvent } from 'framer-motion';




import Image from 'next/image';

interface TimelineBlockProps {
    data: TimelineBlockType;
    anchor?: string;
}

// Helper to parse date strings (e.g., "2012", "2012.10", "2013.05.26")
const parseYearStr = (str: string) => {
    if (!str) return 0;
    const parts = str.split('.').map(p => parseInt(p, 10));
    if (parts.length === 1 && !isNaN(parts[0])) return new Date(parts[0], 0, 1).getTime();
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) return new Date(parts[0], parts[1] - 1, 1).getTime();
    if (parts.length >= 3 && !isNaN(parts[0])) return new Date(parts[0], parts[1] - 1, parts[2]).getTime();
    return 0;
};

// Helper to format timestamp back to "YYYY.MM"
const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    if (isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    return `${year}.${month < 10 ? '0' + month : month}`;
};

const TimelineContent = ({ data, anchor = 'timeline' }: TimelineBlockProps) => {
    const { theme } = useTheme();


    const [selectedDetail, setSelectedDetail] = useState<TimelineItem | null>(null);
    const [itemPositions, setItemPositions] = useState<{ time: number, position: number }[]>([]);
    const [colorMap, setColorMap] = useState<{ inputs: number[], outputs: string[] }>({
        inputs: [0, 1],
        outputs: ["var(--accent-primary)", "var(--accent-primary)"]
    });

    // Scroll progress for the timeline line
    const containerRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef<HTMLSpanElement>(null);

    // Group items by phase (headers define phase boundaries)
    const phases = useMemo(() => {
        const rawItems = data.items || [];
        const result: { phaseNumber: number; header?: TimelineItem; items: TimelineItem[] }[] = [];
        let currentPhase: { phaseNumber: number; header?: TimelineItem; items: TimelineItem[] } | null = null;
        let phaseCounter = 0;

        rawItems.forEach((item) => {
            if (item.type === 'header') {
                if (currentPhase) {
                    result.push(currentPhase);
                }
                phaseCounter++;
                currentPhase = {
                    phaseNumber: phaseCounter,
                    header: item,
                    items: []
                };
            } else if (currentPhase) {
                currentPhase.items.push(item);
            }
        });

        if (currentPhase) {
            result.push(currentPhase);
        }
        return result;
    }, [data.items]);

    // Smooth out the progress - made snappier to catch up with scroll
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start center", "end center"] // Sync line tip with viewport center
    });

    const scaleY = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const activeColor = useTransform(scaleY, colorMap.inputs, colorMap.outputs);

    // Update positions on mount and resize
    useEffect(() => {
        const updatePositions = () => {
            if (!containerRef.current) return;
            const container = containerRef.current;
            const containerRect = container.getBoundingClientRect();

            // 1. Calculate Year Text Update Positions
            const yearElements = container.querySelectorAll('[data-timeline-year]');
            const positions: { time: number, position: number }[] = [];

            yearElements.forEach((el) => {
                const yearStr = el.getAttribute('data-timeline-year');
                if (yearStr) {
                    const time = parseYearStr(yearStr);
                    if (time > 0) {
                        const rect = el.getBoundingClientRect();
                        const relativeTop = rect.top - containerRect.top;
                        const dotOffset = 20;
                        const position = (relativeTop + dotOffset) / containerRect.height;
                        positions.push({ time, position });
                    }
                }
            });
            positions.sort((a, b) => a.position - b.position);
            setItemPositions(positions);

            // 2. Calculate Color Phase Positions
            // We want to change color as soon as we enter a new phase area
            // Find inputs/outputs for color transform
            const inputs: number[] = [];
            const outputs: string[] = [];

            // Default color if no phases
            const defaultColor = "var(--accent-primary)";

            // Loop through phases to find their DOM elements
            // We added id or data attribute to phase sections?
            // The PhaseSection component renders a div with data-phase
            const phaseElements = container.querySelectorAll('[data-phase-index]');

            if (phaseElements.length > 0) {
                phaseElements.forEach((el) => {
                    const idxStr = el.getAttribute('data-phase-index');
                    if (idxStr === null) return;
                    const idx = parseInt(idxStr, 10);
                    const phase = phases[idx];
                    const color = phase.header?.color || defaultColor;

                    const rect = el.getBoundingClientRect();
                    const relativeTop = rect.top - containerRect.top;

                    const startPos = Math.max(0, relativeTop / containerRect.height);

                    // Hold previous color until shortly before this new phase starts
                    // This creates a transition zone rather than a continuous blend from previous start
                    if (inputs.length > 0) {
                        const prevStart = inputs[inputs.length - 1];
                        const prevColor = outputs[outputs.length - 1];

                        // Transition starts X pixels before the new section
                        const transitionPixels = 300;
                        const transitionRatio = transitionPixels / containerRect.height;
                        const holdPoint = startPos - transitionRatio;

                        // Only add hold point if it's after the previous start point
                        if (holdPoint > prevStart + 0.001) {
                            inputs.push(holdPoint);
                            outputs.push(prevColor);
                        }
                    }

                    // Add color stop at start of phase
                    inputs.push(startPos);
                    outputs.push(color);
                });

                // Ensure we cover 0 and 1
                if (inputs.length > 0) {
                    if (inputs[0] > 0) {
                        inputs.unshift(0);
                        outputs.unshift(outputs[0]);
                    }
                    const lastIdx = inputs.length - 1;
                    if (inputs[lastIdx] < 1) {
                        inputs.push(1);
                        outputs.push(outputs[lastIdx]);
                    }
                }

                // Remove duplicates (rare but possible with exact pixel match)
                // and ensure strictly increasing inputs for framer-motion
                const uniqueInputs: number[] = [];
                const uniqueOutputs: string[] = [];

                inputs.forEach((inp, i) => {
                    if (uniqueInputs.length === 0 || inp > uniqueInputs[uniqueInputs.length - 1] + 0.001) {
                        uniqueInputs.push(inp);
                        uniqueOutputs.push(outputs[i]);
                    }
                });

                if (uniqueInputs.length >= 2) {
                    setColorMap({ inputs: uniqueInputs, outputs: uniqueOutputs });
                }
            }
        };

        // Initial update
        const timer = setTimeout(updatePositions, 500);
        const resizeObserver = new ResizeObserver(updatePositions);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        window.addEventListener('resize', updatePositions);

        return () => {
            clearTimeout(timer);
            resizeObserver.disconnect();
            window.removeEventListener('resize', updatePositions);
        };
    }, [phases]); // Depend on phases structure

    useMotionValueEvent(scaleY, "change", (latest) => {
        if (progressRef.current && itemPositions.length > 0) {
            let text = "";

            if (latest <= itemPositions[0].position) {
                text = formatDate(itemPositions[0].time);
            } else if (latest >= itemPositions[itemPositions.length - 1].position) {
                text = formatDate(itemPositions[itemPositions.length - 1].time);
            } else {
                for (let i = 0; i < itemPositions.length - 1; i++) {
                    const curr = itemPositions[i];
                    const next = itemPositions[i + 1];
                    if (latest >= curr.position && latest <= next.position) {
                        const range = next.position - curr.position;
                        if (range < 0.001) {
                            text = formatDate(curr.time);
                        } else {
                            const timeRange = next.time - curr.time;
                            const progress = (latest - curr.position) / range;
                            const interpolatedTime = curr.time + (timeRange * progress);
                            text = formatDate(interpolatedTime);
                        }
                        break;
                    }
                }
            }

            if (text) progressRef.current.innerText = text;
        } else if (progressRef.current) {
            const firstYear = data.items.find(i => i.year)?.year;
            if (firstYear) progressRef.current.innerText = formatDate(parseYearStr(firstYear));
        }
    });

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setSelectedDetail(null);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, []);

    return (
        <div ref={containerRef} className={`w-full ${styles['timeline-container']} relative overflow-hidden`} data-theme={theme}>
            <div className="max-w-7xl mx-auto relative">
                {/* Central Line with Time Ruler Effect (Static) */}
                <div
                    className={`absolute left-4 md:left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-[5px] ${styles['timeline-axis']}`}
                    style={{
                        background: `repeating-linear-gradient(to bottom, 
                            var(--timeline-text) 0px, 
                            var(--timeline-text) 4px, 
                            transparent 4px, 
                            transparent 8px
                        )`,
                        opacity: .3
                    }}
                />

                {/* Active Gradient Line */}
                <motion.div
                    className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[60px] origin-top z-[2]"
                    style={{
                        x: "-50%",
                        scaleY,
                        // Animate background color via activeColor
                        // We use a linear gradient where the color comes from activeColor
                        backgroundImage: useTransform(activeColor, (c) => `linear-gradient(to bottom, transparent 0%, ${c} 30%, ${c} 100%)`),
                        boxShadow: useTransform(activeColor, (c) => `5px 5px 20px ${c}`), // Optional glow effect matching color
                    }}
                />

                {/* Time Arrow Tip */}
                <motion.div
                    className="absolute left-4 md:left-1/2 z-[2] pointer-events-none w-[6px]"
                    style={{
                        x: "-50%",
                        top: useTransform(scaleY, (v) => `${v * 100}%`),
                        marginTop: "-2px"
                    }}
                >
                    <div className="relative flex flex-col items-center">
                        {/* CSS Border Arrow Head */}
                        <motion.div
                            className="z-10 filter drop-shadow-sm"
                            style={{
                                width: 0,
                                height: 0,
                                borderLeft: '50px solid transparent',
                                borderRight: '50px solid transparent',
                                borderTopColor: activeColor, // Dynamic color
                                borderTopWidth: '100px',
                                borderTopStyle: 'solid',
                                transform: 'translateY(-1px)'
                            }}
                        />

                        {/* Progress Percentage */}
                        <motion.span
                            ref={progressRef}
                            className="absolute left-0 -rotate-90 -translate-x-1/2 text-[16px] font-bold whitespace-nowrap tabular-nums pointer-events-auto text-white z-10"
                            style={{
                                // color: activeColor,
                                // borderColor: activeColor, // Solid border for Hex compatibility
                                // boxShadow: useTransform(activeColor, c => `0 0 5px ${c}`) // Add glow instead of transparency
                            }}
                        >
                            {data.items.find(i => i.year)?.year || "Start"}
                        </motion.span>
                    </div>
                </motion.div>


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
            </div >



            <TimelineDetailModal
                item={selectedDetail}
                onClose={() => setSelectedDetail(null)}
            />
        </div >
    );
};

interface PhaseSectionProps {
    phase: { phaseNumber: number; header?: TimelineItem; items: TimelineItem[] };
    phaseIndex: number;
    anchor: string;
    onSelectDetail: (item: TimelineItem) => void;
}

const PhaseSection = ({ phase, phaseIndex, anchor, onSelectDetail }: PhaseSectionProps) => {
    // If header provides a color, use it as accent-primary for this section
    const sectionStyle = phase.header?.color
        ? ({ '--accent-primary': phase.header.color } as React.CSSProperties)
        : undefined;

    return (
        <div
            className={styles['phase-section']}
            data-phase={phase.phaseNumber}
            data-phase-index={phaseIndex} // For position calculation
            style={sectionStyle}
        >
            {/* Background Layer with Clipping - z-index 0 to sit behind central line (z-2) */}
            <div className="absolute inset-0 z-0" style={{ clipPath: 'inset(0)' }}>
                {/* Sticky Background Layer */}
                <div
                    className={styles['phase-background']}
                    data-phase={phase.phaseNumber}
                    style={phase.header?.background_image ? {
                        backgroundImage: `url(${phase.header.background_image})`
                    } : undefined}
                />
            </div>

            {/* Content Wrapper - z-index 10 to sit above central line (z-2) */}
            <div
                id={`${anchor}-header-${phaseIndex}`}
                className={`${styles['phase-content']} relative z-10`}
            >
                {/* Phase Header - Sticky & Glassmorphism */}
                {phase.header && (
                    <PhaseHeader phase={phase} />
                )}


                {/* Phase Intro Content - Narrative Card */}
                {phase.header?.content && (
                    <PhaseIntro content={phase.header.content} />
                )}


                {/* Phase Items */}
                <div className="relative z-10 block">
                    {phase.items.map((item, itemIndex) => {
                        const isEven = itemIndex % 2 === 0;

                        return (
                            <TimelineEntry
                                key={itemIndex}
                                item={item}
                                isEven={isEven}
                                shiftRightColumn={itemIndex === 1}
                                onSelect={() => item.detail && onSelectDetail(item)}
                            />
                        );
                    })}
                    <div className="clear-both" />
                </div>
            </div>
        </div>
    );
};

interface TimelineEntryProps {
    item: TimelineItem;
    isEven: boolean;
    shiftRightColumn?: boolean;
    onSelect: () => void;
}

const TimelineEntry = ({ item, isEven, shiftRightColumn, onSelect }: TimelineEntryProps) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    // We can also optionally apply specific event color if item has color override
    // But requirement says "event text in the phase should follow the change" which implies Phase color.
    // Which is already handled by CSS variable inheritance from PhaseSection.

    return (
        <div
            ref={ref}
            data-timeline-year={item.year}
            className={`relative w-full md:w-1/2 mb-12 md:mb-24 ${styles['timeline-entry']}
             ${isEven ? styles['is-even'] : styles['is-odd']}
             ${shiftRightColumn ? 'md:mt-32' : ''}
             ${styles['entry-anim']} ${isInView ? styles['in-view'] : ''}
        `}>


            {/* Axis Dot with "Passed" Effect */}
            <div className={`absolute top-5 z-20 flex flex-col items-center
                left-4 transform -translate-x-1/2
                ${styles['axis-dot-container']}
             `}>
                <motion.div
                    initial={{ scale: 0.8, backgroundColor: "var(--timeline-bg)", borderColor: "var(--timeline-text)", borderWidth: "2px" }}
                    whileInView={{
                        scale: 1.2,
                        backgroundColor: "var(--accent-primary)",
                        borderColor: "var(--accent-primary)",
                        boxShadow: "0 0 0 4px var(--accent-light)"
                    }}
                    viewport={{ margin: "0px 0px -50% 0px" }}
                    transition={{ duration: 0.4 }}
                    className="w-4 h-4 rounded-full border border-[var(--timeline-text)] shadow-sm relative z-10"
                >
                    {/* Ripple/Pulse Effect when Active */}
                    <motion.div
                        initial={{ opacity: 0, scale: 1 }}
                        whileInView={{
                            opacity: [0, 0.5, 0],
                            scale: [1, 2, 2.5],
                        }}
                        viewport={{ margin: "0px 0px -50% 0px" }}
                        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
                        className="absolute inset-0 rounded-full bg-[var(--accent-primary)] z-[-1]"
                    />
                </motion.div>
            </div>

            {/* Content Container */}
            <div className="w-full pl-12 pr-4 md:pl-0 md:pr-0 flex flex-col md:block">

                {/* Content Box Positioned via Margins on Desktop */}
                <div
                    className={`
                        relative group
                        w-full
                        ${item.detail ? 'cursor-pointer' : ''}
                    `}
                    onClick={onSelect}
                >
                    {/* Desktop Connection Line - Enhanced Visibility */}
                    <motion.div
                        initial={{ scaleX: 0, opacity: 0.5 }}
                        whileInView={{ scaleX: 1, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className={`hidden md:block absolute top-[1.5rem] h-[2px] bg-[var(--accent-primary)]
                             w-24
                             ${styles['connection-line']}
                         `}
                    />

                    {/* Year Label */}
                    <div className={`
                        text-4xl md:text-6xl font-black text-[var(--accent-primary)] opacity-90 mb-4 font-display ${styles['big-year']} tracking-tight drop-shadow-md
                        ${styles['year-label']}
                    `}>
                        {item.year}
                    </div>


                    <div className="p-0 bg-transparent flex flex-col md:block">
                        <h3 className="text-2xl font-bold text-[var(--timeline-text)] mb-3 group-hover:text-[var(--accent-primary)] transition-colors leading-tight">
                            {item.title}
                        </h3>
                        {item.subtitle && (
                            <h4 className="text-sm font-bold uppercase tracking-widest text-[var(--accent-primary)] mb-4 border-none p-0 border-b-2 border-transparent hover:border-[var(--accent-primary)] transition-all">
                                {item.subtitle}
                            </h4>
                        )}

                        {/* Image - Museum Frame style */}
                        {item.image && (
                            <div className={`mb-8 ${styles['museum-frame-container']}`}>
                                <div className={styles['museum-frame']}>
                                    <motion.div
                                        layoutId={`timeline-image-${item.year}-${item.title}`}
                                        layout
                                        className="relative w-full h-full"
                                    >
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            width={500}
                                            height={375}
                                            sizes="(max-width: 768px) 100vw, 400px"
                                            className="max-w-full h-auto object-cover max-h-[250px] md:max-h-[300px]"
                                        />
                                    </motion.div>
                                </div>
                            </div>
                        )}
                        <p className="text-gray-600 dark:text-gray-400 leading-loose text-base md:text-lg max-w-prose">
                            {item.content}
                        </p>

                        {item.detail && (
                            <div className={`mt-6 text-sm font-bold tracking-widest uppercase text-[var(--accent-primary)] opacity-60 transition-opacity flex items-center gap-2
                                 ${styles['view-details']}
                             `}>
                                VIEW DETAILS <span className="text-xl transform group-hover:translate-x-1 transition-transform">→</span>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}

import StaggeredReveal from '../ui/StaggeredReveal';

const PhaseHeader = ({ phase }: { phase: { phaseNumber: number; header?: TimelineItem } }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { margin: "-10% 0px -40% 0px" });

    return (
        <div ref={ref} className="sticky top-24 z-30 flex justify-center w-full my-12 pointer-events-none">
            <div className={`
                pointer-events-auto backdrop-blur-xl bg-white/90 dark:bg-black/80 px-8 py-3 rounded-full border border-gray-200/50 dark:border-gray-700/50 shadow-2xl flex items-center gap-4 group hover:scale-105 transition-transform duration-300
                ${styles['phase-header-anim']} ${isInView ? styles['in-view'] : ''}
            `}>
                <span className={`text-sm font-black tracking-widest uppercase font-display ${styles['phase-number-anim']}`}>
                    0{phase.phaseNumber}
                </span>
                <div className="h-4 w-px bg-gray-300 dark:bg-gray-700"></div>
                <h2 className="text-lg md:text-xl font-bold text-[var(--timeline-text)] m-0 leading-none">
                    {phase.header?.title}
                </h2>
            </div>
        </div>
    );
};

const PhaseIntro = ({ content }: { content: string }) => {
    return (
        <div className="relative z-20 max-w-3xl mx-auto mb-24 px-6">
            <div className="relative bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl rounded-2xl p-8 md:p-12 border border-[var(--accent-border)] text-center shadow-lg group hover:shadow-xl transition-shadow duration-500">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-1 bg-[var(--accent-primary)] rounded-full shadow-sm"></div>

                <StaggeredReveal
                    content={content}
                    align="center"
                    isNested={false} // Use primary text style for intro
                    collapsedHeight={400} // Don't collapse prematurely in timeline intro
                    className="font-serif !text-justify"
                />
            </div>
        </div>
    );
};


const TimelineBlock = (props: TimelineBlockProps) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return <TimelineContent {...props} />;
};

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


import { BlockPolicy } from './interfaces';

export const timelinePolicy: BlockPolicy = {
    shouldIgnorePadding: () => true,
    isSectionWide: () => true
};
