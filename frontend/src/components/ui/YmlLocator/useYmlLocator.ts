import { useState, useEffect, useRef } from 'react';
import { MenuState, NoteData, NotePosition } from './types';
import { getVisualRect, STORAGE_KEY } from './utils';

export function useYmlLocator(IS_DEV: boolean) {
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
    }, [IS_DEV]);

    // Sync positions (rAF loop)
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
        return () => cancelAnimationFrame(rafId);
    }, [IS_DEV]);

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
    }, [IS_DEV]);

    const handleOpenTsx = () => {
        if (!menu.tsxSrc) return;
        const [filePath, line, column] = menu.tsxSrc.split('::');
        const url = `antigravity://file${filePath}:${line}:${column || 1}`;
        window.location.href = url;

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
                setTimeout(() => { el.style.transition = originalTransition; }, 300);
            }, 500);
        }
        setMenu(prev => ({ ...prev, visible: false }));
    };

    const handleOpenSource = () => {
        if (!menu.element || !menu.ymlSrc) return;
        
        // Use the native jumpToYml or imported one? I'll import it in the component.
        // Actually, I can just return the data and let the component handle it.
        // But for now, I'll keep the visual feedback here.
        
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
            setTimeout(() => { el.style.transition = originalTransition; }, 300);
        }, 500);
        
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
                    rx = 0; ry = 0;
                }
            }

            newNotes[editingNodeSrc] = {
                text: editDraft,
                id: existing ? existing.id : Date.now().toString(),
                rx, ry
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

    return {
        menu, setMenu,
        notes, notePositions,
        editingNodeSrc, setEditingNodeSrc,
        editDraft, setEditDraft,
        hoveredTsxElementRef, hoveredYmlElementRef,
        tsxOutlineRef, ymlOutlineRef,
        handleOpenTsx, handleOpenSource, saveNote, removeNote
    };
}
