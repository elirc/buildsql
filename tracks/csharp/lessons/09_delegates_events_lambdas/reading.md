# Reading - csharp/09_delegates_events_lambdas

## Notes

**A delegate is an object, not a function pointer.** It holds two things: a
target (the object the method belongs to, or null for a static method) and a
method. That is why a delegate can keep an object alive — the delegate
references the target — and it is the mechanism behind the most common memory
leak in .NET, described under ex3 below. It is also why delegates can be
*multicast*: the object holds an invocation list, and `+` appends to it.

**`Func` and `Action` are just declared delegate types.** The framework
declares `Func<TResult>` through `Func<T1,...,T16,TResult>` and `Action`
through `Action<T1,...,T16>`, so you almost never declare your own. When you do
see a custom `public delegate int Comparison<in T>(T x, T y);`, the reason is
usually a name that documents intent better than `Func<T,T,int>` does — and
occasionally `ref`/`out` parameters, which `Func` cannot express.

**Lambdas capture variables, not values.** The compiler rewrites a capturing
lambda into a hidden class with a field per captured variable, and rewrites the
*enclosing method* to use that field too. So there is genuinely only one
variable, shared between the method and every lambda that captured it. That
explains both the useful case (a counter that persists) and the surprising one
(three lambdas all seeing the loop's final value).

**Lambdas versus local functions.** A local function (`int Twice(int n) => n * 2;`
declared inside a method) is often better when you do not need a delegate: it
can be recursive, it can use `ref` and `out`, and it allocates nothing unless it
is captured. If you are writing a helper for the current method only, prefer a
local function; if the helper needs to be *passed* somewhere, you need a
delegate.

**Allocation, briefly.** A non-capturing lambda is cached by the compiler and
allocates once for the whole program. A capturing lambda allocates a closure
object each time the enclosing scope runs. That matters in hot loops and
nowhere else, and the fix — passing state through an overload that takes it as
an argument, like `List.Sort(Comparison<T>)` versus a captured comparer — is
worth recognising when you see it in framework source.

## ex1

The three methods are `Select`, `Count(predicate)` and a `for` loop by another
name, which is exactly what lesson 10 is going to point out. Writing them by
hand is the same trick as writing the iterators by hand in lesson 08: LINQ
stops being magic when you have already built two of its operators.

The design idea worth taking away is *inversion*: `CountWhere` owns the loop
and the counting, and hands the interesting decision back to the caller. When
you see a method with a `bool includeInactive` parameter, or three near-copies
differing by one `if`, that is the shape a `Func<T, bool>` collapses.

`Action<int>` versus `Func<int, T>` marks the divide between something done for
its *effect* and something done for its *result*. It is a useful signal in a
signature: an `Action` tells the reader "this changes the world" and a `Func`
tells them "this computes an answer".

## ex2

The `for` loop giving `3, 3, 3` is one of the most-asked C# interview questions,
and the answer is one sentence: **the lambda captured the variable, and the
loop has only one of them.** By the time you invoke the lambdas, that variable
holds the value that ended the loop.

The `foreach` version giving `0, 1, 2` is the same sentence with a different
fact attached: since C# 5, `foreach` declares a fresh iteration variable each
time round. Before C# 5 it did not, and the change was a rare *breaking* change
to the language — accepted because the old behaviour was, in the design team's
own words, wrong more often than right.

If you want the per-iteration behaviour in a `for` loop, copy into a local
inside the loop body:

```csharp
for (int i = 0; i < 3; i++)
{
    int captured = i;         // a new variable per iteration
    functions.Add(() => captured);
}
```

Which is precisely what you were told *not* to do in the exercise, because
seeing the trap once is worth more than avoiding it. The same bug appears with
`Task.Run(() => Process(i))` inside a loop, with event handlers wired in a
loop, and with timers — and the symptom is always "they all processed the last
item".

## ex3

Events are delegates with two restrictions: outside the declaring class you may
only `+=` and `-=`, and you may not invoke. That is what stops a consumer of
your class from raising `PriceChanged` on your behalf or wiping the subscriber
list with `=`.

`?.Invoke(...)` is the required idiom, and it does two things. It skips the
call when nobody has subscribed (an event with no subscribers is genuinely
`null`), and it reads the delegate into a temporary first, so a subscriber
unsubscribing on another thread between the check and the call cannot cause a
`NullReferenceException`.

The "only raise on an actual change" rule matters more than it looks. Handlers
often trigger more work — a redraw, a save, another event — and an event that
fires when nothing happened turns into a feedback loop or a performance
problem. The same discipline appears in `INotifyPropertyChanged`
implementations everywhere.

The leak worth knowing about: subscribing with `+=` gives the *publisher* a
reference to the *subscriber*. If a long-lived ticker holds a handler belonging
to a short-lived window, that window can never be collected — the classic .NET
memory leak. The fix is symmetric unsubscription (`-=`) or a weak event pattern,
and it is a good interview answer because it shows you understand a delegate
holds its target.

## ex4

Returning a function is where higher-order code starts feeling powerful. Both
methods here are *combinators*: they take behaviour and produce new behaviour
without doing anything themselves. `Compose` is function composition;
`Combine` is what `+` already does for delegates, written out by hand.

The `params` empty case falling out for free is worth noticing — the loop that
never runs returns the input unchanged, so "compose nothing" is the identity
function without a special case. Whenever an operation has a natural "do
nothing" value (0 for addition, "" for concatenation, identity for composition),
your code gets shorter by leaning on it instead of branching around it.

`Combine(null, null)` returning a working no-op `Action` rather than `null` is
the null-object pattern again. The rule of thumb it comes from: **make the
absent case something the caller can use**, so they do not need a null check
that they will eventually forget.

## challenge

This is ASP.NET Core's pipeline, and building it once makes the whole framework
legible. `app.UseAuthentication()`, `app.UseRouting()`, `app.UseEndpoints()` are
each registering a `Func<RequestDelegate, RequestDelegate>` — a function taking
"the rest of the pipeline" and returning a new "rest of the pipeline". Order of
registration is order of nesting. A middleware that does not call `next` never
reaches your endpoint, which is exactly how a 401 happens.

The reverse loop is the part that catches people. To make the first-listed
middleware outermost, you must wrap it *last*, so you build from the core
outward — iterating the array backwards. Getting this wrong produces code that
still runs every middleware but nests them inside out, and the tell is that the
"on the way out" work happens in the wrong order. The gate's two orderings are
designed so that a sequence-not-a-nest implementation gives the same answer to
both, which is the fastest way to spot it.

The general pattern has a name — the decorator — and it is the composition
answer to "I want to add behaviour to something I do not own". Logging,
caching, retries, timing and authorisation are all decorators in real
codebases, and none of them requires touching the thing being decorated.

## review1

`MakeAdder` is the counter with an argument, and the gate's second adder is
the check that matters: if your state was `static`, both adders would share it
and the second would start at 5. Each call to `MakeAdder` creates a new
closure; that is the whole difference between captured state and global state,
and it is why closures are a reasonable alternative to small classes.

`Not` is a combinator like ex4's, and the assertion that the original predicate
still works is not a formality. Delegates are immutable in the way that
matters: `+`, `-` and any wrapping produce *new* delegates. Nothing you do to a
`Func` can change what the caller's copy points at, which is what makes passing
them around safe.

The extension-method note in the hints is a small preview of how LINQ is
actually shaped: `items.Where(...)` is a static method with `this` on its first
parameter, and lesson 10 is where that syntax finally pays off.

## Further reading

- [Delegates](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/delegates/) — what a delegate is, multicast invocation, and the older declaration syntax.
- [Lambda expressions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/lambda-expressions) — including the capture rules and expression versus statement bodies.
- [`Func<T,TResult>`](https://learn.microsoft.com/en-us/dotnet/api/system.func-2) and [`Action<T>`](https://learn.microsoft.com/en-us/dotnet/api/system.action-1) — the two families you will use every day.
- [Events](https://learn.microsoft.com/en-us/dotnet/csharp/events-overview) — the pattern, the naming conventions, and raising safely.
- [Local functions versus lambda expressions](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/local-functions#local-functions-vs-lambda-expressions) — when each one is the better tool.
- [ASP.NET Core middleware](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/) — the challenge's pattern, at production scale.
