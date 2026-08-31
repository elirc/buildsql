# Reading - typescript/d16_infer_patterns

The debrief. Per problem: what the pattern was really matching, the capture
that looks close enough, and one sentence on the model answer.

## Notes

**`infer` is pattern matching for types.** You write the shape you expect on
the right of `extends`, put `infer X` where the interesting part lives, and if
the shape matches, `X` is bound in the true branch. The two hard rules: it is
legal only inside a conditional type's `extends` clause, and the name is
visible only in the true branch - which is also a decent way to remember why
the false branch has to invent its own answer.

**Be specific where you are capturing and vague everywhere else.** Half the
failures in this set are patterns that were too narrow in a position nobody
cared about: `(infer E)[]` instead of `readonly (infer E)[]` (ex1), a `void`
return where a real function returned an unsubscriber (ex6), an `unknown[]`
rest that would not absorb a narrower parameter (ex2). A pattern is a
*constraint*, so every detail you write is a way for a real type to miss.

**Tuple patterns are positional and the rest element can sit anywhere.**
`[unknown, ...infer Rest]` peels the head (ex3), `[...unknown[], infer Last]`
reads the tail (ex4), and requiring a fixed element is what makes the empty
tuple fall through to the false branch. Together with recursion that gives you
a loop over a parameter list, which is all ex8 is.

**Recursion needs a base case and a shrinking argument.** `Flatten` recurses on
the captured element and stops when the pattern fails to match (ex5); `Curried`
recurses on a rebuilt signature and stops when the tuple runs out (ex8). If you
cannot say in one sentence what gets smaller each step, the compiler will say
it for you, at depth 50, in a much longer sentence.

**And two of these are not really about `infer` at all.** ex7 works because
parameters are contravariant, so inferring one type from several call
signatures yields their intersection; `infer` is only the tool that reads the
result out. That is the pattern behind most union-manipulation utilities you
will meet in the wild.

## ex1 - the element of an array

What this was testing: the smallest complete use of `infer` - one pattern, one
capture, one branch that uses it. Everything later in this set is this shape
with a more interesting pattern.

The classic mistake is `T extends unknown[] ? T[number] : never`, which works
but throws away the point of the exercise, or `T extends (infer E)[]`, which
answers `never` for `readonly number[]` because a readonly array is not
assignable to a mutable one.

The model answer is `T extends readonly (infer E)[] ? E : never`; the tuple
case falls out for free, because `[1, "a"]` is assignable to
`readonly (1 | "a")[]` and that is the widest capture the compiler can make.

## ex2 - the first parameter

What this was testing: an `infer` in one *position* of a larger pattern rather
than the whole of it, plus a rest parameter used as a wildcard. This is how
`Parameters`, `ReturnType` and every hand-rolled variation of them are built.

The classic mistake is capturing `...args: infer A` and then indexing with
`A[0]`, which is a longer way to the same place and gives `undefined` in the
union once optional parameters are involved. The second is using `unknown[]`
for the rest wildcard, which fails to match a function whose later parameters
are narrower.

The model answer matches `(first: infer A, ...rest: never[]) => unknown`, so
the first parameter is captured by name and everything after it is ignored -
and the empty-parameter case leaves `A` uninferred, which the compiler resolves
to `unknown`.

## ex3 - everything after the head

What this was testing: variadic tuple patterns, and the fact that requiring a
leading element is what distinguishes "has a head" from "is empty". The
compiler matches these positionally, so the pattern reads exactly like the
value-level destructuring it mirrors.

The classic mistake is `[infer First, ...infer Rest]` with `First` unused,
which is harmless but noisy, or forgetting `readonly` in the pattern and then
being unable to explain why a `readonly ["a", "b"]` came back `never`.

The model answer is `T extends readonly [unknown, ...infer Rest] ? Rest : never`
- and the captured `Rest` comes out as a mutable tuple, because that is the
form the compiler infers for a rest element.

## ex4 - the far end of a tuple

What this was testing: that the variadic element of a tuple pattern is not
pinned to the end, which is the whole reason `LastOf` is expressible at all.
Once you have seen it, `[...unknown[], infer Last]` reads as naturally as
`[unknown, ...infer Rest]`.

The classic mistake is the stub's version - capture the element type of the
array and call it the last one. It is right for a one-element tuple and gives
`1 | 2 | 3` for the gate's first case, which is a union masquerading as an
answer.

The model answer is `T extends readonly [...unknown[], infer Last] ? Last : never`,
one pattern with no recursion - unlike the union-based `LastOf` you may have
seen, which is solving the much harder problem of ordering a union.

## ex5 - unwrap all the way down

What this was testing: recursion in a conditional type, with `infer` supplying
the smaller input for the next step. The pattern - match, capture, recurse on
the capture, fall through to `T` - is the skeleton of `DeepReadonly`,
`DeepPartial` and every "walk the whole type" utility.

The classic mistake is the stub: one unwrap, which passes the shallow test and
returns `number[][]` for a triple-nested array. The second is writing `never`
as the base case, which erases every non-array type instead of returning it.

The model answer is `T extends readonly (infer E)[] ? Flatten<E> : T` - four
tokens more than the stub, and the difference between a utility and a demo.

## ex6 - the state a store publishes

What this was testing: that `infer` is positional inside an arbitrarily nested
structural pattern. Nothing new happens at depth - the compiler matches the
shape and binds whatever sits where the `infer` is - but it is the first time
in this set that the pattern is a whole interface.

The classic mistake is being too specific about the parts you are not
capturing: writing `): void` for `subscribe`'s return type makes `Store` fail
to match, because it returns an unsubscribe function. Wildcards in a pattern
should be as wide as you can make them.

The model answer matches `{ subscribe(listener: (state: infer S) => void): unknown }`
and returns `S` - `unknown` in the return position accepts anything, and the
listener's `void` return accepts any listener because `void` in a return
position is deliberately permissive.

## ex7 - turn a union into an intersection

What this was testing: contravariance, expressed as a type-level trick. When
the compiler infers from several call signatures at once it must satisfy all of
them, and for a parameter position "satisfies all" means an intersection - the
exact opposite of what happens in a return position.

The classic mistake is expecting a union-to-intersection operator to exist and
searching for it. The second is forgetting the parentheses around the
distributive step, which produces a type error far from its cause.

The model answer distributes `U` into `(arg: U) => void` and then infers a
single parameter type back out; the number of union members never appears in
the definition, because distribution does the counting.

## ex8 - curry a signature

What this was testing: two `infer`s in one pattern, recursion driven by a tuple,
and the discipline of enumerating base cases before writing the recursive one.
It is the type-level half of the `curry` every functional-programming interview
asks for, and it is the half that people skip.

The classic mistake is forgetting the one-parameter base case and producing
`(a: string) => () => number`: an extra empty call that nothing at the call site
expects. The second is recursing on `Rest` directly, which type-errors because
`Curried` is written to take a function type.

The model answer peels one parameter per step and rebuilds the remainder as a
new signature, so the recursion always has the same shape of input - and the
zero-parameter case is handled first, where it cannot be forgotten.

## Further reading

- [Handbook: Conditional Types - inferring within conditional types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types) - the rules for where `infer` may appear and where its name is visible.
- [Handbook: Variadic tuple types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-0.html#variadic-tuple-types) - the `[...unknown[], infer Last]` and `[unknown, ...infer Rest]` patterns from ex3 and ex4.
- [Handbook: Recursive conditional types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#recursive-conditional-types) - what makes ex5 and ex8 legal, and where the depth limit lives.
- [Handbook: Type inference in conditional types and variance](https://www.typescriptlang.org/docs/handbook/2/functions.html#assignability-of-functions) - parameter contravariance, which is the whole mechanism behind ex7.
