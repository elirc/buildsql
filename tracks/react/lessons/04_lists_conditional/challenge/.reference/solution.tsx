// 04_lists_conditional / challenge - reference solution.

type Status = "todo" | "doing" | "done";
type Task = { id: string; title: string; status: Status };

export const GROUPS: { status: Status; label: string }[] = [
  { status: "todo", label: "To do" },
  { status: "doing", label: "Doing" },
  { status: "done", label: "Done" },
];

export function GroupedTasks({ tasks }: { tasks: Task[] }) {
  return (
    <>
      {GROUPS.map(({ status, label }) => {
        const inGroup = tasks
          .filter((task) => task.status === status)
          .sort((a, b) => a.title.localeCompare(b.title));

        if (inGroup.length === 0) {
          return null;
        }

        return (
          <section key={status}>
            <h3>{label}</h3>
            <ul>
              {inGroup.map((task) => (
                <li key={task.id}>{task.title}</li>
              ))}
            </ul>
          </section>
        );
      })}
    </>
  );
}
