import { clerkClient, getAuth } from "@clerk/express";

// Middleware to check userId, free_usage, and subscription plan
export const auth = async (req, res, next) => {
    try {
        if (!process.env.CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
            req.userId = "dev_user_sandbox";
            req.plan = "free";
            req.free_usage = 0;
            return next();
        }

        const authData = getAuth(req);
        const userId = authData?.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized access. Please log in." });
        }

        let user = null;
        try {
            if (clerkClient && clerkClient.users) {
                user = await clerkClient.users.getUser(userId);
            }
        } catch (e) {
            console.warn("Clerk getUser note:", e.message);
        }

        const freeUsage = user?.publicMetadata?.free_usage ?? user?.privateMetadata?.free_usage ?? 0;
        
        // Strict plan resolution: only users who explicitly upgraded have 'premium' in metadata
        const currentMetadataPlan = user?.publicMetadata?.plan;
        const resolvedPlan = (currentMetadataPlan === 'premium' || currentMetadataPlan === 'pro') ? 'premium' : 'free';

        req.userId = userId;
        req.plan = resolvedPlan;
        req.free_usage = freeUsage;

        // Ensure newly registered users are initialized with plan: 'free' and free_usage: 0
        if (user && (user.publicMetadata?.plan === undefined || user.publicMetadata?.free_usage === undefined)) {
            await clerkClient.users.updateUserMetadata(userId, {
                publicMetadata: {
                    free_usage: freeUsage,
                    plan: resolvedPlan
                },
                privateMetadata: {
                    free_usage: freeUsage
                }
            }).catch(err => console.warn("Clerk metadata init note:", err.message));
        }

        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        res.status(401).json({ success: false, message: error.message || "Authentication failed" });
    }
};