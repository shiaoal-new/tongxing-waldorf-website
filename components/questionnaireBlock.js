import { usePageData } from '../contexts/PageDataContext';
import QuestionnaireComponent from './questionnaire';

export default function QuestionnaireBlock({ data }) {
    // 從 props 中獲取問卷資料
    const pageData = usePageData();
    const questionnaire = pageData?.questionnaire;

    if (!questionnaire) {
        return (
            <div className="text-center py-12">
                <p className="text-brand-taupe">問卷資料載入中...</p>
            </div>
        );
    }

    return (
        <div className="questionnaire-block">
            <QuestionnaireComponent data={questionnaire} />
        </div>
    );
}
