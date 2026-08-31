## Hint 1

There is a `useCallback` here already, and it is doing nothing useful: read its
dependency array and then read what the callback changes. It is rebuilt by the
one event it exists to handle.

## Hint 2

The reason `zoom` is in the array is that the body reads it. Stop reading it —
the updater form of a setter is handed the current value — and the dependency
disappears along with the problem.
