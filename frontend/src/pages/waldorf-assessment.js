import { getQuestionnaireBySlug } from '../lib/Questionnaire';
import { getNavigation } from '../lib/settings';
import { getAllPages } from '../lib/pages';
import DynamicPageContent from '../components/DynamicPage';

export default function WaldorfAssessment(props) {
    return <DynamicPageContent {...props} />;
}

export async function getStaticProps() {
    const questionnaire = getQuestionnaireBySlug('waldorf-assessment');
    const navigation = getNavigation();
    const pages = getAllPages();
    const page = pages.find(p => p.slug === 'waldorf-assessment');

    return {
        props: {
            page: page || null,
            pages,
            navigation,
            data: {
                questionnaire,
            },
        },
    };
}

