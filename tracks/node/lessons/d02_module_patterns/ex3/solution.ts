// d02_module_patterns / ex3 - configuration: defaults in, frozen out.
// See lessons/d02_module_patterns/README.md, "Problem 3".

export interface Limits {
  maxBodyBytes: number;
  timeoutMs: number;
}

export interface Config {
  port: number;
  host: string;
  limits: Limits;
  tags: string[];
}

export interface ConfigOverrides {
  port?: number;
  host?: string;
  limits?: Partial<Limits>;
  tags?: string[];
}

/**
 * The defaults, for reference:
 *   port 3000, host "0.0.0.0", limits { maxBodyBytes: 1_000_000,
 *   timeoutMs: 5_000 }, tags []
 *
 * `limits` merges key by key; `tags` is replaced wholesale. The result is
 * deeply frozen, and two calls share nothing.
 */
export function defineConfig(overrides: ConfigOverrides): Config {
  throw new Error("ex3: defineConfig() is not implemented yet - edit this file.");
}
