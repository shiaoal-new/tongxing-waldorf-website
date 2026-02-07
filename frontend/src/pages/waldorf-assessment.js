import { getQuestionnaireBySlug } from '../lib/questionnaire';
import { getNavigation } from '../lib/settings';
import { getAllPages } from '../lib/pages';
import DynamicPageContent from '../components/DynamicPage';
import { getWordingDictionary, resolveWording } from '../lib/wording.server';

export default function WaldorfAssessment(props) {
    return <DynamicPageContent {...props} />;
}

export async function getStaticProps() {
    const questionnaire = getQuestionnaireBySlug('waldorf-assessment');
    const navigation = getNavigation();
    const pages = getAllPages();
    const page = pages.find(p => p.slug === 'waldorf-assessment');

    // Resolve page titles for navigation (pages list)
    // This allows the Navbar to display correct titles instead of placeholders
    const resolvedPages = pages.map(p => {
        const dict = getWordingDictionary(p.slug, "default");
        return {
            ...p,
            title: resolveWording(p.title, dict)
        };
    });

    return {
        props: {
            page: page ? resolveWording(page, getWordingDictionary('waldorf-assessment', "default")) : null,
            pages: resolvedPages,
            navigation,
            data: {
                questionnaire,
            },
        },
    };
}

