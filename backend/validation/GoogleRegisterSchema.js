import UserProfileSchema from './UserProfileSchema.js';
import UserProgressSchema from './UserProgressSchema.js';
import GoogleTokenSchema from './GoogleTokenSchema.js';
import VocabularyChangesSchema from './VocabularyChangesSchema.js';
import SentenceChangesSchema from './SentenceChangesSchema.js';

// user_profile/user_progress are required here (unlike login) - creating a
// Google account needs the same onboarding data email registration does.
const GoogleRegisterSchema = GoogleTokenSchema.keys({
  user_profile: UserProfileSchema.keys({
    age: UserProfileSchema.extract('age').required(),
    preferences: UserProfileSchema.extract('preferences').optional(),
    joined_date: UserProfileSchema.extract('joined_date').required(),
    notifications: UserProfileSchema.extract('notifications').required(),
  }).required(),
  user_progress: UserProgressSchema.keys({
    energy: UserProgressSchema.extract('energy').required(),
    coins: UserProgressSchema.extract('coins').required(),
    languages: UserProgressSchema.extract('languages').required(),
  }).required(),
  // Words manually added/adjusted locally before registering (e.g. via
  // search) - words from the proficiency-level auto-seed are NOT tracked
  // here, only manual changes are (see bulkAddVocabulary in VocabularyContext.js)
  vocabulary_changes: VocabularyChangesSchema,
  sentence_changes: SentenceChangesSchema,
}).options({ stripUnknown: true });

export default GoogleRegisterSchema;
