import { useEffect, useState, useRef } from 'react';

type MenuState = {
    visible: boolean;
    x: number;
    y: number;
    ymlSrc: string | null;
    tsxSrc: string | null;
    element: HTMLElement | null;
    tsxElement: HTMLElement | null;
    deltaX: number;
    deltaY: number;
};

type NoteData = {
    text: string;
    id: string;
    rx?: number; // ratio X relative to bounding rect (0-1)
    ry?: number; // ratio Y relative to bounding rect (0-1)
};

type NotePosition = {
    x: number;
    y: number;
    text: string;
    ymlSrc: string;
};

const STORAGE_KEY = 'antigravity-yml-notes';

// 取得元素真實可見邊界，即使它是 display: contents 或 wrapper
function getVisualRect(el: HTMLElement): DOMRect {
    let rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0 && el.children.length > 0) {
        // 嘗試往下找第一個有寬高的子元素，適用於 inline wrapper 或 display: contents
        for (let i = 0; i < el.children.length; i++) {
            const childRect = (el.children[i] as HTMLElement).getBoundingClientRect();
            if (childRect.width > 0 || childRect.height > 0) {
                return childRect;
            }
        }
    }
    return rect;
}

/**
 * YmlLocator - 开发环境辅助工具
 * 功能：按住 Option + 右键点击页面组件，显示上下文菜单（跳转到源码 / 添加备注）
 * 并将备注可视化悬浮在对应元素旁边
 */
export default function YmlLocator() {
    const [menu, setMenu] = useState<MenuState>({
        visible: false,
        x: 0,
        y: 0,
        deltaX: 0,
        deltaY: 0,
        ymlSrc: null,
        tsxSrc: null,
        element: null,
        tsxElement: null
    });

    const [notes, setNotes] = useState<Record<string, NoteData>>({});
    const [notePositions, setNotePositions] = useState<NotePosition[]>([]);
    const [editingNodeSrc, setEditingNodeSrc] = useState<string | null>(null);
    const [editDraft, setEditDraft] = useState('');
    const IS_DEV = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_APP_ENV === 'preview';

    const observerRef = useRef<MutationObserver | null>(null);
    const hoveredTsxElementRef = useRef<HTMLElement | null>(null);
    const hoveredYmlElementRef = useRef<HTMLElement | null>(null);
    const tsxOutlineRef = useRef<HTMLDivElement>(null);
    const ymlOutlineRef = useRef<HTMLDivElement>(null);

    // Initial load
    useEffect(() => {
        if (!IS_DEV) return;

        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                setNotes(JSON.parse(saved));
            }
        } catch (e) {
            console.error('Failed to load YML notes from localStorage', e);
        }
    }, []);

    // Sync positions (rAF loop - works for any scroll container)
    const notesRef = useRef(notes);
    notesRef.current = notes;

    useEffect(() => {
        if (!IS_DEV) return;

        let rafId: number;

        const tick = () => {
            const currentNotes = notesRef.current;
            const srcKeys = Object.keys(currentNotes);
            const positions: NotePosition[] = [];
            let ymlHighlighted = false;
            let tsxHighlighted = false;

            if (hoveredYmlElementRef.current && ymlOutlineRef.current) {
                const el = hoveredYmlElementRef.current;
                const style = window.getComputedStyle(el);
                if (style.display !== 'none' && style.visibility !== 'hidden') {
                    const rect = getVisualRect(el);
                    ymlOutlineRef.current.style.display = 'block';
                    ymlOutlineRef.current.style.top = `${rect.top}px`;
                    ymlOutlineRef.current.style.left = `${rect.left}px`;
                    ymlOutlineRef.current.style.width = `${rect.width}px`;
                    ymlOutlineRef.current.style.height = `${rect.height}px`;
                    ymlHighlighted = true;
                }
            }

            if (hoveredTsxElementRef.current && tsxOutlineRef.current) {
                const el = hoveredTsxElementRef.current;
                const style = window.getComputedStyle(el);
                if (style.display !== 'none' && style.visibility !== 'hidden') {
                    const rect = getVisualRect(el);
                    tsxOutlineRef.current.style.display = 'block';
                    tsxOutlineRef.current.style.top = `${rect.top}px`;
                    tsxOutlineRef.current.style.left = `${rect.left}px`;
                    tsxOutlineRef.current.style.width = `${rect.width}px`;
                    tsxOutlineRef.current.style.height = `${rect.height}px`;
                    tsxHighlighted = true;
                }
            }

            if (srcKeys.length > 0) {
                const elements = document.querySelectorAll('[data-yml-src]');
                elements.forEach(el => {
                    const src = el.getAttribute('data-yml-src');

                    if (src && currentNotes[src]) {
                        const rect = getVisualRect(el as HTMLElement);
                        const style = window.getComputedStyle(el);
                        if (style.display !== 'none' && style.visibility !== 'hidden') {
                            const noteData = currentNotes[src];
                            let noteX = rect.left;
                            let noteY = rect.top;

                            if (noteData.rx !== undefined && noteData.ry !== undefined && rect.width > 0 && rect.height > 0) {
                                noteX += rect.width * noteData.rx;
                                noteY += rect.height * noteData.ry;
                            } else {
                                // Default to top-left if no offset or element has no explicit dimensions yet
                                // Or maybe slightly offset
                                noteX += 10;
                                noteY += 10;
                            }

                            positions.push({
                                x: Math.round(noteX),
                                y: Math.round(noteY),
                                text: noteData.text,
                                ymlSrc: src
                            });
                        }
                    }
                });
            }

            if (!ymlHighlighted && ymlOutlineRef.current) {
                ymlOutlineRef.current.style.display = 'none';
            }
            if (!tsxHighlighted && tsxOutlineRef.current) {
                tsxOutlineRef.current.style.display = 'none';
            }

            setNotePositions(prev => {
                if (JSON.stringify(prev) === JSON.stringify(positions)) return prev;
                return positions;
            });

            rafId = requestAnimationFrame(tick);
        };

        rafId = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(rafId);
        };
    }, []); // 只需掛載/卸載一次，使用 notesRef 避免 stale closure

    useEffect(() => {
        if (!IS_DEV) return;

        const handleMouseMove = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (target.closest('.yml-locator-note')) return;

            if (e.altKey) {
                const tsxContainer = target.closest('[data-source-loc]') as HTMLElement;
                const ymlContainer = target.closest('[data-yml-src]') as HTMLElement;
                hoveredTsxElementRef.current = tsxContainer || null;
                hoveredYmlElementRef.current = ymlContainer || null;
            } else {
                hoveredTsxElementRef.current = null;
                hoveredYmlElementRef.current = null;
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === 'Alt' || e.key === 'Option') {
                hoveredTsxElementRef.current = null;
                hoveredYmlElementRef.current = null;
            }
        };

        const handleClick = (e: MouseEvent) => {
            if (e.altKey && e.button === 0) {
                // JSX & YML Locator: Option + Left Click
                const target = e.target as HTMLElement;
                const tsxContainer = target.closest('[data-source-loc]') as HTMLElement;
                const ymlContainer = target.closest('[data-yml-src]') as HTMLElement;

                let tsxSrcValue = null;
                let ymlSrcValue = null;

                if (tsxContainer) tsxSrcValue = tsxContainer.getAttribute('data-source-loc');
                if (ymlContainer) ymlSrcValue = ymlContainer.getAttribute('data-yml-src');

                if (tsxSrcValue || ymlSrcValue) {
                    e.preventDefault();
                    e.stopPropagation();

                    const clickX = e.clientX;
                    const clickY = e.clientY;
                    let deltaX = 0;
                    let deltaY = 0;

                    if (ymlContainer) {
                        const rect = getVisualRect(ymlContainer);
                        deltaX = clickX - rect.left;
                        deltaY = clickY - rect.top;
                    }

                    setMenu({
                        visible: true,
                        x: clickX,
                        y: clickY,
                        deltaX,
                        deltaY,
                        ymlSrc: ymlSrcValue,
                        tsxSrc: tsxSrcValue,
                        element: ymlContainer,
                        tsxElement: tsxContainer
                    });
                } else {
                    console.warn('[YML Locator] Could not find locator data or yml src data.');
                }
            } else {
                const target = e.target as HTMLElement;
                if (!target.closest('#yml-locator-menu')) {
                    setMenu(prev => prev.visible ? { ...prev, visible: false } : prev);
                }
            }
        };

        window.addEventListener('click', handleClick, true);
        window.addEventListener('mousemove', handleMouseMove, true);
        window.addEventListener('keyup', handleKeyUp, true);

        return () => {
            window.removeEventListener('click', handleClick, true);
            window.removeEventListener('mousemove', handleMouseMove, true);
            window.removeEventListener('keyup', handleKeyUp, true);
        };
    }, []);

    if (!IS_DEV) return null;

    const handleOpenTsx = () => {
        if (!menu.tsxSrc) return;

        const [filePath, line, column] = menu.tsxSrc.split('::');
        const url = `antigravity://file${filePath}:${line}:${column || 1}`;
        console.log(`[JSX Locator] %cOpening JSX: ${url}`, 'color: #10b981; font-weight: bold;');
        window.location.href = url;

        // Visual feedback
        if (menu.tsxElement) {
            const el = menu.tsxElement;
            const originalTransition = el.style.transition;
            const originalShadow = el.style.boxShadow;
            const originalZIndex = el.style.zIndex;

            el.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
            el.style.boxShadow = '0 0 0 4px rgba(16, 185, 129, 0.5), 0 0 20px rgba(16, 185, 129, 0.3)';
            el.style.transform = 'scale(0.995)';
            el.style.zIndex = '9999';

            setTimeout(() => {
                el.style.transform = '';
                el.style.boxShadow = originalShadow;
                el.style.zIndex = originalZIndex;
                setTimeout(() => {
                    el.style.transition = originalTransition;
                }, 300);
            }, 500);
        }

        setMenu(prev => ({ ...prev, visible: false }));
    };

    const jumpToYml = (ymlSrc: string) => {
        const rawValue = ymlSrc;
        // 解析 path:line 格式
        const lastColon = rawValue.lastIndexOf(':');
        let filePath = rawValue;
        let lineNum = '';
        if (lastColon > 0 && /^\d+$/.test(rawValue.slice(lastColon + 1))) {
            filePath = rawValue.slice(0, lastColon);
            lineNum = rawValue.slice(lastColon + 1);
        }

        const url = lineNum
            ? `antigravity://file${filePath}:${lineNum}:1`
            : `antigravity://file${filePath}`;
        window.location.href = url;

        console.log(`[YML Locator] %cOpening: ${url}`, 'color: #10b981; font-weight: bold;');
    };

    const handleOpenSource = () => {
        if (!menu.ymlSrc) return;

        jumpToYml(menu.ymlSrc);

        // 增加视觉反馈
        if (menu.element) {
            const el = menu.element;
            const originalTransition = el.style.transition;
            const originalShadow = el.style.boxShadow;
            const originalZIndex = el.style.zIndex;

            el.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
            el.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3)';
            el.style.transform = 'scale(0.995)';
            el.style.zIndex = '9999';

            setTimeout(() => {
                el.style.transform = '';
                el.style.boxShadow = originalShadow;
                el.style.zIndex = originalZIndex;
                setTimeout(() => {
                    el.style.transition = originalTransition;
                }, 300);
            }, 500);
        }

        setMenu(prev => ({ ...prev, visible: false }));
    };

    const handleAddNoteClick = () => {
        if (!menu.ymlSrc) return;
        setEditingNodeSrc(menu.ymlSrc);
        setEditDraft(notes[menu.ymlSrc]?.text || '');
        setMenu(prev => ({ ...prev, visible: false }));
    };

    const saveNote = () => {
        if (!editingNodeSrc) return;

        const newNotes = { ...notes };
        if (editDraft.trim() === '') {
            delete newNotes[editingNodeSrc];
        } else {
            const existing = newNotes[editingNodeSrc];

            let rx = existing?.rx;
            let ry = existing?.ry;

            if (rx === undefined && menu.element) {
                const rect = getVisualRect(menu.element);
                if (rect.width > 0 && rect.height > 0) {
                    rx = Math.max(0, Math.min(1, menu.deltaX / rect.width));
                    ry = Math.max(0, Math.min(1, menu.deltaY / rect.height));
                } else {
                    rx = 0;
                    ry = 0;
                }
            }

            newNotes[editingNodeSrc] = {
                text: editDraft,
                id: existing ? existing.id : Date.now().toString(),
                rx,
                ry
            };
        }

        setNotes(newNotes);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newNotes));
        setEditingNodeSrc(null);
    };

    const removeNote = () => {
        if (!editingNodeSrc) return;

        const newNotes = { ...notes };
        delete newNotes[editingNodeSrc];

        setNotes(newNotes);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newNotes));
        setEditingNodeSrc(null);
    };

    return (
        <>
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes yml-fade-up {
                    0% { opacity: 0; transform: translate(-50%, -80%); }
                    20% { opacity: 1; transform: translate(-50%, -120%); }
                    80% { opacity: 1; transform: translate(-50%, -120%); }
                    100% { opacity: 0; transform: translate(-50%, -150%); }
                }
            `}} />

            {/* Context Menu */}
            {menu.visible && (
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
            )}

            {/* Element Outline Highlighters */}
            {/* YML Boundary (Amber) */}
            <div
                ref={ymlOutlineRef}
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
            {/* TSX Boundary (Emerald) */}
            <div
                ref={tsxOutlineRef}
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

            {/* Note Indicators */}
            {notePositions.map((pos, i) => (
                <div
                    key={`${pos.ymlSrc}-${i}`}
                    className="yml-locator-note"
                    style={{
                        position: 'fixed',
                        top: pos.y,
                        left: pos.x,
                        transform: 'translate(-5px, -5px)', // 稍微偏移一點，以免完全遮擋左上角
                        backgroundColor: '#fef3c7', // 黃色便利貼風格
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

            {/* Edit Modal */}
            {editingNodeSrc && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 20000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '12px',
                        width: '90%',
                        maxWidth: '400px',
                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                    }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#111827' }}>Note for Element</h3>
                        <div style={{ marginBottom: '16px', fontSize: '12px', color: '#6b7280', wordBreak: 'break-all' }}>
                            {editingNodeSrc}
                        </div>
                        <textarea
                            value={editDraft}
                            onChange={(e) => setEditDraft(e.target.value)}
                            placeholder="Type your note here..."
                            style={{
                                width: '100%',
                                minHeight: '100px',
                                padding: '10px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                marginBottom: '16px',
                                resize: 'vertical',
                                boxSizing: 'border-box',
                                fontFamily: 'inherit'
                            }}
                            autoFocus
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                            {notes[editingNodeSrc] && (
                                <button
                                    onClick={removeNote}
                                    style={{
                                        padding: '8px 16px',
                                        backgroundColor: '#ef4444',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        marginRight: 'auto'
                                    }}
                                >
                                    Remove
                                </button>
                            )}
                            <button
                                onClick={() => setEditingNodeSrc(null)}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#f3f4f6',
                                    color: '#4b5563',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveNote}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer'
                                }}
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
