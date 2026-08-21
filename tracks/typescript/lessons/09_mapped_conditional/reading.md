# Reading - typescript/09_mapped_conditional

Type-level programming: what the constructs are, what they cost, and how to
tell an interviewer where you would stop.

## Notes

**Mapped types are homomorphic (usually), and that word matters.** When a
mapped type has the exact form `{ [K in keyof T]: ... }`, TypeScript treats it
as *homomorphic*: it preserves `readonly` and `?` modifiers from the source,
and it distributes over arrays and tuples rather than mangling them. Add a key
remap or use a different key source and you lose that property — which is why
`Partial<string[]>` is a sensible array type while a hand-rolled
`{ [K in keyof T as K]: T[K] }` is not. If a mapped type ever destroys an array,
this is why.

**Key remapping with `as` is also a filter.** Producing `never` as the key drops
the member:

```ts
type OnlyStrings<T> = { [K in keyof T as T[K] extends string ? K : never]: T[K] };
```

That idiom — remap to `never` to delete — shows up constantly in library types,
and it is worth recognising instantly.

**Conditional types are lazy and defer.** `T extends U ? X : Y` is only
evaluated once `T` is known; inside a generic function body, a conditional over
an unresolved type parameter stays unresolved, which is why you so often need a
cast when *returning* a conditional type. The compiler cannot prove your runtime
code produces the branch it landed on, and that limitation is by design.

**Distribution, precisely.** A conditional type distributes when its checked
type is a *naked* type parameter — `T extends U ? ... : ...`, not
`T[] extends U[] ? ...` or `[T] extends [U] ? ...`. Distribution applies the
conditional to every member of a union and unions the results. Two consequences
people trip over: `Exclude<T, U>` only works because of it, and
`T extends any ? T[] : never` with `T = never` produces `never` rather than
`never[]`, because distributing over an empty union gives an empty union. The
"naked type parameter" phrase is worth saying in an interview verbatim.

**`infer` is pattern matching, and it has options.** You can infer several
variables at once, infer from tuples (`T extends [infer A, ...infer Rest]` — the
basis of every type-level list algorithm), and since TypeScript 4.7 constrain an
inference (`T extends [infer A extends string, ...any[]] ? A : never`). Multiple
candidates for the same variable are unioned in a covariant position and
intersected in a contravariant one — which is the trick behind the famous
`UnionToIntersection` type.

**Know where to stop.** Recursive conditional types are limited to a finite
instantiation depth, and blowing past it gives "Type instantiation is
excessively deep and possibly infinite". Long before that, editor
responsiveness suffers: type-level computation runs on every keystroke.
`tsc --generateTrace` and the `--extendedDiagnostics` flag exist precisely
because clever types became a real performance problem in real codebases. A
strong senior answer to "how far would you take this?" is: derive at the
boundary, keep it shallow, name the intermediate types, and prefer a slightly
duplicated type over one nobody can debug.

## ex1 — remove a modifier

`-readonly` and `-?` are the least-known corner of mapped types and the most
immediately useful. `Mutable<T>` is the mirror of `Readonly<T>`, and the pair of
them is how DTOs get converted to editable form state and back.

The runtime half matters as much as the type. Returning `{ ...frozen }` is what
makes the promise true: the type says "writable", and a shallow copy is what
delivers it. Returning `frozen` itself with a cast would satisfy the compiler
and hand the caller a shared reference to something the rest of the program
believes is immutable — a bug that shows up far from its cause. When a type
says "copy", the code must copy.

The shallowness is the honest limitation, and the challenge in this lesson is
its counterpart: `Mutable` and `thaw` only touch the top level, so a nested
object is still shared. Whether that is fine depends on whether anything mutates
it — which is exactly why `readonly` on nested members is worth having.

## ex2 — rename the keys as you map them

`[K in keyof T & string as \`get${Capitalize<K>}\`]` is a mouthful, and it is
the single most transferable snippet in this lesson. Typed event emitters
(`on${Capitalize<Event>}`), generated action creators, `Vue`-style prop
handlers, `styled-components` variant props — all the same shape.

`keyof T & string` is there because template literal types need string keys, and
`keyof T` may include `number | symbol`. Forgetting it produces the error
"Type 'keyof T' is not assignable to type 'string | number | bigint | boolean |
null | undefined'", which is a genuinely mystifying message until you have seen
it once.

The cast in the runtime half is unavoidable and instructive. You are building
property names by string concatenation; TypeScript has no way to relate the
runtime string `"getName"` to the type-level key `` `get${Capitalize<"name">}` ``.
Every library that generates methods does the same thing: build loosely, cast
once at the boundary, and let the *declared* type be the contract. The value of
the type is undiminished — callers get full checking — but the implementation
has one honest lie in it, and it should be one line long and commented.

## ex3 — a conditional type with `infer`

`T extends readonly (infer U)[] ? U : T` reads as: "if `T` looks like an array of
something, call that something `U` and return it; otherwise return `T`". Using
`readonly (infer U)[]` rather than `(infer U)[]` is deliberate — the readonly
form matches both readonly and mutable arrays, exactly as in lesson 01, so the
type is more useful.

The two casts inside `flattenOnce` are the standard cost of a conditional return
type. `Array.isArray(item)` narrows `item` to `any[]` at runtime, but the
compiler cannot connect that to "therefore `ElementOf<T>` is the element type
here", because `T` is still unresolved. This is one of the clearest examples of
the boundary between what narrowing can prove and what a conditional type
asserts.

Worth comparing against the standard library: `Array.prototype.flat` has a
famously gnarly type using a recursive conditional `FlatArray<Arr, Depth>` with
a tuple-based depth counter. Hover it. It is the same idea as yours, iterated,
and it explains why `flat()` sometimes gives you a type you did not expect.

## ex4 — distribution, on and off

This exercise exists because distribution is the most common source of "why is
my conditional type doing that?". The four-character difference between
`T extends unknown ? T[] : never` and `[T] extends [unknown] ? T[] : never` is
the whole feature, and being able to explain it cold is a strong senior signal.

Two things to remember. `never` is the empty union, so distributing over it
produces `never` — which is why `Exclude<never, X>` is `never` and why a
conditional type applied to `never` can vanish surprisingly. And `boolean` is
secretly `true | false`, so distribution splits it: `BoxEach<boolean>` is
`true[] | false[]`, not `boolean[]`. That one has confused everybody at least
once.

The runtime `withoutValues` uses a `Set` and a cast, and the cast is the honest
part. `filter` returns `T[]`, not `MyExclude<T, U>[]`, because a predicate is
not proof. Lesson 10's type guards are the tool that can sometimes make the
compiler believe a filter — and even then, only for the shapes a guard can
actually check.

## challenge — DeepReadonly

Recursive types are the natural end point of this material, and `DeepReadonly`
is the canonical example. The implementation you wrote is the textbook version
and it has the textbook problems: `T[K] extends object` is true for arrays
(giving you an object type with numeric keys rather than a `readonly T[]`), true
for functions (mapping over a function's properties, which is nonsense), true
for `Date`, `Map` and `Set` (mapping over their internals, which is worse than
nonsense). A production version special-cases each:

```ts
type DeepReadonly<T> =
  T extends (...args: any[]) => any ? T :
  T extends readonly (infer U)[] ? readonly DeepReadonly<U>[] :
  T extends object ? { readonly [K in keyof T]: DeepReadonly<T[K]> } :
  T;
```

Knowing that the simple version is incomplete — and being able to say exactly
which cases it breaks on — is more valuable than having memorised the long one.

The runtime half has its own subtleties: `Object.freeze` is shallow, so the
recursion is what makes the type true; `typeof null === "object"` will crash you
if you forget it; and freezing an object with a cycle needs a `WeakSet` of
visited objects. `deepFreeze` also cannot un-freeze, which makes it a genuinely
destructive operation on an object someone else owns — the reason most codebases
use it only in tests and for module-level constants.

## Further reading

- [Handbook: Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html) — conditionals, `infer`, and the distributive rule with the tuple-wrapping escape.
- [Handbook: Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html) — modifiers, key remapping via `as`, and the `never`-drops-a-member idiom.
- [Handbook: Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html) — including `Uppercase`, `Capitalize` and the other intrinsics.
- [TypeScript Wiki: performance](https://github.com/microsoft/TypeScript/wiki/Performance) — why deep recursive types slow your editor down, and how to measure it.
- [type-challenges](https://github.com/type-challenges/type-challenges) — graded exercises in exactly this material, if you want to push past what this lesson covers.
