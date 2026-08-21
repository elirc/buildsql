## Hint 1

Two loops, both constrained by `IComparable<T>`, both deciding something with
`CompareTo`.

The words in the prompt are load-bearing: "strictly greater" for the first,
"inclusive" for the second. Each one picks a different comparison operator
against the result of `CompareTo`.

## Hint 2

`x.CompareTo(y)` is negative when x sorts first, zero when they tie, positive
when x sorts last. So:

- strictly greater than the threshold: `item.CompareTo(threshold) > 0`
- at or above the low bound: `item.CompareTo(low) >= 0`

`FirstAbove` returns as soon as it finds one — no need to look at the rest —
and returns the fallback if the loop finishes.

## Hint 3

`CountBetween` needs both bounds true at once, which is one `if` with `&&`, not
two nested ones.

The decision left to you: whether to also guard against `low` being greater
than `high`. The gate never does that, so either behaviour passes — but think
about what your method would return, and whether silently returning 0 for an
impossible range is a kindness or a way to hide someone's bug.
