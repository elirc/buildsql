## Hint 1
The hook returns a value that *lags* behind its argument. So there are two
values in play: the live one it is given, and the delayed one it hands back —
which means the delayed one is state.

## Hint 2
When the live value changes, start a timer that will copy it across:

```tsx
useEffect(() => {
  const id = setTimeout(() => setDebounced(value), delay);
  return () => { … };
}, [value, delay]);
```

## Hint 3
The cleanup is the entire debounce. Because React runs the previous cleanup
before the next effect, a value that changes again before the timer fires
cancels the pending `setTimeout` and schedules a new one — so only a pause
longer than `delay` ever lets a value through. Without `clearTimeout` you do not
have a debounce; you have every intermediate value arriving late, in order. The
last thing to decide is what the very first render should return.
