import React, { useRef } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { TimelineItem } from '../../../types/content';
import styles from '../TimelineBlock.module.css';

interface TimelineEntryProps {
    item: TimelineItem;
    index: number;
    isSelected: boolean;
    onSelect: () => void;
}

export const TimelineEntry = ({ item, index, isSelected, onSelect }: TimelineEntryProps) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { margin: "0px 0px -100px 0px", once: true });
    const isEven = index % 2 === 0;

    return (
        <div
            ref={ref}
            data-timeline-entry={item.year}
            className={`
                ${styles['timeline-entry']} 
                ${isEven ? styles['is-even'] : styles['is-odd']} 
                relative mb-12 block w-full md:w-1/2 p-12 md:p-8
            `}
        >
            {/* Dot on the Axis */}
            <div
                data-timeline-dot={item.year}
                className={`
                 absolute w-4 h-4 rounded-full border-4 border-white dark:border-gray-900 bg-gray-300 dark:bg-gray-600 shadow-md z-[11]
                 ${styles['axis-dot-container']}
             `} />

            {/* Connection Line - Share alignment with Dot */}
            <motion.div
                initial={{ scaleX: 0, opacity: 0.5 }}
                whileInView={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className={`absolute h-[2px] bg-[var(--accent-primary)]
                     w-2 md:w-14 z-[10]
                     ${styles['connection-line']}
                 `}
            />

            {/* Content Card with Hover Effect */}
            <div
                onClick={item.detail ? onSelect : undefined}
                className={`
                     relative group cursor-pointer
                     ${styles['entry-anim']} ${isInView ? styles['in-view'] : ''}
                 `}
            >
                {/* Year Label */}
                <div
                    data-timeline-year={item.year}
                    className={`
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
                                <div className={`relative w-full h-full ${isSelected ? 'opacity-0' : 'opacity-100'}`}>
                                    <motion.div
                                        layoutId={`timeline-image-${String(item.year)}-${item.title}`}
                                        layout
                                        className="relative w-full h-full z-10"
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
    );
};
