import React from 'react';

interface OutlineHighlightersProps {
    ymlOutlineRef: React.RefObject<HTMLDivElement | null>;
    tsxOutlineRef: React.RefObject<HTMLDivElement | null>;
}

export const OutlineHighlighters = ({ ymlOutlineRef, tsxOutlineRef }: OutlineHighlightersProps) => {
    return (
        <>
            <div
                ref={ymlOutlineRef as any}
                style={{
                    position: 'fixed',
                    display: 'none',
                    pointerEvents: 'none',
                    border: '2px dashed #f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    zIndex: 9996,
                    borderRadius: '4px',
                    transition: 'none'
                }}
            />
            <div
                ref={tsxOutlineRef as any}
                style={{
                    position: 'fixed',
                    display: 'none',
                    pointerEvents: 'none',
                    border: '2px dashed #10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    zIndex: 9997,
                    borderRadius: '4px',
                    transition: 'none'
                }}
            />
        </>
    );
};
