# Reading - typescript/d12_builtin_utilities

The debrief. Per problem: which utility was really being tested, the mistake
that makes it decorative, and one sentence on the model answer.

## Notes

**The skill this set drills is deriving a type instead of writing a second
one.** Every utility here takes a type you already have and produces the one you
need: without the `Partial`, the `Omit` or the `Awaited`, you would hand-write a
near-copy that silently stops matching the day the original changes. That
divergence is the bug these types exist to prevent, and it is why every stub in
this set fails by returning the *input* type.

**They are all ordinary type-level code.** `Partial<T>` is a mapped type with a
`?` added, `Omit<T, K>` is `Pick<T, Exclude<keyof T, K>>`, `NonNullable<T>` is
`T & {}` these days, and `Parameters<F>` is a conditional type with `infer`.
Nothing in `lib.es5.d.ts` is magic - d13 asks you to write several of them from
scratch, and knowing they are only a few lines each is the point.

**Distributive utilities work on unions, member by member.** `Exclude` and
`Extract` look like set difference and intersection because that is exactly
what they are: `Exclude<Status, "closed" | "archived">` visits each member of
`Status` and keeps the ones that do not match. That is also why they do nothing
useful on object types - `Exclude<Posting, ...>` is not how you drop a member;
`Omit` is.

**`typeof` is the bridge from a value to a type.** `Parameters<typeof
loadPosting>`, `ReturnType<typeof loadPosting>`, `ConstructorParameters<typeof
Search>` and `InstanceType<typeof Search>` all begin by turning a value you have
into a type you can transform. Note that `typeof Search` is the type of the
*class* and `InstanceType<typeof Search>` (which is just `Search`) is the type
of what it makes - the same distinction as the construct signature in d04.

**And the utilities compose.** `Readonly<Omit<Posting, "internalNotes" |
"recruiterEmail">>` reads outside-in and does exactly what it says. Reaching for
two of them at once is normal; reaching for five is a sign the underlying type
wanted splitting up.

## ex1 - fill a draft

What this was testing: `Required<T>`, which removes `?` from every member - the
exact inverse of `Partial<T>`. The return type is the promise that no hole is
left, and the body has to keep it.

The classic mistake is `draft.salary || 0`, which is right for `undefined` and
wrong for a supplied `0`; the gate hands you `{ salary: 0, remote: false }` and
`{ title: "" }` precisely to catch the falsy-versus-nullish confusion.

The model answer builds a fresh object with `??` on each member, so the returned
value has all three keys present whatever the input looked like.

## ex2 - cut a union in two

What this was testing: `Exclude` and `Extract` as set difference and
intersection over a union of literals, plus a type predicate that hands the
result to control flow analysis. The `else` branch narrowing to `Dead` is the
payoff.

The classic mistake is writing `Live` out by hand. It compiles, it passes today,
and it silently stops matching the day a `"expired"` status is added to
`Status` - which is the entire argument for deriving it.

The model answer excludes the two dead statuses in the type and checks for those
same two in the predicate; keeping the list in two places is the one real
weakness of the approach, and worth saying out loud.

## ex3 - the first value that is really there

What this was testing: `NonNullable<T>` in a return type, and the difference
between "nullish" and "falsy" one more time. The gate returns `0` and `""` from
this function on purpose.

The classic mistake is `values.find(Boolean)`, which is short, idiomatic and
skips `0`, `""`, `false` and `NaN` - and does not narrow the element type
either.

The model answer loops with an explicit `!== null && !== undefined` and asserts
`NonNullable<T>` on the way out, because TypeScript cannot see that the two
checks removed exactly the two members the return type removes.

## ex4 - take a function type apart

What this was testing: `Parameters<F>` and `ReturnType<F>`, and the `typeof`
that turns the function *value* into a function *type*. `LoadArgs` is a labelled
tuple, which is why spreading it into the call typechecks.

The classic mistake is `Parameters<loadPosting>`, without `typeof` - a value
where a type was expected, and the error message is one of the more confusing
ones TypeScript produces.

The model answer is `return loadPosting(...args)`; the tuple type carries both
the arity and the order, so passing one argument too few is a compile error
rather than an `undefined` at runtime.

## ex5 - a patch of what changed

What this was testing: `Partial<T>` as a return type, and the distinction
between an absent key and a key holding `undefined`. `"title" in patch` has to
be `false`, which rules out building the object with every key and blanking the
unchanged ones.

The classic mistake is `{ ...after }` filtered afterwards, or assigning
`undefined` for unchanged members - both produce a patch that a naive `Object.assign`
would then use to erase good data.

The model answer starts from `{}` and writes only the changed members, with one
cast at the assignment - because TypeScript cannot verify that `patch[key] =
after[key]` lines up when `key` is a union of several keys at once.

## ex6 - unwrap a promise type

What this was testing: `Awaited<T>`, which unwraps a promise (and a promise of a
promise, recursively). `ReturnType<typeof fetchPosting>` is
`Promise<{ id, title }>`; `Awaited<...>` of that is the shape you actually hold
after the `await`.

The classic mistake is stopping at `ReturnType`, which leaves a `Promise` inside
the type - so `Fetched[]` becomes an array of promises and the whole signature
is quietly wrong.

The model answer resolves the ids with `Promise.all`, which is the one line that
turns an array of promises into a promise of an array - and note that it fails
fast on the first rejection, which is worth knowing before you rely on it.

## ex7 - take a class apart

What this was testing: the class-shaped versions of ex4.
`ConstructorParameters<typeof Search>` is the argument tuple for `new`, and
`InstanceType<typeof Search>` is what `new` produces - which is `Search`, and
saying so is the point of the exercise.

The classic mistake is `Parameters<typeof Search>`, which does not apply to a
class at all, or `ConstructorParameters<Search>`, which passes the instance type
where the constructor type was wanted.

The model answer is `new Search(...args)`, and the `run` method lower-cases both
sides once before comparing and slices to the limit - so a shorter result is
never padded.

## ex8 - a public view of a posting

What this was testing: composing two utilities, and the fact that `Omit` removes
a member from the *type* while a spread with destructuring removes it from the
*value*. Both halves are needed, and the gate checks each with `in`.

The classic mistake is assigning `undefined` to the private members instead of
removing them - the key is still there for `JSON.stringify`, which is exactly
the leak this function exists to prevent. The second-classic is mutating the
input with `delete`.

The model answer destructures the two private members out and pushes the rest,
skipping the dead statuses on the way - so a published posting is a new object
with three keys, readonly by type and complete by construction.

## Further reading

- [Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html) - the full list, each with its definition; worth reading end to end once.
- [Handbook: Exclude and Extract](https://www.typescriptlang.org/docs/handbook/utility-types.html#excludeuniontype-excludedmembers) - and why they distribute over unions.
- [Handbook: Awaited](https://www.typescriptlang.org/docs/handbook/utility-types.html#awaitedtype) - recursive unwrapping, and the thenable rules behind it.
- [TypeScript source: lib.es5.d.ts](https://github.com/microsoft/TypeScript/blob/main/src/lib/es5.d.ts) - the actual definitions; `Partial`, `Pick` and `Omit` are three lines each.
- [MDN: Promise.all](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all) - the ex6 one-liner, including its fail-fast behaviour.
