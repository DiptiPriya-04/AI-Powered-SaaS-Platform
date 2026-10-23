import sql from "../configs/db.js";
import { clerkClient, getAuth } from "@clerk/express";
import { setUserPlan, getUserPlan } from "../utils/planManager.js";

const getRequestUserId = (req) => {
    if (req.userId && req.userId !== "dev_user_sandbox") return req.userId;
    try {
        const authData = getAuth(req);
        if (authData?.userId) return authData.userId;
    } catch {}
    const authHeader = req.headers?.authorization || req.headers?.Authorization;
    if (authHeader && typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
        try {
            const token = authHeader.split(' ')[1];
            const parts = token.split('.');
            if (parts.length === 3) {
                const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
                if (payload.sub || payload.userId) return payload.sub || payload.userId;
            }
        } catch {}
    }
    return req.userId || null;
};

export const getUserCreations = async (req, res) => {
    try {
        const userId = getRequestUserId(req);
        if (!userId || userId === 'dev_user_sandbox') {
            return res.json({ success: true, creations: [] });
        }

        const creations = await sql`SELECT * FROM creations WHERE user_id = ${userId} ORDER BY created_at DESC`.catch(err => {
            console.warn("DB creations note:", err.message);
            return [];
        });
        res.json({ success: true, creations: creations || [] });
    } catch (error) {
        console.warn("getUserCreations note:", error.message);
        res.json({ success: true, creations: [] });
    }
};

export const getPublishedCreations = async (req, res) => {
    try {
        const creations = await sql`
            SELECT * FROM creations WHERE publish = true ORDER BY created_at DESC
        `.catch(err => {
            console.warn("DB published note:", err.message);
            return [];
        });
        res.json({ success: true, creations: creations || [] });
    } catch (error) {
        console.warn("getPublishedCreations note:", error.message);
        res.json({ success: true, creations: [] });
    }
};

export const toggleLikeCreation = async (req, res) => {
    try {
        const userId = getRequestUserId(req);
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ success: false, message: "Creation id is required" });
        }

        const [creation] = await sql`SELECT * FROM creations WHERE id = ${id}`;
        if (!creation) {
            return res.json({ success: false, message: "Creation not found" });
        }

        const currentLikes = Array.isArray(creation.likes) ? creation.likes : [];
        const userIdStr = userId.toString();
        let updatedLikes;
        let message;

        if (currentLikes.includes(userIdStr)) {
            updatedLikes = currentLikes.filter((user) => user !== userIdStr);
            message = 'Creation Unliked';
        } else {
            updatedLikes = [...currentLikes, userIdStr];
            message = 'Creation Liked';
        }

        const formattedArray = updatedLikes.length > 0 
            ? `{${updatedLikes.map(u => `"${u.replace(/"/g, '')}"`).join(',')}}` 
            : '{}';

        await sql`UPDATE creations SET likes = ${formattedArray}::text[], updated_at = NOW() WHERE id = ${id}`;

        res.json({ success: true, message, likes: updatedLikes });
    } catch (error) {
        console.error("toggleLikeCreation error:", error);
        res.json({ success: false, message: error.message });
    }
};

export const getUserData = async (req, res) => {
    try {
        const userId = getRequestUserId(req);
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        let freeUsage = req.free_usage ?? 0;
        let clerkMeta = null;

        if (process.env.CLERK_SECRET_KEY) {
            try {
                const user = await clerkClient.users.getUser(userId);
                clerkMeta = user.publicMetadata;
                freeUsage = user.publicMetadata?.free_usage ?? user.privateMetadata?.free_usage ?? freeUsage;
            } catch (err) {
                console.warn("Clerk fetch note in getUserData:", err.message);
            }
        }

        const userPlan = await getUserPlan(userId, clerkMeta);

        res.json({
            success: true,
            userId,
            plan: userPlan,
            free_usage: freeUsage
        });
    } catch (error) {
        console.error("getUserData error:", error);
        res.json({ success: false, message: error.message });
    }
};

export const updateUserPlan = async (req, res) => {
    try {
        const userId = getRequestUserId(req);
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
        }

        const { plan = 'premium' } = req.body;
        const normalizedPlan = (plan === 'free') ? 'free' : 'premium';

        // 1. Immediately persist to memory & Postgres DB
        await setUserPlan(userId, normalizedPlan);

        // 2. Also sync with Clerk user publicMetadata
        if (process.env.CLERK_SECRET_KEY) {
            await clerkClient.users.updateUserMetadata(userId, {
                publicMetadata: {
                    plan: normalizedPlan,
                    plan_tier: plan
                }
            }).catch(err => {
                console.warn("Clerk metadata update warning:", err.message);
            });
        }

        res.json({
            success: true,
            message: normalizedPlan === 'premium'
                ? "🎉 You have been upgraded to Premium Pro! Unlimited access unlocked."
                : "Plan changed to Free Starter tier.",
            plan: normalizedPlan
        });
    } catch (error) {
        console.error("updateUserPlan error:", error);
        res.status(500).json({ success: false, message: error.message || "Failed to update plan" });
    }
};