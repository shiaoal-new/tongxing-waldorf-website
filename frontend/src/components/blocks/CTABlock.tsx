import React from 'react';
import ActionButtons from '../ui/ActionButtons';
import { CTABlock as CTABlockType } from '../../types/content';

interface CTABlockProps {
    block: CTABlockType;
}

export default function CTABlock({ block }: CTABlockProps) {
    return (
        <div className="w-full flex flex-col items-center">
            <ActionButtons
                buttons={block.buttons}
                align={block.align || 'center'}
                className="mt-8"
            />
            {block.subtext && (
                <p className="mt-paragraph text-sm text-brand-text/60 italic font-light tracking-brand">
                    {block.subtext}
                </p>
            )}
        </div>
    );
}
