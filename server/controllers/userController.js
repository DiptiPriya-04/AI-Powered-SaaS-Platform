import sql from "../configs/db.js";
import { getAuth } from "@clerk/express";

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

        const safeCreations = (creations || []).map(c => ({
            ...c,
            likes: Array.isArray(c.likes) ? c.likes : []
        }));

        res.json({ success: true, creations: safeCreations });
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

        const safeCreations = (creations || []).map(c => ({
            ...c,
            likes: Array.isArray(c.likes) ? c.likes : []
        }));

        res.json({ success: true, creations: safeCreations });
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
        res.json({
            success: true,
            userId,
            plan: req.plan || 'free',
            free_usage: req.free_usage ?? 0
        });
    } catch (error) {
        console.error("getUserData error:", error);
        res.json({ success: false, message: error.message });
    }
};