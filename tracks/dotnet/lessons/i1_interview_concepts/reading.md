# Reading - dotnet/i1_interview_concepts

The question bank. Sixty-two questions with model answers, grouped by topic and
starred by how often they actually come up:

- ⭐⭐⭐ — expect it. If you can only rehearse a subset, rehearse these.
- ⭐⭐ — normal in a full technical round.
- ⭐ — separates a strong candidate from a competent one.

Each answer ends with **↦** the follow-up an interviewer asks next, and **⟲** the
lesson to redo if the topic is shaky.

## Notes

Read this bank out loud, with the answers covered. Recognition is not
production, and an interview measures production. A good spoken answer is three
to six sentences long: what the thing is, why it exists, one concrete example,
and the trade-off — then stop talking and let them ask the follow-up. The model
answers below are written in that shape deliberately, so you can hear the rhythm
rather than memorise the words. If an answer surprises you, the fix is to redo
the lesson it points at, not to reread the answer.

## Dependency injection and lifetimes

**1. What are the three service lifetimes? (⭐⭐⭐)**
Singleton is one instance for the life of the application, scoped is one per
scope — which in a web app means one per HTTP request — and transient is a new
instance every time anything resolves it. The choice is about *ownership*: a
cache belongs to the application, a `DbContext` and the current user belong to a
request, and a cheap stateless helper belongs to nobody. Getting it wrong is
invisible on a single request and obvious on the second.
**↦** *Which lifetime is a `DbContext` and why?*  **⟲** 02_dependency_injection

**2. What is a captive dependency? (⭐⭐⭐)**
A longer-lived service holding a reference to a shorter-lived one — classically a
singleton that takes a scoped service in its constructor. The container builds
the singleton once, hands it one instance of the dependency, and that instance
outlives the request it belonged to, so every later request gets stale data or,
worse, one user's data. The fix is to pass the short-lived thing in as a method
argument, or to inject `IServiceScopeFactory` and create a scope per unit of
work.
**↦** *Why didn't the framework catch it?*  **⟲** 02, ex1 here

**3. Why doesn't scope validation always catch a captive dependency? (⭐⭐)**
`WebApplication.CreateBuilder` turns on `ValidateScopes` and `ValidateOnBuild` in
Development, which refuses to start an app where a singleton *constructor* takes
a scoped service. It cannot see a singleton that captures a **transient**, which
is legal by those rules and just as wrong at runtime, and it cannot see through a
factory lambda that resolves something itself. Treat it as a seatbelt, not as a
substitute for knowing the rule.
**↦** *Show me a captive dependency that starts up cleanly.*  **⟲** 02 challenge

**4. When is transient the wrong choice? (⭐⭐)**
Whenever the object is supposed to accumulate or share anything. A cache, a
counter, a connection pool or a change tracker that is rebuilt on every
resolution is not doing its job — and "make it all transient to be safe" is a
common instinct that quietly breaks exactly those. Transient also allocates, and
a transient `IDisposable` resolved from the root provider is held until the
process exits, which is a real leak.
**↦** *Who disposes what, and when?*  **⟲** 02

**5. Who calls `Dispose`? (⭐⭐)**
The container disposes what it *created*, when the scope that created it ends:
scoped and transient services resolved from a request scope go at the end of the
request, singletons at application shutdown. It does not dispose an instance you
handed it with `AddSingleton(new Thing())`, because you kept ownership. That is
why a scoped `DbContext` closes its connection at the right moment without you
writing a `using`.
**↦** *What happens to a transient `IDisposable` resolved from the root?*  **⟲** 02 review

**6. How do you use a scoped service from a `BackgroundService`? (⭐⭐)**
You cannot inject it — a hosted service is a singleton and there is no ambient
scope outside a request. Inject `IServiceScopeFactory`, call `CreateScope()` per
unit of work, resolve inside it, and dispose the scope when the work is done.
Forgetting this is the single most common DI mistake outside the request
pipeline.
**↦** *What breaks if you inject the `DbContext` directly?*  **⟲** 02

**7. What happens if you register the same interface twice? (⭐⭐)**
Nothing is replaced. `GetService<T>` returns the **last** registration and
`GetServices<T>` returns all of them in registration order, which is how
validators, notification channels and `IHostedService`s are wired. Use
`TryAdd*` when you want "register this only if nobody else did", and
`Replace`/`RemoveAll` when you deliberately want to swap an implementation — which
is exactly what a test host does.
**↦** *How would you pick one of several implementations at runtime?*  **⟲** 02 ex4

**8. Constructor injection or `IServiceProvider`? (⭐)**
Constructor injection, essentially always: the dependency is visible in the type,
the compiler enforces it, and a test can supply a fake. Resolving from an
injected `IServiceProvider` is the service-locator pattern — it hides the
dependency from every caller and every test, and turns a compile-time error into
a runtime one. The legitimate exceptions are factories and code that has to
create its own scope.
**↦** *Where is a service locator actually justified?*  **⟲** 02

## The pipeline and middleware

**9. What is middleware, and what is `next`? (⭐⭐⭐)**
Middleware is a chain of components, each wrapped around the next, that every
request passes through on the way in and every response passes through on the way
out. `next` is the rest of the pipeline compressed into one delegate, and a
middleware can call it, not call it, or call it and then inspect what came back.
The pipeline is composed once at startup by wrapping each component around the
one after it, which is why the order of your registration lines is the order of
execution.
**↦** *What happens if you don't call `next`?*  **⟲** 03_middleware

**10. Why does middleware order matter? (⭐⭐⭐)**
Because it defines nesting. The first component added is the outermost, so it
sees the request first and the response last, and everything else happens inside
it. Exception handling, correlation and timing must therefore be near the top, or
they cannot observe the things they exist to observe; authentication has to
precede authorization; CORS has to precede both, or a rejected preflight comes
back without CORS headers and the browser reports the wrong problem entirely.
**↦** *Where would you put a rate limiter and why?*  **⟲** 03, ex2 here

**11. `Use` versus `Run` versus `Map`? (⭐⭐⭐)**
`Use` adds a link that may call `next`. `Run` adds a **terminal** — it has no
`next` and always ends the request, so anything registered after it is dead code.
`Map` branches on a path prefix into a separate pipeline that never rejoins the
main one, while `UseWhen` branches on a predicate and *does* rejoin if the branch
does not terminate.
**↦** *What does `Map` do to `Request.Path`?*  **⟲** 03 ex4

**12. What is short-circuiting? (⭐⭐⭐)**
Deciding not to call `next`, so nothing downstream runs and whatever you wrote on
the response is the answer. It is how a 401, a cached response or a rate-limit
rejection is produced. The classic bug is setting `Response.StatusCode = 401` and
then awaiting `next` anyway: the handler runs, does the work you meant to
prevent, and overwrites the status.
**↦** *How would you test that a middleware really stopped the request?*  **⟲** 03 ex3

**13. Why can't you set a header after `await next(...)`? (⭐⭐)**
Because the response may already have started. ASP.NET Core writes the status
line and headers when the first body byte is flushed; after that `HasStarted` is
true and mutating headers throws. Set headers on the way in; read status codes on
the way out; and if you genuinely need to decide a header at the last moment, use
`Response.OnStarting`.
**↦** *How do you buffer a response to rewrite it?*  **⟲** 03 ex1

**14. Middleware or endpoint filter? (⭐⭐)**
Middleware runs for every request and sees only raw `HttpContext`; an endpoint
filter runs around one endpoint's handler, after routing and model binding, and
can see the bound arguments. Cross-cutting infrastructure — correlation,
compression, exception handling — is middleware. Validation of a bound DTO is a
filter, because middleware would have to re-read and re-parse the body to do it.
**↦** *Where do action filters fit in the MVC pipeline?*  **⟲** 03

**15. Where do scoped services go in a middleware? (⭐⭐)**
On `InvokeAsync`, not on the constructor. `UseMiddleware<T>` builds one instance
when the pipeline is built and reuses it for every request, so constructor
parameters come from the root provider and behave as singletons — a scoped one
there is a captive dependency, and in Development it fails at startup. Extra
`InvokeAsync` parameters are resolved from the request scope.
**↦** *How is `IMiddleware` different?*  **⟲** 03 review

## Hosting, minimal APIs and controllers

**16. Minimal APIs or controllers? (⭐⭐⭐)**
They sit on the same routing, binding, filter and result machinery, so the choice
is about organisation rather than capability. Minimal APIs have far less
ceremony and are excellent for small services and for endpoints that are mostly
one call; controllers group a large surface into classes and bring model
validation attributes and conventions with them. The answer interviewers listen
for is that you know they share a foundation, not that one is modern and the other
legacy.
**↦** *How do you do model validation in a minimal API?*  **⟲** 00, 07

**17. What is `Program.cs` actually doing? (⭐⭐)**
`WebApplication.CreateBuilder(args)` builds a host: configuration sources,
logging, DI container. You register services on `builder.Services`, call
`builder.Build()` to freeze the container, add middleware and endpoints on the
resulting `WebApplication`, and `app.Run()` starts Kestrel and blocks. The
top-level-statements file replaced `Startup.ConfigureServices`/`Configure`, which
is what you will still see in older codebases.
**↦** *What does `WebApplication` add to the pipeline for you?*  **⟲** 00

**18. Kestrel, IIS, reverse proxies — what runs where? (⭐⭐)**
Kestrel is the cross-platform HTTP server built into ASP.NET Core and it always
runs your app. In production it usually sits behind a reverse proxy — IIS,
nginx, YARP, a cloud load balancer — which terminates TLS, does host-based
routing and absorbs slow-client attacks. When it does, `UseForwardedHeaders`
matters so the app sees the real scheme and client IP rather than the proxy's.
**↦** *What is the in-process versus out-of-process IIS model?*  **⟲** awareness

**19. `Results` versus `TypedResults`? (⭐⭐)**
`Results.Ok(x)` returns `IResult`; `TypedResults.Ok(x)` returns the concrete
`Ok<T>`, which is still an `IResult`. The concrete type lets the compiler check
that you returned what you promised and lets OpenAPI describe the endpoint
without running it. When a handler has two outcomes, declare
`Results<Ok<T>, NotFound>`; at four or five, that signature stops being readable
and plain `IResult` is the better trade.
**↦** *Where does that stop being worth it?*  **⟲** 01_routing_endpoints

**20. How does parameter binding decide where a value comes from? (⭐⭐)**
Simple types — anything with a `TryParse` — are looked for in the route template
first and the query string second; complex types come from the JSON body;
registered services come from DI; and `HttpContext`, `HttpRequest`,
`ClaimsPrincipal` and `CancellationToken` are special-cased. You can override any
of it with `[FromQuery]`, `[FromRoute]`, `[FromBody]`, `[FromHeader]`,
`[FromServices]`.
**↦** *What happens if two parameters both want the body?*  **⟲** 00 ex2, ex3

**21. What does a route constraint actually do? (⭐⭐)**
It participates in *matching*, not validation. `{id:int}` means the template only
matches when that segment parses as an integer, so `/orders/banana` does not
reach your handler at all and routing answers 404 — not 400. That makes
constraints a good place for statements about the shape of a URL and a bad place
for business rules, which need a handler that can answer 403 or 409.
**↦** *Why is `/orders/banana` a 404 and not a 400?*  **⟲** 01

## EF Core

**22. What is deferred execution? (⭐⭐⭐)**
`db.Products.Where(...)` builds an expression tree and executes nothing; the SQL
is generated and sent at the terminal operator — `ToListAsync`,
`FirstOrDefaultAsync`, `CountAsync`, `AnyAsync`. Everything before that boundary
becomes SQL and everything after it runs in your process on rows already
fetched. Being able to point at that boundary in unfamiliar code is most of what
"knows EF" means.
**↦** *What happens if you `Select` after `ToList` instead of before?*  **⟲** 05_efcore_basics

**23. What is the N+1 problem? (⭐⭐⭐)**
One query to fetch a list, then one more per row to fetch something related —
101 round trips for a hundred rows. Every answer is correct, so no test on the
response body catches it, and the cost is entirely in the count of round trips.
The fix is to ask the database once for the shape you want: `Include` to bring
related entities, or better a projection that lets SQL do the joining and
aggregating.
**↦** *How would you detect one in production?*  **⟲** 06, ex3 here

**24. `Include` or projection? (⭐⭐⭐)**
`Include` brings back whole related entities and is right when you are going to
modify them. A projection with `Select` brings back only the columns you named,
is not tracked, and is right for anything you are about to serialise. `Include`
on two collections at once also multiplies rows — the cartesian explosion — which
`AsSplitQuery` trades for extra round trips.
**↦** *When is `AsSplitQuery` worth it?*  **⟲** 06

**25. What does change tracking do? (⭐⭐⭐)**
When EF materialises a tracked entity it snapshots every property. On
`SaveChangesAsync` it compares current values against the snapshot and generates
an `UPDATE` for the differences, inside a transaction, returning the number of
rows written. That is why you never call `Update()` on an entity you loaded —
assigning to the property *is* the edit.
**↦** *What does `SaveChanges` return, and when is it 0?*  **⟲** 05 ex4

**26. What does `AsNoTracking` change? (⭐⭐⭐)**
It skips the snapshot, so the query is faster and lighter — and any change you
then make is invisible to `SaveChangesAsync`, silently, with no exception and no
log. Use it for read-only queries, which is most of them; note that a projection
to a non-entity type is untracked anyway. `AsNoTrackingWithIdentityResolution`
is the middle option when you want a coherent read-only graph.
**↦** *What is the identity map, and what does no-tracking do to it?*  **⟲** 05 ex4, 06 ex4

**27. Why is `DbContext` scoped? (⭐⭐⭐)**
Because a request is the natural unit of work: everything it loads goes into one
change tracker and `SaveChangesAsync` writes all of it in one transaction. It is
also not thread-safe — two concurrent operations on one context throw "a second
operation was started on this context instance", which in practice means a
missing `await` or a `Task.WhenAll` over the same context.
**↦** *How do you use EF from a background job?*  **⟲** 05, 02

**28. What are migrations, and how do they run in production? (⭐⭐)**
`dotnet ef migrations add X` generates a checked-in C# class describing a schema
delta plus its inverse; `dotnet ef database update` applies pending ones and
records them in `__EFMigrationsHistory`. Real projects apply them in a deployment
step rather than at application startup, so that ten instances starting at once
do not race, and review them like any other code. `EnsureCreated` is for tests
and demos only — it has no history and cannot evolve an existing database.
**↦** *How do you deploy a breaking schema change with zero downtime?*  **⟲** 05

**29. Is LINQ safe from SQL injection? (⭐⭐)**
Yes — `Where(p => p.Name == name)` becomes a parameterised query, and the value
is bound, never interpolated. The exception is `FromSqlRaw` with a concatenated
string, which is exactly as dangerous as it looks; `FromSql` with an interpolated
`FormattableString` is safe because EF turns the holes into parameters.
**↦** *When would you drop to raw SQL at all?*  **⟲** 05

**30. How do you page efficiently? (⭐⭐)**
`Skip((page - 1) * size).Take(size)` becomes `LIMIT`/`OFFSET`, which is fine for
page-numbered UIs over modest tables and gets slower as the offset grows, because
the database still walks the skipped rows. Keyset (cursor) pagination —
`WHERE Name > @last ORDER BY Name LIMIT 20` — stays fast at any depth and is what
infinite scroll actually uses. Either way, cap the page size and reject anything
larger rather than clamping silently.
**↦** *Why is an unbounded page size a security problem?*  **⟲** 05 challenge, 07

**31. What is client evaluation? (⭐)**
When part of a query cannot be translated to SQL, older EF versions silently
evaluated it in memory after loading everything. Since EF Core 3 it throws
instead, naming the expression it could not translate — which is much better,
because the failure is loud rather than a mysterious full table scan. The fix is
a translatable expression, or an explicit `AsEnumerable()` to say "yes, I mean
in memory".
**↦** *Give an example that won't translate.*  **⟲** 05

## REST and HTTP semantics

**32. Which methods are safe, and which are idempotent? (⭐⭐⭐)**
`GET` and `HEAD` are safe: they must not change anything, which is why crawlers
and link previews issue them freely. `GET`, `PUT` and `DELETE` are idempotent:
doing them twice leaves the same state as doing them once. `POST` is neither, so
ten POSTs make ten resources. These are not style preferences — retry policies,
proxies and CDNs act on them.
**↦** *How do you make a create idempotent?*  **⟲** 01, 07

**33. `PUT` versus `PATCH`? (⭐⭐⭐)**
`PUT` replaces the resource at that URL with the representation you send, so it
takes the whole thing and is idempotent. `PATCH` applies a partial change, is not
generally idempotent, and needs a defined format — JSON Patch or JSON Merge
Patch — because "just send the fields you want changed" is ambiguous about nulls.
Most teams that "support PATCH" have actually implemented a lenient PUT.
**↦** *What does your PATCH do with an explicit null?*  **⟲** 07

**34. 400 or 409? (⭐⭐⭐)**
400 means *look at your request, it is wrong on its face* — a blank name is a 400
regardless of what is in the database, and retrying it identically will always
fail. 409 means *your request is fine and the current state forbids it* — a
duplicate key, an illegal state transition, a failed `If-Match`. The client's
correct reaction is different in each case, which is why the distinction earns
its keep.
**↦** *Where does 422 fit?*  **⟲** 01 challenge, 07 ex2

**35. What must a 201 include? (⭐⭐⭐)**
A `Location` header pointing at the new resource, and normally the created
representation as the body. Without the `Location` the client has to guess the
URL of the thing it just made from your documentation. Build it from a named
route rather than a string literal so that changing the route template does not
silently break it.
**↦** *Should the response body repeat the resource?*  **⟲** 01 ex3

**36. Why 204 rather than 200 with an empty body? (⭐⭐)**
204 tells the client at the protocol level that there is no content and none is
coming; it must not have a message body at all. 200 with a zero-length body is a
different claim — "here is your representation, and it is empty" — and caches,
proxies and generated clients act on the difference.
**↦** *Should DELETE be 204 every time or 404 the second time?*  **⟲** 07 ex4

**37. Why DTOs instead of returning entities? (⭐⭐⭐)**
Three reasons. They stop leaks: an entity has columns that exist for the database
and your operations team, and serialising it publishes them forever. They
decouple your schema from your contract, so a column rename is not a breaking API
change. And because the DTO is what the query projects into, you fetch four
columns instead of forty.
**↦** *What about the mapping boilerplate?*  **⟲** 07 ex1

**38. What is mass assignment? (⭐⭐⭐)**
Binding a request body straight onto an entity and saving it, so any property the
client happens to name gets written — including `IsAdmin`, `Balance` or `OwnerId`,
and including properties a colleague adds six months later. The defence is to
enumerate the fields you accept: fetch the row, assign those three, save.
Exclusion lists do not work, because the list is never updated.
**↦** *How does that interact with PATCH?*  **⟲** 07 ex3, 09 ex4

**39. What is ProblemDetails? (⭐⭐)**
The RFC 9457 error document — `type`, `title`, `status`, `detail`, `instance`,
plus extensions — served as `application/problem+json`. ASP.NET Core produces it
from `Results.Problem` and `Results.ValidationProblem`, and
`AddProblemDetails()` makes the framework use it for status codes it generates
itself. Using it means every client, SDK and gateway in the ecosystem already
understands your errors.
**↦** *What goes in `errors` versus `detail`?*  **⟲** 07, 08

## Async and performance

**40. Why async all the way down? (⭐⭐⭐)**
A web server handles thousands of concurrent requests on a small thread pool, and
it can only do that if a request waiting on I/O gives its thread back. `await` on
a database or HTTP call releases the thread; a blocking call holds it for the
whole round trip. Under load, blocking is how a service thread-pool-starves and
its latency collapses even though nothing is CPU-bound.
**↦** *What actually happens to the thread during an await?*  **⟲** 05, 00

**41. Why is `.Result` or `.Wait()` dangerous? (⭐⭐⭐)**
It blocks a pooled thread on work that has not finished, so under load you
exhaust the pool with threads that are all waiting. In frameworks with a
synchronization context — classic ASP.NET, WinForms, WPF — it also deadlocks
outright, because the continuation needs the very thread you are blocking.
ASP.NET Core has no such context, so it "only" starves; the rule is the same.
**↦** *Why doesn't it deadlock in ASP.NET Core?*  **⟲** 05

**42. Why is `async void` bad? (⭐⭐⭐)**
Because there is no `Task` to await or observe, so the caller cannot know when it
finished and cannot catch its exceptions — an unhandled one goes straight to the
process. The single legitimate use is an event handler whose signature you do not
control. Everything else returns `Task`.
**↦** *Where does the exception actually go?*  **⟲** csharp track 13

**43. What does `CancellationToken` buy you? (⭐⭐)**
A minimal API handler can take one, and ASP.NET Core binds it to
`HttpContext.RequestAborted`. Pass it down to EF and `HttpClient` and work stops
when the client hangs up, instead of your server finishing a query nobody is
waiting for. On a busy service that is a meaningful amount of wasted capacity
reclaimed.
**↦** *What happens if you ignore it?*  **⟲** 05

**44. `Task.WhenAll` versus awaiting in a loop? (⭐⭐)**
`WhenAll` starts the operations concurrently and waits for all of them, which is
right for independent I/O to different systems. It is *wrong* against a single
`DbContext`, which is not thread-safe and will throw. And it is wrong when the
operations are dependent, in which case the loop was correct and the fix is one
query instead of N.
**↦** *What does `WhenAll` do with multiple exceptions?*  **⟲** 05, 06

**45. Why should `HttpClient` come from `IHttpClientFactory`? (⭐⭐)**
Creating a `new HttpClient` per call exhausts sockets, because each one holds
connections in `TIME_WAIT`; making one static never picks up DNS changes. The
factory pools and rotates handlers, handles both problems, and gives you one
place to configure timeouts, headers and resilience policies per named client.
**↦** *What is socket exhaustion, concretely?*  **⟲** awareness

## Configuration and options

**46. How does configuration precedence work? (⭐⭐⭐)**
Sources are layered and later ones win by key: `appsettings.json`, then
`appsettings.{Environment}.json`, then user secrets in Development, then
environment variables, then command-line arguments. Everything is flat
colon-separated keys and every value is a string; environment variables spell the
separator `__` because colons are not portable in variable names.
**↦** *Where do secrets go in production?*  **⟲** 04_configuration_options

**47. `IOptions`, `IOptionsSnapshot` or `IOptionsMonitor`? (⭐⭐⭐)**
`IOptions<T>` is a singleton computed once — the default, and right for anything
that only changes on deploy. `IOptionsSnapshot<T>` is scoped and recomputed per
request, so changes appear without a restart and every service in one request
sees the same value; it cannot be injected into a singleton. `IOptionsMonitor<T>`
is a singleton with change notifications and `Get(name)` for named options.
**↦** *What happens if you inject `IOptionsSnapshot` into a singleton?*  **⟲** 04

**48. Where should default values live? (⭐⭐)**
In the options class, as property initialisers. The binder only writes properties
it finds keys for, so a deployment file that says nothing gets a working system,
and every line in a real environment's config is a deliberate deviation you can
review. Defaults in `appsettings.json` and an empty class means an omitted key
silently becomes `0`, `false` or `null`.
**↦** *How do you fail fast on invalid configuration?*  **⟲** 04 ex2

**49. What is `IHostEnvironment` for? (⭐⭐)**
It names the current environment — `Development`, `Staging`, `Production` by
convention, defaulting to Production when unset, which is the safe default. It
selects the environment-specific settings file and gates behaviour that must
never reach users: the developer exception page, DI scope validation, detailed
database errors, Swagger UI. Environment checks belong in `Program.cs`, choosing
what to wire up — not scattered through business logic.
**↦** *Why is the default Production and not Development?*  **⟲** 04 ex3

## Errors, logging and observability

**50. What happens to an unhandled exception? (⭐⭐⭐)**
In Development, the developer exception page turns it into a 500 whose body is
the exception and stack trace. Anywhere else there is no such middleware, so it
is a bare 500 with an empty body. Neither is what you ship: you add an exception
handler — middleware, `UseExceptionHandler`, or an `IExceptionHandler` — that maps
known exceptions to status codes, returns ProblemDetails, and logs the rest.
**↦** *Which exception messages are safe to return?*  **⟲** 08_errors_logging

**51. Message template or interpolated string? (⭐⭐⭐)**
Always a template: `LogInformation("Order {OrderId} shipped to {City}", id, city)`.
That gives the sink structured properties you can query, group and alert on, plus
a stable template so a million occurrences of one event look like one event.
`$"Order {id} shipped"` renders identically and produces a unique string with no
fields — a `Console.WriteLine` with extra steps.
**↦** *Are the placeholders matched by name or position?*  **⟲** 08 ex3

**52. Which log level for what? (⭐⭐⭐)**
Information for normal noteworthy events, Warning for something wrong that the
system handled, Error for a request that failed and someone should look,
Critical for the system failing. The operational rule: a 4xx caused by the caller
is a Warning, a 5xx caused by you is an Error. Log every 404 at Error and the
alerting channel becomes noise that gets muted, at which point the real errors are
invisible too.
**↦** *Where do you log — every layer, or once?*  **⟲** 08 challenge

**53. How do you log an exception properly? (⭐⭐)**
`logger.LogError(ex, "template {Property}", value)` — the exception goes in its
own first parameter, not interpolated into the message. That slot is what carries
the type, stack trace and inner exceptions through to the sink; a
`LogError($"{ex}")` throws all of that away and leaves a string nothing can
group or symbolicate.
**↦** *`throw;` or `throw ex;`?*  **⟲** 08 ex2

**54. What is a correlation id for? (⭐⭐)**
It ties every log entry produced while handling one request — across services —
to a single identifier, so a support ticket saying "error 6b1e" becomes a lookup
instead of a search through millions of lines. Generate one if the client did not
send one, echo it if they did, put it on the response and in the error body.
Modern systems get this from W3C Trace Context and `Activity` rather than a
hand-rolled header.
**↦** *How does that relate to distributed tracing?*  **⟲** 08 ex4

## Security

**55. 401 or 403? (⭐⭐⭐)**
401 means *I do not know who you are* — authenticate and try again. 403 means *I
know exactly who you are and the answer is no*. Sending 401 to someone already
authenticated tells them to do something that cannot help; sending 403 to an
anonymous caller tells them logging in is pointless, which is usually false. The
names are unfortunate: 401 "Unauthorized" actually means unauthenticated.
**↦** *When would you return 404 instead of 403?*  **⟲** 09_auth_and_testing ex2

**56. What is inside a JWT? (⭐⭐⭐)**
Three base64url parts: a header naming the algorithm, a payload of claims — `sub`,
`exp`, `iss`, `aud`, roles, whatever else — and a signature over the first two.
It is **signed, not encrypted**, so anyone holding one can read every claim; never
put a secret in one. The signature is the entire security model: it proves the
payload has not been altered since the issuer produced it.
**↦** *So how do you revoke one?*  **⟲** 09

**57. What must you validate on an incoming token? (⭐⭐⭐)**
Signature, lifetime, issuer and audience — and each maps to a real attack. No
signature check and anyone mints `"role": "admin"`. No lifetime check and a token
leaked from a log two years ago still works. No issuer check and any system
sharing your key can impersonate your users. No audience check and a token issued
for a different one of your APIs is accepted here.
**↦** *What was the `alg: none` attack?*  **⟲** 09 ex1

**58. How do you revoke a JWT? (⭐⭐)**
Strictly, you cannot: validation is stateless and a token is valid until it
expires. The practical answer is short-lived access tokens — minutes — paired
with a long-lived refresh token held somewhere you *can* revoke, and a
denylist only for the cases that truly need immediate cutoff. Anyone who claims
instant revocation with pure JWT has reintroduced server-side state.
**↦** *What is the trade-off with very short expiry?*  **⟲** 09

**59. Roles, policies, or a check in the handler? (⭐⭐⭐)**
Roles are coarse and static. Policies are named, composable rules evaluated
against the principal and are the default choice, because the rule lives in one
place and can grow without touching endpoints. Neither can express "may this user
edit *this* record", which depends on data the authorization system has not
loaded — that is resource-based authorization, done in the handler or via
`IAuthorizationService` after you fetch the resource.
**↦** *How would you test an authorization rule?*  **⟲** 09 ex2, challenge

**60. What is Broken Object Level Authorization? (⭐⭐⭐)**
Number one on the OWASP API Security Top 10: an endpoint that is authenticated
but does not check that *this* caller may see *this* object. It looks like
returning the whole table from an authenticated endpoint, or filtering by an
owner id taken from the query string, which the client can change. The rule is
that anything scoping data to a caller comes from the signed token, never from
anywhere the caller can write.
**↦** *How would you make it impossible rather than merely discouraged?*  **⟲** 09 ex3

**61. Is CORS a security control? (⭐⭐)**
Not for your server. It tells a *browser* which origins may read a response;
curl, a mobile app, a server and a proxy all ignore it, so a permissive CORS
policy is not by itself a vulnerability while a missing authorization check
always is. It also has to run before authentication, or a preflight gets a 401
with no CORS headers and the browser reports a CORS failure for an auth ordering
bug.
**↦** *Why can't you combine `AllowAnyOrigin` with credentials?*  **⟲** 09

**62. Where should a browser keep a token? (⭐⭐)**
There is no free option. `localStorage` is readable by any script on the page, so
one XSS is full account compromise. An `HttpOnly; Secure; SameSite` cookie is not
script-readable but reintroduces CSRF, which is why cookie auth needs antiforgery
tokens and bearer auth does not. The answer interviewers want is that you know
which attack each choice defends against.
**↦** *What does `SameSite=Lax` actually stop?*  **⟲** 09

## ex1 - the captive dependency, cold

The reason this one is the canonical .NET interview bug is that it is invisible
in a code review of a single file. `JobRunner(IRequestId requestId)` is a
perfectly ordinary constructor; `AddSingleton<IJobRunner, JobRunner>()` is a
perfectly ordinary registration. The defect only exists in the *relationship*
between two lines in two different files, and it only shows up on the second
request.

Note which fix the gate refuses. Making the runner scoped removes the wrong
answer and the counter with it — the "totalRuns restarted" assertion exists
precisely to stop you trading a correctness bug for a functionality bug, which is
what happens in real codebases when someone silences a scope-validation error by
downgrading the lifetime.

The right move is the one that generalises: a long-lived component receives
short-lived data as a **method argument**. Say that sentence in an interview and
you have answered the question and its follow-up at once.

## ex2 - order as a correctness property

"The audit log is missing the rejected requests" is a sentence you will hear in
some form — swap audit for metrics, tracing, rate limiting or CORS headers on
error responses and it is the same bug. Anything that must see *every* request has
to be outside anything that can *stop* one, because a short-circuit means nothing
downstream runs at all.

The diagnostic habit worth building: when a cross-cutting concern is missing from
exactly the failure cases, look at ordering before you look at the concern's own
code. It is almost never broken; it is almost always inside something that
returned early.

## ex3 - the N+1 you can measure

Two things make this exercise realistic. The broken version returns perfect data,
so no assertion on the body catches it — which is why the gate counts SQL
commands instead. And the broken version *looks fine*: a loop that fetches what
each row needs is exactly how you would write it against an in-memory list.

The answer to the interviewer's follow-up, "how would you find this in
production", is worth having ready: turn on EF's command logging
(`Microsoft.EntityFrameworkCore.Database.Command` at Information), look at the
count per request, and — better — put a test around the hot endpoint asserting the
number of queries, which is exactly what the gate you just ran does.

## ex4 - five bugs, none of them a crash

Count them: a create returning 200 instead of 201; a create with no `Location`;
a create that accepts a blank title; a replace that answers 200 for an id that
does not exist; and a replace that answers 409 when you send the same thing
twice.

The last one is the interesting one, because it is a *deliberate* mistake someone
made thinking they were being helpful. Idempotency is a property of the end
state: if the resource already holds the representation you sent, your request
succeeded — that is the whole contract PUT offers, and it is the contract every
retry-after-timeout in every HTTP client depends on. An API that gets this wrong
produces phantom failures under exactly the network conditions where retries
happen.

## review1 - two bugs, two lessons

The singleton basket is the lifetime bug in its most alarming form: not stale
data, but *one customer seeing another customer's shopping*. Shared mutable state
across concurrent requests is the failure mode that makes "singletons must be
thread-safe, and per-request state must be scoped" more than a style rule.

The 200-instead-of-201 is the smaller half, and it is here because status codes
decay. A resource starts out correct and then someone adds an endpoint in a hurry,
and now half your API says 200 for creates. The `Location` header is the part
that actually costs a client something.

## Further reading

- [ASP.NET Core fundamentals](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/) — the whole map: hosting, DI, middleware, configuration, logging, routing.
- [Dependency injection guidelines](https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection-guidelines) — captive dependencies, disposal and the anti-patterns, from the source.
- [EF Core performance](https://learn.microsoft.com/en-us/ef/core/performance/) — N+1, projection, tracking and round-trip counting, in one place.
- [RFC 9110 — HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110.html) — the definitions of safe, idempotent, and every status code you will argue about.
- [OWASP API Security Top 10](https://owasp.org/API-Security/editions/2023/en/0x11-t10/) — broken object level authorization and its nine friends.
- [ASP.NET Core security documentation](https://learn.microsoft.com/en-us/aspnet/core/security/) — authentication, authorization, CORS, antiforgery, data protection.
