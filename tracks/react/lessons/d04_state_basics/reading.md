# Reading — react/d04_state_basics

## Notes

One question runs through all eight problems: what does React actually know?
It does not watch your variables, it does not look inside your objects, and it
does not re-read the arguments you gave a hook on the first render. It knows
that a setter was called, and it compares the value it was handed with the one
it is holding. Everything in this set falls out of that. A count in a plain
variable never reaches the screen; an array edited with `push` is the array
React already has; an initial value you computed yourself is computed again on
every render; and a summary kept in state is a second copy of a fact that is
already in the props. The last two problems are the ones interviewers keep
asking, because both are about *when* a value is read: the updater form reads at
apply time, and adjusting state during render reads at the moment a prop
changed.

## ex1

Tests the most basic claim in React: rendering is a function of state, and only
a state update schedules a render. The classic mistake is the stub's - a
module-level `let`, which happily counts to five while the screen still shows
zero, then jumps when some unrelated update forces a re-render. The model answer
holds the count in `useState` and computes `disabled` from it during render, so
the two can never disagree.

## ex2

Tests deriving several outputs from one boolean. The classic mistake is a second
piece of state for the button label, which then has to be flipped in every place
the first one is - two facts, one truth, and they drift the first time someone
adds a keyboard shortcut. The model answer keeps one `shown` boolean and reads
both the label and the conditional render off it.

## ex3

Tests the lazy initialiser. `useState(makeInitial())` calls the function on every
render and throws the result away every time after the first, which is invisible
until the function is expensive or has a side effect - reading `localStorage`,
parsing a large blob, generating an id. The model answer passes the function
itself, `useState(makeInitial)`, so React calls it exactly once on mount.

## ex4

Tests immutable updates for arrays. The classic mistake is `push` or `shift`
followed by a setter call with the same array: React compares the old and new
values, sees the same object, and skips the work - the screen freezes and the
bug looks like a broken button. The model answer builds a new array with a
spread or `slice` and reads the next name inside the updater callback, where the
length is the one the update is being applied to.

## ex5

Tests the difference between state and a derived value. The classic mistake is
`useState` plus a `useEffect` that recomputes the summary when props change:
correct-looking, one render too slow, and it puts a stale sentence in front of
the user every time. The `onRender` spy is how the gate sees it - one prop
change must cost one render. The model answer computes the string in a `const`
and deletes both hooks.

## ex6

Tests nested immutable updates, and it is rigged so that mutation is actually
visible. Editing `settings.channels.email` in place also edits the object the
component started from, because they are the same object - so `Revert` restores
the mutated values and the bug finally surfaces somewhere the user can see it.
The model answer copies every level it changes, using a computed key so one
function serves both channels.

## ex7

Tests the two things people get wrong about a delayed update. First, a callback
created in one render remembers that render's `count` forever, so three taps
inside one second all compute `0 + 1`; the updater form asks React for the
current value at apply time instead. Second, cancelling: a Reset that does not
clear the pending timers is undone a second later by an increment nobody can see
coming, which is why the timer ids live in a ref.

## ex8

Tests resetting state when a prop changes, which is the problem `useEffect` gets
misused for most often. An effect that syncs `initialTitle` into state renders
the wrong title first and the right one second, and re-runs whenever the
identity of its dependency changes. The classic mistake behind that is
forgetting that `useState` reads its argument only on the first render. The
model answer remembers which note is on screen and adjusts during render when it
differs - React discards that render and immediately re-runs the component, so
nothing stale is ever committed.

## Further reading

- [State: a component memory](https://react.dev/learn/state-a-components-memory)
- [Queueing a series of state updates](https://react.dev/learn/queueing-a-series-of-state-updates)
- [Updating objects in state](https://react.dev/learn/updating-objects-in-state)
- [Updating arrays in state](https://react.dev/learn/updating-arrays-in-state)
- [You might not need an effect](https://react.dev/learn/you-might-not-need-an-effect)
- [useState reference, including the lazy initialiser](https://react.dev/reference/react/useState)
- [MDN: setTimeout and clearTimeout](https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout)
