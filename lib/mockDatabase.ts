export type { Question } from './questionsData';
export { categorias, licenseTypes } from './questionsData';
export { temarioChapters } from './temarioData';

import { questionsBank } from './questionsData';
import { questionsPart2 } from './questions-part2';
import { questionsPart3 } from './questions-part3';
import { questionsPart4 } from './questions-part4';
import { questionsPart5 } from './questions-part5';
import { questionsPart6 } from './questions-part6';
import { questionsPart7 } from './questions-part7';
import { questionsA2 } from './questions-a2';
import { questionsA4 } from './questions-a4';
import { questionsClaseC } from './questions-c';
import { questionsClaseD } from './questions-d';
import { questionsClaseE } from './questions-e';
import { questionsOficialPart1 } from './questions-oficial-conaset';
import { questionsOficialPart2 } from './questions-oficial-conaset2';
import { questionsOficialClaseC } from './questions-oficial-clase-c';
import type { Question } from './questionsData';

const allQuestions: Question[] = [
  ...questionsBank,
  ...questionsPart2,
  ...questionsPart3,
  ...questionsPart4,
  ...questionsPart5,
  ...questionsPart6,
  ...questionsPart7,
  ...questionsA2,
  ...questionsA4,
  ...questionsClaseC,
  ...questionsClaseD,
  ...questionsClaseE,
  ...questionsOficialPart1,
  ...questionsOficialPart2,
  ...questionsOficialClaseC,
];

export const mockQuestions = allQuestions;

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

export function getQuestionsByLicense(licenseType: string): Question[] {
  return allQuestions.filter(q => q.licenseTypes.includes(licenseType));
}

export function getRandomExam(count: number, licenseType: string): Question[] {
  const filtered = getQuestionsByLicense(licenseType);
  return shuffle(filtered).slice(0, count);
}

export function getEasyExam(count: number, licenseType: string): Question[] {
  const filtered = getQuestionsByLicense(licenseType).filter(q => q.dificultad === 'facil');
  return shuffle(filtered).slice(0, count);
}

export function getHardExam(count: number, licenseType: string): Question[] {
  const filtered = getQuestionsByLicense(licenseType).filter(q => q.dificultad === 'dificil' || q.dificultad === 'media');
  return shuffle(filtered).slice(0, count);
}

export function getCategoryExam(category: string, licenseType: string): Question[] {
  const config = getExamConfig(licenseType);
  const filtered = getQuestionsByLicense(licenseType).filter(q => q.categoria === category);
  return shuffle(filtered).slice(0, Math.min(filtered.length, config.questionsPerExam));
}
