## Hint 1

Two "nothing to add" cases that must behave identically: no `params` argument at
all, and a `params` object with no keys. Collapse them by defaulting to `{}` and
then asking how many entries there are.

## Hint 2

`Object.entries(params ?? {})` gives you `[key, value]` pairs; sort them by key
so the output is deterministic, then `encodeURIComponent` **both** halves and
join with `&`.

`String(value)` before encoding is what makes numbers and booleans work without
a branch - and note that `false` and `0` must survive, so never filter the
entries on truthiness.

Left to you: `.sort()` on the entries or `Object.keys(...).sort()` first. The
comparator matters either way - the default sort is lexicographic, which is
what you want here, but say so rather than getting it by accident.
