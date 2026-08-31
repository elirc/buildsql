## Hint 1

Nothing new - ex3's validation problem, ex5's exception mapping, ex6's trace id,
and a 201 on the way out. What is graded is that they are all the same shape.

## Hint 2

Read `http.TraceIdentifier` once at the top and thread it into the `extensions`
of every failure, the validation problem included. That is the response most
likely to end up in a screenshot, so it is the worst one to leave untraceable.

Validation first (`sailingCode` blank, `seats` outside 1..6, both keys at once),
then `D18Booking.Reserve` in the try/catch.

## Hint 3

`"zz-99"` is a perfectly well-formed code, so it passes validation and fails
inside `Reserve` as a 404 - do not try to check existence during validation.

Success is
`TypedResults.Created($"/d18/orders/{reference}", new OrderAccepted(...))` with
the reference `$"{code}-{body.Seats}"`.
