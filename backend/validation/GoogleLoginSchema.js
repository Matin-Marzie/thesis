import UserProfileSchema from './UserProfileSchema.js';
import UserProgressSchema from './UserProgressSchema.js';
import UserVocabularySchema from './UserVocabularySchema.js';
import GoogleTokenSchema from './GoogleTokenSchema.js';

// user_profile/user_progress/user_vocabulary are optional here, unlike
// registration - present only when the client is merging local guest
// progress into this account on login (see mergeGuestProgress.js)
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
  user_vocabulary: UserVocabularySchema.optional(),
}).options({ stripUnknown: true });

export default GoogleLoginSchema;
