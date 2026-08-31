// d24_mixed_gauntlet / ex1 - reference solution (author only, used by `dojo verify`).
import { readFile } from "node:fs/promises";
import path from "node:path";

export type Config = Record<string, unknown>;

export interface LoadOptions {
  env?: string;
}

function isPlainObject(value: unknown): value is Config {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Objects merge key by key; anything else - arrays included - is replaced. */
function merge(base: Config, overlay: Config): Config {
  const merged: Config = { ...base };
  for (const [key, value] of Object.entries(overlay)) {
    const previous = merged[key];
    merged[key] =
      isPlainObject(previous) && isPlainObject(value) ? merge(previous, value) : value;
  }
  return merged;
}

function deepFreeze<T>(value: T): T {
  if (isPlainObject(value) || Array.isArray(value)) {
    for (const member of Object.values(value as object)) deepFreeze(member);
    Object.freeze(value);
  }
  return value;
}

/** The parsed file, or null when it is simply not there. */
async function readJsonFile(file: string): Promise<Config | null> {
  let text: string;
  try {
    text = await readFile(file, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
  try {
    return JSON.parse(text) as Config;
  } catch {
    throw new Error(`invalid JSON in ${path.basename(file)}`);
  }
}

export async function loadConfig(dir: string, options: LoadOptions = {}): Promise<Readonly<Config>> {
  const base = await readJsonFile(path.join(dir, "config.json"));
  if (base === null) throw new Error("missing config.json");

  let merged = base;
  if (options.env !== undefined) {
    const overlay = await readJsonFile(path.join(dir, `config.${options.env}.json`));
    if (overlay !== null) merged = merge(base, overlay);
  }

  return deepFreeze(merged);
}
