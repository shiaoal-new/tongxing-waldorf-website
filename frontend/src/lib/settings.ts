import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { NavigationData } from '../types/content';

const settingsDirectory = path.join(process.cwd(), 'src/data/settings');

export function getNavigation(): NavigationData {
    const fullPath = path.join(settingsDirectory, 'navigation.yml');
    if (!fs.existsSync(fullPath)) {
        return { items: [] };
    }
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    return (yaml.load(fileContents) as NavigationData) || { items: [] };
}
