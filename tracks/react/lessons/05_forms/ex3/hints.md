## Hint 1
One handler serves both inputs, so it has to work out *which* field fired.
Every event carries the element that produced it as `event.target`, and each of
these inputs already has a `name` attribute — that is the connection.

## Hint 2
The other half is that state objects are replaced, not edited. Writing
`setForm({ email: value })` produces an object with no `name` key at all, which
is why the first field goes blank. Copy what was there and override one key:

```tsx
setForm((previous) => ({ ...previous, /* … */ }));
```

Note the parentheses around the object literal — without them the arrow
function body is read as a block.

## Hint 3
A computed key lets you name the property at runtime:
`{ ...previous, [someString]: value }`. Pull both `name` and `value` off
`event.target` first; that leaves you one decision, which is whether to reach
for the updater form here and why it matters when two changes land in the same
batch.
