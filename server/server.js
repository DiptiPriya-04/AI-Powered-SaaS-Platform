import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();
import { clerkMiddleware } from '@clerk/express';
import aiRouter from "./routes/aiRoutes.js";
import connectCloudinary from "./configs/cloudinary.js";
import userRouter from "./routes/userRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Cloudinary
connectCloudinary().catch(err => console.warn("Cloudinary initialization note:", err.message));

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
const hasClerkKeys = Boolean(process.env.CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY);

if (hasClerkKeys) {
    app.use(clerkMiddleware({
        publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
        secretKey: process.env.CLERK_SECRET_KEY
    }));
} else {
    console.warn("\x1b[33m⚠️  [Clerk Notice] CLERK_PUBLISHABLE_KEY and/or CLERK_SECRET_KEY are not set in server/.env\x1b[0m");
    console.warn("\x1b[33m   Get your API keys from: https://dashboard.clerk.com/last-active?path=api-keys\x1b[0m");
    console.warn("\x1b[33m   Protected AI routes will require authentication once keys are configured.\x1b[0m\n");
    app.use((req, res, next) => {
        next();
    });
}

app.get(['/', '/api'], (req, res) => {
    res.json({
        name: "CreationSuite.ai API",
        status: "active",
        timestamp: new Date().toISOString()
    });
});

app.use('/api/ai', aiRouter);
app.use('/ai', aiRouter);
app.use('/api/user', userRouter);
app.use('/user', userRouter);

// Global 404 handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: "API endpoint not found" });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error("Unhandled server error:", err);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal server error"
    });
});

if (!process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

export default app;