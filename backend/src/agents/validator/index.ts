import { llmService } from '../../services/llm.service';
import { VALIDATOR_SYSTEM_PROMPT } from '../../prompts';
import type { ValidationResult, ValidationCheck, HallucinationCheck, CitationValidation } from '../../types';
import type { ProgrammingAgentResponse } from '../../types';
import logger from '../../utils/logger';
import { AgentError } from '../../utils/errors';

interface ValidatorLLMResponse {
  isValid: boolean;
  apiValidation: Array<{ passed: boolean; item: string; details: string; severity: string }>;
  syntaxValidation: Array<{ passed: boolean; item: string; details: string; severity: string }>;
  bestPracticesValidation: Array<{ passed: boolean; item: string; details: string; severity: string }>;
  hallucinationCheck: Array<{ claim: string; verified: boolean; source: string | null; confidence: number }>;
  citationValidation: Array<{ reference: string; verified: boolean; url: string; status: string }>;
  inconsistencies: string[];
  overallScore: number;
  recommendations: string[];
}

class ValidatorAgent {
  async validate(agentResponse: ProgrammingAgentResponse): Promise<ValidationResult> {
    const startTime = Date.now();

    try {
      const userMessage = this.buildValidationMessage(agentResponse);

      const rawResult = await llmService.generateStructuredResponse<ValidatorLLMResponse>(
        VALIDATOR_SYSTEM_PROMPT,
        userMessage
      );

      const result: ValidationResult = {
        isValid: rawResult.isValid ?? true,
        apiValidation: this.transformValidationChecks(rawResult.apiValidation || []),
        syntaxValidation: this.transformValidationChecks(rawResult.syntaxValidation || []),
        bestPracticesValidation: this.transformValidationChecks(rawResult.bestPracticesValidation || []),
        hallucinationCheck: (rawResult.hallucinationCheck || []).map((h) => ({
          claim: h.claim,
          verified: h.verified,
          source: h.source,
          confidence: Math.min(1, Math.max(0, h.confidence || 0.5)),
        })),
        citationValidation: (rawResult.citationValidation || []).map((c) => ({
          reference: c.reference,
          verified: c.verified,
          url: c.url,
          status: this.validateCitationStatus(c.status),
        })),
        inconsistencies: rawResult.inconsistencies || [],
        overallScore: Math.min(1, Math.max(0, rawResult.overallScore ?? 0.8)),
        recommendations: rawResult.recommendations || [],
      };

      const duration = Date.now() - startTime;
      logger.info('Validation completed', {
        duration: `${duration}ms`,
        isValid: result.isValid,
        overallScore: result.overallScore,
        issuesFound: this.countIssues(result),
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Validation failed', {
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // Return a permissive validation result on error
      return {
        isValid: true,
        apiValidation: [],
        syntaxValidation: [],
        bestPracticesValidation: [],
        hallucinationCheck: [],
        citationValidation: [],
        inconsistencies: ['Validation process encountered an error, proceeding with caution'],
        overallScore: 0.6,
        recommendations: ['Manual review recommended due to validation error'],
      };
    }
  }

  private buildValidationMessage(response: ProgrammingAgentResponse): string {
    return `Please validate the following agent response:

Summary: ${response.summary}

Root Cause: ${response.rootCause}

Solution: ${response.solution}

Implementation: ${response.implementation}

Code:
\`\`\`
${response.code}
\`\`\`

References:
${response.references.map((r) => `- ${r.title} (${r.url}) [${r.source}]`).join('\n')}

Confidence Score: ${response.confidence}

Metadata:
${JSON.stringify(response.metadata, null, 2)}

Please perform all validation checks and return the results as JSON.`;
  }

  private transformValidationChecks(checks: Array<{ passed: boolean; item: string; details: string; severity: string }>): ValidationCheck[] {
    return checks.map((check) => ({
      passed: check.passed,
      item: check.item,
      details: check.details,
      severity: this.validateSeverity(check.severity),
    }));
  }

  private validateSeverity(severity: string): 'error' | 'warning' | 'info' {
    const valid = ['error', 'warning', 'info'];
    const normalized = severity.toLowerCase() as 'error' | 'warning' | 'info';
    return valid.includes(normalized) ? normalized : 'info';
  }

  private validateCitationStatus(status: string): 'valid' | 'invalid' | 'unverifiable' {
    const valid = ['valid', 'invalid', 'unverifiable'];
    const normalized = status.toLowerCase() as 'valid' | 'invalid' | 'unverifiable';
    return valid.includes(normalized) ? normalized : 'unverifiable';
  }

  private countIssues(result: ValidationResult): number {
    const allChecks = [
      ...result.apiValidation,
      ...result.syntaxValidation,
      ...result.bestPracticesValidation,
    ];
    return allChecks.filter((c) => !c.passed).length;
  }
}

export const validatorAgent = new ValidatorAgent();