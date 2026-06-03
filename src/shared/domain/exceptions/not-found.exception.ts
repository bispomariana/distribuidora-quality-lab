import { DomainException } from './domain.exception';

export class NotFoundException extends DomainException {
  readonly code = 'NOT_FOUND';

  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
  }
}
