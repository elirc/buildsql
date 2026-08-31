# Reading - dotnet/d22_integration_testing

## Notes

Nothing in this set asks you to write a test. Every problem asks you to write
application code that a test could pin down, and then a gate proves it by
actually pinning it down. That inversion is the point: **testability is a
property of the production code**, not of the test project. A handler is
testable when everything it depends on arrives through the door rather than
being fetched from behind it.

Four things a handler is tempted to fetch for itself, and the seam that
replaces each:

- **State** - a `static` field belongs to the process, so every host in the
  test run shares it. A singleton resolved from the container belongs to the
  host, and each `new DojoWebFactory()` is its own host with its own container.
- **Time** - `DateTimeOffset.UtcNow` is an input the caller cannot choose. A
  `TimeProvider` parameter is an input the caller can.
- **Randomness** - `Guid.NewGuid()` in a response body makes that response
  unassertable forever. Derive the identifier from something injected.
- **The outside world** - a `new`ed concrete class is welded in. An interface
  resolved from DI can be replaced by a recorder that says what was asked for.

And the two rules that decide whether a suite is stable: no test may depend on
another test's writes, and no endpoint may be dangerous to call twice. A retry
that changes the answer is a bug in the endpoint, not in the runner.

## ex1

What this was really testing: that mutable state has an owner, and that the
owner should be the host. Both hosts in the gate run in the same process, so a
`static List<Hold>` is one list shared between them - the second host's first
hold comes back with id 2, and each host sees the other's writes.

The classic mistake is that this looks fine in manual testing, because a
`dotnet run` is one process with one host and the static is indistinguishable
from a singleton. It only breaks under a test suite, where it breaks as
order-dependent flakiness rather than as an error. The model answer's
reasoning: `HoldDesk` is registered singleton in `Model.cs`, so asking for it
as a parameter gives you exactly one per container - and a container is exactly
what a `WebApplicationFactory` builds fresh.

## ex2

What this was really testing: that "now" is a dependency like any other. The
gate installs a `TimeProvider` stuck at 2026-03-04T09:30:00Z and then asserts
the due date to the second, which is only possible because the handler was told
what time it is instead of asking the machine.

The classic mistake is the "just allow a tolerance" workaround - assert the due
date is within a few seconds of `UtcNow.AddDays(14)`. That reproduces the
handler's arithmetic inside the test, so the test agrees with the code by
construction and catches nothing. The model answer's reasoning: take
`TimeProvider` and call `GetUtcNow()`; the second host in the gate, with a 2019
clock, is there to prove the value is read rather than remembered.

## ex3

What this was really testing: determinism. A response containing
`Guid.NewGuid()` can be checked for shape and never for value, which quietly
downgrades every assertion about it to "something came back". The gate demands
that a fresh host given the same request produce the same reference, byte for
byte.

The classic mistake is treating "unique" and "unpredictable" as the same
requirement. They are not: `LOAN-M-014-0001` is unique within the host and
completely predictable. The model answer's reasoning: build the reference out
of the caller's input and an injected counter, so it is a pure function of
things a test controls - and the four-digit padding is in the contract because
`0001` and `1` are different strings and gates compare literally.

## ex4

What this was really testing: that an outbound effect needs a seam, and that
the seam has to be the object the handler actually calls. The shipped stub
returns the right count and performs the right number of notifications - on an
instance it constructed itself, which no test can see. The endpoint is
"correct" and completely unverifiable.

The classic mistake is asserting only the count. `notified: 3` passes against
the broken version; the recorded call list does not. That is why the gate pins
down the arguments and their order - what was asked, of whom, in what sequence.
The model answer's reasoning: take `IOverdueNotifier` as a parameter and use
what you are handed, so production gets `DeskLogNotifier` and the gate gets a
recorder and the handler cannot tell the difference.

## ex5

What this was really testing: that a policy number is configuration, not a
constant. The shipped `const int MaxLoans = 3` gives the right answer on the
default host and cannot be made to give any other answer without an edit and a
rebuild - so no test can ever explore what happens at the boundary.

The classic mistake is thinking the constant is safe because it matches the
documented default. It does match, which is exactly why the bug survives code
review; the gate catches it only because it boots a second host that says the
limit is 2. The model answer's reasoning: read `IOptions<LoanPolicyOptions>`
inside the handler, so the value comes from whatever configuration this host
was built with, and the defaults on the options class stay the fallback.

## ex6

What this was really testing: two independent properties that together decide
whether a suite is stable. First, the collection endpoint must sort, because
`ReturnsLog.Snapshot` hands back a `HashSet` in whatever order it feels like
and enumeration order is not a contract. Second, `POST` twice with the same
loan id must be a report, not a second effect.

The classic mistake is answering 409 to the repeat. It feels rigorous and it
punishes exactly the callers you want to encourage: a client that never saw the
first response, and a test runner retrying a flaky-looking case. The model
answer's reasoning: `HashSet.Add` already returns whether the id was new, so
the handler can say `alreadyReturned` truthfully while the count stays put -
and the 404 for loan 99 keeps "nothing to do" distinct from "no such thing".

## ex7

What this was really testing: three seams on one handler, and evidence that all
three are live. Any one of them can be faked while the other two stay welded
in, and the endpoint will still pass a careless test - so the gate runs the
same loan against two hosts that differ in clock, in `LoanDays` and in
`GraceDays`, and demands a different answer from each.

The classic mistakes are ordering ones. Checking overdue-ness before existence
answers 409 for a loan that was never there. Notifying on the success path as
well as the refusal makes the notifier useless as evidence, because a recorded
call no longer means "this was refused". And `>=` instead of `>` quietly turns
a two-day grace into a one-day one - the gate's loan 5, one day overdue, exists
to catch precisely that.

The model answer's reasoning: 404, then the rule, then the work; the notifier
fires only inside the refusal branch, and both the grace and the loan length
come out of `policy.Value` at the moment of use rather than being captured
anywhere.

## ex8

What this was really testing: the whole discipline at once. Shape before
existence before rules before work - 400 for a blank field, 404 for a name
nothing answers to, 409 for a request that is perfectly valid and still
refused, 201 with a `Location` that can actually be fetched.

Two traps are worth naming. The open-loan count has to include the loans this
endpoint issued on this host, not just the seeded ones; counting only the seed
lets a member borrow forever by retrying, and the gate's second POST for m-007
is exactly that retry. And the warning has to name the member's *most overdue*
loan rather than the book being borrowed now - the two happen to differ for
m-007, which is the only reason a wrong implementation shows up.

The model answer's reasoning: every input is a parameter -
the store, the clock, the options, the notifier - so the second host in the
gate can change all four at once and the handler needs no knowledge that it is
being tested. That is the whole idea the set has been circling: code that takes
its dependencies is code you can put in a harness, and code that reaches for
them is code you can only run.

## Further reading

- [Integration tests in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/test/integration-tests) - `WebApplicationFactory`, `WithWebHostBuilder`, and replacing registrations for a test host.
- [Dependency injection in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/dependency-injection) - service lifetimes, and what a singleton is actually scoped to.
- [TimeProvider class](https://learn.microsoft.com/en-us/dotnet/api/system.timeprovider) - the abstraction over "now", and why it is abstract.
- [Options pattern in ASP.NET Core](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/configuration/options) - binding a section to a class and reading it through `IOptions<T>`.
- [Create responses in minimal API applications](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/minimal-apis/responses) - `TypedResults.Created`, `ValidationProblem` and custom status codes.
- [RFC 9110 section 9.2.2](https://www.rfc-editor.org/rfc/rfc9110#name-idempotent-methods) - what idempotent means, and why a retry must be safe.
