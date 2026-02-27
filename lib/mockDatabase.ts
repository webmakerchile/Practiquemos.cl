export type { Question } from './questionsData';
export { categorias, licenseTypes } from './questionsData';
export { temarioChapters } from './temarioData';

import type { Question } from './questionsData';
import { apiRequest } from './query-client';

const questionsCache: Record<string, { data: Question[]; timestamp: number }> = {};
const CACHE_TTL = 5 * 1000;

export async function fetchQuestionsByLicense(licenseType: string): Promise<Question[]> {
  const cached = questionsCache[licenseType];
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const res = await apiRequest('GET', `/api/questions?licenseType=${licenseType}`);
    const data = await res.json();
    const mapped: Question[] = data.map((q: any) => ({
      id: q.id,
      pregunta: q.pregunta,
      opciones: q.opciones as string[],
      respuestaCorrecta: q.respuestaCorrecta,
      explicacionTexto: q.explicacionTexto || '',
      categoria: q.categoria,
      dificultad: q.dificultad as 'facil' | 'media' | 'dificil',
      licenseTypes: q.licenseTypes as string[],
      oficial: q.oficial || false,
      urlAudio: q.urlAudio || null,
    }));
    questionsCache[licenseType] = { data: mapped, timestamp: Date.now() };
    return mapped;
  } catch (err) {
    if (cached) return cached.data;
    throw err;
  }
}

export function invalidateQuestionsCache() {
  Object.keys(questionsCache).forEach(key => delete questionsCache[key]);
}

export interface LicenseExamConfig {
  questionsPerExam: number;
  passingScore: number;
  timeLimit: number;
  totalPoints?: number;
}

export const LICENSE_EXAM_CONFIGS: Record<string, LicenseExamConfig> = {
  clase_b: {
    questionsPerExam: 35,
    totalPoints: 38,
    passingScore: 33 / 38,
    timeLimit: 45 * 60,
  },
  clase_a2: {
    questionsPerExam: 20,
    passingScore: 16 / 20,
    timeLimit: 30 * 60,
  },
  clase_a4: {
    questionsPerExam: 35,
    passingScore: 0.7,
    timeLimit: 45 * 60,
  },
  clase_c: {
    questionsPerExam: 20,
    passingScore: 15 / 20,
    timeLimit: 30 * 60,
  },
  clase_d: {
    questionsPerExam: 12,
    passingScore: 9 / 12,
    timeLimit: 20 * 60,
  },
  clase_e: {
    questionsPerExam: 10,
    passingScore: 7 / 10,
    timeLimit: 20 * 60,
  },
};

export const EXAM_CONFIG = {
  questionsPerExam: 35,
  passingScore: 0.7,
  timeLimit: 45 * 60,
};

export function getExamConfig(licenseType: string): LicenseExamConfig {
  return LICENSE_EXAM_CONFIGS[licenseType] || EXAM_CONFIG;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function selectRandomExam(allQuestions: Question[], count: number): Question[] {
  return shuffle(allQuestions).slice(0, count);
}

export function selectEasyExam(allQuestions: Question[], count: number): Question[] {
  const filtered = allQuestions.filter(q => q.dificultad === 'facil');
  return shuffle(filtered).slice(0, count);
}

export function selectHardExam(allQuestions: Question[], count: number): Question[] {
  const filtered = allQuestions.filter(q => q.dificultad === 'dificil' || q.dificultad === 'media');
  return shuffle(filtered).slice(0, count);
}

export function selectCategoryExam(allQuestions: Question[], category: string, licenseType: string): Question[] {
  const config = getExamConfig(licenseType);
  const filtered = allQuestions.filter(q => q.categoria === category);
  return shuffle(filtered).slice(0, Math.min(filtered.length, config.questionsPerExam));
}
