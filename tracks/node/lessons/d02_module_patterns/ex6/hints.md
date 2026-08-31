## Hint 1

Four pieces of state in the closure: the registered plugins, the commands they
add, the teardowns they return, and one boolean for whether the host is
running. Every method is then a guard plus two lines.

For `use` to be chainable it has to return the host object — which means
building the object into a named `const` first, so the method has something to
return.

## Hint 2

`start()` is where the `api` object comes from: build it once, pass the same one
to every `setup`, and collect the return values. `setup` may return nothing, so
check the return is a function before pushing it.

Reverse teardown is a backwards `for` loop, or `[...teardowns].reverse()` —
mutating the array you are iterating is a way to get this subtly wrong.

## Hint 3

Decide what `stop()` leaves behind. The gate calls `run` afterwards and expects
`not started`, which the running flag alone already gives you — but think about
whether the commands from the previous run should still be sitting in the map
if someone calls `start()` again on a host they have restarted.

There is no single right answer to that; there is a right answer to "does your
code say which one you chose".
