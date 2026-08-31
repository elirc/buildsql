// d24_mixed_gauntlet / ex1 - filesystem + paths + a config nobody can edit.
// See lessons/d24_mixed_gauntlet/README.md, "Problem 1".

export type Config = Record<string, unknown>;

export interface LoadOptions {
  /** Reads `config.<env>.json` over the base when the file exists. */
  env?: string;
}

/**
 * `config.json` from `dir`, deep-merged under an optional `config.<env>.json`
 * overlay and deeply frozen. A missing base file, or one that will not parse,
 * rejects with a message naming the file.
 */
export async function loadConfig(dir: string, options?: LoadOptions): Promise<Readonly<Config>> {
  throw new Error("ex1: loadConfig() is not implemented yet - edit this file.");
}
