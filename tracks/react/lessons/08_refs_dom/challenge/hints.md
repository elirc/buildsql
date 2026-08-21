## Hint 1
Forwarding the ref straight to the `<textarea>`, as you did in ex3, would give
the parent `focus()` — but not `clear()`, because clearing this editor means
changing React state, and the DOM node knows nothing about that. So the parent
should not receive the DOM node at all. It should receive an object you design.

## Hint 2
`useImperativeHandle(ref, () => ({ … }), [deps])` decides what `ref.current`
becomes:

```tsx
useImperativeHandle(ref, () => ({
  focus: () => { … },
  clear: () => { … },
}), []);
```

You will still want an internal ref pointing at the real `<textarea>`, because
`focus` has to reach it.

## Hint 3
`clear` calls the state setter; `focus` calls `.focus()` on the internal ref.
Two Editors are rendered and only one has a ref, so nothing here may reach for
anything global — `useId` is already in the stub for the same reason. The
remaining decision is the dependency array on `useImperativeHandle`, and it is
worth reasoning about rather than copying: what would change about the object
you are returning?
