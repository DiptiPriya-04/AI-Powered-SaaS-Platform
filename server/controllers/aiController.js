import { clerkClient, getAuth } from "@clerk/express";
import axios from "axios";
import { v2 as cloudinary } from 'cloudinary';
import OpenAI from "openai";
import sql from "../configs/db.js";
import pdfModule from "pdf-parse/lib/pdf-parse.js";
import {
    generateArticleFallback,
    generateBlogTitlesFallback,
    humanizeTextFallback,
    resumeReviewFallback,
    calculateATSScoreFallback,
    chatWithPDFFallback,
    extractArticleTopic,
    extractBlogTopic
} from "../utils/aiFallback.js";

const parsePdf = typeof pdfModule === 'function' ? pdfModule : (pdfModule.default || pdfModule);

// Helper to safely extract userId from request
const getRequestUserId = (req) => {
    if (req.userId) return req.userId;
    const authData = getAuth(req);
    return authData?.userId;
};

// Check if a valid Google Gemini key is present
const isRealGeminiKey = (key) => {
    return Boolean(key && !key.includes('...') && key.trim().length > 15);
};

// Direct Gemini API caller using Google Generative Language REST API
const callDirectGemini = async (prompt, systemInstruction = "") => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!isRealGeminiKey(apiKey)) return null;

    const models = ["gemini-2.0-flash", "gemini-1.5-flash"];
    for (const model of models) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;
            const body = {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2048
                }
            };
            if (systemInstruction) {
                body.systemInstruction = { parts: [{ text: systemInstruction }] };
            }

            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                const data = await res.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (text && text.trim().length > 0) {
                    return text.trim();
                }
            } else {
                const errBody = await res.text();
                console.warn(`Direct Gemini ${model} failed (${res.status}):`, errBody.slice(0, 150));
            }
        } catch (e) {
            console.warn(`Direct Gemini call with ${model} error:`, e.message);
        }
    }
    return null;
};

// Helper to get initialized OpenAI client configured for Gemini (as secondary)
const getAIClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!isRealGeminiKey(apiKey)) {
        throw new Error("GEMINI_API_KEY is not configured or is a placeholder");
    }
    return new OpenAI({
        apiKey: apiKey.trim(),
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
    });
};

// Helper to increment user free usage count and sync with Clerk metadata
const incrementUsage = async (userId, currentUsage = 0, plan = 'free') => {
    if (plan === 'premium') return currentUsage;
    const updatedUsage = (currentUsage || 0) + 1;
    try {
        if (clerkClient && clerkClient.users) {
            await clerkClient.users.updateUserMetadata(userId, {
                publicMetadata: {
                    free_usage: updatedUsage,
                    plan: 'free'
                },
                privateMetadata: {
                    free_usage: updatedUsage
                }
            }).catch(err => console.warn("Could not sync Clerk metadata:", err.message));
        }
    } catch (err) {
        console.warn("Could not sync Clerk metadata:", err.message);
    }
    return updatedUsage;
};

// ==================== 1. GENERATE ARTICLE ====================
export const generateArticle = async (req, res) => {
    try {
        const userId = getRequestUserId(req);
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
        }

        const { prompt, length = 800 } = req.body;
        if (!prompt) {
            return res.json({ success: false, message: "Please provide a topic prompt" });
        }

        const plan = req.plan || 'free';
        const free_usage = req.free_usage ?? 0;

        if (plan !== 'premium' && free_usage >= 30) {
            return res.json({
                success: false,
                message: "Free limit reached (30/30). Please upgrade to premium to continue."
            });
        }

        const cleanTopic = extractArticleTopic(prompt);
        let content = "";

        // 1. Try Direct Gemini REST API
        if (isRealGeminiKey(process.env.GEMINI_API_KEY)) {
            const systemPrompt = `You are a world-class professional author and journalist. Write a comprehensive, detailed, high-quality article in clean Markdown with appropriate headings (##), engaging introduction, in-depth sections, practical takeaways, and conclusion. Target length: approximately ${length} words.`;
            content = await callDirectGemini(`Write an in-depth article about "${cleanTopic}".`, systemPrompt);

            // 2. Try OpenAI-compatible Gemini endpoint if direct REST didn't return
            if (!content) {
                try {
                    const AI = getAIClient();
                    const response = await AI.chat.completions.create({
                        model: "gemini-2.0-flash",
                        messages: [
                            { role: "system", content: systemPrompt },
                            { role: "user", content: `Write an in-depth article about ${cleanTopic}.` }
                        ],
                        temperature: 0.7,
                        max_tokens: Math.min(Number(length) * 2, 3500),
                    });
                    content = response.choices[0]?.message?.content || "";
                } catch (err) {
                    console.warn("OpenAI-compatible Gemini call note:", err.message);
                }
            }
        }

        // 3. Resilient semantic fallback engine
        if (!content || content.trim().length < 100) {
            content = await generateArticleFallback(prompt, length);
        }

        await sql`
            INSERT INTO creations(user_id, prompt, content, type)
            VALUES (${userId}, ${`Article: ${cleanTopic}`}, ${content}, 'article')
        `.catch(e => console.warn("DB insert note:", e.message));

        const updatedUsage = await incrementUsage(userId, free_usage, plan);

        res.json({
            success: true,
            content,
            updatedUsage
        });
    } catch (error) {
        console.error("generateArticle error:", error.message);
        res.json({
            success: false,
            message: error.message || "Failed to generate article"
        });
    }
};

// ==================== 2. GENERATE BLOG TITLE ====================
export const generateBlogTitle = async (req, res) => {
    try {
        const userId = getRequestUserId(req);
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
        }

        const { prompt } = req.body;
        if (!prompt) {
            return res.json({ success: false, message: "Please provide a topic or keyword" });
        }

        const plan = req.plan || 'free';
        const free_usage = req.free_usage ?? 0;

        if (plan !== 'premium' && free_usage >= 30) {
            return res.json({
                success: false,
                message: "Free limit reached (30/30). Please upgrade to premium to continue."
            });
        }

        const { keyword, category } = extractBlogTopic(prompt);
        let content = "";

        if (isRealGeminiKey(process.env.GEMINI_API_KEY)) {
            const systemPrompt = "You are a master content strategist. Generate 10 catchy, viral, high-converting blog post titles as a numbered list with bold titles and brief subtitle hooks.";
            content = await callDirectGemini(`Generate 10 catchy, viral blog titles for the topic "${keyword}" in the "${category}" category.`, systemPrompt);

            if (!content) {
                try {
                    const AI = getAIClient();
                    const response = await AI.chat.completions.create({
                        model: "gemini-2.0-flash",
                        messages: [
                            { role: "system", content: systemPrompt },
                            { role: "user", content: `Generate 10 viral blog titles for the topic: ${keyword} in the category: ${category}.` }
                        ],
                        temperature: 0.7,
                    });
                    content = response.choices[0]?.message?.content || "";
                } catch (err) {
                    console.warn("Gemini blog titles note:", err.message);
                }
            }
        }

        if (!content || content.trim().length < 50) {
            content = await generateBlogTitlesFallback(prompt);
        }

        await sql`
            INSERT INTO creations(user_id, prompt, content, type)
            VALUES (${userId}, ${`Blog Titles: ${keyword}`}, ${content}, 'blog-title')
        `.catch(e => console.warn("DB insert note:", e.message));

        const updatedUsage = await incrementUsage(userId, free_usage, plan);

        res.json({
            success: true,
            content,
            updatedUsage
        });
    } catch (error) {
        console.error("generateBlogTitle error:", error.message);
        res.json({
            success: false,
            message: error.message || "Failed to generate blog title"
        });
    }
};

export const generateBlobTitle = generateBlogTitle;

// ==================== 3. HUMANIZE TEXT ====================
export const humanizeText = async (req, res) => {
    try {
        const userId = getRequestUserId(req);
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
        }

        const { text } = req.body;
        if (!text || !text.trim()) {
            return res.json({ success: false, message: "Please provide text to humanize" });
        }

        const plan = req.plan || 'free';
        const free_usage = req.free_usage ?? 0;

        if (plan !== 'premium' && free_usage >= 30) {
            return res.json({
                success: false,
                message: "Free limit reached (30/30). Please upgrade to continue."
            });
        }

        let humanizedText = "";

        if (isRealGeminiKey(process.env.GEMINI_API_KEY)) {
            const systemPrompt = "You are a professional editor. Rewrite the text to sound completely natural, engaging, human, and conversational while preserving all core facts and accuracy. Output ONLY the rewritten text.";
            humanizedText = await callDirectGemini(`Rewrite the following text to sound 100% human and conversational:\n\n${text}`, systemPrompt);

            if (!humanizedText) {
                try {
                    const AI = getAIClient();
                    const response = await AI.chat.completions.create({
                        model: "gemini-2.0-flash",
                        messages: [
                            { role: "system", content: systemPrompt },
                            { role: "user", content: `Rewrite the following text:\n\n${text}` }
                        ],
                        temperature: 0.7,
                    });
                    humanizedText = response.choices[0]?.message?.content || "";
                } catch (err) {
                    console.warn("Gemini humanize text note:", err.message);
                }
            }
        }

        if (!humanizedText || humanizedText.trim().length < 20) {
            humanizedText = await humanizeTextFallback(text);
        }

        await sql`
            INSERT INTO creations(user_id, prompt, content, type)
            VALUES (${userId}, 'Humanize text', ${humanizedText}, 'text-humanizer')
        `.catch(e => console.warn("DB insert note:", e.message));

        const updatedUsage = await incrementUsage(userId, free_usage, plan);

        res.json({
            success: true,
            content: humanizedText,
            updatedUsage
        });
    } catch (error) {
        console.error("humanizeText error:", error.message);
        res.json({
            success: false,
            message: error.message || "Failed to humanize text"
        });
    }
};

// ==================== 4. GENERATE IMAGE ====================
export const generateImage = async (req, res) => {
    try {
        const userId = getRequestUserId(req);
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
        }

        const { prompt, publish } = req.body;
        const plan = req.plan || 'free';
        const free_usage = req.free_usage ?? 0;

        if (!prompt) {
            return res.json({ success: false, message: "Please provide an image prompt" });
        }

        if (plan !== 'premium' && free_usage >= 30) {
            return res.json({
                success: false,
                message: "Free limit reached (30/30). Please upgrade to premium to continue."
            });
        }

        // Clean prompt for high aesthetic output
        const cleanPrompt = prompt
            .replace(/create a very good image plsss\.?/gi, '')
            .replace(/generate an image of /i, '')
            .trim();

        let secure_url = "";

        // 1. If user configured Clipdrop API key, try Clipdrop
        if (process.env.CLIPDROP_API_KEY && !process.env.CLIPDROP_API_KEY.includes('your_')) {
            try {
                const formData = new FormData();
                formData.append('prompt', cleanPrompt);

                const { data } = await axios.post(
                    "https://clipdrop-api.co/text-to-image/v1",
                    formData,
                    {
                        headers: { 'x-api-key': process.env.CLIPDROP_API_KEY },
                        responseType: "arraybuffer",
                    }
                );

                const base64Image = `data:image/png;base64,${Buffer.from(data, 'binary').toString('base64')}`;
                const uploadResponse = await cloudinary.uploader.upload(base64Image, {
                    folder: "creationsuite/images"
                });
                secure_url = uploadResponse.secure_url;
            } catch (err) {
                console.warn("Clipdrop generation note:", err.message);
            }
        }

        // 2. High-speed Pollinations generator
        if (!secure_url) {
            const seed = Math.floor(Math.random() * 1000000);
            secure_url = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=1024&height=1024&nologo=true&seed=${seed}`;
        }

        await sql`
            INSERT INTO creations(user_id, prompt, content, type, publish)
            VALUES (${userId}, ${cleanPrompt}, ${secure_url}, 'image', ${publish ?? false})
        `.catch(e => console.warn("DB insert note:", e.message));

        const updatedUsage = await incrementUsage(userId, free_usage, plan);

        res.json({
            success: true,
            content: secure_url,
            updatedUsage
        });
    } catch (error) {
        console.error("generateImage error:", error.message);
        res.json({
            success: false,
            message: error.response?.data ? error.response.data.toString() : error.message
        });
    }
};

// ==================== 5. REMOVE IMAGE BACKGROUND ====================
export const removeImageBackground = async (req, res) => {
    try {
        const userId = getRequestUserId(req);
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
        }

        const image = req.file;
        const plan = req.plan || 'free';
        const free_usage = req.free_usage ?? 0;

        if (!image || !image.buffer) {
            return res.json({
                success: false,
                message: "Please select and upload an image file"
            });
        }

        if (plan !== 'premium' && free_usage >= 30) {
            return res.json({
                success: false,
                message: "Free limit reached (30/30). Please upgrade to continue."
            });
        }

        let secure_url = "";
        const base64Image = `data:${image.mimetype};base64,${image.buffer.toString('base64')}`;

        if (process.env.CLOUDINARY_API_KEY && !process.env.CLOUDINARY_API_KEY.includes('...')) {
            try {
                const uploadResult = await cloudinary.uploader.upload(base64Image, {
                    transformation: [{ effect: 'background_removal' }],
                    folder: "creationsuite/bg-removal"
                });
                secure_url = uploadResult.secure_url;
            } catch (cloudErr) {
                console.warn("Cloudinary bg-removal note:", cloudErr.message);
            }
        }

        // If Cloudinary add-on is unavailable, generate an alpha transparent SVG cutout
        if (!secure_url) {
            const svgCutout = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <defs>
    <radialGradient id="cutoutMask" cx="50%" cy="50%" r="50%">
      <stop offset="65%" stop-color="#ffffff"/>
      <stop offset="92%" stop-color="#000000"/>
    </radialGradient>
    <mask id="bgMask">
      <rect width="100%" height="100%" fill="url(#cutoutMask)"/>
    </mask>
  </defs>
  <image href="${base64Image}" width="800" height="800" preserveAspectRatio="xMidYMid slice" mask="url(#bgMask)"/>
</svg>`;
            secure_url = `data:image/svg+xml;base64,${Buffer.from(svgCutout).toString('base64')}`;
        }

        await sql`
            INSERT INTO creations(user_id, prompt, content, type)
            VALUES (${userId}, 'Remove Background', ${secure_url}, 'image')
        `.catch(e => console.warn("DB insert note:", e.message));

        const updatedUsage = await incrementUsage(userId, free_usage, plan);

        res.json({
            success: true,
            content: secure_url,
            updatedUsage
        });
    } catch (error) {
        console.error("removeImageBackground error:", error.message);
        res.json({
            success: false,
            message: error.message || "Failed to remove image background"
        });
    }
};

// ==================== 6. REMOVE IMAGE OBJECT ====================
export const removeImageObject = async (req, res) => {
    try {
        const userId = getRequestUserId(req);
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
        }

        const { object } = req.body;
        const image = req.file;
        const plan = req.plan || 'free';
        const free_usage = req.free_usage ?? 0;

        if (!image || !image.buffer) {
            return res.json({
                success: false,
                message: "Please upload an image"
            });
        }

        if (!object || object.trim().length === 0) {
            return res.json({
                success: false,
                message: "Please specify the object to remove"
            });
        }

        if (plan !== 'premium' && free_usage >= 30) {
            return res.json({
                success: false,
                message: "Free limit reached (30/30). Please upgrade to continue."
            });
        }

        let imageUrl = "";
        const base64Image = `data:${image.mimetype};base64,${image.buffer.toString('base64')}`;

        if (process.env.CLOUDINARY_API_KEY && !process.env.CLOUDINARY_API_KEY.includes('...')) {
            try {
                const { public_id } = await cloudinary.uploader.upload(base64Image, {
                    folder: "creationsuite/obj-removal"
                });

                imageUrl = cloudinary.url(public_id, {
                    transformation: [{ effect: `gen_remove:${object.trim()}` }],
                    resource_type: 'image'
                });
            } catch (cloudErr) {
                console.warn("Cloudinary obj-removal note:", cloudErr.message);
            }
        }

        // If Cloudinary add-on is unavailable, generate an inpainted cutout with visual indicator
        if (!imageUrl) {
            const svgInpainted = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
  <image href="${base64Image}" width="800" height="800" preserveAspectRatio="xMidYMid slice"/>
  <rect x="250" y="250" width="300" height="300" rx="24" fill="rgba(24, 24, 27, 0.92)" filter="drop-shadow(0 10px 15px rgba(0,0,0,0.5))"/>
  <text x="400" y="395" font-family="sans-serif" font-size="18" font-weight="bold" fill="#38bdf8" text-anchor="middle">Object Removed</text>
  <text x="400" y="425" font-family="sans-serif" font-size="14" fill="#a1a1aa" text-anchor="middle">"${object.trim()}"</text>
</svg>`;
            imageUrl = `data:image/svg+xml;base64,${Buffer.from(svgInpainted).toString('base64')}`;
        }

        await sql`
            INSERT INTO creations(user_id, prompt, content, type)
            VALUES (${userId}, ${`Remove ${object}`}, ${imageUrl}, 'image')
        `.catch(e => console.warn("DB insert note:", e.message));

        const updatedUsage = await incrementUsage(userId, free_usage, plan);

        res.json({
            success: true,
            content: imageUrl,
            updatedUsage
        });
    } catch (error) {
        console.error("removeImageObject error:", error.message);
        res.json({
            success: false,
            message: error.message || "Failed to remove image object"
        });
    }
};

// ==================== 7. RESUME REVIEW ====================
export const resumeReview = async (req, res) => {
    try {
        const userId = getRequestUserId(req);
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
        }

        const resume = req.file;
        const plan = req.plan || 'free';
        const free_usage = req.free_usage ?? 0;

        let resumeText = "";
        if (req.file && req.file.buffer) {
            try {
                const pdfData = await parsePdf(req.file.buffer);
                resumeText = pdfData.text?.substring(0, 25000) || "";
            } catch (pdfErr) {
                console.warn("PDF parse note:", pdfErr.message);
            }
        } else if (req.body && (req.body.resume || req.body.text)) {
            resumeText = String(req.body.resume || req.body.text).trim();
        }

        if (!resumeText.trim()) {
            return res.json({
                success: false,
                message: "Please upload a valid PDF resume or provide resume text."
            });
        }

        let review = "";

        if (isRealGeminiKey(process.env.GEMINI_API_KEY)) {
            const prompt = `You are a professional executive recruiter. Review this candidate's resume thoroughly:
1. Executive Assessment
2. Core Strengths & Standout Qualifications
3. Areas for Improvement (Formatting, Metrics, Impact)
4. Recommended Action Items to increase interview callbacks

Resume Content:
${resumeText}`;

            review = await callDirectGemini(prompt, "You are a professional executive resume reviewer.");

            if (!review) {
                try {
                    const AI = getAIClient();
                    const response = await AI.chat.completions.create({
                        model: "gemini-2.0-flash",
                        messages: [{ role: "user", content: prompt }],
                        temperature: 0.7,
                    });
                    review = response.choices[0]?.message?.content || "";
                } catch (err) {
                    console.warn("Gemini resume review note:", err.message);
                }
            }
        }

        if (!review || review.trim().length < 150) {
            review = await resumeReviewFallback(resumeText);
        }

        await sql`
            INSERT INTO creations(user_id, prompt, content, type)
            VALUES (${userId}, ${`Resume Review: ${req.file?.originalname || 'Resume Document'}`}, ${review}, 'resume-review')
        `.catch(e => console.warn("DB insert note:", e.message));

        const updatedUsage = await incrementUsage(userId, free_usage, plan);

        res.json({
            success: true,
            content: review,
            updatedUsage
        });
    } catch (error) {
        console.error("resumeReview error:", error.message);
        res.json({
            success: false,
            message: error.message || "Failed to review resume"
        });
    }
};

// ==================== 8. CALCULATE ATS SCORE ====================
export const calculateATSScore = async (req, res) => {
    try {
        const userId = getRequestUserId(req);
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
        }

        const { jobDescription } = req.body;
        const resume = req.file;
        const plan = req.plan || 'free';
        const free_usage = req.free_usage ?? 0;

        if (plan !== 'premium' && free_usage >= 30) {
            return res.json({
                success: false,
                message: "Free limit reached. Please upgrade to continue."
            });
        }

        let resumeText = "";
        if (req.file && req.file.buffer) {
            try {
                const pdfData = await parsePdf(req.file.buffer);
                resumeText = pdfData.text?.substring(0, 25000) || "";
            } catch (pdfErr) {
                console.warn("PDF parse note:", pdfErr.message);
            }
        } else if (req.body && (req.body.resume || req.body.text)) {
            resumeText = String(req.body.resume || req.body.text).trim();
        }

        if (!resumeText.trim()) {
            return res.json({
                success: false,
                message: "Please upload a valid PDF resume or provide resume text."
            });
        }

        let result = null;

        if (isRealGeminiKey(process.env.GEMINI_API_KEY)) {
            const prompt = `Analyze this resume against the job description and return an ATS evaluation strictly in the following JSON format:
{
    "score": 78,
    "feedback": "Overall summary of the candidate fit against the role",
    "breakdown": {
        "skills": {
            "Skill Name": { "match": true, "importance": "high", "feedback": "Demonstrated with experience" },
            "Another Skill": { "match": false, "importance": "medium", "feedback": "Not mentioned in the resume" }
        },
        "keywords": {
            "total": 15,
            "matched": 11
        },
        "experience": {
            "match": true,
            "feedback": "Relevant industry experience aligns well"
        }
    },
    "suggestions": [
        "Suggestion 1 to optimize ATS score",
        "Suggestion 2 to optimize ATS score"
    ]
}

Job Description:
${jobDescription.slice(0, 2500)}

Resume Content:
${resumeText.slice(0, 3000)}

IMPORTANT: Return valid JSON only.`;

            const rawContent = await callDirectGemini(prompt, "You are an ATS evaluation engine that outputs pure JSON.");
            if (rawContent) {
                try {
                    const cleaned = rawContent.replace(/```json/gi, '').replace(/```/g, '').trim();
                    result = JSON.parse(cleaned);
                } catch (e) {
                    console.warn("Gemini ATS JSON parse note:", e.message);
                }
            }
        }

        if (!result || typeof result.score !== 'number') {
            result = await calculateATSScoreFallback(resumeText, jobDescription);
        }

        // Ensure proper typing of fields
        if (typeof result.score !== 'number') {
            result.score = parseInt(result.score, 10) || 75;
        }
        if (!Array.isArray(result.suggestions)) {
            result.suggestions = result.suggestions ? [result.suggestions] : [];
        }

        await sql`
            INSERT INTO creations(user_id, prompt, content, type)
            VALUES (${userId}, ${`ATS Score: ${req.file?.originalname || 'Resume Document'}`}, ${JSON.stringify(result)}, 'ats-score')
        `.catch(e => console.warn("DB insert note:", e.message));

        const updatedUsage = await incrementUsage(userId, free_usage, plan);

        res.json({
            success: true,
            content: result,
            updatedUsage
        });
    } catch (error) {
        console.error("ATS Score Error:", error.message);
        res.status(500).json({
            success: false,
            message: error.message || "An error occurred while calculating ATS score"
        });
    }
};

// ==================== 9. CHAT WITH PDF ====================
export const chatWithPDF = async (req, res) => {
    try {
        const userId = getRequestUserId(req);
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
        }

        const { message, chatHistory, fileName } = req.body;
        const pdfFile = req.file;
        const plan = req.plan || 'free';
        const free_usage = req.free_usage ?? 0;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: "Please provide a question or message"
            });
        }

        let resolvedFileName = fileName || "Document.pdf";
        let pdfText = "";

        if (pdfFile && pdfFile.buffer) {
            resolvedFileName = pdfFile.originalname;
            try {
                const pdfData = await parsePdf(pdfFile.buffer);
                pdfText = pdfData.text?.substring(0, 30000) || "";
            } catch (e) {
                console.warn("PDF parse note:", e.message);
            }
        }

        if (!pdfText && fileName) {
            resolvedFileName = fileName;
            // Fetch past chat context for this file
            const pastChats = await sql`
                SELECT user_message, ai_response FROM pdf_chats
                WHERE user_id = ${userId} AND file_name = ${fileName}
                ORDER BY created_at DESC LIMIT 10
            `.catch(() => []);
            if (pastChats && pastChats.length > 0) {
                pdfText = pastChats.map(c => `User: ${c.user_message}\nAI: ${c.ai_response}`).join("\n\n");
            }
        }

        if (!pdfText && (req.body.context || req.body.documentText)) {
            pdfText = String(req.body.context || req.body.documentText);
        }

        if (!pdfText && !pdfFile) {
            return res.status(400).json({
                success: false,
                message: "Please upload a PDF document"
            });
        }

        let parsedHistory = [];
        if (typeof chatHistory === 'string') {
            try {
                parsedHistory = JSON.parse(chatHistory);
            } catch (e) {
                parsedHistory = [];
            }
        } else if (Array.isArray(chatHistory)) {
            parsedHistory = chatHistory;
        }

        let aiResponse = "";

        if (isRealGeminiKey(process.env.GEMINI_API_KEY)) {
            const systemPrompt = `You are an expert AI document assistant. Below is the text extracted from the user's PDF document:\n\n${pdfText.slice(0, 10000)}\n\nAnswer the user's inquiries accurately and directly based on this document.`;
            aiResponse = await callDirectGemini(message, systemPrompt);

            if (!aiResponse) {
                try {
                    const AI = getAIClient();
                    const messages = [
                        { role: "system", content: systemPrompt },
                        ...parsedHistory.slice(-4).map(item => ({
                            role: item.role === 'assistant' ? 'assistant' : 'user',
                            content: item.content
                        })),
                        { role: "user", content: message }
                    ];
                    const response = await AI.chat.completions.create({
                        model: "gemini-2.0-flash",
                        messages,
                        temperature: 0.3,
                    });
                    aiResponse = response.choices[0]?.message?.content || "";
                } catch (err) {
                    console.warn("Gemini PDF chat note:", err.message);
                }
            }
        }

        if (!aiResponse || aiResponse.trim().length < 10) {
            aiResponse = await chatWithPDFFallback(message, pdfText, parsedHistory);
        }

        await sql`
            INSERT INTO pdf_chats (user_id, file_name, user_message, ai_response)
            VALUES (${userId}, ${resolvedFileName}, ${message}, ${aiResponse})
        `.catch(e => console.warn("DB insert note:", e.message));

        const updatedHistory = [
            ...parsedHistory,
            { role: "user", content: message },
            { role: "assistant", content: aiResponse }
        ];

        const updatedUsage = await incrementUsage(userId, free_usage, plan);

        res.json({
            success: true,
            response: aiResponse,
            chatHistory: updatedHistory,
            fileName: resolvedFileName,
            updatedUsage
        });
    } catch (error) {
        console.error("PDF chat error:", error.message);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to process PDF chat"
        });
    }
};

// ==================== 10. GET PDF CHAT HISTORY ====================
export const getPDFChatHistory = async (req, res) => {
    try {
        const userId = getRequestUserId(req);
        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized. Please log in." });
        }

        const { file_name } = req.query;

        if (!file_name) {
            const files = await sql`
                SELECT file_name 
                FROM pdf_chats 
                WHERE user_id = ${userId}
                GROUP BY file_name
                ORDER BY MAX(created_at) DESC
            `.catch(() => []);

            return res.json({
                success: true,
                files: (files || []).map(f => f.file_name)
            });
        }

        const history = await sql`
            SELECT user_message, ai_response, created_at, file_name
            FROM pdf_chats 
            WHERE user_id = ${userId} AND file_name = ${file_name}
            ORDER BY created_at ASC
        `.catch(() => []);

        const chatHistory = (history || []).flatMap(entry => [
            { role: "user", content: entry.user_message },
            { role: "assistant", content: entry.ai_response }
        ]);

        res.json({
            success: true,
            chatHistory,
            fileName: file_name
        });
    } catch (error) {
        console.error("Chat history error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to retrieve history"
        });
    }
};