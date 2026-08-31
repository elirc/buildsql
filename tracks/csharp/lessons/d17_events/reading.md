# Reading - csharp/d17_events

## Notes

An event is a delegate field with two doors nailed shut. Outside the declaring
class you may only `+=` and `-=`; you cannot read it, assign it, or invoke it.
That single restriction is the whole feature, and it exists because a plain
public delegate field lets any caller overwrite every subscription or raise the
event on the publisher's behalf.

The pattern uniting these eight problems is that **the publisher owns the
list**. Every question worth asking about an event is a question about that
list: is it empty (ex1), what does it carry (ex2), what order does it run in
and what happens to duplicates (ex3), how does a subscriber get back off it
(ex4), who is counting it (ex5), and what happens when walking it goes wrong
(ex6 and ex7). Once you have written `GetInvocationList()` a few times, the
combined delegate stops being magic: it is an array of delegates and a loop.

Two of the problems exist because `Delegate.Invoke` on a multicast delegate is
a blunt instrument. It stops at the first exception and it throws away every
return value but the last. Neither is a bug - both are the documented
behaviour - but both are wrong often enough that real publishers loop by hand.

## ex1

Really testing: the two-line raise, and the crossing. The null-conditional
`Boiled?.Invoke(this, EventArgs.Empty)` is the idiom, and the reason it matters
is that an event with no subscribers is `null`, not an empty list - so an
unguarded raise is a `NullReferenceException` on the very first call in
production and never in your tests. The classic mistake in the logic is testing
only the new temperature, which raises again on every subsequent heat; the
event is about the transition, so you have to remember what was true before.
(In multi-threaded code you would also copy the delegate to a local first, since
`?.` already does that for you.)

## ex2

Really testing: the `EventHandler<TEventArgs>` shape. A custom args class
derives from `EventArgs`, is immutable, and carries what the handler needs to
do its job without calling back into the publisher. The classic mistake is
putting the shipped quantity in `Remaining`; the second is raising the event
before the state has been updated, so a handler that reads `warehouse.Remaining`
sees the old number. Note also the order in `Ship`: validate, then mutate, then
raise - a refused shipment must leave no trace, which is why the check comes
before the subtraction rather than after.

## ex3

Really testing: that `+=` builds a list, not a set. Subscribing the same
handler twice really does register it twice and it really is called twice;
`-=` removes one copy, and specifically the last matching one. That surprises
people who use an event as a "register once" hook. `Silence` is the other half
of the lesson: `Rung = null` is a plain assignment that only compiles inside
`Bell`, because outside the class an event exposes nothing but its two
accessors. That is the difference between an event and a public delegate field,
and it is the reason to prefer the event.

## ex4

Really testing: the subscription token, and why it is needed. `-=` compares
delegates, and two separately written lambdas with identical bodies are
different objects - so `feed.Rung -= item => Log(item)` removes nothing at all
and the leak is silent. The fix is to keep the delegate instance, and the
tidiest way to hand it back is a closure that already holds it. The `removed`
flag is the extra care: without it a second call to the unsubscriber removes
one more copy of the same handler, which is somebody else's subscription when
the handler was registered twice. This is exactly the shape `IObservable<T>`
uses, with an `IDisposable` in place of the `Action`.

## ex5

Really testing: that the field-like event you normally write is shorthand. When
you write `public event EventHandler Entered;` the compiler generates a private
delegate field and a pair of accessors; spell them out and you can do anything
else you like in them. The instructive requirement is the stranger: `-=` for a
handler that was never added is a silent no-op on the delegate, so a naive
`Subscribers--` drifts below zero and the counter lies. Recomputing from
`GetInvocationList().Length` instead of tracking increments is the robust move,
and it is a good habit generally - derive state you can derive.

## ex6

Really testing: exception isolation across a multicast raise. `Message?.Invoke`
compiles into one call that walks the invocation list internally, so the first
handler to throw unwinds out of the publisher and the rest are simply skipped -
the publisher is now at the mercy of the worst subscriber it has. Looping over
`GetInvocationList()` with a `try` around each call is the standard fix, and
the important detail is that the caught exception object is stored as-is;
wrapping or rethrowing a new exception loses the original stack trace. Real
publishers usually finish by throwing an `AggregateException` when the list is
non-empty; here it is returned so the gate can inspect it.

## ex7

Really testing: what a multicast delegate does with return values. It calls
every handler and hands back only the last one's result - which is not a bug,
because there is nowhere else to put four answers, but it is almost never what
the author wanted. `GetInvocationList()` gives the array; casting each entry
back to `Func<int>` and calling it collects them all. The classic mistake is
assuming the earlier handlers did not run, and the classic *design* mistake is
using an event for something that needs answers at all - an
`IEnumerable<IVoter>` would say what is meant far more plainly.

## ex8

Really testing: everything above, generalised. The dictionary is keyed by
`typeof(T)`, which is what makes `Publish("hi")` reach the string handlers and
leave the int handlers alone; the values are `List<Delegate>` because a
dictionary cannot hold a differently-typed `Action<T>` in each slot, so the
cast back on the way out is unavoidable and is safe precisely because the key
guarantees it. The trap is re-entrancy: a handler that subscribes while the
message is being delivered mutates the list you are iterating, which throws
`InvalidOperationException`. Taking a snapshot with `ToArray()` first both
fixes that and gives the delivery a clear rule - this message goes to the
handlers that were registered when it was published.

## Further reading

- [Events](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/events/) - what the `event` keyword adds to a delegate field.
- [How to raise base class events](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/events/how-to-raise-base-class-events-in-derived-classes) - and the `OnXxx` protected-method convention.
- [`EventHandler<TEventArgs>`](https://learn.microsoft.com/en-us/dotnet/api/system.eventhandler-1) - the standard shape ex1, ex2 and ex5 follow.
- [`Delegate.GetInvocationList`](https://learn.microsoft.com/en-us/dotnet/api/system.delegate.getinvocationlist) - the array behind every multicast delegate, and the key to ex6 and ex7.
- [How to implement custom event accessors](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/events/how-to-implement-custom-event-accessors) - the `add`/`remove` form ex5 uses.
- [`AggregateException`](https://learn.microsoft.com/en-us/dotnet/api/system.aggregateexception) - what ex6's list of failures usually becomes.
