## Hint 1

Renaming happens in the key position, with `as` and a template literal. The
stub builds the right callbacks under the wrong names.

## Hint 2

Template literals need string keys, and `keyof T` may include numbers and
symbols - intersect it away: `[K in keyof T & string as `${K}Changed`]`. The
value stays `(value: T[K]) => void`.
