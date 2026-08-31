## Hint 1

The stub keeps its memory at module scope, which is one box for the whole file
rather than one box per gauge. Moving the `let` inside the component does not
help either — that one resets on every render. You want the third option.

## Hint 2

A ref is per instance and persistent, which is exactly the gap. Read
`ref.current` during render to get the old value, and write the new one in an
effect with **no** dependency array, so the write happens after the commit that
displayed the old one.
