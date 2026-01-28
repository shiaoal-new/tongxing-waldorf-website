import React, { ReactNode } from 'react';
import Image from 'next/image';
import styles from './MuseumLabel.module.css';

interface FooterItem {
    label: string;
    value: string;
}

interface MuseumLabelProps {
    image?: string;
    title: string;
    metadata?: ReactNode;
    children?: ReactNode;
    footerItems?: FooterItem[];
    brandText?: string;
}

const MuseumLabel = ({
    image,
    title,
    metadata,
    children,
    footerItems = [],
    brandText = "Tong Xing"
}: MuseumLabelProps) => {
    return (
        <div className={styles['museum-label']}>
            {/* Image at top */}
            {image && (
                <div className="w-full h-auto overflow-hidden">
                    <Image
                        src={image}
                        alt={title}
                        width={600}
                        height={400}
                        className="w-full h-auto object-cover max-h-[400px]"
                    />
                </div>
            )}

            <div className={styles['label-content']}>
                <h2 className={styles['label-title']}>
                    {title}
                </h2>

                {metadata && (
                    <div className={styles['label-metadata']}>
                        {metadata}
                    </div>
                )}

                <div className={styles['label-description']}>
                    {children}
                </div>

                {/* Museum label footer style */}
                {footerItems.length > 0 && (
                    <div className={styles['label-footer']}>
                        {footerItems.map((item, index) => (
                            <div key={index} className={styles['footer-item']}>
                                <span className={styles['footer-item-label']}>{item.label}</span>
                                <span className={styles['footer-item-value']}>{item.value}</span>
                            </div>
                        ))}
                    </div>
                )}

                <div className={styles['label-brand']}>
                    <span>tongxing.edu.tw</span>
                    <span>
                        <span className="opacity-50 text-xs mr-2 font-normal">INSTITUTION</span>
                        {brandText.toUpperCase()}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default MuseumLabel;
