export abstract class StringValueObject {
  readonly value: string;

  constructor(value: string) {
    this.value = value;
  }

  equals(other: StringValueObject): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
