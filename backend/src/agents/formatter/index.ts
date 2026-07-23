import { llmService } from '../../services/llm.service';
import { FORMATTER_SYSTEM_PROMPT } from '../../prompts';
import type { FormattedResponse, ProgrammingAgentResponse, ValidationResult, Reference } from '../../types';
import logger from '../../utils/logger';
import { AgentError } from '../../utils/errors';

interface FormatterLLMResponse {
  summary: string;
  explanation: string;
  solution: string;
  productionCode: string;
  references: Array<{ title: string; url: string; source: string; relevance: number }>;
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

class FormatterAgent {
  async format(
    agentResponse: ProgrammingAgentResponse,
    validationResult: ValidationResult
  ): Promise<FormattedResponse> {
    const startTime = Date.now();

    try {
      const userMessage = this.buildFormatMessage(agentResponse, validationResult);

      const rawResult = await llmService.generateStructuredResponse<FormatterLLMResponse>(
        FORMATTER_SYSTEM_PROMPT,
        userMessage
      );

      const formatted: FormattedResponse = {
        summary: rawResult.summary || agentResponse.summary,
        explanation: rawResult.explanation || agentResponse.rootCause,
        solution: rawResult.solution || agentResponse.solution,
        productionCode: rawResult.productionCode || agentResponse.code,
        references: this.validateReferences(rawResult.references || agentResponse.references),
        confidenceScore: Math.min(1, Math.max(0, rawResult.confidenceScore ?? agentResponse.confidence)),
        metadata: {
          language: rawResult.metadata?.language || agentResponse.metadata?.language || 'Unknown',
          framework: rawResult.metadata?.framework || agentResponse.metadata?.framework || null,
          runtime: rawResult.metadata?.runtime || agentResponse.metadata?.runtime || null,
          timeComplexity: rawResult.metadata?.timeComplexity || agentResponse.metadata?.timeComplexity || null,
          spaceComplexity: rawResult.metadata?.spaceComplexity || agentResponse.metadata?.spaceComplexity || null,
        },
        warnings: [
          ...(rawResult.warnings || []),
          ...validationResult.recommendations.filter((r) => r.toLowerCase().includes('warning') || r.toLowerCase().includes('caution')),
          ...validationResult.inconsistencies.map((i) => `Inconsistency: ${i}`),
        ],
        suggestions: rawResult.suggestions || [],
      };

      const duration = Date.now() - startTime;
      logger.info('Formatting completed', {
        duration: `${duration}ms`,
        confidenceScore: formatted.confidenceScore,
        warningsCount: formatted.warnings.length,
        suggestionsCount: formatted.suggestions.length,
      });

      return formatted;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Formatting failed', {
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // Return a basic formatted response on error
      return {
        summary: agentResponse.summary,
        explanation: agentResponse.rootCause,
        solution: agentResponse.solution,
        productionCode: agentResponse.code,
        references: agentResponse.references,
        confidenceScore: agentResponse.confidence,
        metadata: {
          language: agentResponse.metadata?.language || 'Unknown',
          framework: agentResponse.metadata?.framework || null,
          runtime: agentResponse.metadata?.runtime || null,
          timeComplexity: agentResponse.metadata?.timeComplexity || null,
          spaceComplexity: agentResponse.metadata?.spaceComplexity || null,
        },
        warnings: ['Formatting encountered an error, showing raw response'],
        suggestions: [],
      };
    }
  }

  private buildFormatMessage(
    agentResponse: ProgrammingAgentResponse,
    validationResult: ValidationResult
  ): string {
    return `Please format the following agent response and validation results into a professional, UI-friendly format:

AGENT RESPONSE:
Summary: ${agentResponse.summary}
Root Cause: ${agentResponse.rootCause}
Solution: ${agentResponse.solution}
Implementation: ${agentResponse.implementation}

Code:
\`\`\`
${agentResponse.code}
\`\`\`

References:
${agentResponse.references.map((r) => `- ${r.title} (${r.url})`).join('\n')}

Confidence: ${agentResponse.confidence}

VALIDATION RESULTS:
Overall Score: ${validationResult.overallScore}
Is Valid: ${validationResult.isValid}
Issues Found: ${validationResult.apiValidation.filter((c) => !c.passed).length + validationResult.syntaxValidation.filter((c) => !c.passed).length + validationResult.bestPracticesValidation.filter((c) => !c.passed).length}
Inconsistencies: ${validationResult.inconsistencies.join(', ') || 'None'}
Recommendations: ${validationResult.recommendations.join(', ') || 'None'}

Please format this into a clean, professional response with proper sections. Return as JSON.`;
  }

  private validateReferences(refs: FormatterLLMResponse['references']): Reference[] {
    return refs
      .filter((ref) => ref.url && (ref.url.startsWith('http://') || ref.url.startsWith('https://')))
      .map((ref) => ({
        title: ref.title || 'Reference',
        url: ref.url,
        source: (['official_docs', 'github', 'mdn', 'npm', 'stackoverflow', 'other'].includes(ref.source)
          ? ref.source
          : 'other') as Reference['source'],
        relevance: Math.min(1, Math.max(0, ref.relevance || 0.5)),
      }))
      .slice(0, 15);
  }
}

export const formatterAgent = new FormatterAgent();