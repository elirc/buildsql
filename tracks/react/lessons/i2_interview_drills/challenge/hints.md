## Hint 1
Do not start typing. Enumerate the state out loud first — there are exactly
three things: what is in the box, the suggestions currently on screen, and which
one is highlighted. Whether the list is open is *derived* from the second, not
stored. Getting that list right in the first two minutes is most of what an
interviewer is measuring.

## Hint 2
The fetching half is drill 1 again: an effect on `query`, a `setTimeout`, a
cleanup that clears the timer and flips a `current` flag before any state is
set. Reset the highlight to "none" whenever new suggestions arrive.

The keyboard half is an `onKeyDown` on the input, not on the list, with four
cases: ArrowDown and ArrowUp move the index (clamped, not wrapped, unless you
decide otherwise), Enter selects when something is highlighted, Escape closes.
Call `preventDefault()` on the arrows or the caret jumps to the end of the text.

## Hint 3
The accessibility wiring is what makes this a combobox rather than a text box
with a menu under it. **Focus never leaves the input.** Instead the input
carries `aria-activedescendant` holding the `id` of the highlighted option, so a
screen reader announces it while the user is still typing. The list is
`role="listbox"`, each item is `role="option"` with `aria-selected`, and
`aria-expanded` on the input says whether it is showing. Every option therefore
needs a stable id you can build from an index — and selecting has to do four
things at once, so put it in one function that both Enter and a click can call.
