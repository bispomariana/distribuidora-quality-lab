import { DomainException } from './domain.exception';

export class BusinessRuleException extends DomainException {
  readonly code = 'BUSINESS_RULE_VIOLATION';

  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
  }
}
