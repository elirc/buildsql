## Hint 1

Three bodies: two of them are one line, and the middle one is a real
comparison.

Before you write anything, predict what `a == b` says about two baskets whose
lists hold the same strings but are different `List<string>` objects. Then
write `RecordSays` to report the truth rather than the answer you would like.

## Hint 2

A record's generated equality compares each member using *that member's* own
equality. `string` compares by value; `List<string>` does not — it inherits
reference equality from `object`.

So `SameContents` has to do the work itself: same owner, same count, same items
in the same order. A `for` loop over the indices is fine. If you want to
preview lesson 10, `a.Items.SequenceEqual(b.Items)` is the LINQ one-liner for
exactly this.

`Rename` is a `with` expression on `Owner`.

## Hint 3

The gate's last two lines are the ones to think hardest about. It renames a
basket, adds an item **through the copy**, and then asserts something about the
*original*.

`with` copies the record's members — and the member here is a reference. Both
records end up pointing at one list. If you want a genuinely independent copy
you have to say so: `basket with { Owner = newOwner, Items = new List<string>(basket.Items) }`.
The gate wants the shallow version, because seeing the shared list bite is the
point of the exercise.
