import { useState, useEffect } from 'react';
import { CONFIG } from '../lib/config';

export function useQuestionnaireStorage(slug: string) {
    const [answers, setAnswers] = useState<Record<string, number>>({});
    const storageKey = `${CONFIG.STORAGE_KEYS.QUESTIONNAIRE_PREFIX}${slug || 'default'}`;

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

    const handleReset = () => {
        setAnswers({});
        localStorage.removeItem(storageKey);
    };

    return { answers, setAnswers, handleReset };
}
