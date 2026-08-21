## Hint 1

Two collections that differ by one word: a `Queue` gives back what went in
first, a `Stack` gives back what went in last. Each exercise here is the
smallest problem that genuinely needs one of them.

`IsBalanced` needs a stack because the answer to "what should close next?" is
always "whatever opened most recently".

## Hint 2

`Queue<T>` has `Enqueue`, `Dequeue`, `Peek`, `Count` and — the one you want —
`TryDequeue(out T item)`, which returns false rather than throwing on an empty
queue. Loop up to `count` times and stop early when it comes back false.

`Stack<T>` has `Push`, `Pop`, `Peek`, `Count`, and `TryPop(out T item)`.

For the brackets: push every opener; on a closer, pop and check the popped
character is the matching opener. At the end, the stack must be empty.

## Hint 3

The three ways `IsBalanced` can be false are worth listing before you write it,
because each one is a different line of code:

1. a closer arrives when the stack is empty — `"())"`;
2. a closer arrives that does not match the top — `"(]"`;
3. the text ends with something still open — `"(()"`.

Mapping a closer to its opener is a small `switch` expression, and
`c is '(' or '[' or '{'` is the tidy way to ask "is this an opener" (a *logical
or* pattern, from lesson 02's family).

Left to you: whether to push the *expected closer* instead of the opener. That
version compares the popped character directly against `c` and needs no mapping
on the way out. Both are correct; one is a nice thing to notice.
