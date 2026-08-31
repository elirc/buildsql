# Reading — react/d21_memoization

## Notes

`memo` compares each prop with `Object.is`. Everything in this set follows from
that one line. Strings and numbers behave the way people expect; objects,
arrays and functions do not, because two structurally identical values written
in two renders are two different values — so the memo comparison fails, the
child renders anyway, and you have paid for a comparison as well. That is why
six of these eight problems are the same bug wearing different clothes: an
object literal in the JSX, an arrow function in the JSX, an array from
`filter`, a callback whose dependency array names the state it is about to
replace, the `children` prop nobody thinks of as a prop, and a handler built
per row inside a `map`. The other two are about `useMemo` itself: its dependency
array is a **claim** about what the value is made of, and getting it wrong does
not make a component slow, it makes it wrong — which is the failure mode worth
fearing, because the other kind only costs milliseconds. Interviewers like this
material because "I added memo and nothing happened" is an experience every
candidate has had, and the ones who can say why have understood identity.

## ex1

Tests the shallow comparison against an object literal. The classic mistake is
writing `format={{ currency: "EUR", decimals: 0 }}` in the JSX, which builds a
new object on every render of the parent, so the memoized tile's comparison
fails every time and the memo is pure overhead. The model answer notices that
the object depends on nothing at all and hoists it to module scope — no hook
needed, and nothing left to keep in step.

## ex2

Tests the same comparison against a function. The classic mistake is an inline
arrow as a prop: it is the commonest single reason `memo` "does nothing", and
it is invisible in a diff because the code looks like every other handler. The
model answer wraps it in `useCallback` with an empty dependency array, which is
possible because the updater form of the setter means the function never has to
read the count it increments.

## ex3

Tests the dependency array as a correctness tool. The classic mistake is `[]` —
often left behind while "making it fast" — which computes the value once and
shows it for ever, so the component silently displays an answer to a question
nobody is asking any more. The model answer lists everything the factory reads,
which turns the memo back into an optimisation instead of a bug.

## ex4

Tests `useMemo`'s second job. Filtering four strings is free, so nothing here is
about saving time: `filter` returns a new array on every render, and a new array
is a changed prop however identical its contents. The model answer memoizes the
derived list keyed on the source and the query, which is the same technique as
exercise 1 applied to a value that genuinely does change sometimes.

## ex5

Tests a `useCallback` that undoes itself. The classic mistake is
`useCallback(() => setZoom(zoom + 1), [zoom])`: it is honest about what it
reads and therefore rebuilt every time the zoom moves, which is every time the
callback is used — so the memoized child re-renders on exactly the event the
memo was meant to survive. The model answer removes the read rather than the
dependency, by using the updater form.

## ex6

Tests the prop that is not written like one. The classic mistake is assuming
`memo` will protect a wrapper component: `children` is an ordinary prop, and
the JSX between the tags is an element object rebuilt on every render of the
parent, so the comparison always fails. The model answer memoizes the element
itself — and the wider lesson is that wrapping a component that takes children
in `memo` usually buys nothing on its own.

## ex7

Tests memoized rows in a list. The classic mistake is `onToggle={() =>
toggle(item.id)}` inside the `map`, which gives every row a fresh function on
every render of the list, so toggling one row redraws all of them — the exact
cost the memo was added to avoid, at scale. The model answer passes one
`useCallback` handler to every row and lets the row say which row it is when it
calls back.

## ex8

Tests the three tools together, and the order to reach for them in. One
`useMemo` does two jobs at once here — it skips the expensive `buildSeries` and
it keeps the array identity the memoized legend compares against — while a
`useCallback` covers the handler. The check that proves it is the last one:
after picking a label the panel re-renders, and the legend still must not,
because nothing it is given has changed.

## Further reading

- [`memo` reference](https://react.dev/reference/react/memo)
- [`useMemo` reference](https://react.dev/reference/react/useMemo)
- [`useCallback` reference](https://react.dev/reference/react/useCallback)
- [Passing JSX as children](https://react.dev/learn/passing-props-to-a-component#passing-jsx-as-children)
- [MDN: `Object.is()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is)
- [React Compiler](https://react.dev/learn/react-compiler)
