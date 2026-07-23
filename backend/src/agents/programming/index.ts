import { llmService } from '../../services/llm.service';
import { PROGRAMMING_AGENT_SYSTEM_PROMPT } from '../../prompts';
import { webSearchTool } from '../../tools/web-search.tool';
import type { ProgrammingAgentResponse, ProgrammingMetadata, Reference } from '../../types';
import logger from '../../utils/logger';
import { AgentError } from '../../utils/errors';

interface RawProgrammingResponse {
  summary: string;
  rootCause: string;
  solution: string;
  implementation: string;
  code: string;
  references: Array<{
    title: string;
    url: string;
    source: string;
    relevance: number;
  }>;
  confidence: number;
  metadata?: {
    language?: string;
    framework?: string | null;
    runtime?: string | null;
    libraries?: string[];
    timeComplexity?: string | null;
    spaceComplexity?: string | null;
    securityVulnerabilities?: Array<{
      type: string;
      severity: string;
      description: string;
      recommendation: string;
    }>;
    deprecatedApis?: Array<{
      api: string;
      alternative: string;
      version: string;
    }>;
    designPatterns?: string[];
  };
}

class ProgrammingAgent {
  async process(query: string, context?: string): Promise<ProgrammingAgentResponse> {
    const startTime = Date.now();

    try {
      // Generate search URLs for context
      const searchResults = webSearchTool.generateSearchUrls(query);
      const searchContext = webSearchTool.formatSearchContext(searchResults);

      // Build the user message with context
      const userMessage = this.buildUserMessage(query, searchContext, context);

      logger.info('Programming Agent processing query', {
        queryLength: query.length,
        hasContext: !!context,
        searchResultsCount: searchResults.length,
      });

      const rawResponse = await llmService.generateStructuredResponse<RawProgrammingResponse>(
        PROGRAMMING_AGENT_SYSTEM_PROMPT,
        userMessage
      );

      // Transform to proper types
      const response: ProgrammingAgentResponse = {
        summary: rawResponse.summary || '',
        rootCause: rawResponse.rootCause || '',
        solution: rawResponse.solution || '',
        implementation: rawResponse.implementation || '',
        code: rawResponse.code || '',
        references: this.validateReferences(rawResponse.references || []),
        confidence: this.clampConfidence(rawResponse.confidence || 0.5),
        metadata: rawResponse.metadata
          ? this.transformMetadata(rawResponse.metadata)
          : undefined,
      };

      const duration = Date.now() - startTime;
      logger.info('Programming Agent completed', {
        duration: `${duration}ms`,
        confidence: response.confidence,
        referencesCount: response.references.length,
        hasCode: !!response.code,
      });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Programming Agent failed', {
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      if (error instanceof AgentError) {
        throw error;
      }

      throw new AgentError(
        error instanceof Error ? error.message : 'Unknown error during processing',
        'programming'
      );
    }
  }

  private buildUserMessage(query: string, searchContext: string, context?: string): string {
    let message = `User Query: "${query}"\n\n`;

    if (context) {
      message += `Additional Context:\n${context}\n\n`;
    }

    message += `Available Search Resources:\n${searchContext}\n\n`;
    message += `Please analyze this question and provide a comprehensive response following the required JSON format. Include specific search URLs from the resources above as references when applicable.`;

    return message;
  }

  private validateReferences(refs: RawProgrammingResponse['references']): Reference[] {
    return refs
      .filter((ref) => {
        const isValidUrl = ref.url && (ref.url.startsWith('http://') || ref.url.startsWith('https://'));
        const isValidSource = ['official_docs', 'github', 'mdn', 'npm', 'stackoverflow', 'other'].includes(ref.source);
        return isValidUrl && isValidSource;
      })
      .map((ref) => ({
        title: ref.title || 'Reference',
        url: ref.url,
        source: ref.source as Reference['source'],
        relevance: Math.min(1, Math.max(0, ref.relevance || 0.5)),
      }))
      .slice(0, 15); // Limit to 15 references
  }

  private clampConfidence(confidence: number): number {
    return Math.min(1, Math.max(0, confidence));
  }

  private transformMetadata(raw: RawProgrammingResponse['metadata']): ProgrammingMetadata {
    return {
      language: raw?.language || 'Unknown',
      framework: raw?.framework || null,
      runtime: raw?.runtime || null,
      libraries: raw?.libraries || [],
      timeComplexity: raw?.timeComplexity || null,
      spaceComplexity: raw?.spaceComplexity || null,
      securityVulnerabilities: (raw?.securityVulnerabilities || []).map((v) => ({
        type: v.type,
        severity: this.validateSeverity(v.severity),
        description: v.description,
        recommendation: v.recommendation,
      })),
      deprecatedApis: (raw?.deprecatedApis || []).map((d) => ({
        api: d.api,
        alternative: d.alternative,
        version: d.version,
      })),
      designPatterns: raw?.designPatterns || [],
    };
  }

  private validateSeverity(severity: string): 'critical' | 'high' | 'medium' | 'low' {
    const validSeverities = ['critical', 'high', 'medium', 'low'];
    const normalized = severity.toLowerCase() as 'critical' | 'high' | 'medium' | 'low';
    return validSeverities.includes(normalized) ? normalized : 'medium';
  }
}

export const programmingAgent = new ProgrammingAgent();