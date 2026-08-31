## Hint 1

Each of the four is exactly one LINQ call with a predicate. The whole exercise
is choosing which one, so read the summaries carefully - "throws when there is
more than one" names a specific operator.

The predicate itself needs care: `word[0]` on an empty string throws, so check
the length first.

## Hint 2

- `First(predicate)` - the first match, `InvalidOperationException` when none.
- `FirstOrDefault(predicate)` - the first match, `default(T)` when none.
- `FirstOrDefault(predicate, fallback)` - the two-argument overload, which
  saves you a null check at the call site.
- `Single(predicate)` - the one and only match; throws when there is none
  *and* when there are two.

`default(T)` is null for a string but **zero** for an int, which is why
`FirstOrDefault` over numbers cannot tell "no match" from "matched a zero" -
that is the case the fallback overload exists for.

Use `Single` when exactly one match is an assumption you want checked. It costs
an extra element read to prove the match was alone, and that cost is the point.
