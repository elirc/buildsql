## Hint 1

Four failure modes and one success, in a fixed order: is the request
well formed (400), do the things it names exist (404), does the rule allow it
(409), and only then do the work (201). Each of those is a different claim
about whose fault it is, and collapsing any two of them lies to the client.

## Hint 2

Everything the handler needs is already a parameter - the store, the clock, the
options and the notifier - so nothing here should call `new`, `UtcNow` or read
a constant. Build the validation dictionary first with
`string.IsNullOrWhiteSpace` on both fields, and return
`TypedResults.ValidationProblem(errors)` when it is not empty.

## Hint 3

The open-loan count is `D22Library.LoansFor(cardId).Count` **plus** the loans
this host has already issued (`loans.Issued()` filtered by card) - counting
only the seeded ones lets the same member borrow forever. The warning uses
`D22Library.MostOverdueFor(cardId)`: when it is not null, notify with *that
loan's* card, code and days, set `warned` to true, and only then take
`loans.NextId()` and `TypedResults.Created($"/d22/loans/{id}", issued)`.
