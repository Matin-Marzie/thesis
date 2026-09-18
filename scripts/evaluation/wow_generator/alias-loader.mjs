// Minimal Node ESM loader that resolves the "@/..." alias used by the
// frontend's tsconfig/metro config to the frontend project root, so the
// real, unmodified LevelGenerator.js can be imported by plain Node.
import { pathToFileURL } from 'node:url';
import path from 'node:path';

const FRONTEND_ROOT = process.env.WOW_FRONTEND_ROOT;

export async function resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('@/')) {
        const rel = specifier.slice(2);
        const abs = path.join(FRONTEND_ROOT, rel);
        specifier = pathToFileURL(abs).href;
    }
    // Bundler-style relative imports omit the extension (e.g. "./languageUtils");
    // Node's ESM resolver requires one, so retry with .js appended on failure.
    try {
        return await nextResolve(specifier, context);
    } catch (err) {
        if (err.code === 'ERR_MODULE_NOT_FOUND' && (specifier.startsWith('.') || specifier.startsWith('file:'))) {
            return nextResolve(specifier + '.js', context);
        }
        throw err;
    }
}
