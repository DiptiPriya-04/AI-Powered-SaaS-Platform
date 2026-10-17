// Comprehensive Tab-by-Tab Deep Testing Suite
// Tests EACH AND EVERY tab 5-10 times consecutively with diverse inputs

// Native Node 22 fetch, FormData, and Blob are globally available
const BASE_URL = 'http://localhost:3000';

const resultsSummary = {};

function logTest(tabName, testNum, passed, detail) {
    if (!resultsSummary[tabName]) resultsSummary[tabName] = { passed: 0, failed: 0, tests: [] };
    if (passed) {
        resultsSummary[tabName].passed++;
    } else {
        resultsSummary[tabName].failed++;
    }
    resultsSummary[tabName].tests.push({ testNum, passed, detail });
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`[${tabName}] Test ${testNum}: ${status} - ${detail}`);
}

// 1x1 transparent PNG buffer for image testing
const sampleImageBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
);

async function runAllTests() {
    console.log("================================================================================");
    console.log("   COMPREHENSIVE MULTI-PASS TEST SUITE (TESTING EVERY TAB 5-10 TIMES)   ");
    console.log("================================================================================\n");

    // ==========================================
    // TAB 1: WRITE ARTICLE (10 Tests)
    // ==========================================
    console.log("\n--- Testing Tab 1: WRITE ARTICLE (10 Consecutive Passes) ---");
    const articleTopics = [
        "Quantum Computing",
        "Renewable Energy",
        "Microbiome Health",
        "Cloud Architecture",
        "Electric Vehicles",
        "Remote Work Culture",
        "Cognitive Psychology",
        "Cybersecurity Zero Trust",
        "Space Exploration",
        "Generative Artificial Intelligence"
    ];

    for (let i = 0; i < articleTopics.length; i++) {
        const topic = articleTopics[i];
        const start = Date.now();
        try {
            const res = await fetch(`${BASE_URL}/api/ai/generate-article`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt: `Write an article about ${topic}`, length: 800 })
            });
            const data = await res.json();
            const elapsed = Date.now() - start;
            const valid = data.success && typeof data.content === 'string' && data.content.length > 300;
            const firstLine = valid ? data.content.split('\n')[0].substring(0, 70) : '';
            logTest("Write Article", i + 1, valid, `Topic: "${topic}" | Time: ${elapsed}ms | Length: ${data.content?.length || 0} chars | Title: ${firstLine}`);
        } catch (e) {
            logTest("Write Article", i + 1, false, `Error: ${e.message}`);
        }
    }

    // ==========================================
    // TAB 2: BLOG TITLES (10 Tests)
    // ==========================================
    console.log("\n--- Testing Tab 2: BLOG TITLES (10 Consecutive Passes) ---");
    const blogInputs = [
        { keyword: "SaaS Marketing", category: "Business" },
        { keyword: "Kubernetes Microservices", category: "Technology" },
        { keyword: "Intermittent Fasting", category: "Health" },
        { keyword: "Solo Travel Backpacking", category: "Travel" },
        { keyword: "Artisan Sourdough Baking", category: "Food" },
        { keyword: "Deep Work Productivity", category: "Education" },
        { keyword: "Minimalist Living", category: "Lifestyle" },
        { keyword: "FinTech & Open Banking", category: "Business" },
        { keyword: "Prompt Engineering", category: "Technology" },
        { keyword: "Sleep Optimization", category: "Health" }
    ];

    for (let i = 0; i < blogInputs.length; i++) {
        const item = blogInputs[i];
        const start = Date.now();
        try {
            const prompt = `Generate atleast very good 10 blog titles for the keyword ${item.keyword} in the category ${item.category}.`;
            const res = await fetch(`${BASE_URL}/api/ai/generate-blog-title`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            });
            const data = await res.json();
            const elapsed = Date.now() - start;
            const valid = data.success && typeof data.content === 'string' && data.content.includes('1.') && data.content.includes('10.');
            const firstLine = valid ? data.content.split('\n')[0].substring(0, 65) : '';
            logTest("Blog Titles", i + 1, valid, `Keyword: "${item.keyword}" (${item.category}) | Time: ${elapsed}ms | Header: ${firstLine}`);
        } catch (e) {
            logTest("Blog Titles", i + 1, false, `Error: ${e.message}`);
        }
    }

    // ==========================================
    // TAB 3: HUMANIZE TEXT (10 Tests)
    // ==========================================
    console.log("\n--- Testing Tab 3: HUMANIZE TEXT (10 Consecutive Passes) ---");
    const humanizeSamples = [
        "Furthermore, it is imperative to elucidate that the utilization of modern microservices architecture facilitates optimal system throughput.",
        "Moreover, in conclusion, one must consider that artificial intelligence manifests a multifaceted tapestry of innovative paradigms.",
        "It should be noted that expeditiously terminating disparate server instances helps facilitate optimal cost reduction.",
        "Needless to say, utilizing deep learning algorithms demonstrates superior efficacy in predictive analytics.",
        "In today's fast-paced world, it is paramount that organizations pivot their paradigms toward sustainable methodologies.",
        "Furthermore, to summarize, the disparate data pipelines elucidate a testament to robust engineering excellence.",
        "It is noteworthy that we have commenced utilizing automated CI/CD pipelines to facilitate rapid deployment cycles.",
        "In essence, it is not merely about writing code; furthermore, one must consider holistic system reliability.",
        "Delve into the realm of modern quantum computing, which demonstrates optimal computing throughput.",
        "Without further ado, let us elucidate how utilizing Docker containers facilitates seamless environment parity."
    ];

    for (let i = 0; i < humanizeSamples.length; i++) {
        const text = humanizeSamples[i];
        const start = Date.now();
        try {
            const res = await fetch(`${BASE_URL}/api/ai/humanize-text`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
            const data = await res.json();
            const elapsed = Date.now() - start;
            const valid = data.success && typeof data.content === 'string' && !data.content.includes("furthermore") && !data.content.includes("elucidate");
            logTest("Humanize Text", i + 1, valid, `Time: ${elapsed}ms | Length: ${data.content?.length || 0} chars | Humanized sample: ${data.content?.slice(0, 60).replace(/\n/g, ' ')}...`);
        } catch (e) {
            logTest("Humanize Text", i + 1, false, `Error: ${e.message}`);
        }
    }

    // ==========================================
    // TAB 4: GENERATE IMAGES (10 Tests)
    // ==========================================
    console.log("\n--- Testing Tab 4: GENERATE IMAGES (10 Consecutive Passes) ---");
    const imagePrompts = [
        "Futuristic neon Tokyo cityscape at sunset in 8k cinematic lighting",
        "Cozy Scandinavian wooden cabin in a snowy pine forest with glowing fireplace",
        "Majestic golden eagle soaring above mist-covered alpine mountain peaks",
        "Minimalist modern architectural glass villa with infinity pool overlooking ocean",
        "Cyberpunk robotic barista crafting artisan pour-over coffee in glowing cafe",
        "Macro photography of vibrant bioluminescent jellyfish in deep ocean",
        "Vintage 1960s sports car driving along coastal Amalfi cliffs during golden hour",
        "Serene Japanese Zen garden with blooming cherry blossoms and koi pond",
        "Futuristic Mars colony greenhouse filled with lush hydroponic vegetation",
        "Isometric 3D diorama of a miniature high-tech data center with glowing server racks"
    ];

    for (let i = 0; i < imagePrompts.length; i++) {
        const prompt = imagePrompts[i];
        const start = Date.now();
        try {
            const res = await fetch(`${BASE_URL}/api/ai/generate-image`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, publish: false })
            });
            const data = await res.json();
            const elapsed = Date.now() - start;
            const valid = data.success && typeof data.content === 'string' && data.content.startsWith('http');
            logTest("Generate Images", i + 1, valid, `Prompt: "${prompt.slice(0, 35)}..." | Time: ${elapsed}ms | URL: ${data.content?.slice(0, 50)}...`);
        } catch (e) {
            logTest("Generate Images", i + 1, false, `Error: ${e.message}`);
        }
    }

    // ==========================================
    // TAB 5: REMOVE BACKGROUND (10 Tests)
    // ==========================================
    console.log("\n--- Testing Tab 5: REMOVE BACKGROUND (10 Consecutive Passes) ---");
    for (let i = 0; i < 10; i++) {
        const start = Date.now();
        try {
            const form = new FormData();
            form.append('image', new Blob([sampleImageBuffer], { type: 'image/png' }), `product_${i + 1}.png`);
            
            const res = await fetch(`${BASE_URL}/api/ai/remove-image-background`, {
                method: 'POST',
                body: form
            });
            const data = await res.json();
            const elapsed = Date.now() - start;
            const valid = data.success && typeof data.content === 'string' && (data.content.startsWith('data:image') || data.content.startsWith('http'));
            logTest("Remove Background", i + 1, valid, `Image: product_${i + 1}.png | Time: ${elapsed}ms | Type: ${data.content?.slice(0, 30)}...`);
        } catch (e) {
            logTest("Remove Background", i + 1, false, `Error: ${e.message}`);
        }
    }

    // ==========================================
    // TAB 6: REMOVE OBJECT (10 Tests)
    // ==========================================
    console.log("\n--- Testing Tab 6: REMOVE OBJECT (10 Consecutive Passes) ---");
    const objectsToRemove = ["watch", "car", "person", "dog", "chair", "tree", "signboard", "cup", "bicycle", "backpack"];
    for (let i = 0; i < objectsToRemove.length; i++) {
        const obj = objectsToRemove[i];
        const start = Date.now();
        try {
            const form = new FormData();
            form.append('image', new Blob([sampleImageBuffer], { type: 'image/png' }), `scene_${i + 1}.png`);
            form.append('object', obj);

            const res = await fetch(`${BASE_URL}/api/ai/remove-image-object`, {
                method: 'POST',
                body: form
            });
            const data = await res.json();
            const elapsed = Date.now() - start;
            const valid = data.success && typeof data.content === 'string' && (data.content.startsWith('data:image') || data.content.startsWith('http'));
            logTest("Remove Object", i + 1, valid, `Target: "${obj}" | Time: ${elapsed}ms | Output format: ${data.content?.slice(0, 30)}...`);
        } catch (e) {
            logTest("Remove Object", i + 1, false, `Error: ${e.message}`);
        }
    }

    // ==========================================
    // TAB 7: REVIEW RESUME (10 Tests)
    // ==========================================
    console.log("\n--- Testing Tab 7: REVIEW RESUME (10 Consecutive Passes) ---");
    const resumes = [
        "John Doe - Senior Full Stack Engineer. Experience at Meta (2020-2024). Architected React frontend and Node.js microservices handling 2M DAU. Cut latency by 35%. Skills: React, Node.js, TypeScript, PostgreSQL, AWS, Docker.",
        "Sarah Connor - Lead Machine Learning Engineer. Experience at OpenAI partner (2021-2024). Spearheaded fine-tuning of LLM pipelines reducing inference cost by $180k. Skills: Python, PyTorch, Transformers, Kubernetes, GCP.",
        "Alex Rivera - Senior Product Manager at Stripe. Led cross-functional team of 14 engineers and designers. Scaled payment checkout conversion by 22%, driving $12M incremental ARR. Skills: Product Strategy, Agile, SQL, Roadmapping.",
        "Elena Rostova - Cloud DevOps Architect. Designed zero-downtime multi-region AWS infrastructure using Terraform and Kubernetes. Automated CI/CD reducing deploy time from 45m to 4m. Skills: Terraform, Docker, Kubernetes, AWS, Go.",
        "Marcus Vance - Enterprise Account Executive. Delivered $4.2M in new enterprise software ARR (145% of quota). Closed 18 Fortune 500 accounts. Skills: SaaS Sales, Negotiation, Salesforce, MEDDPICC.",
        "Priya Patel - Senior Data Scientist at Uber. Built dynamic pricing algorithms using XGBoost and real-time Kafka streams. Improved dispatch efficiency by 14%. Skills: Python, SQL, Spark, Machine Learning, Kafka.",
        "David Kim - Mobile iOS & Android Lead. Built fintech consumer app with 1.5M downloads and 4.9 rating. Optimized React Native rendering to steady 60fps. Skills: React Native, Swift, Kotlin, GraphQL, Firebase.",
        "Rachel Green - Senior UX/UI Designer. Redesigned core SaaS dashboard leading to 38% increase in daily user engagement. Conducted 40+ usability tests. Skills: Figma, Design Systems, User Research, Prototyping.",
        "Michael Scott - Engineering Manager. Managed 22 engineers across 3 distributed agile squads. Improved team sprint velocity by 28% and maintained 95% retention. Skills: Engineering Management, Agile, OKRs, Mentorship.",
        "Chloe Bennett - Junior Software Engineer Graduate. BS in Computer Science from UC Berkeley. Built open-source fullstack portfolio project using Next.js and Tailwind. Skills: JavaScript, React, Python, Git, HTML/CSS."
    ];

    for (let i = 0; i < resumes.length; i++) {
        const text = resumes[i];
        const start = Date.now();
        try {
            const res = await fetch(`${BASE_URL}/api/ai/resume-review`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resume: text })
            });
            const data = await res.json();
            const elapsed = Date.now() - start;
            const valid = data.success && typeof data.content === 'string' && data.content.includes("Executive Resume Critique") && data.content.includes("/100");
            const scoreMatch = data.content?.match(/Score:\s*\*\*(\d+)\/100\*\*/);
            const scoreStr = scoreMatch ? `${scoreMatch[1]}/100` : "evaluated";
            logTest("Review Resume", i + 1, valid, `Candidate: ${text.split(' - ')[0]} | Time: ${elapsed}ms | Score: ${scoreStr} | Length: ${data.content?.length || 0} chars`);
        } catch (e) {
            logTest("Review Resume", i + 1, false, `Error: ${e.message}`);
        }
    }

    // ==========================================
    // TAB 8: CALCULATE ATS SCORE (10 Tests)
    // ==========================================
    console.log("\n--- Testing Tab 8: CALCULATE ATS SCORE (10 Consecutive Passes) ---");
    const atsPairs = [
        { resume: resumes[0], job: "Senior Full Stack Developer needed with 5+ years experience in React, Node.js, TypeScript, PostgreSQL, and AWS cloud deployment." },
        { resume: resumes[1], job: "Machine Learning Engineer required. Must have Python, PyTorch, Kubernetes, GCP, and deep experience optimizing transformer pipelines." },
        { resume: resumes[2], job: "Product Manager to lead strategic enterprise roadmap. Needs Agile, Product Strategy, Cross-Functional Collaboration, and SQL metrics." },
        { resume: resumes[3], job: "Cloud Infrastructure Engineer wanted. Expertise in Docker, Kubernetes, Terraform, AWS, and CI/CD automation." },
        { resume: resumes[4], job: "Account Executive SaaS. Strong record exceeding quota, negotiation, Enterprise sales, and CRM pipeline management." },
        { resume: resumes[5], job: "Senior Data Scientist needed for predictive modeling, real-time Kafka streaming, Python, and SQL analytics." },
        { resume: resumes[6], job: "Mobile App Engineer to develop high-performance React Native, Swift, Kotlin, and GraphQL customer applications." },
        { resume: resumes[7], job: "Lead Product Designer. Requires expert Figma proficiency, Design Systems, UX User Research, and web accessibility standards." },
        { resume: resumes[8], job: "Director of Engineering. Needs proven experience leading 20+ engineers, Scrum methodologies, hiring, and system architecture." },
        { resume: resumes[9], job: "Junior Software Engineer position. Requirements: CS degree, solid knowledge of JavaScript, React, Python, Git, and web technologies." }
    ];

    for (let i = 0; i < atsPairs.length; i++) {
        const pair = atsPairs[i];
        const start = Date.now();
        try {
            const res = await fetch(`${BASE_URL}/api/ai/calculate-ats-score`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resume: pair.resume, jobDescription: pair.job })
            });
            const data = await res.json();
            const elapsed = Date.now() - start;
            const valid = data.success && typeof data.content?.score === 'number' && data.content.score >= 50 && data.content.breakdown;
            const score = data.content?.score || 0;
            const matchedCount = data.content?.breakdown?.keywords?.matched || 0;
            const totalCount = data.content?.breakdown?.keywords?.total || 0;
            logTest("Calculate ATS Score", i + 1, valid, `Role: ${pair.job.slice(0, 30)}... | Time: ${elapsed}ms | ATS Score: ${score}% | Keywords: ${matchedCount}/${totalCount}`);
        } catch (e) {
            logTest("Calculate ATS Score", i + 1, false, `Error: ${e.message}`);
        }
    }

    // ==========================================
    // TAB 9: CHAT WITH PDF (10 Tests)
    // ==========================================
    console.log("\n--- Testing Tab 9: CHAT WITH PDF (10 Consecutive Passes) ---");
    const sampleDocContext = `
# Annual Operations & Architecture Report 2026
Executive Summary:
Our enterprise cloud migration reached 99.99% availability across all regions. Total infrastructure costs dropped by 28% following the implementation of Kubernetes auto-scaling clusters.
Key Initiatives:
1. Zero Trust Security Model: Implemented across all 5,000 corporate endpoints and microservices.
2. Latency Optimization: Replaced legacy relational caches with Redis clusters, reducing P99 latency from 180ms to 24ms.
3. Data Governance: Adopted strict automated compliance pipelines meeting ISO 27001 and SOC2 Type II standards.
Recommendations:
- Continue phased deprecation of monolithic backend modules by Q3.
- Expand engineering headcount in AI/ML platform team by 15%.
`;

    const pdfQuestions = [
        "What is the executive summary of this operations report?",
        "How much did infrastructure costs decrease after implementing Kubernetes?",
        "What was the uptime availability achieved across all regions?",
        "What security model was implemented across the corporate endpoints?",
        "How did the team optimize P99 latency and what were the exact numbers?",
        "Which compliance standards were met by the automated data governance pipelines?",
        "What is the recommendation regarding the monolithic backend modules?",
        "How much headcount expansion is recommended for the AI/ML team?",
        "Can you summarize the 3 key initiatives mentioned in the document?",
        "What are the top strategic takeaways for the leadership team?"
    ];

    for (let i = 0; i < pdfQuestions.length; i++) {
        const question = pdfQuestions[i];
        const start = Date.now();
        try {
            const res = await fetch(`${BASE_URL}/api/ai/chat-with-pdf`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: question,
                    documentText: sampleDocContext,
                    fileName: "Operations_Report_2026.pdf"
                })
            });
            const data = await res.json();
            const elapsed = Date.now() - start;
            const valid = data.success && typeof data.response === 'string' && data.response.length > 100;
            logTest("Chat With PDF", i + 1, valid, `Q: "${question.slice(0, 35)}..." | Time: ${elapsed}ms | Length: ${data.response?.length || 0} chars`);
        } catch (e) {
            logTest("Chat With PDF", i + 1, false, `Error: ${e.message}`);
        }
    }

    // ==========================================
    // TAB 10: DASHBOARD & COMMUNITY (10 Tests)
    // ==========================================
    console.log("\n--- Testing Tab 10: DASHBOARD & COMMUNITY (10 Consecutive Passes) ---");
    for (let i = 0; i < 5; i++) {
        const start = Date.now();
        try {
            const res = await fetch(`${BASE_URL}/api/user/get-user-creations`);
            const data = await res.json();
            const elapsed = Date.now() - start;
            const valid = data.success && Array.isArray(data.creations);
            logTest("Dashboard (Creations)", i + 1, valid, `Time: ${elapsed}ms | Retrieved: ${data.creations?.length || 0} user creations from PostgreSQL`);
        } catch (e) {
            logTest("Dashboard (Creations)", i + 1, false, `Error: ${e.message}`);
        }
    }

    for (let i = 0; i < 5; i++) {
        const start = Date.now();
        try {
            const res = await fetch(`${BASE_URL}/api/user/get-published-creations`);
            const data = await res.json();
            const elapsed = Date.now() - start;
            const valid = data.success && Array.isArray(data.creations);
            logTest("Community (Feed)", i + 1, valid, `Time: ${elapsed}ms | Retrieved: ${data.creations?.length || 0} public community creations`);
        } catch (e) {
            logTest("Community (Feed)", i + 1, false, `Error: ${e.message}`);
        }
    }

    // ==========================================
    // FINAL SUMMARY MATRIX
    // ==========================================
    console.log("\n================================================================================");
    console.log("                           ALL TABS TEST RESULTS SUMMARY                        ");
    console.log("================================================================================");
    let totalPass = 0;
    let totalFail = 0;

    for (const [tab, data] of Object.entries(resultsSummary)) {
        totalPass += data.passed;
        totalFail += data.failed;
        const rate = Math.round((data.passed / (data.passed + data.failed)) * 100);
        console.log(`📌 ${tab.padEnd(25)} : ${data.passed}/${data.passed + data.failed} PASSED (${rate}%)`);
    }

    console.log("--------------------------------------------------------------------------------");
    console.log(`🎯 TOTAL SUITE PERFORMANCE: ${totalPass}/${totalPass + totalFail} PASSED (${Math.round((totalPass / (totalPass + totalFail)) * 100)}%)`);
    console.log("================================================================================\n");
}

runAllTests();
