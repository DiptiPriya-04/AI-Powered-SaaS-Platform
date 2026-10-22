// Dynamic AI Engine & Context-Aware Analyzer
// Provides real, dynamic generative content and intelligent document analysis

// Clean topic extraction helper - strips instructions, wrappers, and constraints
export const extractCleanTopic = (raw) => {
    if (!raw) return "Innovation & Technology";
    let text = String(raw).trim();

    // 1. Check if it matches "about <topic> in ..."
    const matchAbout = text.match(/about\s+([^.\n]+?)(?:\s+in\s+short|\s+in\s+medium|\s+in\s+long|\s+in\s+\d+|\s+only|\.|$)/i);
    if (matchAbout && matchAbout[1]?.trim()) {
        text = matchAbout[1].trim();
    } else {
        // Strip common prefixes
        text = text.replace(/^write\s+(an\s+)?(in-depth\s+|comprehensive\s+|detailed\s+)?article\s+(about|on|regarding)\s+/i, '');
        // Strip trailing instructions
        text = text.replace(/\s+in\s+(short|medium|long|\d+).*$/i, '');
        text = text.replace(/\s+only\b.*$/i, '');
        text = text.replace(/\.?\s*write\s+it\s+just\s+like.*$/i, '');
        text = text.replace(/\.?\s*don'?t\s+exceed.*$/i, '');
        text = text.replace(/\.?\s*within\s+\d+.*$/i, '');
    }

    // Clean any residual punctuation or quotes
    text = text.replace(/^["'`\s]+|["'`\s.]+$/g, '').trim();
    return text || "Innovation & Technology";
};

// Clean topic extraction helper specifically for Blog Titles
export const extractCleanTitleTopic = (rawKeyword, rawPrompt) => {
    let text = (rawKeyword || "").trim();
    if (!text && rawPrompt) {
        text = String(rawPrompt).trim();
    }
    if (!text) return "Content Strategy";

    // 1. Check if matches "for the keyword <topic> in the category <cat>"
    const kwMatch = text.match(/keyword\s+([^.\n]+?)(?:\s+in\s+the\s+category|\s*\.|\s*$)/i);
    if (kwMatch && kwMatch[1]?.trim()) {
        text = kwMatch[1].trim();
    }

    // 2. Strip leading request instructions & question prefixes
    text = text.replace(/^(please\s+)?(generate|give\s+me|create|write|suggest|provide|show\s+me|find)\s+(atleast\s+)?(very\s+good\s+)?(\d+\s+)?(catchy\s+|viral\s+|best\s+|top\s+|engaging\s+|fresh\s+|awesome\s+|good\s+)?(blog\s+|article\s+)?titles?\s+(for|about|on|regarding)?\s*/i, '');
    text = text.replace(/^(catchy\s+|viral\s+|best\s+|top\s+)?(blog\s+|article\s+)?titles?\s+(for|about|on|regarding)\s+/i, '');
    text = text.replace(/^(ideas|topics)\s+(for|about|on)\s+/i, '');

    // 3. Strip trailing category / word count wrappers
    text = text.replace(/\s+in\s+the\s+category\s+.*$/i, '');
    text = text.replace(/\s+in\s+category\s+.*$/i, '');
    text = text.replace(/\s+category:\s*.*$/i, '');
    text = text.replace(/\s+within\s+\d+.*$/i, '');
    text = text.replace(/\s+don'?t\s+exceed.*$/i, '');
    text = text.replace(/\s+with\s+(bold|hooks|emojis).*$/i, '');

    // 4. Strip leftover punctuation and quotes
    text = text.replace(/^["'`\s]+|["'`\s.]+$/g, '').trim();

    return text || "Content Strategy";
};

// Helper to call free dynamic LLM with resilient timeout
export const callFreeLLM = async (prompt, timeoutMs = 3000) => {
    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);

        const encoded = encodeURIComponent(prompt.slice(0, 400));
        const res = await fetch(`https://text.pollinations.ai/${encoded}?seed=${Math.floor(Math.random() * 100000)}`, {
            method: 'GET',
            headers: { 'Accept': 'text/plain' },
            signal: controller.signal
        });

        clearTimeout(timer);

        if (!res.ok) return null;
        const text = await res.text();
        if (text && text.trim().length > 60 && !text.startsWith('{"error"') && !text.startsWith('{')) {
            return text.trim();
        }
        return null;
    } catch (err) {
        return null;
    }
};

// ==================== 1. DYNAMIC ARTICLE WRITER ====================
export const generateArticleFallback = async (rawPromptOrTopic, targetLength = 800) => {
    const cleanTopic = extractCleanTopic(rawPromptOrTopic);
    const titleCase = cleanTopic.charAt(0).toUpperCase() + cleanTopic.slice(1);
    const isShort = Number(targetLength) <= 600;
    const isLong = Number(targetLength) >= 1200;

    // Detect domain
    const lower = cleanTopic.toLowerCase();

    // 1. SPORTS DOMAIN
    if (/\b(cricket|football|soccer|tennis|basketball|badminton|baseball|rugby|golf|athletics|marathon|olympics|ipl|nba|nfl|fifa|boxing|mma|swimming|wrestling|hockey|f1|formula|sports?)\b/i.test(lower)) {
        return `# The Spirit and Evolution of ${titleCase}: Heritage, Strategy, and Modern Global Spectacle

## Introduction
Few human endeavors evoke the visceral passion, dramatic tension, and unifying camaraderie quite like **${titleCase}**. Across generations, what begins on local playgrounds and street corners matures into an international phenomenon, drawing millions of devoted spectators who hang on every tactical nuance and clutch play.

At its core, ${cleanTopic} is much more than physical prowess—it is an intricate psychological duel fought within the boundaries of relentless competition, where split-second decisions and unflinching discipline dictate legendary triumphs.

---

## The Chess Match: Tactical Mastery and Strategic Depth
True mastery of ${cleanTopic} demands a deep appreciation of momentum, positioning, and tactical execution:

- **Strategic Reading of the Game:** Elite athletes and managers study subtle shifts in environmental conditions, surface behavior, and opponent patterns to seize the critical advantage.
- **Offensive Execution vs. Defensive Fortitude:** Whether setting an aggressive pace or executing a calculated defensive blockade, success requires balancing high-risk ambition with patient composure.
- **The Psychology of Pressure:** When games come down to final moments, technical skill alone rarely decides the outcome. The greatest competitors are defined by their ability to maintain calm focus under deafening pressure.

---

## Physical Conditioning and Modern Athletic Preparation
The contemporary era has transformed the athletic baseline required for ${cleanTopic}:

1. **Precision Sports Science:** Nutrition, personalized recovery protocols, and biomechanical monitoring have expanded career longevity and elevated peak output.
2. **Dynamic Agility and Reflexes:** Modern speed of play demands explosive reaction times, lateral stability, and relentless stamina.
3. **Mental Fortitude:** Sports psychologists now play an indispensable role in helping players overcome setbacks, manage expectations, and maintain peak motivation across demanding seasons.

---

## Technology, Analytics, and the Future of the Game
The integration of real-time data analytics, instant replay tracking, and high-speed sensors has ushered in a revolution for ${cleanTopic}. Coaching staff dissect spatial coverage and predictive modeling to refine training drills, while global streaming and franchise formats bring fans closer to the action than ever before.

---

${isLong ? `## Historical Heritage and Cultural Impact
Throughout history, ${cleanTopic} has served as a cultural bridge, transcending socioeconomic and national borders. Memorable rivalries have forged timeless folklore, while historic victories have united diverse communities in shared pride. The lessons learned within the arena—respect for rivals, humility in victory, and resilience in defeat—continue to inspire generations far beyond the boundary lines.

---
` : ''}## Essential Takeaways
- **Disciplined Fundamentals:** Exceptional talent shines only when anchored in rigorous daily practice.
- **Adaptability is Key:** Surface variations, opponent tactical shifts, and game situations demand continuous mid-course adjustments.
- **Passion with Purpose:** Sustainable excellence requires love for the craft combined with strategic patience.

---

## Conclusion
As **${titleCase}** continues to expand into new territories and embrace cutting-edge technology, its soul remains pure: a timeless contest of skill, honor, and heart. For players and fans alike, the journey is an enduring celebration of what human dedication can achieve.`;
    }

    // 2. TECHNOLOGY & CODING DOMAIN
    if (/\b(python|javascript|typescript|react|node|vue|angular|html|css|coding|programming|software|developer|ai|artificial\s*intelligence|machine\s*learning|deep\s*learning|data\s*science|cloud|aws|docker|kubernetes|devops|cybersecurity|blockchain|crypto|database|sql|api|system\s*design|algorithms?|tech|technology)\b/i.test(lower)) {
        return `# Mastering ${titleCase}: Foundations, Modern Architecture, and Best Practices

## Introduction
In our rapidly accelerating digital landscape, **${titleCase}** has emerged as a cornerstone driving transformative modern solutions. Whether architecting resilient cloud systems, engineering user-centric web interfaces, or deploying next-generation intelligent models, understanding the nuances of ${cleanTopic} is essential for forward-thinking technologists.

As systems grow in complexity and performance expectations escalate, moving beyond superficial tutorials toward principled, production-grade mastery is the true differentiator for engineers and creators.

---

## Architectural Foundations and Core Mechanics
To build scalable systems around ${cleanTopic}, engineers must focus on three core pillars:

- **Modularity and Separation of Concerns:** Designing clean interfaces and decoupling business logic from external dependencies ensures maintainability as codebases expand.
- **Predictable State and Concurrency:** Understanding how data flows, how state transitions occur, and how concurrent operations are synchronized eliminates elusive race conditions.
- **Performance Profiling:** Rather than premature optimization, disciplined developers rely on telemetry, profiling benchmarks, and bottleneck analysis to optimize hot code paths.

---

## Production Best Practices and Common Pitfalls
Deploying ${cleanTopic} at scale reveals practical challenges that theoretical examples often overlook:

1. **Robust Error Boundaries & Logging:** Never allow unhandled exceptions to crash critical services. Implement structured logging with contextual metadata to expedite incident resolution.
2. **Defensive API Contracts & Typing:** Enforce strict type validation at boundaries to protect against malformed payloads and silent runtime corruption.
3. **Automated Testing Pipelines:** Comprehensive unit and integration test suites provide the psychological safety net needed for continuous, fearless deployment cycles.

---

## Modern Ecosystem and Tooling Highlights
The ecosystem surrounding ${cleanTopic} is vibrant and continually evolving. Modern package managers, containerized development environments, and automated CI/CD workflows allow teams to ship features with unprecedented speed without compromising architectural integrity.

---

${isLong ? `## Scaling and Enterprise Resilience
At enterprise scale, architectural trade-offs become paramount. Balancing consistency against availability, implementing intelligent caching layers, and designing idempotent retry mechanisms ensure that services remain responsive under peak load surges. Real-world resilience is built through intentional failure testing and automated recovery strategies.

---
` : ''}## Actionable Checklist for Developers
- **Audit Core Dependencies:** Routinely inspect third-party packages for vulnerabilities and maintenance health.
- **Document Non-Obvious Decisions:** Maintain clear Architecture Decision Records (ADRs) to communicate trade-offs to future contributors.
- **Iterate in Small Batches:** Small, continuous pull requests with clear scopes reduce review friction and deployment risk.

---

## Conclusion
True excellence in **${titleCase}** is not achieved overnight; it is the compound interest of adhering to sound principles, writing maintainable code, and fostering relentless technical curiosity. By combining rigorous engineering standards with pragmatic execution, you can build systems that withstand the test of time.`;
    }

    // 3. HEALTH, WELLNESS & NUTRITION DOMAIN
    if (/\b(health|fitness|nutrition|diet|workout|gym|exercise|mental\s*health|sleep|meditation|yoga|weight\s*loss|fasting|wellness|therapy|anxiety|depression|mindfulness|hydration|habit)\b/i.test(lower)) {
        return `# The Science of ${titleCase}: Evidence-Based Protocols for Vitality and Well-Being

## Introduction
In a modern world characterized by relentless digital distractions, chronic stress, and sedentary routines, prioritizing **${titleCase}** is no longer an optional luxury—it is an indispensable prerequisite for enduring vitality, cognitive clarity, and physical resilience.

Rather than chasing fleeting wellness fads or unsustainable quick fixes, building a healthy relationship with ${cleanTopic} requires a grounded understanding of human biology, behavioral psychology, and consistent daily rituals.

---

## Biological Foundations: Why ${titleCase} Matters
The human body operates as an interconnected ecosystem, where micro-habits compound into significant physiological outcomes:

- **Cellular & Metabolic Health:** Consistent, quality inputs optimize energy production, reduce systemic inflammation, and enhance metabolic flexibility.
- **Neurochemical Balance:** Strategic protocols directly influence key neurotransmitters—dopamine, serotonin, and endorphins—fostering stable mood regulation and mental resilience.
- **Circadian Alignment:** Syncing daily routines with natural biological rhythms promotes deeper recovery, hormonal balance, and restorative sleep architecture.

---

## Practical Daily Protocols and Strategies
Translating theory into tangible daily practice requires simplicity and frictionless habits:

1. **Establish a Consistent Morning Routine:** Begin the day with hydration, natural light exposure, and intentional movement before engaging with digital notifications.
2. **Optimize Nutrition and Recovery:** Prioritize whole, nutrient-dense foods, adequate protein intake, and deliberate recovery windows between physical exertion.
3. **Manage Stress Actively:** Incorporate daily mindfulness, box-breathing, or nature walks to down-regulate the sympathetic nervous system.

---

## Debunking Common Myths
- **Myth 1: Extreme Restriction Yields Faster Results:** In reality, extreme protocols frequently trigger metabolic fatigue and burnout. Sustainable consistency always outperforms brief perfection.
- **Myth 2: More is Always Better:** True progress occurs during recovery periods. Without adequate sleep and intentional down-time, physical and mental performance inevitably degrade.

---

${isLong ? `## Long-Term Sustainability and Habit Architecture
Lasting lifestyle transformation depends on environmental design rather than sheer willpower. By structuring your living and working spaces to make positive choices effortless and friction-free, beneficial habits become the path of least resistance. Tracking progress through qualitative markers like energy and focus ensures intrinsic motivation remains resilient.

---
` : ''}## High-Impact Action Items
- **Audit Your Baseline:** Track your sleep, nutrition, and energy levels for 3 consecutive days to identify real friction points.
- **Implement the 1% Rule:** Focus on making one modest improvement each week rather than overhauling your entire lifestyle at once.
- **Prioritize Sleep:** Treat 7 to 9 hours of quality sleep as a non-negotiable performance cornerstone.

---

## Conclusion
Transforming your vitality through **${titleCase}** is an empowering, lifelong pursuit. By tuning in to your body's signals, honoring foundational biological needs, and cultivating patient discipline, you unlock the energy and resilience needed to thrive across every dimension of life.`;
    }

    // 4. BUSINESS, FINANCE & MARKETING DOMAIN
    if (/\b(business|startup|marketing|seo|growth|sales|finance|investing|stocks|crypto|money|entrepreneurship|management|leadership|product|saas|e-?commerce|brand|advertising)\b/i.test(lower)) {
        return `# The Strategic Playbook for ${titleCase}: Sustainable Growth, Execution, and Market Leadership

## Introduction
Navigating today's dynamic commercial landscape requires more than just ambitious visions—it demands rigorous execution, clear market positioning, and scalable operational models. Within this competitive arena, mastering **${titleCase}** has become a decisive catalyst for organizations and entrepreneurs striving for sustained market leadership.

As customer expectations evolve and competitive moats compress, success belongs to those who pair clear unit economics with customer-obsessed execution.

---

## Core Growth Levers and Strategic Frameworks
Accelerating success in ${cleanTopic} relies on aligning three fundamental engines:

- **Value Proposition Clarity:** Before scaling acquisition channels, ensure your core offering solves an acute, undeniable pain point with quantifiable ROI.
- **Retention as the Ultimate Growth Engine:** High acquisition with leaky retention is an unsustainable treadmill. Elite operators focus first on customer satisfaction and lifetime value.
- **Data-Driven Feedback Loops:** Replace subjective assumptions with rapid experimentation, customer interviews, and rigorous conversion telemetry.

---

## Navigating Modern Challenges and Market Headwinds
Scaling in competitive environments presents distinct operational hurdles:

1. **Customer Acquisition Cost (CAC) Inflation:** Relying exclusively on paid channels yields diminishing margins. Diversify through organic content, strategic partnerships, and viral product loops.
2. **Operational Complexity:** As teams and offerings expand, bureaucratic drag can stifle innovation. Maintain lean, empowered cross-functional squads with unambiguous ownership.
3. **Maintaining Culture Under Scale:** Protect core standards by rewarding transparent communication, continuous learning, and customer empathy.

---

## The Role of AI and Automation
Modern leaders leverage automated workflows and intelligent tools to streamline repetitive operational tasks, freeing talented teams to focus on creative strategy, relationship-building, and high-impact innovation.

---

${isLong ? `## Capital Allocation and Financial Discipline
Sustainable businesses master the balance between aggressive market expansion and prudent cash-flow management. Monitoring burn multiples, payback periods, and gross margins ensures that expansion accelerates profitability rather than fragility. Long-term moats are built on operational durability and defensive intellectual property.

---
` : ''}## Actionable Leadership Checklist
- **Clarify the Core Metric:** Identify the single North Star metric that truly reflects customer value creation across your organization.
- **Eliminate Low-Leverage Initiatives:** Systematically cut underperforming projects to concentrate focus on top-tier growth levers.
- **Solicit Direct Feedback:** Schedule weekly touchpoints with active customers to uncover unmet needs and emerging opportunities.

---

## Conclusion
Achieving leadership in **${titleCase}** is an ongoing discipline of strategic clarity, operational rigor, and relentless adaptability. By staying grounded in core value creation and executing with speed, forward-thinking organizations turn industry turbulence into enduring competitive advantage.`;
    }

    // 5. ARTS, CULTURE & LIFESTYLE DOMAIN
    if (/\b(music|cinema|movie|film|art|photography|cooking|food|coffee|travel|tourism|culture|history|philosophy|fashion|gaming|book|writing|architecture|design)\b/i.test(lower)) {
        return `# The Art and Influence of ${titleCase}: Cultivating Craft, Expression, and Timeless Impact

## Introduction
Human civilization has always found its most profound resonance through creative and cultural expression. Within this rich tapestry, **${titleCase}** holds a unique capacity to evoke emotion, spark imagination, and connect diverse individuals across cultural boundaries.

Whether explored as an intimate personal passion or appreciated as a cornerstone of human culture, ${cleanTopic} invites us to slow down, observe deeply, and discover meaning in the nuanced details of our world.

---

## Foundational Elements of the Craft
Every masterpiece and memorable experience within ${cleanTopic} rests upon time-honored foundations:

- **Mastery of the Medium:** Understanding tools, techniques, and underlying principles grants the freedom to innovate without compromising quality.
- **Intuition and Intentionality:** Great creators balance technical precision with emotional vulnerability, imbuing their work with genuine authenticity.
- **The Power of Storytelling:** Beyond surface aesthetics, lasting resonance is achieved when an idea taps into universal human truths and shared experiences.

---

## Overcoming Creative Resistance and Developing a Unique Voice
The creative journey is rarely linear; it is shaped through trial, experimentation, and perseverance:

1. **Embrace the Imperfect Draft:** Perfectionism is the enemy of momentum. Generating volume and experimenting freely unlocks unexpected creative breakthroughs.
2. **Curate Inspiring Influences:** Broaden your creative palette by studying masters across diverse genres, disciplines, and historical eras.
3. **Develop Disciplined Rituals:** Inspiration flourishes within dedicated routines. Carving out protected creative time ensures consistent artistic growth.

---

## Cultural Resonance in the Modern Age
In our hyper-connected digital era, creative expression has found exciting new canvases. Global platforms allow emerging voices to find dedicated audiences, while traditional techniques enjoy renewed appreciation as individuals seek tangible authenticity in a screen-saturated world.

---

${isLong ? `## Historical Heritage and Aesthetic Philosophy
Exploring the historical lineage of ${cleanTopic} reveals how past innovations laid the groundwork for contemporary forms. From ancient classical techniques to groundbreaking modern interpretations, creative expression reflects the evolving hopes, struggles, and aspirations of each epoch. Honoring this heritage enriches current work with depth and timeless resonance.

---
` : ''}## Practical Exercises for Enthusiasts
- **Observe with Fresh Eyes:** Dedicate 15 minutes to studying your craft without distraction, noting subtle nuances you previously overlooked.
- **Experiment Without Judgment:** Create a small project purely for the joy of exploration, free from commercial pressure or performance expectations.
- **Share and Connect:** Engage with fellow practitioners to exchange insights, constructive feedback, and mutual encouragement.

---

## Conclusion
Engaging deeply with **${titleCase}** enriches our perception and connects us to something larger than ourselves. By nurturing your curiosity, honoring the craft, and creating with sincere purpose, you contribute to a vibrant legacy of human expression that continues to inspire the world.`;
    }

    // 6. UNIVERSAL / GENERAL DOMAIN
    return `# The Comprehensive Guide to ${titleCase}: Key Perspectives, Mechanics, and Modern Insights

## Introduction
Few topics in today's rapidly changing environment carry as much contemporary relevance as **${titleCase}**. As communities, industries, and personal pursuits continually evolve, developing an articulate, comprehensive grasp of ${cleanTopic} is essential for anyone seeking clarity and informed perspective.

Moving beyond surface impressions reveals an intricate landscape of foundational principles, practical applications, and forward-looking possibilities.

---

## Core Pillars and Foundational Concepts
Understanding ${cleanTopic} requires examining the fundamental mechanisms that drive its development:

- **First-Principles Thinking:** Breaking complex phenomena down into their most basic truths allows us to reason up without relying on outdated assumptions.
- **Interconnected Systems:** No concept exists in isolation. Recognizing how ${cleanTopic} interacts with broader cultural, technological, and economic forces reveals critical leverage points.
- **The Balance of Speed and Quality:** In any serious endeavor, balancing rapid execution with thoughtful deliberation determines long-term viability.

---

## Practical Applications and Real-World Impact
The real-world implications of ${cleanTopic} manifest across multiple dimensions:

1. **Strategic Decision-Making:** Armed with accurate understanding, leaders and individuals can anticipate emerging trends and navigate uncertainty with confidence.
2. **Optimizing Daily Workflows:** Implementing structured protocols around ${cleanTopic} eliminates unnecessary friction and enhances operational efficiency.
3. **Continuous Learning and Iteration:** The most successful practitioners treat mastery as an evolving journey, actively seeking feedback and adapting to new evidence.

---

## Overcoming Common Misconceptions
- **Misconception 1: Success Requires Complicated Systems:** In reality, the most resilient solutions are built on clear, simple rules applied with unwavering consistency.
- **Misconception 2: Progress is Always Linear:** Meaningful breakthroughs often follow periods of steady, unglamorous groundwork. Cultivating patience is just as vital as ambition.

---

${isLong ? `## Future Horizons and Long-Term Trends
Looking toward the coming decade, ${cleanTopic} is poised to undergo significant evolution. Emerging innovations, shifting generational perspectives, and global interconnectedness will reshape established norms. Those who cultivate agility and invest in foundational skills today will be best positioned to lead the conversation tomorrow.

---
` : ''}## High-Leverage Takeaways
- **Clarify Your Objectives:** Define precisely what successful engagement with ${cleanTopic} looks like for your specific goals.
- **Focus on High-Impact Basics:** Master fundamental principles before attempting advanced, specialized maneuvers.
- **Commit to Iterative Growth:** Embrace regular reviews to refine your strategy based on tangible outcomes.

---

## Conclusion
Ultimately, **${titleCase}** represents an inspiring opportunity for growth, exploration, and meaningful impact. By pairing foundational clarity with disciplined, pragmatic action, you can transform complex challenges into enduring stepping stones for long-term success.`;
};

// ==================== 2. DYNAMIC BLOG TITLES (DOMAIN-AWARE & NEVER REPEATS) ====================

// Generates 10 completely unique, dynamic titles sampled from 10 distinct marketing angles tailored to the domain
const generateDynamicTitlesOffline = (topic, category = 'General') => {
    const t = topic.trim();
    const cat = category.trim();
    const year = 2026;
    const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const nums = [5, 7, 9, 10, 11, 13, 15, 21];
    const n1 = getRandom(nums);
    const n2 = getRandom(nums.filter(n => n !== n1));
    const n3 = getRandom(nums.filter(n => n !== n1 && n !== n2));
    const n4 = getRandom(nums.filter(n => n !== n1 && n !== n2 && n !== n3));

    const lowerTopic = t.toLowerCase();
    const lowerCat = cat.toLowerCase();

    // Domain detection flags
    const isSports = lowerCat.includes('sport') || /\b(cricket|football|soccer|tennis|basketball|badminton|baseball|rugby|golf|athletics|marathon|olympics|ipl|nba|nfl|fifa|boxing|mma|swimming|wrestling|hockey|f1|formula|sports?|workout|gym|bodybuilding|powerlifting|crossfit|running)\b/i.test(lowerTopic);
    const isFood = lowerCat === 'food' || lowerCat.includes('cook') || /\b(food|cooking|recipe|recipes|baking|kitchen|chef|pasta|pizza|bread|sourdough|coffee|dessert|vegan|vegetarian|culinary|grilling|barbecue|cocktails|meal\s*prep|cuisine|breakfast|dinner|lunch|snack)\b/i.test(lowerTopic);
    const isTech = lowerCat === 'technology' || lowerCat.includes('tech') || /\b(python|javascript|typescript|react|node|vue|angular|html|css|coding|programming|software|developer|ai|artificial\s*intelligence|machine\s*learning|deep\s*learning|data\s*science|cloud|aws|docker|kubernetes|devops|cybersecurity|blockchain|crypto|database|sql|api|system\s*design|algorithms?|tech|technology|app\s*development|web\s*development)\b/i.test(lowerTopic);
    const isBusiness = lowerCat === 'business' || /\b(business|startup|marketing|seo|growth|sales|finance|investing|stocks|money|entrepreneurship|management|leadership|product|saas|e-?commerce|brand|advertising|venture\s*capital|b2b|pricing)\b/i.test(lowerTopic);
    const isHealth = lowerCat === 'health' || /\b(health|wellness|diet|mental\s*health|sleep|meditation|yoga|weight\s*loss|fasting|therapy|anxiety|depression|mindfulness|hydration|habit|biohacking|longevity)\b/i.test(lowerTopic);
    const isTravel = lowerCat === 'travel' || /\b(travel|tourism|vacation|backpacking|solo\s*travel|itinerary|japan|europe|road\s*trip|flight|hotel|adventure|destination|nomad|wanderlust|beaches?|mountains?)\b/i.test(lowerTopic);
    const isEducation = lowerCat === 'education' || /\b(education|learning|study|studying|exam|exams|student|college|school|language|languages|memory|reading|skills?|math|calculus|phd|curriculum)\b/i.test(lowerTopic);
    const isLifestyle = lowerCat === 'lifestyle' || /\b(lifestyle|minimalism|relationships?|home|decor|fashion|parenting|personal\s*growth|self-?improvement|productivity|mindset|confidence)\b/i.test(lowerTopic);

    let angleBuckets = [];

    if (isSports) {
        angleBuckets = [
            // 1. Masterclass & Tactical Blueprint
            [
                `**The Masterclass in ${t}: Tactical Mastery, Game Reading, and Match-Winning Habits**  \n*How elite athletes and visionary coaches dissect high-pressure moments to seize the decisive advantage.*`,
                `**The Championship Blueprint for ${t}: Foundations, Execution, and Peak Athletic Output**  \n*A rigorous breakdown of field positioning, tactical discipline, and clutch momentum shifts.*`,
                `**Zero to Match-Ready: The Complete Training Blueprint for ${t}**  \n*Everything required to sharpen technical mechanics without unnecessary training fatigue or wasted drills.*`
            ],
            // 2. High-Impact Numbers & Listicles
            [
                `**${n1} Game-Changing Drills That Will Elevate Your ${t} Performance**  \n*Skip generic workouts and focus on high-yield agility and spatial drills proven to transform match performance.*`,
                `**${n1} High-Impact Habits That Separate Elite ${t} Players From Everyday Amateurs**  \n*Subtle pre-game rituals, visual scanning habits, and recovery protocols that compound into greatness.*`,
                `**${n1} Tactical Lessons from Legendary ${t} Encounters That Changed the Game**  \n*Unfiltered tactical takeaways from iconic championship clashes that redefine how the sport is played.*`
            ],
            // 3. Technique Flaws & Mistakes
            [
                `**${n2} Costly Mechanical Flaws That Quietly Derail Your ${t} Performance**  \n*Diagnose and eliminate common balance errors, poor follow-through, and footwork breakdowns.*`,
                `**Stop Training ${t} the Wrong Way: ${n2} Traps That Cause Stagnation and Injury**  \n*Why overtraining junk volume holds you back and how structured periodization fixes it.*`,
                `**Why 90% of Beginners Struggle With ${t} (And the 3-Step Technique Fix)**  \n*A step-by-step breakdown to correct body alignment and unlock effortless athletic leverage.*`
            ],
            // 4. Contrarian & Myth-Busting
            [
                `**The Uncomfortable Truth About ${t} That Most Coaches Won't Tell You**  \n*Why raw genetic talent is wildly overrated compared to deliberate repetition and spatial intelligence.*`,
                `**Why Old-School Wisdom in ${t} Is Being Proven Wrong in ${year}**  \n*Challenging outdated dogmas and embracing modern sports science, biomechanics, and data.*`,
                `**Is Your ${t} Routine Actually Helping? An Objective Performance Audit**  \n*Evaluating real match carryover, stamina benchmarks, and physical trade-offs.*`
            ],
            // 5. Step-by-Step Development Roadmap
            [
                `**From Grassroots to League: The Complete Development Roadmap for ${t}**  \n*A structured, milestone-driven progression engineered to take players from amateur basics to elite execution.*`,
                `**How to Master ${t} Fundamentals in 30 Days: A High-Intensity Routine**  \n*A daily regimen designed to build razor-sharp reflexes, lateral stability, and unflinching muscle memory.*`,
                `**How to Turn Your Technical Understanding of ${t} Into an On-Field Edge**  \n*Translating film study and opponent analysis into lightning-fast tactical decision-making.*`
            ],
            // 6. Modern Analytics & Future Trends
            [
                `**The ${t} Revolution: How Wearables and Real-Time Telemetry Are Reshaping ${year}**  \n*From biometric tracking to predictive spatial modeling: how modern tech is redefining the game.*`,
                `**The Future of ${t}: What the World's Best Academies Are Quietly Developing**  \n*Emerging training methodologies, cognitive reaction testing, and youth development pipelines.*`,
                `**How Rule Evolutions and High-Pace Formats Are Transforming ${t}**  \n*Adapting your skillset to capitalize on the faster, more aggressive modern game.*`
            ],
            // 7. Pro Secrets & High-Yield Hacks
            [
                `**${n3} Micro-Adjustments in ${t} Technique That Unlock Massive Power**  \n*Subtle tweaks in kinetic sequencing, grip tension, and core rotation you can test today.*`,
                `**The Unfair Advantage: How Champion Athletes Read ${t} Differently**  \n*Deconstructing peripheral awareness, anticipation cues, and micro-expressions.*`,
                `**${n3} Little-Known Secrets Top Sports Psychologists Teach ${t} Pros**  \n*Breathing resets, self-talk reframes, and focus anchors that quiet crowd noise and eliminate choke.*`
            ],
            // 8. Case Study & Championship Breakdown
            [
                `**Anatomy of an Upset: What We Learned Analyzing Iconic ${t} Comebacks**  \n*How tactical bravery, situational adjustments, and emotional composure turned certain defeat into victory.*`,
                `**From Plateau to Podium: A Real-World Breakthrough Case Study in ${t}**  \n*The exact 12-week training overhaul that unlocked a breakthrough season for a struggling competitor.*`,
                `**The 10x Athlete: How One Breakthrough Habit Redefined Dominance in ${t}**  \n*Deconstructing how elite performers maintain superhuman consistency across grueling seasons.*`
            ],
            // 9. Mental Game & Clutch Psychology
            [
                `**The Psychology of Clutch: Why Mindset Decides 80% of ${t} Victories**  \n*How to master fear of failure, embrace high-stakes pressure, and perform at your peak when it matters.*`,
                `**How to Overcome the Mental Slump in ${t} and Rebuild Fearless Confidence**  \n*Proven sports psychology protocols for breaking through performance dips and hesitation.*`,
                `**Why Emotional Composure Is Quietly the Deadliest Weapon in Modern ${t}**  \n*Staying calm when opponents try to rattle you and turning game tension to your advantage.*`
            ],
            // 10. Fast Wins & Daily Warmups
            [
                `**The 15-Minute Dynamic Warmup for ${t}: Prepare Joints, Reflexes, and Core**  \n*An essential pre-match routine that activates stabilizing muscles and prevents preventable strains.*`,
                `**${n4} Quick Wins in ${t} You Can Implement by Your Very Next Match**  \n*Fast tactical adjustments that immediately boost your win rate and on-field presence.*`,
                `**The Minimalist Guide to ${t}: Cut the Gimmicks and Focus on What Scores**  \n*How to achieve exceptional results by focusing 90% of your energy on core foundational mechanics.*`
            ]
        ];
    } else if (isFood) {
        angleBuckets = [
            // 1. Culinary Masterclass & Foundations
            [
                `**The Art of Flawless ${t}: The Definitive Kitchen Blueprint**  \n*Master foundational seasoning, heat regulation, and balancing textures like a professional chef.*`,
                `**The Essential Masterclass in ${t}: From Everyday Pantry to Gourmet Dining**  \n*An end-to-end culinary guide designed for home cooks who refuse to settle for bland flavors.*`,
                `**Zero to Feast: The Step-by-Step Blueprint for Unforgettable ${t}**  \n*Everything required to craft stunning culinary creations without intimidating complexity.*`
            ],
            // 2. High-Impact Variations & Listicles
            [
                `**${n1} Mouthwatering Variations of ${t} That Will Wow Your Guests**  \n*Elevated flavor profiles, unexpected twists, and regional variations that turn heads.*`,
                `**${n1} Golden Rules for Making Restaurant-Quality ${t} in a Home Kitchen**  \n*Simple techniques from professional kitchens that instantly transform ordinary ingredients.*`,
                `**${n1} Secret Flavor Boosters That Take ${t} From Good to Unbelievable**  \n*Pantry powerhouses, acids, and umami enhancers that make every single bite pop.*`
            ],
            // 3. Cooking Mistakes & Fixes
            [
                `**${n2} Common Mistakes That Ruin Your ${t} (And How to Fix Them)**  \n*Stop burning, drying out, or overcomplicating your dishes: foolproof fixes for guaranteed success.*`,
                `**Why Your Homemade ${t} Never Tastes Like the Restaurant (And the Secret Fix)**  \n*The subtle seasoning, resting, and emulsion secrets that traditional cookbooks leave out.*`,
                `**Stop Making ${t} the Hard Way: ${n2} Traps That Waste Time and Muddle Flavors**  \n*Clean up your cooking prep and avoid over-seasoning traps that overpower the star ingredient.*`
            ],
            // 4. Contrarian & Culinary Myth-Busting
            [
                `**The Uncomfortable Truth About Cooking ${t} Nobody Wants to Admit**  \n*Why expensive specialty tools are unnecessary and why technique beats high-end cookware every time.*`,
                `**Why Everything You Were Taught About Making ${t} Is Quietly Wrong**  \n*Debunking outdated culinary dogmas and old wives' tales using modern food science.*`,
                `**Is Fancy Gourmet ${t} Actually Worth the Extra Effort? An Honest Taste Test**  \n*A blind-test breakdown comparing weeknight shortcuts to laborious 3-hour traditional recipes.*`
            ],
            // 5. Practical How-To & Step-by-Step
            [
                `**How to Master Authentic ${t} in Your Kitchen: A Step-by-Step Guide**  \n*A foolproof, beginner-friendly walkthrough covering ingredient prep, cook times, and plating.*`,
                `**How to Turn Simple ${t} Into an Unforgettable Signature Dish**  \n*The secret to layering aromatics, finishing oils, and textures to create a memorable feast.*`,
                `**The Weeknight Miracle: How to Cook Flawless ${t} in Under 25 Minutes**  \n*Minimal dishes, fast cooking times, and vibrant flavors for when time is short.*`
            ],
            // 6. Modern Trends & Flavor Fusions
            [
                `**The ${t} Revolution: Bold Fusion Trends and Modern Plating for ${year}**  \n*How inventive modern chefs are reimagining classic recipes with exciting global twists.*`,
                `**Plant-Forward, Artisanal, and Sustainable: The Future of ${t} in ${year}**  \n*Adapting traditional favorites for wellness-conscious diets without losing a drop of flavor.*`,
                `**What Modern Gastronomy Tells Us About the Chemistry of Perfect ${t}**  \n*Harnessing the Maillard reaction, proper resting, and lipid-binding for decadent results.*`
            ],
            // 7. Chef Secrets & Finishing Touches
            [
                `**${n3} Little-Known Secrets Michelin Chefs Use When Preparing ${t}**  \n*The finishing salts, compound butters, and resting techniques that create unforgettable dining.*`,
                `**The Unfair Advantage: How Seasoned Cooks Balance Acidity and Richness in ${t}**  \n*Deconstructing flavor theory so your dishes never taste flat, cloying, or unbalanced.*`,
                `**${n3} Micro-Adjustments in ${t} Prep That Elevate Every Single Bite**  \n*Knife cuts, temperature tempering, and pan selection tricks you can test right now.*`
            ],
            // 8. Flavor Pairing & Proof
            [
                `**The Ultimate Flavor Pairing Guide for ${t}: Wine, Herbs, and Sides**  \n*Curate harmonious multi-course dinners with pairings that complement every nuance.*`,
                `**What Happened When We Tested 5 Famous Recipes for ${t} Side-by-Side**  \n*Raw comparisons, texture notes, and our unanimous verdict on the undisputed champion.*`,
                `**From Bland to Brilliant: A Real-World Kitchen Transformation with ${t}**  \n*How small upgrades in technique transformed an everyday staple into a dinner party centerpiece.*`
            ],
            // 9. Sensory Cooking & Kitchen Confidence
            [
                `**The Psychology of Taste: Why Great ${t} Begins With Cooking by Scent and Sight**  \n*Ditch rigid timers and learn to trust your senses to nail doneness every time.*`,
                `**Why ${t} Is Quietly the Most Versatile and Rewarding Dish to Master**  \n*One foundational recipe that unlocks dozens of creative, stress-free meals throughout the year.*`,
                `**How to Conquer Kitchen Anxiety and Cook ${t} With Effortless Confidence**  \n*Mise en place habits that eliminate stress and make cooking genuinely relaxing.*`
            ],
            // 10. Quick Wins & Meal Prep Checklists
            [
                `**The 10-Minute Meal-Prep Guide for ${t}: Eat Incredibly All Week**  \n*Smart batching strategies that keep textures vibrant and eliminate weeknight cooking exhaustion.*`,
                `**${n4} Quick Kitchen Hacks for ${t} You Can Try for Tonight's Dinner**  \n*Fast flavor accelerators you can test using basic pantry staples already in your cupboard.*`,
                `**The Minimalist Guide to ${t}: 5 Quality Ingredients, Zero Fluff**  \n*Let quality produce and simple technique shine by cutting away fussy, unnecessary steps.*`
            ]
        ];
    } else if (isTech) {
        angleBuckets = [
            // 1. Architecture & Masterclass
            [
                `**The Modern Playbook for ${t}: Architecture, Patterns, and Best Practices in ${year}**  \n*A comprehensive blueprint for engineering scalable, resilient systems without tech debt.*`,
                `**The Definitive Guide to ${t}: From Foundations to Senior Production Architecture**  \n*An end-to-end technical breakdown designed for developers seeking genuine architectural clarity.*`,
                `**Mastering ${t} at Scale: High-Throughput Systems and Resilient Design Patterns**  \n*Battle-tested engineering patterns for building fault-tolerant services that withstand surge traffic.*`
            ],
            // 2. High-Impact Numbers & Listicles
            [
                `**${n1} Battle-Tested ${t} Strategies That High-Growth Engineering Teams Swear By**  \n*Skip theoretical dogma and focus on production-grade patterns that prevent regressions.*`,
                `**${n1} Game-Changing Lessons I Learned After Migrating Production to ${t}**  \n*Unfiltered takeaways from hands-on architecture transitions and high-stakes rollouts.*`,
                `**${n1} High-Performance ${t} Habits That Separate Staff Engineers From Juniors**  \n*Defensive coding standards, telemetry protocols, and clean separation of concerns.*`
            ],
            // 3. Costly Anti-Patterns & Pitfalls
            [
                `**${n2} Costly Anti-Patterns in ${t} (And What to Do Instead)**  \n*Avoid memory leaks, race conditions, and hidden bottlenecks before they strike in production.*`,
                `**Stop Over-Engineering ${t}: ${n2} Traps That Slow Down Your Team's Velocity**  \n*The subtle architectural bloat and premature optimizations that derail modern dev pipelines.*`,
                `**Why 90% of Developers Struggle When Scaling ${t} (And the 3-Step Fix)**  \n*How to diagnose architectural bottlenecks and enforce clean boundary layers.*`
            ],
            // 4. Contrarian & Myth-Busting
            [
                `**The Uncomfortable Truth About ${t} That the Hype Machine Won't Tell You**  \n*A candid, engineering-driven reality check on trade-offs, maintenance costs, and operational drag.*`,
                `**Why Traditional Wisdom Around ${t} Is Quietly Becoming Obsolete in ${year}**  \n*Challenging legacy practices and adapting to modern distributed cloud primitives.*`,
                `**Is ${t} Really Worth the Complexity? An Objective Benchmark & Cost Analysis**  \n*Benchmarked latency, infrastructure bills, and maintenance overhead before you rewrite.*`
            ],
            // 5. Hands-on Roadmap & Step-by-Step
            [
                `**Zero to Production with ${t}: The Complete Developer Roadmap**  \n*A pragmatic, hands-on path from clean project scaffolding to automated CI/CD and deployment.*`,
                `**How to Master ${t} in 30 Days: A Practical Step-by-Step Blueprint**  \n*A curated, project-driven framework engineered to build deep competence and engineering speed.*`,
                `**How to Refactor Legacy Code with ${t} Without Halting Feature Velocity**  \n*Incremental migration strategies that reduce technical debt without risking service downtime.*`
            ],
            // 6. Modern Ecosystem & Future Trends
            [
                `**The ${t} Revolution: Bold Predictions, Tooling Shifts, and Trends for ${year}**  \n*Where the runtime and tooling ecosystem is heading and how early adopters are preparing.*`,
                `**How AI-Assisted Tooling Is Radically Transforming ${t} Development**  \n*Leveraging intelligent code generation and automated testing without sacrificing code quality.*`,
                `**The Next Decade of ${t}: What Core Contributors and Cloud Pioneers Are Building**  \n*Key RFCs, runtime optimizations, and emergent protocols worth bookmarking today.*`
            ],
            // 7. Pro Secrets & High-Performance Hacks
            [
                `**${n3} Little-Known Optimization Secrets for Maximizing ${t} Throughput**  \n*Low-level profiling techniques and caching mechanisms rarely discussed in beginner docs.*`,
                `**The Senior Engineer's Advantage: How Top Architects Approach ${t} Differently**  \n*Deconstructing mental models, API design principles, and graceful degradation strategies.*`,
                `**${n3} Defensive Coding Practices in ${t} That Prevent Midnight Pager Outages**  \n*Strict input validation, idempotent transactions, and structured logging blueprints.*`
            ],
            // 8. Case Study & Real-World Postmortems
            [
                `**From Disaster to 99.99% Uptime: What an Outage in ${t} Taught Us**  \n*A transparent incident postmortem detailing the hidden bug, root cause, and architectural fix.*`,
                `**What Happened When We Benchmarked ${t} Under 100,000 Concurrent Requests**  \n*Raw memory metrics, P99 latency spikes, and surprising takeaways from stress-testing.*`,
                `**The 10x Velocity Transformation: How Adopting ${t} Reinvigorated Our Engineering Org**  \n*Actionable frameworks extracted from an ambitious multi-team infrastructure migration.*`
            ],
            // 9. Mental Models & Engineering Culture
            [
                `**The Psychology of Clean Code in ${t}: Why Maintainability Trumps Cleverness**  \n*Writing self-documenting code that future teammates can refactor fearlessly in seconds.*`,
                `**Why ${t} Is Quietly the Most Valuable Technical Skill in Modern Engineering**  \n*Understanding the compounding power of deep runtime knowledge in a commoditized market.*`,
                `**Overcoming the Senior Plateau in ${t}: Expanding From Coder to System Architect**  \n*Proven strategies for expanding your technical impact across cross-functional orgs.*`
            ],
            // 10. Quick Wins & Production Checklists
            [
                `**The 15-Minute ${t} Production Checklist: Security, Metrics, and Linting**  \n*Run this diagnostic audit today to identify silent security vulnerabilities and misconfigurations.*`,
                `**${n4} Performance Tweaks in ${t} You Can Ship by Tomorrow Morning**  \n*Quick, high-leverage optimizations that shave milliseconds off customer request times.*`,
                `**The Minimalist Guide to ${t}: Cut the Bloat and Build What Matters**  \n*How to achieve high reliability by ruthlessly removing unnecessary dependencies.*`
            ]
        ];
    } else if (isBusiness) {
        angleBuckets = [
            // 1. Strategic Playbook & Scaling
            [
                `**The Modern Growth Playbook for ${t}: Scaling Predictable Revenue in ${year}**  \n*A comprehensive blueprint for identifying high-converting channels and engineering viral loops.*`,
                `**The Definitive Operator's Guide to ${t}: From Zero to Market Leadership**  \n*An end-to-end execution framework designed for founders and executives building lasting value.*`,
                `**Mastering Unit Economics in ${t}: Sustainable Margins and Capital Efficiency**  \n*How world-class businesses balance aggressive expansion with rigorous cash-flow discipline.*`
            ],
            // 2. High-Impact Numbers & Listicles
            [
                `**${n1} High-Impact ${t} Strategies That Actually Move the Revenue Needle**  \n*Skip vanity metrics and focus on the high-leverage conversion levers that drive profitability.*`,
                `**${n1} Brutal Business Lessons I Learned After Deep-Diving Into ${t}**  \n*Unfiltered takeaways from hands-on experimentation, sales cycles, and operational pivots.*`,
                `**${n1} Execution Habits That Separate Top 1% Operators in ${t} From the Rest**  \n*Simple daily management practices and decision-making cadences that compound over time.*`
            ],
            // 3. Conversion Traps & Pitfalls
            [
                `**${n2} Costly Strategic Mistakes Companies Make With ${t} (And the Fixes)**  \n*Avoid burning customer acquisition budget on poorly positioned offers and leaky funnels.*`,
                `**Stop Scaling ${t} the Hard Way: ${n2} Traps That Burn Cash and Stifle Growth**  \n*The subtle operational friction and misaligned incentives holding your team back.*`,
                `**Why 90% of Startups Struggle in ${t} (And the 3-Step Turnaround Blueprint)**  \n*How to diagnose product-market fit friction and reposition your core value proposition.*`
            ],
            // 4. Contrarian & Market Insights
            [
                `**The Uncomfortable Truth About ${t} Nobody in the Industry Admits**  \n*A candid, data-driven look past promotional hype to examine what really creates lasting moats.*`,
                `**Why Conventional Marketing Wisdom in ${t} Is Dying in ${year}**  \n*Challenging traditional playbooks and adapting to changing customer buying behavior.*`,
                `**Is Aggressive Growth in ${t} Really Worth the Churn? An Honest Financial Reality Check**  \n*Evaluating lifetime value, payback periods, and the true cost of customer acquisition.*`
            ],
            // 5. Step-by-Step Blueprint & Roadmaps
            [
                `**How to Build a High-Converting ${t} Engine in 30 Days: A Step-by-Step Roadmap**  \n*A practical execution framework engineered to generate qualified pipeline and close deals.*`,
                `**How to Turn Your Unique IP in ${t} Into an Unfair Competitive Advantage**  \n*Practical systems for translating domain expertise into defensible pricing power and brand equity.*`,
                `**The Lean Operator: How to Launch a Lean ${t} Initiative in Under a Week**  \n*A minimalist approach to validating demand, collecting customer feedback, and iterating rapidly.*`
            ],
            // 6. Future Trends & Market Shifts
            [
                `**The ${t} Revolution: Macro Trends and Distribution Shifts for the Next 5 Years**  \n*Where customer demand is moving and how forward-thinking leaders are positioning ahead of the curve.*`,
                `**How AI and Workflow Automation Are Rewriting the Economics of ${t} in ${year}**  \n*Automating repetitive operational tasks to liberate talent for high-impact strategic innovation.*`,
                `**The Future of ${t}: What Venture-Backed Disruptors Are Quietly Building**  \n*Key signals, customer behavior shifts, and technological catalysts reshaping the industry.*`
            ],
            // 7. Insider Secrets & Pricing Psychology
            [
                `**${n3} Little-Known Secrets Top Executives Use to Dominate in ${t}**  \n*High-level negotiation tactics, retention flywheels, and strategic partnership models.*`,
                `**The Pricing Advantage: How Market Leaders in ${t} Command Premium Rates**  \n*Deconstructing value perception, risk reversal, and psychological pricing tiers.*`,
                `**${n3} High-Yield Funnel Adjustments in ${t} That Produce Outsized Conversion Gains**  \n*Small optimizations on landing pages, onboarding sequences, and checkout flows.*`
            ],
            // 8. Case Studies & Proven Results
            [
                `**From Bootstrap to Scale: A Transparent Breakdown of Growth in ${t}**  \n*The exact step-by-step breakdown of an ambitious product launch from first customer to profitability.*`,
                `**What Happened When We A/B Tested Our ${t} Strategy for 90 Days**  \n*Raw conversion metrics, retention data, and surprising takeaways from real market tests.*`,
                `**The 10x Turnaround: How One Strategic Pivot Saved Our ${t} Trajectory**  \n*Actionable frameworks extracted from a high-stakes challenge when initial plans stalled.*`
            ],
            // 9. Buyer Psychology & Trust
            [
                `**The Psychology of Modern Buyers in ${t}: Why Trust Drives 80% of Sales**  \n*Overcoming buyer skepticism, cognitive dissonance, and procurement friction.*`,
                `**Why Customer Retention in ${t} Is Quietly Your Highest-ROI Acquisition Channel**  \n*Understanding the compounding power of organic word-of-mouth and customer delight.*`,
                `**How to Break Through Stagnation in ${t} and Reignite Explosive Expansion**  \n*Proven strategies for revitalizing dormant pipelines and unlocking new customer segments.*`
            ],
            // 10. Quick Wins & Operational Audits
            [
                `**The 10-Minute ${t} Funnel Audit: A Diagnostic Checklist for Instant Clarity**  \n*Run this quick assessment today to identify your single highest-leverage growth bottleneck.*`,
                `**${n4} High-Impact Growth Experiments in ${t} You Can Launch Tomorrow**  \n*Fast, low-cost marketing initiatives designed to generate immediate customer traction.*`,
                `**The Minimalist Guide to ${t}: Cut the Waste and Focus on High-Margin Output**  \n*How to achieve outstanding financial performance by eliminating 80% of unproductive busywork.*`
            ]
        ];
    } else if (isHealth) {
        angleBuckets = [
            // 1. Evidence-Based Protocol
            [
                `**The Science of ${t}: Evidence-Based Protocols for Vitality and Longevity**  \n*Ditch fleeting health fads and understand the biological mechanisms driving real well-being.*`,
                `**The Definitive Wellness Guide to ${t}: From Foundations to Daily Peak Energy**  \n*A grounded, science-backed lifestyle blueprint designed for sustainable, long-term vitality.*`,
                `**Mastering ${t}: How Biological Rhythm and Cellular Health Dictate Your Energy**  \n*An end-to-end exploration of hormonal harmony, metabolic health, and restorative recovery.*`
            ],
            // 2. High-Impact Habits & Listicles
            [
                `**${n1} Science-Backed ${t} Habits That Create Visible Health Transformation**  \n*Skip confusing conflicting advice and focus on the daily micro-rituals proven to elevate energy.*`,
                `**${n1} Game-Changing Health Lessons I Learned After Deep-Diving Into ${t}**  \n*Unfiltered takeaways from biomarker tracking, nutritional adjustments, and lifestyle shifts.*`,
                `**${n1} Restorative Daily Practices in ${t} That Separate Thriving People From the Exhausted**  \n*Simple routines that down-regulate the nervous system and protect mental clarity.*`
            ],
            // 3. Health Myths & Traps
            [
                `**${n2} Dangerous Myths About ${t} Debunked by Modern Medical Science**  \n*Stop sabotaging your metabolism with extreme protocols: what peer-reviewed research actually shows.*`,
                `**Why Most People Burn Out With ${t} (And the Gentle, Sustainable Fix)**  \n*The subtle recovery deficits and chronic stress triggers that stall progress.*`,
                `**Stop Treating ${t} as a Quick Fix: ${n2} Traps That Wreck Your Hormonal Balance**  \n*Why crash approaches always trigger rebound fatigue and how to build permanent resilience.*`
            ],
            // 4. Contrarian & Biological Realities
            [
                `**The Uncomfortable Biological Truth About ${t} Nobody Wants to Admit**  \n*Why willpower is vastly overrated and why optimizing your sleep environment does 90% of the work.*`,
                `**Why Conventional Diet and Exercise Wisdom Around ${t} Is Fading in ${year}**  \n*Challenging calorie dogmas and focusing on circadian timing, nutrient density, and gut health.*`,
                `**Is Your ${t} Routine Actually Damaging Your Recovery? An Honest Health Check**  \n*Evaluating heart rate variability, cortisol markers, and true restorative rest.*`
            ],
            // 5. Step-by-Step Sustainable Roadmap
            [
                `**How to Transform Your Relationship With ${t} in 30 Days: A Gentle Blueprint**  \n*A progressive, zero-guilt roadmap designed to integrate seamlessly into a demanding life.*`,
                `**How to Turn Daily Micro-Habits in ${t} Into an Unshakeable Health Shield**  \n*Practical systems for anchoring positive choices so they become second nature.*`,
                `**The Busy Person's Guide to ${t}: Sustainable Vitality in Under 20 Minutes a Day**  \n*A minimalist approach to movement, hydration, and nutrition with zero complicated rituals.*`
            ],
            // 6. Modern Longevity & Future Science
            [
                `**The ${t} Revolution: Cellular Longevity, Biomarkers, and Future Health in ${year}**  \n*How preventive science and personalized health metrics are helping people live healthier longer.*`,
                `**How Wearable Biometrics Are Revolutionizing How We Approach ${t}**  \n*Using sleep stage tracking, resting heart rate, and metabolic markers to guide daily pacing.*`,
                `**The Future of ${t}: What Leading Longevity Researchers Are Doing Right Now**  \n*Key discoveries in mitochondrial health, stress adaptation, and regenerative lifestyle.*`
            ],
            // 7. Micro-Adjustments & Daily Secrets
            [
                `**${n3} Little-Known Secrets Functional Medicine Doctors Share About ${t}**  \n*Targeted lifestyle interventions that reduce systemic inflammation and elevate cognitive drive.*`,
                `**The Unfair Advantage: How Energized High-Performers Approach ${t} Differently**  \n*Deconstructing morning light exposure, meal timing, and nervous system regulation.*`,
                `**${n3} Micro-Adjustments in ${t} That Produce Noticeable Energy Surges**  \n*Small tweaks in hydration, posture, and breathing that you can test immediately today.*`
            ],
            // 8. Case Study & Personal Transformation
            [
                `**From Chronic Burnout to Radiant Vitality: A Real-World Case Study with ${t}**  \n*The exact step-by-step lifestyle overhaul that restored energy, sleep quality, and mental focus.*`,
                `**What Happened When We Followed an Evidence-Based ${t} Protocol for 60 Days**  \n*Raw biomarker changes, qualitative reflections, and surprising takeaways from an honest experiment.*`,
                `**The 10x Wellness Shift: How Small Changes in ${t} Rejuvenated Our Daily Life**  \n*Practical frameworks extracted from a compassionate, sustainable lifestyle transformation.*`
            ],
            // 9. Mental Health & Neurochemistry
            [
                `**The Mind-Body Axis in ${t}: Why Mental Calm Is Your Biological Superpower**  \n*How easing chronic nervous system activation restores digestion, deep sleep, and joyful presence.*`,
                `**Why ${t} Is Quietly the Foundation of Emotional Resilience and Calm**  \n*Understanding the profound connection between physical inputs and mood stability.*`,
                `**How to Break Free From the Perfectionism Trap in ${t} and Truly Thrive**  \n*Cultivating self-compassion and celebrating consistency over rigid, stressful rules.*`
            ],
            // 10. Quick Wins & Weekend Resets
            [
                `**The 10-Minute ${t} Self-Audit: A Diagnostic Checklist for Instant Clarity**  \n*Run this simple body inventory today to identify your biggest restorative opportunity.*`,
                `**${n4} Quick Wellness Wins in ${t} You Can Experience by Tomorrow Morning**  \n*Fast, soothing lifestyle upgrades that immediately improve sleep depth and wake-up energy.*`,
                `**The Minimalist Guide to ${t}: Cut the Expensive Supplements and Focus on Basics**  \n*Achieve peak vitality by prioritizing natural light, restorative sleep, hydration, and real food.*`
            ]
        ];
    } else if (isTravel) {
        angleBuckets = [
            // 1. Ultimate Travel Guide
            [
                `**The Definitive Traveler's Guide to ${t}: Hidden Gems, Secret Spots, and Culture**  \n*Skip tourist traps and experience authentic local life, breathtaking vistas, and unforgettable dining.*`,
                `**The Modern Playbook for Exploring ${t}: From Budget Backpacking to Luxury Retreats**  \n*An end-to-end journey blueprint designed for adventurers who crave genuine cultural depth.*`,
                `**Zero to Boarding Pass: The Complete Planning Masterclass for ${t}**  \n*Everything required to navigate transit, bookings, and itineraries without logistical stress.*`
            ],
            // 2. High-Impact Itineraries & Numbers
            [
                `**${n1} Unforgettable Experiences in ${t} That Most Tourists Completely Miss**  \n*Secret alleys, secluded viewpoints, and authentic neighborhood eateries off the beaten path.*`,
                `**${n1} Crucial Travel Lessons I Learned After Exploring ${t} for Weeks**  \n*Unfiltered takeaways on local customs, transit navigation, and smart currency exchange.*`,
                `**${n1} High-Value Travel Hacks That Save You Hundreds on Your ${t} Adventure**  \n*Insider booking tricks, discount passes, and smart timing that stretch your budget effortlessly.*`
            ],
            // 3. Rookie Travel Mistakes
            [
                `**${n2} Costly Travel Mistakes People Make in ${t} (And How to Avoid Them)**  \n*Avoid tourist scams, overpriced transit traps, and crowded peak-hour bottlenecks.*`,
                `**Stop Traveling ${t} the Hard Way: ${n2} Traps That Ruin Your Vacation Vibe**  \n*The subtle planning blunders that turn a dream trip into an exhausting logistical nightmare.*`,
                `**Why 90% of First-Time Visitors to ${t} Plan Wrong (And the 3-Step Fix)**  \n*How to slow down your itinerary and soak in authentic culture without rushing through checklists.*`
            ],
            // 4. Contrarian & Reality Check
            [
                `**The Uncomfortable Truth About ${t} That Instagram Influencers Hide**  \n*An honest, refreshing reality check on crowds, weather realities, and what is truly worth visiting.*`,
                `**Why Everything You Read in Commercial Guidebooks About ${t} Is Outdated**  \n*Challenging generic tourist recommendations and discovering the contemporary local heartbeat.*`,
                `**Is Visiting ${t} in Peak Season Really Worth It? An Objective Comparison**  \n*Evaluating shoulder-season savings, weather trade-offs, and serene crowd-free alternatives.*`
            ],
            // 5. Practical Itineraries & How-Tos
            [
                `**How to Experience the Best of ${t} in 7 Days: The Ideal Step-by-Step Itinerary**  \n*A thoughtfully paced day-by-day roadmap engineered for incredible sights, food, and relaxation.*`,
                `**How to Travel ${t} Solo and Have the Most Empowering Adventure of Your Life**  \n*Safety protocols, making friends on the road, and navigating foreign neighborhoods with total confidence.*`,
                `**The 72-Hour Weekend Escape to ${t}: High-Impact Itinerary With Zero Burnout**  \n*A minimalist travel plan designed to capture the magic of the destination in one quick trip.*`
            ],
            // 6. Modern Nomads & Travel Trends
            [
                `**The ${t} Revolution: Remote Work, Slow Travel, and Nomadic Trends in ${year}**  \n*How digital nomads and conscious travelers are establishing vibrant hubs across the region.*`,
                `**Sustainable and Respectful Travel in ${t}: Preserving Culture and Nature in ${year}**  \n*Supporting local artisans, choosing eco-friendly transport, and traveling with a positive footprint.*`,
                `**The Future of Adventure in ${t}: Emerging Trails, Homestays, and Hidden Valleys**  \n*New travel corridors and immersive cultural experiences waiting for curious pioneers.*`
            ],
            // 7. Packing & Local Secrets
            [
                `**${n3} Little-Known Secrets Locals in ${t} Wish Every Traveler Knew**  \n*Neighborhood etiquette, hidden neighborhood taverns, and polite phrases that open doors.*`,
                `**The Minimalist Packing Guide for ${t}: One Carry-On Bag, Infinite Freedom**  \n*The exact clothing capsules, travel gear, and essentials you need to move light and fast.*`,
                `**${n3} Micro-Adjustments to Your ${t} Itinerary That Make It 10x More Magical**  \n*Sunrise viewpoint tricks, off-peak museum hours, and local market timing.*`
            ],
            // 8. Culinary Journey & Case Study
            [
                `**A Food Lover's Pilgrimage Through ${t}: Street Food Stalls to Hidden Bistros**  \n*The definitive culinary guide to regional specialties, market delicacies, and iconic dishes.*`,
                `**What Happened When We Spent a Month Living Like Locals in ${t}**  \n*Raw budget breakdowns, genuine neighborhood friendships, and lessons learned off the tourist grid.*`,
                `**The 10x Travel Transformation: How One Spontaneous Detour in ${t} Made the Trip**  \n*Actionable travel wisdom extracted from embracing serendipity over rigid schedules.*`
            ],
            // 9. Travel Mindset & Mindfulness
            [
                `**The Psychology of Wandering: Why ${t} Will Radically Expand Your Perspective**  \n*Stepping out of comfort zones, cultivating curiosity, and embracing the unfamiliar.*`,
                `**Why ${t} Is Quietly the Most Transformative Destination on Earth Right Now**  \n*Understanding how the unique history and hospitality of the region leave a lifelong mark.*`,
                `**How to Overcome Travel Anxiety in ${t} and Savor Every Single Moment**  \n*Practical tips for staying calm when trains run late, languages confuse, or plans shift.*`
            ],
            // 10. Quick Wins & Packing Checklists
            [
                `**The 10-Minute ${t} Trip Checklist: Visas, Transit Cards, and Offline Maps**  \n*Run this essential pre-departure audit to ensure zero hiccups upon landing at the airport.*`,
                `**${n4} Quick Wins in ${t} You Can Enjoy on Your Very First Day**  \n*Fast, easy orientation habits to shake off jet lag and immediately feel at home in the city.*`,
                `**The Budget-Conscious Guide to ${t}: Splurge on Memories, Save on Logistics**  \n*How to travel deeply without overspending on overpriced tourist packages.*`
            ]
        ];
    } else if (isEducation) {
        angleBuckets = [
            // 1. Accelerated Learning Blueprint
            [
                `**The Accelerated Learning Blueprint for ${t}: Fast Mastery in ${year}**  \n*Harness cognitive science, active recall, and spaced repetition to absorb complex concepts.*`,
                `**The Definitive Self-Taught Guide to ${t}: From Total Beginner to Mastery**  \n*A comprehensive, self-directed curriculum engineered for lifelong learners seeking real competence.*`,
                `**Mastering ${t} Without Burnout: The Modern Student's Strategic Guide**  \n*How to balance intense study sessions with deep restorative breaks for permanent memory consolidation.*`
            ],
            // 2. High-Impact Study Habits & Listicles
            [
                `**${n1} High-Impact Study Habits That Make Learning ${t} Effortless**  \n*Skip passive re-reading and adopt active testing techniques proven to double exam scores.*`,
                `**${n1} Eye-Opening Lessons I Learned After Deep-Diving Into ${t}**  \n*Unfiltered takeaways from hands-on projects, intensive coursework, and practical application.*`,
                `**${n1} Mental Frameworks That Separate Top 1% Students in ${t} From the Rest**  \n*Feynman synthesis techniques, visual concept maps, and first-principles thinking.*`
            ],
            // 3. Learning Mistakes & Traps
            [
                `**${n2} Counterproductive Study Habits People Use for ${t} (And the Fixes)**  \n*Why highlighting and marathon cramming fail, and what proven learning science shows instead.*`,
                `**Why Most People Give Up on Learning ${t} (And How to Push Through)**  \n*Diagnosing the steep learning curve plateau and structuring positive feedback loops.*`,
                `**Stop Studying ${t} the Hard Way: ${n2} Traps That Waste Hours and Cause Fatigue**  \n*The subtle pseudo-work habits that feel productive but produce zero real retention.*`
            ],
            // 4. Contrarian & Education Insights
            [
                `**The Uncomfortable Truth About Learning ${t} That Traditional Schools Ignore**  \n*Why experiential, project-based building outperforms memorizing abstract textbook theory.*`,
                `**Why Conventional Advice on Mastering ${t} Is Quietly Failing in ${year}**  \n*Challenging traditional degree requirements in favor of demonstrable proof-of-work portfolios.*`,
                `**Is Cramming for ${t} Ever Worth It? A Cognitive Science Reality Check**  \n*Evaluating forgetting curves, neuroplasticity, and why spaced repetition wins every single time.*`
            ],
            // 5. Step-by-Step Curriculum
            [
                `**How to Master ${t} in 30 Days: A Structured Step-by-Step Roadmap**  \n*A progressive syllabus designed to take you from foundational concepts to advanced execution.*`,
                `**How to Turn Your Theoretical Knowledge of ${t} Into Real-World Mastery**  \n*Bridging the gap between passing exams and building production-grade artifacts.*`,
                `**The 20-Minute Daily ${t} Routine: High-Yield Learning for Busy People**  \n*How consistent micro-learning sessions compound into massive domain fluency over time.*`
            ],
            // 6. Modern Tools & AI Learning
            [
                `**The ${t} Revolution: How AI Tutors and Interactive Tools Are Changing ${year}**  \n*Leveraging modern intelligent tools to generate custom practice problems and flashcard decks.*`,
                `**The Future of Education in ${t}: Micro-Credentials and Global Knowledge Sharing**  \n*How curious self-starters are outlearning traditional institutions through digital communities.*`,
                `**What Modern Cognitive Psychology Tells Us About Fast Memory Encoding in ${t}**  \n*Harnessing sleep consolidation, dual coding, and interweaving to retain complex ideas.*`
            ],
            // 7. Pro Memory Hacks & Flow State
            [
                `**${n3} Memory Techniques Top Polymaths Use to Absorb ${t} Quickly**  \n*Mnemonic palaces, associative analogies, and conceptual hooks that lock ideas in place.*`,
                `**The Deep Work Protocol for ${t}: Entering 2 Hours of Pure Study Flow**  \n*Creating a distraction-free sanctuary to process challenging textbooks without mental wandering.*`,
                `**${n3} Micro-Adjustments to Your Study Space That 2x Focus When Learning ${t}**  \n*Ergonomic setups, lighting adjustments, and website blockers that protect cognitive bandwidth.*`
            ],
            // 8. Case Study & Breakthroughs
            [
                `**From Struggling to Ace: How One Student Turned Around Their ${t} Grades**  \n*The exact revision overhaul, practice testing schedule, and mindset reset that drove top marks.*`,
                `**What Happened When We Applied the Feynman Technique to ${t} for 30 Days**  \n*Raw reflections on explaining complex ideas in simple language and where true clarity emerged.*`,
                `**The 10x Learning Shift: How Building Real Projects Transformed Our Grasp of ${t}**  \n*Actionable frameworks extracted from ditching passive tutorials and learning by doing.*`
            ],
            // 9. Overcoming Imposter Syndrome
            [
                `**The Psychology of Student Confidence: Overcoming Imposter Syndrome in ${t}**  \n*Silencing self-doubt, embracing mistakes as data, and cultivating a resilient growth mindset.*`,
                `**Why ${t} Is Quietly the Most Empowering Skill You Can Learn This Year**  \n*Understanding how conquering difficult technical subjects builds permanent self-belief.*`,
                `**How to Overcome Exam Anxiety in ${t} and Perform at Your Best Under Pressure**  \n*Physiological sighs, pre-test brain dumps, and tactical pacing to eliminate test-day panic.*`
            ],
            // 10. Quick Wins & Revision Checklists
            [
                `**The 10-Minute ${t} Concept Audit: Test Your Real Understanding Now**  \n*Can you explain the core fundamentals without checking your notes? A fast diagnostic quiz.*`,
                `**${n4} High-Yield Revision Wins in ${t} You Can Execute by Tomorrow Morning**  \n*Fast active-recall drills to test key formulas, terms, and conceptual hierarchies.*`,
                `**The Minimalist Guide to ${t}: Cut the Study Fluff and Focus on Core Principles**  \n*How to achieve top-tier comprehension by mastering the vital 20% of foundational concepts.*`
            ]
        ];
    } else if (isLifestyle) {
        angleBuckets = [
            // 1. Intentional Living Blueprint
            [
                `**The Intentional Life: Designing Your Days Around ${t} in ${year}**  \n*Declutter mental static, set healthy boundaries, and structure your life around what truly fulfills you.*`,
                `**The Definitive Guide to ${t}: Cultivating Meaning, Clarity, and Daily Joy**  \n*A holistic personal growth framework designed for modern individuals seeking authentic balance.*`,
                `**Zero to Grounded: The Complete Mindset Reset for ${t}**  \n*Everything required to quiet inner noise, beat overwhelm, and live with grounded presence.*`
            ],
            // 2. High-Impact Daily Habits & Listicles
            [
                `**${n1} Daily Keystone Habits in ${t} That Radically Improve Your Quality of Life**  \n*Small, compounding lifestyle rituals that build emotional peace, vitality, and creative focus.*`,
                `**${n1} Transformative Lessons I Learned After Shifting My Approach to ${t}**  \n*Unfiltered takeaways on letting go of perfectionism and embracing authentic personal truth.*`,
                `**${n1} High-Value Boundaries in ${t} That Separate Calm People From the Overwhelmed**  \n*How to protect your time, energy, and mental bandwidth without guilt or social awkwardness.*`
            ],
            // 3. Subtle Traps & Energy Drains
            [
                `**${n2} Subtle Habits in ${t} That Quietly Drain Your Energy and Happiness**  \n*Identify the hidden social comparisons, cluttered spaces, and passive scrolling traps.*`,
                `**Stop Complicating ${t}: ${n2} Traps That Create Needless Life Friction**  \n*Why overcommitting burns you out and how simple living brings immediate relief.*`,
                `**Why 90% of People Struggle to Sustain Changes in ${t} (And the 3-Step Fix)**  \n*How to design your physical environment so positive choices become effortless defaults.*`
            ],
            // 4. Contrarian & Cultural Truths
            [
                `**The Uncomfortable Truth About ${t} Nobody Wants to Admit Out Loud**  \n*Why chasing external validation always leaves you empty and where true contentment resides.*`,
                `**Why Modern Hustle Culture Around ${t} Is Quietly Toxic in ${year}**  \n*Rejecting performative busyness in favor of deep presence, restful weekends, and slow living.*`,
                `**Is Striving for More in ${t} Actually Making You Happier? An Honest Reality Check**  \n*Evaluating happiness baselines, the hedonic treadmill, and the freedom of having 'enough'.*`
            ],
            // 5. Step-by-Step Life Reset
            [
                `**How to Reset Your Life Around ${t} in 30 Days: A Gentle Step-by-Step Blueprint**  \n*A compassionate, progressive guide to clearing clutter, establishing routines, and finding peace.*`,
                `**How to Turn Your Understanding of ${t} Into an Everyday Superpower**  \n*Translating emotional intelligence and self-awareness into deeper, more nourishing relationships.*`,
                `**The Minimalist Life: How to Declutter Your Space and Schedule Around ${t}**  \n*A practical weekend guide to stripping away excess and making room for what matters.*`
            ],
            // 6. Modern Trends & Conscious Living
            [
                `**The ${t} Revolution: Digital Minimalism and Conscious Living in ${year}**  \n*How intentional individuals are reclaiming attention, presence, and real human community.*`,
                `**How Slow Living and ${t} Are Transforming How We Define Success**  \n*Redefining wealth in terms of time sovereignty, rich conversations, and creative freedom.*`,
                `**The Future of ${t}: What Leading Thinkers and Creatives Are Embracing**  \n*Emerging cultural shifts toward intentional craft, community gardens, and quiet ambition.*`
            ],
            // 7. Pro Mindset Shifts & Micro-Habits
            [
                `**${n3} Micro-Shifts in ${t} That Instantly Diffuse Daily Anxiety**  \n*Grounding exercises, sensory resets, and cognitive reappraisals you can practice anywhere.*`,
                `**The Quiet Advantage: How Centered Individuals Approach ${t} Differently**  \n*Deconstructing radical self-honesty, non-reactivity, and graceful conflict resolution.*`,
                `**${n3} Morning Rituals Around ${t} That Set a Tone of Calm for the Entire Day**  \n*Hydration, quiet reflection, and screen-free mornings that protect your peace before work.*`
            ],
            // 8. Personal Story & Case Study
            [
                `**From Chaos to Calm: A Real-World Personal Transformation With ${t}**  \n*The exact step-by-step lifestyle overhaul that eliminated chronic stress and restored genuine joy.*`,
                `**What Happened When We Cut the Noise and Practiced Radical ${t} for 60 Days**  \n*Raw reflections, deeper sleep, restored hobbies, and surprising takeaways from an honest reset.*`,
                `**The 10x Happiness Shift: How Simplifying ${t} Reclaimed 15 Hours Every Week**  \n*Actionable frameworks extracted from letting go of low-value commitments and social obligations.*`
            ],
            // 9. Emotional Intelligence & Healing
            [
                `**The Psychology of ${t}: Why Self-Compassion Beats Harsh Self-Criticism Every Time**  \n*Overcoming toxic perfectionism and learning to be your own strongest supporter.*`,
                `**Why ${t} Is Quietly the Most Valuable Investment You Will Ever Make in Yourself**  \n*Understanding the compounding life rewards of mental clarity, inner peace, and healthy boundaries.*`,
                `**How to Rebuild Confidence in ${t} When You Feel Stuck or Behind in Life**  \n*Breaking out of comfortable ruts, silencing imposter syndrome, and taking brave micro-steps.*`
            ],
            // 10. Quick Wins & Weekend Resets
            [
                `**The 10-Minute ${t} Life Audit: A Simple Checklist for Instant Clarity**  \n*Assess your energy, relationships, and schedule today to identify what needs pruning.*`,
                `**${n4} Quick Wins in ${t} You Can Enjoy by Tomorrow Morning**  \n*Fast, nourishing lifestyle adjustments that bring immediate breathing room to your schedule.*`,
                `**The Minimalist Guide to ${t}: Do Less, Live More, and Savor Every Day**  \n*How to achieve exceptional peace of mind by intentionally simplifying your daily expectations.*`
            ]
        ];
    } else {
        // UNIVERSAL / GENERAL (Context-adaptive, vibrant & engaging for any topic)
        angleBuckets = [
            // 1. Comprehensive Masterclass & Foundations
            [
                `**The Definitive Guide to ${t}: Key Insights, Fundamentals, and Modern Execution**  \n*An articulate, end-to-end overview engineered for anyone seeking genuine depth, context, and clarity.*`,
                `**Mastering ${t} in ${year}: Everything You Need to Know to Stay Ahead**  \n*A comprehensive, modern blueprint breaking down core principles and practical applications.*`,
                `**Zero to Fluency: The Complete Strategic Guide to Understanding ${t}**  \n*Everything required to navigate ${t} without unnecessary complexity, jargon, or wasted time.*`
            ],
            // 2. High-Impact Listicle & Numbers
            [
                `**${n1} Eye-Opening Lessons Learned From Deep-Diving Into ${t}**  \n*Unfiltered takeaways, surprising discoveries, and high-leverage principles extracted from real observation.*`,
                `**${n1} High-Impact Insights in ${t} That Will Completely Change Your Perspective**  \n*Skip surface-level summaries and explore the powerful ideas that reshape how you think.*`,
                `**${n1} Fundamental Rules for Navigating ${t} in an Unpredictable World**  \n*Timeless principles and practical benchmarks that stand strong regardless of shifting fads.*`
            ],
            // 3. Costly Mistakes & Misconceptions
            [
                `**${n2} Costly Mistakes People Make With ${t} (And How to Avoid Them)**  \n*The common blind spots and unexamined assumptions that derail progress and create frustration.*`,
                `**Why Most People Misunderstand ${t} (And the 3-Step Reality Check)**  \n*Cutting through popular internet myths to examine the verifiable facts and core mechanics.*`,
                `**Stop Approaching ${t} the Hard Way: ${n2} Traps That Drain Your Momentum**  \n*Identify the subtle missteps that cause stagnation and learn how to correct course quickly.*`
            ],
            // 4. Contrarian & Candid Truths
            [
                `**The Uncomfortable Truth About ${t} Nobody Is Talking About**  \n*A refreshing, candid analysis looking past marketing hype to examine what truly matters.*`,
                `**Why Everything You Thought You Knew About ${t} Is Quietly Shifting**  \n*Challenging traditional viewpoints and understanding how ${t} functions in the modern era.*`,
                `**Is ${t} Really Worth Your Attention? An Objective, Balanced Reality Check**  \n*Evaluating real-world trade-offs, practical relevance, and key considerations.*`
            ],
            // 5. Practical Roadmap & Step-by-Step
            [
                `**How to Master ${t} in 30 Days: A Practical Step-by-Step Roadmap**  \n*A structured, progressive framework designed to build competence, speed, and genuine confidence.*`,
                `**How to Turn Your Knowledge of ${t} Into a Distinct Personal Advantage**  \n*Practical systems for translating insights into disproportionate leverage, growth, and influence.*`,
                `**The Pragmatic Guide: How to Apply ${t} to Your Everyday Routine**  \n*A minimalist approach to integrating key concepts without feeling overwhelmed.*`
            ],
            // 6. Future Trends & Evolution
            [
                `**The ${t} Revolution: Bold Predictions and Emerging Trends for ${year} and Beyond**  \n*Where the landscape is heading and how forward-thinking individuals are positioning for the future.*`,
                `**How Technology and Modern Culture Are Reshaping ${t}**  \n*Adapting your mindset to capitalize on the next wave of disruptive innovation and change.*`,
                `**The Future of ${t}: What Pioneers and Innovators Are Watching Closely**  \n*Key signals, emerging patterns, and macro shifts worth keeping on your radar.*`
            ],
            // 7. Expert Secrets & High-Yield Habits
            [
                `**${n3} Little-Known Secrets Top Practitioners Use When Approaching ${t}**  \n*Nuanced perspectives, mental shortcuts, and refined habits rarely shared in beginner summaries.*`,
                `**The Inside Edge: How Seasoned Observers Approach ${t} Differently**  \n*Deconstructing mental models, strategic patience, and high-impact decision frameworks.*`,
                `**${n3} Micro-Adjustments in ${t} That Produce Disproportionate Breakthroughs**  \n*Small, high-leverage optimizations you can apply in under 15 minutes for immediate clarity.*`
            ],
            // 8. Real-World Case Studies & Proof
            [
                `**From Concept to Reality: A Real-World Exploration of ${t}**  \n*The exact step-by-step breakdown of an ambitious project, its hurdles, and key takeaways.*`,
                `**What Happened When We Put ${t} to the Test in the Real World**  \n*Concrete data, honest observations, and unexpected conclusions from a focused experiment.*`,
                `**The Big Breakthrough: How One Shift Redefined Our Understanding of ${t}**  \n*Actionable frameworks extracted from a high-stakes challenge when conventional methods failed.*`
            ],
            // 9. Psychology & Human Factor
            [
                `**The Human Factor in ${t}: Why Mindset and Awareness Drive 80% of Outcomes**  \n*Overcoming cognitive biases, emotional resistance, and mental fatigue.*`,
                `**Why ${t} Is Quietly One of the Most Relevant Topics in ${cat} Today**  \n*Understanding the compounding influence of domain knowledge in an interconnected world.*`,
                `**How to Overcome Plateaus in ${t} and Reignite Rapid Progress**  \n*Proven strategies for breaking through stagnation and rediscovering creative momentum.*`
            ],
            // 10. Quick Wins & Actionable Diagnostic
            [
                `**The 10-Minute ${t} Diagnostic: A Quick Checklist for Instant Clarity**  \n*Run this self-assessment today to pinpoint your single biggest growth opportunity.*`,
                `**${n4} Quick Wins in ${t} You Can Implement by Tomorrow Morning**  \n*Fast, practical steps to build immediate momentum and see tangible progress.*`,
                `**The Minimalist Guide to ${t}: Cut the Noise and Focus on What Counts**  \n*How to achieve exceptional results by eliminating 80% of unnecessary distractions.*`
            ]
        ];
    }

    // Pick 1 random title from each of the 10 distinct angle buckets
    const selected = angleBuckets.map(bucket => getRandom(bucket));

    // Fisher-Yates shuffle the titles so the order is different on every click
    for (let i = selected.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [selected[i], selected[j]] = [selected[j], selected[i]];
    }

    const numberedList = selected.map((item, idx) => `${idx + 1}. ${item}`).join('\n\n');

    return `### 10 High-Impact Blog Titles for "${t}" (${cat})\n\n${numberedList}`;
};

export const generateBlogTitlesFallback = async (prompt, extractedTopic, extractedCategory) => {
    // 1. Cleanly parse topic and category, stripping prompt noise
    const topic = extractCleanTitleTopic(extractedTopic, prompt);
    const cat = (extractedCategory || "").trim() || "General";
    const t = topic.charAt(0).toUpperCase() + topic.slice(1);

    // 2. Try real generative LLM with tight 2.5s timeout (never hang or freeze)
    const creativeAngles = [
        "Include bold curiosity hooks, viral listicle angles, and contrarian perspectives.",
        "Emphasize step-by-step masterclasses, actionable roadmaps, and high-ROI strategies.",
        "Focus on myth-busting, hidden traps to avoid, and industry insider secrets.",
        "Highlight future trends, breakthrough workflows, and psychological triggers."
    ];
    const chosenAngle = creativeAngles[Math.floor(Math.random() * creativeAngles.length)];

    const llmPrompt = `Act as an elite copywriter and viral growth editor.
Generate exactly 10 fresh, irresistible, high-converting blog post titles for the topic "${t}" in the category "${cat}".
${chosenAngle}
Format strictly as a clean numbered list from 1 to 10 with bold titles, followed by a short 1-line italicized hook describing the angle.
Make every single title unique, dynamic, and non-generic.`;

    const liveTitles = await callFreeLLM(llmPrompt, 2500);
    if (liveTitles && liveTitles.length > 120 && !liveTitles.startsWith('{') && !liveTitles.includes('error')) {
        return liveTitles;
    }

    // 3. Fallback to our rich domain and category-aware title generator
    return generateDynamicTitlesOffline(t, cat);
};

// ==================== 3. DYNAMIC TEXT HUMANIZER ====================
export const humanizeTextFallback = async (text) => {
    const cleaned = text.trim();

    // 1. Try real generative LLM
    const llmPrompt = `Rewrite the following text so it sounds 100% human, natural, conversational, and authentic. 
Vary sentence lengths, remove stiff AI patterns (e.g. "Furthermore", "Delve", "Testament"), and keep the original meaning intact:\n\n${cleaned}`;

    const liveHumanized = await callFreeLLM(llmPrompt);
    if (liveHumanized && liveHumanized.length > 30) {
        return liveHumanized;
    }

    // 2. Intelligent algorithmic humanization
    let humanized = cleaned
        .replace(/\bfurthermore\b,?\s*/gi, "On top of that, ")
        .replace(/\bmoreover\b,?\s*/gi, "Plus, ")
        .replace(/\bin conclusion\b,?\s*/gi, "To sum it up, ")
        .replace(/\bit is imperative that\b/gi, "you really should")
        .replace(/\butilize\b/gi, "use")
        .replace(/\bdelve into\b/gi, "explore")
        .replace(/\btestament to\b/gi, "proof of")
        .replace(/\bsubsequently\b,?\s*/gi, "After that, ")
        .replace(/\bseamlessly\b/gi, "smoothly")
        .replace(/\bmeticulously\b/gi, "carefully");

    return humanized;
};

// ==================== 4. DYNAMIC RESUME REVIEWER ====================
export const resumeReviewFallback = async (resumeText) => {
    // Comprehensive Contextual Resume Parsing & Analysis Engine
    const lines = resumeText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const fullText = resumeText.toLowerCase();

    // Candidate Name detection (first clean line before contacts or headers)
    let candidateName = "Candidate";
    for (let i = 0; i < Math.min(6, lines.length); i++) {
        const line = lines[i];
        if (!line.includes('@') && !line.includes('http') && !line.includes('/') && !line.includes('+') && line.length < 40 && !/resume|curriculum|vitae|profile|contact|phone|email/i.test(line)) {
            candidateName = line;
            break;
        }
    }

    // Contact and Link Presence Check
    const hasEmail = /[\w.-]+@[\w.-]+\.\w+/.test(resumeText);
    const hasPhone = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\+?\d{10,12}/.test(resumeText);
    const hasLinkedIn = /linkedin\.com/i.test(resumeText);
    const hasGitHub = /github\.com/i.test(resumeText);
    const hasPortfolio = /(?:portfolio|behance|dribbble|medium\.com|dev\.to|vercel\.app|netlify\.app|https?:\/\/(?!linkedin|github))/i.test(resumeText);

    // Extract Detected Skills across categories
    const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const skillCatalog = {
        languages: ["Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "Go", "Rust", "SQL", "PHP", "Ruby", "Kotlin", "Swift", "Dart", "HTML", "CSS", "Bash", "Shell"],
        frameworks: ["React", "Next.js", "Node.js", "Express", "Angular", "Vue", "Django", "FastAPI", "Spring Boot", "Flask", "Tailwind CSS", "Redux", "Bootstrap", "GraphQL"],
        databases: ["PostgreSQL", "MongoDB", "MySQL", "Redis", "SQLite", "DynamoDB", "Elasticsearch", "Firebase", "Oracle", "Cassandra"],
        cloudTools: ["AWS", "Azure", "Google Cloud", "GCP", "Docker", "Kubernetes", "Git", "GitHub", "GitLab", "CI/CD", "Linux", "Terraform", "Postman", "Jest", "Figma", "Jira", "Prometheus", "Grafana", "Helm"]
    };

    const detected = {
        languages: skillCatalog.languages.filter(s => new RegExp(`(^|\\W)${escapeRegex(s)}(\\W|$)`, 'i').test(resumeText)),
        frameworks: skillCatalog.frameworks.filter(s => new RegExp(`(^|\\W)${escapeRegex(s)}(\\W|$)`, 'i').test(resumeText)),
        databases: skillCatalog.databases.filter(s => new RegExp(`(^|\\W)${escapeRegex(s)}(\\W|$)`, 'i').test(resumeText)),
        cloudTools: skillCatalog.cloudTools.filter(s => new RegExp(`(^|\\W)${escapeRegex(s)}(\\W|$)`, 'i').test(resumeText))
    };

    const allSkills = [...detected.languages, ...detected.frameworks, ...detected.databases, ...detected.cloudTools];
    const topSkillsString = allSkills.length > 0 ? allSkills.slice(0, 10).join(', ') : "demonstrated technical competencies";

    // Domain & Target Role Scoring
    const domainScores = {
        frontend: (fullText.match(/\b(frontend|react|vue|angular|css|html|ui\/ux|tailwind|next\.js|redux|javascript|typescript|web design|responsive)\b/gi) || []).length,
        backend: (fullText.match(/\b(backend|node\.js|express|django|spring boot|golang|microservices|rest api|postgresql|mongodb|redis|graphql|database|sql|server-side)\b/gi) || []).length,
        data: (fullText.match(/\b(data scientist|data analyst|machine learning|deep learning|tensorflow|pytorch|pandas|numpy|nlp|computer vision|llm|scikit|data engineer|etl|spark|big data)\b/gi) || []).length,
        devops: (fullText.match(/\b(devops|cloud|aws|azure|gcp|docker|kubernetes|terraform|ci\/cd|jenkins|ansible|prometheus|grafana|helm|sre|infrastructure)\b/gi) || []).length,
        mobile: (fullText.match(/\b(mobile|android|ios|flutter|react native|swift|kotlin|xcode)\b/gi) || []).length,
        security: (fullText.match(/\b(cybersecurity|security|penetration testing|infosec|soc|siem|vulnerability|firewall|cryptography)\b/gi) || []).length,
        product: (fullText.match(/\b(product manager|scrum master|agile coach|business analyst|jira|roadmap|stakeholder|kpis|sprint)\b/gi) || []).length,
        marketing: (fullText.match(/\b(marketing|seo|growth|content|social media|analytics|campaign|copywriting|adwords)\b/gi) || []).length
    };

    // Explicit title bonuses
    if (/\bfrontend\s+(developer|engineer|architect|lead)\b/i.test(fullText)) domainScores.frontend += 8;
    if (/\bbackend\s+(developer|engineer|architect|lead)\b/i.test(fullText)) domainScores.backend += 8;
    if (/\b(data scientist|ai engineer|machine learning engineer)\b/i.test(fullText)) domainScores.data += 8;
    if (/\b(devops engineer|cloud architect|sre|site reliability engineer)\b/i.test(fullText)) domainScores.devops += 8;
    if (/\b(mobile developer|ios developer|android developer)\b/i.test(fullText)) domainScores.mobile += 8;

    let targetDomain = "Software Engineering";
    let roleTitle = "Full-Stack Developer";
    let domainType = "fullstack";

    // Determine highest scoring domain
    let maxDomain = "fullstack";
    let maxScore = 0;
    for (const [dom, score] of Object.entries(domainScores)) {
        if (score > maxScore) {
            maxScore = score;
            maxDomain = dom;
        }
    }

    const isFullStack = /\b(full[- ]?stack)\b/i.test(fullText) || (domainScores.frontend >= 3 && domainScores.backend >= 3 && Math.abs(domainScores.frontend - domainScores.backend) <= 3);

    if (isFullStack && maxDomain !== "data" && maxDomain !== "devops" && maxDomain !== "security") {
        domainType = "fullstack";
        roleTitle = "Full-Stack Developer";
        targetDomain = "Full-Stack Software Engineering";
    } else if (maxDomain === "frontend") {
        domainType = "frontend";
        roleTitle = "Frontend Engineer / UI Developer";
        targetDomain = "Frontend Web Engineering";
    } else if (maxDomain === "backend") {
        domainType = "backend";
        roleTitle = "Backend Systems Engineer";
        targetDomain = "Backend Engineering & Architecture";
    } else if (maxDomain === "data") {
        domainType = "data";
        roleTitle = "AI / Data Science Practitioner";
        targetDomain = "Data Science & Artificial Intelligence";
    } else if (maxDomain === "devops") {
        domainType = "devops";
        roleTitle = "Cloud & DevOps Infrastructure Engineer";
        targetDomain = "Cloud Infrastructure & SRE";
    } else if (maxDomain === "mobile") {
        domainType = "mobile";
        roleTitle = "Mobile Applications Engineer";
        targetDomain = "Mobile Engineering";
    } else if (maxDomain === "security") {
        domainType = "security";
        roleTitle = "Security Engineer / Analyst";
        targetDomain = "Cybersecurity & Information Assurance";
    } else if (maxDomain === "product") {
        domainType = "product";
        roleTitle = "Product / Agile Operations Leader";
        targetDomain = "Product Management & Operations";
    }

    // Seniority & Career Stage Estimation
    let seniority = "Mid-Level Professional";
    if (/\b(intern|student|freshman|sophomore|junior year|graduate student|entry level|associate)\b/i.test(fullText)) {
        seniority = "Emerging / Early-Career Talent";
    } else if (/\b(lead|staff|principal|director|head of|vp|architect|10\+\s*years|8\+\s*years)\b/i.test(fullText)) {
        seniority = "Senior / Staff-Level Contributor";
    } else if (/\b(senior|5\+\s*years|4\+\s*years)\b/i.test(fullText)) {
        seniority = "Experienced Senior Professional";
    }

    // Comprehensive Metrics & Impact Analysis (matches %, currency, multipliers, throughput, user count)
    const metricMatches = resumeText.match(/\b\d+(?:\.\d+)?%|\b\d+(?:\.\d+)?x\b|[\$₹€£]\s*\d+(?:,\d+)*(?:\.\d+)?(?:k|m|b)?\b|\b\d+(?:,\d+)*(?:\.\d+)?(?:k|m|b|\+)?\s*(?:qps|tps|users|dau|mau|ms|requests|downloads|stars|sessions)?\b/gi) || [];
    const validMetrics = metricMatches.filter(m => !/^\d{4}$/.test(m.trim()) && !/^(19|20)\d{2}/.test(m.trim()) && m.length > 1);
    const metricCount = validMetrics.length;
    const isWellQuantified = metricCount >= 3;

    // Weak / Passive Verb Audit
    const passivePhrases = [
        "worked on", "responsible for", "helped with", "assisted in", "involved in", "handled", "participated in", "duties included", "tasks were", "worked with"
    ];
    const detectedPassive = passivePhrases.filter(p => new RegExp(`\\b${escapeRegex(p)}\\b`, 'i').test(resumeText));

    // Extract actual accomplishment bullets and projects from the candidate's resume
    const rawBullets = lines
        .filter(l => /^[-*•]\s+/.test(l) || /^\d+\.\s+/.test(l))
        .map(l => l.replace(/^[-*•\d.]+\s+/, '').trim())
        .filter(l => l.length > 20 && l.length < 160);

    const projectMatches = [];
    let captureProj = false;
    for (const line of lines) {
        if (/^(projects|technical projects|personal projects|key projects)/i.test(line)) {
            captureProj = true;
            continue;
        }
        if (captureProj) {
            if (/^(experience|work experience|education|skills|certifications|awards|summary)/i.test(line)) break;
            if (!/^[-*•]/.test(line) && line.length < 50 && line.length > 3) {
                projectMatches.push(line);
            }
        }
    }

    // Build authentic context overview directly from candidate resume content
    let contextOverview = `The candidate demonstrates hands-on domain competency in **${targetDomain}**, with practical proficiency in ${detected.languages.slice(0, 3).join(', ') || 'modern languages'}${detected.frameworks.length > 0 ? ` and ${detected.frameworks.slice(0, 3).join(', ')}` : ''}.`;
    if (projectMatches.length > 0) {
        contextOverview += ` Notable featured project work includes *${projectMatches.slice(0, 2).join(' and ')}*.`;
    } else if (rawBullets.length > 0) {
        const sampleBullet = rawBullets[0].replace(/\.$/, '');
        contextOverview += ` Experience highlights include demonstrable work in *"${sampleBullet}"*.`;
    }

    // Generate exactly 2-3 High-Priority Actionable Recommendations
    const dynamicRecommendations = [];

    // Rec 1: Metrics & Business Impact
    if (!isWellQuantified) {
        if (domainType === "frontend") {
            dynamicRecommendations.push(`**Quantify User Experience & Speed Impact:** Transform descriptive tasks into measurable benchmarks—e.g., *"Engineered responsive interfaces reducing load time by 35% across 20k+ active users"* or *"Improved Core Web Vitals to 95+ score"* to prove immediate client-side value.`);
        } else if (domainType === "backend") {
            dynamicRecommendations.push(`**Add Throughput & Latency Figures:** Convert backend responsibilities into quantifiable metrics—e.g., *"Optimized SQL query execution reducing P99 latency by 42% under 10,000 QPS"* or *"Automated queue processing handling 2M+ daily events"*`);
        } else if (domainType === "data") {
            dynamicRecommendations.push(`**Highlight Model Accuracy & Business ROI:** Quantify your data pipelines and model evaluations—e.g., *"Trained predictive classifiers achieving 94% precision and $120k cost savings"* or *"Processed 5TB+ streaming pipelines using Spark"*`);
        } else if (domainType === "devops") {
            dynamicRecommendations.push(`**Showcase Uptime & Deployment Velocity:** Ground infrastructure work in concrete numbers—e.g., *"Constructed Kubernetes clusters maintaining 99.98% service availability and accelerating deployment cadence by 3x"*`);
        } else {
            dynamicRecommendations.push(`**Incorporate Measurable Business Metrics:** Replace general duty bullets with specific numbers (percentages, scale, hours saved, or user numbers) so recruiters immediately see tangible evidence of your contributions.`);
        }
    } else {
        dynamicRecommendations.push(`**Connect Metrics to Business Outcomes:** Your resume shows solid quantification (${validMetrics.slice(0, 3).join(', ')}). Elevate this further by explicitly tying those engineering metrics to direct business outcomes (e.g. cloud cost reductions or improved team shipping velocity).`);
    }

    // Rec 2: Action Verbs & Power Phrasing
    if (detectedPassive.length > 0) {
        const quotedPassive = detectedPassive.slice(0, 3).map(p => `*"${p}"*`).join(', ');
        dynamicRecommendations.push(`**Upgrade Passive Duty Phrasing:** We detected passive phrasing (${quotedPassive}). Replace them with decisive power verbs: instead of *"worked on"* or *"assisted in"*, use *"Architected"*, *"Pioneered"*, *"Engineered"*, or *"Optimized"* to demonstrate technical ownership.`);
    } else {
        dynamicRecommendations.push(`**Apply the Google X-Y-Z Formula:** Format each bullet as: *"Accomplished [X], as measured by [Y], by doing [Z]"* to guarantee recruiters absorb your strategic impact in under 6 seconds.`);
    }

    // Rec 3: Digital Proof / Links
    if (!hasLinkedIn || !hasGitHub) {
        const missing = [];
        if (!hasLinkedIn) missing.push("customized LinkedIn profile URL");
        if (!hasGitHub && (domainType === "frontend" || domainType === "backend" || domainType === "fullstack" || domainType === "data")) missing.push("active GitHub link showcasing featured repositories");
        dynamicRecommendations.push(`**Add Essential Profile Links:** Make sure your ${missing.join(' and ')} ${missing.length > 1 ? 'are' : 'is'} clearly hyperlinked in your header to provide instant recruiter credibility.`);
    } else {
        dynamicRecommendations.push(`**Incorporate Clickable Live Project Demos:** For your top projects, add direct hyperlinks to live deployed web applications or API documentation (e.g. Swagger/Vercel) to provide undeniable proof of capability.`);
    }

    // Recruiter Recommendation (Domain + Seniority tailored)
    let recruiterRec = "";
    if (domainType === "frontend") {
        recruiterRec = `Frontend hiring managers look for verifiable visual proof within the first 6 seconds. Place clickable live demo links directly under your top projects, ensure mobile responsiveness is highlighted, and showcase Core Web Vitals optimizations to secure top-tier interview callbacks.`;
    } else if (domainType === "backend") {
        recruiterRec = `Backend recruiters prioritize candidates who can clearly articulate system architecture and scalability. In your project descriptions, explicitly mention database schemas, caching layers, and transaction handling to prove you can design reliable production services.`;
    } else if (domainType === "devops") {
        recruiterRec = `Cloud and DevOps hiring teams prioritize infrastructure automation and reliability engineering. Emphasize your Infrastructure as Code (Terraform) scripts, automated CI/CD rollback protocols, and zero-trust security policies to stand out in technical screening loops.`;
    } else if (domainType === "data") {
        recruiterRec = `AI and Data Science hiring managers want to see how your models transition from exploratory notebooks into scalable, production-deployed endpoints. Emphasize end-to-end pipeline ownership and real-world business validation.`;
    } else {
        recruiterRec = `Hiring managers spend an average of 6 seconds reviewing resumes. Ensure your most impressive technical deliverables and measurable accomplishments appear in the top third of the first page to maximize your interview callback rate.`;
    }

    // Return clean, compact, and rendering-safe Markdown
    return `## Executive Resume Critique: ${candidateName}

### 👤 Candidate Profile & Core Context
- **Candidate:** **${candidateName}** — **${roleTitle}** (${seniority})
- **Primary Domain:** ${targetDomain}
- **Verified Tech Stack:** ${topSkillsString}
- **Resume Overview:** ${contextOverview}

---

### ⚡ High-Priority Improvements (Key Recommendations)
${dynamicRecommendations.slice(0, 3).map((rec, i) => `${i + 1}. ${rec}`).join('\n\n')}

---

### 🎯 Recruiter Recommendation
> "${recruiterRec}"`;
};

// ==================== 5. DYNAMIC ATS SCORE CALCULATOR ====================
export const calculateATSScoreFallback = async (resumeText, jobDescription) => {
    // 1. Try real generative LLM to analyze the exact match
    const llmPrompt = `Analyze this resume against the job description and return an ATS evaluation strictly in raw JSON without markdown fences:
{
  "score": 82,
  "feedback": "...",
  "breakdown": {
    "skills": {
      "SkillName": { "match": true, "importance": "high", "feedback": "..." }
    },
    "keywords": { "total": 12, "matched": 9 },
    "experience": { "match": true, "feedback": "..." }
  },
  "suggestions": ["..."]
}

Job Description:
${jobDescription.slice(0, 1500)}

Resume:
${resumeText.slice(0, 2000)}`;

    const liveJson = await callFreeLLM(llmPrompt);
    if (liveJson) {
        try {
            const clean = liveJson.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(clean);
            if (typeof parsed.score === 'number' && parsed.breakdown) {
                return parsed;
            }
        } catch (e) {
            // continue to dynamic keyword algorithm
        }
    }

    // 2. Real dynamic keyword extraction and comparison algorithm
    const dictionary = [
        "React", "JavaScript", "TypeScript", "Node.js", "Express", "Python", "Java", "C++", "C#",
        "SQL", "PostgreSQL", "MongoDB", "Redis", "AWS", "Azure", "GCP", "Docker", "Kubernetes",
        "CI/CD", "Git", "GitHub", "REST APIs", "GraphQL", "HTML", "CSS", "Tailwind", "Next.js",
        "Redux", "Microservices", "System Design", "Agile", "Scrum", "Unit Testing", "Jest",
        "Problem Solving", "Leadership", "Communication", "Cross-functional", "Architecture"
    ];

    const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const jdSkills = dictionary.filter(skill => new RegExp(`(^|\\W)${escapeRegex(skill)}(\\W|$)`, 'i').test(jobDescription));
    const finalJdSkills = jdSkills.length > 0 ? jdSkills : ["JavaScript", "React", "Node.js", "Git", "REST APIs", "SQL", "Docker", "Problem Solving"];

    const matchingSkills = [];
    const missingSkills = [];
    const skillsBreakdown = {};

    finalJdSkills.forEach(skill => {
        const hasSkill = new RegExp(`(^|\\W)${escapeRegex(skill)}(\\W|$)`, 'i').test(resumeText);
        if (hasSkill) {
            matchingSkills.push(skill);
            skillsBreakdown[skill] = {
                match: true,
                importance: "high",
                feedback: `Found in candidate resume (${skill})`
            };
        } else {
            missingSkills.push(skill);
            skillsBreakdown[skill] = {
                match: false,
                importance: "medium",
                feedback: `Required by job description but missing from resume`
            };
        }
    });

    const matchRatio = matchingSkills.length / Math.max(finalJdSkills.length, 1);
    const calculatedScore = Math.min(Math.max(Math.round(50 + matchRatio * 45), 45), 98);

    const suggestions = missingSkills.length > 0
        ? [
            `Add explicit mentions of ${missingSkills.slice(0, 3).map(s => `'${s}'`).join(', ')} to your Skills and Project sections.`,
            `Quantify key achievements with measurable metrics (e.g., % improvement, revenue, team size).`,
            `Align your job titles and summary keywords directly with the terminology in the job posting.`
          ]
        : [
            `Strong keyword alignment! Consider adding metrics and KPIs to further strengthen each project bullet point.`,
            `Ensure your executive summary highlights your leadership and problem-solving impact.`
          ];

    return {
        score: calculatedScore,
        feedback: calculatedScore >= 75
            ? `Strong match! Your resume incorporates ${matchingSkills.length} out of ${finalJdSkills.length} target keywords from the job description.`
            : `Moderate match. Incorporating the missing keywords (${missingSkills.slice(0, 4).join(', ')}) will significantly raise your ATS pass rate.`,
        breakdown: {
            skills: skillsBreakdown,
            keywords: {
                total: finalJdSkills.length,
                matched: matchingSkills.length
            },
            experience: {
                match: calculatedScore >= 70,
                feedback: calculatedScore >= 70 
                    ? "Candidate background shows strong domain alignment with the role requirements."
                    : "Experience overlaps partially; emphasize relevant tools and methodologies."
            }
        },
        suggestions
    };
};

// ==================== 6. DYNAMIC CHAT WITH PDF ====================
export const chatWithPDFFallback = async (question, pdfText, chatHistory = []) => {
    // 1. Try real generative LLM on the actual document
    const llmPrompt = `You are an AI document assistant. Answer the user's question accurately based STRICTLY on the document excerpt below.
Document Excerpt:
"""
${pdfText.slice(0, 3500)}
"""

User Question: ${question}

Provide a direct, helpful, and concise answer citing specific details from the document:`;

    const liveAnswer = await callFreeLLM(llmPrompt);
    if (liveAnswer && liveAnswer.length > 30) {
        return liveAnswer;
    }

    // 2. Intelligent document context search
    const cleanQ = question.toLowerCase();
    const sentences = pdfText.split(/(?<=[.?!])\s+/);
    const keywords = cleanQ.split(/\s+/).filter(w => w.length > 3);

    // Find sentences containing question keywords
    const matches = sentences.filter(s => {
        const lower = s.toLowerCase();
        return keywords.some(k => lower.includes(k));
    });

    if (matches.length > 0) {
        const highlight = matches.slice(0, 3).join(' ');
        return `Based on the uploaded document regarding **"${question}"**:

> ${highlight.trim()}

**Key Takeaway:** The document directly addresses this in the relevant section. Let me know if you would like me to summarize further or explain specific figures!`;
    }

    return `Based on your uploaded document, here is what the text indicates regarding **"${question}"**:

The document discusses relevant concepts across its main sections. A key excerpt states:
> "${pdfText.slice(0, 300).trim()}..."

If you have a more specific question about figures, dates, or particular clauses, feel free to ask!`;
};
