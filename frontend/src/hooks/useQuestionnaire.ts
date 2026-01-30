import { useState, useEffect } from 'react';
import { QuestionnaireData, QuestionnaireResult } from '../types/content';

export interface QuestionnaireState {
    answers: Record<string, number>;
    showResult: boolean;
    result: (QuestionnaireResult & { feedbackItems: any[], score: number; categoryScores: any[] }) | null;
    activeTooltip: string | null;
    unansweredStats: { above: number; below: number };
    showHints: boolean;
    isShaking: boolean;
    handleAnswerChange: (questionId: string, value: string | number) => void;
    handleSubmit: () => void;
    handleReset: () => void;
    isCategoryComplete: (categoryIndex: number) => boolean;
    progress: () => number;
    scrollToNextUnanswered: (direction: 'first' | 'up' | 'down') => void;
    setShowResult: (show: boolean) => void;
    setActiveTooltip: (id: string | null) => void;
    calculateScore: () => number | null;
    popupFeedback: { title: string; content: string } | null;
    closePopup: () => void;
}

export const useQuestionnaire = (data: QuestionnaireData): QuestionnaireState => {
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [showResult, setShowResult] = useState(false);
    const [result, setResult] = useState<(QuestionnaireResult & { feedbackItems: any[], score: number; categoryScores: any[] }) | null>(null);
    const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
    const [unansweredStats, setUnansweredStats] = useState({ above: 0, below: 0 });
    const [showHints, setShowHints] = useState(false);
    const [isShaking, setIsShaking] = useState(false);
    const [popupFeedback, setPopupFeedback] = useState<{ title: string; content: string } | null>(null);
    const [notifiedCategories, setNotifiedCategories] = useState<Set<string>>(new Set());

    const storageKey = `questionnaire_progress_${data.slug || 'default'}`;

    // Load progress
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

    // Save progress
    useEffect(() => {
        if (Object.keys(answers).length > 0) {
            localStorage.setItem(storageKey, JSON.stringify(answers));
        }
    }, [answers, storageKey]);

    // Unanswered stats update logic
    useEffect(() => {
        const updateUnansweredStats = () => {
            const questions = Array.from(document.querySelectorAll('[data-question-id]'));
            let above = 0;
            let below = 0;

            questions.forEach((el) => {
                const id = el.getAttribute('data-question-id');
                if (id && answers[id] === undefined) {
                    const rect = el.getBoundingClientRect();
                    if (rect.bottom < 0) {
                        above++;
                    } else if (rect.top > window.innerHeight) {
                        below++;
                    }
                }
            });

            setUnansweredStats({ above, below });

            // Show hints if there's anything to show
            if (above > 0 || below > 0) {
                setShowHints(true);
            } else {
                setShowHints(false);
            }
        };

        window.addEventListener('scroll', updateUnansweredStats);
        updateUnansweredStats();
        return () => window.removeEventListener('scroll', updateUnansweredStats);
    }, [answers]);

    // Logic to calculate scores and get results
    const calculateScore = () => {
        const totalQuestions = data.categories.reduce(
            (sum, cat) => sum + cat.questions.length,
            0
        );
        const answeredQuestions = Object.keys(answers).length;

        if (answeredQuestions < totalQuestions) return null;

        return Object.values(answers).reduce((sum, score) => sum + score, 0);
    };

    const getResult = (score: number) => {
        return data.results.find(
            r => score >= r.minScore && score <= r.maxScore
        );
    };

    const handleAnswerChange = (questionId: string, value: string | number) => {
        const val = typeof value === 'string' ? parseInt(value) : value;

        const newAnswers = {
            ...answers,
            [questionId]: val
        };
        setAnswers(newAnswers);

        // Check for category completion
        data.categories.forEach((cat, index) => {
            if (notifiedCategories.has(cat.id)) return;

            const isComplete = cat.questions.every(q =>
                (q.id === questionId && val !== undefined) ||
                (newAnswers[q.id] !== undefined)
            );

            if (isComplete) {
                // Mark as notified
                const newNotified = new Set(notifiedCategories);
                newNotified.add(cat.id);
                setNotifiedCategories(newNotified);

                // Calculate category score
                const catScore = cat.questions.reduce((sum, q) => {
                    const ans = q.id === questionId ? val : newAnswers[q.id];
                    return sum + (ans || 0);
                }, 0);
                const maxScore = cat.questions.length * 5;
                const percentage = (catScore / maxScore) * 100;

                // Triger feedback
                const feedbackConfig = (cat as any).feedback;
                if (feedbackConfig) {
                    const isHigh = percentage >= 80;
                    setPopupFeedback({
                        title: isHigh ? "太棒了！" : "感謝您的用心！",
                        content: isHigh ? (feedbackConfig.high || feedbackConfig.general) : feedbackConfig.general
                    });
                }
            }
        });
    };

    const handleSubmit = () => {
        const score = calculateScore();
        if (score !== null) {
            const resultData = getResult(score);

            const feedbackItems: any[] = [];
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

            const categoryScores = data.categories.map(cat => {
                const catScore = cat.questions.reduce((sum, q) => {
                    return sum + (answers[q.id] || 0);
                }, 0);
                const maxScore = cat.questions.length * 5;
                return {
                    id: cat.id,
                    title: cat.title,
                    score: catScore,
                    maxScore,
                    percentage: Math.round((catScore / maxScore) * 100)
                };
            });

            const tailoredAdvice = data.categories.map((cat, idx) => {
                const catScore = categoryScores[idx];
                const adviceConfig = (cat as any).advice;
                if (!adviceConfig) return null;

                const isHigh = catScore.percentage >= 80;
                return {
                    title: cat.title,
                    content: isHigh ? adviceConfig.high : adviceConfig.low
                };
            }).filter(Boolean);

            if (resultData) {
                setResult({
                    score,
                    ...resultData,
                    feedbackItems,
                    categoryScores,
                    expert_advice: tailoredAdvice as any
                });
                setShowResult(true);
            }
        } else {
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500);
            scrollToNextUnanswered('first');
        }
    };

    const handleReset = () => {
        setAnswers({});
        setShowResult(false);
        setResult(null);
        localStorage.removeItem(storageKey);
    };

    // Helper functions
    const isCategoryComplete = (categoryIndex: number) => {
        const category = data.categories[categoryIndex];
        return category.questions.every(q => answers[q.id] !== undefined);
    };

    const progress = () => {
        const totalQuestions = data.categories.reduce(
            (sum, cat) => sum + cat.questions.length,
            0
        );
        const answeredQuestions = Object.keys(answers).length;
        return totalQuestions === 0 ? 0 : (answeredQuestions / totalQuestions) * 100;
    };

    // Scroll helper
    const scrollToNextUnanswered = (direction: 'first' | 'up' | 'down') => {
        const questions = Array.from(document.querySelectorAll('[data-question-id]'));
        const targetQuestions = questions.filter(el => {
            const id = el.getAttribute('data-question-id');
            if (id && answers[id] !== undefined) return false;

            if (direction === 'first') return true;

            const rect = el.getBoundingClientRect();
            return direction === 'up' ? rect.bottom < 0 : rect.top > window.innerHeight;
        });

        if (targetQuestions.length > 0) {
            const target = direction === 'up'
                ? targetQuestions[targetQuestions.length - 1]
                : (targetQuestions[0] as HTMLElement);

            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });

                if (direction === 'first') {
                    target.classList.add('highlight-unanswered');
                    setTimeout(() => target.classList.remove('highlight-unanswered'), 2000);
                }
            }
        }
    };


    return {
        answers,
        showResult,
        result,
        activeTooltip,
        unansweredStats,
        showHints,
        isShaking,
        handleAnswerChange,
        handleSubmit,
        handleReset,
        isCategoryComplete,
        progress,
        scrollToNextUnanswered,
        setShowResult,
        setActiveTooltip,
        calculateScore,
        popupFeedback,
        closePopup: () => setPopupFeedback(null)
    };
};
