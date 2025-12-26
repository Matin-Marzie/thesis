export interface User {
  id?: string;
  username?: string;
  email?: string;
  displayName?: string;
  [key: string]: any;
}

export interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (hasCompletedOnboarding: boolean) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  isOnline: boolean;
  checkAuthStatus: () => Promise<void>;
  login: (userData: User, accessToken: string, refreshToken?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  dictionary: any[];
  setDictionary: (dictionary: any[]) => void;
}

export const AppProvider: React.FC<{ children: React.ReactNode }>;
export function useAppContext(): AppContextType;
export default AppContextType;
