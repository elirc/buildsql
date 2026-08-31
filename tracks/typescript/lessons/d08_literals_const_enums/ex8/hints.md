## Hint 1

Three declarations to fix: `Weekday` with its five literals, `Weekend` with its
two, and `isWeekend` as a **type predicate** (`day is Weekend`) rather than a
plain boolean.

That predicate is what makes the `else` branch a `Weekday`, which is what lets
`nextWorkday` promise a `Weekday` without a cast.

## Hint 2

One ordered array of seven days serves all three functions.

`shiftDay` needs the same double-modulo as ex7 - `((i + by) % 7 + 7) % 7` - so
that `-8` behaves.

`nextWorkday` steps forward one day at a time and returns from inside the
narrowed branch: `if (!isWeekend(candidate)) return candidate;`.

Left to you: the loop, or arithmetic that jumps straight past the weekend. The
arithmetic is two lines and much easier to get subtly wrong.
