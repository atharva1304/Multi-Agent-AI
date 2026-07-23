import { llmService } from '../../services/llm.service';
import { ROUTER_SYSTEM_PROMPT } from '../../prompts';
import type { RouterAnalysis, DomainType, AgentType } from '../../types';
import logger from '../../utils/logger';
import { AgentError } from '../../utils/errors';

interface RouterLLMResponse {
  domain: string;
  confidence: number;
  handoff: boolean;
  target: string | null;
  reasoning: string;
  keywords: string[];
  detectedLanguage?: string;
  detectedFramework?: string;
}

class QueryRouterAgent {
  async analyze(query: string): Promise<RouterAnalysis> {
    const startTime = Date.now();

    try {
      const result = await llmService.generateStructuredResponse<RouterLLMResponse>(
        ROUTER_SYSTEM_PROMPT,
        `Analyze this query and route it to the appropriate agent:\n\nQuery: "${query}"\n\nReturn the analysis as JSON.`
      );

      const analysis: RouterAnalysis = {
        query,
        domain: this.validateDomain(result.domain),
        confidence: result.confidence || 0,
        handoff: this.determineHandoff(result.domain, result.handoff),
        target: result.target ? this.validateAgentType(result.target) : null,
        reasoning: result.reasoning || 'Domain classified by router',
        keywords: result.keywords || [],
        detectedLanguage: result.detectedLanguage,
        detectedFramework: result.detectedFramework,
      };

      const duration = Date.now() - startTime;
      logger.info('Query routed', {
        domain: analysis.domain,
        confidence: analysis.confidence,
        target: analysis.target,
        handoff: analysis.handoff,
        duration: `${duration}ms`,
      });

      return analysis;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Router analysis failed', {
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // Fallback to programming agent if routing fails
      return {
        query,
        domain: 'programming',
        confidence: 0.5,
        handoff: false,
        target: 'programming',
        reasoning: 'Fallback: Defaulting to Programming Agent due to routing error',
        keywords: [],
      };
    }
  }

  private validateDomain(domain: string): DomainType {
    const validDomains: DomainType[] = [
      'programming', 'academic', 'medical', 'legal', 'market_research', 'general', 'unknown',
    ];

    const normalized = domain.toLowerCase().replace(/\s+/g, '_') as DomainType;
    if (validDomains.includes(normalized)) {
      return normalized;
    }

    return 'unknown';
  }

  private validateAgentType(target: string): AgentType {
    const validAgents: AgentType[] = [
      'programming', 'academic', 'medical', 'legal', 'market_research',
      'supervisor', 'router', 'validator', 'formatter',
    ];

    const normalized = target.toLowerCase().replace(/\s+/g, '_') as AgentType;
    if (validAgents.includes(normalized)) {
      return normalized;
    }

    return 'programming'; // Default fallback
  }

  private determineHandoff(domain: string, modelHandoff?: boolean): boolean {
    const normalizedDomain = this.validateDomain(domain);

    if (normalizedDomain === 'programming') {
      return false;
    }

    return modelHandoff ?? true;
  }
}

export const queryRouterAgent = new QueryRouterAgent();