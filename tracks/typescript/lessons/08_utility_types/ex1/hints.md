## Hint 1

One word in the signature is wrong, and one rule in the body is easy to miss.

The signature: a patch is a *subset* of the object's properties, and the
standard library has a type that turns every member of a type optional.

The rule: a patch key whose value is `undefined` means "I have nothing to say
about this", not "set it to undefined". The gate checks that.

## Hint 2

`Partial<T>` is the utility type you want - `Partial<{ a: number }>` is
`{ a?: number }`.

For the body, `Object.entries(patch)` gives you `[key, value]` pairs at
runtime, and spreading `base` first gives you a copy to write into. Skip any
pair whose value is `undefined`.

You will need one cast to write into the copy by a computed key: TypeScript
cannot prove that a `string` from `Object.entries` is a key of `T`. Casting the
*target* to `Record<string, unknown>` is the least dishonest way to say it.

## Hint 3

Change the second parameter to `Partial<T>`, copy `base` with a spread, loop
over `Object.entries(patch)`, skip `undefined` values, and assign the rest.

Left to you: whether to write this as `{ ...base, ...patch }` instead. It is one
line and it is *almost* right - work out exactly which of the gate's cases it
fails, and you will understand why `Partial<T>` and `undefined` are an awkward
pair.
