## Hint 1

Both `any`s have to go, and for different reasons. The parameter should be
`unknown` because the caller may pass anything; the *return* should be `unknown`
because you genuinely do not know what is stored at that key, and saying `any`
would hand the caller a silent hole.

## Hint 2

The object check is the same two-part test as ever - `typeof source ===
"object"` and `source !== null` - because `typeof null` lies.

Reading a computed key off an unknown object needs one narrow cast:
`(source as Record<string, unknown>)[key]`. That cast is true immediately after
the two checks, which is exactly the point at which a cast is defensible.

## Hint 3

`safeGet(source: unknown, key: string): unknown`, returning `undefined` for
anything that is not a non-null object, and the looked-up value otherwise.

Left to you: whether a missing key and a key holding `undefined` should be
distinguishable. They are not here - and `key in source` is the check that would
tell them apart, if a caller ever needed it.
