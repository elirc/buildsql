## Hint 1

Order is the exercise. Some checks need nothing but the token, some need nothing
but the payload, and some need the database - and running them in that order
means an unauthorised or malformed request never touches a row.

## Hint 2

The policy on the route already answers 401 and 403. Then collect `exhibitId`,
`holder` and `count` failures into one dictionary - with the maximum from
`options.Value.MaxTicketsPerVisitor` - and return them together. Then load the
exhibit (404), then compute
`exhibit.Capacity - active` where `active` counts non-cancelled tickets, and
refuse with 409 plus a `seatsLeft` extension when it is short of `body.Count`.

## Hint 3

Build all the `Ticket` objects first, `AddRange` them, and call
`SaveChangesAsync` **once** - saving inside a loop makes a half-written booking
a real state. Read the ids back after the save, order them, and use the first
for both the `Location` and the `BookingDto.Id`.

Take `http.TraceIdentifier` into a local at the top and pass it as a `{TraceId}`
placeholder on every log line, alongside `{Count}`.
