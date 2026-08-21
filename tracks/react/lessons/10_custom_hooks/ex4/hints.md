## Hint 1
Run the gate and read the error React throws, including the table it prints
comparing the previous render's hooks with this one's. It happens on the
*second* render — the first is fine — which is the clue: something about this
component differs between renders in a way React cannot cope with.

## Hint 2
React has no idea what your state is called. It stores hook state in a list and
matches each call to a slot **by the order the calls happen**. Signed out, this
component calls one hook. Signed in, it calls two, because the early return no
longer skips the second one. The lists stop lining up and React refuses to
guess which state is which.

## Hint 3
So every hook has to run on every render, unconditionally: no hooks inside `if`,
inside loops, inside `&&`, or after an early return. The fix here is to move one
line, and it costs nothing — a `useState` that is rendered but unused is a
number sitting in memory. The decision left to you is whether the signed-out
branch should also *reset* that state, and if so, how you would do it without
putting a hook in a branch.
