## Hint 1

Three separate jobs. The wizard has to show one step at a time; the nav has to
know where it is and how many there are, without being told by the caller; and
the keyboard has to follow the step that appears.

## Hint 2

`Children.toArray(children)` lets the wizard split what it was given into the
steps and everything else — compare each child's `type` against the `Step`
function. Render `steps[index]` and the rest, and publish the index, the total
and the two moves on a context the nav reads.

## Hint 3

Focus is the part that is easy to leave out and impossible to use the wizard
without. When the step changes, the element that had focus is removed from the
document; an effect in `Step` that runs on mount and focuses its own heading
catches it — and a heading needs `tabIndex={-1}` before anything can focus it
at all.
