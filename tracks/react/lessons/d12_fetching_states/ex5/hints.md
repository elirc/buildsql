## Hint 1
The stub retries correctly - it asks again and it eventually shows the ticket.
What it never does is admit that the previous attempt is over. Ask yourself
which state belongs to *this* attempt and which is left over from the last one.

## Hint 2
Everything a request produces is scoped to that request, so the start of a new
one is the moment to clear it. Two lines at the top of the effect body, before
the call, and both the error and the stale result go away in the same commit.
