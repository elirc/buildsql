## Hint 1

Zod parses, it does not merely check: the value that comes out of `safeParse` is
whatever your schema built, and it does not have to have the type that went in.
`.transform(fn)` is the hinge — `z.string().transform((s) => new Date(s))` is a
schema whose input is a string and whose output is a `Date`.

`z.string()` also has `.trim()` and `.toLowerCase()` built in.

## Hint 2

A transform is the end of the line: nothing after it can constrain the result,
because zod no longer knows what it is. `.pipe(schema)` reopens the line by
feeding the transformed value into a second schema.

That is what makes the two hard cases work:

- tidy the address first, judge it second — `.trim().toLowerCase().pipe(z.string().email())`;
- build the date first, reject Invalid Date second — `.transform(...).pipe(z.date())`.

Without the second half, `new Date("the fourth of May")` sails through as an
Invalid Date and lands in your database as `null` or `NaN`, depending on the
driver. And note where `.default()` goes: it answers for a missing *input*, so
it belongs before the transform, not after it.
