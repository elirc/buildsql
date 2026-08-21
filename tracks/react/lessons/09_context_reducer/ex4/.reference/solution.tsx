// 09_context_reducer / ex4 - reference solution.
import { useReducer, useState } from "react";

export type Task = { id: number; text: string; done: boolean };
export type TaskState = { tasks: Task[]; nextId: number };
export type TaskAction = { type: "added"; text: string } | { type: "toggled"; id: number };

export const initialTasks: TaskState = { tasks: [], nextId: 1 };

export function tasksReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case "added":
      return {
        tasks: [...state.tasks, { id: state.nextId, text: action.text, done: false }],
        nextId: state.nextId + 1,
      };
    case "toggled":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.id ? { ...task, done: !task.done } : task,
        ),
      };
    default:
      return state;
  }
}

export function TaskList() {
  const [state, dispatch] = useReducer(tasksReducer, initialTasks);
  const [draft, setDraft] = useState("");

  const done = state.tasks.filter((task) => task.done).length;

  function add() {
    if (draft.trim() === "") {
      return;
    }
    dispatch({ type: "added", text: draft });
    setDraft("");
  }

  return (
    <>
      <label htmlFor="new-task">New task</label>
      <input id="new-task" value={draft} onChange={(event) => setDraft(event.target.value)} />
      <button type="button" onClick={add}>
        Add
      </button>

      <ul>
        {state.tasks.map((task) => (
          <li key={task.id}>
            <input
              id={`task-${task.id}`}
              type="checkbox"
              checked={task.done}
              onChange={() => dispatch({ type: "toggled", id: task.id })}
            />
            <label htmlFor={`task-${task.id}`}>{task.text}</label>
          </li>
        ))}
      </ul>

      <p role="status">
        {done} of {state.tasks.length} done
      </p>
    </>
  );
}
