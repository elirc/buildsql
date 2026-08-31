// d24_mixed_gauntlet / ex7 - reference solution (author only, used by `dojo verify`).

export class CircuitOpenError extends Error {
  constructor(message = "circuit is open") {
    super(message);
    this.name = "CircuitOpenError";
  }
}

export interface ClientOptions<T> {
  call: (key: string) => Promise<T>;
  failureThreshold: number;
  cooldownMs: number;
  now: () => number;
}

export interface ResilientClient<T> {
  get(key: string): Promise<T>;
  state(): "closed" | "open" | "half-open";
}

export function createResilientClient<T>(options: ClientOptions<T>): ResilientClient<T> {
  //: key -> the flight every caller for that key is sharing
  const inFlight = new Map<string, Promise<T>>();
  let failures = 0;
  let openedAt: number | null = null;
  let probing = false;

  const state = (): "closed" | "open" | "half-open" => {
    if (openedAt === null) return "closed";
    return options.now() - openedAt >= options.cooldownMs ? "half-open" : "open";
  };

  const get = (key: string): Promise<T> => {
    const existing = inFlight.get(key);
    if (existing !== undefined) return existing;

    const current = state();
    if (current === "open") return Promise.reject(new CircuitOpenError());
    if (current === "half-open") {
      // Exactly one probe: the rest keep failing fast until it has answered.
      if (probing) return Promise.reject(new CircuitOpenError());
      probing = true;
    }

    const flight = options
      .call(key)
      .then(
        (value) => {
          failures = 0;
          openedAt = null;
          probing = false;
          return value;
        },
        (error: unknown) => {
          probing = false;
          failures += 1;
          // Reaching the threshold opens it; a failed probe re-opens it and
          // restarts the cooldown from now.
          if (failures >= options.failureThreshold || openedAt !== null) {
            openedAt = options.now();
          }
          throw error;
        },
      )
      .finally(() => {
        inFlight.delete(key);
      });

    inFlight.set(key, flight);
    return flight;
  };

  return { get, state };
}
