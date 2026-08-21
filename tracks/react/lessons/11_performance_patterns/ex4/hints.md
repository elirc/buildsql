## Hint 1
Ask who actually needs `note`. Two elements: the input and the `<output>` that
echoes it. `ExpensiveList` does not, and never will — yet it re-renders on every
keystroke, because a state change re-renders the component that owns the state
and everything below it.

## Hint 2
So move the state down to the smallest component that can hold it. Pull the
label, the input and the output into a component of their own, put the
`useState` in there, and let `Dashboard` render it as a sibling of the list.

```tsx
function NoteField() {
  const [note, setNote] = useState("");
  return ( … );
}
```

`Dashboard` then holds no state at all, so nothing makes it re-render.

## Hint 3
You could also have reached for `memo` on `ExpensiveList`, and the gate would
go green. Do it the structural way anyway, and notice what it costs: nothing.
No wrapper, no comparison on every render, no prop that has to stay stable
forever, nothing to break the day somebody passes an inline arrow. The remaining
question — worth answering before you move on — is when moving state down is
*not* available, and what you would do then.
