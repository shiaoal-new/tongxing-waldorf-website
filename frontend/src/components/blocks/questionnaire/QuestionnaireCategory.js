
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
        <div id={`cat-${category.id}`} className="questions-section scroll-mt-24">
            <h2 className="category-heading">
                {category.title}
            </h2>

            <div className="questions-list">
                {category.questions.map((question, qIndex) => (
                    <div key={question.id} className="question-item" data-question-id={question.id}>
                        <div className="question-header">
                            <span className="question-number">
                                {qIndex + 1}
                            </span>
                            <p className="question-text">{question.text}</p>
                        </div>

                        <div className="rating-scale">
                            {Array.from({ length: (scale.max - scale.min + 1) }, (_, i) => scale.min + i).map(value => {
                                const tooltipId = `${question.id}-${value}`;
                                const isTooltipActive = activeTooltip === tooltipId;

                                return (
                                    <label
                                        key={value}
                                        className={`rating-option ${answers[question.id] === value ? 'selected' : ''}`}
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
                                        <span className="rating-number">{value}</span>

                                        <span
                                            className={`rating-tooltip ${isTooltipActive ? 'active' : ''}`}
                                            data-tooltip={getRatingLabel(value)}
                                        >
                                            {getRatingLabel(value)}
                                        </span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
