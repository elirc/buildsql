## Hint 1

Do not touch the handler. Both registrations are transient, which means "a new
instance every time somebody asks" - including twice inside the same request.
Ask what boundary each of these two objects belongs to.

## Hint 2

One value has to be stable inside a request and new between requests: that is
the request scope. The other has to survive every request the process ever
handles: only one lifetime does that.

The two method names you want are `AddScoped` and `AddSingleton`, and getting
them the wrong way round is worse than leaving them transient.
