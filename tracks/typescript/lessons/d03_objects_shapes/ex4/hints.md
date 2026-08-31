## Hint 1

Every hop that might be missing needs its own `?.`. `playlist.owner?.contact.email`
compiles and still throws, because the `?.` only guarded the first hop.

Trim before you decide: the prompt says a whitespace-only name is no name.

## Hint 2

`playlist.owner?.name?.trim()` gives you `string | undefined` in one expression -
`?.` on the string too, because `trim` cannot be called on `undefined`.

Then one truthiness check per half picks the fallback, and the return is a
single template literal with the angle brackets in it.

Left to you: two locals and a template literal, or one long expression. The
first is easier to read out loud, which matters more than it sounds.
