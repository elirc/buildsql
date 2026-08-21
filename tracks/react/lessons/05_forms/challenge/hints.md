## Hint 1
Ex4 collected problems into a flat list, which is fine when they are shown
together at the top. Here each message has to belong to a *field*, so the shape
of the error state changes: an object keyed by field name, holding one message
per broken field and nothing for the fields that are fine.

## Hint 2
Validation still lives in a plain function, now returning that object:

```tsx
type Errors = { street?: string; postcode?: string };
function validate(street: string, postcode: string): Errors { … }
```

`/^\d{4}$/.test(postcode)` is the four-digit check. The form submits only when
the object has no keys — `Object.keys(found).length === 0`.

## Hint 3
Each input then needs two attributes driven by that object: `aria-invalid`,
which must be `"false"` (not absent) when the field is fine, and
`aria-describedby` pointing at the id of the element rendering that field's
message — and pointing at nothing when there is no message. Rendering
`aria-describedby` as `undefined` omits the attribute entirely, which is what
you want. The remaining decisions are what element carries the message and
whether you also validate as the user types.
