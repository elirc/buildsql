## Hint 1
Validation is a pure function of the two values, so write it outside the
component and have it return an object keyed by field name. That keeps the
component to three jobs: run it, decide whether to show the results, and decide
whether to submit.

## Hint 2
The timing requirement is the interesting one. Errors must not appear before the
first submit, and after that they must clear *as the user types*. One extra
boolean gets you both:

```tsx
const errors = validate(displayName, email);      // recomputed every render
const shown = attempted ? errors : {};
```

Because `errors` is derived rather than stored, it is never stale.

## Hint 3
Each input then needs `aria-invalid` — which must be `"false"`, not absent, when
the field is fine — and `aria-describedby` pointing at the id of that field's
message, or nothing when there is no message. Rendering `aria-describedby` as
`undefined` omits the attribute. The judgement call worth naming out loud: is
per-field wiring enough, or would you also add a summary at the top, and where
should focus go after a failed submit?
