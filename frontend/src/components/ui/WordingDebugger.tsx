import React, { useState } from 'react';
import { useWordingContext } from '../../context/WordingContext';
import DebuggerPopup from './DebuggerPopup';

export default function WordingDebugger() {
    const { missingKeys, clearMissingKeys } = useWordingContext();
    const [isVisible, setIsVisible] = useState(true);

    if (missingKeys.length === 0 || !isVisible) return null;

    return (
        <DebuggerPopup
            title="Wording Missing"
            icon="📝"
            colorClass="bg-orange-600"
            onClose={() => setIsVisible(false)}
            positionClass="bottom-4 left-20"
        >
            <div className="space-y-1">
                <p>Found <strong>{missingKeys.length}</strong> missing text IDs.</p>
                <div className="bg-black/20 p-2 rounded-lg mt-2 max-h-32 overflow-auto custom-scrollbar">
                    {missingKeys.map((key, i) => (
                        <div key={i} className="mb-1 border-b border-white/10 pb-1 last:border-0 font-mono text-[10px] text-yellow-200 break-all">
                            {key}
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
