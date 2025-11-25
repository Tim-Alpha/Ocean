import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginResponse, ProfileResponse } from '../types/api';
import { UserProfile } from '../types/user';

const API_BASE_URL = 'https://api.socialverseapp.com';
const APP_NAME = 'empowerverse';
const STORAGE_KEYS = {
  USER: '@ocean:user',
  TOKEN: '@ocean:token',
  USER_ID: '@ocean:user_id',
};

interface AuthContextValue {
  user: UserProfile | null;
  authToken: string | null;
  loading: boolean;
  error: string | null;
  initializing: boolean;
  login: (mixed: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const normalizeLoginPayload = (
  payload: Partial<LoginResponse>,
  fallbackId?: string
): UserProfile => {
  return {
    user_id: String(payload?.id ?? fallbackId ?? ''),
    username: payload?.username ?? '',
    email: payload?.email ?? '',
    first_name: payload?.first_name ?? '',
    last_name: payload?.last_name ?? '',
    profile_image_url: payload?.profile_picture_url ?? '',
  };
};

const normalizeProfilePayload = (
  payload: Partial<ProfileResponse>,
  fallbackId?: string
): UserProfile => {
  return {
    user_id: String(payload?.id ?? fallbackId ?? ''),
    username: payload?.username ?? '',
    email: payload?.email ?? '',
    first_name: payload?.first_name ?? '',
    last_name: payload?.last_name ?? '',
    profile_image_url: payload?.profile_picture_url ?? '',
  };
};

const extractUserId = (payload: any): string | null => {
  if (!payload) return null;

  const candidates = [
    payload?.user_id,
    payload?.userId,
    payload?.id,
    payload?.data?.user_id,
    payload?.data?.userId,
    payload?.data?.id,
    payload?.user?.user_id,
    payload?.user?.id,
  ];

  const resolved = candidates.find(
    (value) => value !== undefined && value !== null && value !== ''
  );

  return typeof resolved === 'number' || typeof resolved === 'string'
    ? String(resolved)
    : null;
};

const extractToken = (payload: any): string | null => {
  if (!payload) return null;

  const candidates = [
    payload?.token,
    payload?.access_token,
    payload?.auth_token,
    payload?.data?.token,
    payload?.data?.access_token,
    payload?.data?.auth_token,
  ];

  const resolved = candidates.find(
    (value) => value !== undefined && value !== null && value !== ''
  );

  return typeof resolved === 'string' ? resolved : null;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initializing, setInitializing] = useState(true);

  const persistSession = useCallback(
    async (profile: UserProfile, id: string, token: string | null) => {
      try {
        await AsyncStorage.multiSet([
          [STORAGE_KEYS.USER, JSON.stringify(profile)],
          [STORAGE_KEYS.USER_ID, id],
          [STORAGE_KEYS.TOKEN, token ?? ''],
        ]);
      } catch (storageError) {
        console.warn('Failed to persist session', storageError);
      }
    },
    []
  );

  const clearSession = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.USER,
        STORAGE_KEYS.USER_ID,
        STORAGE_KEYS.TOKEN,
      ]);
    } catch (storageError) {
      console.warn('Failed to clear session', storageError);
    }
  }, []);

  const fetchProfile = useCallback(
    async (id: string, token?: string | null) => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
        headers['Flic-Token'] = token;
      }

      const response = await fetch(
        `${API_BASE_URL}/profile/${id}?app_name=${APP_NAME}`,
        {
          method: 'GET',
          headers,
        }
      );

      const json: unknown = await response.json();

      if (!response.ok) {
        const message =
          (json as { message?: string })?.message ?? 'Failed to fetch profile';
        throw new Error(message);
      }

      const payload: Partial<ProfileResponse> =
        (json as { data?: ProfileResponse })?.data ?? (json as ProfileResponse);
      const profile = normalizeProfilePayload(payload, id);
      setUser(profile);
      return profile;
    },
    []
  );

  const login = useCallback(
    async (mixed: string, password: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/user/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ mixed, password, app_name: APP_NAME }),
        });

        const json: LoginResponse = await response.json();

        if (!response.ok) {
          throw new Error(json?.status ?? 'Login failed');
        }

        const resolvedUserId = extractUserId(json) ?? String(json.id ?? '');

        if (!resolvedUserId) {
          throw new Error('User identifier missing in login response');
        }

        const token = extractToken(json);
        setAuthToken(token);
        setUserId(resolvedUserId);

        const provisionalProfile = normalizeLoginPayload(json, resolvedUserId);
        setUser(provisionalProfile);

        const profile = await fetchProfile(resolvedUserId, token);
        await persistSession(profile, resolvedUserId, token);
      } catch (err) {
        setUser(null);
        setAuthToken(null);
        setUserId(null);
        setError(err instanceof Error ? err.message : 'Unable to login');
        await clearSession();
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchProfile, persistSession, clearSession]
  );

  useEffect(() => {
    const hydrateSession = async () => {
      try {
        const [[, storedUser], [, storedUserId], [, storedToken]] =
          await AsyncStorage.multiGet([
            STORAGE_KEYS.USER,
            STORAGE_KEYS.USER_ID,
            STORAGE_KEYS.TOKEN,
          ]);

        const hasStoredSession = Boolean(storedUser && storedUserId);

        if (!hasStoredSession) {
          await clearSession();
          setUser(null);
          setUserId(null);
          setAuthToken(null);
          return;
        }

        const resolvedStoredUser = JSON.parse(storedUser as string);
        const resolvedStoredUserId = storedUserId as string;

        setUser(resolvedStoredUser);
        setUserId(resolvedStoredUserId);
        setAuthToken(storedToken || null);

        try {
          const freshProfile = await fetchProfile(
            resolvedStoredUserId,
            storedToken || null
          );
          await persistSession(
            freshProfile,
            resolvedStoredUserId,
            storedToken || null
          );
        } catch (err) {
          console.warn('Failed to refresh profile on launch', err);
        }
      } catch (err) {
        console.warn('Failed to hydrate auth session', err);
        await clearSession();
        setUser(null);
        setUserId(null);
        setAuthToken(null);
      } finally {
        setInitializing(false);
      }
    };

    hydrateSession();
  }, [fetchProfile, persistSession, clearSession]);

  const refreshProfile = useCallback(async () => {
    if (!userId) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const profile = await fetchProfile(userId, authToken);
      await persistSession(profile, userId, authToken);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to refresh profile'
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId, authToken, fetchProfile, persistSession]);

  const logout = useCallback(() => {
    setUser(null);
    setAuthToken(null);
    setUserId(null);
    setError(null);
    clearSession();
  }, [clearSession]);

  const value = useMemo(
    () => ({
      user,
      authToken,
      loading,
      error,
      initializing,
      login,
      logout,
      refreshProfile,
    }),
    [user, authToken, loading, error, initializing, login, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};