// d22_declaration_files / ex6 - reference solution (author only).

export enum Level {
  Debug = 10,
  Info = 20,
  Error = 40,
}

export namespace Level {
  export function isAtLeast(value: Level, minimum: Level): boolean {
    return value >= minimum;
  }

  export function parse(name: string): Level | undefined {
    const found: unknown = (Level as unknown as Record<string, unknown>)[name];
    return typeof found === "number" ? (found as Level) : undefined;
  }
}
