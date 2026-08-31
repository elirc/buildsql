# Reading - typescript/d18_guards_advanced

The debrief. Per problem: what the predicate was really claiming, the version
that runs correctly and proves nothing, and one sentence on the model answer.

## Notes

**A guard makes two promises and the compiler only checks one.** `value is T`
says "if I return true, treat this as a `T`" - and TypeScript takes your word
for it. Nothing verifies that the body actually establishes the claim. That
asymmetry is why this lesson runs a runtime gate and a type gate side by side:
the runtime gate catches a guard that returns the wrong answer, the type gate
catches a guard that returns the right answer and tells the compiler nothing,
and only both together catch a guard that lies.

**Narrowing is always to a subtype.** `[T, ...T[]]` narrows `T[]` (ex1),
`Record<K, unknown>` narrows `object` (ex2), a literal union narrows `string`
(ex3). If the compiler rejects your predicate, the usual cause is that you
promised something the declared parameter type does not allow - and the fix is
almost never a cast.

**Claim the least you can.** `hasKey` proves a key exists, so it narrows to
`Record<K, unknown>` and not to anything about the value behind it. Every extra
word in a narrowed type is a claim the body has to justify, and the compiler
will not ask you for the justification.

**Assertion functions are guards without the branch.** `asserts value is Row`
narrows for the remainder of the scope and throws otherwise, which is the right
shape at a parsing boundary where "carry on with an unvalidated value" is not
an option. They have one sharp edge: the thing you call has to have an explicit
declared type, which is why they are always written as declarations or as
annotated consts.

**And predicates compose.** A predicate is part of a function *type*, so a
function can take guards and return guards (ex7, ex8) - which is how every
runtime schema library you have used is built. What none of them can do is get
the predicate by inference: TypeScript will infer `boolean` every time, so the
`value is T` has to be written by hand at every level.

## ex1 - prove the list has a head

What this was testing: that a type predicate may narrow to a *tuple*, not only
to a union member. The payoff is `values[0]`, which under
`noUncheckedIndexedAccess` or a hand-written union would otherwise be
`T | undefined` forever.

The classic mistake is returning `boolean`: the runtime behaves perfectly and
the compiler learns nothing, so every caller still writes a non-null assertion
after the check. That is why this lesson runs two gates.

The model answer is `values.length > 0` with `values is [T, ...T[]]` in the
return position - the whole exercise is in the signature, and the body is the
part you could have guessed.

## ex2 - prove a key exists

What this was testing: a type predicate whose narrowed type is built from a
generic parameter, plus the own-versus-inherited distinction that `in` gets
wrong. `Record<K, unknown>` is the smallest honest claim: the key is there, and
you know nothing about what is behind it.

The classic mistake is narrowing to `Record<K, string>` or some other concrete
value type, which is a lie the compiler will happily believe - the guard
checked for existence and said something about the contents. The second is
using `key in value`, which the gate catches with an inherited property.

The model answer is `Object.prototype.hasOwnProperty.call(value, key)` with
`value is Record<K, unknown>` in the return position: one own-property check,
one honest claim.

## ex3 - narrow a string to a list

What this was testing: a predicate on a parameter other than the first, and the
inference chain from `as const` at the call site to a literal union in the
narrowed branch. This is how a validated string from a request body becomes a
usable union without a cast.

The classic mistake is `allowed.includes(value as T)`, which asserts the answer
before asking the question - and would return `true`-shaped types for values
that are not in the list at all if the body were ever refactored. Widen the
array, never the value.

The model answer widens `allowed` to `readonly string[]` for the `includes`
call and declares `value is T`, so the only unchecked claim in the function is
the one the guard exists to make.

## ex4 - assert a row or throw

What this was testing: assertion signatures, and the discipline of validating
the container before its contents. `asserts value is Row` narrows the caller's
variable with no `if` at the call site, which is what makes it the right tool
for parsing at a boundary.

The classic mistake is reading `value.id` before proving `value` is an object,
which is a `TypeError` at runtime on `null` and a compile error on `unknown`.
The second is throwing a bare `Error("invalid")`, which turns a five-second
debugging session into a twenty-minute one - the gate matches on the field name
for that reason.

The model answer checks the container, casts once to `Record<string, unknown>`,
and then checks each field with its own message, so the thrown error always
says which field and what was expected.

## ex5 - filter a discriminated union

What this was testing: two ideas at once - `Extract` over a discriminated
union, and `filter`'s type-predicate overload. Either alone gives you half the
answer: `Extract` with a plain filter callback returns `Task[]` and needs a
cast; a predicate callback without `Extract` has nothing to narrow *to*.

The classic mistake is `tasks.filter((task) => task.kind === kind) as Extract<Task, { kind: K }>[]`,
which produces the right type by assertion rather than by proof - and keeps
producing it after someone changes the comparison.

The model answer names the predicate in the callback so the compiler derives
the return type, and the generic `K` means `onlyKind(tasks, "fax")` is caught
at the call site rather than returning an empty array.

## ex6 - two guards, one built on the other

What this was testing: guard composition, and the two values that `typeof
"object"` lets through by accident. `isStringRecord` is only interesting
because it reuses `isRecord` - the narrowing from the first call is what makes
the `Object.values` line legal without a cast.

The classic mistake is `typeof value === "object"` alone, which is `true` for
`null` and for every array, and then crashes one line later. The second is
re-implementing the object check inside the second guard, which passes the gate
and drifts the moment one of the two definitions changes.

The model answer narrows once in `isRecord` and leans on it in
`isStringRecord`, where short-circuit evaluation carries the narrowing across
the `&&` - the same flow analysis that makes `if (x && x.y)` work.

## ex7 - lift a guard over a list

What this was testing: that a type predicate is part of a *function type*, and
so can be produced by a higher-order function rather than written at a fixed
call site. This is the combinator pattern that runtime validators are built
from.

The classic mistake is expecting inference to produce the predicate. TypeScript
never infers `value is S` - if you do not write it in the return type, you get
`boolean`, the guard silently stops narrowing, and only a type gate notices.
The second is forgetting `S extends T`, which makes the predicate illegal.

The model answer spells the predicate out in both places - once on `everyIs`'s
return type, once on the arrow it returns - and the body is a single `every`
call whose vacuous-truth behaviour is exactly what the prompt asks for.

## ex8 - a guard built from a shape

What this was testing: the whole set at once. A guard combinator whose *type*
is computed from its argument - `infer` to read a guard's narrowed type
(d16), a mapped type to apply it across the shape (d14), and a type predicate
to hand the result to the caller (lesson 10).

The classic mistake is constraining `S` to `Record<string, Guard<unknown>>` and
then finding that every field narrows to `unknown`: the constraint is not what
the mapped type reads, but it is what a careless implementation ends up
propagating. The second is `guard(record[key])` without the presence check,
which lets `{ id: "u1" }` through whenever a guard happens to accept
`undefined`.

The model answer keeps the constraint loose so inference preserves the real
signatures, derives the object type with one mapped type over `GuardType`, and
validates container, presence and value in that order - which is also the order
the error messages would want.

## Further reading

- [Handbook: Narrowing - using type predicates](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates) - the `value is T` form and the subtype rule every exercise here obeys.
- [Handbook: Assertion functions](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#assertion-functions) - `asserts value is T`, including why the call target needs an explicit type.
- [Handbook: Discriminated unions](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions) - the shape ex5 filters, and why `Extract` is the right utility for it.
- [MDN: Object.hasOwn](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwn) - own versus inherited properties, which is the trap in ex2.
- [MDN: Array.prototype.every](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/every) - including the vacuous-truth behaviour ex7 and ex8 both depend on.
