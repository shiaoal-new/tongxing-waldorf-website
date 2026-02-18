import fs from 'fs';
import path from 'path';
import yaml, { Type } from 'js-yaml';

// Define the !include custom type
const createIncludeType = (basePath: string) => {
    return new Type('!include', {
        kind: 'scalar',
        construct: (data: string) => {
            const fullPath = path.isAbsolute(data) ? data : path.join(basePath, data);
            if (!fs.existsSync(fullPath)) {
                console.warn(`Included file not found: ${fullPath}`);
                return null;
            }
            return loadYamlWithIncludes(fullPath);
        }
    });
};

/**
 * Load a YAML file and handle !include tags recursively.
 * @param fullPath Absolute path to the YAML file
 * @returns Parsed object
 */
export function loadYamlWithIncludes(fullPath: string): any {
    if (!fs.existsSync(fullPath)) return {};
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const basePath = path.dirname(fullPath);
    // js-yaml v4 uses DEFAULT_SCHEMA.extend instead of Schema.create
    const schema = yaml.DEFAULT_SCHEMA.extend([createIncludeType(basePath)]);
    const data = yaml.load(fileContents, { schema }) || {};

    // Inject source file path for debugging/locator (non-enumerable)
    if (data && typeof data === 'object') {
        Object.defineProperty(data, '_sourceFile', {
            value: fullPath,
            enumerable: true,
            configurable: true
        });
    }

    return data;
}
