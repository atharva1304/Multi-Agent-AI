export interface Reference {
  title: string;
  url: string;
  source: 'official_docs' | 'github' | 'mdn' | 'npm' | 'stackoverflow' | 'other';
  relevance: number;
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

export interface ValidationResult {
  isValid: boolean;
  overallScore: number;
  inconsistencies: string[];
  recommendations: string[];
}

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

export interface ChatResponse {
  message: string;
  conversationId: string;
  agentResponse: ProgrammingAgentResponse | null;
  formattedResponse: FormattedResponse | null;
  citations: Reference[];
  confidenceScore: number;
  processingTime?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant' | 'system' | 'agent';
  content: string;
  agentType?: string;
  citations?: Reference[];
  confidenceScore?: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Conversation {
  id: string;
  userId: string;
  title: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}