// i2_interview_drills / ex2 - reference solution (author only).

export interface EventMap {
  pass: { exercise: string };
  fail: { exercise: string; message: string };
}

type Handler<K extends keyof EventMap> = (payload: EventMap[K]) => void;

export class Emitter {
  private readonly handlers = new Map<keyof EventMap, Set<(payload: never) => void>>();

  on<K extends keyof EventMap>(event: K, handler: Handler<K>): () => void {
    let set = this.handlers.get(event);
    if (set === undefined) {
      set = new Set();
      this.handlers.set(event, set);
    }
    set.add(handler as (payload: never) => void);
    return () => {
      set?.delete(handler as (payload: never) => void);
    };
  }

  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
    const set = this.handlers.get(event);
    if (set === undefined) {
      return;
    }
    for (const handler of [...set]) {
      (handler as (payload: EventMap[K]) => void)(payload);
    }
  }
}
