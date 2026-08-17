import usersModel from '../models/usersModel.js';
import userLanguagesModel from '../models/userLanguagesModel.js';
import userVocabularyModel from '../models/userVocabularyModel.js';
import userSentencesModel from '../models/userSentencesModel.js';

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
 * - vocabulary: only the guest's manually-tracked vocabulary_changes
 *   (inserts/updates) are ever sent, not the full local vocabulary
 *   and it's only scoped to the guest's current local language anyway.
 *     - if the matched account pair's proficiency_level is the SAME as the
 *       local one: merge word-by-word, higher mastery_level wins
 *     - otherwise (levels differ, or the pair is brand new to the account):
 *       apply the local changes outright (no comparison), and backfill the
 *       vocabulary gap with the same proficiency-level auto-seed
 *       registration uses, so the account's proficiency_level and its
 *       actual known words stay consistent with each other. For an
 *       existing pair this seeds only the gap between the account's old
 *       level and the new (higher of local/account) one; for a brand new
 *       pair it seeds everything below the local level, same as a fresh
 *       registration would.
 * - sentences: same word-by-word merge rule as vocabulary (only the guest's
 *   manually-tracked sentence_changes inserts/updates, higher mastery_level
 *   wins when levels matched going in). Unlike vocabulary there is no
 *   proficiency-based backfill step - sentences has no level column, so
 *   there is nothing to seed regardless of whether levelsAreSame.
 *
 * @param {number} userId
 * @param {{ user_profile?: object, user_progress?: object, vocabulary_changes?: { inserts?: object, updates?: object }, sentence_changes?: { inserts?: object, updates?: object } }} guestData
 * @param {Array} accountLanguages - the account's user_languages rows, fetched before merging
 * @returns {Promise<object|null>} the updated user row if profile/coins/energy changed, else null
 */
const mergeGuestProgress = async (userId, { user_profile, user_progress, vocabulary_changes, sentence_changes }, accountLanguages) => {
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

    // Manually-tracked local vocabulary changes (inserts + updates) - not
    // the full vocabulary. Deletes aren't relevant here: the account has
    // its own copy of any word the guest removed locally, and there's
    // nothing to reconcile for a word that's gone on both sides.
    const localWordChanges = {
      ...(vocabulary_changes?.inserts || {}),
      ...(vocabulary_changes?.updates || {}),
    };

    // Same reasoning as localWordChanges, for sentences.
    const localSentenceChanges = {
      ...(sentence_changes?.inserts || {}),
      ...(sentence_changes?.updates || {}),
    };

    for (const localLang of localLanguages) {
      // Coerce both sides to Number before comparing - Postgres/node-pg
      // returns integer id columns as strings, while the client sends them
      // as JS numbers, so a strict === here always misses the match and
      // inserts a duplicate language pair instead of merging into it.
      const matched = accountLanguages.find(
        (al) => Number(al.native_language.id) === Number(localLang.native_language.id)
             && Number(al.learning_language.id) === Number(localLang.learning_language.id)
      );

      // Local vocabulary changes are only scoped to the guest's current
      // local language - there's nothing to merge for any other local pair.
      const isLocalCurrent = localLang === localCurrentLanguage;
      const localWordIds = isLocalCurrent ? Object.keys(localWordChanges) : [];
      const localSentenceIds = isLocalCurrent ? Object.keys(localSentenceChanges) : [];

      let userLanguagesId;
      let levelsAreSame = false;
      let seedFrom = null;
      let seedUntil = null;

      if (matched) {
        userLanguagesId = matched.id;
        levelsAreSame = localLang.proficiency_level === matched.proficiency_level;

        const newExperience = Math.max(localLang.experience ?? 0, matched.experience ?? 0);
        const newProficiency = higherProficiency(localLang.proficiency_level, matched.proficiency_level);

        if (newExperience !== matched.experience || newProficiency !== matched.proficiency_level) {
          await userLanguagesModel.updateProgress(matched.id, {
            experience: newExperience,
            proficiency_level: newProficiency,
          });
        }

        if (!levelsAreSame) {
          // Backfill the gap between the account's old level and the new
          // (higher of local/account) one - a no-op if the account was
          // already the higher side, since there'd be no gap.
          seedFrom = matched.proficiency_level;
          seedUntil = newProficiency;
        }
      } else {
        // New language pair for this account - insert it (not current yet;
        // whether it becomes current is decided once, after the loop), and
        // seed its vocabulary from scratch, same as a fresh registration
        // for this language would.
        const [inserted] = await userLanguagesModel.add(userId, [{
          ...localLang,
          is_current_language: false,
        }]);
        userLanguagesId = inserted.id;
        seedFrom = 'N';
        seedUntil = localLang.proficiency_level;
      }

      if (isLocalCurrent) {
        localCurrentLanguagesId = userLanguagesId;
      }

      if (seedUntil) {
        await userVocabularyModel.addByProficiencyLevel(
          userId,
          userLanguagesId,
          localLang.learning_language.id,
          seedUntil,
          new Date().toISOString(),
          seedFrom
        );
      }

      if (localWordIds.length > 0) {
        // Re-fetch so the auto-seed above (if any) is reflected - avoids
        // trying to insert a word that was just seeded a second time.
        const accountVocab = await userVocabularyModel.get(userId, userLanguagesId);

        const toInsert = [];
        const toUpdate = {};

        for (const wordId of localWordIds) {
          const localWord = localWordChanges[wordId];
          // An update entry can carry only last_review with no
          // mastery_level - nothing meaningful to compare or insert then.
          if (localWord.mastery_level === undefined) continue;

          const accountWord = accountVocab[wordId];

          if (!accountWord) {
            toInsert.push([wordId, {
              mastery_level: localWord.mastery_level,
              last_review: localWord.last_review ?? null,
              created_at: localWord.created_at ?? localWord.last_review ?? new Date().toISOString(),
            }]);
          } else if (!levelsAreSame || localWord.mastery_level > accountWord.mastery_level) {
            // Levels matched going in: only take the local value if it's
            // actually better. Levels differed (or this is a new pair):
            // trust the local session's tracked changes outright.
            toUpdate[wordId] = { mastery_level: localWord.mastery_level, last_review: localWord.last_review };
          }
        }

        if (toInsert.length > 0) {
          await userVocabularyModel.add(userId, toInsert, userLanguagesId);
        }
        if (Object.keys(toUpdate).length > 0) {
          await userVocabularyModel.update(userId, userLanguagesId, toUpdate);
        }
      }

      if (localSentenceIds.length > 0) {
        // Re-fetch so a sentence saved both locally and on the account is
        // compared against its current server-side mastery_level.
        const accountSentences = await userSentencesModel.get(userId, userLanguagesId);

        const sentencesToInsert = [];
        const sentencesToUpdate = {};

        for (const sentenceId of localSentenceIds) {
          const localSentence = localSentenceChanges[sentenceId];
          // An update entry can carry only last_review with no
          // mastery_level - nothing meaningful to compare or insert then.
          if (localSentence.mastery_level === undefined) continue;

          const accountSentence = accountSentences[sentenceId];

          if (!accountSentence) {
            sentencesToInsert.push([sentenceId, {
              mastery_level: localSentence.mastery_level,
              last_review: localSentence.last_review ?? null,
              created_at: localSentence.created_at ?? localSentence.last_review ?? new Date().toISOString(),
            }]);
          } else if (!levelsAreSame || localSentence.mastery_level > accountSentence.mastery_level) {
            // Levels matched going in: only take the local value if it's
            // actually better. Levels differed (or this is a new pair):
            // trust the local session's tracked changes outright.
            sentencesToUpdate[sentenceId] = { mastery_level: localSentence.mastery_level, last_review: localSentence.last_review };
          }
        }

        if (sentencesToInsert.length > 0) {
          await userSentencesModel.add(userId, sentencesToInsert, userLanguagesId);
        }
        if (Object.keys(sentencesToUpdate).length > 0) {
          await userSentencesModel.update(userId, userLanguagesId, sentencesToUpdate);
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
