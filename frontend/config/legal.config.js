// Legal/acknowledgment page URLs.
//
// Kept out of api.config.js on purpose: that file has git's skip-worktree
// bit set (so each developer's local ip_addr doesn't show up as a dirty
// diff), which means anything added there is invisible to git and would
// never actually be committed. Deriving the origin from API_BASE_URL still
// tracks whatever host the app is currently pointed at.
import { API_BASE_URL } from './api.config';

const API_ORIGIN = API_BASE_URL.replace(/\/api\/v1$/, '');

export const PRIVACY_POLICY_URL = `${API_ORIGIN}/static/legal/privacy-policy.html`;
export const TERMS_OF_USE_URL = `${API_ORIGIN}/static/legal/terms-of-use.html`;
export const OSS_LICENSES_URL = `${API_ORIGIN}/static/legal/licenses.html`;

export default {
  PRIVACY_POLICY_URL,
  TERMS_OF_USE_URL,
  OSS_LICENSES_URL,
};
