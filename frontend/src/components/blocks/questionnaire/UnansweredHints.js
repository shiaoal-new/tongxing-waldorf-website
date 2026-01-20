import { motion, AnimatePresence } from 'framer-motion';

export default function UnansweredHints({ stats, showHints, onScroll }) {
    // Only render if there are hints to show
    const showAbove = showHints && stats.above > 0;
    const showBelow = showHints && stats.below > 0;

    return (
        <AnimatePresence>
            {showAbove && (
                <motion.button
                    initial={{ opacity: 0, y: -20, x: '-50%' }}
                    animate={{ opacity: 1, y: 0, x: '-50%' }}
                    exit={{ opacity: 0, y: -20, x: '-50%' }}
                    className="unanswered-hint hint-above btn btn-white"
                    onClick={() => onScroll('up')}
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
                    </svg>
                    <span>上方還有 {stats.above} 題未填寫</span>
                </motion.button>
            )}

            {showBelow && (
                <motion.button
                    initial={{ opacity: 0, y: 20, x: '-50%' }}
                    animate={{ opacity: 1, y: 0, x: '-50%' }}
                    exit={{ opacity: 0, y: 20, x: '-50%' }}
                    className="unanswered-hint hint-below btn btn-white"
                    onClick={() => onScroll('down')}
                >
                    <span>下方還有 {stats.below} 題未填寫</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                    </svg>
                </motion.button>
            )}
        </AnimatePresence>
    );
}
