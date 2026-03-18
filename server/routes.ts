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
import bcrypt from "bcryptjs";
import { db } from "./db";
import { eq } from "drizzle-orm";

const SUPER_ADMIN_USERNAME = "webmakerchile";
const BCRYPT_ROUNDS = 10;

function isBcryptHash(hash: string): boolean {
  return hash.startsWith("$2a$") || hash.startsWith("$2b$") || hash.startsWith("$2y$");
}

function legacySha256(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (isBcryptHash(hash)) {
    return bcrypt.compare(password, hash);
  }
  return legacySha256(password) === hash;
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
  if (session.role !== "admin" && session.role !== "superadmin") {
    res.status(403).json({ message: "Acceso denegado" });
    return null;
  }
  return session;
}

export async function registerRoutes(app: Express): Promise<Server> {
  const superAdmin = await storage.getUserByUsername(SUPER_ADMIN_USERNAME);
  if (!superAdmin) {
    await storage.createUser({
      username: SUPER_ADMIN_USERNAME,
      password: await hashPassword("peseta832"),
      fullName: "WebMakerChile",
      email: "webmakerchile@gmail.com",
      role: "superadmin",
      plan: "premium_30",
    });
    console.log("Super admin created");
  } else if (superAdmin.role !== "superadmin" || superAdmin.plan !== "premium_30") {
    await storage.updateUser(superAdmin.id, { role: "superadmin", plan: "premium_30" });
  }

  // AUTH ROUTES
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { username, password, email, fullName } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Usuario y contraseña requeridos" });
      }
      if (username.toLowerCase() === SUPER_ADMIN_USERNAME) {
        return res.status(400).json({ message: "Ese nombre de usuario no está disponible" });
      }
      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.status(400).json({ message: "Ese nombre de usuario ya está en uso. Elige otro." });
      }
      if (email) {
        const existingEmail = await storage.getUserByEmail(email);
        if (existingEmail) {
          return res.status(400).json({ message: "Ese correo electrónico ya está registrado. Usa otro o inicia sesión." });
        }
      }
      const user = await storage.createUser({
        username,
        password: await hashPassword(password),
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
      if (!user || !(await verifyPassword(parsed.data.password, user.password))) {
        return res.status(401).json({ message: "Usuario o contraseña incorrectos" });
      }
      if (!isBcryptHash(user.password)) {
        const newHash = await hashPassword(parsed.data.password);
        await storage.updateUser(user.id, { password: newHash });
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

  app.delete("/api/auth/delete-account", async (req: Request, res: Response) => {
    const session = requireAuth(req, res);
    if (!session) return;
    try {
      const user = await storage.getUser(session.userId);
      if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
      if (user.username === SUPER_ADMIN_USERNAME) {
        return res.status(403).json({ message: "Esta cuenta no puede ser eliminada" });
      }
      await storage.deleteUser(session.userId);
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (token) sessions.delete(token);
      res.json({ message: "Cuenta eliminada exitosamente" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.put("/api/auth/change-password", async (req: Request, res: Response) => {
    const session = requireAuth(req, res);
    if (!session) return;
    const { currentPassword, newPassword } = req.body;
    const user = await storage.getUser(session.userId);
    if (!user || !(await verifyPassword(currentPassword, user.password))) {
      return res.status(400).json({ message: "Contraseña actual incorrecta" });
    }
    await storage.updateUser(session.userId, { password: await hashPassword(newPassword) });
    res.json({ message: "Contraseña actualizada" });
  });

  // ADMIN ROUTES
  app.get("/api/admin/users", async (req: Request, res: Response) => {
    const session = requireAdmin(req, res);
    if (!session) return;
    const allUsers = await storage.getAllUsers();
    const visibleUsers = allUsers.filter(u => u.username !== SUPER_ADMIN_USERNAME);
    res.json(visibleUsers.map(u => ({
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
      if (parsed.data.username.toLowerCase() === SUPER_ADMIN_USERNAME) {
        return res.status(400).json({ message: "Ese nombre de usuario no está disponible" });
      }
      const existing = await storage.getUserByUsername(parsed.data.username);
      if (existing) {
        return res.status(400).json({ message: "Ese nombre de usuario ya está en uso" });
      }
      if (parsed.data.email) {
        const existingEmail = await storage.getUserByEmail(parsed.data.email);
        if (existingEmail) {
          return res.status(400).json({ message: "Ese correo electrónico ya está registrado" });
        }
      }
      let planExpiry = null;
      if (parsed.data.plan === "premium_10") {
        planExpiry = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
      } else if (parsed.data.plan === "premium_30") {
        planExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      }
      const user = await storage.createUser({
        username: parsed.data.username,
        password: await hashPassword(parsed.data.password),
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
      const targetUser = await storage.getUser(req.params.id);
      if (!targetUser) return res.status(404).json({ message: "Usuario no encontrado" });
      if (targetUser.username === SUPER_ADMIN_USERNAME && session.role !== "superadmin") {
        return res.status(403).json({ message: "No tienes permiso para modificar esta cuenta" });
      }
      const parsed = adminUpdateUserSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: "Datos inválidos" });
      }
      if (parsed.data.email) {
        const existingEmail = await storage.getUserByEmail(parsed.data.email);
        if (existingEmail && existingEmail.id !== req.params.id) {
          return res.status(400).json({ message: "Ese correo electrónico ya está registrado" });
        }
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
      if (parsed.data.password) updates.password = await hashPassword(parsed.data.password);
      if (parsed.data.email !== undefined) updates.email = parsed.data.email;
      if (parsed.data.fullName !== undefined) updates.fullName = parsed.data.fullName;
      if (parsed.data.role) {
        if (targetUser.username === SUPER_ADMIN_USERNAME && parsed.data.role !== "superadmin") {
          return res.status(403).json({ message: "No se puede cambiar el rol de esta cuenta" });
        }
        if (parsed.data.role === "superadmin" && session.role !== "superadmin") {
          return res.status(403).json({ message: "Solo el super administrador puede asignar ese rol" });
        }
        updates.role = parsed.data.role;
      }
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
    const targetUser = await storage.getUser(req.params.id);
    if (targetUser && targetUser.username === SUPER_ADMIN_USERNAME) {
      return res.status(403).json({ message: "Esta cuenta no puede ser eliminada" });
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
      const user = await storage.getUser(session.userId);
      const baseUrl = `https://${process.env.REPLIT_DEV_DOMAIN || process.env.REPLIT_DOMAINS?.split(",")[0] || "localhost:5000"}`;

      const nameParts = (user?.fullName || "").trim().split(" ");
      const firstName = nameParts[0] || "Usuario";
      const lastName = nameParts.slice(1).join(" ") || "Practiquemos";

      const preference = {
        items: [{
          id: plan,
          title: config.title,
          description: `Acceso premium ${config.days} días - Practiquemos.cl - Preparación examen de conducir Chile`,
          category_id: "services",
          quantity: 1,
          unit_price: config.price,
          currency_id: "CLP",
        }],
        payer: {
          email: user?.email || "usuario@practiquemos.cl",
          first_name: firstName,
          last_name: lastName,
        },
        back_urls: {
          success: `${baseUrl}/api/payments/success`,
          failure: `${baseUrl}/api/payments/failure`,
          pending: `${baseUrl}/api/payments/pending`,
        },
        auto_return: "approved" as const,
        external_reference: `${session.userId}|${plan}`,
        notification_url: `${baseUrl}/api/payments/webhook`,
        statement_descriptor: "PRACTIQUEMOS.CL",
        binary_mode: true,
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

  app.post("/api/payments/revenucat-activate", async (req: Request, res: Response) => {
    const session = requireAuth(req, res);
    if (!session) return;
    try {
      const rcApiKey = process.env.REVENUECAT_API_KEY;
      if (!rcApiKey) {
        return res.status(500).json({ message: "RevenueCat no configurado en el servidor" });
      }

      const rcResponse = await fetch(`https://api.revenuecat.com/v1/subscribers/${session.userId}`, {
        headers: { "Authorization": `Bearer ${rcApiKey}` },
      });
      if (!rcResponse.ok) {
        return res.status(400).json({ message: "No se pudo verificar la compra" });
      }
      const subscriber = await rcResponse.json() as any;
      const entitlements = subscriber?.subscriber?.entitlements || {};
      const activeEntitlement = Object.values(entitlements).find(
        (e: any) => e.expires_date === null || new Date(e.expires_date) > new Date()
      ) as any;
      if (!activeEntitlement) {
        return res.status(400).json({ message: "No se encontró una compra activa" });
      }

      const productId = activeEntitlement.product_identifier || "";
      const plan = productId.includes("10") ? "premium_10" : "premium_30";
      const config = PLAN_CONFIG[plan];
      if (!config) return res.status(400).json({ message: "Plan no reconocido" });

      const expiry = new Date();
      expiry.setDate(expiry.getDate() + config.days);
      await db.update(users).set({ plan, planExpiry: expiry }).where(eq(users.id, session.userId));
      res.json({ message: "Plan activado", plan });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/payments/revenucat-webhook", async (req: Request, res: Response) => {
    try {
      const rcWebhookAuth = process.env.REVENUECAT_WEBHOOK_AUTH;
      if (rcWebhookAuth) {
        const authHeader = req.headers.authorization;
        if (authHeader !== `Bearer ${rcWebhookAuth}`) {
          return res.sendStatus(401);
        }
      }

      const event = req.body?.event;
      if (!event) return res.sendStatus(200);

      const appUserId = event.app_user_id;
      if (!appUserId) return res.sendStatus(200);

      const eventType = event.type;
      if (["INITIAL_PURCHASE", "RENEWAL", "PRODUCT_CHANGE"].includes(eventType)) {
        const productId = event.product_id || "";
        let plan = "premium_30";
        let days = 30;
        if (productId.includes("10")) {
          plan = "premium_10";
          days = 10;
        }
        const expiry = new Date();
        expiry.setDate(expiry.getDate() + days);
        await db.update(users).set({ plan, planExpiry: expiry }).where(eq(users.id, appUserId));
        console.log(`RevenueCat: ${eventType} for user ${appUserId}, plan ${plan}`);
      } else if (["EXPIRATION", "CANCELLATION"].includes(eventType)) {
        await db.update(users).set({ plan: "free", planExpiry: null }).where(eq(users.id, appUserId));
        console.log(`RevenueCat: ${eventType} for user ${appUserId}, reverted to free`);
      }

      res.sendStatus(200);
    } catch (err) {
      console.error("RevenueCat webhook error:", err);
      res.sendStatus(200);
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

  function getAppUrl() {
    const domains = process.env.REPLIT_DOMAINS?.split(",") || [];
    const productionDomain = domains.find(d => d.includes(".replit.app")) || domains[0];
    if (productionDomain) return `https://${productionDomain}`;
    if (process.env.REPLIT_DEV_DOMAIN) return `https://${process.env.REPLIT_DEV_DOMAIN}`;
    return "https://localhost:8081";
  }

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

    const appUrl = getAppUrl();
    res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Pago exitoso</title><meta http-equiv="refresh" content="3;url=${appUrl}"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:linear-gradient(135deg,#0c1d4d 0%,#1d4ed8 50%,#2563eb 100%);text-align:center;padding:20px}.card{background:#fff;border-radius:24px;padding:48px 36px;box-shadow:0 20px 60px rgba(0,0,0,0.3);max-width:380px;width:100%}.icon{font-size:64px;margin-bottom:16px}h1{color:#166534;font-size:22px;margin-bottom:12px;font-weight:700}p{color:#555;font-size:15px;line-height:1.5;margin-bottom:8px}.redirect{color:#94a3b8;font-size:13px;margin-top:20px}a{display:inline-block;margin-top:16px;background:linear-gradient(135deg,#1d4ed8,#2563eb);color:#fff;padding:14px 36px;border-radius:14px;text-decoration:none;font-weight:600;font-size:15px;transition:transform 0.2s}a:hover{transform:scale(1.03)}</style></head><body><div class="card"><div class="icon">&#10004;&#65039;</div><h1>¡Pago exitoso!</h1><p>Tu plan Premium ha sido activado correctamente.</p><p>Ya puedes disfrutar de todos los contenidos.</p><a href="${appUrl}">Volver a Practiquemos.cl</a><p class="redirect">Redirigiendo automáticamente...</p></div></body></html>`);
  });

  app.get("/api/payments/failure", (_req: Request, res: Response) => {
    const appUrl = getAppUrl();
    res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Pago no completado</title><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:linear-gradient(135deg,#0c1d4d 0%,#1d4ed8 50%,#2563eb 100%);text-align:center;padding:20px}.card{background:#fff;border-radius:24px;padding:48px 36px;box-shadow:0 20px 60px rgba(0,0,0,0.3);max-width:380px;width:100%}.icon{font-size:64px;margin-bottom:16px}h1{color:#c2410c;font-size:22px;margin-bottom:12px;font-weight:700}p{color:#555;font-size:15px;line-height:1.5;margin-bottom:8px}a{display:inline-block;margin-top:20px;background:linear-gradient(135deg,#1d4ed8,#2563eb);color:#fff;padding:14px 36px;border-radius:14px;text-decoration:none;font-weight:600;font-size:15px;transition:transform 0.2s}a:hover{transform:scale(1.03)}</style></head><body><div class="card"><div class="icon">&#128533;</div><h1>Pago no completado</h1><p>Hubo un problema con tu pago. Puedes intentarlo nuevamente desde la app.</p><a href="${appUrl}">Volver a Practiquemos.cl</a></div></body></html>`);
  });

  app.get("/api/payments/pending", (_req: Request, res: Response) => {
    const appUrl = getAppUrl();
    res.send(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Pago pendiente</title><meta http-equiv="refresh" content="5;url=${appUrl}"><style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:'Segoe UI',system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;background:linear-gradient(135deg,#0c1d4d 0%,#1d4ed8 50%,#2563eb 100%);text-align:center;padding:20px}.card{background:#fff;border-radius:24px;padding:48px 36px;box-shadow:0 20px 60px rgba(0,0,0,0.3);max-width:380px;width:100%}.icon{font-size:64px;margin-bottom:16px}h1{color:#92400e;font-size:22px;margin-bottom:12px;font-weight:700}p{color:#555;font-size:15px;line-height:1.5;margin-bottom:8px}.redirect{color:#94a3b8;font-size:13px;margin-top:20px}a{display:inline-block;margin-top:16px;background:linear-gradient(135deg,#1d4ed8,#2563eb);color:#fff;padding:14px 36px;border-radius:14px;text-decoration:none;font-weight:600;font-size:15px;transition:transform 0.2s}a:hover{transform:scale(1.03)}</style></head><body><div class="card"><div class="icon">&#9203;</div><h1>Pago pendiente</h1><p>Tu pago está siendo procesado. Te avisaremos cuando se confirme.</p><a href="${appUrl}">Volver a Practiquemos.cl</a><p class="redirect">Redirigiendo automáticamente...</p></div></body></html>`);
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
