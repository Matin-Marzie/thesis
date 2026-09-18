import { parseWordFile } from './parse-dict.mjs';
import { pathToFileURL } from 'node:url';

const FRONTEND = process.env.WOW_FRONTEND_ROOT;
const { default: GenerateWordOfWonderLevel } = await import(
    pathToFileURL(`${FRONTEND}/components/games/WordOfWonders/LevelGenerator.js`).href
);

const DB = '/home/matin/ionian_university/thesis/database/words';
const DICTS = {
    en: parseWordFile(`${DB}/english/dictionary.sql`),
    el: parseWordFile(`${DB}/greek/dictionary.sql`),
    fa: parseWordFile(`${DB}/farsi/dictionary.sql`),
};

function sample(arr, n, rng) {
    const copy = [...arr];
    const out = [];
    for (let i = 0; i < n && copy.length; i++) {
        const idx = Math.floor(rng() * copy.length);
        out.push(copy[idx]);
        copy.splice(idx, 1);
    }
    return out;
}

// Deterministic PRNG so the corpus sampling (which learner vocabulary was
// drawn) is reproducible across runs, independent of the generator's own
// internal Math.random() calls (board start position, priority shuffle).
function mulberry32(seed) {
    return function () {
        seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

const VOCAB_SIZES = [10, 100, 500, 1000, 3000, 6000, 10000];
const REPS = 200;
const LANGS = ['en', 'el', 'fa'];

const TOTAL_TRIALS = LANGS.reduce((sum, lang) =>
    sum + VOCAB_SIZES.filter((v) => v <= DICTS[lang].length).length * REPS, 0);
let completed = 0;

// Progress goes to stderr so it never mixes into the CSV written to stdout.
function reportProgress() {
    const pct = ((completed / TOTAL_TRIALS) * 100).toFixed(1);
    process.stderr.write(`\rProgress: ${completed}/${TOTAL_TRIALS} (${pct}%)`);
}

const rows = [];

for (const lang of LANGS) {
    const dict = DICTS[lang];
    for (const vocabSize of VOCAB_SIZES) {
        if (vocabSize > dict.length) continue;
        for (let rep = 0; rep < REPS; rep++) {
            const rng = mulberry32(vocabSize * 1000003 + rep + lang.charCodeAt(0) * 97);
            const vocab = sample(dict, vocabSize, rng);
            const dueWordId = vocab[Math.floor(rng() * vocab.length)].id;

            const t0 = performance.now();
            let result, error = null;
            try {
                result = GenerateWordOfWonderLevel(vocab, lang, dueWordId);
            } catch (e) {
                error = e.message;
            }
            const elapsedMs = performance.now() - t0;

            completed++;
            if (completed % 20 === 0 || completed === TOTAL_TRIALS) reportProgress();

            if (error) {
                rows.push({ lang, vocabSize, rep, error, wordsPlaced: 0, elapsedMs, boardCells: 0, filledCells: 0, reviewWordPlaced: false });
                continue;
            }

            const [board, gridWords, letters, reviewWordId] = result;
            const wordsPlaced = Object.keys(gridWords).length;
            const boardCells = board.length * (board[0]?.length ?? 0);
            const filledCells = board.flat().reduce((a, c) => a + c, 0);
            const reviewWordPlaced = reviewWordId === dueWordId;

            rows.push({
                lang, vocabSize, rep,
                error: '',
                wordsPlaced,
                elapsedMs: Number(elapsedMs.toFixed(3)),
                boardRows: board.length,
                boardCols: board[0]?.length ?? 0,
                boardCells,
                filledCells,
                letterCount: letters.length,
                reviewWordPlaced,
            });
        }
    }
}

process.stderr.write('\n');

// CSV output
const cols = ['lang','vocabSize','rep','error','wordsPlaced','elapsedMs','boardRows','boardCols','boardCells','filledCells','letterCount','reviewWordPlaced'];
console.log(cols.join(','));
for (const r of rows) {
    console.log(cols.map(c => r[c] ?? '').join(','));
}
