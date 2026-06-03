import { Entity } from '@shared/domain';

class ConcreteEntityA extends Entity {
  constructor(private readonly _id: string) {
    super();
  }

  get id(): string {
    return this._id;
  }
}

class ConcreteEntityB extends Entity {
  constructor(private readonly _id: string) {
    super();
  }

  get id(): string {
    return this._id;
  }
}

describe('Entity', () => {
  describe('equals', () => {
    it('when same instance, then returns true', () => {
      const entity = new ConcreteEntityA('id-1');

      const result = entity.equals(entity);

      expect(result).toBe(true);
    });

    it('when same id and same type, then returns true', () => {
      const entityA = new ConcreteEntityA('id-1');
      const entityB = new ConcreteEntityA('id-1');

      const result = entityA.equals(entityB);

      expect(result).toBe(true);
    });

    it('when different id, then returns false', () => {
      const entityA = new ConcreteEntityA('id-1');
      const entityB = new ConcreteEntityA('id-2');

      const result = entityA.equals(entityB);

      expect(result).toBe(false);
    });

    it('when same id but different type, then returns true (identity-based)', () => {
      const entityA = new ConcreteEntityA('id-1');
      const entityB = new ConcreteEntityB('id-1');

      const result = entityA.equals(entityB);

      expect(result).toBe(true);
    });
  });
});
