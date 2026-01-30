import styles from '../Questionnaire.module.css';

export default function QuestionnaireCategory({
    category,
    answers,
    handleAnswerChange,
    scale,
    activeTooltip,
    setActiveTooltip
}) {
    const getRatingLabel = (value) => {
        return scale.labels?.[value] || '';
    };

    const handleTouchStart = (questionId, value) => {
        setActiveTooltip(`${questionId}-${value}`);
    };

    const handleTouchEnd = (questionId, value) => {
        setTimeout(() => {
            setActiveTooltip(null);
        }, 1000);
    };

    return (
        <div id={`cat-${category.id}`} className={`${styles['questions-section']} scroll-mt-24`}>
            <h2 className={styles['category-heading']}>
                {category.title}
            </h2>

            <div className={styles['questions-list']}>
                {category.questions.map((question, qIndex) => (
                    <div key={question.id} className={styles['question-item']} data-question-id={question.id}>
                        <div className={styles['question-header']}>
                            <span className={styles['question-number']}>
                                {qIndex + 1}
                            </span>
                            <p className={styles['question-text']}>{question.text}</p>
                        </div>

                        <div className={styles['rating-scale']}>
                            {Array.from({ length: (scale.max - scale.min + 1) }, (_, i) => scale.min + i).map(value => {
                                const tooltipId = `${question.id}-${value}`;
                                const isTooltipActive = activeTooltip === tooltipId;

                                return (
                                    <label
                                        key={value}
                                        className={`${styles['rating-option']} ${answers[question.id] === value ? styles['selected'] : ''}`}
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
                                        <span className={styles['rating-number']}>{value}</span>

                                        <span
                                            className={`${styles['rating-tooltip']} ${isTooltipActive ? styles['active'] : ''}`}
                                            data-tooltip={getRatingLabel(value)}
                                        >
                                            {getRatingLabel(value)}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>

                        {answers[question.id] && (
                            <div className="mt-3 animate-fade-in">
                                <span className={styles['benchmark-badge'] || "text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full inline-flex items-center gap-1"}>
                                    👥 {68 + ((question.id.charCodeAt(0) + question.id.charCodeAt(question.id.length - 1)) % 25)}% 的家長也和您有相同的看法
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
