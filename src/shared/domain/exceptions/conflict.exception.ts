import { DomainException } from './domain.exception';

export class ConflictException extends DomainException {
  readonly code = 'CONFLICT';

  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
  }
}
