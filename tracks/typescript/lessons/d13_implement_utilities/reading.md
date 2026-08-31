# Reading - typescript/d13_implement_utilities

The debrief. Per problem: what the utility was really made of, the mistake that
looks right, and one sentence on the model answer.

## Notes

**Every built-in utility type is a few lines of ordinary type code**, and this
set exists to make you the person who can write those lines cold. There are only
three ingredients. A *mapped type* (`[K in keyof T]`) walks keys and rebuilds an
object, and its modifiers (`readonly`, `?`, and the `-` that removes them) are
the whole story of `Readonly`, `Partial`, `Required` and `Mutable`. A
*conditional type with `infer`* pattern-matches a type and pulls a piece out,
which is the whole story of `Parameters`, `ReturnType`, `InstanceType` and
`Awaited`. And *composition* - one utility written in terms of two others - is
how everything else gets made, `Omit` and this set's `PartialBy` included.

Two habits separate a memorised answer from a working one. First, know which
ingredient you are reaching for before you type: "same keys, different
decoration" is a mapped type; "a piece of a bigger type" is `infer`; "both" is
composition. Second, test your type on the degenerate inputs the gate uses -
the type with nothing optional, the zero-argument function, the non-promise -
because that is where a wrong branch or a missing `-` hides.

The `any[]` in the two function-reading exercises deserves a note: the real
`Parameters` and `InstanceType` constrain with `(...args: any) => any` too,
because a constraint of `unknown[]` would reject perfectly good functions whose
parameters are narrower. It is one of the few places `any` is the honest tool -
it appears in a constraint, where nothing unsound can flow out of it.

## ex1 - MyReadonly

What this was testing: the mapped-type loop plus one modifier. `{ readonly [K in
keyof T]: T[K] }` is five tokens longer than a clone and completely different in
meaning.

The classic mistake is thinking `readonly` has to be *removed* from somewhere or
listed per key - or reaching for `Object.freeze`, which is a runtime tool and no
help to a type alias.

The model answer writes the modifier in front of the bracket, and the gate's
assignment probe (`locked.tier = 3`) is what proves it took: a clone compiles
that line, and the unused `@ts-expect-error` fails the test.

## ex2 - MyRequired

What this was testing: modifiers can be removed, not just added. `-?` strips the
optional marker, and with it the `undefined` that `?` had mixed into every read.

The classic mistake is mapping without the minus - `{ [K in keyof T]: T[K] }` -
which looks like it should "normalise" the type but is homomorphic: it
faithfully *preserves* the `?` you were trying to delete.

The model answer is `{ [K in keyof T]-?: T[K] }`, and the second assertion (a
type with nothing optional passes through unchanged) is free: removing a marker
that is not there does nothing.

## ex3 - MyRecord

What this was testing: the key set of a mapped type does not have to be
`keyof` anything - any union of keys works, and that is the difference between
a `Record` and an index signature.

The classic mistake is the stub itself: `{ [key: string]: V }` accepts every
string key and demands none, so `{ up: 1 }` satisfies it even when `down` was
promised. An index signature is a claim about *whatever keys exist*; a `Record`
is a claim that *specific keys exist*.

The model answer maps over the parameter directly - `{ [P in K]: V }` - and
constrains `K extends PropertyKey`, exactly as the built-in does.

## ex4 - MyParameters

What this was testing: `infer` in the argument position of a function pattern.
`F extends (...args: infer P) => unknown ? P : never` binds the entire
parameter list, as a tuple, labels and all.

The classic mistake is inferring one parameter (`(first: infer A, ...rest:
any[])`) or declaring the result `unknown[]` like the stub - both throw away
arity, so `[]` and `[slug: string, attempts: number]` come out looking the same.

The model answer lets rest-parameter syntax do the collecting: `...args: infer
P` makes `P` the tuple, and the conditional's false branch is `never` because a
non-function has no parameters to speak of.

## ex5 - MyInstanceType

What this was testing: construct signatures are function types with `new` in
front, and `infer` works on them the same way - in the *return* position this
time.

The classic mistake is pattern-matching without the `new` (which fails to match
`typeof Beacon` at all) or confusing the class `Beacon`-the-type (an instance)
with `typeof Beacon` (the constructor). The gate's `() => Beacon` probe exists
for exactly that confusion: right return type, wrong kind of signature.

The model answer is `C extends new (...args: any[]) => infer R ? R : never`,
and hovering the built-in `InstanceType` shows the same shape.

## ex6 - MyAwaited

What this was testing: a recursive conditional type. One `extends
Promise<infer V>` unwraps one layer; writing `MyAwaited<V>` in the true branch
unwraps them all, and the false branch is what lets non-promises through
untouched.

The classic mistake is stopping at one layer - `T extends Promise<infer V> ? V
: T` - which leaves `Promise<Promise<string>>` half-opened as
`Promise<string>`. The gate's nested case exists to catch it.

The model answer recurses, and the union assertion comes along for free:
`MyAwaited<Promise<number> | string>` distributes because the checked type is a
naked parameter, unwrapping each member separately.

## ex7 - PartialBy

What this was testing: composition. Split `T` into the keys you were told to
loosen and the keys you were not, apply `Partial` to one half, and glue the
halves back together with an intersection.

The classic mistake is `Partial<T>` (which loosens everything, so the gate's
"user is still required" probe fails) or trying to write one mapped type with
two different modifiers, which the syntax simply does not allow - the two-halves
intersection is not a workaround, it is the idiom.

The model answer is `Omit<T, K> & Partial<Pick<T, K>>`, and the gate grades it
by behaviour - what may be omitted, what must stay, what may not be added -
precisely so that any equivalent composition passes too.

## ex8 - Merge

What this was testing: a mapped type over a key set built from *two* types, with
a conditional choosing each value. `keyof A | keyof B` is the union of keys;
`K extends keyof B ? B[K] : ...` is the override rule, written so B is checked
first.

The classic mistake is the stub: `A & B` looks like a merge and is a
*constraint* - both sides must hold at once, so `retries: number` meets
`retries: string` and produces `never`, a member no value can satisfy. The
spread operator at runtime overrides; the intersection type does not.

The model answer checks `keyof B` before `keyof A` so the second shape wins,
and the final `never` arm is unreachable but required to finish the
conditional.

## Further reading

- [Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html) - every built-in this set rebuilds, with its real definition one hover away.
- [Handbook: Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html) - the loop, the modifiers, and the `-` that removes them (ex1-ex3).
- [Handbook: Conditional Types - inferring](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html#inferring-within-conditional-types) - `infer` in parameter, return and construct positions (ex4-ex6).
- [Handbook: Intersection Types](https://www.typescriptlang.org/docs/handbook/2/objects.html#intersection-types) - what `&` really means, and why it is the ex7 idiom and the ex8 trap at once.
