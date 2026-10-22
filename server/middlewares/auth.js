import { clerkClient, getAuth } from "@clerk/express";

// Middleware to check userId, free_usage, and subscription plan
export const auth = async (req, res, next) => {
    try {
        if (!process.env.CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
            req.userId = "dev_user_sandbox";
            req.plan = "premium";
            req.free_usage = 0;
            return next();
        }

        const authData = getAuth(req);
        const userId = authData?.userId;

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized access. Please log in." });
        }

        let hasPremiumPlan = false;
        try {
            if (typeof authData?.has === 'function') {
                hasPremiumPlan = Boolean(authData.has({ plan: 'premium' }));
            }
        } catch (e) {
            hasPremiumPlan = false;
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
        const currentMetadataPlan = user?.publicMetadata?.plan;
        const resolvedPlan = (currentMetadataPlan === 'premium' || currentMetadataPlan === 'pro' || hasPremiumPlan) ? 'premium' : 'free';

        req.userId = userId;
        req.plan = resolvedPlan;
        req.free_usage = freeUsage;

        // Ensure publicMetadata has free_usage and plan for frontend visibility
        if (user.publicMetadata?.free_usage === undefined || user.publicMetadata?.plan !== req.plan) {
            await clerkClient.users.updateUserMetadata(userId, {
                publicMetadata: {
                    free_usage: freeUsage,
                    plan: req.plan
                },
                privateMetadata: {
                    free_usage: freeUsage
                }
            }).catch(err => console.error("Metadata update warning:", err.message));
        }

        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        res.status(401).json({ success: false, message: error.message || "Authentication failed" });
    }
};