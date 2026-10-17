import { clerkClient, getAuth } from "@clerk/express";

// Middleware to check userId, free_usage, and subscription plan
export const auth = async (req, res, next) => {
    try {
        if (!process.env.CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
            // In development when keys are not configured, use sandbox user so tools can be tested
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

        const hasPremiumPlan = typeof authData.has === 'function' 
            ? await authData.has({ plan: 'premium' }) 
            : false;

        let user = null;
        try {
            if (clerkClient && clerkClient.users) {
                user = await clerkClient.users.getUser(userId);
            }
        } catch (e) {
            console.warn("Clerk getUser note:", e.message);
        }

        const freeUsage = user?.publicMetadata?.free_usage ?? user?.privateMetadata?.free_usage ?? 0;

        req.userId = userId;
        req.plan = hasPremiumPlan ? 'premium' : (user?.publicMetadata?.plan || 'free');
        req.free_usage = freeUsage;

        // Ensure publicMetadata has free_usage and plan for frontend visibility
        if (user && (user.publicMetadata?.free_usage === undefined || user.publicMetadata?.plan !== req.plan)) {
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