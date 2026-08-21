// 04_events_errors / ex2 - reference solution (author only, used by `dojo verify`).

export interface Config {
  port: number;
  [key: string]: unknown;
}

export type ConfigCallback = (error: Error | null, config?: Config) => void;

function fail(code: string, message: string): Error {
  return Object.assign(new Error(message), { code });
}

export function parseConfig(text: string, callback: ConfigCallback): void {
  // Never call the callback synchronously: the caller has not finished
  // wiring up yet, and a sometimes-sync API is a race waiting to happen.
  process.nextTick(() => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (error) {
      callback(fail("EPARSE", `config is not valid JSON: ${(error as Error).message}`));
      return;
    }

    const config = parsed as Config;
    if (typeof config?.port !== "number") {
      callback(fail("EMISSING", 'config is missing a numeric "port"'));
      return;
    }
    callback(null, config);
  });
}
