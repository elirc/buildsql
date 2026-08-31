## Hint 1

The `?` on the parameter is only half the job. Inside the body the author is
`string | undefined`, and the prompt says three different values all mean "no
author": `undefined`, `""` and `"   "`.

## Hint 2

Collapse all three into one question by trimming first:
`const trimmed = (author ?? "").trim();`. Now a single emptiness check decides
which of the two strings you return.

Left to you: `??` before the trim, or optional chaining (`author?.trim() ?? ""`)
after it. They read differently and mean the same thing here.
