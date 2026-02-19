import { useState } from 'react';
import { QuestionnaireData, QuestionnaireResult } from '../types/content';

export type ResolvedResult = QuestionnaireResult & {
    feedbackItems: any[];
    score: number;
    categoryScores: any[]
};

export function useQuestionnaireResults(data: QuestionnaireData) {
    const [showResult, setShowResult] = useState(false);
    const [result, setResult] = useState<ResolvedResult | null>(null);

    const calculateScore = (answers: Record<string, number>) => {
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

    const resolveResult = (answers: Record<string, number>): ResolvedResult | null => {
        const score = calculateScore(answers);
        if (score === null) return null;

        const resultData = getResult(score);
        if (!resultData) return null;

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

        return {
            score,
            ...resultData,
            feedbackItems,
            categoryScores,
            expert_advice: tailoredAdvice as any
        };
    };

    return {
        showResult,
        setShowResult,
        result,
        setResult,
        resolveResult,
        calculateScore
    };
}
