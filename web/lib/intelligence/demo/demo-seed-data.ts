/**
 * Demo Seed Data — Realistic Fake Subjects
 *
 * Domain-aware seed data that makes the prototype feel REAL.
 * Each preset (sales, coaching, recruitment) has its own pool
 * of realistic subjects with names, companies, titles, and
 * intelligence data that makes sense for that domain.
 *
 * WHY THIS EXISTS: A client needs to SEE the product working
 * before they write a check. This data creates that "feeling."
 */

// ============================================================================
// TYPES
// ============================================================================

export interface DemoSubject {
  id: string;
  name: string;
  company: string;
  title: string;
  about: string;
  stage: string;
  archetype: string;
  score: number;
  scoreTier: string;
  dnaConfidence: number;
  profileTraits: {
    directness: number;
    formality: number;
    analyticalVsEmotional: number;
    riskTolerance: number;
  };
  communicationStyle: string;
  emotionalState: string;
  engagementLevel: string;
  daysInPipeline: number;
  lastActivity: string;
  conversionProbability: number;
}

// ============================================================================
// DETERMINISTIC ID GENERATOR
// ============================================================================

function demoId(prefix: string, index: number): string {
  const hex = index.toString(16).padStart(4, "0");
  return `demo-${prefix}-${hex}-0000-0000-000000000000`;
}

// ============================================================================
// SALES PIPELINE SUBJECTS (30 realistic B2B leads)
// ============================================================================

export const SALES_SUBJECTS: DemoSubject[] = [
  // ON FIRE (6)
  { id: demoId("lead", 1), name: "Sarah Chen", company: "TechCorp AI", title: "VP Engineering", about: "15+ years building ML platforms. Stanford CS. Previously at Google Brain.", stage: "demo", archetype: "Champion", score: 87, scoreTier: "on_fire", dnaConfidence: 94, profileTraits: { directness: 0.85, formality: 0.4, analyticalVsEmotional: 0.9, riskTolerance: 0.7 }, communicationStyle: "Direct and analytical. Wants data, not stories.", emotionalState: "excited", engagementLevel: "high", daysInPipeline: 12, lastActivity: "2 hours ago", conversionProbability: 89 },
  { id: demoId("lead", 2), name: "Marcus Williams", company: "ScaleUp Finance", title: "CTO", about: "Serial CTO. Built 3 fintech platforms from scratch. MIT alum.", stage: "engaged", archetype: "Decision Maker", score: 82, scoreTier: "on_fire", dnaConfidence: 91, profileTraits: { directness: 0.9, formality: 0.6, analyticalVsEmotional: 0.8, riskTolerance: 0.8 }, communicationStyle: "Extremely direct. Values speed over polish.", emotionalState: "interested", engagementLevel: "high", daysInPipeline: 8, lastActivity: "1 day ago", conversionProbability: 81 },
  { id: demoId("lead", 3), name: "Emily Rodriguez", company: "HealthFlow", title: "Head of Product", about: "Product leader in health-tech. Obsessed with user experience.", stage: "demo", archetype: "Champion", score: 79, scoreTier: "on_fire", dnaConfidence: 88, profileTraits: { directness: 0.65, formality: 0.3, analyticalVsEmotional: 0.5, riskTolerance: 0.6 }, communicationStyle: "Collaborative, asks lots of questions.", emotionalState: "curious", engagementLevel: "high", daysInPipeline: 15, lastActivity: "3 hours ago", conversionProbability: 76 },
  { id: demoId("lead", 4), name: "David Park", company: "NovaPay", title: "CEO", about: "Founded NovaPay in 2021. Growing 40% MoM. Y Combinator W22.", stage: "engaged", archetype: "Visionary", score: 75, scoreTier: "on_fire", dnaConfidence: 86, profileTraits: { directness: 0.7, formality: 0.35, analyticalVsEmotional: 0.6, riskTolerance: 0.9 }, communicationStyle: "Big picture thinker. Impatient with details.", emotionalState: "enthusiastic", engagementLevel: "high", daysInPipeline: 5, lastActivity: "5 hours ago", conversionProbability: 72 },
  { id: demoId("lead", 5), name: "Lisa Thompson", company: "Meridian Consulting", title: "Managing Director", about: "Top 50 consulting firm. 200+ enterprise clients.", stage: "demo", archetype: "Decision Maker", score: 71, scoreTier: "on_fire", dnaConfidence: 83, profileTraits: { directness: 0.8, formality: 0.7, analyticalVsEmotional: 0.7, riskTolerance: 0.5 }, communicationStyle: "Professional, ROI-focused.", emotionalState: "evaluating", engagementLevel: "high", daysInPipeline: 18, lastActivity: "1 day ago", conversionProbability: 68 },
  { id: demoId("lead", 6), name: "James O'Brien", company: "CloudStack Pro", title: "VP Sales", about: "Scaled sales orgs from 5 to 50 reps. Loves process optimization.", stage: "engaged", archetype: "Champion", score: 68, scoreTier: "on_fire", dnaConfidence: 80, profileTraits: { directness: 0.75, formality: 0.5, analyticalVsEmotional: 0.4, riskTolerance: 0.7 }, communicationStyle: "Energetic, storytelling approach.", emotionalState: "excited", engagementLevel: "high", daysInPipeline: 10, lastActivity: "4 hours ago", conversionProbability: 65 },

  // HOT (10)
  { id: demoId("lead", 7), name: "Aisha Patel", company: "DataVault", title: "Director of Engineering", about: "Infrastructure specialist. AWS certified. Pragmatic builder.", stage: "replied", archetype: "Evaluator", score: 58, scoreTier: "hot", dnaConfidence: 76, profileTraits: { directness: 0.7, formality: 0.5, analyticalVsEmotional: 0.85, riskTolerance: 0.4 }, communicationStyle: "Technical, detail-oriented.", emotionalState: "cautious", engagementLevel: "medium", daysInPipeline: 20, lastActivity: "2 days ago", conversionProbability: 55 },
  { id: demoId("lead", 8), name: "Robert Kim", company: "GrowthEngine", title: "CMO", about: "Marketing leader. Expert in PLG and content marketing.", stage: "replied", archetype: "Influencer", score: 54, scoreTier: "hot", dnaConfidence: 72, profileTraits: { directness: 0.5, formality: 0.3, analyticalVsEmotional: 0.3, riskTolerance: 0.6 }, communicationStyle: "Creative, brand-conscious.", emotionalState: "interested", engagementLevel: "medium", daysInPipeline: 14, lastActivity: "1 day ago", conversionProbability: 51 },
  { id: demoId("lead", 9), name: "Michelle Foster", company: "TrustBridge Legal", title: "COO", about: "Ops leader for 150-person law firm. Process automation advocate.", stage: "engaged", archetype: "Decision Maker", score: 51, scoreTier: "hot", dnaConfidence: 69, profileTraits: { directness: 0.6, formality: 0.8, analyticalVsEmotional: 0.6, riskTolerance: 0.3 }, communicationStyle: "Formal, thorough.", emotionalState: "evaluating", engagementLevel: "medium", daysInPipeline: 25, lastActivity: "3 days ago", conversionProbability: 48 },
  { id: demoId("lead", 10), name: "Tyler Jackson", company: "Apex SaaS", title: "Head of Revenue", about: "Revenue operations expert. Data-driven decision maker.", stage: "replied", archetype: "Evaluator", score: 48, scoreTier: "hot", dnaConfidence: 65, profileTraits: { directness: 0.8, formality: 0.4, analyticalVsEmotional: 0.8, riskTolerance: 0.5 }, communicationStyle: "Metrics-first, wants proof.", emotionalState: "skeptical", engagementLevel: "medium", daysInPipeline: 11, lastActivity: "1 day ago", conversionProbability: 44 },
  { id: demoId("lead", 11), name: "Nina Kowalski", company: "EduTech Plus", title: "VP Product", about: "EdTech veteran. Passionate about accessible learning.", stage: "replied", archetype: "Champion", score: 45, scoreTier: "hot", dnaConfidence: 62, profileTraits: { directness: 0.55, formality: 0.4, analyticalVsEmotional: 0.45, riskTolerance: 0.5 }, communicationStyle: "Warm, mission-driven.", emotionalState: "curious", engagementLevel: "medium", daysInPipeline: 16, lastActivity: "2 days ago", conversionProbability: 42 },
  { id: demoId("lead", 12), name: "Hassan Ahmed", company: "LogiFlow", title: "CTO", about: "Logistics tech. Building the Uber for freight.", stage: "replied", archetype: "Visionary", score: 43, scoreTier: "hot", dnaConfidence: 58, profileTraits: { directness: 0.65, formality: 0.5, analyticalVsEmotional: 0.7, riskTolerance: 0.8 }, communicationStyle: "Fast-moving, opportunity-focused.", emotionalState: "interested", engagementLevel: "medium", daysInPipeline: 7, lastActivity: "6 hours ago", conversionProbability: 39 },
  { id: demoId("lead", 13), name: "Jen Martinez", company: "BrightPath HR", title: "Chief People Officer", about: "HR innovation leader. 10,000+ employee organization.", stage: "contacted", archetype: "Influencer", score: 40, scoreTier: "hot", dnaConfidence: 55, profileTraits: { directness: 0.4, formality: 0.6, analyticalVsEmotional: 0.3, riskTolerance: 0.4 }, communicationStyle: "Empathetic, people-first.", emotionalState: "open", engagementLevel: "low", daysInPipeline: 22, lastActivity: "4 days ago", conversionProbability: 35 },
  { id: demoId("lead", 14), name: "Chris Taylor", company: "FinanceIQ", title: "Head of Strategy", about: "Strategy consultant turned SaaS buyer. Harvard MBA.", stage: "replied", archetype: "Evaluator", score: 38, scoreTier: "hot", dnaConfidence: 52, profileTraits: { directness: 0.7, formality: 0.7, analyticalVsEmotional: 0.9, riskTolerance: 0.3 }, communicationStyle: "Analytical, framework-oriented.", emotionalState: "cautious", engagementLevel: "medium", daysInPipeline: 30, lastActivity: "3 days ago", conversionProbability: 32 },
  { id: demoId("lead", 15), name: "Amanda Price", company: "RetailVerse", title: "VP Digital", about: "Ecommerce leader. Managing $50M+ annual digital revenue.", stage: "contacted", archetype: "Decision Maker", score: 35, scoreTier: "hot", dnaConfidence: 48, profileTraits: { directness: 0.6, formality: 0.5, analyticalVsEmotional: 0.5, riskTolerance: 0.6 }, communicationStyle: "Results-oriented, time-conscious.", emotionalState: "neutral", engagementLevel: "low", daysInPipeline: 19, lastActivity: "5 days ago", conversionProbability: 28 },
  { id: demoId("lead", 16), name: "Derek Novak", company: "CyberShield", title: "CISO", about: "Cybersecurity executive. Risk-averse by profession.", stage: "replied", archetype: "Evaluator", score: 33, scoreTier: "hot", dnaConfidence: 45, profileTraits: { directness: 0.8, formality: 0.8, analyticalVsEmotional: 0.9, riskTolerance: 0.2 }, communicationStyle: "Security-focused, needs compliance proof.", emotionalState: "skeptical", engagementLevel: "low", daysInPipeline: 35, lastActivity: "4 days ago", conversionProbability: 25 },

  // WARM (8)
  { id: demoId("lead", 17), name: "Rachel Green", company: "SkyLift Media", title: "Founder", about: "Bootstrapped media company. 2M monthly readers.", stage: "contacted", archetype: "Visionary", score: 25, scoreTier: "warm", dnaConfidence: 40, profileTraits: { directness: 0.5, formality: 0.2, analyticalVsEmotional: 0.3, riskTolerance: 0.7 }, communicationStyle: "Creative, informal.", emotionalState: "curious", engagementLevel: "low", daysInPipeline: 28, lastActivity: "1 week ago", conversionProbability: 20 },
  { id: demoId("lead", 18), name: "Sanjay Gupta", company: "MedTech Solutions", title: "Director R&D", about: "Medical device R&D. FDA process expert.", stage: "contacted", archetype: "Evaluator", score: 22, scoreTier: "warm", dnaConfidence: 35, profileTraits: { directness: 0.6, formality: 0.7, analyticalVsEmotional: 0.85, riskTolerance: 0.2 }, communicationStyle: "Methodical, evidence-based.", emotionalState: "cautious", engagementLevel: "low", daysInPipeline: 40, lastActivity: "1 week ago", conversionProbability: 15 },
  { id: demoId("lead", 19), name: "Kate Morrison", company: "GreenLeaf Energy", title: "VP Operations", about: "Renewable energy ops. Scaling solar deployment.", stage: "cold", archetype: "Influencer", score: 18, scoreTier: "warm", dnaConfidence: 30, profileTraits: { directness: 0.45, formality: 0.5, analyticalVsEmotional: 0.5, riskTolerance: 0.5 }, communicationStyle: "Mission-driven, sustainability-focused.", emotionalState: "neutral", engagementLevel: "minimal", daysInPipeline: 45, lastActivity: "2 weeks ago", conversionProbability: 12 },
  { id: demoId("lead", 20), name: "Alex Rivera", company: "PropTech Hub", title: "CEO", about: "Real estate tech startup. Series A. Growing fast.", stage: "contacted", archetype: "Visionary", score: 16, scoreTier: "warm", dnaConfidence: 28, profileTraits: { directness: 0.7, formality: 0.3, analyticalVsEmotional: 0.4, riskTolerance: 0.9 }, communicationStyle: "Move fast, break things.", emotionalState: "distracted", engagementLevel: "minimal", daysInPipeline: 33, lastActivity: "10 days ago", conversionProbability: 10 },
  { id: demoId("lead", 21), name: "Diana Frost", company: "LuxeCraft", title: "Creative Director", about: "Luxury brand creative. Awards-winning campaigns.", stage: "cold", archetype: "Influencer", score: 14, scoreTier: "warm", dnaConfidence: 25, profileTraits: { directness: 0.3, formality: 0.6, analyticalVsEmotional: 0.2, riskTolerance: 0.4 }, communicationStyle: "Aesthetic, brand-sensitive.", emotionalState: "neutral", engagementLevel: "minimal", daysInPipeline: 50, lastActivity: "2 weeks ago", conversionProbability: 8 },
  { id: demoId("lead", 22), name: "Tom Mitchell", company: "AgriSmart", title: "Head of Innovation", about: "AgTech innovator. IoT sensors for farming.", stage: "contacted", archetype: "Champion", score: 13, scoreTier: "warm", dnaConfidence: 22, profileTraits: { directness: 0.6, formality: 0.4, analyticalVsEmotional: 0.7, riskTolerance: 0.6 }, communicationStyle: "Practical, ROI-focused.", emotionalState: "open", engagementLevel: "minimal", daysInPipeline: 38, lastActivity: "12 days ago", conversionProbability: 7 },
  { id: demoId("lead", 23), name: "Priya Sharma", company: "EduNest", title: "Founder", about: "Online tutoring platform. 50K students.", stage: "cold", archetype: "Visionary", score: 12, scoreTier: "warm", dnaConfidence: 20, profileTraits: { directness: 0.5, formality: 0.3, analyticalVsEmotional: 0.4, riskTolerance: 0.7 }, communicationStyle: "Passionate about education.", emotionalState: "busy", engagementLevel: "minimal", daysInPipeline: 55, lastActivity: "3 weeks ago", conversionProbability: 5 },
  { id: demoId("lead", 24), name: "Frank Wu", company: "QuantEdge", title: "Managing Partner", about: "Quant hedge fund. $500M AUM. Very private.", stage: "cold", archetype: "Decision Maker", score: 11, scoreTier: "warm", dnaConfidence: 18, profileTraits: { directness: 0.9, formality: 0.9, analyticalVsEmotional: 0.95, riskTolerance: 0.6 }, communicationStyle: "Extremely concise. Numbers only.", emotionalState: "guarded", engagementLevel: "minimal", daysInPipeline: 60, lastActivity: "3 weeks ago", conversionProbability: 3 },

  // COLD (6)
  { id: demoId("lead", 25), name: "Olivia Barnes", company: "FreshStart Fitness", title: "Founder", about: "Boutique fitness chain. 12 locations.", stage: "cold", archetype: "unknown", score: 8, scoreTier: "cold", dnaConfidence: 15, profileTraits: { directness: 0.5, formality: 0.2, analyticalVsEmotional: 0.3, riskTolerance: 0.5 }, communicationStyle: "Unknown — insufficient data.", emotionalState: "unknown", engagementLevel: "none", daysInPipeline: 0, lastActivity: "never", conversionProbability: 0 },
  { id: demoId("lead", 26), name: "Steven Hall", company: "BuildRight Construction", title: "VP Operations", about: "Commercial construction. 500+ crew members.", stage: "cold", archetype: "unknown", score: 5, scoreTier: "cold", dnaConfidence: 10, profileTraits: { directness: 0.5, formality: 0.5, analyticalVsEmotional: 0.5, riskTolerance: 0.5 }, communicationStyle: "Unknown — insufficient data.", emotionalState: "unknown", engagementLevel: "none", daysInPipeline: 0, lastActivity: "never", conversionProbability: 0 },
  { id: demoId("lead", 27), name: "Yuki Tanaka", company: "NeonGames", title: "Studio Director", about: "Indie game studio. 2M downloads on latest title.", stage: "cold", archetype: "unknown", score: 3, scoreTier: "cold", dnaConfidence: 8, profileTraits: { directness: 0.5, formality: 0.2, analyticalVsEmotional: 0.4, riskTolerance: 0.8 }, communicationStyle: "Unknown — insufficient data.", emotionalState: "unknown", engagementLevel: "none", daysInPipeline: 0, lastActivity: "never", conversionProbability: 0 },
  { id: demoId("lead", 28), name: "Laura Mendez", company: "Viva Hospitality", title: "GM", about: "Boutique hotel group. 8 properties.", stage: "cold", archetype: "unknown", score: 2, scoreTier: "cold", dnaConfidence: 5, profileTraits: { directness: 0.5, formality: 0.6, analyticalVsEmotional: 0.4, riskTolerance: 0.4 }, communicationStyle: "Unknown — insufficient data.", emotionalState: "unknown", engagementLevel: "none", daysInPipeline: 0, lastActivity: "never", conversionProbability: 0 },
  { id: demoId("lead", 29), name: "Mike Chen", company: "AutoFlow Logistics", title: "Founder", about: "Last-mile delivery optimization.", stage: "cold", archetype: "unknown", score: 1, scoreTier: "cold", dnaConfidence: 3, profileTraits: { directness: 0.5, formality: 0.3, analyticalVsEmotional: 0.6, riskTolerance: 0.7 }, communicationStyle: "Unknown — insufficient data.", emotionalState: "unknown", engagementLevel: "none", daysInPipeline: 0, lastActivity: "never", conversionProbability: 0 },
  { id: demoId("lead", 30), name: "Sophie Laurent", company: "Maison Luxe", title: "Brand Director", about: "French luxury fashion house. Global market expansion.", stage: "cold", archetype: "unknown", score: 0, scoreTier: "cold", dnaConfidence: 0, profileTraits: { directness: 0.5, formality: 0.8, analyticalVsEmotional: 0.3, riskTolerance: 0.3 }, communicationStyle: "Unknown — no data.", emotionalState: "unknown", engagementLevel: "none", daysInPipeline: 0, lastActivity: "never", conversionProbability: 0 },
];

// ============================================================================
// EFFECTIVENESS DATA (What styles work for which types)
// ============================================================================

export const SALES_EFFECTIVENESS = [
  { subjectType: "VP Engineering", style: "data_driven", sends: 45, positive: 18, engaged: 12, converted: 6, positiveRate: 40, engagementRate: 26.7, conversionRate: 13.3 },
  { subjectType: "VP Engineering", style: "value_first", sends: 38, positive: 14, engaged: 9, converted: 4, positiveRate: 36.8, engagementRate: 23.7, conversionRate: 10.5 },
  { subjectType: "VP Engineering", style: "direct", sends: 30, positive: 6, engaged: 3, converted: 1, positiveRate: 20, engagementRate: 10, conversionRate: 3.3 },
  { subjectType: "CEO/Founder", style: "contrarian", sends: 52, positive: 22, engaged: 15, converted: 8, positiveRate: 42.3, engagementRate: 28.8, conversionRate: 15.4 },
  { subjectType: "CEO/Founder", style: "social_proof", sends: 41, positive: 16, engaged: 10, converted: 5, positiveRate: 39, engagementRate: 24.4, conversionRate: 12.2 },
  { subjectType: "CEO/Founder", style: "direct", sends: 35, positive: 10, engaged: 5, converted: 2, positiveRate: 28.6, engagementRate: 14.3, conversionRate: 5.7 },
  { subjectType: "Head of Product", style: "question", sends: 33, positive: 15, engaged: 11, converted: 5, positiveRate: 45.5, engagementRate: 33.3, conversionRate: 15.2 },
  { subjectType: "Head of Product", style: "value_first", sends: 28, positive: 11, engaged: 7, converted: 3, positiveRate: 39.3, engagementRate: 25, conversionRate: 10.7 },
  { subjectType: "CTO", style: "data_driven", sends: 40, positive: 16, engaged: 11, converted: 5, positiveRate: 40, engagementRate: 27.5, conversionRate: 12.5 },
  { subjectType: "CTO", style: "contrarian", sends: 36, positive: 13, engaged: 8, converted: 4, positiveRate: 36.1, engagementRate: 22.2, conversionRate: 11.1 },
];

// ============================================================================
// VARIATION ARMS (A/B Test Results)
// ============================================================================

export const SALES_VARIATION_ARMS = [
  { approach: "contrarian_insight", hookType: "opener", successes: 34, trials: 89, alpha: 36, beta: 57 },
  { approach: "value_first_problem", hookType: "opener", successes: 28, trials: 76, alpha: 30, beta: 50 },
  { approach: "social_proof_result", hookType: "opener", successes: 22, trials: 68, alpha: 24, beta: 48 },
  { approach: "question_curiosity", hookType: "opener", successes: 19, trials: 55, alpha: 21, beta: 38 },
  { approach: "data_driven_stat", hookType: "opener", successes: 15, trials: 52, alpha: 17, beta: 39 },
  { approach: "compliment_bridge", hookType: "opener", successes: 12, trials: 45, alpha: 14, beta: 35 },
  { approach: "pain_agitation", hookType: "opener", successes: 10, trials: 41, alpha: 12, beta: 33 },
];

// ============================================================================
// VOICE DNA (Demo user's writing style)
// ============================================================================

export const DEMO_VOICE_DNA = {
  metrics: {
    avgSentenceLength: 12.4,
    avgWordLength: 4.8,
    vocabularyRichness: 0.72,
    readabilityScore: 68,
    contractionRate: 0.45,
    questionRate: 0.18,
    exclamationRate: 0.05,
  },
  signaturePhrases: [
    "here's the thing",
    "what I've seen work",
    "the reality is",
    "from my experience",
    "let me be direct",
  ],
  toneProfile: {
    directness: 0.78,
    warmth: 0.65,
    authority: 0.82,
    humor: 0.35,
    formality: 0.42,
  },
  bannedWords: [],
  aiIsmScore: 12, // Low = good (not robotic)
  authenticityScore: 88,
};

// ============================================================================
// CONSTITUTION (Demo org brand rules)
// ============================================================================

export const DEMO_CONSTITUTION = {
  values: [
    { name: "Authenticity", description: "We speak like humans, not corporations" },
    { name: "Results-First", description: "Always lead with value and outcomes" },
    { name: "Respect", description: "Time is the most valuable currency" },
  ],
  brandVoice: {
    personality: ["confident", "direct", "warm", "knowledgeable"],
    tone: "professional-casual",
    formality: 0.4,
  },
  rules: [
    "Never use more than 2 sentences before getting to the point",
    "Always include a specific, measurable result when referencing case studies",
    "No corporate jargon: 'synergy', 'leverage', 'paradigm' are banned",
    "Questions should be genuine, not rhetorical",
  ],
};
