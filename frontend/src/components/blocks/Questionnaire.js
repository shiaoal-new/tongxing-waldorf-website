import { motion } from 'framer-motion';
import { useQuestionnaire } from '../../hooks/useQuestionnaire';
import QuestionnaireResult from './questionnaire/QuestionnaireResult';
import QuestionnaireProgressBar from './questionnaire/QuestionnaireProgressBar';
import QuestionnaireCategory from './questionnaire/QuestionnaireCategory';
import UnansweredHints from './questionnaire/UnansweredHints';
import styles from './Questionnaire.module.css';

export default function QuestionnaireComponent({ data }) {
    const {
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
        closePopup
    } = useQuestionnaire(data);

    return (
        <>
            <QuestionnaireResult
                showResult={showResult}
                result={result}
                onClose={() => setShowResult(false)}
                onReset={handleReset}
            />

            <div className={styles['questionnaire-container']}>
                {data.meta?.social_proof && (
                    <div className="text-center mb-6 text-brand-taupe/80 text-sm">
                        ✨ 已有 <span className="font-bold text-brand-primary">{data.meta.social_proof}</span> {data.meta.social_proof_text}
                    </div>
                )}

                <QuestionnaireProgressBar progress={progress()} />

                {/* Categories Tabs Container */}
                <div className={styles['category-tabs']}>
                    {data.categories.map((category, index) => (
                        <div
                            key={category.id}
                            className={`${styles['category-tab']} ${isCategoryComplete(index) ? styles['completed'] : ''} cursor-pointer hover:shadow-md transition-all`}
                            onClick={() => {
                                document.getElementById(`cat-${category.id}`)?.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            <span className={styles['category-number']}>{index + 1}</span>
                            <div className={styles['category-info']}>
                                <span className={styles['category-title']}>{category.title}</span>
                                <span className={styles['category-status']}>
                                    {isCategoryComplete(index) ? '已完成' : '進行中'}
                                </span>
                            </div>
                            {isCategoryComplete(index) && (
                                <span className={styles['check-icon']}>✓</span>
                            )}
                        </div>
                    ))}
                </div>

                {data.categories.map((category, index) => (
                    <QuestionnaireCategory
                        key={category.id}
                        category={category}
                        answers={answers}
                        handleAnswerChange={handleAnswerChange}
                        scale={data.scale}
                        activeTooltip={activeTooltip}
                        setActiveTooltip={setActiveTooltip}
                    />
                ))}

                <div className={styles['navigation-buttons']}>
                    <motion.button
                        onClick={handleSubmit}
                        animate={isShaking ? { x: [-5, 5, -5, 5, 0] } : {}}
                        transition={{ duration: 0.4 }}
                        className={`${styles['btn']} ${styles['btn-primary']} ${calculateScore() === null ? 'opacity-80' : ''}`}
                    >
                        {calculateScore() === null ? `請完成所有題目 (${Object.keys(answers).length}/${data.categories.reduce((s, c) => s + c.questions.length, 0)})` : '查看結果'}
                    </motion.button>
                </div>

                <UnansweredHints
                    stats={unansweredStats}
                    showHints={showHints}
                    onScroll={scrollToNextUnanswered}
                />
            </div>

            {popupFeedback && (
                <div className="fixed bottom-8 right-8 z-50 animate-bounce-in">
                    <div className="bg-white rounded-lg shadow-xl p-4 border border-brand-primary/20 max-w-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-brand-primary"></div>
                        <button
                            onClick={closePopup}
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                        >
                            ×
                        </button>
                        <h4 className="text-brand-primary font-bold mb-1">{popupFeedback.title}</h4>
                        <p className="text-sm text-gray-600">{popupFeedback.content}</p>
                    </div>
                </div>
            )}
        </>
    );
}
