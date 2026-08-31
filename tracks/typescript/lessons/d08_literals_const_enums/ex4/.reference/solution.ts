// d08_literals_const_enums / ex4 - reference solution (author only).

export enum Level {
  Debug = 10,
  Info = 20,
  Warn = 30,
  Error = 40,
}

export function atLeast(level: Level, min: Level): boolean {
  return level >= min;
}

export function nameOf(level: Level): string {
  return Level[level];
}
