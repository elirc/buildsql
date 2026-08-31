# Reading - typescript/d07_discriminated_unions

The debrief. Per problem: what the variant design was really testing, the
mistake that keeps the type gate red, and one sentence on the model answer.

## Notes

**The skill this set drills is making the tag a literal.** Every stub here
declares the discriminant as `string` or `number`, and every one of them
compiles perfectly - and narrows nothing, because comparing a `string` against
`"insert"` tells the compiler exactly as much as comparing two `string`s
always does. Pinning `kind: "insert"` turns that property into a set with one
element, and turns the comparison into proof. That single change is what makes
the other seven-eighths of each exercise write itself.

**The recipe has three parts and all three are load-bearing.** Every member is
an object type; every member has the same property name; each member pins that
property to a *distinct* literal. Break the third and two variants become
indistinguishable; break the second and there is nothing to switch on; break the
first and there is nowhere to put the tag.

**The alternative - one interface with optional members - is the thing this
pattern exists to replace.** `{ kind: string; cents?: number; slot?: string }`
permits a refund with a slot, an insert with neither, and a select with cents,
and forces every consumer to defend against combinations that cannot happen.
A discriminated union makes those states unsayable. *Make illegal states
unrepresentable* is the sentence; this is the mechanism.

**`switch` on the tag beats a chain of `if`s once there are more than two
variants**, mostly because a `default` branch narrowed to `never` gives you a
compile-time to-do list the day someone adds a variant. That is lesson 04's
`assertNever`, and it is worth adding to ex3, ex5 and ex8 even though the gate
does not ask for it.

**And the shape recurs everywhere.** A reducer's actions (ex2), a request's
lifecycle (ex3), a wire protocol's versions (ex4), a lexer's tokens (ex6), a
state machine (ex7) and an abstract syntax tree (ex8) are the same pattern six
times. Recognising it in a problem statement is most of the value.

## ex1 - describe a command

What this was testing: the minimal case, and the fact that a variant is allowed
to carry nothing but its tag. `{ kind: "refund" }` is a complete member, and the
temptation to give it a `cents: 0` "for symmetry" is exactly the optional-member
disease coming back.

The classic mistake, once the literals are in place, is reaching for
`cmd.cents ?? 0` instead of narrowing - which compiles only because the property
does not exist on every member, so it does not compile at all, which is the
point.

The model answer switches on `kind` and returns from each branch, so each
`return` sees a fully narrowed variant and no property access needs defending.

## ex2 - a reducer

What this was testing: the Redux shape - one state type, a union of actions, a
pure function between them - plus immutability. The action union is what makes
`action.price` legal in one branch and a compile error in another.

The classic mistake is `state.dispensed.push(action.slot)`, which mutates the
previous state and passes an equality check on the new one; the gate keeps a
reference to the earlier state and asserts its array is still empty.

The model answer spreads the old state in every branch and overrides only what
changed - and computes the new credit into a local first, so the message and the
field cannot drift apart.

## ex3 - render a load

What this was testing: four variants where two carry different data and one
carries none, plus a boolean *inside* a variant that is not itself the
discriminant. `retriable` changes the wording; `status` chooses the shape.

The classic mistake is treating `failed` and `done` as one branch with an
optional `error`, which is the optional-member design in disguise and makes
`body` and `error` both possibly-undefined for every consumer.

The model answer is a `switch` with four returns, and a nested ternary only for
the retry wording - because that decision is inside a single variant and does
not deserve a branch of its own.

## ex4 - a numeric discriminant

What this was testing: that the discriminant does not have to be a string.
Number literals work identically, which matters because wire protocols version
themselves with integers far more often than with names.

The classic mistake is `frame.version >= 2`, which is a comparison rather than
an equality against a literal and therefore does not narrow. Use `=== 1` or
`=== 2`; a range check tells the compiler nothing.

The model answer takes the v1 branch first and lets the rest of the body assume
v2, which is also why `codec` can be read without a second guard.

## ex5 - route a list of events

What this was testing: narrowing *inside* a `map` callback, and a literal union
(`0 | 1 | 2`) used as an index. The button type is what makes the lookup table
total - a `number` index would force a fallback for buttons that cannot exist.

The classic mistake is `Math.abs(event.dy)` folded into the same template as the
direction, which loses the `dy === 0` case; zero is neither up nor down and needs
its own answer.

The model answer indexes a three-element `as const` tuple with the button and
handles scroll in two steps - the zero test first, then the sign - so no branch
has to think about two questions at once.

## ex6 - build the union from text

What this was testing: constructing a discriminated union rather than consuming
one, and the fact that the tag is what lets `value` be a `number` in one variant
and a `string` in another. That is the payoff: no consumer ever has to ask
`typeof token.value`.

The classic mistake is splitting on `" "` instead of on a whitespace *run*,
which produces empty fields for `"a  b"` and then an empty `symbol` token. The
second-classic is testing "all letters" before "is a number", which is harmless
here and stops being harmless the moment hex literals arrive.

The model answer splits on `/\s+/`, skips empty fields, and applies the three
rules in the prompt's order - each `push` writing a literal tag, which is what
lets TypeScript infer `Token` without a cast.

## ex7 - a state machine

What this was testing: two unions at once - a state union and an event union -
and the discipline of returning the *same* object for a move that does nothing.
Identity matters because a store, a React reducer or a memo will compare by
reference and re-render for a new object that means nothing new.

The classic mistake is `return { ...state }` in the default branch, which is a
new object with the same contents and fails the identity assertions the gate
makes three times.

The model answer switches on the state first and the event second, because the
legal moves are grouped by state - and every branch that does not recognise its
event simply returns `state`.

## ex8 - an expression tree

What this was testing: a discriminated union that contains itself, and two folds
over it that differ only in what each leaf produces. Once the union is right,
both functions are five-branch switches with recursive calls, and neither needs
a cast.

The classic mistake is `env[expr.name] ?? 0` for a missing variable, which
silently turns a bug into an arithmetic result - and, worse, does the same for a
variable legitimately bound to `0`. The gate has a case for exactly that pair.

The model answer looks the variable up once, compares against `undefined`, and
throws with the name in the message - and renders every operator with brackets,
because precedence-aware rendering is a different (and much longer) exercise
that nobody asked for.

## Further reading

- [Handbook: Discriminated unions](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions) - the pattern, the recipe, and why the literal type is the whole trick.
- [Handbook: Exhaustiveness checking](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking) - the `never` default branch worth adding to ex3, ex5 and ex8.
- [Handbook: Literal types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#literal-types) - why `kind: "insert"` is a different type from `kind: string`.
- [Redux: Actions](https://redux.js.org/style-guide/#model-actions-as-events-not-setters) - ex2 as an industry convention, including why actions are events rather than setters.
- [MDN: String.prototype.split](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/split) - splitting on a regular expression, which is what makes ex6 tolerate runs of whitespace.
