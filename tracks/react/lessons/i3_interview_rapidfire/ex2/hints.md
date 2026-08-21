## Hint 1
Say the lifecycle out loud before editing: subscribe when the component
appears, unsubscribe and resubscribe when the channel changes, unsubscribe when
it goes away — and do nothing at all when something unrelated re-renders. Three
of those four are currently wrong.

## Hint 2
The cleanup is the unsubscribe, and the dependency array is what stops the
effect running when only `label` changed:

```tsx
useEffect(() => {
  onSubscribe(channel);
  return () => { /* … */ };
}, [/* … */]);
```

## Hint 3
The gate checks *which* channel is unsubscribed when it changes, and expects the
old one — that falls out for free, because each cleanup closes over the same
`channel` its own effect run saw. List everything the effect and its cleanup
read between them; there are three, not one, and being able to justify the two
function props is the part an interviewer will push on.
