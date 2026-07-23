import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import { config } from '../config';
import logger from '../utils/logger';
import { LLMError } from '../utils/errors';

export type LLMProvider = 'openai' | 'gemini' | 'anthropic';

interface LLMConfig {
  provider: LLMProvider;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

class LLMService {
  private openai: OpenAI | null = null;
  private gemini: GoogleGenerativeAI | null = null;
  private anthropic: Anthropic | null = null;

  private isGeminiModelNotFound(error: unknown): boolean {
    const message = error instanceof Error ? error.message : String(error);
    return message.includes('models/') && message.includes('not found');
  }

  private isGeminiQuotaError(error: unknown): boolean {
    const message = error instanceof Error ? error.message : String(error);
    return (
      message.includes('429') ||
      message.toLowerCase().includes('quota') ||
      message.toLowerCase().includes('rate limit') ||
      message.toLowerCase().includes('too many requests')
    );
  }

  private getOpenAI(): OpenAI {
    if (!this.openai) {
      if (!config.openai.apiKey || config.openai.apiKey === 'your-openai-api-key') {
        throw new LLMError('OpenAI API key not configured or out of credits. Add a valid key to .env file.', 'openai');
      }
      this.openai = new OpenAI({ apiKey: config.openai.apiKey });
    }
    return this.openai;
  }

  private getGemini(): GoogleGenerativeAI {
    if (!this.gemini) {
      if (!config.gemini.apiKey || config.gemini.apiKey === 'your-gemini-api-key') {
        throw new LLMError('Gemini API key not configured. Add your key to .env file.', 'gemini');
      }
      this.gemini = new GoogleGenerativeAI(config.gemini.apiKey);
    }
    return this.gemini;
  }

  private getAnthropic(): Anthropic {
    if (!this.anthropic) {
      if (!config.anthropic.apiKey || config.anthropic.apiKey === 'your-anthropic-api-key') {
        throw new LLMError('Anthropic API key not configured. Add your key to .env file.', 'anthropic');
      }
      this.anthropic = new Anthropic({ apiKey: config.anthropic.apiKey });
    }
    return this.anthropic;
  }

  async generateResponse(
    systemPrompt: string,
    userMessage: string,
    llmConfig: LLMConfig = { provider: 'gemini' }
  ): Promise<string> {
    const startTime = Date.now();

    try {
      let response: string;

      switch (llmConfig.provider) {
        case 'openai': {
          const openai = this.getOpenAI();
          const completion = await openai.chat.completions.create({
            model: llmConfig.model || 'gpt-4o-mini',
            temperature: llmConfig.temperature ?? 0.1,
            max_tokens: llmConfig.maxTokens ?? 4096,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userMessage },
            ],
          });
          response = completion.choices[0]?.message?.content || '';
          break;
        }

        case 'gemini': {
          const genAI = this.getGemini();
          const candidateModels = [
            llmConfig.model,
            process.env.GEMINI_MODEL,
            'gemini-2.0-flash',
            'gemini-flash-lite-latest',
            'gemini-flash-latest',
            'gemini-2.5-flash',
          ].filter((model): model is string => Boolean(model));

          let lastError: unknown = null;

          for (const modelName of candidateModels) {
            try {
              const model = genAI.getGenerativeModel({ model: modelName });
              const result = await model.generateContent({
                contents: [
                  { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userMessage}` }] },
                ],
                generationConfig: {
                  temperature: llmConfig.temperature ?? 0.1,
                  maxOutputTokens: llmConfig.maxTokens ?? 4096,
                },
              });
              response = result.response.text();
              break;
            } catch (error) {
              lastError = error;

              if (!this.isGeminiModelNotFound(error) && !this.isGeminiQuotaError(error)) {
                throw error;
              }
            }
          }

          if (!response) {
            throw lastError || new LLMError('Gemini did not return a response', 'gemini');
          }
          break;
        }

        case 'anthropic': {
          const anthropic = this.getAnthropic();
          const message = await anthropic.messages.create({
            model: llmConfig.model || 'claude-3-haiku-20240307',
            temperature: llmConfig.temperature ?? 0.1,
            max_tokens: llmConfig.maxTokens ?? 4096,
            system: systemPrompt,
            messages: [
              { role: 'user', content: userMessage },
            ],
          });
          response = message.content
            .filter((block: any) => block.type === 'text')
            .map((block: any) => block.text)
            .join('\n');
          break;
        }

        default:
          throw new LLMError(`Unknown provider: ${llmConfig.provider}`, llmConfig.provider);
      }

      const duration = Date.now() - startTime;
      logger.info('LLM response generated', {
        provider: llmConfig.provider,
        duration: `${duration}ms`,
        responseLength: response.length,
      });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('LLM generation failed', {
        provider: llmConfig.provider,
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      if (error instanceof LLMError) {
        throw error;
      }

      throw new LLMError(
        error instanceof Error ? error.message : 'Unknown error',
        llmConfig.provider
      );
    }
  }

  async generateStructuredResponse<T>(
    systemPrompt: string,
    userMessage: string,
    llmConfig: LLMConfig = { provider: 'gemini' }
  ): Promise<T> {
    const response = await this.generateResponse(systemPrompt, userMessage, llmConfig);

    try {
      const normalizedResponse = response.replace(/\r\n/g, '\n').trim();
      const jsonMatch = normalizedResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);

      const jsonStr = (jsonMatch?.[1] || normalizedResponse).trim();
      const parsed = JSON.parse(jsonStr) as T;
      
      return parsed;
    } catch (error) {
      logger.error('Failed to parse LLM response as JSON', {
        response: response.substring(0, 500),
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw new LLMError('Failed to parse structured response from LLM');
    }
  }
}

export const llmService = new LLMService();