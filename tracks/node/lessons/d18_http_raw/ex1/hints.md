## Hint 1

`req.headers.accept` is one string holding a comma-separated list, and each
entry may carry parameters after a semicolon. Parse it into
`{ type, quality }` pairs first; deciding what to send is easy once you have
that, and impossible while you are still doing `.includes("json")`.

## Hint 2

Score each thing you offer against the parsed list and keep the best. Three
patterns can match one offer — the exact type, `type/*`, and `*/*` — and the
score is the highest `q` among them.

Two details decide four of the assertions. Use a **strictly greater than**
comparison as you walk your offers, so a tie leaves your own first preference
in place. And start the running best at `0`, not at `-1`: `q=0` is the client
saying "not this one", so a type scoring zero must never be chosen, and if
nothing scores above zero the answer is 406.

`Vary: Accept` goes on the response before you know which branch you are taking,
because it is true of all of them.
