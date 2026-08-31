# Reading - typescript/d02_functions_signatures

The debrief. Per problem: what the signature was really being marked on, the
mistake that costs the point, and one sentence on why the model answer is
shaped the way it is.

## Notes

**The skill this set drills is writing the contract before the body.** Every
one of these eight problems is easy once the signature exists, and most of them
are ambiguous until it does. Optional versus defaulted, one parameter versus a
rest parameter, a callback typed by hand versus one typed by its position, one
loose signature versus a pair of overloads - those choices are the exercise,
and the runtime behaviour is the sanity check on them.

**Optional and defaulted look the same from outside and are not the same
inside.** `author?: string` gives the body `string | undefined` and forces you
to handle the missing case; `format: Formatter = fallback` gives the body a
`Formatter` with no `undefined` in sight, because the default has already run
by the time your first line executes. Both render as `?` in `Parameters<>`,
which is why the type gate cannot tell them apart and why the choice is about
the body, not the caller.

**A callback parameter is a type, and types in parameter position are
contravariant.** That is the sentence behind every "why will it not accept my
function" question: `(n: number) => boolean` is not a
`(value: string) => boolean`, because a caller of the second is entitled to
hand it any string. `strictFunctionTypes` is what turns that from a warning
into an error, and it is on here.

**Overloads exist for exactly one situation: the result type depends on the
argument type.** `string | string[]` in and `string | string[]` out is honest
and useless, because every caller must then narrow a result they already knew
the shape of. Two overload signatures over one implementation signature move
that knowledge into the type system, which is where it was all along.

**And a function that returns a function is a closure question wearing a type
question's clothes.** `makeCounter` and `runMiddleware` both live or die on
where the state is declared: inside the factory (one per counter) or inside the
returned function (recreated on every call, which is the bug).

## ex1 - a shelf label

What this was testing: that `author?: string` is what you reach for, and that
you handle three missing-ish cases rather than one. `undefined`, `""` and
`"   "` all mean "no author", and only the first is what the type system warns
you about.

The classic mistake is `author !== undefined`, which passes the type checker,
passes the first two assertions, and renders `"Dune -    "` for the third.

The model answer trims once into a local and tests that local for truthiness,
so the type question and the data question are answered in the same line.

## ex2 - join a path

What this was testing: a rest parameter, and the fact that zero arguments is a
legal call for one. `joinPath()` has to work, which rules out any implementation
that reads `segments[0]` before checking the length.

The classic mistake is `segments.join("/")` on its own: it is right for the
happy path and wrong for every segment that carries its own slashes, producing
`"/books//dune/"` from perfectly reasonable input.

The model answer normalises each segment first - strip slashes, drop what is
left if it is empty - and only then joins, which makes the empty-input case fall
out for free rather than needing a branch.

## ex3 - count what matches

What this was testing: writing a callback type by hand, and the contravariance
rule that makes a wrongly-typed predicate a compile error rather than a runtime
surprise. The gate also checks the predicate is called once per value, in order,
which rules out clever double-passes.

The classic mistake is `values.filter(keep).length`, which is correct but
allocates an array to throw it away; the interview-visible version counts as it
walks. Neither is wrong - having a reason is the point.

The model answer is one loop and one counter, and it names the callback
parameter `keep` rather than `fn`, because a predicate that reads
`if (keep(value))` documents itself.

## ex4 - a named formatter type, with a default

What this was testing: naming a function type with a `type` alias, and knowing
that a defaulted parameter is optional to the caller but not to the body. The
shipped `Formatter` returns `unknown`, which is assignable *from* everything and
therefore checks nothing.

The classic mistake is declaring `format?: Formatter` and then writing
`format ? format(value) : value.toFixed(2)` inside the loop - correct, but it
re-asks the question on every element and spreads the default across two places.

The model answer puts the default in the signature, so the body has exactly one
code path and the default is visible in the API rather than buried in an `if`.

## ex5 - one function, two contracts

What this was testing: overloads. The two overload signatures are the public
API; the implementation signature underneath is invisible to callers and can be
as loose as it needs to be, which is why `string | string[]` is fine *there* and
wrong as the only signature.

The classic mistake is making the implementation signature one of the overloads
by accident - TypeScript only exposes the declared overloads, so if you write
three signatures where the third is the implementation, callers see two.

The model answer narrows inside the implementation with a simple
`Array.isArray` check and delegates the array case to the scalar one, so the
normalising rules exist in exactly one place.

## ex6 - a counter that owns its state

What this was testing: closures, and an interface whose members are methods.
`next()`, `peek()` and `reset()` share one `let` that lives in `makeCounter`'s
scope, and `reset` needs the original `start` - which is already captured, for
free, because parameters are part of the closure.

The classic mistake is declaring the counter variable inside `next`, which
resets it on every call; the second-classic is module-level state, which makes
every counter the same counter and is caught by the last assertion in the gate.

The model answer returns an object literal of three arrow functions, so `this`
never enters the conversation - which is the honest reason most modern factory
functions avoid classes for this shape.

## ex7 - build a query string

What this was testing: an optional object parameter typed as a bag of scalars,
and the discipline of a deterministic output. Sorting the keys is not
decoration: an unsorted query string makes two identical requests cache-miss
each other.

The classic mistake is `if (!params)`, which is right, followed by forgetting
that `{}` also has to return the bare base - and then forgetting that `false`
and `0` are values, so a truthiness filter over the entries drops them.

The model answer sorts `Object.entries`, encodes both halves with
`encodeURIComponent`, and joins with `&`, treating "no pairs" and "no params" as
the same case rather than two.

## ex8 - a middleware chain

What this was testing: a recursive function type used as a parameter type, and
the onion order that Express, Koa and every HTTP framework you will meet are
built on. The gate checks `in:1, in:2, out:2, out:1`, which no `reduce`-of-
transforms implementation can produce.

The classic mistake is treating middleware as a pipeline of `(value) => value`
transforms. That gives you the right answer for `[upper]` and the wrong one the
moment a middleware wants to do something *after* the rest of the chain has run.

The model answer is a `dispatch(index)` helper that returns the `next` function
for that position; the base case - an index past the end - simply returns its
input, which is what makes an empty chain and a fully-consumed chain the same
code path.

## Further reading

- [Handbook: More on Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html) - optional and default parameters, rest parameters, call signatures, and the overload rules ex5 depends on.
- [Handbook: Function overloads](https://www.typescriptlang.org/docs/handbook/2/functions.html#function-overloads) - why the implementation signature is not callable, and how to choose between overloads and a union.
- [TypeScript release notes: strictFunctionTypes](https://www.typescriptlang.org/tsconfig/#strictFunctionTypes) - the contravariance rule behind ex3.
- [MDN: Closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures) - the JavaScript half of ex6 and ex8.
- [MDN: encodeURIComponent](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/encodeURIComponent) - what it escapes and what it deliberately leaves alone.
