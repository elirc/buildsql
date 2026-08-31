# Reading - typescript/d09_generic_functions

The debrief. Per problem: what the type parameter was really doing, the mistake
that severs it, and one sentence on the model answer.

## Notes

**The skill this set drills is connecting the output type to the input type.**
A type parameter is a variable the *caller* fills in, usually without noticing,
and its entire value is the connection: `takeWhile` on numbers gives numbers
back, and the compiler knows without being told. Every stub in this set keeps
`<T>` and returns `unknown[]`, which is what a generic looks like when the
connection has been cut - it compiles, it runs, and it has stopped being useful.

**Inference reads the arguments, not the annotation.** `takeWhile([1, 2], p)`
infers `T = number` from the array; the predicate's parameter then gets that
type for free, which is why writing `(value: string) => ...` is an error rather
than a redefinition. When inference has several candidates for one parameter it
looks for a common supertype, and when it cannot find one it complains at the
argument that broke the pattern.

**More type parameters is not more complicated.** `zipWith<A, B, C>` reads
exactly like `zipWith<T>` once you notice that each letter is filled in from one
argument. The rule of thumb is that a type parameter earns its place when it
appears at least twice in the signature - once to receive a type and once to
return it. A parameter that appears once is usually a sign you wanted `unknown`.

**A generic wrapper has to preserve the shape it wraps.** `memoize` returns
`(arg: A) => R` because that is the signature it was handed; anything looser
means every call site pays for the wrapper with a cast. The same rule shows up
in `debounce`, `once`, `retry` and every decorator you will ever write.

**And generic data structures are just types with a parameter.**
`TreeNode<T>` is one interface that works for rows, files, comments and
categories, because the only thing it says about `T` is where it goes.

## ex1 - take while it holds

What this was testing: that `T` flows from the array into the predicate's
parameter and back out into the result. Once the return type is `T[]` the whole
body typechecks itself.

The classic mistake is confusing this with `filter`: `values.filter(keep)` gives
`[1, 2, 1]` for the gate's first case, because it keeps looking after the first
miss. The call-count assertion exists to make that failure visible - `filter`
would run the predicate four times, and `takeWhile` runs it three.

The model answer loops and returns as soon as the predicate is false, which is
also the only version whose cost is proportional to the prefix rather than to
the whole list.

## ex2 - interleave two lists

What this was testing: one type parameter used in two argument positions.
Inference collects a candidate from each and has to agree on one, which is what
makes `interleave([1], ["a"])` a compile error rather than a `(number|string)[]`.

The classic mistake is looping to `Math.min(a.length, b.length)` and forgetting
the tail, which silently truncates the longer list - correct for the first case
in the gate, wrong for the second.

The model answer loops to `Math.max` and pushes each element only when its index
is in range, so the alternating phase and the draining phase are the same three
lines.

## ex3 - zip with a combiner

What this was testing: three independent type parameters, two inferred from
arrays and one inferred from the combiner's return type. The last one is the
interesting one - `C` is never written by the caller and is never `unknown`.

The classic mistake is typing the result as `(A | B)[]`, which is what you get
if you think of `zipWith` as a merge rather than as a map over pairs; the
combiner may return anything at all, including a type neither input mentions.

The model answer walks to the shorter length and pushes `combine(a[i], b[i])`,
letting the return type be inferred from `C` - so nothing in the body needs to
know what the caller is building.

## ex4 - partition in one pass

What this was testing: a labelled tuple as a generic return type. `[kept: T[],
dropped: T[]]` documents the order at the call site, which a `T[][]` cannot -
and the labels cost nothing at runtime.

The classic mistake is two `filter` passes with a negated predicate, which is
readable and calls the predicate twice per element. For a pure predicate that is
merely wasteful; for one that logs, counts or hits a cache it is a bug.

The model answer declares both arrays up front and pushes into one or the other,
which also makes the empty case fall out with no branch.

## ex5 - rotate a list

What this was testing: `readonly T[]` in and `T[]` out, plus the negative-modulo
arithmetic that JavaScript gets wrong. `-1 % 3` is `-1`, so a bare remainder
produces an index off the front of the array.

The classic mistake is `values.splice(0, by)` - which mutates the caller's array
- or forgetting the empty-list case, where `% 0` is `NaN` and `slice(NaN)`
quietly returns everything.

The model answer normalises the offset with `((by % len) + len) % len`, guards
the empty list, and returns `[...values.slice(offset), ...values.slice(0,
offset)]` - two slices, one new array, nothing touched.

## ex6 - memoize by a key

What this was testing: a generic higher-order function that has to hand back the
*same* signature it was given, and a cache that distinguishes "no entry" from
"an entry whose value is `undefined`".

The classic mistake is `cache.get(key) ?? compute()`, which recomputes every
time the memoised value is `undefined`, `0`, `""` or `false`. The gate has a
function that always returns `undefined` for exactly this reason.

The model answer keeps a `Map<string, R>` in the closure and asks `cache.has(key)`
before `cache.get(key)` - and takes the key function as a parameter rather than
stringifying the argument, because `JSON.stringify` is neither cheap nor
order-stable.

## ex7 - merge two sorted lists

What this was testing: a comparator parameter (`(x: T, y: T) => number`), and
the tie-breaking rule that makes a merge *stable*. Stability is the whole
correctness argument for merge sort, and it comes down to one `<=` rather than
`<`.

The classic mistake is `compare(a[i], b[j]) < 0` for taking from the left, which
takes from the right on a tie and reverses equal elements. The gate merges two
lists of tagged objects to catch it.

The model answer walks two indices, takes from the left whenever the comparator
returns `<= 0`, and drains whichever list is left over - and `concat`enating the
remainder is fine because it is already sorted.

## ex8 - rebuild a tree from flat rows

What this was testing: a generic data structure plus two extractor callbacks, so
that one function serves rows from a database, files on disk and comments in a
thread. `T` appears in the items, in both callbacks and in the result.

The classic mistake is a recursive filter - for each node, scan the whole list
for its children - which is quadratic and re-walks the input once per node. The
second-classic is treating a row whose parent is missing as an error; the prompt
says it becomes a root, which is what makes partial data survive.

The model answer builds a `Map` from id to node in one pass and links parents in
a second, so both roots and children come out in input order and the whole thing
is linear.

## Further reading

- [Handbook: Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html) - type parameters, inference, and when to write one at all.
- [Handbook: Generic functions and inference](https://www.typescriptlang.org/docs/handbook/2/functions.html#generic-functions) - including the rule of thumb that a type parameter should appear twice.
- [Handbook: Tuple types with labels](https://www.typescriptlang.org/docs/handbook/2/objects.html#tuple-types) - the `[kept: T[], dropped: T[]]` return type from ex4.
- [MDN: Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) - `has` against `get`, which is the ex6 trap, and the id lookup in ex8.
- [MDN: Array.prototype.slice](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/slice) - and how it differs from `splice`, which is the ex5 trap.
