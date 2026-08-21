## Hint 1
The code you have to write is three lines long and completely unsurprising.
The interesting part is the second assertion: the gate counts renders and
insists there is exactly *one* extra render for the three updates. Write the
obvious thing first and then look at whether it passed.

## Hint 2
Three setters, three calls, inside the one handler:

```tsx
function handleClick() {
  setA(/* … */);
  …
}
```

Use the updater form out of habit. It is not strictly required here — each
counter is only written once per click — but it never hurts and it will matter
the moment someone adds a second write.

## Hint 3
If the render count surprised you, the thing to know is that React does not
re-render between the setter calls. It collects every update produced by one
event and applies them in a single pass, then renders once. That is *batching*,
and since React 18 it applies to updates from promises, timeouts and native
handlers too — not just React events.
