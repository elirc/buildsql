# Reading — react/d19_custom_hooks_1

## Notes

A custom hook is a function that follows the rules of hooks, and that is the
whole definition — which is why the two things people get wrong are the two
things the definition implies. It is a *function*, so its body runs on every
render of every component that calls it, and everything it builds is built
again: work that should be conditional needs `useMemo`, functions that consumers
will compare need `useCallback`, and the object wrapping them needs memoizing
too or all that care is thrown away at the last step. And it follows *the rules
of hooks*, which exist because React matches each hook call to a slot by call
order — so a hook in a loop or behind a condition is not a style violation, it
is a component whose state list stops lining up. Threaded through the set is the
same reflex the whole track keeps returning to: a value you can compute from
what you already have is not state. A dirty flag, an `atEnd`, an `isValid`, a
set of validation errors — every one of those is a question, and storing the
answer means owning the job of keeping it true.

## ex1

Tests returning stable functions. The classic mistake is defining the callbacks
in the hook body, which is correct in every way except identity: consumers who
put them in a dependency array re-run their effects on every render, and a
memoized child taking one as a prop is never actually skipped. The model answer
wraps both in `useCallback` and uses the updater form of `setIndex`, so neither
needs to read the current index and the dependency lists stay nearly empty.

## ex2

Tests derived state inside a hook. The classic mistake is a `dirty` boolean set
to `true` on change and cleared nowhere — so a field typed back to its original
value still claims to be edited, and so does one that has just been reset. The
model answer compares the current value with the initial one during render,
which is a question that cannot be forgotten the way a setter can.

## ex3

Tests what a hook actually is. The classic mistake is thinking of a hook as a
place where state lives and putting the value at module scope, which works
perfectly until a second component calls the hook and starts sharing a number
with the first. The model answer keeps the count in the `useState` the hook
already had — a recipe each caller follows separately, getting a slot of its own.

## ex4

Tests the rules of hooks with a loop rather than the usual `if`. The classic
mistake is one `useState` per row inside `.map`, which is fine right up until
the list gets shorter and React finds fewer hooks than it stored. The model
answer notices whose state it is: a row's mark belongs to a component that is
one row, called unconditionally, with a `key` so React keeps the state attached
to the right row when the list around it moves.

## ex5

Tests cleanup inside a hook. The classic mistake is starting an interval and
returning nothing, so pausing flips a flag the running interval has never heard
of and unmounting leaves it ticking for the life of the page. The model answer
clears the interval from the effect's cleanup — which covers pausing, resetting
and unmounting at once — and lists `remaining` in the dependencies so reaching
zero stops the timer rather than merely clamping the number.

## ex6

Tests that a hook body is part of a render. The classic mistake is doing the
work in the hook body, where it runs for every render of the calling component
whatever the render was for — a click on an unrelated button re-filters the
whole list. The model answer moves the pass into `useMemo` keyed on the list and
the query, which also keeps `matches` identity-stable between renders, worth as
much as the saved work.

## ex7

Tests identity at two levels. The classic mistake is memoizing the functions and
then returning them in a fresh object literal, which changes on every render
anyway and defeats every consumer that was relying on the care you took. The
model answer wraps the functions in `useCallback` with empty dependency arrays
— possible because they all use the updater form — and the result object in
`useMemo`; and it has each updater return the state unchanged when nothing
happened, so a no-op removal does not even cause a render.

## ex8

Tests derived state in its most valuable form. The classic mistake is keeping
`errors` in state: something has to recompute them after every change, that
something is a line in every action, and the one that gets forgotten leaves a
complaint on screen next to a field that is now correct. The model answer
computes the errors from the values with `useMemo`, so they cannot be stale, and
captures the original values in a ref so `reset` goes back to the form's real
starting point rather than to whatever object the caller passed this render.

## Further reading

- [Reusing logic with custom hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [Rules of hooks](https://react.dev/reference/rules/rules-of-hooks)
- [`useCallback` reference](https://react.dev/reference/react/useCallback)
- [`useMemo` reference](https://react.dev/reference/react/useMemo)
- [You might not need an effect](https://react.dev/learn/you-might-not-need-an-effect)
- [MDN: `setInterval()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/setInterval)
