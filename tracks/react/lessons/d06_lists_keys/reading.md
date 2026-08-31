# Reading — react/d06_lists_keys

## Notes

Every problem here is one array becoming markup, and the whole set is organised
around the two mistakes that survive code review. The first is mutating what you
were handed: `sort` and `reverse` rearrange in place, and rendering is supposed
to be a pure function of props, so a component that reorders its own props has
changed the caller's world as a side effect of being drawn. The second is keying
by position. An index key is a promise that row three will always be the same
thing, which is true right up until somebody sorts, filters or inserts — and the
damage lands on state that React is not managing: the value of an uncontrolled
input, the ticked state of a checkbox, the scroll position of a row. Both bugs
render perfectly on the first paint. That is why they need drilling rather than
explaining.

## ex1

Tests the two habits that should be automatic before anything harder: choosing
the element that carries the meaning, and keying the output of a `map`. The
classic mistake is `<ul>` for a sequence of steps — visually identical, and a
lie to anyone listening to the page. The model answer uses `<ol>` and keys on the
step text, which is stable and unique in this data; if it were not, the data
would need ids.

## ex2

Tests whether you notice that `reverse()` is as destructive as `sort()`. The stub
renders the right rows in the right order and still fails, because the array the
caller still holds has been rearranged underneath it — the kind of bug that
surfaces three components away as a list that is mysteriously backwards. The
model answer copies with a spread before sorting, and sorts by the field rather
than relying on the input happening to be in ascending order.

## ex3

Tests filter-then-decide, in that order. The classic mistake is rendering the
`<ul>` unconditionally and putting the empty message inside it, which leaves a
screen reader announcing a list of zero items and a sentence that is not a list
item. The model answer filters first, returns the empty-state paragraph early
when nothing survives, and only then maps — so the list element exists precisely
when there is a list.

## ex4

Tests key-by-identity where the evidence is a user's typing. The note box is
uncontrolled, so what the user typed lives in the DOM node rather than in React
state; when the sort reorders the rows and the keys are indices, React keeps the
DOM nodes where they are and rewrites the labels around them, so the note stays
in row zero while the person it belongs to moves to row two. The classic mistake
is exactly the stub. The model answer keys on `person.id`, which lets React move
the node instead of reusing it.

## ex5

Tests what to do when one iteration owes the parent two elements. A `<dl>` wants
`<dt>` and `<dd>` as direct children, so the usual escape — wrapping the pair in
a `<div>` so there is something to key — produces invalid markup and destroys the
definition-list semantics. The classic mistake after that is the `<>` shorthand,
which cannot take a key. The model answer imports `Fragment` and keys the long
form.

## ex6

Tests list-to-sentence shaping and the off-by-one that comes with it. The classic
mistake is `join(", ")` for everything, which produces `Ada, Bo` where English
wants `Ada and Bo`, and an empty string where the design needs a fallback. The
model answer names the three cases explicitly — none, one, many — and builds the
many case from `slice(0, -1)` plus the last name, so the comma logic exists in
exactly one place.

## ex7

Tests two things an interviewer will watch for. The first is modelling "which row
is open" as a single `editingId` rather than a flag per row: with an id, closing
the previous editor is not a step you have to remember, it falls out of the
state shape. The second is immutable update — the stub finds the item and assigns
to `item.text`, which edits the caller's object and gives React nothing to
compare. The model answer maps to a new array with a new object for the changed
row only.

## ex8

Tests the same keying lesson as ex4 under a different disturbance: filtering, not
sorting, and DOM checkbox state rather than DOM input text. The classic mistake
is thinking a filter is safe because it only removes rows — but removal shifts
every index below it, so index keys reassign every row to the wrong item, and the
tick appears to jump. The model answer keys on the item id. Worth asking
afterwards: with the ticks held in React state instead, this bug would have been
impossible, at the cost of lifting that state somewhere it can be keyed by id.

## Further reading

- [Rendering lists](https://react.dev/learn/rendering-lists)
- [Keeping components pure](https://react.dev/learn/keeping-components-pure)
- [Updating arrays in state](https://react.dev/learn/updating-arrays-in-state)
- [Preserving and resetting state](https://react.dev/learn/preserving-and-resetting-state)
- [MDN: `Array.prototype.sort()` sorts in place](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)
- [MDN: the `<dl>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dl)
