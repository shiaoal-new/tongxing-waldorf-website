import React from 'react';
import { MenuState, NoteData } from './types';
import { jumpToYml } from './utils';

interface ContextMenuProps {
    menu: MenuState;
    notes: Record<string, NoteData>;
    handleOpenTsx: () => void;
    handleOpenSource: () => void;
    handleOpenWording: () => void;
    handleAddNoteClick: () => void;
    setMenu: React.Dispatch<React.SetStateAction<MenuState>>;
}

export const ContextMenu = ({
    menu,
    notes,
    handleOpenTsx,
    handleOpenSource,
    handleOpenWording,
    handleAddNoteClick,
    setMenu
}: ContextMenuProps) => {
    if (!menu.visible) return null;

    return (
        <div
            id="yml-locator-menu"
            style={{
                position: 'fixed',
                top: menu.y,
                left: menu.x,
                backgroundColor: 'white',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '6px',
                zIndex: 10000,
                display: 'flex',
                flexDirection: 'column',
                minWidth: '200px',
                gap: '2px'
            }}
            onClick={e => e.stopPropagation()}
            onContextMenu={e => { e.preventDefault(); e.stopPropagation(); }}
        >
            <div style={{ padding: '6px 12px', fontSize: '12px', color: '#6b7280', borderBottom: '1px solid #f3f4f6', marginBottom: '4px', wordBreak: 'break-all' }}>
                {menu.ymlSrc?.split('/').pop() || menu.tsxSrc?.split('/').pop()?.split('::')[0]}
            </div>

            {menu.tsxSrc && (
                <button
                    onClick={handleOpenTsx}
                    style={{
                        padding: '8px 12px',
                        textAlign: 'left',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        borderRadius: '4px',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#111827'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <span style={{ fontSize: '16px' }}>⚛️</span> Go to TSX source
                </button>
            )}

            {menu.ymlSrc && (
                <button
                    onClick={handleOpenSource}
                    style={{
                        padding: '8px 12px',
                        textAlign: 'left',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        borderRadius: '4px',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#111827'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <span style={{ fontSize: '16px' }}>↗️</span> Go to YML source
                </button>
            )}
            
            {menu.wordingSrc && (
                <button
                    onClick={handleOpenWording}
                    style={{
                        padding: '8px 12px',
                        textAlign: 'left',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        borderRadius: '4px',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#111827'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <span style={{ fontSize: '16px' }}>🔤</span> Go to Wording YML
                </button>
            )}

            {menu.ymlSrc && (
                <button
                    onClick={handleAddNoteClick}
                    style={{
                        padding: '8px 12px',
                        textAlign: 'left',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '14px',
                        borderRadius: '4px',
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#111827'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    <span style={{ fontSize: '16px' }}>📝</span> {notes[menu.ymlSrc] ? 'Edit note' : 'Add note on this element'}
                </button>
            )}
        </div>
    );
};
