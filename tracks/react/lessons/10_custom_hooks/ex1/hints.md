## Hint 1
A custom hook is an ordinary function whose name starts with `use` and which is
allowed to call other hooks. There is no registration, no API — the convention
*is* the mechanism, because it is what the linter uses to check the rules.

The state is already there. What is missing is a `toggle` that actually flips
it, and one property of that function the gate checks explicitly.

## Hint 2
Flipping is the updater form from lesson 03:

```tsx
setOn((previous) => !previous);
```

The extra requirement is that `toggle` be the **same function object** across
renders. `() => setOn(x => !x)` written inline creates a new one every time, so
any consumer that puts it in a dependency array re-runs their effect on every
render of yours.

## Hint 3
`useCallback(fn, deps)` returns the same function until one of its dependencies
changes. Since the flip is written with the updater form it reads nothing from
the render, which tells you what the dependency array should contain. The
`setOn` setter is already stable — React guarantees it — so it can be returned
as the third slot untouched.
