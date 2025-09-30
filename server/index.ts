import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db } from './db';
// 🚨 追記: pg の Pool をインポート
import { pool } from './db.ts'; 
// 🚨 追記: connect-pg-simple を設定
import connectPgSimple from 'connect-pg-simple';

const app = express();
const PgStore = connectPgSimple(session);

app.use(session({
    store: new PgStore({ // 🚨 修正: ここでPgStoreを使用
        pool: pool,      // 🚨 修正: db.ts で定義した接続プールを渡す
        tableName: 'session', // セッション情報を保存するテーブル名
        createTableIfMissing: true // テーブルが存在しない場合は自動作成
    }),
    secret: process.env.SESSION_SECRET || 'calendar-app-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Run database migrations on startup
  try {
    log("Running database migrations...");
    await migrate(db, { migrationsFolder: './migrations' });
    log("Database migrations completed successfully");
  } catch (error: any) {
    // Handle case where tables already exist (e.g., in development)
    if (error?.code === '42P07' && error?.message?.includes('already exists')) {
      log("Tables already exist, skipping migration");
    } else {
      console.error("Failed to run database migrations:", error);
      process.exit(1);
    }
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
