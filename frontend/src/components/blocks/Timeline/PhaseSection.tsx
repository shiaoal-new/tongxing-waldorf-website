import React, { useRef } from 'react';
import { useInView } from 'framer-motion';
import { TimelineItem } from '../../../types/content';
import styles from '../TimelineBlock.module.css';
import { PhaseHeader, PhaseIntro } from './PhaseComponents';
import { TimelineEntry } from './TimelineEntry';

interface PhaseSectionProps {
    phase: { phaseNumber: number; header?: TimelineItem; items: TimelineItem[] };
    phaseIndex: number;
    anchor: string;
    selectedDetail: TimelineItem | null;
    onSelectDetail: (item: TimelineItem) => void;
}

export const PhaseSection = ({ phase, phaseIndex, anchor, selectedDetail, onSelectDetail }: PhaseSectionProps) => {
    const ref = useRef(null);
    // isInView is defined but not used in the original PhaseSection, but I'll keep it if needed or just remove if I want clean code.
    // In original: const isInView = useInView(ref, { margin: "-10% 0px -40% 0px" });
    // It seems isInView was not actually used in the return JSX of PhaseSection.
    
    // If header provides a color, use it as accent-primary for this section
    const sectionStyle = phase.header?.color
        ? ({ '--accent-primary': phase.header.color } as React.CSSProperties)
        : undefined;

    return (
        <div
            ref={ref}
            className={`${styles['phase-section']} relative z-10 w-full`}
            data-phase-index={phaseIndex}
            style={sectionStyle}
        >
            <div id={`phase-${phaseIndex + 1}`} className="absolute -top-24" />

            {/* Background Layer with Clipping - Restored with correct background_image property */}
            <div className="absolute inset-0 z-0" style={{ clipPath: 'inset(0)' }}>
                <div className={styles['phase-background']} style={{
                    backgroundImage: phase.header?.background_image ? `url(${phase.header.background_image})` : phase.header?.image ? `url(${phase.header.image})` : undefined,
                    backgroundColor: phase.header?.color,
                }} />
            </div>

            {phase.header && <PhaseHeader phase={phase} />}
            {phase.header?.content && <PhaseIntro content={phase.header.content} />}

            <div className={`${styles['phase-content']} max-w-5xl mx-auto px-6 relative z-10 block`}>
                {phase.items.map((item, index) => {
                    const isSelected = selectedDetail?.title === item.title && selectedDetail?.year === item.year;
                    return (
                        <TimelineEntry
                            key={`${item.year}-${index}`}
                            item={item}
                            index={index}
                            isSelected={isSelected}
                            onSelect={() => onSelectDetail(item)}
                        />
                    );
                })}
                <div className="clear-both" />
            </div>
        </div>
    );
};
