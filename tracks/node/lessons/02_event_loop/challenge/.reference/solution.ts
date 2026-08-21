// 02_event_loop / challenge - reference solution (author only, used by `dojo verify`).

export type TaskKind = "sync" | "nextTick" | "micro" | "timer";

export interface Task {
  kind: TaskKind;
  label: string;
  /** Scheduled, in order, at the moment this task runs. */
  spawns?: Task[];
}

export function predictTaskOrder(tasks: Task[]): string[] {
  const order: string[] = [];
  const ticks: Task[] = [];
  const micros: Task[] = [];
  const timers: Task[] = [];

  const run = (task: Task): void => {
    order.push(task.label);
    for (const child of task.spawns ?? []) schedule(child);
  };

  const schedule = (task: Task): void => {
    switch (task.kind) {
      case "sync":
        run(task);
        break;
      case "nextTick":
        ticks.push(task);
        break;
      case "micro":
        micros.push(task);
        break;
      case "timer":
        timers.push(task);
        break;
    }
  };

  const checkpoint = (): void => {
    while (ticks.length > 0 || micros.length > 0) {
      while (ticks.length > 0) run(ticks.shift() as Task);
      while (micros.length > 0) run(micros.shift() as Task);
    }
  };

  for (const task of tasks) schedule(task);
  checkpoint();

  while (timers.length > 0) {
    run(timers.shift() as Task);
    checkpoint();
  }

  return order;
}
