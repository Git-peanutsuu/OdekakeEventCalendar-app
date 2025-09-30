import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// --- 🚨 修正が必要な箇所 ---
// 接続に必要な環境変数がすべて設定されているか確認
if (!process.env.DB_HOST || !process.env.DB_DATABASE || !process.env.DB_USER || !process.env.DB_PASSWORD) {
throw new Error(
"DB_HOST, DB_DATABASE, DB_USER, and DB_PASSWORD must be set for Cloud Run deployment.",
);
}

// 修正: 接続情報をオブジェクトとしてPoolに渡す
export const pool = new Pool({ 
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

export const db = drizzle({ client: pool, schema });
// --- 修正終わり ---