## Hint 1
The stub already calls the setter twice and the counter still only moves by
one. That is not a bug in React. Ask what `count` is worth *inside* the
handler: it was captured when this render's JSX was created, and nothing that
happens during the handler changes it.

## Hint 2
So `setCount(count + 1)` twice is `setCount(0 + 1)` twice — the same
instruction, sent twice, with the second overwriting the first. What you want
to say is not "become 1" but "become one more than whatever you are about to
be".

## Hint 3
Every state setter accepts a function as well as a value. React calls it with
the latest queued state and uses the return value:

```tsx
setCount((previous) => previous + 1);
```

Replace both calls. Naming the parameter something other than `count` is not
required, but it makes it obvious you are not reading the outer variable.
