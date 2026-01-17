import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import Modal from './Modal';


export default function QuestionnaireComponent({ data }) {
    const [answers, setAnswers] = useState({});
    const [showResult, setShowResult] = useState(false);
    const [result, setResult] = useState(null);
    const [activeTooltip, setActiveTooltip] = useState(null); // 用於移動端 tooltip 顯示
    const [unansweredStats, setUnansweredStats] = useState({ above: 0, below: 0 });
    const [showHints, setShowHints] = useState(false);
    const [isShaking, setIsShaking] = useState(false);
    const scoreCount = useMotionValue(0);
    const roundedScore = useTransform(scoreCount, (latest) => Math.round(latest));

    // 背景顏色漸變 - 根據分數動態從 錯誤(紅) -> 警告(黃) -> 資訊(藍) -> 成功(綠)
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

    // 當結果顯示時，觸發動畫
    useEffect(() => {
        if (showResult && result) {
            scoreCount.set(0);
            const controls = animate(scoreCount, result.score, { duration: 1.5, ease: "easeOut" });
            return controls.stop;
        }
    }, [showResult, result, scoreCount]);

    const storageKey = `questionnaire_progress_${data.slug || 'default'}`;

    // 從 localStorage 讀取進度
    useEffect(() => {
        const savedProgress = localStorage.getItem(storageKey);
        if (savedProgress) {
            try {
                const parsedProgress = JSON.parse(savedProgress);
                if (parsedProgress && typeof parsedProgress === 'object') {
                    setAnswers(parsedProgress);
                }
            } catch (e) {
                console.error('Failed to parse saved progress', e);
            }
        }
    }, [storageKey]);

    // 儲存進度到 localStorage
    useEffect(() => {
        if (Object.keys(answers).length > 0) {
            localStorage.setItem(storageKey, JSON.stringify(answers));
        }
    }, [answers, storageKey]);

    // 監控未回答題目的位置
    useEffect(() => {
        const updateUnansweredStats = () => {
            const questions = Array.from(document.querySelectorAll('.question-item'));
            let above = 0;
            let below = 0;

            questions.forEach((el) => {
                const id = el.getAttribute('data-question-id');
                if (answers[id] === undefined) {
                    const rect = el.getBoundingClientRect();
                    if (rect.bottom < 0) {
                        above++;
                    } else if (rect.top > window.innerHeight) {
                        below++;
                    }
                }
            });

            setUnansweredStats({ above, below });

            // 只有捲動超過一段距離（接近 Hero 高度）後才顯示提示
            if (window.scrollY > window.innerHeight - 200) {
                setShowHints(true);
            } else {
                setShowHints(false);
            }
        };

        window.addEventListener('scroll', updateUnansweredStats);
        // 初始執行一次
        updateUnansweredStats();

        return () => window.removeEventListener('scroll', updateUnansweredStats);
    }, [answers]);

    const scrollToNextUnanswered = (direction) => {
        const questions = Array.from(document.querySelectorAll('.question-item'));
        const targetQuestions = questions.filter(el => {
            const id = el.getAttribute('data-question-id');
            if (answers[id] !== undefined) return false;
            const rect = el.getBoundingClientRect();
            return direction === 'up' ? rect.bottom < 0 : rect.top > window.innerHeight;
        });

        if (targetQuestions.length > 0) {
            const target = direction === 'up'
                ? targetQuestions[targetQuestions.length - 1] // 最接近上方的一個
                : targetQuestions[0]; // 最接近下方的一個

            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    // 計算總分
    const calculateScore = () => {
        const totalQuestions = data.categories.reduce(
            (sum, cat) => sum + cat.questions.length,
            0
        );
        const answeredQuestions = Object.keys(answers).length;

        if (answeredQuestions < totalQuestions) {
            return null;
        }

        const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0);
        return totalScore;
    };

    // 獲取結果描述
    const getResult = (score) => {
        return data.results.find(
            r => score >= r.minScore && score <= r.maxScore
        );
    };

    // 處理答案變更
    const handleAnswerChange = (questionId, value) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: parseInt(value)
        }));
    };

    // 提交問卷
    const handleSubmit = () => {
        const score = calculateScore();
        if (score !== null) {
            const resultData = getResult(score);

            // 收集得分較低（<=3）的題目反饋
            const feedbackItems = [];
            data.categories.forEach(cat => {
                cat.questions.forEach(q => {
                    const answer = answers[q.id];
                    if (answer <= 3) {
                        feedbackItems.push({
                            id: q.id,
                            question: q.text,
                            reason: q.reason,
                            benefit: q.benefit,
                            score: answer
                        });
                    }
                });
            });

            setResult({ score, ...resultData, feedbackItems });
            setShowResult(true);
        } else {
            // 如果未完成，觸發震動動畫並捲到第一個未回答的問題
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500);

            // 尋找第一個未回答的問題並捲動過去
            const questions = Array.from(document.querySelectorAll('.question-item'));
            const firstUnanswered = questions.find(el => {
                const id = el.getAttribute('data-question-id');
                return answers[id] === undefined;
            });

            if (firstUnanswered) {
                firstUnanswered.scrollIntoView({ behavior: 'smooth', block: 'center' });
                // 短暫高亮該題目
                firstUnanswered.classList.add('highlight-unanswered');
                setTimeout(() => {
                    firstUnanswered.classList.remove('highlight-unanswered');
                }, 2000);
            }
        }
    };

    // 重新開始
    const handleReset = () => {
        setAnswers({});
        setShowResult(false);
        setResult(null);
        localStorage.removeItem(storageKey);
    };

    // 檢查當前分類是否完成
    const isCategoryComplete = (categoryIndex) => {
        const category = data.categories[categoryIndex];
        return category.questions.every(q => answers[q.id] !== undefined);
    };

    // 計算進度
    const progress = () => {
        const totalQuestions = data.categories.reduce(
            (sum, cat) => sum + cat.questions.length,
            0
        );
        const answeredQuestions = Object.keys(answers).length;
        return (answeredQuestions / totalQuestions) * 100;
    };

    // 獲取評分標籤
    const getRatingLabel = (value) => {
        return data.scale.labels?.[value] || '';
    };

    // 處理移動端 tooltip 顯示
    const handleTouchStart = (questionId, value) => {
        setActiveTooltip(`${questionId}-${value}`);
    };

    const handleTouchEnd = (questionId, value) => {
        setTimeout(() => {
            setActiveTooltip(null);
        }, 1000);
    };

    return (
        <>
            {/* 結果 Modal */}
            <Modal
                isOpen={showResult && result}
                onClose={() => setShowResult(false)}
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
                        <button onClick={handleReset} className="btn btn-secondary">
                            重新評估
                        </button>
                        <a href="/visit" className="btn btn-primary">
                            預約參觀
                        </a>
                    </div>
                </div>
            </Modal>

            <div className="questionnaire-container">
                {/* 進度條 */}
                <div className="progress-bar">
                    <div
                        className="progress-fill"
                        style={{ width: `${progress()}%` }}
                    />
                </div>

                {/* 分類標籤 - 充當內部目錄導航 */}
                <div className="category-tabs">
                    {data.categories.map((category, index) => (
                        <div
                            key={category.id}
                            className={`category-tab ${isCategoryComplete(index) ? 'completed' : ''} cursor-pointer hover:shadow-md transition-all`}
                            onClick={() => {
                                document.getElementById(`cat-${category.id}`)?.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            <span className="category-number">{index + 1}</span>
                            <div className="category-info">
                                <span className="category-title">{category.title}</span>
                                <span className="category-status">
                                    {isCategoryComplete(index) ? '已完成' : '進行中'}
                                </span>
                            </div>
                            {isCategoryComplete(index) && (
                                <span className="check-icon">✓</span>
                            )}
                        </div>
                    ))}
                </div>

                {/* 所有問題連續顯示 */}
                {data.categories.map((category, categoryIndex) => (
                    <div key={category.id} id={`cat-${category.id}`} className="questions-section scroll-mt-24">
                        <h2 className="category-heading">
                            {category.title}
                        </h2>

                        <div className="questions-list">
                            {category.questions.map((question, qIndex) => (
                                <div key={question.id} className="question-item" data-question-id={question.id}>
                                    <div className="question-header">
                                        <span className="question-number">
                                            {qIndex + 1}
                                        </span>
                                        <p className="question-text">{question.text}</p>
                                    </div>

                                    <div className="rating-scale">
                                        {Array.from({ length: (data.scale.max - data.scale.min + 1) }, (_, i) => data.scale.min + i).map(value => {
                                            const tooltipId = `${question.id}-${value}`;
                                            const isTooltipActive = activeTooltip === tooltipId;

                                            return (
                                                <label
                                                    key={value}
                                                    className={`rating-option ${answers[question.id] === value ? 'selected' : ''}`}
                                                    onTouchStart={() => handleTouchStart(question.id, value)}
                                                    onTouchEnd={() => handleTouchEnd(question.id, value)}
                                                >
                                                    <input
                                                        type="radio"
                                                        name={question.id}
                                                        value={value}
                                                        checked={answers[question.id] === value}
                                                        onChange={(e) => handleAnswerChange(
                                                            question.id,
                                                            e.target.value
                                                        )}
                                                    />
                                                    <span className="rating-number">{value}</span>

                                                    {/* Tooltip */}
                                                    <span
                                                        className={`rating-tooltip ${isTooltipActive ? 'active' : ''}`}
                                                        data-tooltip={getRatingLabel(value)}
                                                    >
                                                        {getRatingLabel(value)}
                                                    </span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                ))}

                <div className="navigation-buttons">
                    <motion.button
                        onClick={handleSubmit}
                        animate={isShaking ? { x: [-5, 5, -5, 5, 0] } : {}}
                        transition={{ duration: 0.4 }}
                        className={`btn btn-primary ${calculateScore() === null ? 'opacity-80' : ''}`}
                    >
                        {calculateScore() === null ? `請完成所有題目 (${Object.keys(answers).length}/${data.categories.reduce((s, c) => s + c.questions.length, 0)})` : '查看結果'}
                    </motion.button>
                </div>

                {/* 懸浮未回答提示 */}
                <AnimatePresence>
                    {showHints && unansweredStats.above > 0 && (
                        <motion.button
                            initial={{ opacity: 0, y: -20, x: '-50%' }}
                            animate={{ opacity: 1, y: 0, x: '-50%' }}
                            exit={{ opacity: 0, y: -20, x: '-50%' }}
                            className="unanswered-hint hint-above btn btn-white"
                            onClick={() => scrollToNextUnanswered('up')}
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
                            </svg>
                            <span>上方還有 {unansweredStats.above} 題未填寫</span>
                        </motion.button>
                    )}

                    {showHints && unansweredStats.below > 0 && (
                        <motion.button
                            initial={{ opacity: 0, y: 20, x: '-50%' }}
                            animate={{ opacity: 1, y: 0, x: '-50%' }}
                            exit={{ opacity: 0, y: 20, x: '-50%' }}
                            className="unanswered-hint hint-below btn btn-white"
                            onClick={() => scrollToNextUnanswered('down')}
                        >
                            <span>下方還有 {unansweredStats.below} 題未填寫</span>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                            </svg>
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}
