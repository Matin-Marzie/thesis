// Matches the 11-char video ID out of the URL shapes YouTube actually hands
// out when sharing a link: watch?v=, youtu.be/, embed/, and shorts/ - each
// optionally followed by extra query params (?si=..., &t=30s, etc).
const YOUTUBE_ID_RE = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

export function extractYoutubeVideoId(url: string): string | null {
  const match = url?.match(YOUTUBE_ID_RE);
  return match ? match[1] : null;
}
