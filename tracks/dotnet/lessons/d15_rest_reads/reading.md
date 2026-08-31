# Reading - dotnet/d15_rest_reads

## Notes

A read endpoint answers three questions before it answers the client's: does
this resource exist, is this request well formed, and does the caller already
have the answer? The set drills each of those, and the pattern that unites them
is that **the status line is part of the payload**. A client does not parse your
prose; it switches on a number.

The three that people conflate:

- **404** means the resource does not exist. It is not "nothing matched my
  filter" and it is not "your parameter is wrong".
- **400** means the *request* is wrong - a value outside the vocabulary, a
  malformed body. The server understood you and refuses.
- **200 with an empty array** means the collection exists and is empty. Any
  client that renders a list has to handle it, and none of them has to handle a
  404 for the same case.

And the two the drills add: **406** for "I cannot produce anything you said you
would accept", and **304** for "you already have this". The last one is the only
status in HTTP whose entire value is the bytes it does *not* send.

## ex1

What this was really testing: that a collection resource and an item resource
are separate endpoints with separate failure modes, and that neither of them
serializes storage. The seed order in `Model.cs` is deliberately not code order,
because the order rows happen to sit in is never a contract.

The classic mistake is the second half: `First(s => s.Code == code)` throws
`InvalidOperationException` when nothing matches, and an unhandled exception is
a 500 - a claim that *your server* is broken, when in fact the client asked a
perfectly well-formed question with a negative answer. The model answer's
reasoning: `FirstOrDefault` plus a null check, so "not there" is a decision the
handler makes rather than an accident the pipeline reports.

## ex2

What this was really testing: the distinction between an empty child collection
and a missing parent. `GET /d15/stations/zz99/bikes` and
`GET /d15/stations/hs11/bikes` differ in exactly one way, and the shipped code
cannot see it, because filtering a list by a code nobody has gives you the same
empty list as filtering by a code with nothing docked.

The classic mistake is skipping the parent check because the query "works". The
consequence shows up as a bug report in six months: a station is deleted, every
dashboard for it keeps rendering an empty dock instead of an error, and nobody
notices for a quarter. The model answer's reasoning: look up the parent first,
return 404 there, and only then answer the question that was asked.

## ex3

What this was really testing: that an optional parameter still has a
vocabulary. `?status=availble` is not a filter that matches nothing; it is a
request the server cannot honour, and saying 200 to it destroys the client's
only chance of finding the typo.

The classic mistake is exactly the shipped code - `Where(b => status is null ||
b.Status == status)` reads as obviously correct and turns every misspelling into
a silent empty result. The `retired` case in the gate is the counterweight: a
*legal* value with no matches genuinely is 200 and `[]`, so the rule is not "an
empty result is suspicious", it is "an unknown value is". The model answer's
reasoning: check membership against the published list, and when it fails answer
with a validation problem keyed by the parameter name, so the client is told
which knob it turned wrongly.

## ex4

What this was really testing: that routing is a dispatcher, not a suggestion.
The shipped handler binds `{id}` as a string, parses it, and branches - which
works today and is a trap tomorrow, because it has quietly claimed every URL
under `/d15/bikes/`.

Two things follow from splitting it. A literal segment always outranks a
parameter segment, so `available` and `{id:int}` can coexist and the
registration order does not matter. And the `:int` constraint means
`/d15/bikes/abc` matches *no* endpoint, so the 404 comes from routing before any
of your code runs - which is both faster and the correct answer, since there is
no such resource rather than a bad request about one.

The classic mistake is answering 400 to `/d15/bikes/abc`. It is defensible in
isolation and it is wrong here: it asserts that this URL identifies a bike and
you got its id wrong, when the truth is that this URL identifies nothing.

## ex5

What this was really testing: conditional requests. The server hands out an
`ETag` - an opaque token for *this representation* - and a client that keeps it
can ask "still the same?" with `If-None-Match`. If it is, the answer is 304 and
the body is never written.

Three details the gate pins down. The tag must be **quoted**, because that is
the grammar and `HttpClient` will not parse it otherwise. It must go out on the
**304 as well**, or the client has nothing to send on its next request and the
cache degrades to nothing after one hit. And a *non*-matching tag must produce
the full 200 - answering 304 to any `If-None-Match` at all is a cache that can
never update, which is the most expensive bug in this file.

The reasoning behind computing the tag from the serialized body: it is
automatically correct. A version number you maintain by hand is one forgotten
increment away from serving last week's data forever.

## ex6

What this was really testing: query-string binding when a key repeats.
`?zone=north&zone=south` is one key with two values, and binding it to a `string`
takes the first and throws the second away - silently, with a 200, which is the
worst possible way to lose half a filter.

Binding `string[] zone` takes all of them, and binds to an empty array when the
key is absent, which is exactly the "no filter" case with no null check needed.
The case-insensitive half is a `HashSet<string>` with
`StringComparer.OrdinalIgnoreCase`: doing it with `ToLower()` on both sides works
too and is the habit that makes database-backed versions of this endpoint
unable to use an index.

## ex7

What this was really testing: content negotiation, which is the part of HTTP
most people have used for years without implementing once. The client sends
`Accept` listing what it can read; the server picks something from that list, or
admits it cannot.

The four cases are all deliberate. No `Accept` header means no preference, so
the server chooses - JSON. `*/*` means the same thing said out loud. `text/csv`
is a representation of the *same resource* - not a different endpoint, not
`?format=csv`, the same URL serving different bytes - and the `Content-Type` on
the way back has to say which one it chose, or the client cannot parse what it
got. And `application/xml` is the case that matters: the client has told you in
advance it will not understand JSON, so sending JSON is sending garbage with a
200 on it. 406 is the honest answer.

The classic mistake is reading `Accept` as a single string and comparing it for
equality. Real clients send lists with quality values -
`text/csv;q=0.9, application/json;q=0.8` - which is why the model answer uses
`GetTypedHeaders().Accept` and walks it in preference order.

## ex8

What this was really testing: everything above, on one endpoint, in the right
order. Existence before validity (a report for a station that does not exist
cannot have a bad `model` parameter), validity before work, work before caching.

The subtle one is the last gate check: the filtered and unfiltered reports must
not share an `ETag`. An entity tag identifies a **representation**, not a URL
path - two different query strings that produce two different bodies are two
different representations. Reusing one tag across them means a client that
fetched `?model=roadster` and then asks for the unfiltered report gets a 304 and
keeps rendering the filtered numbers, forever, with no error anywhere. Computing
the tag from the body that was actually produced makes that impossible by
construction, which is the whole reason to do it that way.

The arithmetic is deliberately stated in the README rather than left to
intuition: `free = capacity - docked` over the *filtered* set. Drills compare
literally, and "obvious" is where two reasonable people disagree.

## Further reading

- [Routing in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/routing) - route templates, constraints, and how precedence between literal and parameter segments is decided.
- [Parameter binding in minimal API applications](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/parameter-binding) - query strings, arrays, optional parameters.
- [Create responses in minimal API applications](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/responses) - `TypedResults`, `Text`, `StatusCode`, `ValidationProblem`.
- [HTTP conditional requests (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Conditional_requests) - `ETag`, `If-None-Match` and what 304 is for.
- [HTTP content negotiation (MDN)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Content_negotiation) - `Accept`, quality values and 406.
- [RFC 9110 section 15.5](https://www.rfc-editor.org/rfc/rfc9110#name-client-error-4xx) - what the 4xx codes actually claim.
