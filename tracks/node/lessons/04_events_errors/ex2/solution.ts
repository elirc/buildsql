// 04_events_errors / ex2 - the error-first convention, from the producing side.
// See lessons/04_events_errors/README.md, "Exercise 2".

export interface Config {
  port: number;
  [key: string]: unknown;
}

export type ConfigCallback = (error: Error | null, config?: Config) => void;

export function parseConfig(text: string, callback: ConfigCallback): void {
  throw new Error("ex2: parseConfig() is not implemented yet - edit this file.");
}
