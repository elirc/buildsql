## Hint 1

Two independent mechanisms sharing one function. De-duplication is per key: a
map from key to the promise in flight, cleared when it settles. The breaker is
global to the client: a consecutive-failure count and the moment it opened.

Write `state()` first. Everything else is a decision made from it.

## Hint 2

`state()` is derived, not stored. "Open" and "half-open" are the same fact —
`openedAt` is set — read through the injected clock: less than `cooldownMs` ago
is open, longer ago is half open. Storing a state string as well means two
sources of truth and a timer to keep them in step, which is the version that
goes wrong.

Clear the in-flight entry on **both** outcomes. Clearing it only on success
turns one transient failure into a rejection every caller shares for the rest of
the process.

## Hint 3

Half open needs a second flag. Letting every waiting caller through the instant
the cooldown expires is the thundering herd that knocks the recovering service
straight back over — one probe decides for everybody, and its success is what
resets the failure count.

The decision left to you is what "consecutive" should mean when several keys are
in flight at once: the reference counts failures across the whole client, which
is simple and occasionally unfair to a healthy key. A per-key breaker is a
defensible different answer, and an interviewer will ask which you chose.
