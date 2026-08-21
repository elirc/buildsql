## Hint 1
Run the gate and read the sequence it describes. Two requests are in flight at
once, the second one answers first, and then the first one answers — and wins,
because it wrote to state last. Nothing about the code is wrong in isolation;
the problem is that a `.then` from an effect that has already been cleaned up
still runs.

## Hint 2
When the id changes, React runs the previous effect's cleanup before starting
the new one. That cleanup is your chance to mark the old request as no longer
interesting. A variable declared *inside the effect body* is perfect for this:
each run of the effect gets its own, and the cleanup closes over exactly the
one that belongs to it.

```tsx
useEffect(() => {
  let current = true;
  …
  return () => {
    current = false;
  };
}, [/* … */]);
```

## Hint 3
Check that flag in the `.then` before touching any state, and return early when
it is false. Note that this does not *cancel* the request — the promise still
settles and the network traffic still happened — it makes the answer
irrelevant. Cancelling for real needs `AbortController`, which is worth reading
about; deciding whether this component needs it is your call.
