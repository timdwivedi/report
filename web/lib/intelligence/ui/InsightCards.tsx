/**
 * Universal Insight Cards Component
 *
 * Displays predictive insights, conversation state, and actionable intelligence.
 * Config-driven: adapts labels, colors, and layout based on intelligence config.
 *
 * Transplanted from IP's PredictiveInsightsCard, ConversationIntelligenceCard.
 */

"use client";

import type { PredictiveInsight, ConversationState, EmotionalState } from "../types/intelligence.types";
import type { IntelligenceConfig } from "../config/intelligence.config";

// ============================================================================
// PREDICTIVE INSIGHT CARD
// ============================================================================

interface PredictiveCardProps {
  insight: PredictiveInsight;
  config: IntelligenceConfig;
  className?: string;
}

export function PredictiveInsightCard({ insight, config, className = "" }: PredictiveCardProps) {
  const probabilityColor =
    insight.outcome_probability >= 70 ? "text-emerald-500" :
    insight.outcome_probability >= 40 ? "text-yellow-500" :
    "text-red-500";

  return (
    <div className={`rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 ${className}`}>
      <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">
        Predictive Analysis
      </h3>

      {/* Probability gauge */}
      <div className="flex items-center gap-4 mb-4">
        <div className="text-center">
          <span className={`text-3xl font-bold tabular-nums ${probabilityColor}`}>
            {insight.outcome_probability}%
          </span>
          <p className="text-xs text-neutral-400 mt-0.5">
            {config.prediction.outcome_label} probability
          </p>
        </div>
        <div className="flex-1 h-3 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              insight.outcome_probability >= 70 ? "bg-emerald-500" :
              insight.outcome_probability >= 40 ? "bg-yellow-500" :
              "bg-red-500"
            }`}
            style={{ width: `${insight.outcome_probability}%` }}
          />
        </div>
      </div>

      {/* Time to outcome */}
      {insight.time_to_outcome_days > 0 && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
          Est. time to {config.prediction.outcome_label}:{" "}
          <span className="font-medium">{insight.time_to_outcome_days} days</span>
        </p>
      )}

      {/* Next action */}
      {insight.recommended_next_action && (
        <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 mb-3">
          <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mb-0.5">
            Recommended Next Action
          </p>
          <p className="text-sm text-blue-800 dark:text-blue-300">
            {insight.recommended_next_action}
          </p>
        </div>
      )}

      {/* Factors */}
      <div className="grid grid-cols-2 gap-3">
        {insight.winning_factors.length > 0 && (
          <div>
            <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">Winning Factors</p>
            <ul className="space-y-1">
              {insight.winning_factors.map((f, i) => (
                <li key={i} className="text-xs text-neutral-600 dark:text-neutral-400 flex items-start gap-1">
                  <span className="text-emerald-500 mt-0.5">+</span> {f}
                </li>
              ))}
            </ul>
          </div>
        )}
        {insight.risk_factors.length > 0 && (
          <div>
            <p className="text-xs font-medium text-red-600 dark:text-red-400 mb-1">Risk Factors</p>
            <ul className="space-y-1">
              {insight.risk_factors.map((f, i) => (
                <li key={i} className="text-xs text-neutral-600 dark:text-neutral-400 flex items-start gap-1">
                  <span className="text-red-500 mt-0.5">-</span> {f}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// CONVERSATION STATE CARD
// ============================================================================

interface ConversationCardProps {
  state: ConversationState;
  config: IntelligenceConfig;
  className?: string;
}

export function ConversationStateCard({ state, config, className = "" }: ConversationCardProps) {
  const engagementColors: Record<string, string> = {
    none: "bg-neutral-200 dark:bg-neutral-700",
    low: "bg-red-400",
    medium: "bg-yellow-400",
    high: "bg-blue-500",
    very_high: "bg-emerald-500",
  };

  return (
    <div className={`rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 ${className}`}>
      <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">
        Conversation Intelligence
      </h3>

      {/* Key metrics row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="text-center p-2 rounded-lg bg-neutral-50 dark:bg-neutral-900">
          <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${engagementColors[state.engagement_level] || engagementColors.none}`} />
          <p className="text-xs text-neutral-500">Engagement</p>
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 capitalize">
            {state.engagement_level.replace("_", " ")}
          </p>
        </div>
        <div className="text-center p-2 rounded-lg bg-neutral-50 dark:bg-neutral-900">
          <p className="text-lg font-bold text-neutral-700 dark:text-neutral-300 tabular-nums">
            {(state.intent_score * 100).toFixed(0)}%
          </p>
          <p className="text-xs text-neutral-500">Intent</p>
        </div>
        <div className="text-center p-2 rounded-lg bg-neutral-50 dark:bg-neutral-900">
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 capitalize">
            {state.emotional_state}
          </p>
          <p className="text-xs text-neutral-500">Emotion</p>
        </div>
      </div>

      {/* Stage */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs text-neutral-500">Stage:</span>
        <div className="flex gap-1 flex-1">
          {config.conversation.stages.map(stage => (
            <div
              key={stage}
              className={`flex-1 h-1.5 rounded-full ${
                stage === state.conversation_stage
                  ? "bg-blue-500"
                  : config.conversation.stages.indexOf(stage) < config.conversation.stages.indexOf(state.conversation_stage)
                    ? "bg-blue-200 dark:bg-blue-800"
                    : "bg-neutral-100 dark:bg-neutral-800"
              }`}
              title={stage}
            />
          ))}
        </div>
        <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400 capitalize">
          {state.conversation_stage}
        </span>
      </div>

      {/* Detected signals */}
      {state.signal_detections.length > 0 && (
        <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
          <p className="text-xs font-medium text-neutral-500 mb-2">Detected Signals</p>
          <div className="space-y-1.5">
            {state.signal_detections.map((signal, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    signal.confidence > 0.7 ? "bg-red-500" : signal.confidence > 0.4 ? "bg-yellow-500" : "bg-neutral-400"
                  }`} />
                  <span className="text-neutral-600 dark:text-neutral-400 capitalize">
                    {signal.type.replace(/_/g, " ")}
                  </span>
                </div>
                <span className="text-neutral-400 tabular-nums">{(signal.confidence * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next action */}
      <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
        <p className="text-xs font-medium text-neutral-500 mb-1.5">Next Action</p>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 capitalize">
            {state.next_action_strategy.tone}
          </span>
          <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 capitalize">
            {state.next_action_strategy.focus.replace(/_/g, " ")}
          </span>
          <span className={`px-2 py-0.5 rounded text-xs ${
            state.next_action_strategy.timing === "now"
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
          }`}>
            {state.next_action_strategy.timing === "now" ? "Act Now" : state.next_action_strategy.timing === "wait" ? "Wait" : "Not Ready"}
          </span>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// EMOTIONAL STATE CARD
// ============================================================================

interface EmotionalCardProps {
  state: EmotionalState;
  className?: string;
}

export function EmotionalStateCard({ state, className = "" }: EmotionalCardProps) {
  return (
    <div className={`rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-5 ${className}`}>
      <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-3">
        Emotional State
      </h3>

      <div className="flex items-center gap-3 mb-3">
        <span className="text-lg font-semibold text-neutral-800 dark:text-neutral-200 capitalize">
          {state.primary_emotion}
        </span>
        <div className="flex gap-0.5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className={`w-2 h-4 rounded-sm ${
                i < state.intensity
                  ? state.intensity >= 7 ? "bg-red-500" : state.intensity >= 4 ? "bg-yellow-500" : "bg-blue-500"
                  : "bg-neutral-100 dark:bg-neutral-800"
              }`}
            />
          ))}
        </div>
      </div>

      {state.trigger_detected && (
        <p className="text-xs text-neutral-500 mb-1.5">
          <span className="font-medium">Trigger:</span> {state.trigger_detected}
        </p>
      )}
      {state.suggested_adaptation && (
        <p className="text-xs text-blue-600 dark:text-blue-400">
          <span className="font-medium">Adapt:</span> {state.suggested_adaptation}
        </p>
      )}
    </div>
  );
}
