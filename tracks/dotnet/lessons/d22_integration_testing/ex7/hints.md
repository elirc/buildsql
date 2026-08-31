## Hint 1

Three seams, and the gate proves each one separately by changing it and
demanding the answer changes: the clock decides `renewedAt`, `LoanDays` decides
`dueAt`, `GraceDays` decides whether this is a 200 or a 409, and the notifier
records the refusal.

## Hint 2

The order of the checks is the exercise. Existence first - a loan that does not
exist cannot be too overdue to renew. Then the rule, then the work. All four
parameters are already declared for you in the stub; none of them may be
replaced by something the handler fetches itself.

## Hint 3

Read `policy.Value` once into a local and use it for both numbers. The
comparison is `loan.DaysOverdue > limits.GraceDays` - strictly greater, so a
loan exactly at the grace still renews. The refusal branch calls
`notifier.Notify(loan.CardId, loan.Code, loan.DaysOverdue)` and then returns
`TypedResults.Json(new RenewalRefused(...), statusCode: 409)`; the success
branch notifies nobody.
