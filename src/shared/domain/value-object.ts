export abstract class ValueObject<T extends object> {
  protected abstract get props(): T;

  equals(other: ValueObject<T>): boolean {
    if (other === this) return true;
    if (!(other instanceof ValueObject)) return false;
    return this.deepEquals(this.props, other.props);
  }

  private deepEquals(a: unknown, b: unknown): boolean {
    if (a === b) return true;
    if (a === null || b === null) return false;
    if (a === undefined || b === undefined) return false;
    if (typeof a !== typeof b) return false;

    if (typeof a === 'object' && typeof b === 'object') {
      const keysA = Object.keys(a as Record<string, unknown>);
      const keysB = Object.keys(b as Record<string, unknown>);

      if (keysA.length !== keysB.length) return false;

      return keysA.every((key) =>
        this.deepEquals((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]),
      );
    }

    return false;
  }
}
