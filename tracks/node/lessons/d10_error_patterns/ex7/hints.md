## Hint 1

A depth-first walk with a `Set` of visited errors. Write the "what is below
this error" helper first, on its own: an `AggregateError` contributes every
`Error` in its `errors` array, and *any* error contributes its `cause` when the
cause is an `Error`.

Note that both can apply to the same node — an `AggregateError` is allowed to
have a cause as well.

## Hint 2

The visit is: if already seen, stop; mark it seen; ask what is below it; if
nothing, record it as a leaf; otherwise recurse.

The `Set` does double duty. It deduplicates — one underlying failure commonly
appears in several branches of a fan-out — and it is the loop guard.

## Hint 3

The cycle case needs one extra thought, and it is the interesting one.

If you recurse into links you have already seen, the recursion terminates but
the node that closed the loop is left with children and therefore never counts
as a leaf — so a two-error cycle reports **nothing at all**, which is a useless
answer.

Filter the links to the *unvisited* ones first, then ask whether any remain. An
error whose only link points back at something already visited has nothing new
underneath it, so it is the bottom of that branch. Order the recursion so the
result is first-seen order, and remember the non-Error input returns an empty
array rather than throwing.
