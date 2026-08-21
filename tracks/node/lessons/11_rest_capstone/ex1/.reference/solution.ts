// 11_rest_capstone / ex1 - reference solution (author only, used by `dojo verify`).

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

const copy = (task: Task): Task => ({ ...task });

export function createTaskStore(seed: Task[] = []): TaskStore {
  const tasks: Task[] = seed.map(copy);
  let nextId = 1;

  return {
    list(filter) {
      const matching = filter?.status
        ? tasks.filter((task) => task.status === filter.status)
        : tasks;
      return matching.map(copy);
    },

    get(id) {
      const found = tasks.find((task) => task.id === id);
      return found === undefined ? undefined : copy(found);
    },

    create(input) {
      const task: Task = {
        id: `task-${nextId}`,
        title: input.title,
        status: input.status ?? "todo",
      };
      nextId += 1;
      tasks.push(task);
      return copy(task);
    },

    update(id, patch) {
      const found = tasks.find((task) => task.id === id);
      if (found === undefined) return undefined;
      if (patch.title !== undefined) found.title = patch.title;
      if (patch.status !== undefined) found.status = patch.status;
      return copy(found);
    },

    remove(id) {
      const index = tasks.findIndex((task) => task.id === id);
      if (index === -1) return false;
      tasks.splice(index, 1);
      return true;
    },
  };
}
