## Hint 1

Do not think about mechanics; translate the three sentences. "The whole
application shares one", "one object for the whole of this request" and "fresh
at every use" each name exactly one lifetime, and the doc comments say which
sentence belongs to which interface.

The handler is given and correct. Only the three registration lines change.

## Hint 2

`AddSingleton`, `AddScoped` and `AddTransient` — one of each, and the shipped
file already has the transient one in the right place.

Check yourself against the gate rather than against intuition: a singleton is
the same across two requests, a scoped is the same *within* one request and
different across two, and a transient differs even when resolved twice in the
same request.
