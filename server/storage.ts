import { eq, and, desc, ilike, sql, count } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  examResults,
  favorites,
  categoryProgress,
  questions,
  type User,
  type InsertUser,
  type ExamResult,
  type Favorite,
  type CategoryProgress,
  type QuestionRecord,
} from "@shared/schema";

export interface AdminQuestionFilters {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  licenseType?: string;
  oficial?: boolean;
  dificultad?: string;
  enabled?: boolean;
}

export interface PaginatedQuestions {
  questions: QuestionRecord[];
  total: number;
  page: number;
  totalPages: number;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: any): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;
  deleteUser(id: string): Promise<void>;
  getAllUsers(): Promise<User[]>;
  getExamResults(userId: string): Promise<ExamResult[]>;
  createExamResult(result: any): Promise<ExamResult>;
  getFavorites(userId: string, licenseType: string): Promise<Favorite[]>;
  addFavorite(userId: string, questionId: number, licenseType: string): Promise<Favorite>;
  removeFavorite(userId: string, questionId: number, licenseType: string): Promise<void>;
  getCategoryProgress(userId: string, licenseType: string): Promise<CategoryProgress[]>;
  updateCategoryProgress(userId: string, licenseType: string, category: string, correct: boolean): Promise<void>;
  getQuestionsByLicense(licenseType: string): Promise<QuestionRecord[]>;
  getQuestionById(id: number): Promise<QuestionRecord | undefined>;
  createQuestion(data: any): Promise<QuestionRecord>;
  updateQuestion(id: number, data: any): Promise<QuestionRecord | undefined>;
  deleteQuestion(id: number): Promise<void>;
  getAllQuestionsAdmin(filters: AdminQuestionFilters): Promise<PaginatedQuestions>;
  getQuestionsCount(): Promise<number>;
  getNextQuestionId(): Promise<number>;
  bulkInsertQuestions(data: any[]): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(userData: any): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(favorites).where(eq(favorites.userId, id));
    await db.delete(categoryProgress).where(eq(categoryProgress.userId, id));
    await db.delete(examResults).where(eq(examResults.userId, id));
    await db.delete(users).where(eq(users.id, id));
  }

  async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  async getExamResults(userId: string): Promise<ExamResult[]> {
    return db.select().from(examResults).where(eq(examResults.userId, userId)).orderBy(desc(examResults.createdAt));
  }

  async createExamResult(result: any): Promise<ExamResult> {
    const [examResult] = await db.insert(examResults).values(result).returning();
    return examResult;
  }

  async getFavorites(userId: string, licenseType: string): Promise<Favorite[]> {
    return db.select().from(favorites).where(
      and(eq(favorites.userId, userId), eq(favorites.licenseType, licenseType))
    );
  }

  async addFavorite(userId: string, questionId: number, licenseType: string): Promise<Favorite> {
    const [fav] = await db.insert(favorites).values({ userId, questionId, licenseType }).returning();
    return fav;
  }

  async removeFavorite(userId: string, questionId: number, licenseType: string): Promise<void> {
    await db.delete(favorites).where(
      and(
        eq(favorites.userId, userId),
        eq(favorites.questionId, questionId),
        eq(favorites.licenseType, licenseType)
      )
    );
  }

  async getCategoryProgress(userId: string, licenseType: string): Promise<CategoryProgress[]> {
    return db.select().from(categoryProgress).where(
      and(eq(categoryProgress.userId, userId), eq(categoryProgress.licenseType, licenseType))
    );
  }

  async updateCategoryProgress(userId: string, licenseType: string, category: string, correct: boolean): Promise<void> {
    const existing = await db.select().from(categoryProgress).where(
      and(
        eq(categoryProgress.userId, userId),
        eq(categoryProgress.licenseType, licenseType),
        eq(categoryProgress.category, category)
      )
    );

    if (existing.length > 0) {
      await db.update(categoryProgress).set({
        totalAnswered: existing[0].totalAnswered + 1,
        totalCorrect: existing[0].totalCorrect + (correct ? 1 : 0),
        lastPracticed: new Date(),
      }).where(eq(categoryProgress.id, existing[0].id));
    } else {
      await db.insert(categoryProgress).values({
        userId,
        licenseType,
        category,
        totalAnswered: 1,
        totalCorrect: correct ? 1 : 0,
        lastPracticed: new Date(),
      });
    }
  }

  async getQuestionsByLicense(licenseType: string): Promise<QuestionRecord[]> {
    return db.select().from(questions).where(
      and(
        eq(questions.enabled, true),
        sql`${questions.licenseTypes}::jsonb @> ${JSON.stringify([licenseType])}::jsonb`
      )
    );
  }

  async getQuestionById(id: number): Promise<QuestionRecord | undefined> {
    const [q] = await db.select().from(questions).where(eq(questions.id, id));
    return q;
  }

  async createQuestion(data: any): Promise<QuestionRecord> {
    const [q] = await db.insert(questions).values({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();
    return q;
  }

  async updateQuestion(id: number, data: any): Promise<QuestionRecord | undefined> {
    const [q] = await db.update(questions).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(questions.id, id)).returning();
    return q;
  }

  async deleteQuestion(id: number): Promise<void> {
    await db.update(questions).set({ enabled: false, updatedAt: new Date() }).where(eq(questions.id, id));
  }

  async getAllQuestionsAdmin(filters: AdminQuestionFilters): Promise<PaginatedQuestions> {
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const offset = (page - 1) * limit;

    const conditions: any[] = [];

    if (filters.search) {
      conditions.push(ilike(questions.pregunta, `%${filters.search}%`));
    }
    if (filters.category) {
      conditions.push(eq(questions.categoria, filters.category));
    }
    if (filters.dificultad) {
      conditions.push(eq(questions.dificultad, filters.dificultad));
    }
    if (filters.oficial !== undefined) {
      conditions.push(eq(questions.oficial, filters.oficial));
    }
    if (filters.enabled !== undefined) {
      conditions.push(eq(questions.enabled, filters.enabled));
    }
    if (filters.licenseType) {
      conditions.push(sql`${questions.licenseTypes}::jsonb @> ${JSON.stringify([filters.licenseType])}::jsonb`);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalResult] = await db.select({ value: count() }).from(questions).where(whereClause);
    const total = Number(totalResult.value);

    const rows = await db.select().from(questions)
      .where(whereClause)
      .orderBy(questions.id)
      .limit(limit)
      .offset(offset);

    return {
      questions: rows,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getQuestionsCount(): Promise<number> {
    const [result] = await db.select({ value: count() }).from(questions);
    return Number(result.value);
  }

  async getNextQuestionId(): Promise<number> {
    const [result] = await db.select({ maxId: sql<number>`COALESCE(MAX(${questions.id}), 0)` }).from(questions);
    return (result.maxId || 0) + 1;
  }

  async bulkInsertQuestions(data: any[]): Promise<void> {
    const batchSize = 100;
    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      await db.insert(questions).values(batch);
    }
  }
}

export const storage = new DatabaseStorage();
