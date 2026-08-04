import { NetworkProvider } from './NetworkContext';
import { ProfileProvider } from './ProfileContext';
import { ProgressProvider } from './ProgressContext';
import { VocabularyProvider } from './VocabularyContext';
import { VibrationProvider } from './VibrationContext';
import { AuthProvider } from './AuthContext';

/**
 * Composes the app's domain contexts. AuthProvider must stay innermost —
 * it reads loaded-state from every other provider to gate initApp/useBackendSync.
 * The other five are independent leaves and can nest in any order.
 */
export const AppProviders = ({ children }) => (
  <NetworkProvider>
    <ProfileProvider>
      <ProgressProvider>
        <VocabularyProvider>
          <VibrationProvider>
            <AuthProvider>{children}</AuthProvider>
          </VibrationProvider>
        </VocabularyProvider>
      </ProgressProvider>
    </ProfileProvider>
  </NetworkProvider>
);
