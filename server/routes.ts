import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import { storage } from "./storage";
import {
  loginSchema,
  adminCreateUserSchema,
  adminUpdateUserSchema,
  adminCreateQuestionSchema,
  adminUpdateQuestionSchema,
  payments,
  users,
} from "@shared/schema";
import crypto from "crypto";
import { db } from "./db";
import { eq } from "drizzle-orm";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

const sessions = new Map<string, { userId: string; role: string }>();

function createSession(userId: string, role: string): string {
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, { userId, role });
  return token;
}

function getSession(req: Request) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return null;
  return sessions.get(token) || null;
}

function requireAuth(req: Request, res: Response): { userId: string; role: string } | null {
  const session = getSession(req);
  if (!session) {
    res.status(401).json({ message: "No autenticado" });
    return null;
  }
  return session;
}

function requireAdmin(req: Request, res: Response): { userId: string; role: string } | null {
  const session = requireAuth(req, res);
  if (!session) return null;
  if (session.role !== "admin") {
    res.status(403).json({ message: "Acceso denegado" });
    return null;
  }
  return session;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Seed admin user if not exists
  const adminUser = await storage.getUserByUsername("admin");
  if (!adminUser) {
    await storage.createUser({
      username: "admin",
      password: hashPassword("admin123"),
      fullName: "Administrador",
      role: "admin",
      plan: "premium_30",
    });
    console.log("Admin user created: admin / admin123");
  }

  // AUTH ROUTES
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { username, password, email, fullName } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Usuario y contraseña requeridos" });
      }
      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.status(400).json({ message: "El usuario ya existe" });
      }
      const user = await storage.createUser({
        username,
        password: hashPassword(password),
        email: email || null,
        fullName: fullName || null,
      });
      const token = createSession(user.id, user.role);
      res.json({ token, user: { id: user.id, username: user.username, role: user.role, plan: user.plan, fullName: user.fullName, email: user.email, licenseType: user.licenseType } });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Datos inválidos" });
      }
      const user = await storage.getUserByUsername(parsed.data.username);
      if (!user || !verifyPassword(parsed.data.password, user.password)) {
        return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
      }
      await storage.updateUser(user.id, { lastLogin: new Date() });
      const token = createSession(user.id, user.role);
      res.json({ token, user: { id: user.id, username: user.username, role: user.role, plan: user.plan, fullName: user.fullName, email: user.email, licenseType: user.licenseType, planExpiry: user.planExpiry } });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/auth/me", async (req: Request, res: Response) => {
    const session = requireAuth(req, res);
    if (!session) return;
    const user = await storage.getUser(session.userId);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json({ id: user.id, username: user.username, role: user.role, plan: user.plan, fullName: user.fullName, email: user.email, licenseType: user.licenseType, planExpiry: user.planExpiry });
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (token) sessions.delete(token);
    res.json({ message: "ok" });
  });

  app.put("/api/auth/profile", async (req: Request, res: Response) => {
    const session = requireAuth(req, res);
    if (!session) return;
    const { licenseType, fullName, email } = req.body;
    const updates: any = {};
    if (licenseType) updates.licenseType = licenseType;
    if (fullName !== undefined) updates.fullName = fullName;
    if (email !== undefined) updates.email = email;
    const user = await storage.updateUser(session.userId, updates);
    res.json(user);
  });

  app.put("/api/auth/change-password", async (req: Request, res: Response) => {
    const session = requireAuth(req, res);
    if (!session) return;
    const { currentPassword, newPassword } = req.body;
    const user = await storage.getUser(session.userId);
    if (!user || !verifyPassword(currentPassword, user.password)) {
      return res.status(400).json({ message: "Contraseña actual incorrecta" });
    }
    await storage.updateUser(session.userId, { password: hashPassword(newPassword) });
    res.json({ message: "Contraseña actualizada" });
  });

  // ADMIN ROUTES
  app.get("/api/admin/users", async (req: Request, res: Response) => {
    const session = requireAdmin(req, res);
    if (!session) return;
    const allUsers = await storage.getAllUsers();
    res.json(allUsers.map(u => ({
      id: u.id,
      username: u.username,
      fullName: u.fullName,
      email: u.email,
      role: u.role,
      plan: u.plan,
      planExpiry: u.planExpiry,
      licenseType: u.licenseType,
      createdAt: u.createdAt,
      lastLogin: u.lastLogin,
    })));
  });

  app.post("/api/admin/users", async (req: Request, res: Response) => {
    const session = requireAdmin(req, res);
    if (!session) return;
    try {
      const parsed = adminCreateUserSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Datos inválidos", errors: parsed.error.errors });
      }
      const existing = await storage.getUserByUsername(parsed.data.username);
      if (existing) {
        return res.status(400).json({ message: "El usuario ya existe" });
      }
      let planExpiry = null;
      if (parsed.data.plan === "premium_10") {
        planExpiry = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
      } else if (parsed.data.plan === "premium_30") {
        planExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      }
      const user = await storage.createUser({
        username: parsed.data.username,
        password: hashPassword(parsed.data.password),
        email: parsed.data.email || null,
        fullName: parsed.data.fullName || null,
        plan: parsed.data.plan,
        role: parsed.data.role,
        planExpiry,
      });
      res.json(user);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.put("/api/admin/users/:id", async (req: Request, res: Response) => {
    const session = requireAdmin(req, res);
    if (!session) return;
    try {
      const parsed = adminUpdateUserSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Datos inválidos" });
      }
      const updates: any = {};
      if (parsed.data.plan) {
        updates.plan = parsed.data.plan;
        if (parsed.data.plan === "premium_10") {
          updates.planExpiry = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
        } else if (parsed.data.plan === "premium_30") {
          updates.planExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        } else {
          updates.planExpiry = null;
        }
      }
      if (parsed.data.password) updates.password = hashPassword(parsed.data.password);
      if (parsed.data.email !== undefined) updates.email = parsed.data.email;
      if (parsed.data.fullName !== undefined) updates.fullName = parsed.data.fullName;
      if (parsed.data.role) updates.role = parsed.data.role;
      const user = await storage.updateUser(req.params.id, updates);
      if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
      res.json(user);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.delete("/api/admin/users/:id", async (req: Request, res: Response) => {
    const session = requireAdmin(req, res);
    if (!session) return;
    if (req.params.id === session.userId) {
      return res.status(400).json({ message: "No puedes eliminar tu propia cuenta" });
    }
    await storage.deleteUser(req.params.id);
    res.json({ message: "Usuario eliminado" });
  });

  // PUBLIC QUESTIONS ENDPOINT
  app.get("/api/questions", async (req: Request, res: Response) => {
    try {
      const licenseType = req.query.licenseType as string;
      if (!licenseType) {
        return res.status(400).json({ message: "licenseType es requerido" });
      }
      const qs = await storage.getQuestionsByLicense(licenseType);
      res.json(qs);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // ADMIN QUESTIONS ROUTES
  app.get("/api/admin/questions", async (req: Request, res: Response) => {
    const session = requireAdmin(req, res);
    if (!session) return;
    try {
      const filters = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 50,
        search: (req.query.search as string) || undefined,
        category: (req.query.category as string) || undefined,
        licenseType: (req.query.licenseType as string) || undefined,
        dificultad: (req.query.dificultad as string) || undefined,
        oficial: req.query.oficial !== undefined ? req.query.oficial === "true" : undefined,
        enabled: req.query.enabled !== undefined ? req.query.enabled === "true" : undefined,
      };
      const result = await storage.getAllQuestionsAdmin(filters);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/admin/questions/:id", async (req: Request, res: Response) => {
    const session = requireAdmin(req, res);
    if (!session) return;
    try {
      const q = await storage.getQuestionById(parseInt(req.params.id));
      if (!q) return res.status(404).json({ message: "Pregunta no encontrada" });
      res.json(q);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/admin/questions", async (req: Request, res: Response) => {
    const session = requireAdmin(req, res);
    if (!session) return;
    try {
      const parsed = adminCreateQuestionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Datos inválidos", errors: parsed.error.errors });
      }
      const data = parsed.data;
      if (data.respuestaCorrecta >= data.opciones.length) {
        return res.status(400).json({ message: "respuestaCorrecta debe ser menor que el número de opciones" });
      }
      let questionId = data.id;
      if (!questionId) {
        questionId = await storage.getNextQuestionId();
      }
      const existing = await storage.getQuestionById(questionId);
      if (existing) {
        return res.status(400).json({ message: `Ya existe una pregunta con ID ${questionId}` });
      }
      const q = await storage.createQuestion({
        id: questionId,
        pregunta: data.pregunta,
        opciones: data.opciones,
        respuestaCorrecta: data.respuestaCorrecta,
        explicacionTexto: data.explicacionTexto,
        categoria: data.categoria,
        dificultad: data.dificultad,
        licenseTypes: data.licenseTypes,
        oficial: data.oficial,
        urlAudio: data.urlAudio,
        enabled: true,
      });
      res.json(q);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.put("/api/admin/questions/:id", async (req: Request, res: Response) => {
    const session = requireAdmin(req, res);
    if (!session) return;
    try {
      const parsed = adminUpdateQuestionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Datos inválidos", errors: parsed.error.errors });
      }
      const data = parsed.data;
      if (data.opciones && data.respuestaCorrecta !== undefined && data.respuestaCorrecta >= data.opciones.length) {
        return res.status(400).json({ message: "respuestaCorrecta debe ser menor que el número de opciones" });
      }
      const existing = await storage.getQuestionById(parseInt(req.params.id));
      if (!existing) {
        return res.status(404).json({ message: "Pregunta no encontrada" });
      }
      if (data.respuestaCorrecta !== undefined && !data.opciones) {
        const currentOpciones = existing.opciones as string[];
        if (data.respuestaCorrecta >= currentOpciones.length) {
          return res.status(400).json({ message: "respuestaCorrecta debe ser menor que el número de opciones" });
        }
      }
      const q = await storage.updateQuestion(parseInt(req.params.id), data);
      res.json(q);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.delete("/api/admin/questions/:id", async (req: Request, res: Response) => {
    const session = requireAdmin(req, res);
    if (!session) return;
    try {
      const existing = await storage.getQuestionById(parseInt(req.params.id));
      if (!existing) {
        return res.status(404).json({ message: "Pregunta no encontrada" });
      }
      await storage.deleteQuestion(parseInt(req.params.id));
      res.json({ message: "Pregunta desactivada" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // EXAM RESULTS
  app.get("/api/exam-results", async (req: Request, res: Response) => {
    const session = requireAuth(req, res);
    if (!session) return;
    const results = await storage.getExamResults(session.userId);
    res.json(results);
  });

  app.post("/api/exam-results", async (req: Request, res: Response) => {
    const session = requireAuth(req, res);
    if (!session) return;
    const result = await storage.createExamResult({
      userId: session.userId,
      ...req.body,
    });
    res.json(result);
  });

  // FAVORITES
  app.get("/api/favorites/:licenseType", async (req: Request, res: Response) => {
    const session = requireAuth(req, res);
    if (!session) return;
    const favs = await storage.getFavorites(session.userId, req.params.licenseType);
    res.json(favs.map(f => f.questionId));
  });

  app.post("/api/favorites", async (req: Request, res: Response) => {
    const session = requireAuth(req, res);
    if (!session) return;
    const { questionId, licenseType } = req.body;
    const fav = await storage.addFavorite(session.userId, questionId, licenseType);
    res.json(fav);
  });

  app.delete("/api/favorites/:questionId/:licenseType", async (req: Request, res: Response) => {
    const session = requireAuth(req, res);
    if (!session) return;
    await storage.removeFavorite(session.userId, parseInt(req.params.questionId), req.params.licenseType);
    res.json({ message: "ok" });
  });

  // CATEGORY PROGRESS
  app.get("/api/progress/:licenseType", async (req: Request, res: Response) => {
    const session = requireAuth(req, res);
    if (!session) return;
    const progress = await storage.getCategoryProgress(session.userId, req.params.licenseType);
    res.json(progress);
  });

  app.post("/api/progress", async (req: Request, res: Response) => {
    const session = requireAuth(req, res);
    if (!session) return;
    const { licenseType, category, correct } = req.body;
    await storage.updateCategoryProgress(session.userId, licenseType, category, correct);
    res.json({ message: "ok" });
  });

  const PLAN_CONFIG: Record<string, { title: string; price: number; days: number }> = {
    premium_10: { title: "Premium 10 Días - Practiquemos.cl", price: 2990, days: 10 },
    premium_30: { title: "Premium 30 Días - Practiquemos.cl", price: 4990, days: 30 },
  };

  app.post("/api/payments/create-preference", async (req: Request, res: Response) => {
    const session = getSession(req);
    if (!session) return res.status(401).json({ message: "No autorizado" });

    const { plan } = req.body;
    const config = PLAN_CONFIG[plan];
    if (!config) return res.status(400).json({ message: "Plan inválido" });

    const accessToken = process.env.MP_ACCESS_TOKEN;
    if (!accessToken) return res.status(500).json({ message: "Mercado Pago no configurado" });

    try {
      const baseUrl = `https://${process.env.REPLIT_DEV_DOMAIN || process.env.REPLIT_DOMAINS?.split(",")[0] || "localhost:5000"}`;

      const preference = {
        items: [{
          title: config.title,
          quantity: 1,
          unit_price: config.price,
          currency_id: "CLP",
        }],
        back_urls: {
          success: `${baseUrl}/api/payments/success`,
          failure: `${baseUrl}/api/payments/failure`,
          pending: `${baseUrl}/api/payments/pending`,
        },
        auto_return: "approved" as const,
        external_reference: `${session.userId}|${plan}`,
        notification_url: `${baseUrl}/api/payments/webhook`,
      };

      const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(preference),
      });

      if (!mpResponse.ok) {
        const errText = await mpResponse.text();
        console.error("MP preference error:", errText);
        return res.status(502).json({ message: "Error creando preferencia de pago" });
      }

      const data = await mpResponse.json() as any;

      await db.insert(payments).values({
        userId: session.userId,
        preferenceId: data.id,
        plan,
        amount: config.price,
        status: "pending",
      });

      res.json({
        preferenceId: data.id,
        initPoint: data.init_point,
        sandboxInitPoint: data.sandbox_init_point,
      });
    } catch (err) {
      console.error("Payment error:", err);
      res.status(500).json({ message: "Error procesando pago" });
    }
  });

  app.post("/api/payments/webhook", async (req: Request, res: Response) => {
    try {
      const { type, data } = req.body;
      if (type !== "payment" || !data?.id) return res.sendStatus(200);

      const accessToken = process.env.MP_ACCESS_TOKEN;
      if (!accessToken) return res.sendStatus(200);

      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
        headers: { "Authorization": `Bearer ${accessToken}` },
      });

      if (!mpResponse.ok) return res.sendStatus(200);

      const payment = await mpResponse.json() as any;
      const externalRef = payment.external_reference;
      if (!externalRef) return res.sendStatus(200);

      const [userId, plan] = externalRef.split("|");
      const config = PLAN_CONFIG[plan];
      if (!config) return res.sendStatus(200);

      if (payment.status === "approved") {
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + config.days);

        await db.update(users).set({
          plan,
          planExpiry: expiry,
        }).where(eq(users.id, userId));

        const existingPayments = await db.select().from(payments)
          .where(eq(payments.preferenceId, payment.preference_id || ""));

        if (existingPayments.length > 0) {
          await db.update(payments).set({
            mercadoPagoId: String(data.id),
            status: "approved",
            updatedAt: new Date(),
          }).where(eq(payments.preferenceId, payment.preference_id || ""));
        }

        console.log(`Payment approved for user ${userId}, plan ${plan}, expires ${expiry.toISOString()}`);
      }

      res.sendStatus(200);
    } catch (err) {
      console.error("Webhook error:", err);
      res.sendStatus(200);
    }
  });

  app.get("/api/payments/success", async (req: Request, res: Response) => {
    const paymentId = req.query.payment_id as string;
    const externalRef = req.query.external_reference as string;
    const status = req.query.status as string || req.query.collection_status as string;

    if (externalRef && status === "approved") {
      const [userId, plan] = externalRef.split("|");
      const config = PLAN_CONFIG[plan];
      if (config) {
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + config.days);
        await db.update(users).set({ plan, planExpiry: expiry }).where(eq(users.id, userId));

        if (paymentId) {
          const preferenceId = req.query.preference_id as string;
          if (preferenceId) {
            await db.update(payments).set({
              mercadoPagoId: paymentId,
              status: "approved",
              updatedAt: new Date(),
            }).where(eq(payments.preferenceId, preferenceId));
          }
        }
      }
    }

    const appUrl = `https://${process.env.REPLIT_DEV_DOMAIN || process.env.REPLIT_DOMAINS?.split(",")[0] || "localhost:8081"}`;
    res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Pago exitoso</title><style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f0fdf4;text-align:center}.card{background:#fff;border-radius:16px;padding:40px;box-shadow:0 4px 12px rgba(0,0,0,0.1);max-width:400px}h1{color:#166534;font-size:24px}p{color:#333;font-size:16px}a{display:inline-block;margin-top:20px;background:#7c3aed;color:#fff;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:bold}</style></head><body><div class="card"><h1>¡Pago exitoso! ✅</h1><p>Tu plan Premium ha sido activado correctamente.</p><p>Ya puedes disfrutar de todos los contenidos.</p><a href="${appUrl}">Volver a la app</a></div></body></html>`);
  });

  app.get("/api/payments/failure", (_req: Request, res: Response) => {
    const appUrl = `https://${process.env.REPLIT_DEV_DOMAIN || process.env.REPLIT_DOMAINS?.split(",")[0] || "localhost:8081"}`;
    res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Pago fallido</title><style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#fef2f2;text-align:center}.card{background:#fff;border-radius:16px;padding:40px;box-shadow:0 4px 12px rgba(0,0,0,0.1);max-width:400px}h1{color:#991b1b;font-size:24px}p{color:#333;font-size:16px}a{display:inline-block;margin-top:20px;background:#7c3aed;color:#fff;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:bold}</style></head><body><div class="card"><h1>Pago no completado</h1><p>Hubo un problema con tu pago. Puedes intentarlo nuevamente.</p><a href="${appUrl}">Volver a la app</a></div></body></html>`);
  });

  app.get("/api/payments/pending", (_req: Request, res: Response) => {
    const appUrl = `https://${process.env.REPLIT_DEV_DOMAIN || process.env.REPLIT_DOMAINS?.split(",")[0] || "localhost:8081"}`;
    res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Pago pendiente</title><style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#fffbeb;text-align:center}.card{background:#fff;border-radius:16px;padding:40px;box-shadow:0 4px 12px rgba(0,0,0,0.1);max-width:400px}h1{color:#92400e;font-size:24px}p{color:#333;font-size:16px}a{display:inline-block;margin-top:20px;background:#7c3aed;color:#fff;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:bold}</style></head><body><div class="card"><h1>Pago pendiente ⏳</h1><p>Tu pago está siendo procesado. Te avisaremos cuando se confirme.</p><a href="${appUrl}">Volver a la app</a></div></body></html>`);
  });

  app.get("/api/payments/status", async (req: Request, res: Response) => {
    const session = getSession(req);
    if (!session) return res.status(401).json({ message: "No autorizado" });

    const user = await storage.getUser(session.userId);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    res.json({
      plan: user.plan,
      planExpiry: user.planExpiry,
      isPremium: (user.plan === "premium_10" || user.plan === "premium_30") && 
        (!user.planExpiry || new Date(user.planExpiry) > new Date()),
    });
  });

  const ttsCache = new Map<string, Buffer>();
  const TTS_CACHE_MAX = 200;

  app.post("/api/tts", async (req: Request, res: Response) => {
    const { text } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ message: "Se requiere texto" });
    }
    if (text.length > 4000) {
      return res.status(400).json({ message: "Texto demasiado largo (máx 4000 caracteres)" });
    }

    const cacheKey = crypto.createHash("md5").update(text).digest("hex");
    const cached = ttsCache.get(cacheKey);
    if (cached) {
      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Cache-Control", "public, max-age=86400");
      return res.send(cached);
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ message: "TTS no configurado" });
    }

    try {
      const response = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "tts-1",
          input: text,
          voice: "nova",
          response_format: "mp3",
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("OpenAI TTS error:", errText);
        return res.status(502).json({ message: "Error generando audio" });
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = Buffer.from(arrayBuffer);

      if (ttsCache.size >= TTS_CACHE_MAX) {
        const firstKey = ttsCache.keys().next().value;
        if (firstKey) ttsCache.delete(firstKey);
      }
      ttsCache.set(cacheKey, audioBuffer);

      res.setHeader("Content-Type", "audio/mpeg");
      res.setHeader("Cache-Control", "public, max-age=86400");
      res.send(audioBuffer);
    } catch (err) {
      console.error("TTS error:", err);
      res.status(500).json({ message: "Error interno de TTS" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
