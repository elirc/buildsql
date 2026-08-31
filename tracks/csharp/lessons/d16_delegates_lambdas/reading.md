# Reading - csharp/d16_delegates_lambdas

## Notes

The skill being drilled is writing methods whose parameters and return values
are *other methods*. A `Func<A, R>` is not a special language feature you have
to think about; it is a value with a shape, and the only thing that makes it
feel strange at first is that the shape is "call me later with an A".

The pattern uniting all eight problems is the **returned closure**. In seven of
them a method builds a lambda, that lambda captures something from the
enclosing scope - a parameter, a local, a field - and the lambda outlives the
method that made it. The captured variable is hoisted onto a compiler-generated
object that lives as long as the delegate does, which is why `Once` can
remember whether it ran, why `MakeAccount` can hand out two lambdas that see
the same balance, and why two calls to `MakeDiscounter` do not interfere.

The second thread is **combinators**: functions that take functions and return
functions. `Both`, `Reversed`, `Then`, `Bind`, `Flip` and `Pipe` are all under
five lines each, and none of them does any work at the moment you call it -
they only build a new function whose body will do the work later. Once you can
write those six from memory, the entirety of LINQ stops being surprising.

## ex1

Really testing: that a `Func` is a value you can return, store and hand on. The
classic mistake is writing `ForName` so that it *does* the arithmetic - taking
the operands as parameters - because that is what a method usually does; the
signature is the whole point, and it says the operands are not available yet.
The second mistake is in `Twice`, where `transform(x) * 2` and
`transform(transform(x))` agree for doubling and disagree for everything else.
The model answer uses a `switch` expression whose arms are lambdas, so the
lambda is only created for the branch that is chosen.

## ex2

Really testing: that `&&` and `||` are short-circuiting, and that a combinator
built out of them inherits that. The classic mistake is
`item => first(item) & second(item)` - one character, and it turns two cheap
predicates into two expensive ones, or worse, calls a predicate that would
throw on the data the first one already rejected. That is not a hypothetical:
`Both(x => x != null, x => x.Length > 0)` is only safe because of the
short-circuit. The model answer is `item => first(item) && second(item)`, and
its correctness is entirely inherited from the operator.

## ex3

Really testing: capture of a *parameter*, which is the safe case. Each call to
`MakeDiscounter` gets its own `rate` variable, so each returned lambda closes
over a different one, which is why the two discounters are independent. The
classic mistake is thinking of the price rather than the rate as the fixed
thing and returning `rate * (1 - price)`; the second is returning the discount
amount rather than the discounted price. Contrast this with capturing a loop
variable, where every lambda closes over the *same* variable - that is the
famous trap, and the reason `foreach` was changed in C# 5 to give each
iteration a fresh one.

## ex4

Really testing: mutable state living in a closure. `bool ran` is a local, so it
would normally die when `Once` returns - but because a lambda uses it, the
compiler moves it onto a heap object that the delegate holds. The classic
mistake is a `static bool` field on `Guards`, which passes the first assertion
and then fails the moment a second wrapper is made, because all wrappers share
it. In `After`, the off-by-one is the other trap: `After(3, a)` fires on call
three, so the counter is incremented *before* the comparison and the test is
`>=`, not `==` - `==` would make it a one-shot.

## ex5

Really testing: that `Comparison<T>` is just a delegate, so ordering rules
compose like any other function. `Reversed` is written as
`(a, b) => inner(b, a)` rather than `-inner(a, b)` for a real reason: a
comparison is allowed to return any negative number, and `-int.MinValue`
overflows back to `int.MinValue`, so negation can report "less than" for a pair
that was greater. `Then` is the tie-breaker shape every multi-column sort uses,
and the classic mistake is adding or multiplying the two results instead of
consulting the second only when the first returned zero.

## ex6

Really testing: two delegates sharing one captured variable. This is where
closures stop looking like syntax and start looking like objects - the hidden
class the compiler generates has a field for `balance`, and both lambdas hold a
reference to the same instance of it. The classic mistake is capturing the
value instead of the variable, usually by copying `balance` into the lambda's
own local; then `Balance()` keeps reporting the opening figure forever. Note
also where the guard lives: inside the lambda, because the lambda is the only
door to the variable, and it throws before mutating so a refused deposit leaves
no trace.

## ex7

Really testing: reading and writing generic delegate signatures. The bodies are
one line each; the difficulty is entirely in the type parameters, and the way
to get them right is to write the desired call first and let it dictate the
signature. `Pipe<TIn, TMid, TOut>` is the instructive one - `TMid` appears as
`f`'s return type and `g`'s parameter type and nowhere in the result, which is
exactly what "f ends where g begins" means in types. The classic mistake is
composing in the other order and producing `f(g(x))`, which usually will not
even compile once the types differ, and that failure to compile is the type
system doing its job.

## ex8

Really testing: a whole feature built from stored predicates. The interesting
decision is the polarity - a rule answers `true` when the data is *good* and
its message is reported when it answers `false`. Getting that backwards is the
classic mistake and it reads fine until you see the output. The second is
returning a new `Validator<T>` from `Require`, which makes the fluent chain
silently drop every rule but the last. The model answer stores
`(string, Func<T, bool>)` pairs in a list and `Check` runs all of them - not
stopping at the first failure - because a form that complains once per submit
is worse than one that lists everything wrong at once.

## Further reading

- [Delegates](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/delegates/) - the language feature underneath `Func` and `Action`.
- [`Func<T, TResult>`](https://learn.microsoft.com/en-us/dotnet/api/system.func-2) and [`Action<T>`](https://learn.microsoft.com/en-us/dotnet/api/system.action-1) - the two built-in families.
- [Lambda expressions](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/lambda-expressions) - including the capture rules ex3, ex4 and ex6 depend on.
- [`Comparison<T>`](https://learn.microsoft.com/en-us/dotnet/api/system.comparison-1) - the delegate ex5 builds, and what its return value means.
- [`List<T>.Sort`](https://learn.microsoft.com/en-us/dotnet/api/system.collections.generic.list-1.sort) - note the explicit statement that the sort is unstable.
- [Boolean logical operators](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/operators/boolean-logical-operators) - `&&` versus `&`, which is all ex2 is about.
