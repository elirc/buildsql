## Hint 1

Write the union out first - eight string literals. Declaring it as `string`
means a typo compiles, which is what the type gate objects to.

Then remember the two holes: `typeof null` is `"object"` and `typeof []` is
`"object"`. Both need their own check, and both have to run *before* the
`typeof`.

## Hint 2

After `null` and arrays are out of the way, `typeof value` already returns six
of your eight labels. The two it can also return - `"bigint"` and `"symbol"` -
are not in the union, so decide where they go and say so in code.

Left to you: fold the two exotic cases into `"object"`, or widen the union. The
gate does not test them, and an interviewer will ask what you did.
