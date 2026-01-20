import { useState, useEffect } from 'react';

export const useQuestionnaire = (data) => {
    const [answers, setAnswers] = useState({});
    const [showResult, setShowResult] = useState(false);
    const [result, setResult] = useState(null);
    const [activeTooltip, setActiveTooltip] = useState(null);
    const [unansweredStats, setUnansweredStats] = useState({ above: 0, below: 0 });
    const [showHints, setShowHints] = useState(false);
    const [isShaking, setIsShaking] = useState(false);

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

            if (window.scrollY > window.innerHeight - 200) {
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

    const getResult = (score) => {
        return data.results.find(
            r => score >= r.minScore && score <= r.maxScore
        );
    };

    const handleAnswerChange = (questionId, value) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: parseInt(value)
        }));
    };

    const handleSubmit = () => {
        const score = calculateScore();
        if (score !== null) {
            const resultData = getResult(score);

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
    const isCategoryComplete = (categoryIndex) => {
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
    const scrollToNextUnanswered = (direction) => {
        const questions = Array.from(document.querySelectorAll('.question-item'));
        const targetQuestions = questions.filter(el => {
            const id = el.getAttribute('data-question-id');
            if (answers[id] !== undefined) return false;

            if (direction === 'first') return true;

            const rect = el.getBoundingClientRect();
            return direction === 'up' ? rect.bottom < 0 : rect.top > window.innerHeight;
        });

        if (targetQuestions.length > 0) {
            const target = direction === 'up'
                ? targetQuestions[targetQuestions.length - 1]
                : targetQuestions[0];

            target.scrollIntoView({ behavior: 'smooth', block: 'center' });

            if (direction === 'first') {
                target.classList.add('highlight-unanswered');
                setTimeout(() => target.classList.remove('highlight-unanswered'), 2000);
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
        calculateScore
    };
};
