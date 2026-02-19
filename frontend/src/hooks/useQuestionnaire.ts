import { useState, useCallback } from 'react';
import { QuestionnaireData, QuestionnaireResult } from '../types/content';
import { useQuestionnaireStorage } from './useQuestionnaireStorage';
import { useQuestionnaireVisibility } from './useQuestionnaireVisibility';
import { useQuestionnaireResults } from './useQuestionnaireResults';

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
    // 1. Storage and base state
    const { answers, setAnswers, handleReset: resetStorage } = useQuestionnaireStorage(data.slug || 'default');

    // 2. Visibility and scroll tracking
    const { unansweredStats, showHints, scrollToNextUnanswered: scrollHelper } = useQuestionnaireVisibility(answers);

    // 3. Results management
    const {
        showResult,
        setShowResult,
        result,
        setResult,
        resolveResult,
        calculateScore: calculateScoreBase
    } = useQuestionnaireResults(data);

    // 4. Local UI states
    const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
    const [isShaking, setIsShaking] = useState(false);
    const [popupFeedback, setPopupFeedback] = useState<{ title: string; content: string } | null>(null);
    const [notifiedCategories, setNotifiedCategories] = useState<Set<string>>(new Set());

    const handleAnswerChange = useCallback((questionId: string, value: string | number) => {
        const val = typeof value === 'string' ? parseInt(value) : value;

        setAnswers(prev => {
            const next = { ...prev, [questionId]: val };

            // Trigger category feedback logic
            data.categories.forEach(cat => {
                if (notifiedCategories.has(cat.id)) return;

                const isComplete = cat.questions.every(q =>
                    (q.id === questionId && val !== undefined) || (next[q.id] !== undefined)
                );

                if (isComplete) {
                    setNotifiedCategories(prevSet => new Set(prevSet).add(cat.id));

                    const catScore = cat.questions.reduce((sum, q) => {
                        const ans = q.id === questionId ? val : next[q.id];
                        return sum + (ans || 0);
                    }, 0);
                    const percentage = (catScore / (cat.questions.length * 5)) * 100;

                    const feedbackConfig = (cat as any).feedback;
                    if (feedbackConfig) {
                        setPopupFeedback({
                            title: percentage >= 80 ? "太棒了！" : "感謝您的用心！",
                            content: percentage >= 80 ? (feedbackConfig.high || feedbackConfig.general) : feedbackConfig.general
                        });
                    }
                }
            });

            return next;
        });
    }, [data.categories, notifiedCategories, setAnswers]);

    const handleSubmit = () => {
        const res = resolveResult(answers);
        if (res) {
            setResult(res);
            setShowResult(true);
        } else {
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500);
            scrollHelper('first', answers);
        }
    };

    const handleReset = () => {
        resetStorage();
        setShowResult(false);
        setResult(null);
        setNotifiedCategories(new Set());
    };

    const isCategoryComplete = (categoryIndex: number) => {
        const category = data.categories[categoryIndex];
        return category.questions.every(q => answers[q.id] !== undefined);
    };

    const progress = () => {
        const totalQuestions = data.categories.reduce((sum, cat) => sum + cat.questions.length, 0);
        const answeredQuestions = Object.keys(answers).length;
        return totalQuestions === 0 ? 0 : (answeredQuestions / totalQuestions) * 100;
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
        scrollToNextUnanswered: (dir) => scrollHelper(dir, answers),
        setShowResult,
        setActiveTooltip,
        calculateScore: () => calculateScoreBase(answers),
        popupFeedback,
        closePopup: () => setPopupFeedback(null)
    };
};
