import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiRequest, setToken, loadToken, getToken } from '@/lib/query-client';

export type PlanType = 'free' | 'premium_10' | 'premium_30';

export interface UserData {
  id: string;
  username: string;
  role: string;
  plan: PlanType;
  fullName: string | null;
  email: string | null;
  licenseType: string;
  planExpiry: string | null;
}

export interface ExamResult {
  id: string;
  date: number;
  examMode: string;
  licenseType: string;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  passed: boolean;
  categoryBreakdown: Record<string, { correct: number; total: number }>;
}

interface UserContextValue {
  user: UserData | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isPremium: boolean;
  canTakeExam: boolean;
  freeExamsUsed: number;
  freeExamsRemaining: number;
  licenseType: string;
  loading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, password: string, fullName?: string, email?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  setLicenseType: (type: string) => void;
  incrementFreeExams: () => void;
  refreshUser: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [freeExamsUsed, setFreeExamsUsed] = useState(0);
  const [licenseType, setLicenseTypeState] = useState('clase_b');

  useEffect(() => {
    async function init() {
      try {
        await loadToken();
        const savedLicense = await AsyncStorage.getItem('@practiquemos_license');
        if (savedLicense) setLicenseTypeState(savedLicense);
        const savedFree = await AsyncStorage.getItem('@practiquemos_free_exams');
        if (savedFree) setFreeExamsUsed(parseInt(savedFree, 10));

        const token = getToken();
        if (token) {
          try {
            const timeoutPromise = new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('timeout')), 4000)
            );
            const res = await Promise.race([
              apiRequest('GET', '/api/auth/me'),
              timeoutPromise,
            ]);
            const userData = await res.json();
            setUser(userData);
            if (userData.licenseType) setLicenseTypeState(userData.licenseType);
          } catch {
            await setToken(null);
          }
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    try {
      const res = await apiRequest('POST', '/api/auth/login', { username, password });
      const data = await res.json();
      await setToken(data.token);
      setUser(data.user);
      if (data.user.licenseType) {
        setLicenseTypeState(data.user.licenseType);
      }
      return { success: true };
    } catch (err: any) {
      const msg = err.message?.includes('401') ? 'Usuario o contraseña incorrectos' : 'Error al iniciar sesión';
      return { success: false, error: msg };
    }
  }, []);

  const register = useCallback(async (username: string, password: string, fullName?: string, email?: string) => {
    try {
      const res = await apiRequest('POST', '/api/auth/register', { username, password, fullName, email });
      const data = await res.json();
      await setToken(data.token);
      setUser(data.user);
      return { success: true };
    } catch (err: any) {
      let msg = 'Error al registrarse. Intenta de nuevo.';
      try {
        const data = await err.json?.();
        if (data?.message) msg = data.message;
      } catch {}
      return { success: false, error: msg };
    }
  }, []);

  const logout = useCallback(async () => {
    try { await apiRequest('POST', '/api/auth/logout'); } catch {}
    await setToken(null);
    setUser(null);
  }, []);

  const setLicenseType = useCallback((type: string) => {
    setLicenseTypeState(type);
    AsyncStorage.setItem('@practiquemos_license', type);
    if (user) {
      apiRequest('PUT', '/api/auth/profile', { licenseType: type }).catch(() => {});
    }
  }, [user]);

  const incrementFreeExams = useCallback(() => {
    setFreeExamsUsed(prev => {
      const next = prev + 1;
      AsyncStorage.setItem('@practiquemos_free_exams', next.toString());
      return next;
    });
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await apiRequest('GET', '/api/auth/me');
      const userData = await res.json();
      setUser(userData);
    } catch {}
  }, []);

  const isLoggedIn = !!user;
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';
  const isPremium = user?.plan !== 'free' && !!user?.plan;
  const FREE_EXAM_LIMIT = 3;
  const canTakeExam = isPremium || freeExamsUsed < FREE_EXAM_LIMIT;
  const freeExamsRemaining = Math.max(0, FREE_EXAM_LIMIT - freeExamsUsed);

  const value = useMemo(() => ({
    user,
    isLoggedIn,
    isAdmin,
    isPremium,
    canTakeExam,
    freeExamsUsed,
    freeExamsRemaining,
    licenseType,
    loading,
    login,
    register,
    logout,
    setLicenseType,
    incrementFreeExams,
    refreshUser,
  }), [user, isLoggedIn, isAdmin, isPremium, canTakeExam, freeExamsUsed, freeExamsRemaining, licenseType, loading, login, register, logout, setLicenseType, incrementFreeExams, refreshUser]);

  if (loading) return null;

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within UserProvider');
  return ctx;
}
