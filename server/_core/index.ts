import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Trust proxy (required for rate-limiting behind reverse proxy / load balancer)
  app.set("trust proxy", 1);

  // ─── Security Middleware ─────────────────────────────────────────────────────────────────────────────
  app.use(helmet({
    contentSecurityPolicy: false, // Vite needs this disabled
    crossOriginEmbedderPolicy: false,
  }));

  app.use(cors({
    origin: process.env.NODE_ENV === "production"
      ? ["https://go-umrah.com", "https://www.go-umrah.com", "https://go-umrah-dm5hkgyr.manus.space"]
      : true,
    credentials: true,
  }));

  // OCR rate limit (expensive operation) - must be registered before general API limiter
  const ocrLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: { error: "OCR limit reached. Try again in an hour." },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/api/trpc/passport.extractOCR", ocrLimiter);

  // General API rate limit
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: { error: "Too many requests, please try again later." },
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use("/api/trpc", apiLimiter);
  // ─────────────────────────────────────────────────────────────────────────────

  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // ─── Moyasar Payment Callback ─────────────────────────────────────────────
  app.get("/api/payment/callback", async (req, res) => {
    const { id: paymentId, bookingNumber } = req.query as Record<string, string>;

    if (!paymentId || !bookingNumber) {
      return res.redirect("/?payment=error");
    }

    try {
      const { getPayment } = await import("../moyasar");
      const { getDb: _getDb } = await import("../db");
      const { bookings: _bookings } = await import("../../drizzle/schema");
      const { eq: _eq } = await import("drizzle-orm");

      const payment = await getPayment(paymentId);
      const db = await _getDb();

      if (db && (payment.status === "paid" || payment.status === "captured")) {
        await db.update(_bookings)
          .set({ paymentStatus: "paid", status: "confirmed", paidAt: new Date() })
          .where(_eq(_bookings.bookingNumber, bookingNumber));

        return res.redirect(`/voucher?ref=${bookingNumber}&paid=1`);
      }

      return res.redirect(`/voucher?ref=${bookingNumber}&paid=0`);
    } catch (err) {
      console.error("[Payment Callback] Error:", err);
      return res.redirect("/?payment=error");
    }
  });
  // ─────────────────────────────────────────────────────────────────────────

  // ─── Moyasar Unified Payment Callback (orders + visas) ────────────────────
  app.get("/api/payment/callback-unified", async (req, res) => {
    const { id: paymentId, serviceType, serviceId } = req.query as Record<string, string>;

    if (!paymentId || !serviceType || !serviceId) {
      return res.redirect("/?payment=error");
    }

    try {
      const { verifyUnifiedPayment } = await import("../payment-unified");
      const result = await verifyUnifiedPayment(paymentId, serviceType as any, Number(serviceId));

      if (result.success) {
        const redirectMap: Record<string, string> = {
          order: `/pay/order/${serviceId}?paid=1`,
          visa: `/pay/visa/${serviceId}?paid=1`,
          booking: `/voucher?ref=${serviceId}&paid=1`,
        };
        return res.redirect(redirectMap[serviceType] || `/?payment=success`);
      }

      return res.redirect(`/pay/${serviceType}/${serviceId}?paid=0`);
    } catch (err) {
      console.error("[Unified Payment Callback] Error:", err);
      return res.redirect("/?payment=error");
    }
  });
  // ─────────────────────────────────────────────────────────────────────────

  // ─── Domain Verification Files ────────────────────────────────────────────
  app.get("/AgodaPartnerVerification.html", (_req, res) => {
    res.setHeader("Content-Type", "text/html; charset=UTF-8");
    res.send(`<!DOCTYPE html>
<html>
<head>
    <meta name="agoda-partner-site-verification" content="AgodaPartnerVerification.html" />
    <title>Agoda Partner Site Verification</title>
</head>
<body>
    agoda-partner-site-verification: AgodaPartnerVerification.html
</body>
</html>`);
  });
  // ─────────────────────────────────────────────────────────────────────────

  // ─── SEO: Dynamic sitemap.xml ─────────────────────────────────────────────
  app.get("/sitemap.xml", (_req, res) => {
    const baseUrl = "https://go-umrah.net";
    const staticRoutes = ["/", "/hajj", "/umrah", "/hotels", "/flights", "/visa", "/transport", "/tours", "/store", "/news", "/media", "/flexible-request", "/complaints"];
    const urls = staticRoutes.map(path =>
      `  <url><loc>${baseUrl}${path}</loc><changefreq>weekly</changefreq><priority>${path === "/" ? "1.0" : "0.8"}</priority></url>`
    ).join("\n");
    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
    res.setHeader("Content-Type", "application/xml");
    res.send(xml);
  });
  // ─────────────────────────────────────────────────────────────────────────

  // ─── Live Stats for Homepage ─────────────────────────────────────────────
  app.get("/api/live-stats", async (_req, res) => {
    try {
      const db = await getDb();
      if (!db) return res.json({ bookings: 0, providers: 0, users: 0 });
      const { bookings: bTable, providerProfiles: pTable, users: uTable } = await import("../../drizzle/schema");
      const [bRow] = await db.select({ count: sql`count(*)` }).from(bTable);
      const [pRow] = await db.select({ count: sql`count(*)` }).from(pTable);
      const [uRow] = await db.select({ count: sql`count(*)` }).from(uTable);
      return res.json({
        bookings: Number((bRow as any)?.count ?? 0),
        providers: Number((pRow as any)?.count ?? 0),
        users: Number((uRow as any)?.count ?? 0),
      });
    } catch { return res.json({ bookings: 0, providers: 0, users: 0 }); }
  });
  // ─────────────────────────────────────────────────────────────────────────

  // ─── SSE Real-time Notifications ─────────────────────────────────────────────
  const sseClients = new Map<number, Set<any>>();
  (global as any).sendRealtimeNotification = (userId: number, data: object) => {
    const clients = sseClients.get(userId);
    if (!clients) return;
    const payload = `data: ${JSON.stringify(data)}\n\n`;
    clients.forEach((res: any) => { try { res.write(payload); } catch {} });
  };
  app.get("/api/notifications/stream", async (req: any, res: any) => {
    const context = await createContext({ req, res } as any);
    if (!context.user) { res.status(401).end(); return; }
    const userId = context.user.id;
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();
    res.write(`data: ${JSON.stringify({ type: "connected", userId })}\n\n`);
    if (!sseClients.has(userId)) sseClients.set(userId, new Set());
    sseClients.get(userId)!.add(res);
    const heartbeat = setInterval(() => { try { res.write(": ping\n\n"); } catch {} }, 25000);
    req.on("close", () => {
      clearInterval(heartbeat);
      sseClients.get(userId)?.delete(res);
      if (sseClients.get(userId)?.size === 0) sseClients.delete(userId);
    });
  });
  // ─────────────────────────────────────────────────────────────────────────
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);

// ─── News Auto-Fetch Scheduler ────────────────────────────────────────────────────────
import { getDb } from "../db";
import { newsSources } from "../../drizzle/schema";
import { eq, and, lt, sql } from "drizzle-orm";
import { fetchNewsFromSource } from "../routers/newsRouter";

async function runNewsScheduler() {
  try {
    const db = await getDb();
    if (!db) return;
    const now = Date.now();
    // Get sources that are due for fetching (lastFetchedAt + fetchInterval*60000 < now)
    const sources = await db
      .select()
      .from(newsSources)
      .where(
        and(
          eq(newsSources.isActive, true),
          eq(newsSources.type, "rss")
        )
      );
    for (const source of sources) {
      const nextFetch = (source.lastFetchedAt || 0) + source.fetchInterval * 60 * 1000;
      if (now >= nextFetch) {
        try {
          const inserted = await fetchNewsFromSource(source.id);
          if (inserted > 0) {
            console.log(`[News] Fetched ${inserted} articles from ${source.nameAr}`);
          }
        } catch (err) {
          console.error(`[News] Error fetching from ${source.nameAr}:`, err);
        }
      }
    }
  } catch (err) {
    console.error("[News] Scheduler error:", err);
  }
}

// Run scheduler every 10 minutes
setTimeout(() => {
  runNewsScheduler(); // Initial run after 30s
  setInterval(runNewsScheduler, 10 * 60 * 1000); // Every 10 minutes
}, 30000);
