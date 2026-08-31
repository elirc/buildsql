## Hint 1

`D18Booking.Reserve` throws three different domain exceptions and can also throw
something nobody planned for. Wrap the call in a `try` and give each one its own
`catch`, in order, with `catch (Exception)` last.

## Hint 2

Each `catch` returns `TypedResults.Problem` with its own `statusCode` and its own
`type` off `D18Ferry.ProblemBase`:

- `SailingNotFoundException` - 404, `sailing-not-found`
- `SailingFullException` - 409, `sailing-full`, extensions `sailingCode` and
  `seatsLeft` taken from the exception's own properties
- `PaymentDeclinedException` - 402, `payment-declined`, extension `reason`
- anything else - 500, `internal`

## Hint 3

402 is right for the declined card: nothing the client sent is malformed (not
400), the caller is entitled to try (not 403), and the server did exactly what
it was designed to do (not 500).

The catch-all says nothing about the exception - the gate greps its body for the
connection string in the message.
