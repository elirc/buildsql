// d06_narrowing_guards / ex7 - reference solution (author only).

export interface Config {
  host: string;
  port: number;
  tls: boolean;
}

export function readConfig(raw: unknown): Config {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    throw new Error("config: expected an object");
  }
  const record = raw as Record<string, unknown>;

  const host = record.host;
  if (typeof host !== "string" || host.trim() === "") {
    throw new Error("config: host must be a non-empty string");
  }

  const port = record.port;
  if (typeof port !== "number" || !Number.isInteger(port) || port < 1) {
    throw new Error("config: port must be a positive integer");
  }

  const tls = record.tls;
  if (typeof tls !== "boolean") {
    throw new Error("config: tls must be a boolean");
  }

  return { host: host.trim(), port, tls };
}
