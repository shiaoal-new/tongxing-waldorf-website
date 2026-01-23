import styles from '../Questionnaire.module.css';

export default function QuestionnaireProgressBar({ progress }) {
    return (
        <div className={styles['progress-bar']}>
            <div
                className={styles['progress-fill']}
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}
