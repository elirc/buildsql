# Reading - csharp/i3_interview_rapidfire

## Notes

**Why this lesson is short and keeps coming back.** Everything here you have
already learned once. The problem is that "learned once" decays on a predictable
curve, and the fix — established by about a century of memory research — is
spaced retrieval: recall the thing at increasing intervals, from memory, with
effort. Not re-reading. Recalling. `dojo review` schedules these at 3, 7, 21 and
60 days precisely because that is roughly where the forgetting curve puts you.

**Retrieval has to be effortful to work.** If you glance at the hints first, you
have converted a retrieval exercise into a reading exercise, and reading
produces almost none of the strengthening. Attempt cold, get it wrong, *then*
look — that sequence is worth several times a comfortable re-read, and the
mild frustration is the feature.

**Say it, do not just write it.** Every gate here checks code, but the thing
you actually need on the day is a sentence. After each exercise goes green, say
the rule out loud in one sentence without looking. If you cannot, the code
passing did not mean what you hoped.

**What "[***]" means in practice.** These four concepts — value semantics,
the equality/hash contract, deferred execution and `Task.WhenAll` behaviour —
account for a startling share of C# interview questions, because each one is a
place where the language does something specific that you either know or do not.
There is no reasoning your way to "a `List<T>` indexer returns a copy" in the
room.

## ex1

Three containers, three behaviours, one rule underneath: a value type is copied
whenever it is assigned, passed or returned — and array indexing is the
exception, because it produces a *reference into the array's storage* rather
than a value.

That is why `array[0].Brightness = 9` compiles and works, `list[0].Brightness = 9`
does not compile at all (the compiler knows the write would be discarded, and
refuses rather than lying to you), and `Bump(pixel)` cannot touch the caller's
value.

The modern footnote worth knowing: `CollectionsMarshal.AsSpan(list)` gives you a
`Span<T>` over a `List<T>`'s backing array, and indexing a span *is* a `ref`
return — so the direct write works there. You will not often need it; knowing
why it works is the same knowledge as knowing why the list version does not.

The sentence: **structs copy on assignment, argument passing and collection
reads; arrays hand out references into their storage.**

## ex2

The contract again, in a fresh shape: equal objects must return equal hash
codes, or the hashed collection never gets as far as comparing them. The
`HashSet` in `DistinctCount` is the demonstration — with no overrides at all it
returns 3, because a plain class inherits reference equality from `object`.

The hash-quality point is the one that separates a passing answer from a good
one. `X ^ Y` satisfies the contract (equal coordinates hash equally) and is a
bad hash, because `(5, 6)` and `(6, 5)` collide, as does every mirrored pair.
Collisions are legal and handled — by a linear scan within the bucket — so a bad
hash does not break correctness, it silently removes the performance you chose
the data structure for. `HashCode.Combine` mixes properly and is one call.

The type test in `Equals` handles both the wrong type and null in one
expression, which is why `obj is Coordinate other && ...` is the idiom rather
than a null check followed by a cast.

The sentence: **equal objects must hash the same, or the lookup looks in the
wrong bucket and never even calls your `Equals`.**

## ex3

Two mechanisms that are constantly confused with each other, deliberately put in
one exercise.

**Deferred execution** is about *when the query runs*: never at the point you
write it, always at the point something enumerates it, and again on every
subsequent enumeration. That is why moving the threshold between two
enumerations of the same query object changes the answer — and why a query is a
liability to hand to code that might enumerate it twice.

**Capture** is about *what the lambda remembers*: the variable, not the value.
One `for` loop variable shared by three lambdas gives three lambdas that all see
the loop's final value; a fresh local per iteration gives each its own. `foreach`
has declared a fresh variable per iteration since C# 5, which is why the same
mistake in a `foreach` no longer bites.

Put together, they explain a whole family of production bugs: a query built
inside a loop capturing the loop variable, evaluated after the loop finished.
Every element comes back matching the last iteration.

The sentences: **a query is a plan, re-run on every enumeration** and **a lambda
captures the variable, not the value.**

## ex4

`Task.WhenAll`'s three behaviours, all of which get asked:

1. It waits for **every** task, even after one has faulted. Usually right — no
   orphaned work continuing in the background — occasionally not, and `WhenAny`
   plus a cancellation token is the fail-fast alternative.
2. Awaiting it rethrows only the **first** exception. The rest are not lost:
   they are on the `WhenAll` task's `AggregateException` and on the individual
   tasks. When ten uploads fail, "one timed out" is a much worse log line than
   the full list, and getting the full list means looking at the tasks.
3. Each task knows its own outcome — `IsCompletedSuccessfully`, `IsFaulted`,
   `IsCanceled`, `Exception` — which is what makes "wait for everything, then
   report" a two-step operation rather than one.

The bare `catch` in the reference implementation is unusual and defensible
precisely because the next line inspects every outcome individually. The
question worth having an answer to: should a cancelled task count as a failure
here? For a "how many succeeded" report, probably yes; for anything that logs,
almost certainly not.

The sentence: **`WhenAll` waits for all of them and rethrows the first failure;
the outcomes live on the tasks.**

## review1

Three facts, three one-liners, no notes — and if any of them took more than
thirty seconds, the fix is not more code, it is `i1`'s question bank.

`Equals` on two boxed `7`s is true, while `==` on the same two variables typed
`object` is false: the operator is chosen at compile time from the static type,
the method is dispatched at run time on the actual object. `Trim` cannot change
the caller's string because no operation in .NET mutates an existing string.
And a box holds a copy taken at the moment of boxing, so moving the variable
afterwards leaves the box alone.

These are the three most commonly confused [***] facts in the language, and they
are all one sentence each. That is the standard to hold yourself to: not "I
could work it out", but "I can say it".

## Further reading

- [Value types](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/builtin-types/value-types) — copy semantics, stated formally.
- [`CollectionsMarshal.AsSpan`](https://learn.microsoft.com/en-us/dotnet/api/system.runtime.interopservices.collectionsmarshal.asspan) — the `ref` view over a `List<T>`, and why it exists.
- [`Object.GetHashCode`](https://learn.microsoft.com/en-us/dotnet/api/system.object.gethashcode) — the contract and the consequences of a poor hash.
- [Deferred execution](https://learn.microsoft.com/en-us/dotnet/standard/linq/deferred-execution-lazy-evaluation) — which operators defer and which do not.
- [`Task.WhenAll`](https://learn.microsoft.com/en-us/dotnet/api/system.threading.tasks.task.whenall) — the exception behaviour, spelled out in the remarks.
- [Lambda expressions and capture](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/lambda-expressions#capture-of-outer-variables-and-variable-scope-in-lambda-expressions) — the official statement of what a closure captures.
