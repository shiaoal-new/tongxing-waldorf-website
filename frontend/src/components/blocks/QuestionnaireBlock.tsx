import { usePageData } from '../../context/PageDataContext';
import QuestionnaireComponent from './Questionnaire';
import { QuestionnaireBlock as QuestionnaireBlockType, QuestionnaireData, PageContextValue } from '../../types/content';

interface QuestionnaireBlockProps {
    data: QuestionnaireBlockType;
}

export default function QuestionnaireBlock({ data }: QuestionnaireBlockProps) {
    // 從 props 中獲取問卷資料
    const pageData = usePageData() as PageContextValue;
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

export function getTOC(block: any, sectionId: string, extraData: any) {
    // extraData 應該是 questionnaire 物件 (從 page data 傳入)
    const questionnaire = extraData as QuestionnaireData;
    if (!questionnaire?.categories) return [];

    return questionnaire.categories.map(cat => ({
        id: `cat-${cat.id}`,
        title: `${cat.title}`
    }));
}
