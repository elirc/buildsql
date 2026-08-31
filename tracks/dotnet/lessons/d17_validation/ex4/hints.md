## Hint 1

A missing or empty list is one error about the list, and there is nothing else
to say - return it on its own. Otherwise loop with an index, because the index
is what the keys are made of: `$"visits[{i}].petName"`.

## Hint 2

Inside the loop, the three checks are ex1's, verbatim, with interpolated keys.
Keep collecting into the same dictionary across all items - a batch with four
bad rows should report four bad rows.

## Hint 3

For the duplicate rule, keep a
`new HashSet<string>(StringComparer.OrdinalIgnoreCase)` and use its return
value: `if (!seen.Add(petName))` is true exactly on the LATER occurrence, which
is the one to blame. Only add names that passed the length check, so a blank
name does not also count as a duplicate of the next blank one.
