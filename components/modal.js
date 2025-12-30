import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

const Modal = ({
    isOpen,
    onClose,
    title,
    children,
    maxWidth = "max-w-2xl",
    showCloseButton = true,
    padding = "p-6 md:p-10"
}) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [isOpen]);

    if (!mounted) return null;

    const modalLayout = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 touch-none">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className={`bg-brand-bg dark:bg-neutral-800 w-full ${maxWidth} rounded-3xl shadow-2xl overflow-hidden relative z-10`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={`relative ${padding}`}>
                            {showCloseButton && (
                                <button
                                    onClick={onClose}
                                    className="btn btn-ghost btn-circle btn-sm absolute top-5 right-5 text-2xl z-20"
                                >
                                    &times;
                                </button>
                            )}

                            {title && (
                                <div className="border-l-8 border-warning-500 pl-6 mb-8">
                                    <h3 className="text-2xl md:text-3xl font-bold text-neutral-800 dark:text-brand-bg leading-tight">
                                        {title}
                                    </h3>
                                </div>
                            )}

                            <div className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                                {children}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return createPortal(modalLayout, document.body);
};

export default Modal;
