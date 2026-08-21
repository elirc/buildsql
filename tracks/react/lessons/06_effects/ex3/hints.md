## Hint 1
The key press can happen anywhere on the page, not just inside this component,
so a React `onKeyDown` prop will not see it. You need a real DOM listener on
`document` — which is outside React's tree, which means an effect.

## Hint 2
```tsx
useEffect(() => {
  function handleKeyDown(event: KeyboardEvent) { … }
  document.addEventListener("keydown", handleKeyDown);
  return () => { … };
}, [/* … */]);
```

Declare the handler *inside* the effect. `removeEventListener` only removes a
listener if you pass it the exact same function reference, and a handler
defined inside the effect is guaranteed to be the same one both times.

## Hint 3
`event.key` is the string `"Escape"` for that key — check it before calling
`onClose`, or every keystroke on the page closes the dialog. The dependency
array should list what the effect reads; think about what happens to the
subscription each time that value changes, and whether re-subscribing is a
problem or exactly right.
