# Reading — react/09_context_reducer

## Notes

**Context is a lookup, not a store.** `useContext(C)` walks up the fibre tree
from the calling component and returns the `value` of the nearest
`<C.Provider>` above it. It holds nothing itself; the state lives in whatever
component renders the provider, in ordinary `useState` or `useReducer`. That is
why "context re-rendered my whole app" is really "the component holding the
state re-rendered, and so did everything reading its context value".

**Every consumer re-renders when the value changes**, and `React.memo` does not
save them — memo compares props, and context is not a prop. Two consequences
follow. Keep context values stable: an inline `value={{ user, logout }}` is a
new object every render, so every consumer re-renders whenever the provider
does, even if `user` never changed. And split contexts by change frequency —
one for the rarely-changing data and one for the stable `dispatch` is the
standard trick, since a component that only dispatches then never re-renders at
all.

**Context is not a state manager.** It has no selectors, so consumers cannot
subscribe to part of a value; no devtools; no middleware; no caching. For
server data, a data library (TanStack Query, SWR) is the right answer, not
context. For large, frequently-changing client state read by many components,
a store with selector-based subscriptions (Zustand, Redux Toolkit, Jotai) exists
precisely because context re-renders everything. Context is excellent for
theme, locale, auth identity, feature flags and dispatch — things that are
tree-wide and calm.

**A reducer is the Gang-of-Four command pattern with a fresh coat of paint.**
State plus an action in, new state out, no side effects. That purity is what
makes it testable without React, replayable, loggable, and safe for React to
call twice during a development double-render. Every rule about immutability
from lesson 03 applies with full force: return new arrays and objects, never
edit the ones you were handed.

**`useReducer` versus `useState`.** Not a question of how many fields. Use a
reducer when the *transitions* have rules — when "add this item" means different
things depending on what is already there, when two fields must move together,
when the same change is triggered from several places. A single boolean with one
toggle is a `useState`; a wizard with steps, validation and a back button is a
reducer.

## ex1 — the mechanism, and the default that lies

The exercise is deliberately small so that the shape is visible: a context
created at module scope (once per module, not per render), a provider that sets
a value, and a consumer at arbitrary depth. The `Deep` wrapper in the gate is
there to make the point that the value did not travel by props — no component
between the provider and the button mentions the theme.

The detail that generates bugs is that `createContext(default)` is a *fallback
for having no provider*, not an initial value. It is used only when no matching
provider exists above the consumer. Beginners read it as "the starting value"
and then wonder why setting it has no effect.

Worth knowing for React 19: `<ThemeContext>` can now be used directly as the
provider, with `<ThemeContext.Provider>` kept for compatibility. And
`use(Context)` is a new way to read a context that, unlike `useContext`, may be
called conditionally. Both forms appear in modern code; neither changes the
model.

## ex2 — turning a wiring mistake into an error

This is a small change with a large payoff, and it is the pattern every good
codebase uses. The failure it prevents is specific: a component rendered outside
its provider — because someone moved it, or rendered it in a test, or added a
new route that forgot the wrapper — silently receives the default and displays
plausible-looking wrong data. Nobody notices for weeks.

Three things happen at once when you switch the default to `null` and throw in
a custom hook. The mistake becomes loud and names the missing provider. The
context object stops being exported, so consumers cannot bypass your hook. And
TypeScript narrows: after `if (value === null) throw`, the return type is
`string` rather than `string | null`, so no consumer has to handle a case that
cannot happen.

The `console.error` spy in the gate is worth understanding rather than copying.
React logs a render error to the console before rethrowing it, so a test that
deliberately renders a throwing component fills the output with a stack trace
that looks like a failure. Silencing it keeps the signal readable — and it is
the same reason production apps put an error boundary above anything that can
throw.

## ex3 — the reducer as a pure function

Testing this by calling it is the point. A reducer has no dependencies, no
timing, and no DOM, so its tests are as fast and as boring as tests get — and
they cover the part of your application where the actual rules live. If you take
one habit from this exercise, take that one: push rules into pure functions and
the hard-to-test surface shrinks to wiring.

The immutability assertion is the one people fail. `state.push(...)` returns a
length, `state.sort()` reorders in place, and `item.quantity += 1` edits an
object that some other render may still be holding. All three "work" in the
sense that the data is right; all three break React, because `Object.is(prev,
next)` is `true` and React concludes nothing happened. The symptom is a UI that
updates only when something *else* forces a render, which is maddening to debug
if you have not seen it before.

The `quantitySet` rule — zero means remove — is there because reducers are where
this kind of business rule belongs. Put it in the click handler and you have to
remember it in the keyboard handler, the "apply coupon" path, and the sync code.
Put it in the reducer and it is true by construction.

The `default` branch returning state unchanged is a convention worth keeping.
With a discriminated union and `switch` on `action.type`, TypeScript can prove
you handled every case — the TypeScript track's exhaustiveness checking with
`never` is the same idea from the other side.

## ex4 — describing events instead of computing state

The shift in how handlers read is the thing to notice. Before:
`setTasks([...tasks, { id: nextId, text: draft, done: false }]); setNextId(nextId + 1);`
— the handler knows the data shape, the id scheme and the ordering. After:
`dispatch({ type: "added", text: draft })` — the handler knows what the user
did. Every rule moved to one function, and adding a task from a second place
(a keyboard shortcut, a paste handler, an import) is now one line that cannot
get the rules wrong.

Notice what stayed in `useState`: the draft text in the input. It is transient,
belongs to one control, and has no rules — putting it through the reducer would
add an action type for every keystroke and gain nothing. Mixing the two hooks in
one component is normal and correct.

The derived summary is lesson 03's rule again: `tasks.filter(t => t.done).length`
computed during render cannot disagree with the list, whereas a stored
`doneCount` needs updating in the add path, the toggle path, and every future
path somebody adds.

One detail with real accessibility weight: the checkbox is joined to a `<label>`
carrying the task text, which is why `getByLabelText("Ship it")` finds it. A
checkbox with the text merely sitting next to it has no accessible name — a
screen reader announces "checkbox, unchecked" and nothing else — and it also
loses the click-the-label-to-toggle behaviour sighted users expect.

## challenge — the combination, and the bug that still passes

Putting `{ palette, dispatch }` in the context value is the design decision, and
it is the one every real implementation makes: consumers that read and consumers
that write both need something, and only the provider has both.

The bug hint 3 points at is the one to internalise. An object literal in the
`value` prop is a new reference on every render of the provider, so
`Object.is(prevValue, nextValue)` is always false and every consumer re-renders
whenever the provider does — including when the palette did not change at all,
because the provider's own parent re-rendered. `useMemo(() => ({ palette,
dispatch }), [palette])` fixes it. The gate cannot see the difference, which is
exactly why it is worth pointing out: this is a performance defect that testing
does not catch and code review has to.

The stronger version of the same fix is splitting the context in two — a value
context and a dispatch context. `dispatch` is stable forever, so a component
that only dispatches (the toggle) subscribes to a context that never changes and
therefore never re-renders from it. That two-context pattern is what React's own
documentation recommends for reducer-plus-context, and it is a good thing to be
able to describe in an interview.

## Further reading

- [react.dev — Passing Data Deeply with Context](https://react.dev/learn/passing-data-deeply-with-context) — including the "before you use context" checklist.
- [react.dev — Scaling Up with Reducer and Context](https://react.dev/learn/scaling-up-with-reducer-and-context) — the challenge, written out, with the two-context split.
- [react.dev — Extracting State Logic into a Reducer](https://react.dev/learn/extracting-state-logic-into-a-reducer) — when a reducer beats `useState`, and how to name actions.
- [react.dev — `useContext`](https://react.dev/reference/react/useContext) and [`useReducer`](https://react.dev/reference/react/useReducer) — the reference pages, including the stability guarantee on `dispatch`.
- [MDN — `Object.is`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is) — the comparison React uses for context values, state and dependency arrays.
