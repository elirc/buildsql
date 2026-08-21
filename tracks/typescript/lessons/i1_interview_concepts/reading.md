# Reading - typescript/i1_interview_concepts

The question bank. Sixty questions with model answers, grouped by topic, tagged
⭐ (occasionally asked) / ⭐⭐ (regularly) / ⭐⭐⭐ (expect it), each pointing at
the lesson to redo if the answer does not come easily.

## Notes

**How the answers are written.** Each one is what a strong mid-level candidate
would actually say: three to six sentences, one concrete example, and the
follow-up question named so you can head it off. They are deliberately not
exhaustive — an interview answer that runs three minutes is a worse answer than
one that runs thirty seconds and invites a follow-up. Cover the answer, say
yours out loud, then compare the *mechanism* you named rather than the words.

**How to prioritise.** Do every ⭐⭐⭐ until it is boring; they are the questions
that decide screens. Then the ⭐⭐, which are where a good candidate separates
from an adequate one. The ⭐ questions are for depth — you will not be rejected
for missing one, but landing one well is memorable.

**A rule for every answer:** name the mechanism, give the example, state the
trade-off. "Types are erased at compile time, so a `Lesson` interface cannot be
checked at runtime — that is why `JSON.parse` results need a guard; the cost is
one validation step per boundary." That shape works for almost every question
in this file.

## Fundamentals — what TypeScript is

**1. What is TypeScript, in one paragraph?** ⭐⭐⭐
TypeScript is JavaScript plus a static type checker that runs at build time
only. Every annotation is erased before the code runs — `tsc` emits plain
JavaScript — so types can prove that the pieces of your program fit together but
cannot validate anything at runtime. For example, an `interface User` gives you
autocomplete and compile errors, and does nothing whatsoever to a malformed API
response. That erasure is the single fact that explains most of the language's
design.
*Follow-up: "so what do you do about untrusted data?" · Weak here → redo 00_hello_dojo and 10_guards_assertions.*

**2. What does TypeScript compile to, and what disappears?** ⭐⭐⭐
It compiles to JavaScript at whatever target you configure, and everything
type-level disappears: annotations, interfaces, type aliases, generics, `as`
casts, `satisfies`. Three constructs are the exception because they emit real
code — `enum`, `namespace`, and parameter properties in constructors
(`constructor(private id: string)`). A good way to say it: "if I can delete it
and the JavaScript still runs, it was erased."
*Follow-up: "why is that a reason to prefer unions over enums?" · Weak here → redo 05_literals_enums.*

**3. What does `strict` actually turn on?** ⭐⭐
It is a bundle, not one flag: `noImplicitAny`, `strictNullChecks`,
`strictFunctionTypes`, `strictBindCallApply`, `strictPropertyInitialization`,
`noImplicitThis`, `useUnknownInCatchVariables`, and `alwaysStrict`. The two that
change how you write code every day are `noImplicitAny` (parameters must be
typed) and `strictNullChecks` (`null` and `undefined` are tracked as real
members of a type rather than being assignable to everything). Learning
TypeScript with `strict` off is learning a weaker, different language.
*Follow-up: "how would you turn it on in a large legacy codebase?" · Weak here → redo 00_hello_dojo.*

**4. Type inference — when should you annotate?** ⭐⭐
Annotate the boundaries and let inference do the middle: function parameters
(required under `noImplicitAny`), exported function return types, and empty
containers like `const rows: Row[] = []`. Skip annotations on locals initialised
from an expression, and on callbacks where contextual typing already knows the
parameter types. The reason to annotate exported *return* types specifically is
that an inferred public contract can be changed by an innocent edit to a body,
and nobody notices until a build breaks elsewhere.
*Follow-up: "show me a case where inference gives the wrong thing." · Weak here → redo 01_primitives_and_inference.*

**5. What is type widening?** ⭐⭐
When TypeScript infers a type for a mutable binding it widens the literal to its
base type: `let x = "a"` is `string`, `const x = "a"` is `"a"`, and object
properties widen too, so `{ mode: "dark" }` gives `mode: string`. This is why
passing `let mode = "dark"` to something expecting `"dark" | "light"` fails while
the `const` version succeeds. The three fixes are `const`, an explicit
annotation, or `as const`.
*Follow-up: "what does `as const` do to an array?" · Weak here → redo 05_literals_enums.*

**6. `tsc` vs Babel vs esbuild vs `--isolatedModules`?** ⭐
`tsc` is the only one that typechecks; the others strip types file by file and
are much faster, which is why most modern setups typecheck with `tsc --noEmit`
in CI and transpile with esbuild/SWC in the build. `isolatedModules` tells
`tsc` to reject constructs a single-file transpiler cannot handle safely —
re-exporting a type without `export type`, `const enum`, and similar. If a build
tool cannot see other files, anything requiring cross-file knowledge has to go.
*Follow-up: "why is `import type` needed then?" · Weak here → redo 11_async_and_modules.*

## `any`, `unknown`, `never`, `void`

**7. `any` vs `unknown`?** ⭐⭐⭐
Both accept every value; the difference is what you may do next. `any` switches
checking off for that value and everything derived from it, so
`value.a.b.c()` compiles and explodes at runtime. `unknown` keeps checking on:
you can hold it and pass it around, but you must narrow before you use it, which
forces exactly one honest check at the boundary. `JSON.parse` returns `any`, and
wrapping it to return `unknown` is a one-line improvement almost every codebase
should make.
*Follow-up: "where is `any` still the right answer?" · Weak here → redo 10_guards_assertions.*

**8. What is `never`, and where does it show up?** ⭐⭐⭐
`never` is the empty type — no value has it — so it is assignable to everything
and nothing is assignable to it. You see it as the return type of a function
that never finishes normally (`function fail(m: string): never { throw ... }`),
as the result of narrowing that has eliminated every member of a union, and as
the element type of an unannotated empty array in some positions. The practical
use is exhaustiveness: `assertNever(value: never)` in a `switch` default turns a
forgotten union member into a compile error.
*Follow-up: "what happens to `never` inside a union?" (it disappears) · Weak here → redo 04_unions_narrowing.*

**9. `void` vs `undefined`?** ⭐⭐
`void` as a return type means "I will ignore whatever you return", and a
function type returning `void` accepts an implementation returning anything —
which is why `items.forEach(x => list.push(x))` compiles even though `push`
returns a number. `undefined` is a real value with a real type. The rule: a
function *declaration* annotated `: void` may not return a value, but a function
*type* with a `void` return accepts one and discards it.
*Follow-up: "why does that special case exist?" · Weak here → redo 02_functions.*

**10. When is `any` acceptable?** ⭐⭐
In a constraint position where you are only saying "some function" —
`<F extends (...args: any[]) => any>` — because `unknown[]` breaks
contravariant parameter matching and the real types are recovered immediately by
`Parameters<F>` and `ReturnType<F>`. Also during a migration, behind a `// TODO`
and ideally behind a lint rule that counts them. Everywhere else, `unknown` plus
a narrowing step says the same thing honestly.
*Follow-up: "how do you stop `any` spreading?" (`noImplicitAny`, `no-explicit-any`, code review) · Weak here → redo 08_utility_types.*

**11. What type is the variable in a `catch` block?** ⭐⭐
`unknown`, since TypeScript 4.4 with `useUnknownInCatchVariables` (part of
`strict`) — because `throw` accepts any value and real libraries throw strings
and plain objects. So `error.message` does not compile until you narrow, and the
standard shape is
`error instanceof Error ? error.message : String(error)`. Before 4.4 it was
`any`, which is why old codebases are full of unchecked `err.message`.
*Follow-up: "what breaks `instanceof Error`?" (cross-realm values) · Weak here → redo i1 ex4.*

## Structural typing and assignability

**12. Structural vs nominal typing?** ⭐⭐⭐
TypeScript compares types by shape, not by name: any object with a
`name: string` satisfies `{ name: string }`, whoever declared it. Java and C# are
nominal — the declared name is the identity — which is why the same code feels
different in each. The consequence to name: `type UserId = string` and
`type OrderId = string` are the *same type*, so aliases give you no protection
against mixing them up.
*Follow-up: "how would you get nominal typing when you need it?" · Weak here → redo 03_objects_interfaces.*

**13. How do you fake nominal typing?** ⭐⭐
With a branded (or "opaque") type: intersect the primitive with something nobody
can produce accidentally, such as
`type UserId = string & { readonly __brand: unique symbol }`. You then create
values through a single factory that casts once, and everywhere else the
compiler refuses to mix `UserId` with a plain `string`. The cost is that one
cast plus a little ceremony at the boundary; the benefit is a whole class of
argument-order bugs becoming impossible.
*Follow-up: "what does that compile to?" (nothing — it is erased) · Weak here → redo 03_objects_interfaces.*

**14. What is excess property checking?** ⭐⭐
Structural typing says extra properties are fine, but a *fresh object literal*
assigned directly to a typed target gets an extra check that rejects unknown
members — because a literal with a member the target has never heard of is
almost always a typo. Assign the literal to a variable first and the check
disappears, which looks inconsistent until you know it is deliberate. It is what
catches `{ retires: 2 }` when you meant `retries`.
*Follow-up: "how do you allow extra properties on purpose?" (an index signature, or a widening variable) · Weak here → redo 03_objects_interfaces.*

**15. Are function parameters checked covariantly or contravariantly?** ⭐
Contravariantly, in principle: a function accepting a *wider* parameter is
assignable where a narrower one is expected. TypeScript enforces that for
function-typed properties under `strictFunctionTypes`, but *method* declarations
stay bivariant for historical and ergonomic reasons — largely so that arrays and
DOM event handlers keep working. The honest one-liner: "parameters are
contravariant, except methods, which are bivariant on purpose."
*Follow-up: "give me an unsound example." (an `Array<Dog>` where `Array<Animal>` is expected) · Weak here → redo 07_generics_2.*

**16. Why does `{ a: 1, b: 2 }` satisfy `{ a: number }` but `Dog[]` also satisfy `Animal[]`?** ⭐
The first is plain structural assignability: extra members are ignored. The
second is array covariance, which is unsound and known to be — you could push a
`Cat` into the `Animal[]` and corrupt the `Dog[]`. TypeScript accepts it because
the sound alternative makes everyday code miserable, and this pragmatism is a
recurring theme in the language.
*Follow-up: "what does `readonly T[]` change about that?" · Weak here → redo 01_primitives_and_inference.*

## `interface` vs `type`

**17. `interface` vs `type` — which and why?** ⭐⭐⭐
For describing an object shape they are almost interchangeable. `interface`
supports declaration merging (declare it twice and members combine — how you
augment `Window` or a library's types) and produces friendlier error messages;
`type` can express what an interface cannot: unions, tuples, primitives, mapped
and conditional types. My default is `interface` for object shapes that might be
extended or merged, `type` for everything else — and consistency inside a module
matters more than the choice.
*Follow-up: "show me something only a type alias can do." (`type Level = "a" | "b"`) · Weak here → redo 03_objects_interfaces.*

**18. What is declaration merging?** ⭐⭐
Two declarations of the same interface in the same scope combine into one type;
namespaces merge the same way, and an interface can merge with a class or a
function declaration. It is the mechanism behind module augmentation —
`declare global { interface Window { myThing: X } }` — and behind libraries that
let you extend their types from your own code. Type aliases cannot do it:
declaring the same alias twice is "Duplicate identifier".
*Follow-up: "when is that a footgun?" (silent merges across files) · Weak here → redo i1 ex3.*

**19. `extends` vs `&` (intersection)?** ⭐⭐
`interface B extends A` checks compatibility at declaration time and reports a
conflict; `type B = A & { ... }` produces an intersection, and conflicting
members silently become `never` rather than erroring. Intersections also compose
with unions and other computed types, which `extends` cannot. Performance-wise,
long intersection chains are slower for the checker than interface extension.
*Follow-up: "what does `{ a: string } & { a: number }` give you?" (`a: never`) · Weak here → redo 03_objects_interfaces.*

**20. What is an index signature, and what does it not protect you from?** ⭐⭐
`{ [key: string]: number }` says every string key yields a number, so
`tally.typo` typechecks and is `undefined` at runtime — the type is a promise
you made, not one the compiler verified. When the key set is actually closed,
`Record<"a" | "b", number>` is far safer because a missing member is a compile
error. `noUncheckedIndexedAccess` is the flag that makes every indexed read
`T | undefined`.
*Follow-up: "how does that interact with `Object.keys`?" (it returns `string[]`, not `keyof T`) · Weak here → redo 03_objects_interfaces and 08_utility_types.*

## Unions, narrowing, exhaustiveness

**21. What is a union type, and what can you do with one before narrowing?** ⭐⭐⭐
`A | B` is a value that is one of several types, and before you narrow it you
may only touch members that *every* constituent has — so `string | number` gives
you `toString()` but not `toUpperCase()`. That refusal is the feature: in plain
JavaScript calling `toUpperCase` on a number is a runtime crash. Narrowing with
`typeof`, `instanceof`, `in` or a discriminant opens up the full type.
*Follow-up: "what about intersections?" (opposite: more capability, fewer values) · Weak here → redo 04_unions_narrowing.*

**22. What is a discriminated union and why is it the most useful pattern in TypeScript?** ⭐⭐⭐
It is several object types unioned together, each with a shared property pinned
to a distinct *literal* — `{ kind: "circle"; radius: number } | { kind: "square";
side: number }`. Comparing that property is proof for the compiler, so
`switch (shape.kind)` narrows each branch to exactly one variant. It makes
illegal states unrepresentable, which beats one interface with five optional
members and defensive checks everywhere.
*Follow-up: "how do you keep the switch exhaustive?" · Weak here → redo 04_unions_narrowing.*

**23. How do you get exhaustiveness checking?** ⭐⭐⭐
Put a `default` branch that calls a helper typed `assertNever(value: never):
never`. In an exhaustive switch the value is narrowed to `never` there, so the
call compiles; miss a variant and the value is not `never` any more and you get
a compile error naming exactly what you forgot. Return the call
(`return assertNever(x)`) so the compiler also knows the function always
returns.
*Follow-up: "why does it also throw?" (types are erased; bad data really arrives) · Weak here → redo 04_unions_narrowing and i1 ex2.*

**24. What narrowing mechanisms does TypeScript have?** ⭐⭐
`typeof` for primitives, `instanceof` for class instances, `in` for property
presence, `===`/`switch` against literals for discriminated unions, truthiness
and `!= null` for nullability, `Array.isArray`, and user-defined type predicates
for anything else. Control flow analysis threads all of them through your
function, including early `return`s and `throw`s. The one to volunteer is that
narrowing is lost inside closures that may run later, and for mutable object
properties.
*Follow-up: "how do you narrow across a function boundary?" (a type predicate) · Weak here → redo 04_unions_narrowing.*

**25. What is a user-defined type guard?** ⭐⭐⭐
A function whose return type is a predicate — `function isLesson(value:
unknown): value is Lesson` — so callers who write `if (isLesson(x))` get `x`
narrowed inside the block. TypeScript does not verify that the body establishes
the claim, so a guard that returns `true` unconditionally compiles and lies;
guards deserve their own unit tests. Since 5.5, simple predicates can be
inferred automatically.
*Follow-up: "how do you use one with `filter`?" (`items.filter((i): i is T => ...)`) · Weak here → redo 10_guards_assertions.*

**26. What is an assertion function?** ⭐⭐
A function typed `asserts value is T` that throws when the claim is false;
after the call the value is narrowed for the rest of the scope with no `if`. Two
rules bite people: TypeScript will not *infer* an assertion signature, so the
declaration needs an explicit type, and the function must throw — returning
normally makes the narrowing a lie. Use guards when both outcomes are ordinary
and assertions for invariants.
*Follow-up: "why can't `const f = (v) => ...` be an assertion?" · Weak here → redo 10_guards_assertions.*

**27. How does `strictNullChecks` change your code?** ⭐⭐
It makes `null` and `undefined` ordinary union members instead of values
assignable to everything, so `string | null` must be narrowed before use. In
practice you write more `if (x)` and `x ?? fallback`, and you stop shipping
"cannot read properties of undefined". Optional chaining `?.` and the non-null
assertion `!` are the ergonomic tools — and every `!` is a claim you should be
able to justify.
*Follow-up: "when is `!` acceptable?" · Weak here → redo 04_unions_narrowing.*

**28. `??` vs `||`?** ⭐⭐⭐
`||` falls back on every falsy value — `0`, `""`, `false`, `NaN` — while `??`
falls back only on `null` and `undefined`. So `options.retries || 1` turns an
explicit zero into one, and `options.verbose || true` produces a flag nobody can
switch off. Use `??` for defaults on values where a falsy value is meaningful,
which is most of them.
*Follow-up: "what does `?.` return when it short-circuits?" (`undefined`) · Weak here → redo 03_objects_interfaces.*

## Literals, enums, `as const`

**29. What is a literal type?** ⭐⭐
A type whose only value is one specific value: `"circle"`, `42`, `true`. Unioned
together they model a closed set — `type Level = "beginner" | "advanced"` — which
gives autocomplete, catches typos, and lets a `switch` be checked for
exhaustiveness. This is why `status: string` is almost always the wrong
annotation for a status.
*Follow-up: "why does a `let` lose the literal type?" (widening) · Weak here → redo 05_literals_enums.*

**30. What does `as const` do?** ⭐⭐⭐
It is a const assertion: every property becomes `readonly` and every literal
keeps its literal type instead of widening, and array literals become readonly
tuples. It emits nothing — the JavaScript is identical — so it is purely a
compile-time description, unlike `Object.freeze`, which is a runtime call. The
usual pairing is `as const` on a config object plus `keyof typeof` to derive a
union of its keys.
*Follow-up: "how do you get a union of the *values*?" (`typeof obj[keyof typeof obj]`) · Weak here → redo 05_literals_enums.*

**31. Enums or union of string literals?** ⭐⭐⭐
Union of literals by default: it is erased, so nothing ships to the client, and
a plain string from `JSON.parse` is assignable without a cast. A string enum
gives you nominal typing (a raw string is *not* assignable), one import
carrying both values and type, and something to iterate with `Object.values` —
at the cost of an emitted runtime object and a cast at every boundary. Numeric
enums have unsound assignability and reverse mappings; avoid them.
*Follow-up: "what is `const enum` and why is it discouraged?" · Weak here → redo 05_literals_enums.*

**32. What are template literal types?** ⭐
Types the compiler can compute from string literals:
`` type Route = `/api/${"users" | "orders"}` `` produces two literal types. They
distribute over unions and combine with the intrinsic helpers `Uppercase`,
`Lowercase`, `Capitalize` and `Uncapitalize`. Real uses are typed event names
(`` `on${Capitalize<E>}` ``), route parameters, and CSS-in-JS variant props.
*Follow-up: "how would you parse a path into params?" (recursive conditional types) · Weak here → redo 09_mapped_conditional.*

**33. What does `satisfies` do that an annotation does not?** ⭐⭐⭐
It checks the value against a type without replacing the value's inferred type.
`const config: Record<string, string | number> = {...}` widens every member to
the union and adds an index signature that hides typos; `const config = {...}
satisfies Record<string, string | number>` validates the same constraint while
`config.host` stays `string` and `config.hsot` is an error. It is the right
default for configuration objects, palettes and route tables.
*Follow-up: "how does it combine with `as const`?" (`as const satisfies T`) · Weak here → redo 10_guards_assertions.*

## Generics

**34. What problem do generics solve?** ⭐⭐⭐
They let one implementation serve many types while *remembering* which one each
caller used. Without them your options are duplication (`firstString`,
`firstNumber`) or `any`/`unknown`, which throws away what the caller knew:
`first<T>(items: T[]): T | undefined` gives `string | undefined` for a string
array with no annotation at the call site. The rule of thumb is that a type
parameter should appear at least twice in a signature — otherwise it is doing
nothing.
*Follow-up: "show me a needless generic." (`function log<T>(x: T): void`) · Weak here → redo 06_generics_1.*

**35. How does TypeScript infer type arguments?** ⭐⭐
It collects candidates from the arguments, picks a best common type, and then
uses that to contextually type the rest — which is why a callback's parameters
need no annotations once the array is known. Conflicting candidates in the same
position widen to a union or error, and when nothing determines a parameter it
falls back to `unknown` (or a declared default). If inference gives you
something odd, the fix is usually an explicit type argument or reordering the
parameters.
*Follow-up: "why does an empty array infer `never[]`?" · Weak here → redo 06_generics_1.*

**36. What is a generic constraint?** ⭐⭐⭐
`<T extends { length: number }>` says every `T` must be at least that shape:
inside the function you may use `.length`, and outside, arguments without it are
rejected. Crucially `T` is still inferred as the caller's specific type, so
`longest("abc", "de")` returns `string`, not `{ length: number }`. Constrain to
the shape you actually use and no more.
*Follow-up: "what does `T extends unknown` mean?" (nothing useful — except to trigger distribution) · Weak here → redo 07_generics_2.*

**37. What do `keyof` and `T[K]` do?** ⭐⭐⭐
`keyof T` is the union of `T`'s property names; `T[K]` is an indexed access type
— the type stored at that key. Together they give the most reusable signature in
the language: `function get<T, K extends keyof T>(obj: T, key: K): T[K]`, which
makes `get(user, "streak")` a `number` and `get(user, "nope")` a compile error.
Every typed `pick`, `orderBy` or ORM `select` is that signature with more
decoration.
*Follow-up: "why two type parameters instead of `key: keyof T`?" (the literal type is information) · Weak here → redo 07_generics_2.*

**38. Default type arguments — when are they useful?** ⭐
`class Registry<T = string>` supplies the type argument when a caller omits it,
which keeps a common case terse and lets you add a type parameter to an existing
generic without breaking anyone. Inference always wins over the default, so it
only fires when nothing else determines the parameter. Defaults must come after
parameters that have none, exactly like value defaults.
*Follow-up: "what happens with `new Registry()` and no context?" · Weak here → redo 07_generics_2.*

**39. Why can't a static member use the class's type parameter?** ⭐
Because the type parameter belongs to an *instance* — it is fixed at
construction — and a static member exists on the class, where there is no
instance to fix it. If you need a generic factory, declare the parameter on the
method: `static of<U>(value: U): Box<U>`. This trips people up when they try to
write a static cache keyed by `T`.
*Follow-up: "how would you write a typed static factory?" · Weak here → redo 07_generics_2.*

**40. What is variance, in TypeScript terms?** ⭐
It is how a type relates when its parameter changes. Return types are covariant
(`() => Dog` fits where `() => Animal` is expected); function parameters are
contravariant in principle, with methods deliberately left bivariant; arrays are
covariant and unsound. TypeScript 4.7 added explicit variance annotations
(`in`, `out`) for generic types, mainly as a performance hint for the checker.
*Follow-up: "why is `Array<Dog>` assignable to `Array<Animal>` if it is unsound?" (ergonomics) · Weak here → redo 07_generics_2.*

## Utility, mapped and conditional types

**41. Which utility types do you use most, and what are they made of?** ⭐⭐⭐
`Partial`, `Required`, `Readonly`, `Pick`, `Omit`, `Record`, `Exclude`,
`NonNullable`, `ReturnType`, `Awaited`. None of them is compiler magic — they
are short type programs: `Partial<T>` is `{ [K in keyof T]?: T[K] }` and
`Omit<T, K>` is `Pick<T, Exclude<keyof T, K>>`. The habit they encode is
deriving types from one source rather than writing the same members twice.
*Follow-up: "what is the gotcha with `Omit`?" · Weak here → redo 08_utility_types.*

**42. What is the gotcha with `Omit`?** ⭐⭐
Its key parameter is not constrained to `keyof T`, so `Omit<User, "passwrodHash">`
silently omits nothing and typechecks. `Pick` *is* constrained, so a typo there
is an error. Teams that care define `type StrictOmit<T, K extends keyof T> =
Omit<T, K>` and lint for the built-in. For anything security-relevant, prefer
`Pick`, because it fails closed when a new field is added.
*Follow-up: "why is `Omit` deliberately loose?" (union inputs and historical compatibility) · Weak here → redo 08_utility_types.*

**43. What is a mapped type?** ⭐⭐
A loop over the keys of a type: `{ [K in keyof T]: T[K] }`, with `?` and
`readonly` addable (`+`) or removable (`-`), and an `as` clause to rename keys.
`-readonly [K in keyof T]: T[K]` is `Mutable<T>`; `[K in keyof T as
\`get${Capitalize<K & string>}\`]` builds a getter map. A remapped key of `never`
drops the member, which is the idiom for filtering keys.
*Follow-up: "what is a homomorphic mapped type?" (the `keyof T` form, which preserves modifiers and arrays) · Weak here → redo 09_mapped_conditional.*

**44. What is a conditional type, and what is `infer`?** ⭐⭐
`T extends U ? X : Y` is a ternary for types, where `extends` means "is
assignable to". `infer` declares a placeholder inside the pattern and binds it
on a match: `type ElementOf<T> = T extends readonly (infer U)[] ? U : T`. That
combination is pattern matching, and it is how `ReturnType`, `Parameters` and
`Awaited` are implemented.
*Follow-up: "what happens when you pass a union?" · Weak here → redo 09_mapped_conditional.*

**45. What is distributivity in conditional types?** ⭐⭐
When the checked type is a *naked* type parameter, a conditional distributes
over each member of a union and unions the results — which is the whole reason
`Exclude<T, U> = T extends U ? never : T` works as subtraction. Wrapping both
sides in tuples (`[T] extends [U]`) switches it off, so the union is compared as
a whole. Two traps: `never` is the empty union, so distributing over it yields
`never`, and `boolean` is `true | false`, so it splits.
*Follow-up: "how do you write a non-distributive `Exclude`?" · Weak here → redo 09_mapped_conditional.*

**46. When would you *not* write a clever type?** ⭐⭐
When the cost lands on everyone else: deep recursive types slow the editor down
on every keystroke, produce error messages nobody can read, and eventually hit
"Type instantiation is excessively deep". Derive at the boundary — one schema, a
generated set of types — and keep the rest boring. A slightly duplicated type
that a junior can read often beats a clever one that only its author can debug.
*Follow-up: "how do you measure it?" (`tsc --extendedDiagnostics`, `--generateTrace`) · Weak here → redo 09_mapped_conditional.*

## Validation and the boundary

**47. How do you handle data from an API?** ⭐⭐⭐
Type it `unknown` at the door and validate it once, then work with real types
inside. Hand-written guards are fine for a couple of shapes; past that, a schema
library like `zod` gives you a runtime validator and a static type from one
declaration (`z.infer<typeof schema>`), which removes the duplication. The
anti-pattern to name is `await res.json() as User`, which asserts something
nobody checked and surfaces three components away.
*Follow-up: "what do you do when validation fails?" · Weak here → redo 10_guards_assertions.*

**48. `as` casts — when are they legitimate?** ⭐⭐
When you genuinely know something the compiler cannot: immediately after a
runtime check it cannot follow, when building an object incrementally that will
satisfy a mapped type, or at a boundary you have validated by other means. They
should be narrow, local and commented. `as unknown as T` is the double cast that
bypasses even the "no overlap" guard rail — treat every one as a bug report
waiting to happen.
*Follow-up: "how is `as` different from `satisfies`?" · Weak here → redo 10_guards_assertions.*

**49. What is `Object.keys` typed as, and why is that annoying?** ⭐
`string[]`, not `(keyof T)[]`, because an object may have more properties at
runtime than its type declares — structural typing means a value can always be a
subtype. So iterating keys to index the object needs a cast or a helper. The
honest workaround is a small typed helper you write once and justify once.
*Follow-up: "why is that actually sound?" · Weak here → redo 08_utility_types.*

**50. `unknown` in, what out? How do you design a validator's return?** ⭐⭐
Either a type predicate (`value is T`) when the caller just needs a boolean, or
a `Result`-shaped discriminated union (`{ ok: true; value: T } | { ok: false;
errors: string[] }`) when the caller needs to know *why*. The union scales
better for forms and APIs because the errors are data. Collect all errors rather
than returning at the first one — showing a user one problem at a time is a
symptom of the opposite choice.
*Follow-up: "how does that compare to throwing?" · Weak here → redo 10_guards_assertions.*

## Async

**51. What does `async` do to a function's type?** ⭐⭐⭐
It makes the return type `Promise<T>`, always — TypeScript enforces that the
declared return type is a promise, wraps `return` values for you, and turns a
`throw` into a rejection. The most common bug it prevents is a forgotten
`await`, which the compiler catches when your return types are annotated. The
matching type-level tool is `Awaited<T>`, which unwraps the promise again.
*Follow-up: "what does `try/catch` around an un-awaited call catch?" (nothing) · Weak here → redo 11_async_and_modules.*

**52. `Promise.all` vs `allSettled` vs `race` vs `any`?** ⭐⭐⭐
`all` resolves to a tuple/array of all results and rejects as soon as any input
rejects — the others keep running unobserved. `allSettled` never rejects and
gives a per-item `{status, value|reason}`, which is what you want when partial
success is meaningful. `race` settles with the first result of any kind (the
timeout idiom); `any` settles with the first *success* and rejects with an
`AggregateError` if all fail.
*Follow-up: "which one for fetching a dashboard's five widgets?" (`allSettled`) · Weak here → redo 11_async_and_modules.*

**53. What is wrong with two consecutive `await`s?** ⭐⭐⭐
Nothing, if the second depends on the first. If they are independent, you have
just serialised two operations for no reason and doubled the latency —
`Promise.all([a(), b()])` starts both immediately. The nuance worth adding is
that creating a promise *starts* the work, so a helper that wants to control
scheduling must take thunks (`() => Promise<T>`), not promises.
*Follow-up: "how would you limit concurrency to 5?" · Weak here → redo 11_async_and_modules.*

**54. How do you limit concurrency?** ⭐⭐
With a small worker pool: create `limit` async workers that each loop, pulling
the next index off a shared counter and writing into `results[index]`. That
preserves input order, never exceeds the limit, and keeps every worker busy —
unlike chunking into batches, which idles whenever one task in a batch is slow.
`p-limit` is the library version, and every job queue does the same thing.
*Follow-up: "what happens when a task rejects?" · Weak here → redo 11_async_and_modules challenge.*

**55. What are async iterators for?** ⭐
Sequences that arrive over time: paginated APIs, streams, queues.
`async function*` produces an `AsyncGenerator<T>`, and `for await (const x of
source)` consumes anything `AsyncIterable<T>` — including Node streams. It lets
a consumer write an ordinary loop while the producer handles paging and
backpressure.
*Follow-up: "why accept `AsyncIterable` rather than `AsyncGenerator`?" (weakest thing you need) · Weak here → redo 11_async_and_modules.*

## Modules, config, migration

**56. What is `import type` for?** ⭐⭐
It states that an import is types-only, so it is guaranteed to be erased and
cannot accidentally create a runtime dependency (or a circular one). Under
`isolatedModules`, where each file is transpiled alone, the compiler cannot
always tell whether a name is a type or a value, so being explicit avoids
breakage. `verbatimModuleSyntax` makes the rule strict: what you wrote is what
is emitted.
*Follow-up: "why would a type import cause a runtime cycle?" · Weak here → redo 11_async_and_modules.*

**57. What is a `.d.ts` file?** ⭐⭐
A declaration file: shapes with no implementations, emitting nothing. TypeScript
finds `legacy.d.ts` beside `legacy.js`, or `types` in a package's `package.json`,
or `@types/<name>` from DefinitelyTyped. Nothing verifies a declaration against
the code it describes, which is why a wrong `@types` package produces errors
that make no sense — and why `skipLibCheck: true` is nearly universal.
*Follow-up: "how would you type an untyped npm package?" · Weak here → redo 11_async_and_modules ex4.*

**58. How would you migrate a large JavaScript codebase to TypeScript?** ⭐⭐
Incrementally: turn on `allowJs` and `checkJs` file by file, rename leaves
first, keep `strict` off initially but turn on `noImplicitAny` early because it
drives the most valuable annotations. Add types at boundaries (API clients,
shared models) before internals, since that is where the errors are. Track
progress with a count of `any`s and `@ts-expect-error`s rather than a
percentage of renamed files.
*Follow-up: "`@ts-ignore` or `@ts-expect-error`?" (the latter — it fails when the error goes away) · Weak here → redo 00_hello_dojo.*

**59. `@ts-ignore` vs `@ts-expect-error`?** ⭐⭐
Both suppress the error on the next line; `@ts-expect-error` additionally
*errors* if there is no error to suppress, so it cleans itself up when the
underlying problem is fixed. Always prefer it, and always with a comment saying
why. It is also how type-level tests assert that something must not compile,
which is exactly how this course's type gates work.
*Follow-up: "how do you test that a type rejects something?" · Weak here → redo 00_hello_dojo.*

**60. How do you test types?** ⭐
With type-level assertions that fail the build: `expectTypeOf` from vitest,
`tsd`, or hand-rolled `Expect<Equal<A, B>>` helpers, plus `@ts-expect-error`
probes for things that must not compile. They run as part of typechecking, not
at runtime. Type tests earn their keep on public APIs and on any clever generic,
where a refactor can silently widen a type without breaking a single runtime
test.
*Follow-up: "have you done that in anger?" — and the honest answer is this course. · Weak here → redo any lesson's gate.test-d.ts.*

## ex1 — `any` versus `unknown`, in code

The parameter change is the whole answer to question 7, made concrete: with
`any` the body could have done anything and the caller got no protection; with
`unknown` the compiler forces the three checks that make the function correct.
Notice which check catches `null` — `typeof null === "object"` is the wart that
turns a one-line object test into a two-part one, and interviewers do ask about
it.

The `Object.keys(value).length` branch is worth defending out loud: an object's
"length" is a design decision, not a fact, and this one counts own enumerable
string keys. A `Map` therefore reports zero, which is either correct or a bug
depending on what a caller expects. Saying "here is the rule I chose and here is
what it excludes" is exactly the judgement an interview is probing for.

## ex2 — make the union exhaustive

Two bugs, one visible and one structural. The missing `failed` branch is the
symptom; the `default: return "unknown"` is the cause, because a catch-all makes
every future variant silently fall through. Swapping it for `assertNever` turns
the *next* addition into a compile error listing the file and the variant.

The detail that separates a good answer from a great one is why
`return assertNever(job)` rather than a bare call. The `return` is what
convinces the compiler that every path produces a string; without it, control
can notionally fall out of the switch. And `assertNever` throws as well as
failing to compile, because a `{ status: "paused" }` really can arrive from
`JSON.parse` at runtime, where no type exists to stop it.

## ex3 — declaration merging

This is question 17 and question 18 in executable form. A second
`interface DojoEvents` declaration merges into the first, so `keyof DojoEvents`
becomes `"pass" | "fail"` without touching the original — which is precisely
what a library consumer needs when they want to add their own event to somebody
else's map. Try converting the interface to a `type` alias and watch "Duplicate
identifier" appear; that is the demonstration to describe out loud.

The cast inside the body is also worth understanding rather than apologising
for. Inside the function `K` is still generic, so comparing `event === "fail"`
tells the compiler nothing about `payload` — narrowing works on values, not on
relationships between two type parameters. The alternatives are overloads or a
discriminated-union parameter; the cast is the pragmatic choice and the one
almost every event-emitter implementation uses.

## ex4 — what a `catch` actually gives you

The stub's `error: Error` is a wish. `throw` accepts any value, so real code
throws strings (older libraries), plain objects (some HTTP clients), and
occasionally `undefined`. `useUnknownInCatchVariables` made the language honest
about that in 4.4, and this function is the standard shape of the fix.

Two things to volunteer when you answer this in an interview. First, that
`instanceof Error` fails across realms — an error from an iframe, a worker or
Node's `vm` module has a different `Error` constructor — which is why library
code often duck-types a `message` property as a fallback. Second, that
`String(error)` is the safe final step, because it works for every value
including `null` and objects with no `toString`.

## review1 — safeGet

The point of bringing `unknown` back a third time is the *return* type, not the
parameter. Returning `any` from a helper like this is the sneakiest way to
reintroduce `any` into a strict codebase: it looks harmless, and every caller
silently loses checking on whatever they do next. `unknown` keeps the cost where
it belongs — one narrowing step at the point of use, by the person who knows
what they expect.

The cast to `Record<string, unknown>` after the two-part object check is the
"legitimate cast" from question 48: narrow, local, and true at that exact point.
If you found yourself wanting `key in source` to distinguish a missing key from
a stored `undefined`, that is the right instinct and the right follow-up
question to raise yourself.

## Further reading

- [The TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html) — the whole reference; the Narrowing, Generics and Type Manipulation sections cover most of this bank.
- [TypeScript FAQ (official wiki)](https://github.com/microsoft/TypeScript/wiki/FAQ) — the canonical answers to "why does TypeScript do that?", including variance and excess property checking.
- [`tsconfig` reference](https://www.typescriptlang.org/tsconfig) — every flag mentioned above, with examples.
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/) — a second voice on the same material, useful when the handbook's phrasing does not land.
- [Total TypeScript type transformations](https://www.totaltypescript.com/books/total-typescript-essentials) — free written course, strong on generics, mapped types and the boundary problem.
