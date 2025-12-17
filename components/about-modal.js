
import { motion, AnimatePresence } from "framer-motion";

export default function AboutContent({ isOpen, onClose }) {
    const branch = process.env.NEXT_PUBLIC_GIT_BRANCH || "Unknown";
    const commitMsg = process.env.NEXT_PUBLIC_GIT_COMMIT_MSG || "Unknown";
    const commitTime = process.env.NEXT_PUBLIC_GIT_COMMIT_TIME || "Unknown";

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <div className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-sm mx-4 pointer-events-auto"
                        >
                            <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white mb-2">About this site</h3>
                            <div className="mt-2 space-y-2">
                                <p className="text-sm text-gray-500 dark:text-gray-300">
                                    Git Branch: <span className="font-mono font-bold">{branch}</span>
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-300">
                                    Last Commit: <span className="font-mono font-bold">{commitMsg}</span>
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-300">
                                    Time: <span className="font-mono font-bold">{commitTime}</span>
                                </p>
                            </div>
                            <div className="mt-6 flex justify-end">
                                <button
                                    type="button"
                                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-primary-900 bg-primary-100 border border-transparent rounded-md hover:bg-primary-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500"
                                    onClick={onClose}
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
