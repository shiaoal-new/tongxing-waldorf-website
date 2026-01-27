import Head from 'next/head';
import { FaqItem, SiteData } from '../../types/content';

interface StructuredDataProps {
    type: 'EducationalOrganization' | 'FAQPage' | 'Course';
    data: any;
    siteSettings?: SiteData;
}

export default function StructuredData({ type, data, siteSettings }: StructuredDataProps) {
    let schema: any = null;

    // Use passed siteSettings or fallback to data if it contains siteSettings
    const site = siteSettings || data.siteSettings;

    if (type === 'EducationalOrganization') {
        schema = {
            "@context": "https://schema.org",
            "@type": "EducationalOrganization",
            "name": site?.name || data.name || "台北市同心華德福實驗教育機構",
            "url": site?.url || "https://tongxing.org.tw",
            "logo": site?.url ? (site.url + site.logo) : "https://tongxing.org.tw/img/logo.png",
            "description": site?.description || data.description || "台北市同心華德福實驗教育機構位於深坑，提供 1-9 年級完整的華德福九年一貫學制。",
            "address": {
                "@type": "PostalAddress",
                "streetAddress": site?.address?.streetAddress || "北深路三段152號 (東南科技大學校區)",
                "addressLocality": site?.address?.addressLocality || "深坑區",
                "addressRegion": site?.address?.addressRegion || "新北市",
                "postalCode": site?.address?.postalCode || "222",
                "addressCountry": site?.address?.addressCountry || "TW"
            },
            "sameAs": site?.socialLinks ? Object.values(site.socialLinks).filter(link => !!link) : [
                "https://facebook.com/taipeiwaldorf/",
                "https://instagram.com/taipeiwaldorf/",
                "https://www.youtube.com/@taipeiwaldorf"
            ],
            "contactPoint": {
                "@type": "ContactPoint",
                "telephone": site?.contact?.telephone || "+886-2-8662-7200",
                "contactType": "customer service"
            }
        };
    } else if (type === 'FAQPage' && Array.isArray(data)) {
        schema = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": data.map((faq: FaqItem) => ({
                "@type": "Question",
                "name": faq.title,
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": faq.content
                }
            }))
        };
    } else if (type === 'Course') {
        schema = {
            "@context": "https://schema.org",
            "@type": "Course",
            "name": data.title,
            "description": data.content || data.description || data.seo?.description,
            "provider": {
                "@type": "EducationalOrganization",
                "name": site?.name || "台北市同心華德福實驗教育機構",
                "sameAs": site?.url || "https://tongxing.org.tw"
            }
        };
    }

    if (!schema) return null;

    return (
        <Head>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
        </Head>
    );
}
