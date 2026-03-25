/**
 * Universal Intelligence Engine
 *
 * THE core differentiator for Bloom builds.
 * While Lovable/agencies build CRUD apps, Bloom builds apps with
 * enterprise AI intelligence baked in from Day 1.
 *
 * This is the single import point for the entire intelligence engine.
 *
 * Usage:
 *   import { extractSubjectDNA, scoreSubject, ScoreCard } from "@/lib/intelligence"
 *
 * Architecture:
 *   - Config-driven: Everything reads from IntelligenceConfig
 *   - Domain-agnostic: Same services work for sales, coaching, recruitment, etc.
 *   - Preset-based: Battle-tested configs for common verticals
 *   - AI-powered: Uses callAI() for extraction, scoring, analysis
 *   - Adaptive: Learns from outcomes via effectiveness tracker + variation generator
 */

// Core Services
export {
  extractSubjectDNA,
  needsDNAExtraction,
  scoreSubject,
  profileSubject,
  calculateProfileConfidence,
  analyzeConversation,
  analyzeEmotionalState,
  shouldPushForOutcome,
  shouldBackOff,
  getConversationSummary,
  generatePrediction,
  generatePersona,
  runSimulation,
} from "./core";

// Voice & Brand
export {
  getVoiceDNA,
  invalidateVoiceCache,
  buildFullVoiceBlock,
  buildModerateVoiceBlock,
  buildMinimalVoiceBlock,
  getConstitution,
  invalidateConstitutionCache,
  buildConstitutionBlock,
  buildMinimalConstitutionBlock,
} from "./core";

// Prompt Compilation & Output Validation
export {
  compilePrompt,
  autoSelectTier,
  validateOutput,
  cleanOutput,
} from "./core";

// Effectiveness & Learning
export {
  trackEffectiveness,
  getBestStyleForSubjectType,
  getOrgEffectiveness,
  getEffectivenessSummary,
  getRecommendedStyle,
} from "./core";

// Temporal Intelligence
export {
  analyzeTemporalPattern,
  getTimingRecommendation,
  recordTemporalEvent,
} from "./core";

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
} from "./core";

// Voice Analyzer (Linguistic Fingerprinting)
export {
  analyzeVoice,
  saveFingerprint,
  fingerprintToPromptBlock,
} from "./core";

// Voice Genome Engine (Incremental Voice Learning)
export {
  getGenome,
  refineGenome,
  buildGenomeBlock,
  buildMinimalGenomeBlock,
  SOURCE_WEIGHTS,
} from "./core";

// Prompt Loader (3-Tier Resolution)
export {
  fetchPrompt,
  compileTemplate,
  trackPromptUsage,
  trackPromptSuccess,
  invalidatePromptCache,
} from "./core";

// Prompt Builder (Full DOE Assembly)
export {
  buildAdaptivePrompt,
} from "./core";

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
} from "./core";

// Weight Optimizer (Dynamic Signal Weighting)
export {
  optimizeSignalWeights,
  getOrgWeights,
  shouldOptimize,
  getOptimizationStats,
} from "./core";

// Cohort Analyzer (Time-Based Performance)
export {
  analyzeCohort,
  compareCohorts,
  getRecentCohorts,
  getVelocityMetrics,
  getPerformanceBenchmarks,
} from "./core";

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
} from "./core";

// Learning Context (Unified Intelligence Injection)
export {
  getSubjectLearningContext,
  buildLearningGuidance,
  getStyleTag,
  shouldApplyLearning,
} from "./core";

// Signal Recorder (Event Input Layer)
export {
  recordSignal,
  recordSignalBatch,
  getSignalCount,
  getSignalHistory,
} from "./core";

// Conversion Predictor (Outcome Prediction)
export {
  predictOutcome,
  batchPredictOutcomes,
  getOrgPredictionStats,
} from "./core";

// Content Classifier (AI + Rule-Based)
export {
  classifyContent,
  classifyContentRulesOnly,
  getStyleDefinitions,
  batchClassify,
} from "./core";

// Intelligence Registry (Agent Backbone)
export {
  INTELLIGENCE_MODULES,
  getEnabledModules,
  getRequiredFiles,
  getRequiredTables,
  getCleanupFiles,
  detectModulesFromIntake,
  getModule,
  getModulesByTier,
  getModulesByCategory,
} from "./intelligence-registry";

// Config
export { loadIntelligenceConfig } from "./config/intelligence.config";
export type { IntelligenceConfig } from "./config/intelligence.config";
export { INTELLIGENCE_PRESETS, findPresetForDomain } from "./config/presets";

// Types
export type {
  SubjectDNA,
  SubjectScore,
  SubjectProfile,
  ConversationState,
  ConversationMessage,
  EmotionalState,
  PredictiveInsight,
  PersonaModel,
  SimulationResult,
  AdaptiveIntelligenceData,
  ScoringBreakdownItem,
} from "./types/intelligence.types";
export { emptySubjectDNA, getQualityLabel, getScoreTier } from "./types/intelligence.types";

// Voice DNA Types
export type {
  VoiceDNA,
  VoiceMetrics,
  RhythmSignature,
  GenerativeFormula,
  VoiceExemplars,
  ContrastiveAnalysis,
  LinguisticFingerprint,
} from "./core/voice-dna-service";

// Constitution Types
export type {
  Constitution,
  ConstitutionValue,
  BrandVoice,
} from "./core/constitution-service";

// Prompt Compiler Types
export type {
  ContextTier,
  CompilationContext,
  CompiledPrompt,
} from "./core/prompt-compiler";

// Output Validator Types
export type {
  ValidationResult,
  ValidationIssue,
} from "./core/output-validator";

// Temporal Types
export type {
  TemporalPattern,
  TemporalEvent,
  TimingRecommendation,
} from "./core/temporal-service";

// Effectiveness Types
export type {
  EffectivenessMetrics,
  EffectivenessRecord,
  OutcomeSignal,
} from "./core/effectiveness-tracker";

// Variation Types
export type {
  ContentVariation,
  VariationArm,
} from "./core/variation-generator";

// Voice Analyzer Types
export type {
  VoiceFingerprint,
} from "./core/voice-analyzer";

// Voice Genome Types
export type {
  VoiceGenome,
  GenomeMetric,
  GenomePattern,
  RefinementInput,
} from "./core/voice-genome-engine";

// Prompt Loader Types
export type {
  PromptTemplate,
  CompiledPrompt as LoaderCompiledPrompt,
  PromptResolutionResult,
} from "./core/prompt-loader";

// Prompt Builder Types
export type {
  AdaptivePromptContext,
  AdaptivePromptResult,
} from "./core/prompt-builder";

// Journey Pattern Types
export type {
  JourneyEvent,
  ConversionPattern,
  AntiPattern,
  FailureType,
  PatternMatch,
  RedFlagResult,
} from "./core/journey-pattern-service";

// Weight Optimizer Types
export type {
  SignalWeightMap,
  WeightOptimizationResult,
} from "./core/weight-optimizer";

// Cohort Analyzer Types
export type {
  CohortMetrics,
  CohortComparison,
  SubjectVelocity,
  VelocityMetrics,
  PerformanceBenchmark,
} from "./core/cohort-analyzer";

// Temporal Decay Types
export type {
  DecayProfile,
  DecayedItem,
  FreshnessReport,
} from "./core/temporal-decay-service";

// Learning Context Types
export type {
  SubjectLearningContext,
  ContentType,
} from "./core/learning-context";

// Signal Recorder Types
export type {
  SignalEvent,
  SignalResult,
  SignalWeights,
} from "./core/signal-recorder";

// Conversion Predictor Types
export type {
  OutcomePrediction,
} from "./core/conversion-predictor";

// Content Classifier Types
export type {
  ContentStyle,
  ContentClassification,
} from "./core/content-classifier";

// Intelligence Registry Types
export type {
  IntelligenceModule,
} from "./intelligence-registry";

// Demo Mode (Phase 0 — works without database)
export {
  isDemoMode,
  getDemoOrReal,
  getDemoOrRealSync,
  getSubjectsOrDemo,
  getSubjectIntelligenceOrDemo,
  getPipelineSummaryOrDemo,
  getEffectivenessOrDemo,
  getBestStyleOrDemo,
  getVariationArmsOrDemo,
  getVoiceDNAOrDemo,
  getConstitutionOrDemo,
  getTemporalPatternOrDemo,
  getCohortDataOrDemo,
} from "./demo";

// Demo Raw Data (for Agent 5 wiring)
export {
  getDemoSubjects,
  getDemoSubject,
  getDemoSubjectIntelligence,
  getDemoSubjectsByTier,
  getDemoPipelineSummary,
  getDemoEffectiveness,
  getDemoBestStyle,
  getDemoVariationArms,
  getDemoChampionApproach,
  getDemoVoiceDNA,
  getDemoConstitution,
  getDemoTemporalPattern,
  getDemoCohortData,
} from "./demo";

// Demo Types
export type { DemoSubject } from "./demo";

// UI Components
export { ScoreCard } from "./ui/ScoreCard";
export { DNAPanel } from "./ui/DNAPanel";
export {
  PredictiveInsightCard,
  ConversationStateCard,
  EmotionalStateCard,
} from "./ui/InsightCards";
