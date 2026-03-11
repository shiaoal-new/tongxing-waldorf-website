import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTheme } from 'next-themes';
import styles from './TimelineBlock.module.css';
import TimelineDetailModal from '../ui/TimelineDetailModal';
import { TimelineBlock as TimelineBlockType, TimelineItem } from '../../types/content';
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent } from 'framer-motion';

// Sub-components and Utils
import { parseYearStr, formatDate } from './Timeline/utils';
import { PhaseSection } from './Timeline/PhaseSection';

export { getTOC, timelinePolicy } from './Timeline/utils';

interface TimelineBlockProps {
    data: TimelineBlockType;
    anchor?: string;
}

const TimelineContent = ({ data, anchor = 'timeline' }: TimelineBlockProps) => {
    const { theme } = useTheme();
    const showProgressText = data.show_progress_text !== false; // Default to true

    const [selectedDetail, setSelectedDetail] = useState<TimelineItem | null>(null);
    const [itemPositions, setItemPositions] = useState<{ time: number, position: number }[]>([]);
    const [dotInfos, setDotInfos] = useState<{ element: HTMLElement, position: number }[]>([]);
    const [containerHeight, setContainerHeight] = useState(0);
    const [colorMap, setColorMap] = useState<{ inputs: number[], outputs: string[] }>({
        inputs: [0, 1],
        outputs: ["var(--accent-primary)", "var(--accent-primary)"]
    });

    // Scroll progress for the timeline line
    const containerRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef<HTMLSpanElement>(null);

    // Group items by phase (headers define phase boundaries)
    const phases = useMemo(() => {
        const rawItems = Array.isArray(data.items) ? data.items : [];
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
    }, [data.items]); // Depend on data.items

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
            setContainerHeight(containerRect.height);

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
                        const dotOffset = 0; // Align exactly with the element top for now
                        const position = (relativeTop + dotOffset) / containerRect.height;
                        positions.push({ time, position });
                    }
                }
            });
            positions.sort((a, b) => a.position - b.position);
            setItemPositions(positions);

            // 2. Calculate Entry Positions for Visual Hint
            const entryElements = container.querySelectorAll('[data-timeline-entry]');
            const dInfos: { element: HTMLElement, position: number }[] = [];
            entryElements.forEach((el) => {
                const dot = el.querySelector('[data-timeline-dot]');
                if (dot) {
                    const rect = dot.getBoundingClientRect();
                    // Center of the dot relative to the container
                    const relativeTop = rect.top - containerRect.top + (rect.height / 2);
                    const position = relativeTop / containerRect.height;
                    dInfos.push({ element: el as HTMLElement, position });
                }
            });
            setDotInfos(dInfos);

            // 3. Calculate Color Phase Positions
            const inputs: number[] = [];
            const outputs: string[] = [];
            const defaultColor = "var(--accent-primary)";
            const phaseElements = container.querySelectorAll('[data-phase-index]');

            if (phaseElements.length > 0) {
                phaseElements.forEach((el) => {
                    const idxStr = el.getAttribute('data-phase-index');
                    if (idxStr === null) return;
                    const idx = parseInt(idxStr, 10);
                    const phase = phases[idx];
                    if (!phase) return;
                    const color = phase.header?.color || defaultColor;

                    const rect = el.getBoundingClientRect();
                    const relativeTop = rect.top - containerRect.top;
                    const startPos = Math.max(0, relativeTop / containerRect.height);

                    if (inputs.length > 0) {
                        const prevStart = inputs[inputs.length - 1];
                        const prevColor = outputs[outputs.length - 1];
                        const transitionPixels = 300;
                        const transitionRatio = transitionPixels / containerRect.height;
                        const holdPoint = startPos - transitionRatio;

                        if (holdPoint > prevStart + 0.001) {
                            inputs.push(holdPoint);
                            outputs.push(prevColor);
                        }
                    }

                    inputs.push(startPos);
                    outputs.push(color);
                });

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
    }, [phases]);

    useMotionValueEvent(scaleY, "change", (latest) => {
        if (progressRef.current && itemPositions.length > 0 && showProgressText) {
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
        } else if (progressRef.current && Array.isArray(data.items) && showProgressText) {
            const firstYear = data.items.find(item => item.year)?.year;
            if (firstYear) progressRef.current.innerText = formatDate(parseYearStr(firstYear));
        }

        const arrowHeightPx = 98; // 100px border - 2px margin
        const arrowOffset = containerHeight > 0 ? (arrowHeightPx / containerHeight) : 0;

        if (dotInfos.length > 0) {
            dotInfos.forEach(info => {
                if (latest + arrowOffset >= info.position) {
                    info.element.classList.add(styles['entry-passed']);
                } else {
                    info.element.classList.remove(styles['entry-passed']);
                }
            });
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
        <div ref={containerRef} className={`w-full ${styles['timeline-container']} relative`} data-theme={theme}>
            <div className="max-w-7xl mx-auto relative">
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

                <motion.div
                    className="absolute left-4 md:left-1/2 top-0 bottom-0 w-[40px] md:w-[60px] origin-top z-[2]"
                    style={{
                        x: "-50%",
                        scaleY,
                        backgroundImage: useTransform(activeColor, (c) => `linear-gradient(to bottom, transparent 0%, ${c} 30%, ${c} 100%)`),
                        boxShadow: useTransform(activeColor, (c) => `0px 0px 20px ${c}`),
                    }}
                />

                <motion.div
                    className="absolute left-4 md:left-1/2 z-[2] pointer-events-none w-[6px]"
                    style={{
                        x: "-50%",
                        top: useTransform(scaleY, (v) => `${v * 100}%`),
                        marginTop: "-2px"
                    }}
                >
                    <div className="relative flex flex-col items-center">
                        <motion.div
                            className="z-10 filter drop-shadow-sm"
                            style={{
                                width: 0,
                                height: 0,
                                borderLeft: '50px solid transparent',
                                borderRight: '50px solid transparent',
                                borderTopColor: activeColor, 
                                borderTopWidth: '100px',
                                borderTopStyle: 'solid',
                                transform: 'translateY(-1px)'
                            }}
                        />
                        <div className="hidden md:block absolute top-0">
                            <motion.div
                                style={{
                                    width: 0,
                                    height: 0,
                                    borderLeft: '50px solid transparent',
                                    borderRight: '50px solid transparent',
                                    borderTopColor: activeColor,
                                    borderTopWidth: '100px',
                                    borderTopStyle: 'solid',
                                    opacity: 0.3,
                                    filter: 'blur(10px)'
                                }}
                            />
                        </div>

                        {showProgressText && (
                            <motion.span
                                ref={progressRef}
                                className="absolute left-0 -rotate-90 -translate-x-1/2 text-[16px] font-bold whitespace-nowrap tabular-nums pointer-events-auto text-white z-10"
                            >
                                {(Array.isArray(data.items) && data.items.find(i => i.year)?.year) ? formatDate(parseYearStr(data.items.find(i => i.year)!.year)) : "Start"}
                            </motion.span>
                        )}
                    </div>
                </motion.div>


                <div className="relative flex flex-col">
                    {phases.map((phase, phaseIndex) => (
                        <PhaseSection
                            key={phaseIndex}
                            phase={phase}
                            phaseIndex={phaseIndex}
                            anchor={anchor}
                            selectedDetail={selectedDetail}
                            onSelectDetail={setSelectedDetail}
                        />
                    ))}
                </div>
            </div >

            {selectedDetail && (
                <TimelineDetailModal
                    item={selectedDetail}
                    onClose={() => setSelectedDetail(null)}
                />
            )}
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
