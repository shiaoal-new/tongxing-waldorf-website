import React, { useRef } from 'react';
import { useInView } from 'framer-motion';
import { TimelineItem } from '../../../types/content';
import StaggeredReveal from '../../ui/StaggeredReveal';
import styles from '../TimelineBlock.module.css';

export const PhaseHeader = ({ phase }: { phase: { phaseNumber: number; header?: TimelineItem } }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { margin: "-10% 0px -40% 0px" });

    return (
        <div ref={ref} className={styles['phase-header-sticky']}>
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

export const PhaseIntro = ({ content }: { content: string }) => {
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
