import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type PlanType = 'free' | 'premium_10' | 'premium_30';

interface UserState {
  plan: PlanType;
  freeExamsUsed: number;
  examHistory: ExamResult[];
  premiumExpiry: number | null;
}

export interface ExamResult {
  id: string;
  date: number;
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  passed: boolean;
  categoryBreakdown: Record<string, { correct: number; total: number }>;
}

interface UserContextValue {
  plan: PlanType;
  freeExamsUsed: number;
  examHistory: ExamResult[];
  isPremium: boolean;
  canTakeExam: boolean;
  setPlan: (plan: PlanType) => void;
  incrementFreeExams: () => void;
  addExamResult: (result: ExamResult) => void;
  clearHistory: () => void;
}

const UserContext = createContext<UserContextValue | null>(null);

const STORAGE_KEY = '@practiquemos_user';

export function UserProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<UserState>({
    plan: 'free',
    freeExamsUsed: 0,
    examHistory: [],
    premiumExpiry: null,
  });
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(data => {
      if (data) {
        const parsed = JSON.parse(data) as UserState;
        if (parsed.premiumExpiry && Date.now() > parsed.premiumExpiry) {
          parsed.plan = 'free';
          parsed.premiumExpiry = null;
        }
        setState(parsed);
      }
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  }, [state, loaded]);

  const isPremium = state.plan !== 'free' && (state.premiumExpiry === null || Date.now() < (state.premiumExpiry || 0));
  const canTakeExam = isPremium || state.freeExamsUsed < 1;

  const setPlan = (plan: PlanType) => {
    let premiumExpiry: number | null = null;
    if (plan === 'premium_10') {
      premiumExpiry = Date.now() + 10 * 24 * 60 * 60 * 1000;
    } else if (plan === 'premium_30') {
      premiumExpiry = Date.now() + 30 * 24 * 60 * 60 * 1000;
    }
    setState(prev => ({ ...prev, plan, premiumExpiry }));
  };

  const incrementFreeExams = () => {
    setState(prev => ({ ...prev, freeExamsUsed: prev.freeExamsUsed + 1 }));
  };

  const addExamResult = (result: ExamResult) => {
    setState(prev => ({ ...prev, examHistory: [result, ...prev.examHistory] }));
  };

  const clearHistory = () => {
    setState(prev => ({ ...prev, examHistory: [] }));
  };

  const value = useMemo(() => ({
    plan: state.plan,
    freeExamsUsed: state.freeExamsUsed,
    examHistory: state.examHistory,
    isPremium,
    canTakeExam,
    setPlan,
    incrementFreeExams,
    addExamResult,
    clearHistory,
  }), [state, isPremium, canTakeExam]);

  if (!loaded) return null;

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
