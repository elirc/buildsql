# Reading - typescript/d17_template_literal_types

The debrief, and the tutorial the numbered lessons only had room to sketch.
Per problem: what the pattern was really doing, the version that looks right,
and one sentence on the model answer.

## Notes

**A template literal type is a string type with holes in it.** Written with
backticks in type position - `` `${P}:${K}` `` - it means the same thing to the
type system that a template string means at runtime, except that the holes hold
types. Every placeholder must be something the compiler can stringify, which in
practice means `string`, `number`, `bigint`, `boolean`, `null`, `undefined`, or
a literal of one of those - hence the `extends string` constraints all over
this set.

**Placeholders holding unions expand to every combination.** `` `${"a" | "b"}:${"x" | "y"}` ``
is four string literals, not one. This is a cross product, so it is also how
you accidentally create a type with forty thousand members; the compiler has a
hard cap of 100,000 and will tell you when you find it.

**The same syntax works as a pattern.** On the right-hand side of `extends`, a
template is matched rather than built: `` S extends `${P}${string}` `` asks
whether `S` starts with `P` (ex3), and `` S extends `${P}${infer Rest}` ``
captures what came after (ex4). Inside a pattern, `string` is a wildcard that
matches anything including nothing, and `infer` is the same wildcard with a
name attached. When a placeholder is followed by a literal, the match is
non-greedy - it stops at the *first* occurrence - which is what makes `Split`
walk left to right.

**Four intrinsic types come with the compiler**: `Uppercase`, `Lowercase`,
`Capitalize` and `Uncapitalize`. They are implemented in the compiler itself,
not in `lib.d.ts`, so there is no source to read - and they compose inside
templates like anything else, which is the whole of ex2 and half of ex7.

**Recursion is how the interesting ones are built.** Match, capture, do
something to the capture, recurse on the remainder, and stop when the pattern
stops matching. Each step must consume at least one character, or the compiler
will stop you at depth 50 with a message about excessive recursion. `Split`
(ex5), `Join` (ex6, over a tuple instead of a string), `SnakeToCamel` (ex7) and
`RouteParams` (ex8) are four variations on that one shape.

**And the last rule is a design rule.** When a recursion needs to produce an
object, collect a union of keys on the way down and map over it once at the
end. Building the object as you go means intersecting types at every step,
which typechecks and produces tooltips nobody can read.

## ex1 - one name from two

What this was testing: the basic construct - backticks in type position, with
type parameters in the holes - and the cross-product rule that comes with it.
When a placeholder holds a union, the template is expanded once per member, and
two unions expand into every pairing.

The classic mistake is a missing or duplicated separator, which is invisible
until a call site compares the produced string with a hand-written one. The
second is leaving off `extends string`, which fails to compile with an error
about the placeholder rather than about the constraint.

The model answer is a single line, and the union behaviour is free: nothing in
`` `${P}:${K}` `` says anything about unions, yet six inputs produce six names.

## ex2 - capitalise as you prefix

What this was testing: the intrinsic string manipulation types, and the fact
that they compose inside a template like any other type. `Capitalize` is
implemented in the compiler rather than in `lib.d.ts`, which is why you cannot
find its definition by clicking through.

The classic mistake is hand-rolling it - matching `` `${infer First}${infer Rest}` ``
and uppercasing `First` - which works and is three lines longer than the
built-in. The second is reaching for `Uppercase`, which gives `"getID"`.

The model answer is `` `get${Capitalize<K>}` ``, and the empty-string case falls
out for free because `Capitalize<"">` is `""`.

## ex3 - does it start with that

What this was testing: template literal types as patterns rather than as
builders, with `string` acting as a wildcard. This is the same machinery as
ex1, read in the other direction - and it is the reason a literal like
`"/api/users"` is assignable to `` `/api${string}` ``.

The classic mistake is the stub's equality check, which is right only for exact
matches. A close second is `` `${P}${infer _}` `` with an unused capture, which
works but says you have not noticed that `string` alone is enough.

The model answer is `` S extends `${P}${string}` ? true : false ``, and the
`boolean` result for a union input is distribution doing its job - two members,
two answers, unioned back together.

## ex4 - cut the prefix off

What this was testing: `infer` inside a template literal pattern, which is
where the string-manipulation types stop being a curiosity and start being
useful. Everything from ex5 onwards is this, in a loop.

The classic mistake is returning `never` when the prefix is absent, which turns
a no-op into a type error somewhere downstream. The second is capturing the
prefix as well - `` `${infer _}${infer Rest}` `` - which matches ambiguously
and gives an answer nobody predicted.

The model answer is `` S extends `${P}${infer Rest}` ? Rest : S ``: one capture,
and the empty result for a full-length prefix falls out because a placeholder
may match the empty string.

## ex5 - cut a string into a tuple

What this was testing: recursion over a string, driven by a template pattern
with two captures. The compiler matches the *first* occurrence of the
delimiter, so `Head` is the shortest possible match and the recursion walks
left to right - which is also what makes the result order match
`String.prototype.split`.

The classic mistake is a base case of `[]` instead of `[S]`, which silently
drops the last segment: `Split<"a,b", ",">` comes out `["a"]`. The second is
expecting empty segments to disappear, which is a habit from other languages'
split functions.

The model answer is three lines, and it terminates because every recursive step
is applied to a strictly shorter string - the delimiter itself is consumed.

## ex6 - put a tuple back together

What this was testing: recursion over a tuple that *builds* a string, plus the
separator-placement problem every join has. The type-level version makes the
off-by-one visible, because a stray trailing comma shows up in the type rather
than in a log line.

The classic mistake is `` `${Head}${D}${Join<Rest, D>}` `` with no base case for
the last element, which appends a delimiter to the end of every joined string.
The second is forgetting `readonly` in the pattern, so a `readonly ["a", "b"]`
falls through to `""`.

The model answer peels the head with `infer Head extends string`, returns it
alone when the remainder is empty, and otherwise glues head, delimiter and the
recursive join together - one branch per case, no arithmetic.

## ex7 - snake_case to camelCase

What this was testing: composing recursion with an intrinsic, and the order in
which the two are applied. Both orderings agree on a single underscore and
disagree on two, which is why the gate uses `"user_first_name"`.

The classic mistake is capitalising the tail before recursing, which produces
`"userFirst_name"` - the recursive call then sees a string whose first
character is already uppercase and has nothing left to fix at the second
underscore. The second is replacing the underscore rather than consuming it.

The model answer recurses first and capitalises the result, so each segment
after the first is capitalised exactly once, and the union case distributes for
free.

## ex8 - read the params out of a path

What this was testing: everything in the set at once - patterns, wildcards,
captures, recursion - plus the decision to collect a union and map it at the
end rather than build the object as you go. It is also the actual mechanism
behind typed routers, so the shape is worth keeping.

The classic mistake is a single pattern. A path's last parameter has no
trailing slash, so a pattern that requires one silently drops it, and
`"/users/:id"` comes back with no keys at all. The second is building
`{ [K in Param]: string } & RouteParams<Rest>`, which is correct but produces a
chain of intersections that no editor tooltip will ever render legibly.

The model answer collects names into a union with a two-branch recursion and
then maps once - so `never` for a path with no parameters becomes an empty
object without a special case, and the whole public type is one line.

## Further reading

- [Handbook: Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html) - the construct, the cross-product rule, and the four intrinsic string types.
- [Handbook: Conditional Types - inferring within conditional types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types) - `infer` inside a template pattern, which is what ex4 through ex8 all lean on.
- [TypeScript 4.1 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html) - where template literal types and key remapping were introduced, with the original motivating examples.
- [MDN: String.prototype.split](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split) - the runtime behaviour ex5 is expected to mirror, empty segments included.
