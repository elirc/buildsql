## Hint 1
A plain `let count = 0` inside the component does not survive: React calls the
function again on every render and the variable is created from scratch. You
need a value React holds on to *between* renders, and a way to tell React the
value changed so it re-renders.

## Hint 2
```tsx
const [count, setCount] = useState(0);
```

`useState` returns a pair: the value for this render, and a setter. Call the
setter from an event handler and React schedules a re-render with the new
value. Never assign to `count` directly — it is a `const` for a reason.

## Hint 3
Wire the setter to the button's `onClick`. `onClick` wants a function, so
`onClick={setCount(count + 1)}` is wrong twice over — it runs during render and
hands React a return value. Wrap it: `onClick={() => …}`. The `<output>`
element already in the stub gives you the `status` role for free; it just needs
the real value interpolated into it.
