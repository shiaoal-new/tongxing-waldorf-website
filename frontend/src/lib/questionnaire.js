import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const questionnairesDirectory = path.join(process.cwd(), 'src/data/Questionnaire');

export function getQuestionnaireBySlug(slug) {
    try {
        const fullPath = path.join(questionnairesDirectory, `${slug}.yml`);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const data = yaml.load(fileContents);
        return { ...data, slug };
    } catch (error) {
        console.error(`Error loading questionnaire ${slug}:`, error);
        return null;
    }
}

export function getAllQuestionnaires() {
    try {
        const fileNames = fs.readdirSync(questionnairesDirectory);
        return fileNames
            .filter(fileName => fileName.endsWith('.yml') || fileName.endsWith('.yaml'))
            .map(fileName => {
                const slug = fileName.replace(/\.(yml|yaml)$/, '');
                return getQuestionnaireBySlug(slug);
            })
            .filter(Boolean);
    } catch (error) {
        console.error('Error loading questionnaires:', error);
        return [];
    }
}
