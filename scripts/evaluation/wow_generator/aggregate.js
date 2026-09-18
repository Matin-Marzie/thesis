// Aggregates results.csv (raw per-trial rows from benchmark.mjs) into
// per-(language, vocabSize) summary statistics, written to summary.csv.
//
//   node aggregate.js
//
const fs = require('fs');

const lines = fs.readFileSync('results.csv', 'utf8').trim().split('\n');
const header = lines[0].split(',');
const rows = lines.slice(1).map((l) => {
    const parts = l.split(',');
    const o = {};
    header.forEach((h, i) => (o[h] = parts[i]));
    return o;
});

const groups = {};
for (const r of rows) {
    const key = r.lang + '_' + r.vocabSize;
    (groups[key] ??= []).push(r);
}

const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const std = (a) => {
    const m = mean(a);
    return Math.sqrt(mean(a.map((x) => (x - m) ** 2)));
};

const outLines = [
    'lang,vocabSize,n,meanWordsPlaced,stdWordsPlaced,meanElapsedMs,stdElapsedMs,p95ElapsedMs,errorPct',
];

for (const key of Object.keys(groups).sort()) {
    const g = groups[key];
    const [lang, vocabSize] = key.split('_');
    const wp = g.map((r) => Number(r.wordsPlaced));
    const el = g.map((r) => Number(r.elapsedMs));
    const elSorted = [...el].sort((a, b) => a - b);
    const errPct = (g.filter((r) => r.error !== '').length / g.length) * 100;
    const p95 = elSorted[Math.floor(elSorted.length * 0.95)];

    outLines.push(
        [
            lang,
            vocabSize,
            g.length,
            mean(wp).toFixed(2),
            std(wp).toFixed(2),
            mean(el).toFixed(3),
            std(el).toFixed(3),
            p95.toFixed(3),
            errPct.toFixed(1),
        ].join(',')
    );
}

fs.writeFileSync('summary.csv', outLines.join('\n') + '\n');
console.log(outLines.join('\n'));
