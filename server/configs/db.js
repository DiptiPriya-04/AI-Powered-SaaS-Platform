import { neon } from "@neondatabase/serverless";

let sqlClient = null;
let initialized = false;

export const initDb = async (client) => {
    if (initialized) return;
    try {
        await client`
            CREATE TABLE IF NOT EXISTS creations (
                id SERIAL PRIMARY KEY,
                user_id TEXT NOT NULL,
                prompt TEXT NOT NULL,
                content TEXT NOT NULL,
                type TEXT NOT NULL,
                publish BOOLEAN DEFAULT FALSE,
                likes TEXT[] DEFAULT '{}',
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `;
        await client`
            CREATE TABLE IF NOT EXISTS pdf_chats (
                id SERIAL PRIMARY KEY,
                user_id TEXT NOT NULL,
                file_name TEXT NOT NULL,
                user_message TEXT NOT NULL,
                ai_response TEXT NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW()
            );
        `;
        initialized = true;
        console.log("✅ Database tables verified/initialized successfully.");
    } catch (e) {
        console.warn("DB init warning:", e.message);
    }
};

const getSql = () => {
    if (!process.env.DATABASE_URL) {
        return async () => {
            throw new Error("DATABASE_URL is not configured. Please add your PostgreSQL/Neon connection string to server/.env");
        };
    }
    if (!sqlClient) {
        sqlClient = neon(process.env.DATABASE_URL);
        initDb(sqlClient).catch(() => {});
    }
    return sqlClient;
};

const sql = (strings, ...values) => {
    const client = getSql();
    return client(strings, ...values);
};

export default sql;

// Neon DB Schema:
// CREATE TABLE IF NOT EXISTS creations (
//     id SERIAL PRIMARY KEY,
//     user_id TEXT NOT NULL,
//     prompt TEXT NOT NULL,
//     content TEXT NOT NULL,
//     type TEXT NOT NULL,
//     publish BOOLEAN DEFAULT FALSE,
//     likes TEXT[] DEFAULT '{}',
//     created_at TIMESTAMPTZ DEFAULT NOW(),
//     updated_at TIMESTAMPTZ DEFAULT NOW()
// );
// CREATE TABLE IF NOT EXISTS pdf_chats (
//     id SERIAL PRIMARY KEY,
//     user_id TEXT NOT NULL,
//     file_name TEXT NOT NULL,
//     user_message TEXT NOT NULL,
//     ai_response TEXT NOT NULL,
//     created_at TIMESTAMPTZ DEFAULT NOW()
// );