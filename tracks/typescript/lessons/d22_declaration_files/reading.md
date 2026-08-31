# Reading - typescript/d22_declaration_files

The debrief. Per problem: which declaration space was really in play, the
version that has the value but not the type (or the reverse), and one sentence
on the model answer.

## Notes

**Every name in TypeScript lives in up to three spaces: value, type and
namespace.** `const x` occupies the value space. `interface X` occupies the type
space. `class X` occupies both. `namespace X` occupies the namespace space and,
if it has runtime members, the value space too. Declaration merging is simply
the rule that two declarations of the same name in *different* spaces coexist -
and that some declarations in the *same* space combine rather than collide.

**Interfaces merge; type aliases do not.** Two `interface X` declarations become
one interface with the members of both (ex5, ex7); two `type X` declarations are
a duplicate-identifier error. That single asymmetry is why every extensible API
- a router's route table, a store's action map, a plugin registry - is published
as an interface.

**Namespaces merge onto almost anything.** Onto a function, so a callable can
have members (ex1). Onto an enum, so a level can carry its own helpers (ex6).
Onto a class, so one name can hold nested types and factories (ex8). The rule is
always the same: the function, enum or class comes first, the namespace second,
and the namespace's exports become properties of the value.

**Overload signatures are declarations without an implementation** (ex2, and the
`plus` method in ex8). Only the overloads are visible to callers; the
implementation signature is invisible and is allowed to be wider. They are the
tool for "the return type depends on the argument" in any situation where you
are describing code rather than writing it.

**`declare` says "this exists, I am not creating it".** `declare global` reopens
the global scope from inside a module (ex3) - the standard way to type a
polyfill, a bundler-injected constant or a test helper. Use `var` there, because
only `var` declarations become properties of `globalThis`.

**And the ordinary rules still apply to the values.** Nothing here removes the
need for the runtime object to exist: a merged namespace produces real
properties, an overload set produces one real function, and a `declare global`
block produces nothing at all - which is exactly why ex3 also has to write to
`globalThis` itself.

## ex1 - a function with members

What this was testing: function-and-namespace merging, which is how libraries
like `moment` or Node's own `require` are described - a thing you can call that
also has properties. Written by hand at runtime it needs `Object.assign` and a
cast; declared as a merge it needs neither.

The classic mistake is declaring the namespace *before* the function, which is
an error, or reaching for an interface with a call signature - which describes
the shape but does not create the value.

The model answer declares the function, then a namespace of the same name whose
exports become its members - one construct, and the runtime object and its type
are produced together.

## ex2 - two signatures, one function

What this was testing: overload signatures, which are the declaration-file way
of saying "the result depends on the argument" without a conditional type. They
are also the only shape available when the implementation is in JavaScript and
you are describing it from outside.

The classic mistake is thinking the implementation signature is callable. It is
not - `box(true)` is an error even though the implementation would happily
handle it - and that gap is deliberate: the implementation is allowed to be
wider than the contract.

The model answer lists the two signatures above one implementation whose
parameter is the union and whose return type is the union of the two shapes, and
narrows once with `typeof` inside.

## ex3 - add something to globalThis

What this was testing: global augmentation, the construct behind every
`declare global` block in a project's `types/` folder. The declaration creates
no value; it tells the compiler that something else will, which is exactly the
contract a `.d.ts` file offers.

The classic mistake is `const` instead of `var` inside `declare global`, which
declares a global binding that is *not* a property of `globalThis` - so
`globalThis.__d22BuildRegistry` still does not typecheck. The second is putting
the block in a file with no imports or exports, where it silently becomes a
script and takes its other declarations global with it.

The model answer declares the `var`, creates the object on first write, and
reads with optional chaining - so the `undefined` in the declared type is
handled rather than asserted away.

## ex4 - a namespace of types and values

What this was testing: that a namespace is a container for declarations in all
three declaration spaces - type, value and namespace - and that the dotted form
`Api.Row` works in type position. This is the shape almost every hand-written
`.d.ts` for a UMD library takes.

The classic mistake is exporting a type from a namespace and then trying to
`import { Row }` - the name is `Api.Row`, and `import type { Api }` followed by
`Api.Row` is how you reach it. The second is repeating the id type instead of
deriving it, which is the same duplication `keyof` and indexed access exist to
remove.

The model answer keeps `Row` as the source of truth, derives `Id` from it with
an indexed access, and puts the one runtime value alongside them - so the
namespace describes an API surface rather than merely grouping names.

## ex5 - one interface, two declarations

What this was testing: interface declaration merging, in its simplest form. Two
declarations, one type - and unlike an intersection, the result is a single
interface, so error messages and tooltips still name it.

The classic mistake is assuming a type alias behaves the same way; `type X` twice
is a duplicate-identifier error, which is exactly why `interface` is the right
choice for anything a consumer might want to extend. The second is expecting a
conflicting member to merge: two declarations of the same property with
different types is an error, not a union.

The model answer is two interface declarations and a template string, and the
interesting line is the one that is not there - nothing joins the declarations
together, because the compiler does it by name.

## ex6 - an enum with helpers

What this was testing: enum-and-namespace merging, and the double-entry nature
of a numeric enum's runtime object. Attaching helpers to an enum is one of the
few places a namespace is still clearly the best tool - the alternative is a
separate `LevelHelpers` object that call sites have to import alongside it.

The classic mistake is `parse` returning whatever the lookup produced. A
numeric enum has a reverse mapping, so `Level["20"]` is `"Error"`, and a parse
that accepts it will hand a string to code expecting a level. The gate checks
that case directly.

The model answer merges the namespace onto the enum, indexes the enum object
once, and accepts the result only when it is a number - which is also the check
that rejects unknown names, for free.

## ex7 - a registry other files can extend

What this was testing: the registry pattern - an interface that other
declarations extend, with `keyof` and indexed access turning the extensions into
a checked API. This is how a router types its routes, how a store types its
actions, and how libraries let consumers register their own names without the
library knowing them.

The classic mistake is the stub's index signature, which looks like a
generalisation and is actually an abdication: `keyof` becomes `string`, the
payload becomes `unknown`, and `dispatch` accepts anything.

The model answer declares the interface three times, derives the names with
`keyof`, and pairs each name with a handler - and the single cast in the body is
the well-known limit of correlated unions rather than a shortcut.

## ex8 - a class, a type and a namespace

What this was testing: everything in the set, on one identifier. A class is
already a value and a type; the namespace adds nested types and statics-by-merge;
the overloads give one method two contracts. This is the exact shape of the
hand-written declaration for a library whose main export is a class with a few
constants hanging off it.

The classic mistake is trying to put `Currency` inside the class body - a class
cannot contain a type alias, which is precisely the gap the merged namespace
fills. The second is declaring the namespace before the class, which compiles as
a namespace and then fails to merge.

The model answer keeps the class first, adds the namespace after it, and lets the
class body reference `Money.Currency` freely - and the runtime object ends up
with `SYMBOLS` and `zero` attached to the constructor, which is what a static
would have given you without the nested type.

## Further reading

- [Handbook: Declaration Merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html) - the declaration spaces table, and every merge in this set.
- [Handbook: Namespaces](https://www.typescriptlang.org/docs/handbook/namespaces.html) - what they still do well, and when a module is the better container.
- [Handbook: Functions - overload signatures](https://www.typescriptlang.org/docs/handbook/2/functions.html#function-overloads) - including why the implementation signature is not callable.
- [Handbook: Declaration files - deep dive](https://www.typescriptlang.org/docs/handbook/declaration-files/deep-dive.html) - `declare`, ambient contexts and global augmentation, written from the `.d.ts` side.
- [MDN: globalThis](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis) - and why `var` is the declaration form that lands on it (ex3).
