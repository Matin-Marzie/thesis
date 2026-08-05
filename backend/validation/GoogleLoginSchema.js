import UserProfileSchema from './UserProfileSchema.js';
import UserProgressSchema from './UserProgressSchema.js';
import GoogleTokenSchema from './GoogleTokenSchema.js';
import VocabularyChangesSchema from './VocabularyChangesSchema.js';

// user_profile/user_progress/vocabulary_changes are optional here, unlike
// registration - present only when the client is merging local guest
// progress into this account on login (see mergeGuestProgress.js).
// vocabulary_changes (not the full user_vocabulary) - the full vocabulary
// can easily be thousands of words and blow past Express's JSON body size
// limit, while the tracked changes are small by construction.
const GoogleLoginSchema = GoogleTokenSchema.keys({
  user_profile: UserProfileSchema.keys({
    age: UserProfileSchema.extract('age').optional(),
    preferences: UserProfileSchema.extract('preferences').optional(),
    notifications: UserProfileSchema.extract('notifications').optional(),
  }).optional(),
  user_progress: UserProgressSchema.keys({
    energy: UserProgressSchema.extract('energy').optional(),
    coins: UserProgressSchema.extract('coins').optional(),
    languages: UserProgressSchema.extract('languages').optional(),
  }).optional(),
  vocabulary_changes: VocabularyChangesSchema,
}).options({ stripUnknown: true });

export default GoogleLoginSchema;
