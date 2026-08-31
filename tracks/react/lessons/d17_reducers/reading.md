# Reading — react/d17_reducers

## Notes

A reducer is a pure function of `(state, action)`, and every property worth
drilling here follows from that one sentence. Because it is pure it cannot edit
what it was given, which is not a style rule: React decides whether to
re-render by comparing the old state with the new one by reference, so a
mutated object is a change React is structurally unable to see. Because it is a
plain function it can be called from a test with no component, wrapped by
another function, or reused in two places — exercise 7 exists to make that
concrete. Because it is the single place that turns an event into the next
state, it is also the natural home for the rules: capacity limits, legal
transitions, what counts as a change worth remembering. The other half of the
set is about what belongs *in* the state — never a value you can compute from
the rest of it — and about the two things `useReducer` gives you that `useState`
does not: a lazy initialiser argument, and a `dispatch` that React guarantees is
stable, which is what makes exercise 8's single subscription possible.

## ex1

Tests immutability in its plainest form, plus the "nothing happened" answer.
The classic mistake is treating the state argument as scratch space —
`state.step += 1; return state` looks harmless and produces a component that
never re-renders, because React compares by reference and gets the same object
back. The model answer clamps the step, returns a fresh object when it moved,
and returns the original when it did not, which is the signal React uses to
skip the render entirely.

## ex2

Tests immutability of a nested array and a rule that refuses. The classic
mistake is `push`, which edits the array the caller still holds and hands back
a new wrapper object around the same stale contents — the state looks new and
its insides are not. The model answer covers the three cases in order — already
chosen, at capacity, otherwise add — using `filter` and spread, and expresses a
refusal by returning the state rather than a copy of it.

## ex3

Tests what belongs in state. The classic mistake is keeping a `total` beside
the counts: it is a second copy of the same fact, every action has to remember
to update it, and the first one that forgets leaves the screen contradicting
itself for ever. The model answer stores only the counts and adds them up while
rendering, where the total cannot be stale by construction — the same reflex as
d10's "a value computable from props is not state".

## ex4

Tests lazy initialisation. The classic mistake is `useReducer(reducer,
parsePlan(plan))`, which reads as "start from the parsed plan" and means "parse
the plan on every render and discard every result but the first" — invisible
when parsing is cheap, and a real cost when the initial state comes from
`localStorage` or a large computation. The model answer uses the third
parameter, `useReducer(reducer, plan, parsePlan)`, which React calls once.

## ex5

Tests immutability one level deeper than exercise 2, and error handling. The
classic mistakes are editing a ticket object found inside the state — a new
array of the same mutated rows — and a `default: return state` that swallows a
misspelled action type so the button silently does nothing. The model answer
maps, copying only the row that changed so that unchanged rows keep their
identity, and throws from the default branch with the offending type in the
message.

## ex6

Tests a reducer as a state machine. The classic mistake is writing one case per
action that always does the action's thing, which makes every impossible
sequence possible: pausing a job that never started, finishing one that is
paused, progress accumulating after it is done. The model answer asks "is this
legal from where we are?" first in every case, and returns the state unchanged
when the answer is no — an illegal transition is not an error, it is nothing
happening.

## ex7

Tests that a reducer is just a function, by wrapping one. The classic mistakes
are recording history for actions that changed nothing (so the user presses
undo and watches nothing happen, twice), and keeping the redo stack after a new
action, which offers a future that is no longer reachable. The model answer
compares the inner reducer's answer with what it was given — the "nothing
happened" convention from exercises 1, 2 and 6, now being consumed rather than
produced — and empties `future` whenever a genuinely new present appears.

## ex8

Tests why `dispatch` being stable matters. The classic mistake is three
`useState` values and a handler registered once: it closes over the empty array
and the un-muted flag from the first render, so each alert rebuilds the list
from nothing and the mute is never noticed. Adding those values to the
dependency array fixes the staleness by reopening the connection on every
change, which is a different bug. The model answer moves all three into one
reducer, so the handler only has to say *what happened* and something holding
the current state decides what it means — and because `dispatch` never changes
identity, the effect can depend on it and still subscribe exactly once.

## Further reading

- [Extracting state logic into a reducer](https://react.dev/learn/extracting-state-logic-into-a-reducer)
- [`useReducer` reference](https://react.dev/reference/react/useReducer)
- [Updating objects in state](https://react.dev/learn/updating-objects-in-state)
- [Updating arrays in state](https://react.dev/learn/updating-arrays-in-state)
- [Choosing the state structure](https://react.dev/learn/choosing-the-state-structure)
- [MDN: `Array.prototype.map()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map)
