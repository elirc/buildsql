## Hint 1
`children` is a prop like any other - it just has a special place in JSX. The
component decides what goes around it and in what order; it never inspects what
is inside.

## Hint 2
Two things to get right: the wrapper element the gate looks for, and the fact
that the heading is a real `<h2>` rather than a large-looking piece of text.
Headings are how keyboard and screen-reader users move through a page.
