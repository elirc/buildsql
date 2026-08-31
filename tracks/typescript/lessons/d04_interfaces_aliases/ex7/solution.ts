// d04_interfaces_aliases / ex7 - the type of a class, not of an instance.
// See lessons/d04_interfaces_aliases/README.md, "ex7".
//
// ClockConstructor below describes an object with a `create` method. Rewrite it
// as a CONSTRUCT signature so a class can be passed directly.

export interface Clock {
  readonly startedAt: number;
  tick(): number;
}

export class StepClock implements Clock {
  readonly startedAt: number;
  private current: number;

  constructor(startedAt: number) {
    this.startedAt = startedAt;
    this.current = startedAt;
  }

  tick(): number {
    this.current += 1;
    return this.current;
  }
}

export interface ClockConstructor {
  create(startedAt: number): Clock;
}

export function runClock(ctor: ClockConstructor, startedAt: number, ticks: number): number {
  throw new Error("ex7: runClock() is not implemented yet - edit this file.");
}
