import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const settingsDirectory = path.join(process.cwd(), 'src/data/settings');

export function getNavigation() {
    const fullPath = path.join(settingsDirectory, 'navigation.yml');
    if (!fs.existsSync(fullPath)) {
        return { items: [] };
    }
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    return yaml.load(fileContents) || { items: [] };
}
