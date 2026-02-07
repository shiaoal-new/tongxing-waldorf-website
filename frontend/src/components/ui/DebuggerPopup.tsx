import React, { ReactNode } from 'react';

interface DebuggerPopupProps {
    title: string;
    icon: string;
    children: ReactNode;
    colorClass: string;
    onClose: () => void;
    positionClass?: string;
}

/**
 * Shared component for dev-mode debuggers/popups.
 */
export default function DebuggerPopup({
    title,
    icon,
    children,
    colorClass,
    onClose,
    positionClass = "bottom-4"
}: DebuggerPopupProps) {
    if (process.env.NODE_ENV === 'production') return null;

    return (
        <div
            className={`fixed ${positionClass} z-[9999] max-w-xs animate-bounce-subtle`}
            style={{ pointerEvents: 'none' }}
        >
            <div
                className={`${colorClass} text-white p-4 rounded-xl shadow-2xl border-2 border-white/20 backdrop-blur-md`}
                style={{ pointerEvents: 'auto' }}
            >
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{icon}</span>
                    <span className="font-bold text-sm">{title}</span>
                </div>
                <div className="text-xs opacity-90">
                    {children}
                </div>
                <button
                    onClick={onClose}
                    className="mt-3 w-full py-1.5 bg-white/10 hover:bg-white/20 rounded text-[10px] font-medium transition-colors"
                >
                    暫時關閉
                </button>
            </div>
        </div>
    );
}
