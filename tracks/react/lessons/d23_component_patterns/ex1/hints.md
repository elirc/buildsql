## Hint 1

The gate writes a whole `<button>` inside the callout. A `text` prop can carry
a sentence and nothing else — no emphasis, no link, no button — which is why
`children` exists in the first place.

## Hint 2

Render the `children` where the text used to go, and drop the `text` prop
entirely. Keep `title` as a prop: it is one specific thing in one specific
place, which is exactly when a named slot beats children.
