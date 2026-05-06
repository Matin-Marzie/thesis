// Strips Arabic tashkeel (harakat, U+0610–U+061A and U+064B–U+065F) so that
// bare-consonant queries match fully-vowelled text, and vice versa.
export function normalizeQuery(text: string): string {
  return text.trim().toLowerCase().replace(/[ؐ-ًؚ-ٟ]/g, '');
}
