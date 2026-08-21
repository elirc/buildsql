## Hint 1
Three separate things are being asked for: what a sighted user *sees* (the
glyph), what a screen-reader user *hears* (the label), and what happens when
either of them activates the control (`onPress`). The first is the button's
children; the other two are attributes.

## Hint 2
In JSX, an attribute whose value is in braces takes any expression, including
a prop or a function:

```tsx
<button type="button" aria-label={/* … */} onClick={/* … */}>
  {/* … */}
</button>
```

`onClick` wants the function itself, not a call to it — `onClick={onPress()}`
would run `onPress` while the component renders and hand React the result.

## Hint 3
`aria-label` overrides the visible content when a screen reader computes the
accessible name, which is exactly why the gate can check both independently.
The last decision left is what goes between the tags — and it is one of the
three props, unchanged.
