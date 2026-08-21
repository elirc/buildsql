## Hint 1
`document.title` is not part of React's tree, so setting it is a *side effect* —
something that reaches outside the component. Side effects do not belong in the
render body; they belong in `useEffect`, which React runs after the DOM has
been updated.

## Hint 2
```tsx
useEffect(() => {
  // set it
  return () => {
    // put it back
  };
}, [/* what this effect reads */]);
```

Three parts, all required here: the body, the cleanup it returns, and the
dependency list saying when to run again.

## Hint 3
The cleanup has to restore *the title as it was before this effect ran*, so
capture it inside the effect body before overwriting — a `const` at the top of
the effect closes over exactly the right value, because each run of the effect
gets its own. The remaining decision is the dependency array; the gate
re-renders with a new title and expects the document to follow.
