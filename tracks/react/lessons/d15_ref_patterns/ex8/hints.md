## Hint 1

`useImperativeHandle` takes a dependency array for the same reason `useEffect`
does, and the stub's is empty. The object the parent is holding was built
during the first render and its `read` still closes over the text as it was
then.

## Hint 2

Two independent fixes are needed. `insert` should not read the old text to
compute the new one — the functional updater form removes that question
entirely. `read` genuinely needs the current text, so the array has to say so.

## Hint 3

There is a second way to write `read` that keeps the array empty: mirror the
text into a ref updated on every render and read `ref.current`. Decide which
you prefer and be able to say why — for three methods, the array is plainer.
