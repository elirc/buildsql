## Hint 1
`useReducer` is `useState`'s bigger sibling: instead of a value and a setter you
get a value and a `dispatch`, and every change goes through the reducer that is
already written at the top of the file.

```tsx
const [state, dispatch] = useReducer(tasksReducer, initialTasks);
```

The draft text in the box stays ordinary `useState` — it is not part of the task
list, and it is not something the reducer should know about.

## Hint 2
Handlers no longer compute the next state; they *describe what happened*:

```tsx
dispatch({ type: "added", text: draft });
dispatch({ type: "toggled", id: task.id });
```

Each task needs a checkbox joined to a label whose text is the task, so the gate
(and a screen reader) can find it by name — `id={`task-${task.id}`}` and a
matching `htmlFor`.

## Hint 3
The summary is not state. Count the done tasks during render from the list you
already have — storing a `doneCount` gives you two things that have to agree and
eventually will not. Two smaller decisions are left to you: clearing the draft
after adding, and what should happen when somebody clicks Add with an empty box.
