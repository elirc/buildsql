## Hint 1

Run the gate and read React's error before you change anything. React stores
hook state in a list per component and matches each call to a slot by call
order — so a component that calls `useState` three times on one render and
twice on the next has nothing to match the third slot against.

## Hint 2

The rule is "only call hooks at the top level", and a `.map` callback is not
the top level. The fix is not to move the loop; it is to notice whose state
this is. Each row's mark belongs to that row.

## Hint 3

Give the row a component of its own, with its own `useState` called
unconditionally. Then keep the `key` on it, so React knows which row is which
when the list changes and the state stays where it belongs.
