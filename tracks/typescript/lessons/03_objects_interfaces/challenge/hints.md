## Hint 1

Three shapes and one transformation. Start by finishing the two unfinished
interfaces from the gate's data: a `Part` has a title and the lessons inside
it, and a `PartSummary` has a title and two counts.

An interface member may be typed with another interface. That is the whole
trick to nesting.

## Hint 2

`readonly Lesson[]` as a member type says "a list of lessons this code will not
modify". The summary is one output object per input part, in the same order,
which is `map`'s job description.

Watch the arrow-function-returning-an-object trap: `(part) => { title: ... }`
parses the braces as a function body, not an object. Wrap the object in
parentheses.

## Hint 3

`Part` gains `lessons: readonly Lesson[]`; `PartSummary` gains
`lessonCount: number` and `exerciseCount: number`. Then `parts.map(...)` with
`lessons.length` for the first count and a `reduce` over `exercises` for the
second.

Left to you: whether the empty part - a part with no lessons at all - needs a
special case. Write the `reduce` with an explicit initial value and see whether
it does.
