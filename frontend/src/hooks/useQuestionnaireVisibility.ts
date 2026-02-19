import { useState, useEffect } from 'react';

export function useQuestionnaireVisibility(answers: Record<string, number>) {
    const [unansweredStats, setUnansweredStats] = useState({ above: 0, below: 0 });
    const [showHints, setShowHints] = useState(false);

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
            setShowHints(above > 0 || below > 0);
        };

        window.addEventListener('scroll', updateUnansweredStats);
        updateUnansweredStats();
        return () => window.removeEventListener('scroll', updateUnansweredStats);
    }, [answers]);

    const scrollToNextUnanswered = (direction: 'first' | 'up' | 'down', currentAnswers: Record<string, number>) => {
        const questions = Array.from(document.querySelectorAll('[data-question-id]'));
        const targetQuestions = questions.filter(el => {
            const id = el.getAttribute('data-question-id');
            if (id && currentAnswers[id] !== undefined) return false;

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

    return { unansweredStats, showHints, scrollToNextUnanswered };
}
