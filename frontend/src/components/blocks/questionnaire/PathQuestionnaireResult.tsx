import { motion, AnimatePresence } from 'framer-motion';
import { PathScore } from '../../../hooks/usePathQuestionnaire';
import { Icon } from '@iconify/react';

interface PathResultProps {
    showResult: boolean;
    pathScores: PathScore[];
    recommendedPath: any;
    categoryScores: any[];
    onClose: () => void;
    onReset: () => void;
}

export default function PathQuestionnaireResult({
    showResult,
    pathScores,
    recommendedPath,
    categoryScores,
    onClose,
    onReset
}: PathResultProps) {
    if (!showResult || !recommendedPath) return null;

    const getColorClass = (color: string) => {
        const colors: Record<string, string> = {
            success: 'bg-green-50 border-green-200 text-green-900',
            info: 'bg-blue-50 border-blue-200 text-blue-900',
            warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
            error: 'bg-red-50 border-red-200 text-red-900'
        };
        return colors[color] || colors.info;
    };

    const getProgressColor = (color: string) => {
        const colors: Record<string, string> = {
            success: 'bg-green-500',
            info: 'bg-blue-500',
            warning: 'bg-yellow-500',
            error: 'bg-red-500'
        };
        return colors[color] || colors.info;
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className={`p-8 rounded-t-2xl border-b-4 ${getColorClass(recommendedPath.color)}`}>
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
                        >
                            ×
                        </button>
                        <div className="flex items-center gap-4 mb-4">
                            <div className={`w-16 h-16 rounded-full ${getProgressColor(recommendedPath.color)} flex items-center justify-center`}>
                                <Icon icon={recommendedPath.icon} className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h2 className="text-3xl font-bold">{recommendedPath.title}</h2>
                                <p className="text-lg opacity-80">{recommendedPath.subtitle}</p>
                            </div>
                        </div>
                        <p className="text-base leading-relaxed">{recommendedPath.description}</p>
                    </div>

                    <div className="p-8 max-h-[60vh] overflow-y-auto">
                        {/* Path Scores Comparison */}
                        <div className="mb-8">
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <Icon icon="lucide:bar-chart-3" className="w-5 h-5" />
                                各路徑適配度分析
                            </h3>
                            <div className="space-y-3">
                                {pathScores.map((pathScore, index) => {
                                    const pathData = [
                                        { id: 'waldorf', label: '續讀華德福', color: 'bg-green-500' },
                                        { id: 'mainstream', label: '轉軌主流', color: 'bg-blue-500' },
                                        { id: 'diverse', label: '多元路徑', color: 'bg-yellow-500' }
                                    ].find(p => p.id === pathScore.path);

                                    return (
                                        <div key={pathScore.path} className="relative">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-medium">{pathData?.label || pathScore.path}</span>
                                                <span className="text-sm font-bold">{pathScore.percentage}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${pathScore.percentage}%` }}
                                                    transition={{ duration: 1, delay: index * 0.2 }}
                                                    className={`h-full ${pathData?.color || 'bg-gray-500'} rounded-full`}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Strengths */}
                        {recommendedPath.strengths && (
                            <div className="mb-6">
                                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                                    <Icon icon="lucide:check-circle" className="w-5 h-5 text-green-600" />
                                    核心優勢
                                </h3>
                                <ul className="space-y-2">
                                    {recommendedPath.strengths.map((strength: string, index: number) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <span className="text-green-600 mt-1">✓</span>
                                            <span>{strength}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Challenges */}
                        {recommendedPath.challenges && (
                            <div className="mb-6">
                                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                                    <Icon icon="lucide:alert-circle" className="w-5 h-5 text-yellow-600" />
                                    需要注意的挑戰
                                </h3>
                                <ul className="space-y-2">
                                    {recommendedPath.challenges.map((challenge: string, index: number) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <span className="text-yellow-600 mt-1">!</span>
                                            <span>{challenge}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Preparation Timeline */}
                        {recommendedPath.preparation && (
                            <div className="mb-6">
                                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                                    <Icon icon="lucide:calendar" className="w-5 h-5 text-blue-600" />
                                    準備時程表
                                </h3>
                                <div className="space-y-3">
                                    {recommendedPath.preparation.map((item: any, index: number) => (
                                        <div key={index} className="flex gap-3 items-start">
                                            <div className="w-24 flex-shrink-0 font-bold text-brand-primary">
                                                {item.title}
                                            </div>
                                            <div className="flex-1 text-gray-700">
                                                {item.content}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Expert Advice */}
                        {recommendedPath.expert_advice && recommendedPath.expert_advice.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                                    <Icon icon="lucide:lightbulb" className="w-5 h-5 text-purple-600" />
                                    專家建議
                                </h3>
                                <ul className="space-y-2">
                                    {recommendedPath.expert_advice.map((advice: string, index: number) => (
                                        <li key={index} className="flex items-start gap-2">
                                            <span className="text-purple-600 mt-1">💡</span>
                                            <span>{advice}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Case Study */}
                        {recommendedPath.case_study && (
                            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                                    <Icon icon="lucide:user-check" className="w-5 h-5 text-blue-600" />
                                    {recommendedPath.case_study.title}
                                </h3>
                                <p className="text-gray-700">{recommendedPath.case_study.content}</p>
                            </div>
                        )}

                        {/* Warning (if exists) */}
                        {recommendedPath.warning && (
                            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                                <h3 className="text-lg font-bold mb-2 flex items-center gap-2 text-red-700">
                                    <Icon icon="lucide:alert-triangle" className="w-5 h-5" />
                                    {recommendedPath.warning.title}
                                </h3>
                                <p className="text-gray-700">{recommendedPath.warning.content}</p>
                            </div>
                        )}

                        {/* Options (for diverse path) */}
                        {recommendedPath.options && (
                            <div className="mb-6">
                                <h3 className="text-xl font-bold mb-3">可選路徑</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {recommendedPath.options.map((option: any, index: number) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-2 mb-2">
                                                <Icon icon={option.icon} className="w-5 h-5 text-brand-primary" />
                                                <h4 className="font-bold">{option.title}</h4>
                                            </div>
                                            <p className="text-sm text-gray-600">{option.content}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Category Scores */}
                        <div className="mb-6">
                            <h3 className="text-xl font-bold mb-3 flex items-center gap-2">
                                <Icon icon="lucide:pie-chart" className="w-5 h-5" />
                                各維度評估
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {categoryScores.map((cat, index) => (
                                    <div key={cat.id} className="border border-gray-200 rounded-lg p-3">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-medium text-sm">{cat.title}</span>
                                            <span className="text-xs font-bold">{cat.percentage}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${cat.percentage}%` }}
                                                transition={{ duration: 0.8, delay: index * 0.1 }}
                                                className="h-full bg-brand-primary rounded-full"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-gray-50 rounded-b-2xl flex justify-between items-center border-t">
                        <button
                            onClick={onReset}
                            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            重新評估
                        </button>
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
                        >
                            了解详情
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
