import { DomainException } from './domain.exception';

export class ValidationException extends DomainException {
  readonly code = 'VALIDATION_ERROR';

  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
  }
}
