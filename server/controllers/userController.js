import sql from "../configs/db.js";
import { clerkClient, getAuth } from "@clerk/express";

const getRequestUserId = (req) => {
    if (req.userId) return req.userId;
    const authData = getAuth(req);
    return authData?.userId;
};

export const getUserCreations = async (req, res) => {
    try {
        const userId = getRequestUserId(req);
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
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

        let userPlan = req.plan || 'free';
        let freeUsage = req.free_usage ?? 0;

        if (process.env.CLERK_SECRET_KEY) {
            try {
                const user = await clerkClient.users.getUser(userId);
                userPlan = user.publicMetadata?.plan || userPlan;
                freeUsage = user.publicMetadata?.free_usage ?? user.privateMetadata?.free_usage ?? freeUsage;
            } catch (err) {
                console.warn("Clerk fetch note in getUserData:", err.message);
            }
        }

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