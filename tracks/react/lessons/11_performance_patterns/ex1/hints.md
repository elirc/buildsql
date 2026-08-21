## Hint 1
By default, when a parent re-renders, React re-renders every child — it does
not compare props, because comparing is not free and is usually a waste. You
can opt one component into that comparison.

## Hint 2
`memo` wraps a component and returns a new one that skips rendering when its
props are shallowly equal to last time:

```tsx
export const ExpensiveRow = memo(function ExpensiveRow({ label, onRender }) {
  …
});
```

Naming the inner function is not required, but it is what shows up in stack
traces and the React DevTools, so it is worth the seven characters.

## Hint 3
"Shallowly equal" means each prop compared with `Object.is`. Strings and
numbers behave the way you expect; objects, arrays and functions are compared
by identity, so a prop rebuilt on every render defeats the whole thing. The gate
passes the same spy every time, which is why this one works — and exercise 2 is
what happens when it does not.
