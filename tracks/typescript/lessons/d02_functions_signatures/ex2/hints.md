## Hint 1

`...segments: string[]` collects every argument into one array, and calling the
function with no arguments at all is legal - it just gives you an empty array.
So no implementation may read `segments[0]` before checking the length, and
none needs to: `[].join("/")` is already `""`.

## Hint 2

Do the cleaning before the joining. Each segment loses its leading and trailing
slashes, and a segment that is empty afterwards never reaches the join - which
is what stops `"books" + "" + "dune"` becoming `"books//dune"`.

`segment.replace(/^\/+/, "").replace(/\/+$/, "")` strips both ends.

Left to you: a loop with a guard, or `.map(...).filter(...)`. Both are fine;
say which you find easier to read out loud.
