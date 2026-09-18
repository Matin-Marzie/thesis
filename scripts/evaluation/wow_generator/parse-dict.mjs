// Parses the seeded SQL word-list dumps into plain {id, written_form} arrays
// per language, so the benchmark drives the real generator with real content
// instead of synthetic word lists.
import fs from 'node:fs';

// Matches one VALUES tuple, e.g.: (100917, 'αγαθό', 'n', NULL, NULL, 2, 'A2', NULL)
const ROW_RE = /\(\s*(\d+)\s*,\s*'((?:[^'\\]|\\.)*)'/g;

export function parseWordFile(filePath) {
    const sql = fs.readFileSync(filePath, 'utf8');
    const out = [];
    let m;
    while ((m = ROW_RE.exec(sql)) !== null) {
        const id = Number(m[1]);
        let form = m[2].replace(/\\'/g, "'");
        // Some rows store comma-separated synonyms ("αδελφός, αδελφή"); take the first.
        form = form.split(',')[0].trim();
        out.push({ id, written_form: form });
    }
    return out;
}
