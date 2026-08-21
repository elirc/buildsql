## Hint 1
`count` is a `const` belonging to the render that created this handler, and
nothing that happens inside the handler changes it. So all three calls are the
same instruction sent three times.

## Hint 2
Pass a function instead of a value. React applies the queued functions in order
against the accumulating result, so "add one" three times composes where "become
1" three times does not.

## Hint 3
The second assertion is the one to think about rather than fix. Three updates in
one handler produce **one** render, because React collects everything an event
produces and applies it in a single pass. Be ready to say when that was not true
— and what `flushSync` is for.
