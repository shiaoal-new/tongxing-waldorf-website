import React from 'react';
import { useYmlLocator } from './YmlLocator/useYmlLocator';
import { ContextMenu } from './YmlLocator/ContextMenu';
import { OutlineHighlighters } from './YmlLocator/OutlineHighlighters';
import { NoteIndicators } from './YmlLocator/NoteIndicators';
import { EditNoteModal } from './YmlLocator/EditNoteModal';
import { jumpToYml } from './YmlLocator/utils';

/**
 * YmlLocator - 開發環境輔助工具
 * 功能：按住 Option + 左鍵點擊頁面組件，顯示上下文選單（跳轉到源碼 / 添加備註）
 * 並將備註可視化懸浮在對應元素旁邊
 */
export default function YmlLocator() {
    const IS_DEV = process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_APP_ENV === 'preview';

    const {
        menu, setMenu,
        notes, notePositions,
        editingNodeSrc, setEditingNodeSrc,
        editDraft, setEditDraft,
        hoveredTsxElementRef, hoveredYmlElementRef,
        tsxOutlineRef, ymlOutlineRef,
        handleOpenTsx, handleOpenSource, saveNote, removeNote
    } = useYmlLocator(IS_DEV);

    if (!IS_DEV) return null;

    const onJumpToSource = () => {
        if (menu.ymlSrc) {
            jumpToYml(menu.ymlSrc);
            handleOpenSource();
        }
    };

    const onAddNote = () => {
        if (menu.ymlSrc) {
            setEditingNodeSrc(menu.ymlSrc);
            setEditDraft(notes[menu.ymlSrc]?.text || '');
            setMenu(prev => ({ ...prev, visible: false }));
        }
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

            <ContextMenu 
                menu={menu} 
                notes={notes}
                handleOpenTsx={handleOpenTsx}
                handleOpenSource={onJumpToSource}
                handleAddNoteClick={onAddNote}
                setMenu={setMenu}
            />

            <OutlineHighlighters 
                ymlOutlineRef={ymlOutlineRef}
                tsxOutlineRef={tsxOutlineRef}
            />

            <NoteIndicators 
                notePositions={notePositions}
                setEditingNodeSrc={setEditingNodeSrc}
                setEditDraft={setEditDraft}
                hoveredYmlElementRef={hoveredYmlElementRef}
                hoveredTsxElementRef={hoveredTsxElementRef}
            />

            <EditNoteModal 
                editingNodeSrc={editingNodeSrc}
                editDraft={editDraft}
                setEditDraft={setEditDraft}
                saveNote={saveNote}
                removeNote={removeNote}
                setEditingNodeSrc={setEditingNodeSrc}
                notes={notes}
            />
        </>
    );
}
