export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: string;

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR', details?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: string) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(
      id ? `${resource} with id '${id}' not found` : `${resource} not found`,
      404,
      'NOT_FOUND'
    );
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class AgentError extends AppError {
  constructor(message: string, agentType: string) {
    super(`Agent ${agentType} error: ${message}`, 502, 'AGENT_ERROR');
  }
}

export class LLMError extends AppError {
  constructor(message: string, provider?: string) {
    super(
      provider ? `LLM provider ${provider} error: ${message}` : `LLM error: ${message}`,
      503,
      'LLM_ERROR'
    );
  }
}