import React from 'react';
import { NotePosition } from './types';
import { jumpToYml } from './utils';

interface NoteIndicatorsProps {
    notePositions: NotePosition[];
    setEditingNodeSrc: (src: string | null) => void;
    setEditDraft: (text: string) => void;
    hoveredYmlElementRef: React.MutableRefObject<HTMLElement | null>;
    hoveredTsxElementRef: React.MutableRefObject<HTMLElement | null>;
}

export const NoteIndicators = ({
    notePositions,
    setEditingNodeSrc,
    setEditDraft,
    hoveredYmlElementRef,
    hoveredTsxElementRef
}: NoteIndicatorsProps) => {
    return (
        <>
            {notePositions.map((pos, i) => (
                <div
                    key={`${pos.ymlSrc}-${i}`}
                    className="yml-locator-note"
                    style={{
                        position: 'fixed',
                        top: pos.y,
                        left: pos.x,
                        transform: 'translate(-5px, -5px)',
                        backgroundColor: '#fef3c7',
                        border: '1px solid #f59e0b',
                        color: '#92400e',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        zIndex: 9998,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        maxWidth: '200px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '6px',
                        pointerEvents: 'auto',
                        transition: 'box-shadow 0.2s ease, transform 0.2s ease'
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translate(-5px, -5px) scale(1.02)';
                        hoveredYmlElementRef.current = document.querySelector(`[data-yml-src="${pos.ymlSrc}"]`) as HTMLElement;
                        hoveredTsxElementRef.current = null;
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                        e.currentTarget.style.transform = 'translate(-5px, -5px)';
                        hoveredYmlElementRef.current = null;
                        hoveredTsxElementRef.current = null;
                    }}
                >
                    <div
                        onClick={() => jumpToYml(pos.ymlSrc)}
                        style={{
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            flex: 1,
                            cursor: 'pointer',
                        }}
                        onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                        onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                        title="Click to jump to YML source"
                    >
                        {pos.text}
                    </div>
                    <button
                        onClick={() => {
                            setEditingNodeSrc(pos.ymlSrc);
                            setEditDraft(pos.text);
                        }}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0 4px',
                            color: '#b45309',
                            fontSize: '14px',
                            lineHeight: '1',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        title="Edit Note"
                    >
                        ...
                    </button>
                </div>
            ))}
        </>
    );
};
