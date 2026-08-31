# Reading - csharp/d14_sets_queues_stacks

## Notes

Each of these structures answers exactly one question fast, and the drill is
matching structure to question without thinking. "Have I seen this?" is a
`HashSet`. "Who is next?" is a `Queue`. "What was most recent?" is a `Stack`.
The set problems (ex1, ex2, ex6) are about letting the built-in operations do
the work instead of hand-rolled loops; the queue problems (ex3, ex5) are about
front-first order and safe behaviour at empty; the stack problems (ex4, ex7,
ex8) all exploit the same property - a stack remembers not just how much
happened but the ORDER it happened in, so unwinding comes out backwards, which
is exactly what undo, back-buttons and nested arithmetic need.

## ex1

Really testing: that `HashSet<T>.Add` is a test and an insert in one call -
it returns false when the item was already present, so "first duplicate" needs
no `Contains` and no second pass. The classic mistake is `Contains`-then-`Add`,
which works but does two hashes per item, or collecting counts in a dictionary
when the question only needs membership. `CountUnique` is the constructor plus
`Count`: feeding a sequence into `new HashSet<string>(ids)` deduplicates as it
builds. One pass, one set, both answers.

## ex2

Really testing: the mutating set operations. `IntersectWith`, `ExceptWith` and
`UnionWith` all modify the set they are called on - so build a scratch set
from one argument, apply the operation with the other, and read the result.
The classic mistake is nested `Contains` loops that re-implement intersection
in O(n * m), or forgetting that day 1's duplicate sign-ins must count once
(the set eats them at construction). Ordering is not the set's job: sets have
no order, so the A-Z comes from `OrderBy` on the way out.

## ex3

Really testing: the difference between looking and taking. `UpNext` must not
mutate - enumerating a `Queue` (or `Take(count)` over it) walks front to back
without removing, while `Dequeue` removes. The classic mistake is implementing
the preview with `Dequeue` and re-`Enqueue`, which reorders nothing visibly in
a short test but wrecks the queue's state when it is short. `TryDequeue` gives
the null-on-empty contract in one call; `Postpone` is dequeue-then-enqueue and
is why round-robin schedulers are queues.

## ex4

Really testing: what to push and when. `Type` must push the text as it was
BEFORE the append - push-after gives an undo that restores the state you are
already in, an off-by-one that the gate's first `Undo` catches. The classic
mistake beyond that is undoing by string surgery (trimming the added suffix),
which breaks as soon as additions overlap; snapshots on a stack are dumb and
therefore correct. `Undo` checks `Count` before popping - an empty stack
throws on `Pop`, and "nothing to undo" is an answer, not an error.

## ex5

Really testing: the sliding-window idiom - a queue of timestamps where
arrivals join the back and expiries leave the front. Because request times
never decrease, the oldest allowance is always at the front, so eviction is a
`while` loop on `Peek`. Two classic mistakes: remembering REFUSED requests
(only grants occupy the window), and the boundary - an allowance at time t
dies at exactly t + window, so the eviction test is `<= second - window`. The
gate's second 10 request exists purely to catch a `<` where a `<=` belongs.

## ex6

Really testing: the query methods that do not mutate - `Overlaps`,
`IsSupersetOf`, `SetEquals` - and their empty-set edges. Overlap with an empty
requirement is FALSE (there is nothing to share), while superset-of-empty is
TRUE (nothing is missing); one is an existence claim, the other a universal
one, the same vacuous-truth logic as `All` over an empty sequence in LINQ.
The classic mistake is `SequenceEqual` for crew comparison, which is order-
and duplicate-sensitive - `SetEquals` accepts any `IEnumerable` and compares
membership only.

## ex7

Really testing: modelling a process with two stacks. Going back pushes the
current page onto forward; going forward pushes it onto back; each is the
other's inverse, which is why the same page shuttles between them. The design
decision the gate insists on: `Visit` clears the forward stack - after
branching to a new page, the old future is unreachable, exactly like a real
browser. The classic mistake is forgetting that clear, leaving a "forward"
that jumps to a page you never came from. Guard both moves with `Count`,
return false, and change nothing on the refusal.

## ex8

Really testing: why postfix notation and stacks are the same idea. Numbers
wait on the stack; an operator consumes the top two - and the FIRST pop is the
RIGHT operand, because it was pushed last, which is what makes "8 2 -" equal
6 and not -6. The classic mistake is popping into left-then-right order. Error
handling comes almost free: `Pop` on empty already throws
`InvalidOperationException` for the missing-operand case, so the only checks
you write are the unknown token (`FormatException`) and the end-state rule
that exactly one value remains. This is also how every expression compiler
evaluates its intermediate code, so the exercise is less artificial than it
looks.

## Further reading

- [HashSet&lt;T&gt;](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.hashset-1) - Add's bool, the *With operations, Overlaps/IsSupersetOf/SetEquals.
- [Queue&lt;T&gt;](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.queue-1) - Enqueue, Dequeue, TryDequeue, Peek, enumeration order.
- [Stack&lt;T&gt;](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.stack-1) - Push, Pop, TryPop, and what Pop throws.
- [Reverse Polish notation](https://en.wikipedia.org/wiki/Reverse_Polish_notation) - the background for ex8.
- [Selecting a collection class](https://learn.microsoft.com/en-us/dotnet/standard/collections/selecting-a-collection-class) - the official version of "match the structure to the question".
