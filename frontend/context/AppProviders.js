import { NetworkProvider } from './NetworkContext';
import { ProfileProvider } from './ProfileContext';
import { ProgressProvider } from './ProgressContext';
import { VocabularyProvider } from './VocabularyContext';
import { SentenceProvider } from './SentenceContext';
import { UserReelsProvider } from './UserReelsContext';
import { VibrationProvider } from './VibrationContext';
import { ReminderProvider } from './ReminderContext';
import { AuthProvider } from './AuthContext';

/**
 * Composes the app's domain contexts. AuthProvider must stay innermost —
 * it reads loaded-state from every other provider to gate initApp/useBackendSync.
 * The other six are independent leaves and can nest in any order.
 */
export const AppProviders = ({ children }) => (
  <NetworkProvider>
    <ProfileProvider>
      <ProgressProvider>
        <VocabularyProvider>
          <SentenceProvider>
            <UserReelsProvider>
              <VibrationProvider>
                <ReminderProvider>
                  <AuthProvider>{children}</AuthProvider>
                </ReminderProvider>
              </VibrationProvider>
            </UserReelsProvider>
          </SentenceProvider>
        </VocabularyProvider>
      </ProgressProvider>
    </ProfileProvider>
  </NetworkProvider>
);
