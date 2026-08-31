## Hint 1

Two rules decide the whole answer, and neither is about the order the lines
appear on the page:

1. `import` declarations are hoisted. Every one of a module's dependencies is
   fully evaluated before the first statement of that module's own body runs.
2. A module body runs **once** per module graph. The second import of the same
   file links to the finished module and evaluates nothing.

## Hint 2

Walk it depth first with a pencil. Start at `entry`, take its imports top to
bottom, and for each one recurse into *its* imports before running its body.
Mark every module you finish, and skip anything already marked.

The label that trips people is the one produced by `beta`: ask yourself whether
`alpha` is already a finished module by the time `beta`'s body runs, and what
that means for the value interpolated into the string.
