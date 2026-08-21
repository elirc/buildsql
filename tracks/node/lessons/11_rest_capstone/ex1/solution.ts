// 11_rest_capstone / ex1 - the store.
// See lessons/11_rest_capstone/README.md, "Exercise 1".

export type TaskStatus = "todo" | "doing" | "done";

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
}

export interface TaskStore {
  list(filter?: { status?: TaskStatus }): Task[];
  get(id: string): Task | undefined;
  create(input: { title: string; status?: TaskStatus }): Task;
  update(id: string, patch: { title?: string; status?: TaskStatus }): Task | undefined;
  remove(id: string): boolean;
}

export function createTaskStore(seed: Task[] = []): TaskStore {
  throw new Error("ex1: createTaskStore() is not implemented yet - edit this file.");
}
