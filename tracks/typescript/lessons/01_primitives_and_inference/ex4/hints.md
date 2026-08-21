## Hint 1

Say the return type out loud before you write it: "an array, of pairs, where
each pair is a name then a score". Type syntax composes in exactly that order,
innermost first, and the outer `[]` goes last.

The runtime question is what happens when the two inputs are different
lengths. The README states the rule; it is not "throw" and it is not "pad".

## Hint 2

The type is `[string, number][]` - a tuple type with an array suffix.
Parentheses are allowed if they help you read it, `([string, number])[]`, and
mean the same thing.

For the body, decide how many pairs there are *before* you start pushing, then
loop that many times. `Math.min` on the two lengths is the short way to say it.

## Hint 3

Annotate the return type as `[string, number][]`, declare the accumulator with
that same type so `push` knows what it is being handed, walk the indices up to
the shorter length, and push `[names[i], scores[i]]` each time.

Left to you: whether the accumulator is a `const` array you push into or a
`map` over a range. If you try `map`, watch what TypeScript infers for
`[a, b]` inside it - that inference is the subject of the reading.
