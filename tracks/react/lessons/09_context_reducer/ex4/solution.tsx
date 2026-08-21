// 09_context_reducer / ex4 - useReducer inside a component.
// See tracks/react/lessons/09_context_reducer/README.md, "Exercise 4".
//
// The reducer below is written for you. Your job is the component: hold this
// state with useReducer, dispatch from the handlers, and derive the summary.
import { useState } from "react";

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
  const [draft, setDraft] = useState("");

  return (
    <>
      <label htmlFor="new-task">New task</label>
      <input id="new-task" value={draft} onChange={(event) => setDraft(event.target.value)} />
      <button type="button">Add</button>

      <ul />

      <p role="status">0 of 0 done</p>
    </>
  );
}
