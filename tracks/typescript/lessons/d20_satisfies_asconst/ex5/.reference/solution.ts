// d20_satisfies_asconst / ex5 - reference solution (author only).

export interface Settings {
  mode: "strict" | "lenient";
  retries: number;
  tags: readonly string[];
}

export const CONFIG = {
  mode: "strict",
  retries: 3,
  tags: ["core"],
} satisfies Settings;
