import { CDN_URL } from '@/config/api.config';

// The DB stores our own media (reel videos/thumbnails, profile pictures) as
// a path only, e.g. '/static/uploads/reels/226/foo.mp4' - this builds the
// full CDN URL. Values that are already absolute (e.g. a Google-linked
// profile picture) are left untouched.
export const getMediaUrl = (path?: string | null): string | undefined => {
  if (!path) return path ?? undefined;
  if (/^https?:\/\//.test(path)) return path;
  return `${CDN_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};
