import React from 'react';
import ActionButtons from '../ui/ActionButtons';
import { CTABlock as CTABlockType } from '../../types/content';

interface CTABlockProps {
    block: CTABlockType;
}

export default function CTABlock({ block }: CTABlockProps) {
    return (
        <div className="w-full">
            <ActionButtons
                buttons={block.buttons}
                align={block.align || 'center'}
                className="mt-8" // Default margin, can be overridden if needed by context but block usually implies some spacing
            />
        </div>
    );
}
