// d02_module_patterns / ex3 - reference solution (author only, used by `dojo verify`).

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

// A *function*, not a constant. A shared constant would hand every caller the
// same nested objects, and the first freeze would freeze them for everybody.
function defaults(): Config {
  return {
    port: 3_000,
    host: "0.0.0.0",
    limits: { maxBodyBytes: 1_000_000, timeoutMs: 5_000 },
    tags: [],
  };
}

export function defineConfig(overrides: ConfigOverrides): Config {
  const base = defaults();
  const config: Config = {
    ...base,
    ...overrides,
    limits: { ...base.limits, ...overrides.limits },
    tags: [...(overrides.tags ?? base.tags)],
  };

  Object.freeze(config.limits);
  Object.freeze(config.tags);
  return Object.freeze(config);
}
