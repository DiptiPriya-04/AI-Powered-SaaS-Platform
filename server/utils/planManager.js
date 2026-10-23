import sql from "../configs/db.js";

// In-memory cache of user subscriptions (fast, robust, survives requests)
const userPlansMemory = new Map();

/**
 * Update and persist a user's subscription tier
 */
export const setUserPlan = async (userId, plan = 'premium') => {
    if (!userId) return 'free';
    const normalized = (plan === 'free') ? 'free' : 'premium';
    userPlansMemory.set(userId, normalized);

    // Persist to Neon Postgres DB table
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS user_plans (
                user_id TEXT PRIMARY KEY,
                plan TEXT NOT NULL DEFAULT 'free',
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `;
        await sql`
            INSERT INTO user_plans (user_id, plan, updated_at)
            VALUES (${userId}, ${normalized}, NOW())
            ON CONFLICT (user_id) 
            DO UPDATE SET plan = ${normalized}, updated_at = NOW();
        `;
    } catch (e) {
        console.warn("user_plans DB note:", e.message);
    }

    return normalized;
};

/**
 * Retrieve user plan with multi-layer fallback (Memory -> DB -> Clerk)
 */
export const getUserPlan = async (userId, clerkUserMetadata = null) => {
    if (!userId || userId === 'dev_user_sandbox') return 'free';

    // 1. In-memory cache hit
    if (userPlansMemory.has(userId)) {
        return userPlansMemory.get(userId);
    }

    // 2. Neon PostgreSQL DB hit
    try {
        const rows = await sql`
            SELECT plan FROM user_plans WHERE user_id = ${userId} LIMIT 1
        `.catch(() => []);
        if (rows && rows.length > 0 && rows[0]?.plan) {
            const plan = (rows[0].plan === 'premium' || rows[0].plan === 'pro') ? 'premium' : 'free';
            userPlansMemory.set(userId, plan);
            return plan;
        }
    } catch (e) {
        // DB note
    }

    // 3. Clerk publicMetadata hit
    const rawClerkPlan = clerkUserMetadata?.plan;
    if (rawClerkPlan === 'premium' || rawClerkPlan === 'pro') {
        userPlansMemory.set(userId, 'premium');
        return 'premium';
    }

    return 'free';
};
