import React from "react";
import { ChevronUpIcon } from "@heroicons/react/solid";
import { motion, AnimatePresence } from "framer-motion";

export default function Disclosure({ title, children, isOpen, onToggle, className = "" }) {
    return (
        <div className={`mb-5 transition-all duration-200 ${className}`}>
            <button
                onClick={onToggle}
                className={`
          flex items-center justify-between w-full px-4 py-4 text-lg text-left 
          rounded-lg transition-all duration-200
          focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-opacity-50
          ${isOpen
                        ? 'bg-gradient-to-r from-brand-accent/10 to-brand-accent/5 dark:from-brand-accent/20 dark:to-brand-accent/10 text-brand-text dark:text-brand-bg shadow-md border-l-4 border-brand-accent'
                        : 'bg-brand-bg dark:bg-trueGray-800 text-brand-text dark:text-brand-bg border-l-4 border-transparent hover:border-brand-accent/30'
                    }
          hover:shadow-md hover:bg-gradient-to-r hover:from-brand-accent/5 hover:to-transparent
          dark:hover:from-brand-accent/10 dark:hover:to-transparent
        `}
            >
                <span className={`font-medium transition-colors ${isOpen ? 'text-brand-accent dark:text-brand-accent' : ''}`}>
                    {title}
                </span>
                <ChevronUpIcon
                    className={`
            w-5 h-5 transition-all duration-200
            ${isOpen
                            ? "transform rotate-180 text-brand-accent scale-110"
                            : "text-brand-taupe dark:text-brand-taupe"
                        }
          `}
                />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pt-4 pb-2 text-brand-taupe dark:text-brand-taupe prose prose-sm dark:prose-invert max-w-none bg-gradient-to-b from-brand-accent/5 to-transparent dark:from-brand-accent/10 rounded-b-lg">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
