// ============================================================
// Core Types for Multi-Agent Research Automation Platform
// ============================================================

export type AgentType = 'programming' | 'academic' | 'medical' | 'legal' | 'market_research' | 'supervisor' | 'router' | 'validator' | 'formatter';

export type DomainType = 'programming' | 'academic' | 'medical' | 'legal' | 'market_research' | 'general' | 'unknown';

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export type MessageRole = 'user' | 'assistant' | 'system' | 'agent';

export type AgentStatus = 'idle' | 'processing' | 'completed' | 'failed';

// ============================================================
// Agent Response Types
// ============================================================

export interface ProgrammingAgentResponse {
  summary: string;
  rootCause: string;
  solution: string;
  implementation: string;
  code: string;
  references: Reference[];
  confidence: number;
  metadata?: ProgrammingMetadata;
}

export interface ProgrammingMetadata {
  language: string;
  framework: string | null;
  runtime: string | null;
  libraries: string[];
  timeComplexity: string | null;
  spaceComplexity: string | null;
  securityVulnerabilities: SecurityVulnerability[];
  deprecatedApis: DeprecatedApi[];
  designPatterns: string[];
}

export interface SecurityVulnerability {
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  recommendation: string;
}

export interface DeprecatedApi {
  api: string;
  alternative: string;
  version: string;
}

export interface Reference {
  title: string;
  url: string;
  source: 'official_docs' | 'github' | 'mdn' | 'npm' | 'stackoverflow' | 'other';
  relevance: number;
}

// ============================================================
// Router Types
// ============================================================

export interface RouterAnalysis {
  query: string;
  domain: DomainType;
  confidence: number;
  handoff: boolean;
  target: AgentType | null;
  reasoning: string;
  detectedLanguage?: string;
  detectedFramework?: string;
  keywords: string[];
}

// ============================================================
// Validator Types
// ============================================================

export interface ValidationResult {
  isValid: boolean;
  apiValidation: ValidationCheck[];
  syntaxValidation: ValidationCheck[];
  bestPracticesValidation: ValidationCheck[];
  hallucinationCheck: HallucinationCheck[];
  citationValidation: CitationValidation[];
  inconsistencies: string[];
  overallScore: number;
  recommendations: string[];
}

export interface ValidationCheck {
  passed: boolean;
  item: string;
  details: string;
  severity: 'error' | 'warning' | 'info';
}

export interface HallucinationCheck {
  claim: string;
  verified: boolean;
  source: string | null;
  confidence: number;
}

export interface CitationValidation {
  reference: string;
  verified: boolean;
  url: string;
  status: 'valid' | 'invalid' | 'unverifiable';
}

// ============================================================
// Formatter Types
// ============================================================

export interface FormattedResponse {
  summary: string;
  explanation: string;
  solution: string;
  productionCode: string;
  references: Reference[];
  confidenceScore: number;
  metadata: {
    language: string;
    framework: string | null;
    runtime: string | null;
    timeComplexity: string | null;
    spaceComplexity: string | null;
  };
  warnings: string[];
  suggestions: string[];
}

// ============================================================
// Conversation Types
// ============================================================

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  metadata: Record<string, unknown>;
}

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  agentType: AgentType | null;
  citations: Reference[];
  confidenceScore: number | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

// ============================================================
// API Types
// ============================================================

export interface ChatRequest {
  message: string;
  conversationId?: string;
  userId: string;
}

export interface ChatResponse {
  message: string;
  conversationId: string;
  agentResponse: ProgrammingAgentResponse | null;
  formattedResponse: FormattedResponse | null;
  citations: Reference[];
  confidenceScore: number;
}

export interface AgentProgrammingRequest {
  query: string;
  context?: string;
  userId: string;
}

export interface ApiError {
  error: string;
  code: string;
  details?: string;
  statusCode: number;
}

// ============================================================
// Log Types
// ============================================================

export interface AgentLog {
  id: string;
  agentType: AgentType;
  query: string;
  response: string;
  confidence: number;
  processingTime: number;
  status: AgentStatus;
  error: string | null;
  metadata: Record<string, unknown>;
  createdAt: Date;
}