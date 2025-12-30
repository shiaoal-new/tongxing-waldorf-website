
import { motion, AnimatePresence } from "framer-motion";

const formatTime = (timeStr) => {
    if (!timeStr || timeStr === 'Unknown') return null;
    try {
        const date = new Date(timeStr);
        // Check if date is valid
        if (isNaN(date.getTime())) return timeStr;
        return date.toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });
    } catch (e) {
        return timeStr;
    }
};

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
                            className="bg-brand-bg dark:bg-brand-structural p-6 rounded-lg shadow-xl w-full max-w-sm mx-4 pointer-events-auto"
                        >
                            <h3 className="text-lg font-medium leading-6 text-brand-text dark:text-brand-bg mb-2">About this site</h3>
                            <div className="mt-2 space-y-2">
                                <p className="text-sm text-brand-taupe dark:text-brand-taupe">
                                    Git Branch: <span className="font-mono font-bold">{branch}</span>
                                </p>
                                <p className="text-sm text-brand-taupe dark:text-brand-taupe">
                                    Last Commit: <span className="font-mono font-bold">{commitMsg}</span>
                                </p>
                                <p className="text-sm text-brand-taupe dark:text-brand-taupe">
                                    Time: <span className="font-mono font-bold">{formatTime(commitTime)}</span>
                                </p>
                                <p className="text-sm text-brand-taupe dark:text-brand-taupe">
                                    Build Time: <span className="font-mono font-bold">
                                        {formatTime(process.env.NEXT_PUBLIC_BUILD_TIME)}
                                    </span>
                                </p>
                                <p className="text-sm text-brand-taupe dark:text-brand-taupe">
                                    Action Time: <span className="font-mono font-bold">
                                        {formatTime(process.env.NEXT_PUBLIC_ACTION_RUN_TIME) || "Local Dev"}
                                    </span>
                                </p>
                            </div>
                            <div className="mt-6 flex justify-end">
                                <button
                                    type="button"
                                    className="btn btn-primary btn-sm px-6"
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
