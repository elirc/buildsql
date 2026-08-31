## Hint 1

Two separate properties are being drilled here. One is that a collection
endpoint owes the client an order of its own, because the order a set
enumerates in is an implementation detail. The other is idempotence: the second
identical POST must report, not repeat.

## Hint 2

`ReturnsLog.Add` already tells you which case you are in - it returns `true`
the first time an id is seen and `false` for a repeat, so `alreadyReturned` is
that value negated and the count comes from `Snapshot().Length` afterwards
either way. `Shelved` sorts what `Snapshot()` gives it. Check
`D22Library.FindLoan(loanId)` first, before touching the log at all.
