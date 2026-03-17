import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  fullName: text("full_name"),
  role: text("role").notNull().default("user"),
  plan: text("plan").notNull().default("free"),
  planExpiry: timestamp("plan_expiry"),
  licenseType: text("license_type").default("clase_b"),
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login"),
});

export const examResults = pgTable("exam_results", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  examMode: text("exam_mode").notNull(),
  licenseType: text("license_type").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  correctAnswers: integer("correct_answers").notNull(),
  score: integer("score").notNull(),
  passed: boolean("passed").notNull(),
  timeSpent: integer("time_spent"),
  categoryBreakdown: jsonb("category_breakdown"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const favorites = pgTable("favorites", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  questionId: integer("question_id").notNull(),
  licenseType: text("license_type").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const categoryProgress = pgTable("category_progress", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  licenseType: text("license_type").notNull(),
  category: text("category").notNull(),
  totalAnswered: integer("total_answered").notNull().default(0),
  totalCorrect: integer("total_correct").notNull().default(0),
  lastPracticed: timestamp("last_practiced"),
});

export const questions = pgTable("questions", {
  id: integer("id").primaryKey(),
  pregunta: text("pregunta").notNull(),
  opciones: jsonb("opciones").notNull().$type<string[]>(),
  respuestaCorrecta: integer("respuesta_correcta").notNull(),
  explicacionTexto: text("explicacion_texto").notNull().default(""),
  categoria: text("categoria").notNull(),
  dificultad: text("dificultad").notNull().default("media"),
  licenseTypes: jsonb("license_types").notNull().$type<string[]>(),
  oficial: boolean("oficial").notNull().default(false),
  urlAudio: text("url_audio").default(""),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: varchar("id")
    .primaryKey()
    .default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  mercadoPagoId: text("mercado_pago_id"),
  preferenceId: text("preference_id").notNull(),
  plan: text("plan").notNull(),
  amount: integer("amount").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  fullName: true,
});

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const adminCreateUserSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(4),
  email: z.string().email().optional(),
  fullName: z.string().optional(),
  plan: z.enum(["free", "premium_10", "premium_30"]).default("free"),
  role: z.enum(["user", "admin"]).default("user"),
});

export const adminUpdateUserSchema = z.object({
  plan: z.enum(["free", "premium_10", "premium_30"]).optional(),
  password: z.string().min(4).optional(),
  email: z.string().email().optional(),
  fullName: z.string().optional(),
  role: z.enum(["user", "admin"]).optional(),
});

export const adminCreateQuestionSchema = z.object({
  id: z.number().int().positive().optional(),
  pregunta: z.string().min(5),
  opciones: z.array(z.string().min(1)).min(2).max(6),
  respuestaCorrecta: z.number().int().min(0),
  explicacionTexto: z.string().default(""),
  categoria: z.string().min(1),
  dificultad: z.enum(["facil", "media", "dificil"]).default("media"),
  licenseTypes: z.array(z.string()).min(1),
  oficial: z.boolean().default(false),
  urlAudio: z.string().default(""),
});

export const adminUpdateQuestionSchema = z.object({
  pregunta: z.string().min(5).optional(),
  opciones: z.array(z.string().min(1)).min(2).max(6).optional(),
  respuestaCorrecta: z.number().int().min(0).optional(),
  explicacionTexto: z.string().optional(),
  categoria: z.string().min(1).optional(),
  dificultad: z.enum(["facil", "media", "dificil"]).optional(),
  licenseTypes: z.array(z.string()).min(1).optional(),
  oficial: z.boolean().optional(),
  urlAudio: z.string().optional(),
  enabled: z.boolean().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type ExamResult = typeof examResults.$inferSelect;
export type Favorite = typeof favorites.$inferSelect;
export type CategoryProgress = typeof categoryProgress.$inferSelect;
export type QuestionRecord = typeof questions.$inferSelect;
export type Payment = typeof payments.$inferSelect;
