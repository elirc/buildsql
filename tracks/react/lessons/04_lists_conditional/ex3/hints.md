## Hint 1
Two independent conditions. One decides between a list and an empty state; the
other decides whether the unread badge exists at all. Handle them separately —
trying to express both in one piece of JSX is what makes conditional rendering
feel hard.

## Hint 2
For the whole-component case, an early return is clearest:

```tsx
if (messages.length === 0) {
  return …;
}
```

For the badge, `{condition && <span>…</span>}` renders the element when the
condition is true and nothing when it is false — because React skips `false`,
`null` and `undefined`.

## Hint 3
That word *skips* is doing a lot of work. React skips `false`, `null` and
`undefined` — it does **not** skip `0`, `""` or `NaN`, which are falsy in
JavaScript but perfectly renderable. So `{unreadCount && <span/>}` evaluates to
the number `0` when there is nothing unread, and React dutifully prints it. Make
the left-hand side an actual boolean and the problem disappears.
