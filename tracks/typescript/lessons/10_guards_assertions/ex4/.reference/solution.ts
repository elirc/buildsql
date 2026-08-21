// 10_guards_assertions / ex4 - reference solution (author only).

export type Setting = string | number | boolean;

export const settings = {
  label: "nightly",
  retries: 3,
  verbose: true,
} satisfies Record<string, Setting>;

export function describeSettings(): string {
  const suffix = settings.verbose ? " (verbose)" : "";
  return `${settings.label.toUpperCase()} x${settings.retries}${suffix}`;
}
