# Reading — react/d10_effects_basics

## Notes

The set splits into two halves that people usually blur together. Five problems
are about the dependency array as a *claim*: this effect reads exactly these
values, and re-running it when none of them changed would be pointless work — so
the failures here are an effect that runs too often (no array, an object
rebuilt by the parent, a function defined in the parent render) or one that runs
when it should not (the very first render). The other three are about the prior
question nobody asks: whether the code belongs in an effect at all. A total you
can add up during render is not state; a purchase caused by a click is not
synchronisation; and two unrelated calls to an external system are two effects,
not one. Interviewers reach for these because a candidate who reasons from
"what is this synchronising with?" gets all eight right, and a candidate who
reasons from "when do I want this to run?" gets about half.

## ex1

Tests the simplest form of the claim: an effect with no array at all. The classic
mistake is thinking the array is a performance knob, so it gets omitted while
"getting it working" — and then a label change rejoins a chat room, which in a
real app means a duplicate presence event and a flood of join notifications. The
model answer lists the two values the effect reads, `roomId` and `join`, and
nothing that merely happens to be nearby.

## ex2

Tests whether you can distinguish "this value changed" from "this value
arrived". The classic mistake is a correct dependency array with no guard, which
saves a draft the user never edited every time the component mounts — the
autosave bug that fills a table with identical revisions. The model answer keeps
a `useRef` flag, because a ref is memory that survives a render without causing
one, and consuming it inside the effect leaves the array honest.

## ex3

Tests the "you might not need an effect" reflex, measured by counting renders.
The classic mistake is mirroring props into state and syncing them in an effect,
which costs a second render per change and, more importantly, commits a frame
where the visible total does not match the visible items. The model answer
computes the sum in a `const` during render, where it is always consistent with
the props by construction.

## ex4

Tests whether you know how React compares dependencies. The classic mistake is
depending on an object or array prop: `Object.is` says two structurally
identical objects are different, so an effect keyed on one runs after every
parent render — the usual cause of an infinite fetch loop when the effect also
sets state. The model answer destructures the two primitives it actually reads
and depends on those, which is both correct and a more honest description of the
effect.

## ex5

Tests whether you can tell a reaction from an event. The classic mistake is a
`submitted` boolean plus an effect keyed on it: it works once, then silently
does nothing forever, because setting state to the value it already holds is not
a change and does not re-render. Worse, the effect also re-runs when unrelated
props change, so the same flag can buy twice. The model answer puts the call in
the click handler, where the cause lives, and keeps only the count in state.

## ex6

Tests the hardest of the dependency rules: a function prop that is recreated by
the parent on every render. The classic mistakes are opposite errors — leaving
`load` in the array (an infinite refetch) or deleting it from the array (a stale
closure that calls the first render's function forever). The model answer stores
the newest function in a ref updated by its own effect and depends only on `id`,
which is the pattern `useEffectEvent` is being designed to replace.

## ex7

Tests resetting derived state when the thing it derives from changes. The classic
mistake is an effect keyed on the product object: it resets when a parent merely
rebuilt an equal object, throwing away the user's selection, and it resets one
render late, so the UI briefly shows a size the new product does not sell. The
model answer stores the choice together with the id it was made for and derives
the displayed size during render, which makes both bugs unrepresentable.

## ex8

Tests whether "one effect" is a unit of code or a unit of responsibility. The
classic mistake is one effect that pushes data and size together with every prop
in its array, so a theme change redraws a chart that has not changed — cheap in
a test, visible as a flicker on a real canvas. The model answer writes two
effects with two arrays, each naming exactly what its own call reads, and lets
the theme be ordinary markup.

## Further reading

- [Synchronizing with effects](https://react.dev/learn/synchronizing-with-effects)
- [You might not need an effect](https://react.dev/learn/you-might-not-need-an-effect)
- [Removing effect dependencies](https://react.dev/learn/removing-effect-dependencies)
- [`useEffect` reference](https://react.dev/reference/react/useEffect)
- [`useRef` reference](https://react.dev/reference/react/useRef)
- [MDN: `Object.is()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is)
