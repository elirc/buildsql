## Hint 1

Widen the parameter first, then notice what breaks. The moment `value` can be
three things, none of the three types' methods are available on it - because
the compiler will only offer what *every* member of the union has.

That is not an obstacle to work around. It is the feature, and the way through
it is to check.

## Hint 2

A union is written with `|`:

```ts
function example(value: string | number) { ... }
```

`typeof value === "string"` inside an `if` narrows `value` to `string` for the
rest of that block - and, if you return from the block, for everything after it
as well. That second half is why a series of guard clauses reads so well.

The number branch needs one decimal place; check the README for the exact
expected strings.

## Hint 3

Widen to `string | number | boolean`, then three branches: return the string
as-is, return `value.toFixed(1)` for numbers, and return `"yes"` or `"no"` for
the boolean.

Left to you: whether the last branch tests `typeof value === "boolean"` or
simply falls through as the only remaining possibility. Both work today. Only
one of them keeps working when a fourth member joins the union - and lesson
ex4 is about making the compiler tell you which.
