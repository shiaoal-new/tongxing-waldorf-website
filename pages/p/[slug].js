import { useRouter } from "next/router";
import Layout from "../../components/layout";
import Container from "../../components/container";
import SectionTitle from "../../components/sectionTitle";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getAllPages, getPageBySlug } from "../../lib/pages";
import { getAllFaculty } from "../../lib/faculty";

export default function DynamicPage({ page, pages, facultyList }) {
    const router = useRouter();

    if (router.isFallback) {
        return <div>Loading...</div>;
    }

    if (!page) {
        return <div>Page not found</div>;
    }

    const getImagePath = (path) => {
        if (!path) return path;
        if (path.startsWith('./')) {
            return path.substring(1);
        }
        return path;
    };

    const getMemberDetails = (name) => {
        const member = facultyList.find(f => f.name === name) || { name };
        return {
            ...member,
            photo: getImagePath(member.photo)
        };
    };

    return (
        <Layout pages={pages} title={page.title} navbarPadding={true}>
            <Container>
                <div className="max-w-4xl mx-auto py-10">
                    <SectionTitle title={page.title} align="left">
                        {page.description}
                    </SectionTitle>

                    <div className="mt-10">
                        {page.sections && page.sections.map((section, index) => {
                            if (section.type === "text_block") {
                                return (
                                    <div key={index} className="mb-16">
                                        {section.header && (
                                            <h2 className="text-3xl font-bold mb-8 text-primary-600 dark:text-primary-400 border-b-2 border-primary-100 dark:border-primary-800 pb-2">
                                                {section.header}
                                            </h2>
                                        )}
                                        <div className="prose prose-lg dark:prose-invert max-w-none">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {section.content}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                );
                            }
                            if (section.type === "member_block") {
                                return (
                                    <div key={index} className="mb-16">
                                        {section.header && (
                                            <h2 className="text-3xl font-bold mb-8 text-primary-600 dark:text-primary-400 border-b-2 border-primary-100 dark:border-primary-800 pb-2">
                                                {section.header}
                                            </h2>
                                        )}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-6">
                                            {section.members && section.members.map((memberName, mIndex) => {
                                                const member = getMemberDetails(memberName);
                                                return (
                                                    <div key={mIndex} className="flex items-start p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 transition-all hover:shadow-lg ">
                                                        {member.photo && (
                                                            <div className="flex-shrink-0 mr-4">
                                                                <img src={member.photo} alt={member.name} className="w-16 h-16 rounded-full object-cover border-2 border-primary-100" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{member.name}</h3>
                                                            {member.title && <p className="text-primary-600 dark:text-primary-400 font-medium text-sm">{member.title}</p>}
                                                            {member.bio && <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-3">{member.bio}</div>}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            }
                            return null;
                        })}

                        {!page.sections && page.content && (
                            <div className="prose prose-lg dark:prose-invert max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {page.content}
                                </ReactMarkdown>
                            </div>
                        )}
                    </div>
                </div>
            </Container>
        </Layout>
    );
}

export async function getStaticPaths() {
    const pages = getAllPages();
    const paths = pages.map((page) => ({
        params: { slug: page.slug },
    }));

    return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
    const { slug } = params;
    const page = getPageBySlug(slug);
    const pages = getAllPages();
    const facultyList = getAllFaculty();

    return {
        props: {
            page,
            pages,
            facultyList,
        },
    };
}
