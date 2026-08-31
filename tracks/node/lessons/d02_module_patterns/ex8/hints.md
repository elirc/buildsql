## Hint 1

This is a topological sort, and the readable version is Kahn's algorithm: keep
a map from each name to the set of names still blocking it, repeatedly take a
name with nothing blocking it, and remove it from everybody else's set.

Validate the `after` names against the full set of plugin names **before** the
loop starts, or a typo turns into a phantom cycle instead of the message the
gate asks for.

## Hint 2

The determinism requirement lands in one place: at each step there may be
several unblocked names, and you must take the alphabetically first. Collect the
candidates, sort, take one — not all of them at once, because removing one can
unblock another that sorts earlier than the rest of the batch.

## Hint 3

The cycle case is what is left when a pass finds **no** unblocked name and the
map is not yet empty. Everything still in the map is stuck, and the message
wants those names sorted — which is why deleting resolved names from the map as
you go matters: it is what keeps `z` out of the cycle report.

The remaining decision is whether you sort the candidate list every pass or keep
a sorted structure; both pass, and only one of them is worth defending in an
interview for a graph of ten plugins.
