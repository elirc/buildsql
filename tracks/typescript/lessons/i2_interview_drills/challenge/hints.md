## Hint 1

This is the take-home version: a small state container with four members, and
every one of them is a typing decision as much as a coding one. Finish the
`Store<S>` interface first - `getState`, `setState`, `subscribe`, `select` - and
notice that `select` needs its own type parameter, like `Box.map` back in lesson
06.

Read the four behaviour rules in the README before you write any of it.

## Hint 2

`setState` accepting `S | ((current: S) => S)` is the React-style API, and it
brings one wrinkle: `typeof updater === "function"` cannot narrow a generic `S`
that might itself be a function type, so you will need a cast in that branch.

`subscribe` returns an unsubscribe closure. Notify by iterating a *copy* of the
listener set, so a listener that unsubscribes during a notification cannot
disturb the loop.

The no-op rule is what stops render storms: if the next state is the same value,
do not notify at all. `Object.is` is the comparison to reach for.

## Hint 3

Close over `let state` and a `Set` of listeners, then return an object literal
implementing the four members: `getState` returns `state`; `setState` computes
the next value, compares with `Object.is`, assigns and notifies; `subscribe`
adds and returns a deleter; `select` applies the selector to the current state.

Left to you: whether `setState` should merge a partial state instead of
replacing it. Redux replaces, React's `useState` replaces, `setState` in class
components merged - and an interviewer will absolutely ask which one you built.
