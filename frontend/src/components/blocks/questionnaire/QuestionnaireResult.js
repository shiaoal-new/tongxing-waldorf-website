import { motion, animate, useMotionValue, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import Modal from '../../ui/Modal';
import styles from '../Questionnaire.module.css';

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
            <div className={styles['result-card']}>
                <motion.div
                    className={`${styles['result-header']} ${styles[`result-${result?.color}`]}`}
                    style={{ background: headerBg }}
                >
                    <h2>評估結果</h2>
                    <div className={styles['score-display']}>
                        <span className={styles['score-number']}><motion.span>{roundedScore}</motion.span></span>
                        <span className={styles['score-total']}>/ 100</span>
                    </div>
                </motion.div>



                <div className={styles['result-content']}>
                    <h3 className={styles['result-level']}>{result?.level}</h3>
                    <h4 className={styles['result-title']}>{result?.title}</h4>
                    <p className={styles['result-description']}>{result?.description}</p>

                    {/* Radar Chart */}
                    {result?.categoryScores && (
                        <div className="my-8 flex justify-center">
                            <div className="relative w-64 h-64">
                                <svg viewBox="-50 -50 300 300" className="w-full h-full">
                                    {/* Grid */}
                                    {[0.25, 0.5, 0.75, 1].map((scale, i) => (
                                        <polygon
                                            key={i}
                                            points={result.categoryScores.map((_, index, arr) => {
                                                const angle = (Math.PI * 2 * index) / arr.length - Math.PI / 2;
                                                const r = 80 * scale;
                                                return `${100 + r * Math.cos(angle)},${100 + r * Math.sin(angle)}`;
                                            }).join(' ')}
                                            fill="none"
                                            stroke="#e5e7eb"
                                            strokeWidth="1"
                                        />
                                    ))}
                                    {/* Data */}
                                    <motion.polygon
                                        initial={{ opacity: 0, scale: 0 }}
                                        animate={{ opacity: 0.8, scale: 1 }}
                                        transition={{ delay: 0.5, duration: 1 }}
                                        points={result.categoryScores.map((cat, index, arr) => {
                                            const angle = (Math.PI * 2 * index) / arr.length - Math.PI / 2;
                                            const r = 80 * (cat.percentage / 100);
                                            return `${100 + r * Math.cos(angle)},${100 + r * Math.sin(angle)}`;
                                        }).join(' ')}
                                        fill="rgba(16, 185, 129, 0.2)"
                                        stroke="#10b981"
                                        strokeWidth="2"
                                    />
                                    {/* Labels */}
                                    {result.categoryScores.map((cat, index, arr) => {
                                        const angle = (Math.PI * 2 * index) / arr.length - Math.PI / 2;
                                        const r = 105;
                                        const x = 100 + r * Math.cos(angle);
                                        const y = 100 + r * Math.sin(angle);
                                        return (
                                            <text
                                                key={cat.id}
                                                x={x}
                                                y={y}
                                                textAnchor="middle"
                                                fontSize="10"
                                                fill="#6b7280"
                                                alignmentBaseline="middle"
                                            >
                                                {cat.title}
                                            </text>
                                        );
                                    })}
                                </svg>
                            </div>
                        </div>
                    )}

                    {/* Future Prediction */}
                    {result?.future_prediction && (
                        <div className="bg-brand-bg/50 p-6 rounded-xl my-6 border border-brand-taupe/20 text-left">
                            <h5 className="font-bold text-brand-structural mb-2">🔮 專家預測：十年後的孩子</h5>
                            <p className="text-brand-text">{result.future_prediction}</p>
                        </div>
                    )}

                    {/* Expert Advice */}
                    {result?.expert_advice && (
                        <div className="my-8 text-left">
                            <h5 className="font-bold text-xl text-brand-structural mb-4 text-center">給您的教養錦囊</h5>
                            <div className="grid grid-cols-1 gap-4">
                                {result.expert_advice.map((item, idx) => (
                                    <div key={idx} className="bg-white border-l-4 border-brand-accent p-4 shadow-sm rounded-r-lg">
                                        <h6 className="font-bold text-brand-accent mb-1">{item.title}</h6>
                                        <p className="text-sm text-gray-600">{item.content}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {result?.feedbackItems?.length > 0 && (
                        <div className={styles['feedback-section']}>
                            <div className={styles['feedback-divider']}></div>
                            <h5 className={styles['feedback-heading']}>針對您有所保留的部分，華德福教育的見解：</h5>
                            <div className={styles['feedback-list']}>
                                {result.feedbackItems.map((item) => (
                                    <div key={item.id} className={styles['feedback-item']}>
                                        <div className={styles['feedback-question-wrap']}>
                                            <span className={styles['feedback-q-icon']}>Q</span>
                                            <p className={styles['feedback-question']}>{item.question}</p>
                                            <div className={styles['user-score-badge']}>
                                                <span className={styles['score-label']}>您的評分</span>
                                                <span className={styles['score-value']}>{item.score}</span>
                                            </div>
                                        </div>
                                        <div className={styles['feedback-details']}>
                                            <div className={styles['feedback-detail-block']}>
                                                <span className={styles['detail-label']}>為什麼這樣做</span>
                                                <p>{item.reason}</p>
                                            </div>
                                            <div className={styles['feedback-detail-block']}>
                                                <span className={styles['detail-label']}>對孩子的好處</span>
                                                <p>{item.benefit}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className={styles['result-actions']}>
                    <button onClick={onReset} className="btn btn-secondary">
                        重新評估
                    </button>
                    <a href="/visit" className="btn btn-primary">
                        預約參觀
                    </a>
                </div>
            </div>
        </Modal >
    );
}
