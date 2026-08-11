import { API_BASE_URL } from '@/config/api.config';

// Reel media URLs are built server-side against 'localhost' (see
// reelController.js), which only resolves on the machine running the
// backend - on a physical device/simulator it must be swapped for the
// same host the app already talks to for API requests.
export const fixMediaUrl = (url?: string | null): string | undefined => {
  if (!url) return url ?? undefined;
  const apiHost = API_BASE_URL.match(/https?:\/\/([^:/]+)/)?.[1];
  if (apiHost && url.includes('localhost')) {
    return url.replace('localhost', apiHost);
  }
  return url;
};
