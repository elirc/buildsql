// d08_literals_const_enums / ex5 - reference solution (author only).

export const PRICES = { standard: 500, express: 1200, overnight: 2500 } as const;

export type Speed = keyof typeof PRICES;

export function priceOf(speed: Speed): number {
  return PRICES[speed];
}

export function cheapest(): Speed {
  let best: Speed = "standard";
  for (const speed of Object.keys(PRICES) as Speed[]) {
    if (PRICES[speed] < PRICES[best]) {
      best = speed;
    }
  }
  return best;
}
