// 04_lists_conditional / challenge - grouping, ordering, and skipping.
// See tracks/react/lessons/04_lists_conditional/README.md, "Challenge".

type Status = "todo" | "doing" | "done";
type Task = { id: string; title: string; status: Status };

export const GROUPS: { status: Status; label: string }[] = [
  { status: "todo", label: "To do" },
  { status: "doing", label: "Doing" },
  { status: "done", label: "Done" },
];

export function GroupedTasks({ tasks }: { tasks: Task[] }) {
  return (
    <ul>
      {tasks.map((task) => (
        <li key={task.id}>{task.title}</li>
      ))}
    </ul>
  );
}
