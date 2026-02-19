import { useState, useEffect } from 'react';
import { QuestionnaireData } from '../types/content';
import { CONFIG } from '../lib/config';

export interface PathScore {
    path: string;
    score: number;
    percentage: number;
}

export interface PathQuestionnaireState {
    answers: Record<string, number>;
    showResult: boolean;
    pathScores: PathScore[];
    recommendedPath: any | null;
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
    calculatePathScores: () => PathScore[] | null;
    popupFeedback: { title: string; content: string } | null;
    closePopup: () => void;
    categoryScores: any[];
}

export const usePathQuestionnaire = (data: QuestionnaireData): PathQuestionnaireState => {
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const [showResult, setShowResult] = useState(false);
    const [pathScores, setPathScores] = useState<PathScore[]>([]);
    const [recommendedPath, setRecommendedPath] = useState<any | null>(null);
    const [categoryScores, setCategoryScores] = useState<any[]>([]);
    const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
    const [unansweredStats, setUnansweredStats] = useState({ above: 0, below: 0 });
    const [showHints, setShowHints] = useState(false);
    const [isShaking, setIsShaking] = useState(false);
    const [popupFeedback, setPopupFeedback] = useState<{ title: string; content: string } | null>(null);
    const [notifiedCategories, setNotifiedCategories] = useState<Set<string>>(new Set());

    const storageKey = `${CONFIG.STORAGE_KEYS.QUESTIONNAIRE_PREFIX}${data.slug || 'future-path-advisor'}`;

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

    // Calculate path scores based on question scoring
    const calculatePathScores = (): PathScore[] | null => {
        const totalQuestions = data.categories.reduce(
            (sum, cat) => sum + cat.questions.length,
            0
        );
        const answeredQuestions = Object.keys(answers).length;

        if (answeredQuestions < totalQuestions) return null;

        // Initialize path scores
        const scores: Record<string, number> = {};
        const maxScores: Record<string, number> = {};

        // Calculate scores for each path
        data.categories.forEach(cat => {
            cat.questions.forEach(q => {
                const answer = answers[q.id];
                const questionScoring = (q as any).scoring;

                if (questionScoring && answer !== undefined) {
                    Object.keys(questionScoring).forEach(path => {
                        const weight = questionScoring[path];
                        scores[path] = (scores[path] || 0) + (answer * weight);
                        maxScores[path] = (maxScores[path] || 0) + (5 * weight);
                    });
                }
            });
        });

        // Convert to PathScore array
        return Object.keys(scores).map(path => ({
            path,
            score: scores[path],
            percentage: Math.round((scores[path] / maxScores[path]) * 100)
        })).sort((a, b) => b.score - a.score);
    };

    const handleAnswerChange = (questionId: string, value: string | number) => {
        const val = typeof value === 'string' ? parseInt(value) : value;

        const newAnswers = {
            ...answers,
            [questionId]: val
        };
        setAnswers(newAnswers);

        // Check for category completion
        data.categories.forEach((cat) => {
            if (notifiedCategories.has(cat.id)) return;

            const isComplete = cat.questions.every(q =>
                (q.id === questionId && val !== undefined) ||
                (newAnswers[q.id] !== undefined)
            );

            if (isComplete) {
                const newNotified = new Set(notifiedCategories);
                newNotified.add(cat.id);
                setNotifiedCategories(newNotified);

                setPopupFeedback({
                    title: "完成一個類別！",
                    content: `您已完成「${cat.title}」的所有問題，繼續加油！`
                });
            }
        });
    };

    const handleSubmit = () => {
        const scores = calculatePathScores();
        if (scores !== null) {
            setPathScores(scores);

            // Find recommended path (highest score)
            const topPath = scores[0];
            const pathResult = data.results.find((r: any) => r.path === topPath.path);

            // Calculate category scores
            const catScores = data.categories.map(cat => {
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

            setCategoryScores(catScores);
            setRecommendedPath(pathResult);
            setShowResult(true);
        } else {
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 500);
            scrollToNextUnanswered('first');
        }
    };

    const handleReset = () => {
        setAnswers({});
        setShowResult(false);
        setPathScores([]);
        setRecommendedPath(null);
        setCategoryScores([]);
        setNotifiedCategories(new Set());
        localStorage.removeItem(storageKey);
    };

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
        pathScores,
        recommendedPath,
        categoryScores,
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
        calculatePathScores,
        popupFeedback,
        closePopup: () => setPopupFeedback(null)
    };
};
