## Hint 1

Two utilities, read outside-in: `Readonly<Omit<Posting, "internalNotes" |
"recruiterEmail">>`. `Omit` removes the members from the type; `Readonly` stops
the caller writing to what is left.

## Hint 2

`Omit` changes the type; it does not change the value. Removing the members from
the object is a separate job, and destructuring does it in one line:

```ts
const { internalNotes, recruiterEmail, ...rest } = posting;
```

Setting them to `undefined` instead would leave the keys in place for
`JSON.stringify`, which is exactly the leak this function exists to prevent -
and the gate checks with `in`.

Left to you: filter first and strip second, or the other way round. Same output;
one of them does less work on the postings nobody will ever see.
