# Reading - typescript/05_literals_enums

Literal types, const assertions, and the enum debate — with the answers an
interviewer is listening for.

## Notes

**Widening, one more time, because this is where it bites.** TypeScript infers
the narrowest useful type and then *widens* it when the binding is mutable.
`const x = "a"` is `"a"`; `let x = "a"` is `string`; `{ x: "a" }` gives `x` the
type `string`, because object properties are mutable too. That last one is the
one that surprises people, and it is exactly why `as const` exists. The three
ways to keep a literal are: make the binding `const`, annotate the target type
explicitly, or use a const assertion. Knowing which one to reach for in an
error message is a real day-to-day skill.

**`as const` is a type assertion, not a runtime freeze.** It makes every
property `readonly`, keeps every literal literal, and turns array literals into
`readonly` tuples. It emits nothing — the JavaScript is unchanged, and the
object is still mutable at runtime by anyone with a plain reference. If you
want actual immutability you want `Object.freeze`, which is a runtime call with
runtime cost; the two are complementary, and TypeScript even types
`Object.freeze` to give you the readonly type as well.

**Deriving beats repeating.** `keyof typeof CONFIG` is the smallest example of
a habit that pays off through the rest of this course: describe the data once,
derive the types from it. The alternative — a hand-written union sitting next
to the object it mirrors — is two things that must be kept in sync by
discipline, and discipline loses to deadlines. This same instinct produces
`typeof handlers`, `ReturnType<typeof makeStore>` and the mapped types of
lesson 09.

**The enum question, answered properly.** `enum` is one of a small number of
TypeScript features that emit JavaScript rather than being erased, which makes
it the odd one out in a language that otherwise disappears at build time. The
case *for* string enums: nominal typing (a plain string is not assignable, so
values cannot be faked), a single import that carries both the values and the
type, and a natural home for documentation comments. The case *against*: the
runtime object cannot be tree-shaken, values crossing a boundary
(`JSON.parse`, a database row, a form field) are plain strings that need a cast
or a validator, numeric enums have genuinely unsound assignability and reverse
mappings, and `const enum` is incompatible with `isolatedModules` and most
bundlers. The pragmatic answer most teams reach: string literal unions by
default, with `as const` objects when you also need runtime values; enums when
nominal typing earns its keep, or when a codebase already uses them
consistently.

**Template literal types exist, and this is the lesson where they start making
sense.** Since TypeScript 4.1 the type system can compute string types:

```ts
type Track = "typescript" | "node";
type GateFile = `${Track}/gate.test.ts`;   // "typescript/gate.test.ts" | "node/gate.test.ts"
```

They combine with unions by distributing over every member, and they power
things like typed route parameters and `on${Capitalize<Event>}` handler names.
Lesson 09 uses one for real.

## ex1 — three values, not every string

`type Level = string` and `type Level = "beginner" | "intermediate" |
"advanced"` produce identical JavaScript and completely different development
experiences. With the union you get autocomplete on every call site, a compile
error for a misspelled case label, and a `switch` the compiler can check for
exhaustiveness. With `string` you get none of that and a function that happily
accepts `"beginer"`.

The `advanced` → `advanced` rule is a design decision worth noticing. The
alternatives were returning `null` (making the return type `Level | null` and
pushing a check onto every caller) or throwing (making a legal input an
exception). "Saturate at the top" is the one that keeps the signature honest,
and honest signatures are how you avoid `!` and `?.` spreading through a
codebase.

The other thing to try, if you have not: write the `switch` with only two cases
and a `default` that calls the `assertNever` from lesson 04. The error names
`"advanced"` explicitly. That is what a compile-time to-do list looks like.

## ex2 — freeze the lookup table

Without `as const`, `TRACK_TITLES.typescript` is `string` and the object is
mutable, so nothing stops another module writing to it. With `as const` the
property is the literal `"TypeScript"` and the write is a compile error. Note
what did *not* change: the emitted JavaScript, byte for byte. This is the
clearest possible demonstration that types are a compile-time story about a
runtime object.

The indexed lookup `TRACK_TITLES[track]` deserves a moment. It compiles because
`track` is one of the object's literal keys — the compiler can check that every
possible value of `track` is a real property. Widen the parameter to `string`
and it stops compiling with "No index signature with a parameter of type
'string'". That error is TypeScript refusing to pretend the lookup will
succeed, and the fix is either an index signature (which lies, per lesson 03) or
a narrower key type (which does not).

## ex3 — an enum, on purpose

The runtime assertion in the gate — `expect(Status.Published).toBe("published")`
— is there to make the emit visible. Enums are not erased; `Status` is a real
object in the bundle. That has two consequences worth carrying: it costs bytes,
and it means you can iterate the members (`Object.values(Status)`), which a
literal union cannot do without an `as const` array to go with it.

The nominal behaviour is the genuinely useful part. `const s: Status = "draft"`
is an error, so a `Status` in your program provably came from your enum rather
than from a query string. The flip side is that data from outside — `JSON.parse`
of an API response, a row from a database, `req.body.status` — is a plain
string, and you will be writing `as Status` or a validator at every boundary.
Whether that boundary work is a feature (a place to validate) or a nuisance
(a place to cast blindly) depends entirely on your team's discipline, which is
the real reason the community is split.

A last practical note: prefer string enums to numeric ones. Numeric enum members
accept arbitrary numbers in more situations than they should, and a numeric
enum in a database column or a log line tells a future reader nothing.

## challenge — derive the union from the data

`keyof typeof HINT_TIERS` is two operators doing one job, and reading them
right to left is the key. The type-level `typeof` takes a *value* and gives you
its type — a different operator from the runtime `typeof` despite the shared
spelling, distinguished by appearing in a type position. `keyof` then takes a
type and gives you the union of its keys.

Without `as const` the keys are still `"nudge" | "approach" | "almost"`, so
`Tier` alone would have worked — but the *values* would widen to `number`, and
the gate checks `HINT_TIERS.almost` is the literal `3`. The habit to build is
adding `as const` to any table you intend to derive types from; it costs
nothing and it means you can go further later (mapping the values into another
type, checking exhaustiveness against the object, and so on).

The `[...tiers].sort(...)` copy is lesson 01 returning. Note that the compiler
enforces it this time: `tiers` is `readonly Tier[]` and `sort` is not on a
readonly array, so you cannot forget.

## review1 — verdictIcon

The third literal union in one lesson, on purpose. What is being trained is the
reflex to ask "is this set closed?" whenever you are about to write `string`.
Statuses, verdicts, roles, sort directions, HTTP methods, log levels, event
names — closed, all of them, and each one is a `switch` waiting to be checked.

The open question in the hint is a real one: should `verdictIcon` return
`string` or `"ok" | "x" | "-"`? Returning the narrower type gives callers
something they can `switch` on exhaustively; returning `string` gives you room
to change the icons without breaking anyone. That is the classic
narrow-vs-flexible trade, and the right answer depends on whether the icons are
data or presentation.

## Further reading

- [Handbook: Everyday Types — literal types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types) — literal types, literal inference and widening, with the `as const` fix.
- [Handbook: Enums](https://www.typescriptlang.org/docs/handbook/enums.html) — string, numeric, `const` and reverse-mapped enums, plus the "objects vs enums" section the official docs now include.
- [TypeScript 3.4 release notes: `const` assertions](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions) — what `as const` does, from the release that introduced it.
- [Handbook: Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html) — string types the compiler can compute, and how they distribute over unions.
- [`tsconfig` reference: `isolatedModules`](https://www.typescriptlang.org/tsconfig/#isolatedModules) — why `const enum` is off the table in this course and in most bundled projects.
