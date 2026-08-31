// d20_satisfies_asconst / ex3 - reference solution (author only).

export const PALETTE = {
  primary: "#0055ff",
  danger: "#ff0033",
  muted: "#8899aa",
} satisfies Record<string, `#${string}`>;
