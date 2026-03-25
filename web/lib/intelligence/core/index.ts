/**
 * Universal Intelligence Engine - Core Exports
 *
 * Single import point for all intelligence services.
 * Usage: import { extractSubjectDNA, scoreSubject, ... } from "@/lib/intelligence/core"
 */

// DNA Extraction
export { extractSubjectDNA, needsDNAExtraction } from "./subject-dna-extractor";

// Scoring
export { scoreSubject } from "./subject-scorer";

// Profiling
export { profileSubject, calculateProfileConfidence } from "./subject-profiler";

// Conversation Intelligence
export {
  analyzeConversation,
  analyzeEmotionalState,
  shouldPushForOutcome,
  shouldBackOff,
  getConversationSummary,
} from "./conversation-analyzer";

// Predictive Analytics
export { generatePrediction } from "./predictive-service";

// Simulation Engine
export { generatePersona, runSimulation } from "./simulation-engine";

// Voice DNA (Quantum Mirror)
export {
  getVoiceDNA,
  invalidateVoiceCache,
  buildFullVoiceBlock,
  buildModerateVoiceBlock,
  buildMinimalVoiceBlock,
} from "./voice-dna-service";

// Constitution (Brand Governance)
export {
  getConstitution,
  invalidateConstitutionCache,
  buildConstitutionBlock,
  buildMinimalConstitutionBlock,
} from "./constitution-service";

// Prompt Compiler (DOE Context Tiers)
export {
  compilePrompt,
  autoSelectTier,
} from "./prompt-compiler";

// Output Validator (Quality Gates)
export {
  validateOutput,
  cleanOutput,
} from "./output-validator";

// Effectiveness Tracker (Learning Loop)
export {
  trackEffectiveness,
  getBestStyleForSubjectType,
  getOrgEffectiveness,
  getEffectivenessSummary,
  getRecommendedStyle,
} from "./effectiveness-tracker";

// Temporal Intelligence (Timing)
export {
  analyzeTemporalPattern,
  getTimingRecommendation,
  recordTemporalEvent,
} from "./temporal-service";

// Variation Generator (A/B Testing)
export {
  selectVariationArm,
  updateArmStats,
  createNewArm,
  getOrgArms,
  ensureOrgArms,
  persistArmUpdate,
  getArmWinRate,
  shouldExplore,
  getPerformanceSummary,
  checkAndPromoteChampion,
  DEFAULT_APPROACHES,
} from "./variation-generator";

// Voice Analyzer (Linguistic Fingerprinting)
export {
  analyzeVoice,
  saveFingerprint,
  fingerprintToPromptBlock,
} from "./voice-analyzer";

// Voice Genome Engine (Incremental Voice Learning)
export {
  getGenome,
  refineGenome,
  buildGenomeBlock,
  buildMinimalGenomeBlock,
  SOURCE_WEIGHTS,
} from "./voice-genome-engine";

// Prompt Loader (3-Tier Resolution)
export {
  fetchPrompt,
  compileTemplate,
  trackPromptUsage,
  trackPromptSuccess,
  invalidatePromptCache,
} from "./prompt-loader";

// Prompt Builder (Full DOE Assembly)
export {
  buildAdaptivePrompt,
} from "./prompt-builder";

// Journey Pattern Service (Conversion + Anti-Patterns)
export {
  extractJourneyEvents,
  saveConversionPattern,
  recordPatternOutcome,
  getConversionPatterns,
  recordFailurePattern,
  recordAntiPatternSuccess,
  getAntiPatterns,
  detectAntiPattern,
  checkRedFlags,
  matchJourneyPatterns,
  calculatePatternSimilarity,
} from "./journey-pattern-service";

// Weight Optimizer (Dynamic Signal Weighting)
export {
  optimizeSignalWeights,
  getOrgWeights,
  shouldOptimize,
  getOptimizationStats,
} from "./weight-optimizer";

// Cohort Analyzer (Time-Based Performance)
export {
  analyzeCohort,
  compareCohorts,
  getRecentCohorts,
  getVelocityMetrics,
  getPerformanceBenchmarks,
} from "./cohort-analyzer";

// Temporal Decay (Recency-Weighted Intelligence)
export {
  calculateDecayWeight,
  applyDecay,
  applyDecayTowardsNeutral,
  decayBatch,
  getDecayedPatterns,
  getDecayedEffectiveness,
  calculateFreshnessScore,
  detectOptimalDecayProfile,
  DECAY_CONFIGS,
} from "./temporal-decay-service";

// Learning Context (Unified Intelligence Injection)
export {
  getSubjectLearningContext,
  buildLearningGuidance,
  getStyleTag,
  shouldApplyLearning,
} from "./learning-context";

// Signal Recorder (Event Input Layer)
export {
  recordSignal,
  recordSignalBatch,
  getSignalCount,
  getSignalHistory,
} from "./signal-recorder";

// Conversion Predictor (Pattern-Based Outcome Prediction)
export {
  predictOutcome,
  batchPredictOutcomes,
  getOrgPredictionStats,
} from "./conversion-predictor";

// Content Classifier (AI + Rule-Based Classification)
export {
  classifyContent,
  classifyContentRulesOnly,
  getStyleDefinitions,
  batchClassify,
} from "./content-classifier";
