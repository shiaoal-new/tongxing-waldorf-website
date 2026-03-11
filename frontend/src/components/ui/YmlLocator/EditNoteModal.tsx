import React from 'react';
import { NoteData } from './types';

interface EditNoteModalProps {
    editingNodeSrc: string | null;
    editDraft: string;
    setEditDraft: (text: string) => void;
    saveNote: () => void;
    removeNote: () => void;
    setEditingNodeSrc: (src: string | null) => void;
    notes: Record<string, NoteData>;
}

export const EditNoteModal = ({
    editingNodeSrc,
    editDraft,
    setEditDraft,
    saveNote,
    removeNote,
    setEditingNodeSrc,
    notes
}: EditNoteModalProps) => {
    if (!editingNodeSrc) return null;

    return (
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
    );
};
