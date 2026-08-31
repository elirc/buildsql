## Hint 1

The reporter is built once, at startup, long before any of these requests
existed — so nothing it receives in its constructor can be "the current
request". It needs something that is itself a singleton but *answers
differently* depending on which request is in flight.

ASP.NET Core ships exactly one such thing, and it needs registering.

## Hint 2

`services.AddHttpContextAccessor();` in `Ex7Services`, and
`IHttpContextAccessor` in the reporter's constructor.

`accessor.HttpContext` is `null` outside a request — a background thread, a
health probe, a startup task — so handle that rather than assuming. Then read
`http.Request.Headers["X-Trace"].ToString()`; an absent header is an empty
string, which is the `"none"` case.

The accessor works because it wraps an `AsyncLocal<HttpContext>`: the value
follows the async flow of one request, not the instance.
