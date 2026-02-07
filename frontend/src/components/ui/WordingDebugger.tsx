import React, { useState } from 'react';
import { useWordingContext } from '../../context/WordingContext';
import DebuggerPopup from './DebuggerPopup';

export default function WordingDebugger() {
    const { missingKeys, clearMissingKeys } = useWordingContext();
    const [isVisible, setIsVisible] = useState(true);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    if (missingKeys.length === 0 || !isVisible) return null;

    const copyToClipboard = async (text: string, key?: string) => {
        try {
            await navigator.clipboard.writeText(text);
            if (key) {
                setCopiedKey(key);
                setTimeout(() => setCopiedKey(null), 2000);
            }
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const copyAll = () => {
        copyToClipboard(missingKeys.join('\n'), 'all');
    };

    return (
        <DebuggerPopup
            title="Wording Missing"
            icon="📝"
            colorClass="bg-orange-600"
            onClose={() => setIsVisible(false)}
            positionClass="bottom-4 left-20"
        >
            <div className="space-y-1">
                <div className="flex justify-between items-center mb-1">
                    <p>Found <strong>{missingKeys.length}</strong> missing text IDs.</p>
                    <button
                        onClick={copyAll}
                        className={`text-[10px] px-2 py-0.5 rounded transition-colors ${copiedKey === 'all' ? 'bg-green-500 text-white' : 'bg-white/20 hover:bg-white/30 text-white/90'}`}
                    >
                        {copiedKey === 'all' ? 'Copied!' : 'Copy All'}
                    </button>
                </div>

                <div className="bg-black/20 p-2 rounded-lg mt-2 max-h-32 overflow-auto custom-scrollbar">
                    {missingKeys.map((key, i) => (
                        <div key={i} className="mb-1 border-b border-white/10 pb-1 last:border-0 flex justify-between items-center gap-2 group">
                            <span className="font-mono text-[10px] text-yellow-200 break-all flex-1">
                                {key}
                            </span>
                            <button
                                onClick={() => copyToClipboard(key, key)}
                                className={`opacity-0 group-hover:opacity-100 transition-all p-1 rounded hover:bg-white/10 ${copiedKey === key ? 'text-green-400 opacity-100' : 'text-white/50'}`}
                                title="Copy ID"
                            >
                                {copiedKey === key ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                )}
                            </button>
                        </div>
                    ))}
                </div>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        clearMissingKeys();
                    }}
                    className="mt-2 w-full py-1 bg-white/10 hover:bg-white/20 rounded text-[10px] transition-colors"
                >
                    Clear All
                </button>
            </div>
        </DebuggerPopup>
    );
}
