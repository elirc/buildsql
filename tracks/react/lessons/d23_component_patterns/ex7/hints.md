## Hint 1

The list tracks which row is picked and then tells the caller `false` every
time. A render prop is a question — "what should this row look like?" — and the
answer depends on information only the list has.

## Hint 2

The second gap is the `empty` slot, which is accepted and never rendered. An
empty list is a state that deserves words, and the caller has already supplied
them; an empty `<ul>` is not the same thing.
