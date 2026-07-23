import { queryRouterAgent } from '../router';
import { programmingAgent } from '../programming';
import { validatorAgent } from '../validator';
import { formatterAgent } from '../formatter';
import type { RouterAnalysis, ProgrammingAgentResponse, ValidationResult, FormattedResponse } from '../../types';
import logger from '../../utils/logger';
import { AgentError } from '../../utils/errors';

export interface SupervisorResult {
  analysis: RouterAnalysis;
  agentResponse: ProgrammingAgentResponse | null;
  validationResult: ValidationResult | null;
  formattedResponse: FormattedResponse | null;
  success: boolean;
  error?: string;
}

class SupervisorAgent {
  async processQuery(query: string, context?: string): Promise<SupervisorResult> {
    const startTime = Date.now();
    logger.info('Supervisor starting query processing', { query: query.substring(0, 100) });

    try {
      // Step 1: Route the query
      logger.info('Step 1: Routing query');
      const analysis = await queryRouterAgent.analyze(query);

      // Step 2: Check if domain is supported
      if (analysis.handoff) {
        const duration = Date.now() - startTime;
        logger.info('Query requires handoff to unsupported agent', {
          target: analysis.target,
          duration: `${duration}ms`,
        });

        return {
          analysis,
          agentResponse: null,
          validationResult: null,
          formattedResponse: null,
          success: false,
          error: `Domain "${analysis.domain}" is not yet implemented. Please try a programming-related query.`,
        };
      }

      // Step 3: Process with Programming Agent
      logger.info('Step 2: Processing with Programming Agent', { domain: analysis.domain });
      const agentResponse = await programmingAgent.process(query, context);

      // Step 4: Validate the response
      logger.info('Step 3: Validating agent response', {
        confidence: agentResponse.confidence,
        referencesCount: agentResponse.references.length,
      });
      const validationResult = await validatorAgent.validate(agentResponse);

      // Step 5: Format the response
      logger.info('Step 4: Formatting validated response', {
        validationScore: validationResult.overallScore,
        isValid: validationResult.isValid,
      });
      const formattedResponse = await formatterAgent.format(agentResponse, validationResult);

      const duration = Date.now() - startTime;
      logger.info('Supervisor completed query processing', {
        duration: `${duration}ms`,
        domain: analysis.domain,
        confidence: formattedResponse.confidenceScore,
        success: true,
      });

      return {
        analysis,
        agentResponse,
        validationResult,
        formattedResponse,
        success: true,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Supervisor failed to process query', {
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      return {
        analysis: {
          query,
          domain: 'unknown',
          confidence: 0,
          handoff: false,
          target: null,
          reasoning: 'Supervisor error occurred',
          keywords: [],
        },
        agentResponse: null,
        validationResult: null,
        formattedResponse: null,
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred while processing your query',
      };
    }
  }
}

export const supervisorAgent = new SupervisorAgent();