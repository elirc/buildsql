# Reading — react/11_performance_patterns

## Notes

**Rendering is not painting.** A React "render" is calling your component
function and producing element objects; the commit that follows touches only
the DOM nodes that actually differ. So a component re-rendering is usually
cheap — the expensive parts are whatever *you* do during render (sorting ten
thousand rows, formatting dates in a loop) and the sheer number of components
when a large subtree re-renders. Both of those are what the three tools in this
lesson target, and neither is "the DOM is slow".

**Why React re-renders children by default.** Comparing props costs time and
memory, and for the overwhelming majority of components the comparison is more
expensive than just rendering. React's designers chose the default that is right
most often and made the opt-in explicit. That is the honest answer to "why isn't
memo the default", and it is a good interview answer.

**Shallow equality, and the identity trap.** `memo`'s comparison is one level
deep, per prop, with `Object.is`. Primitives compare by value; objects, arrays
and functions compare by reference. Since JSX creates a new object literal every
time it is evaluated, `style={{}}`, `items={[]}`, `onClick={() => …}` and
`config={{ a: 1 }}` are all new on every render. A memoized child receiving any
of them never skips anything.

**Dependency arrays are the maintenance cost.** A wrong dependency array on
`useMemo` or `useCallback` does not degrade performance — it produces a stale
value or a stale closure, which is a correctness bug that reproduces
intermittently. That asymmetry is the real argument against memoizing "just in
case": the downside of not memoizing is some wasted work, and the downside of
memoizing wrong is a bug.

**Measure with the Profiler.** React DevTools' Profiler records a session,
shows which components rendered in each commit, how long they took, and — with
"record why each component rendered" enabled — which prop or state caused it.
Almost every real performance investigation ends somewhere surprising, which is
why guessing is a poor use of a day.

**The React Compiler.** React now ships a compiler that automatically inserts
the equivalent of `memo`, `useMemo` and `useCallback` where it can prove they
are safe. It is a strong statement about how much of this is mechanical. It also
raises the value of understanding the model rather than the API: the compiler
can only work on components that obey the rules of hooks and do not mutate their
props or state.

## ex1 — what `memo` actually compares

The mechanics are simple; the useful part is the boundary. `memo` compares
props, and props only. It does **not** stop a re-render caused by the
component's own state changing, and it does **not** stop one caused by a context
the component reads. A memoized component that consumes `ThemeContext`
re-renders whenever that context value changes, no matter what its props say —
which is the interaction that surprises people, and the reason lesson 09 was
fussy about stable context values.

`memo` also accepts a second argument, a custom comparison function. It is
almost always a mistake: it is easy to write one that ignores a prop that
matters, producing a component that silently shows stale data. If shallow
equality is not enough, the props are usually the wrong shape.

The named inner function (`memo(function Row() {…})`) is worth the habit. An
anonymous one shows up as `Memo` or `Anonymous` in stack traces and the
DevTools component tree, which makes exactly the kind of investigation this
lesson is about harder.

## ex2 — the reason most memoization does nothing

This exercise is the canonical failure, and it is worth being able to describe
precisely: `Child` is memoized, its `onSelect` prop is a function declared in
the parent's render body, that function is a new object on every render, the
shallow comparison fails, the child renders. The `memo` did not fail — it did
its job and correctly reported that a prop changed. The prop really did change;
it just changed for no meaningful reason.

`useCallback(fn, [])` fixes it because it returns the *same function object*
until a dependency changes. And the empty dependency array is correct here only
because the body reads nothing from the render — `setPicked` is a state setter,
which React guarantees is stable for the life of the component. Had the handler
read `clicks`, the array would need `[clicks]`, the identity would change on
every bump, and the memoization would be back to doing nothing — at which point
the right move is to restructure (updater form, a ref, or a reducer) rather than
to memoize harder.

The rule that follows: **`useCallback` is pointless unless the consumer cares
about identity.** A handler passed to a plain `<button onClick>` gains nothing
from it — DOM elements do not compare props. The three cases where it earns its
place are a memoized child, an effect's dependency array, and a custom hook's
return value.

## ex3 — remembering a value, and the second job

`useMemo` is the straightforward one: expensive derivation in, cached value
out, recomputed when the inputs change. The judgement call is what counts as
expensive. Summing three numbers does not; `useMemo` around it costs more than
it saves, in comparison time and in reading time. Sorting or grouping thousands
of rows does. Somewhere in between is a Profiler measurement.

The trap the hints point at is worth internalising because it applies to every
dependency array in React. `rows` is an array, compared by identity. A parent
writing `<Report rows={[1, 2, 3]} compute={compute} />` creates a new array
literal on every render, so the dependency changes every render and the memo
never hits. The fix has to happen in the *parent* — hoist the array out, or
memoize it there — which means a memoized component's performance depends on
callers it cannot control. Being able to say that out loud is a senior-level
observation.

`useMemo`'s second job is the one people underuse: keeping an object or array
stable *so that something else can compare it*. The context value in lesson 09's
challenge, an options object passed to a memoized child, a dependency of an
effect — in all of those, `useMemo` is doing correctness work, not speed work,
and the array being returned might be trivially cheap to build.

## ex4 — the fix that costs nothing

This is the most important exercise in the lesson. The state lived too high, so
every keystroke re-rendered a component that had no interest in it. Moving the
state into the smallest component that needs it means `Dashboard` holds no
state at all and therefore never re-renders — and no comparison, no wrapper and
no dependency array had to be introduced to achieve it.

The general family of structural fixes, all free:

- **Move state down** — this exercise. State belongs in the lowest component
  that can hold it.
- **Lift content up as `children`.** If an expensive subtree must live inside a
  component that re-renders often, pass it in as `children` from a parent that
  does not. React re-renders the wrapper, but `children` is the same element
  object it was handed, so the subtree is untouched. This one feels like magic
  the first time and follows directly from elements being values.
- **Split the component.** Two responsibilities, two components, two independent
  re-render lives.

Memoization would also have passed the gate, and comparing the two is the
lesson. `memo(ExpensiveList)` adds a comparison to every render, a promise that
`onExpensiveRender` stays stable, and a thing that breaks silently the day
somebody passes an inline arrow. Moving the state adds nothing and cannot rot.

## challenge — putting it together, and what still is not memoized

The correct answer uses `memo` on the row and `useMemo` on the derived list, and
deliberately does **not** use `useCallback`: `onRowRender` arrives as a prop
from outside and is already stable, so wrapping it would be ceremony. Noticing
which tool is unnecessary is as much the exercise as applying the other two.

Two details make the memoization actually work. The `product` objects passed to
each row come straight out of the `products` prop, so their identity is stable
across the parent's re-renders — build a new object per row inside the map
(`product={{ ...product, index }}`) and every row re-renders forever. And the
keys are ids, so React matches rows to the same component instances when the
filtered list changes shape; index keys would remount rows as the list shrinks,
which is both slower and — as lesson 04 showed — wrong.

The honest scaling note: memoized rows are a good answer for hundreds of rows
and the wrong answer for tens of thousands. At that size, the fix is to stop
rendering rows nobody can see — virtualisation, where only the visible window is
in the DOM. Knowing the point at which memoization stops being the answer is
worth as much as knowing how to apply it.

## Further reading

- [react.dev — `memo`](https://react.dev/reference/react/memo) — including "should you add memo everywhere?" and the custom comparison caveat.
- [react.dev — `useMemo`](https://react.dev/reference/react/useMemo) and [`useCallback`](https://react.dev/reference/react/useCallback) — both reference pages have excellent "how to tell if this is worth it" sections.
- [react.dev — Render and Commit](https://react.dev/learn/render-and-commit) — what a render actually is, which is where most performance confusion starts.
- [react.dev — Keeping Components Pure](https://react.dev/learn/keeping-components-pure) — the property every one of these optimisations depends on.
- [react.dev — React Compiler](https://react.dev/learn/react-compiler) — the automatic version of this lesson, and what it requires of your code.
- [MDN — `Object.is`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is) — the comparison behind shallow equality.
