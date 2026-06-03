export abstract class Entity {
  abstract get id(): string;

  equals(other: Entity): boolean {
    if (other === this) return true;
    if (!(other instanceof Entity)) return false;
    return this.id === other.id;
  }
}
