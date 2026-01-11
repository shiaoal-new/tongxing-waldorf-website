import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Modal from './modal';

export default function QuestionnaireComponent({ data }) {
    const [answers, setAnswers] = useState({});
    const [showResult, setShowResult] = useState(false);
    const [result, setResult] = useState(null);
    const [activeTooltip, setActiveTooltip] = useState(null); // 用於移動端 tooltip 顯示

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
        const labels = {
            1: '完全不認同 / 難以做到',
            2: '不太認同 / 較難做到',
            3: '中立 / 偶爾能做到',
            4: '認同 / 經常做到',
            5: '非常認同 / 已經在實踐'
        };
        return labels[value];
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
                    <div className={`result-header result-${result?.color}`}>
                        <h2>評估結果</h2>
                        <div className="score-display">
                            <span className="score-number">{result?.score}</span>
                            <span className="score-total">/ 100</span>
                        </div>
                    </div>

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

                {/* 分類標籤 - 改為進度指示器 */}
                <div className="category-tabs">
                    {data.categories.map((category, index) => (
                        <div
                            key={category.id}
                            className={`category-tab ${isCategoryComplete(index) ? 'completed' : ''}`}
                        >
                            <span className="category-number">{index + 1}</span>
                            <span className="category-title">{category.title}</span>
                            {isCategoryComplete(index) && (
                                <span className="check-icon">✓</span>
                            )}
                        </div>
                    ))}
                </div>

                {/* 所有問題連續顯示 */}
                {data.categories.map((category, categoryIndex) => (
                    <div key={category.id} className="questions-section">
                        <h2 className="category-heading">
                            {category.title}
                        </h2>

                        <div className="questions-list">
                            {category.questions.map((question, qIndex) => (
                                <div key={question.id} className="question-item">
                                    <div className="question-header">
                                        <span className="question-number">
                                            {qIndex + 1}
                                        </span>
                                        <p className="question-text">{question.text}</p>
                                    </div>

                                    <div className="rating-scale">
                                        {[1, 2, 3, 4, 5].map(value => {
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

                        <div className="scale-labels">
                            <span className="scale-label-min">{data.scale.minLabel}</span>
                            <span className="scale-label-max">{data.scale.maxLabel}</span>
                        </div>
                    </div>
                ))}

                {/* 提交按鈕 */}
                <div className="navigation-buttons">
                    <button
                        onClick={handleSubmit}
                        disabled={calculateScore() === null}
                        className="btn btn-primary"
                    >
                        查看結果
                    </button>
                </div>
            </div>
        </>
    );
}
