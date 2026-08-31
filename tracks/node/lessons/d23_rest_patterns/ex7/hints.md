## Hint 1

Two passes, and they must not be interleaved. Pass one decides whether the whole
batch can be applied; pass two applies it. As soon as you check-and-apply in one
loop, a failure at index 3 leaves the first three changes in place and the
client has no way to find out which.

## Hint 2

The identifier in a bulk failure is the **index**. Ids are absent on a create,
duplicated across operations, and meaningless for an unknown `op` — the position
in the array the client sent is the only thing that always identifies one
operation.

Pass two can be total: every operation has already been proved applicable, so
there is nothing left to check and nothing left to fail.

## Hint 3

The subtle half is what pass one checks *against*. Validating each operation
against the store as it is now lets a batch containing two deletes of the same
id through — both ids are present, both look fine — and then the second delete
finds nothing during pass two, half way through.

Walk the batch as if it were running: keep a `Set` of the ids that are live,
remove one when you pass a delete, add one when you pass a create. The gate
sends exactly that batch.

What to do about an update *after* a delete of the same id in one batch is left
to you: the same technique answers it, but whether it should be an error or a
resurrection is a product decision.
