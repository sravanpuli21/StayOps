import type { AlertModule, AlertSeverity } from './alerts';

export type AnomalyKind = 'new' | 'trending' | 'recurring' | 'resolved';
export type Confidence = 'high' | 'medium' | 'low';
export type RecommendationStatus = 'pending' | 'approved' | 'rejected' | 'overridden';

export interface AnomalyFinding {
  id: string;
  hotelId: string;
  module: AlertModule;
  severity: AlertSeverity;
  kind: AnomalyKind;
  headline: string;
  detail: string;
  metricChain: string[];
  detectedAt: string;
}

export interface RootCauseStep {
  step: string;
  evidence: string;
}

export interface RootCause {
  findingId: string;
  chain: RootCauseStep[];
  narrative: string;
}

export interface Recommendation {
  id: string;
  findingId: string;
  hotelId: string;
  action: string;
  rationale: string;
  projectedImpact: string;
  confidence: Confidence;
  status: RecommendationStatus;
}

export interface PortfolioPattern {
  id: string;
  icon: 'trend-up' | 'trend-down' | 'cluster' | 'comp' | 'seasonal';
  title: string;
  narrative: string;
  affectedHotelIds: string[];
  confidence: Confidence;
  detectedAt: string;
}

export interface ForecastScenario {
  label: string;
  delta: string;
  projectedValue: number;
  projectedPct: number;
  formattedValue: string;
}

export interface Forecast {
  id: string;
  metric: string;
  hotelId?: string;
  baseline: number;
  formattedBaseline: string;
  scenarios: ForecastScenario[];
  narrative: string;
  horizon: string;
}

export interface CapexPrediction {
  id: string;
  assetCategory: string;
  dueQuarter: string;
  unitCount: number;
  estimatedCost: number;
  affectedHotelIds: string[];
  rationale: string;
  confidence: Confidence;
}

export interface AIBriefBullet {
  tone: 'neutral' | 'positive' | 'negative' | 'decision';
  text: string;
}

export interface ModuleBrief {
  module: 'dashboard' | 'revenue' | 'labour' | 'operations' | 'assets' | 'intelligence';
  headline: string;
  bullets: AIBriefBullet[];
  generatedAt: string;
}

export interface DecisionLogEntry {
  id: string;
  timestamp: string;
  recommendationId: string;
  hotelId: string;
  action: RecommendationStatus;
  module: AlertModule;
  summary: string;
  actor: string;
  notes?: string;
}
