import { motion, animate, useMotionValue, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import Modal from '../../ui/Modal';

export default function QuestionnaireResult({ showResult, result, onClose, onReset }) {
    const scoreCount = useMotionValue(0);
    const roundedScore = useTransform(scoreCount, (latest) => Math.round(latest));

    const headerBg = useTransform(
        scoreCount,
        [0, 40, 60, 80, 100],
        [
            "linear-gradient(135deg, #ef4444, #dc2626)", // error
            "linear-gradient(135deg, #f59e0b, #d97706)", // warning
            "linear-gradient(135deg, #3b82f6, #2563eb)", // info
            "linear-gradient(135deg, #10b981, #059669)", // success
            "linear-gradient(135deg, #10b981, #059669)"
        ]
    );

    useEffect(() => {
        if (showResult && result) {
            scoreCount.set(0);
            const controls = animate(scoreCount, result.score, { duration: 1.5, ease: "easeOut" });
            return controls.stop;
        }
    }, [showResult, result, scoreCount]);

    return (
        <Modal
            isOpen={showResult && result}
            onClose={onClose}
            maxWidth="max-w-3xl"
            showCloseButton={true}
            padding="p-0"
        >
            <div className="result-card">
                <motion.div
                    className={`result-header result-${result?.color}`}
                    style={{ background: headerBg }}
                >
                    <h2>評估結果</h2>
                    <div className="score-display">
                        <span className="score-number"><motion.span>{roundedScore}</motion.span></span>
                        <span className="score-total">/ 100</span>
                    </div>
                </motion.div>

                <div className="result-content">
                    <h3 className="result-level">{result?.level}</h3>
                    <h4 className="result-title">{result?.title}</h4>
                    <p className="result-description">{result?.description}</p>

                    {result?.feedbackItems?.length > 0 && (
                        <div className="feedback-section">
                            <div className="feedback-divider"></div>
                            <h5 className="feedback-heading">針對您有所保留的部分，華德福教育的見解：</h5>
                            <div className="feedback-list">
                                {result.feedbackItems.map((item) => (
                                    <div key={item.id} className="feedback-item">
                                        <div className="feedback-question-wrap">
                                            <span className="feedback-q-icon">Q</span>
                                            <p className="feedback-question">{item.question}</p>
                                        </div>
                                        <div className="feedback-details">
                                            <div className="feedback-detail-block">
                                                <span className="detail-label">為什麼這樣做</span>
                                                <p>{item.reason}</p>
                                            </div>
                                            <div className="feedback-detail-block">
                                                <span className="detail-label">對孩子的好處</span>
                                                <p>{item.benefit}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="result-actions">
                    <button onClick={onReset} className="btn btn-secondary">
                        重新評估
                    </button>
                    <a href="/visit" className="btn btn-primary">
                        預約參觀
                    </a>
                </div>
            </div>
        </Modal>
    );
}
