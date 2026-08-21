// 07_generics_2 / ex3 - reference solution (author only).

export class Registry<T = string> {
  private readonly entries = new Map<string, T>();

  set(key: string, value: T): void {
    this.entries.set(key, value);
  }

  get(key: string): T | undefined {
    return this.entries.get(key);
  }

  has(key: string): boolean {
    return this.entries.has(key);
  }

  get size(): number {
    return this.entries.size;
  }
}
