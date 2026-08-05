import usersModel from '../models/usersModel.js';
import userLanguagesModel from '../models/userLanguagesModel.js';
import userVocabularyModel from '../models/userVocabularyModel.js';

const PROFICIENCY_LEVELS = ['N', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const higherProficiency = (a, b) => {
  const ia = PROFICIENCY_LEVELS.indexOf(a);
  const ib = PROFICIENCY_LEVELS.indexOf(b);
  return ia >= ib ? a : b;
};

/**
 * Merges a guest's locally-accumulated progress into an existing account on
 * login. Rules:
 * - profile: age/preferences/notifications come from the local (guest) side
 * - coins/energy: the higher of local vs account is kept
 * - languages: local pairs not already on the account are added; for a pair
 *   that exists on both sides, experience/proficiency_level take the higher
 *   value. Whichever language was current on the device becomes the
 *   account's current language too, since that's what the login response
 *   (and the app right after login) actually shows vocabulary for - leaving
 *   it non-current would silently hide everything just merged into it
 * - vocabulary: merged word-by-word, higher mastery_level wins. Only
 *   applies to the guest's current local language, since that's the only
 *   language local vocabulary data is scoped to
 *
 * @param {number} userId
 * @param {{ user_profile?: object, user_progress?: object, user_vocabulary?: object }} guestData
 * @param {Array} accountLanguages - the account's user_languages rows, fetched before merging
 * @returns {Promise<object|null>} the updated user row if profile/coins/energy changed, else null
 */
const mergeGuestProgress = async (userId, { user_profile, user_progress, user_vocabulary }, accountLanguages) => {
  // --- Profile + coins/energy ---
  const profileUpdates = {};

  if (user_profile) {
    if (user_profile.age !== undefined) profileUpdates.age = user_profile.age;
    if (user_profile.preferences !== undefined) profileUpdates.preferences = user_profile.preferences;
    if (user_profile.notifications !== undefined) profileUpdates.notifications = user_profile.notifications;
  }

  if (user_progress && (user_progress.energy !== undefined || user_progress.coins !== undefined)) {
    const account = await usersModel.get(userId);
    if (user_progress.energy !== undefined) {
      profileUpdates.energy = Math.max(user_progress.energy, account.energy);
    }
    if (user_progress.coins !== undefined) {
      profileUpdates.coins = Math.max(user_progress.coins, account.coins);
    }
  }

  let updatedUser = null;
  if (Object.keys(profileUpdates).length > 0) {
    updatedUser = await usersModel.updateProfile(userId, profileUpdates);
  }

  // --- Languages + vocabulary ---
  const localLanguages = user_progress?.languages ?? [];
  if (localLanguages.length > 0) {
    const localCurrentLanguage = localLanguages.find((l) => l.is_current_language) ?? localLanguages[0];
    let localCurrentLanguagesId = null;

    for (const localLang of localLanguages) {
      // Coerce both sides to Number before comparing - Postgres/node-pg
      // returns integer id columns as strings, while the client sends them
      // as JS numbers, so a strict === here always misses the match and
      // inserts a duplicate language pair instead of merging into it.
      const matched = accountLanguages.find(
        (al) => Number(al.native_language.id) === Number(localLang.native_language.id)
             && Number(al.learning_language.id) === Number(localLang.learning_language.id)
      );

      // Local vocabulary is only scoped to the guest's current local
      // language - there's nothing to merge for any other local pair.
      const isLocalCurrent = localLang === localCurrentLanguage;
      const localVocabForThisPair = isLocalCurrent ? (user_vocabulary || {}) : {};
      const localWordIds = Object.keys(localVocabForThisPair);

      let userLanguagesId;

      if (matched) {
        userLanguagesId = matched.id;

        const newExperience = Math.max(localLang.experience ?? 0, matched.experience ?? 0);
        const newProficiency = higherProficiency(localLang.proficiency_level, matched.proficiency_level);

        if (newExperience !== matched.experience || newProficiency !== matched.proficiency_level) {
          await userLanguagesModel.updateProgress(matched.id, {
            experience: newExperience,
            proficiency_level: newProficiency,
          });
        }
      } else {
        // New language pair for this account - insert it (not current yet;
        // whether it becomes current is decided once, after the loop).
        const [inserted] = await userLanguagesModel.add(userId, [{
          ...localLang,
          is_current_language: false,
        }]);
        userLanguagesId = inserted.id;
      }

      if (isLocalCurrent) {
        localCurrentLanguagesId = userLanguagesId;
      }

      if (localWordIds.length > 0) {
        const accountVocab = matched
          ? await userVocabularyModel.get(userId, userLanguagesId)
          : {};

        const toInsert = [];
        const toUpdate = {};

        for (const wordId of localWordIds) {
          const localWord = localVocabForThisPair[wordId];
          const accountWord = accountVocab[wordId];

          if (!accountWord) {
            toInsert.push([wordId, localWord]);
          } else if (localWord.mastery_level > accountWord.mastery_level) {
            toUpdate[wordId] = localWord;
          }
          // else: the account's word already has an equal or higher mastery_level - keep it
        }

        if (toInsert.length > 0) {
          await userVocabularyModel.add(userId, toInsert, userLanguagesId);
        }
        if (Object.keys(toUpdate).length > 0) {
          await userVocabularyModel.update(userId, userLanguagesId, toUpdate);
        }
      }
    }

    // Make the device's active language current on the account too - only
    // if it isn't already, to avoid an unnecessary write.
    const wasAlreadyCurrent = accountLanguages.some(
      (al) => al.id === localCurrentLanguagesId && al.is_current_language
    );
    if (localCurrentLanguagesId !== null && !wasAlreadyCurrent) {
      await userLanguagesModel.setCurrent(userId, localCurrentLanguagesId);
    }
  }

  return updatedUser;
};

export default mergeGuestProgress;
