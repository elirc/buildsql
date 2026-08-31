## Hint 1

Four outcomes, and the exercise is the *order*. Read the gate's
`nonsenseOnMissing` check before you write anything: a bad state and a bad id
together must produce the code for the bad state.

That tells you which check has to come first.

## Hint 2

The order is: validate the body, find the resource, check whether its state
allows the change, then act.

- `Desk.States.Contains(state)` decides the 400
- `store.Find(id)` being null decides the 404
- `booking.State == "cancelled"` decides the 409
- otherwise `store.SetState(id, state)` and `TypedResults.NoContent()`

`TypedResults.Conflict(...)` is the 409. Note that a null `State` in the body
should behave like an unknown one — `request.State ?? ""` handles it.
