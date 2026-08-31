## Hint 1

Five operators, one each. Four of them are named after set operations and
behave like sets - they de-duplicate. The fifth does not, and knowing which is
the exercise.

`Zip` is the odd one out entirely: it pairs by *position*, not by value.

## Hint 2

- `Zip(second, resultSelector)` - lockstep, stops at the shorter side, never
  throws and never pads.
- `Intersect(second)` - in both, once each.
- `Except(second)` - in the first and not the second, once each, one-sided.
- `Union(second)` - in either, once each.
- `Concat(second)` - everything, duplicates and all.

The distinction the gate leans on hardest is the last two. `Union` is `Concat`
followed by `Distinct`, so using it where you meant `Concat` silently deletes
real rows and looks like nothing happened at all.

`Except` being one-sided is the other one worth remembering: to find what is
only in the second sequence you call it again with the arguments swapped.
