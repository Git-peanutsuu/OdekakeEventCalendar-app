// 🚨 変更点: @neondatabase/serverless を pg に変更
import { Pool } from 'pg'; 
import { drizzle } from 'drizzle-orm/node-postgres'; // 🚨 変更点: node-postgresを使用
import * as schema from "@shared/schema";

// neonConfig.webSocketConstructor = ws;

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

// 🚨 変更点: pool オブジェクトを直接渡す
export const db = drizzle(pool, { schema }); 