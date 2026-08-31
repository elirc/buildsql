# Reading — react/d23_component_patterns

## Notes

Every problem here is the same question asked about a different component: what
does the caller have to know, and what can you decide for them? A `text` prop
decides that the content is a sentence; `children` decides nothing. A `selected`
prop on every tab makes the caller wire up something they should never have to
think about; a context inside the component does it invisibly. A render prop
gives the caller the markup and keeps the state — which only works if you hand
them the state at the moment you ask for the markup. And an extracted hook
splits the two halves cleanly: behaviour that any markup can use, markup that
any behaviour can drive. The accessibility work in this set is not a separate
subject, either. An id linking a label to a control, a trigger to its content,
a card to its title — those are exactly the pieces that a caller writing the
parts separately cannot supply, which is why the component that contains both
halves has to generate them with `useId` and pass them around itself.

## ex1

Tests the difference between a slot and children. The classic mistake is a
`text` prop, which looks fine for weeks and then somebody needs a link in the
message and there is nowhere to put it. The model answer renders `children` for
the body and keeps `title` as a named prop — the rule being that a slot is
right when there is exactly one thing in exactly one place, and children is
right when the answer is "whatever the caller needs".

## ex2

Tests extraction. The classic mistake is writing a hook that describes the
shape of the answer without holding any of it, so callers get a `toggle` that
does nothing — extracting behaviour means moving the `useState`, not
reproducing its signature. The model answer puts the state and the callbacks in
the hook and rebuilds the component on top of it, unchanged on screen, and adds
the `aria-expanded` a disclosure button owes its user.

## ex3

Tests compound components. The classic mistake is trying to pass the selected
tab to each part as a prop, which is exactly the prop-drilling the pattern
exists to avoid, and which the gate makes impossible by never passing one. The
model answer creates a context inside the module, provides it from `Tabs` and
reads it from `Tab` and `Panel`, keeping the context itself private so callers
only ever see the parts.

## ex4

Tests a compound component whose job is an id rather than state. The classic
mistake is leaving an `<article>` with no accessible name, which reads to a
screen reader as an unlabelled region among many. The name has to come from a
heading the caller writes inside, so an id travels down through a context and
the reference comes back up in `aria-labelledby` — and it comes from `useId`,
because two cards on one page with the same id both point at the first heading.

## ex5

Tests a render prop carrying the pieces the caller cannot know. The classic
mistakes are both about ids: a hard-coded one, which makes the second field on
the page steal the first one's label, and an `aria-describedby` handed over
even when there is no hint, which points at an element that does not exist. The
model answer generates the id with `useId`, derives the hint's id from it, and
passes `undefined` when there is nothing to describe — React then omits the
attribute entirely.

## ex6

Tests a decision that has to reach an unknown depth. The classic mistake is
passing `disabled` down by hand, which works for the buttons that exist today
and silently fails for the one somebody nests inside a group tomorrow. The model
answer publishes the flag on a context with a default of `false`, so a button
used outside a toolbar still works, and combines it with the button's own
`disabled` so that either reason is enough.

## ex7

Tests the division of labour a render prop makes possible. The classic mistake
is calling the render function without the information the caller needs — the
list knows which row is picked and hands over `false` anyway, so the caller can
never show it. The second, easy to miss, is accepting an `empty` slot and
rendering an empty `<ul>` instead: the caller has already written the words for
that state.

## ex8

Tests everything at once, which is what a real component library component
looks like. Three things have to travel between two components the caller wrote
separately: the open flag, the id linking trigger to content, and a ref to the
trigger. All three belong to the component containing both, published on a
context. And focus is two distinct moments — into the content when it opens,
back to the trigger when it closes, because the element that had focus is about
to be removed from the document and something has to catch it.

## Further reading

- [Passing props to a component](https://react.dev/learn/passing-props-to-a-component)
- [Passing data deeply with context](https://react.dev/learn/passing-data-deeply-with-context)
- [Reusing logic with custom hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- [`useId` reference](https://react.dev/reference/react/useId)
- [WAI-ARIA Authoring Practices: tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)
- [MDN: `aria-describedby`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-describedby)
