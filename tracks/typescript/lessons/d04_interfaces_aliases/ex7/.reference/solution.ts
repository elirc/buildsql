// d04_interfaces_aliases / ex7 - reference solution (author only).

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
  new (startedAt: number): Clock;
}

export function runClock(ctor: ClockConstructor, startedAt: number, ticks: number): number {
  const clock = new ctor(startedAt);
  let last = startedAt;
  for (let i = 0; i < ticks; i += 1) {
    last = clock.tick();
  }
  return last;
}
