// d08_literals_const_enums / ex7 - reference solution (author only).

export type Light = "red" | "green" | "amber";

export const NEXT: Record<Light, Light> = { red: "green", green: "amber", amber: "red" };

export function cycle(start: Light, steps: number): Light {
  const period = Object.keys(NEXT).length;
  let remaining = ((steps % period) + period) % period;
  let current = start;
  while (remaining > 0) {
    current = NEXT[current];
    remaining -= 1;
  }
  return current;
}
