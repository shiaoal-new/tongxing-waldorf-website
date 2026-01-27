import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { NavigationData, SiteData } from '../types/content';

const settingsDirectory = path.join(process.cwd(), 'src/data/settings');

export function getNavigation(): NavigationData {
    const fullPath = path.join(settingsDirectory, 'navigation.yml');
    if (!fs.existsSync(fullPath)) {
        return { items: [] };
    }
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    return (yaml.load(fileContents) as NavigationData) || { items: [] };
}

export function getSiteSettings(): SiteData {
    const fullPath = path.join(settingsDirectory, 'site-settings.yml');
    if (!fs.existsSync(fullPath)) {
        // Return default values as fallback
        return {
            name: "台北市同心華德福實驗教育機構",
            url: "https://tongxing.org.tw",
            logo: "/img/logo.png",
            description: "同心華德福為一所致力於實踐華德福教育理念的實驗教育機構。",
            address: {
                streetAddress: "北深路三段152號",
                addressLocality: "深坑區",
                addressRegion: "新北市",
                postalCode: "222",
                addressCountry: "TW"
            },
            contact: {
                telephone: "+886-2-8662-7200",
                email: ""
            },
            socialLinks: {}
        };
    }
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    return yaml.load(fileContents) as SiteData;
}
