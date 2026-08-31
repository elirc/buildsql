## Hint 1

The reducer already understands four states and three actions. Count how many
of those actions `submit` ever dispatches — one, on the happy path, after the
promise has already settled. Nothing marks the moment the request went out, and
nothing at all happens when it fails.

## Hint 2

One request, three dispatches: `started` before you call `signIn`, then
`succeeded` or `failed` depending on which way the promise goes. Both branches
of the promise need a handler; only the success one has one now.

## Hint 3

The last piece is in the form rather than the provider: while the status is
pending, the button that started the request has no business being clickable
again.
