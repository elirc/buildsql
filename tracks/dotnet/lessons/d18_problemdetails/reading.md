# Reading - dotnet/d18_problemdetails

## Notes

An error response is an API surface. It gets parsed by code, stored in logs,
pasted into support tickets and switched on by clients you will never meet -
which is why RFC 9457 gives it a schema instead of leaving it to prose. Every
exercise here drills that one shape and the discipline of producing it from
somewhere other than a happy path.

The five members, and the job each one has:

- **type** - a URI that is the *stable identity* of this kind of problem. It is
  the only field a client should branch on. Titles get reworded, details differ
  per occurrence, and one status code covers a dozen unrelated failures.
- **title** - the same human sentence for every occurrence of that type.
- **status** - repeated inside the body, because logs, queues and error
  aggregators carry bodies without status lines.
- **detail** - about *this* occurrence. A detail identical to the title is a
  wasted field.
- **instance** - which request it was.

Plus **extension members**: any extra JSON you like, at the top level. That is
where the machine-readable specifics go - `seatsLeft`, `reason`, `traceId` - so
the client never has to parse the English in `detail`. `errors` is just the
well-known extension that `ValidationProblemDetails` adds.

And the rule that outranks all of them: **what the client is told and what the
log records are different things.** The exception message in this lesson
contains a production connection string, and ex4 and ex5 exist to make sure it
never reaches a response body.

## ex1

What this was really testing: that a bare `NotFound()` is not an error
*response*, it is the absence of one. No body, no content type, nothing for a
client to log except the number 404.

The classic mistake beyond that is filling in `detail` with the same sentence as
`title`. The two exist to be different: the title is the class of problem
("No such sailing.") and the detail is this instance of it ("This operator has
no sailing 'zz-99'."). If they are the same, the response has one piece of
information where it could have had two.

`instance` is the field people skip and then wish they had, because it is what
turns a screenshot of an error into something you can search a log for.

## ex2

What this was really testing: `type` and extension members, which are the two
halves of making an error machine-readable.

A client that branches on the *status* cannot tell "sailing full" from any other
409 this API might grow next quarter. A client that branches on the *title*
breaks the day somebody improves the wording, or ships a translation. The type
URI exists precisely so that neither happens - it is opaque, it is versioned by
being a URI, and it never changes for cosmetic reasons.

The extensions matter for the same reason at a smaller scale. `seatsLeft: 1` in
the body means a client can immediately offer "book 1 seat instead"; the same
number inside a `detail` sentence means a regular expression, and a bug the
first time somebody rewrites the sentence.

Note the gate's last check: a sold-out sailing reports `seatsLeft: 0`, not an
absent field. Omitting an extension when its value is falsy is a common
serializer setting and a genuinely confusing wire contract.

## ex3

What this was really testing: that validation failures live inside the same
contract, not beside it. `BadRequest("bad seat count")` is `text/plain` - an
English sentence with no structure, which forces the client to have one code
path for validation errors and another for everything else.

`ValidationProblemDetails` is a `ProblemDetails` with one extra member,
`errors`, keyed by field. Everything else - `type`, `title`, `status`,
`instance` - works exactly as before, and the overload of
`TypedResults.ValidationProblem` takes all of them.

The gate's final check is the contrast that makes the point: the 404 has *no*
`errors` dictionary, because nothing the client sent was wrong. `errors` is a
statement about the payload, and a 404 is not about the payload.

## ex4

What this was really testing: that the last line of defence is a middleware, and
that it has to say almost nothing.

Two failures come out of `D18Booking.Manifest`, and they deserve opposite
treatment. `SailingNotFoundException` is a *known* failure that the domain chose
to express by throwing - the edge translates it into the 404 it always was.
Everything else is a fault: something the author did not anticipate, which means
nothing about it can be trusted to be safe to publish. The exception message
here holds `Server=prod-01;Password=hunter2`, which is not a contrived example -
connection strings, file paths, SQL and internal hostnames end up in exception
messages constantly.

So the 500 says: a status, a type, a title, an instance. Nothing else. The
exception type name is reconnaissance, the stack trace is a map of your
assemblies, and the message is whatever the library author felt like including.
All three go to the log.

`UseExceptionHandler(errorApp => errorApp.Run(...))` is the shape, and
`IExceptionHandlerFeature` on the context is where the exception is waiting. In a
whole application you would use `AddExceptionHandler<T>` and an `IExceptionHandler`
implementation; the mechanics of translating and of saying nothing are identical.

## ex5

What this was really testing: the mapping itself, as a first-class part of the
design. Four exception types, four statuses, four type URIs - and the
`catch (Exception)` last, so an unanticipated fault never falls through into a
success path or escapes the handler.

402 is the interesting one. A declined card is not a 400 (nothing the client
sent is malformed), not a 403 (the caller is perfectly entitled to try), and
emphatically not a 500 (the server is working exactly as designed). It is a
refusal by a third party that the client may be able to do something about,
which is what 402 has come to mean in practice.

The reason for the `reason` extension: a client that can offer another payment
method needs to branch on *why*, and `insufficient_funds` versus
`card_expired` is exactly the sort of thing that must not be a substring search
over a human sentence.

The order of the `catch` blocks is load-bearing in a way that is easy to miss -
C# requires the more derived types first, and if these exceptions ever grow a
common base class, a catch of the base placed early will silently swallow the
specific ones.

## ex6

What this was really testing: correlation. An error a user can see and an error
you can find in a log have to be joinable, and the only thing that joins them is
an identifier that appears in both.

Three details. The header goes on **every** response, not only the failures: the
support call that begins "it showed me the wrong number of seats" needs one too,
and by the time you know a request was interesting it has already finished. The
body carries the same value, because a user can read a JSON field out loud and
cannot read a header at all. And the value is per-**request** -
`HttpContext.TraceIdentifier` - so two requests differ; a constant identifies
the endpoint, which is precisely what a trace id must not do.

In a real deployment this is where W3C trace context takes over:
`Activity.Current?.Id` gives you an id that spans services, and `AddProblemDetails()`
adds exactly this extension by default for that reason.

## ex7

What this was really testing: what you take on when you read the body yourself.
The model binder normally owns two failures, and taking the body by hand means
they become yours: a request that is not JSON at all (415) and a request that
claims to be JSON and is not (400).

Both are client errors and neither is a 500. `ReadFromJsonAsync` throwing
`JsonException` is *expected input*, not a fault - the classic mistake is to let
that throw reach the catch-all and answer 500, which tells the client the server
is broken when in fact its own bytes were.

The two 400s in this exercise are deliberately distinguishable. "I sent rubbish"
(`malformed-body`, no `errors`) and "my values were rejected"
(`invalid-request`, with `errors`) call for completely different behaviour from
a client, and a single untyped 400 makes them the same event.

The ordering is the rest of the exercise: media type, then parse, then validate,
then the domain. Each step assumes the previous one succeeded, which is why they
cannot be reordered.

## ex8

What this was really testing: consistency, on the endpoint most likely to be
integrated against. Six outcomes - a validation problem, three domain
translations, a catch-all, and a 201 - and the gate checks that every failure
carries a type off the same base, an instance, and a `traceId`.

The `traceId` on the **validation problem** is the one people forget, and it is
the worst one to forget: a 400 is the response most likely to be screenshotted
and pasted into a chat by a developer integrating against you, and it is the one
where you most want to be able to find the request.

The layering repeats ex7's: things the client can see in its own payload first,
then the domain. `zz-99` is a well-formed sailing code, so it passes validation
and fails in `Reserve` as a 404 - which is the right split, because "you left
this field blank" and "that thing does not exist" are different instructions.

## Further reading

- [RFC 9457 - Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457) - the specification, including what extension members may be.
- [Handle errors in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/error-handling) - `UseExceptionHandler`, `IExceptionHandler`, and the developer exception page.
- [Handle errors in minimal API apps](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/handle-errors) - `TypedResults.Problem` and `TypedResults.ValidationProblem`.
- [ProblemDetails service](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/error-handling#problem-details) - `AddProblemDetails`, `CustomizeProblemDetails`, and the default `traceId`.
- [Distributed tracing concepts](https://learn.microsoft.com/en-us/dotnet/core/diagnostics/distributed-tracing-concepts) - where a real trace id comes from once there is more than one service.
