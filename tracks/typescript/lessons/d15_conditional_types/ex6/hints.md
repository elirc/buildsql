## Hint 1

`never` is the union with no members. A distributive conditional evaluates its
body once per member - so how many times does it run, and what does it union
together afterwards?

## Hint 2

You already switched distribution off in ex3. The same wrapper works here, and
this is the exercise that explains why anyone ever needed it.

Left to you: nothing about the shape, but do check `IsNever<never | string>`
by hand. `never | string` simplifies before your type ever sees it.
