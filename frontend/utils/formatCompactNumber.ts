export function formatCompactNumber(input: unknown): string {
    const n = typeof input === 'number' ? input : Number(input);

    if (!Number.isFinite(n)) return '0';

    const sign = n < 0 ? '-' : '';
    const abs = Math.abs(n);

    if (abs < 1000) return sign + String(Math.trunc(abs));

    const units = [
        { value: 1e12, suffix: 'T' },
        { value: 1e9, suffix: 'B' },
        { value: 1e6, suffix: 'M' },
        { value: 1e3, suffix: 'K' },
    ];

    const unit = units.find(u => abs >= u.value) ?? units[units.length - 1];
    const base = abs / unit.value;

    // Examples:
    // 1,000  -> 1K
    // 1,900  -> 1.9K
    // 109,887 -> 109K
    // 1,000,000 -> 1M
    const decimals = base < 10 ? 1 : 0;
    const factor = 10 ** decimals;

    // Truncate (not round) to avoid 999.9K -> 1.0M jumps.
    const truncated = Math.floor(base * factor) / factor;

    const text = truncated
        .toFixed(decimals)
        .replace(/\.0$/, '');

    return `${sign}${text}${unit.suffix}`;
}
