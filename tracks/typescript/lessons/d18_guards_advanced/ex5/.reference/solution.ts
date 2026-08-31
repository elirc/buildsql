// d18_guards_advanced / ex5 - reference solution (author only).

export type Task =
  | { kind: "email"; to: string }
  | { kind: "sms"; number: string }
  | { kind: "push"; token: string };

export function onlyKind<K extends Task["kind"]>(
  tasks: readonly Task[],
  kind: K,
): Extract<Task, { kind: K }>[] {
  return tasks.filter((task): task is Extract<Task, { kind: K }> => task.kind === kind);
}
