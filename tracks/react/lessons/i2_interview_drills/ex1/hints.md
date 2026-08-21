## Hint 1
Three requirements hide in the prompt: do not ask until the typing pauses, do
not ask at all for an empty box, and do not let an old answer overwrite a new
one. Work through them in that order and rerun the gate after each.

## Hint 2
The debounce is an effect whose cleanup cancels the pending timer:

```tsx
useEffect(() => {
  const timer = setTimeout(() => { /* … */ }, 300);
  return () => clearTimeout(timer);
}, [query, search]);
```

Because React runs the previous cleanup before the next effect, a keystroke
arriving inside the 300ms window cancels the request that was about to go out.

## Hint 3
For the empty box, return early from the effect before scheduling anything — and
clear the old results on the way past, or the last search's hits linger over an
empty field. For the stale answer, add the guard you have used since lesson 07:
a `let` inside the effect body, flipped by the cleanup, checked before you set
state. Say out loud why it cannot be a `useRef`.
