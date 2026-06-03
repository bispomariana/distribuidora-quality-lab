import { AggregateRoot, DomainEvent } from '@shared/domain';

class TestEvent implements DomainEvent {
  readonly occurredOn = new Date();
  readonly eventName = 'TestEvent';

  constructor(readonly payload: string) {}
}

class ConcreteAggregate extends AggregateRoot {
  constructor(private readonly _id: string) {
    super();
  }

  get id(): string {
    return this._id;
  }

  doSomething(payload: string): void {
    this.addDomainEvent(new TestEvent(payload));
  }
}

describe('AggregateRoot', () => {
  describe('domainEvents', () => {
    it('when created, then has no domain events', () => {
      const aggregate = new ConcreteAggregate('agg-1');

      const events = aggregate.getDomainEvents();

      expect(events).toHaveLength(0);
    });

    it('when action triggers event, then event is recorded', () => {
      const aggregate = new ConcreteAggregate('agg-1');

      aggregate.doSomething('test-payload');

      const events = aggregate.getDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0]!.eventName).toBe('TestEvent');
    });

    it('when multiple actions, then all events are recorded in order', () => {
      const aggregate = new ConcreteAggregate('agg-1');

      aggregate.doSomething('first');
      aggregate.doSomething('second');

      const events = aggregate.getDomainEvents();
      expect(events).toHaveLength(2);
    });

    it('when clearDomainEvents called, then events are emptied', () => {
      const aggregate = new ConcreteAggregate('agg-1');
      aggregate.doSomething('payload');

      aggregate.clearDomainEvents();

      expect(aggregate.getDomainEvents()).toHaveLength(0);
    });

    it('when getDomainEvents called, then returns a copy (not the internal array)', () => {
      const aggregate = new ConcreteAggregate('agg-1');
      aggregate.doSomething('payload');

      const events = aggregate.getDomainEvents();
      aggregate.clearDomainEvents();

      expect(events).toHaveLength(1);
      expect(aggregate.getDomainEvents()).toHaveLength(0);
    });
  });

  describe('equals (inherited from Entity)', () => {
    it('when same id, then returns true', () => {
      const aggA = new ConcreteAggregate('agg-1');
      const aggB = new ConcreteAggregate('agg-1');

      expect(aggA.equals(aggB)).toBe(true);
    });

    it('when different id, then returns false', () => {
      const aggA = new ConcreteAggregate('agg-1');
      const aggB = new ConcreteAggregate('agg-2');

      expect(aggA.equals(aggB)).toBe(false);
    });
  });
});
