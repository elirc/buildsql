## Hint 1
The component compiles, renders the right rows, and React logs no warning —
the map does have a `key`. Run the gate and read what it says happened to the
text you typed. Then ask: after the newcomer is prepended, what does the key of
the *first* row say?

## Hint 2
A key is React's answer to "is this the same item I rendered last time?" With
`key={index}`, the row at position 0 is always key `0`, so when a new person
arrives at the front React concludes that row 0 is the *same row* with a
different name — and reuses its DOM node, uncontrolled input value and all.
Everything React re-renders (the label, the id) is updated; everything the DOM
owns (what the user typed, focus, scroll position) stays behind.

## Hint 3
The fix is one expression. Key by something that belongs to the item and does
not change when the list is reordered — these people already carry exactly such
a field. The remaining decision is what you would do in a list where items have
no id of their own; think about where that id should come from before you look
it up.
