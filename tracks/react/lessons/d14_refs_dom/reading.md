# Reading — react/d14_refs_dom

## Notes

A ref pointed at a DOM node is React's admission that some things cannot be
described declaratively. You cannot render "this input is focused" or "this
field is empty again" — you have to reach for the node and say so. Three rules
tie the whole set together. First, the node does not exist while the component
is rendering, so every one of these operations lives in an effect or an event
handler and every one of them starts `node?.` because the node can be gone.
Second, the node is only yours to touch where React has no opinion: reading an
uncontrolled input's value is fine, writing to a controlled one is a bug.
Third — and this is what the set actually drills — almost every legitimate use
is about focus, and focus is a property of the whole document. State can say
which entry is "active", but until something calls `.focus()` the browser and
the screen reader do not know, and the keyboard user is somewhere else entirely.

## ex1

Tests the dependency array of an imperative effect. The classic mistakes sit on
either side of the right answer: `[]` focuses the first recipient and never
again, no array at all yanks the cursor back on every render — including the
render caused by the user typing somewhere else. The model answer keys the
effect on the value that defines "this is a different reply", which is the same
question a dependency array always asks.

## ex2

Tests reading and writing a value React does not manage. The classic mistake is
the stub's: `defaultValue` looks like a binding but is a one-time handover, so
the state and the field drift apart immediately and every read returns the
initial value. The model answer deletes the state entirely and treats the node
as the source of truth — `.value` to read on Apply, `.value = ""` plus
`.focus()` to clear — which is exactly the deal an uncontrolled input offers.

## ex3

Tests ref forwarding in its React 19 form. The classic mistake is a wrapper
that quietly keeps the ref for itself, leaving the parent holding `null` and no
error message anywhere; in older code the same bug appears as forgetting
`forwardRef`. The model answer puts the ref prop straight onto the node the
parent means, and drops the internal ref that had no work to do.

## ex4

Tests focus as part of validation. The classic mistake is a loop with no early
exit: it reports every problem in turn, so the message ends up naming the last
one and the cursor ends up at the bottom of the form, below the field the user
actually has to fix. The model answer collects the fields in the order they
appear, uses `find` to stop at the first gap, and both names and focuses that
one.

## ex5

Tests the difference between a highlight and a focus. The classic mistake is
tracking an "active index" in state, styling that entry, and never calling
`.focus()` — the menu looks right, and a screen reader announces nothing while
Enter presses whatever was focused before. The model answer stores the nodes in
a ref-held array via a callback ref, keeps a roving `tabIndex`, and runs an
effect keyed on the active index so the browser's focus follows the state.

## ex6

Tests the form element as a node with its own API. The classic mistake is
treating a form as a bag of inputs and wiring up a ref per field, which is
three times the code and still cannot clear them all at once; the second
mistake is a `<button>` with no `type` next to a submit handler, which submits
the form because that is the HTML default. The model answer keeps one ref on
the `<form>`, reads it with `FormData`, empties it with `.reset()`, and marks
the button that is not a submit.

## ex7

Tests focus management around a modal. The classic mistakes are leaving focus
on the page behind when the dialog opens, letting Tab walk out of the dialog
into content that is visually covered, and destroying the focused node on close
so focus lands on `document.body`. The model answer focuses the first control
in an effect keyed on open, catches Tab at exactly the two ends by comparing
`document.activeElement` against the first and last refs, and sends focus back
to the opener from the close handler while that button is still mounted.

## ex8

Tests the hardest thing on this list: focus across a list mutation. The classic
mistake is removing the row and stopping there, because on screen it looks
perfect — the failure is invisible unless you are using a keyboard, when the
cursor silently returns to the top of the document. The model answer splits the
work in two, because the two halves happen at different times: the handler
decides who inherits the focus while the old list still exists, stores that in
a ref, and an effect keyed on the list does the focusing once the replacement
node has been committed.

## Further reading

- [Manipulating the DOM with refs](https://react.dev/learn/manipulating-the-dom-with-refs)
- [`useRef` reference](https://react.dev/reference/react/useRef)
- [`ref` as a prop, and callback refs](https://react.dev/reference/react-dom/components/common#ref-callback)
- [MDN: `HTMLElement.focus()`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus)
- [MDN: `FormData`](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
- [WAI-ARIA Authoring Practices: keyboard interface and roving tabindex](https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/)
