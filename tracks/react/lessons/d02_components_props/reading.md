# Reading — react/d02_components_props

## Notes

A props interface is an API, and these eight problems drill the parts of it that
callers actually get wrong. Half of them turn on the difference between three
absences: a prop that was never passed (`undefined`), one passed as an explicit
nothing (`null`), and one passed as an empty value (`""`, `0`, `false`). Default
parameters fire for exactly the first; `||` fires for all of them; `??` fires
for the first two. The other half are about who owns a value. A component that
copies a prop into state has forked the truth, and every bug after that is a
synchronisation bug. The pattern that unites the set: decide during render, from
props, and hand decisions the component cannot make back to the caller through
a callback.

## ex1

Tests the most basic form of an optional prop, and whether you put the fallback
in the parameter list rather than in the JSX. The classic mistake is
`{salutation ?? "Hello"}` scattered at each use site, which works until there
are three of them and one drifts. The model answer defaults in the destructuring
pattern, so the rest of the component can treat `salutation` as a plain string.

## ex2

Tests two ideas at once: that `alt` is not a nice-to-have but the image's
accessible name, and that one prop can feed several attributes. The classic
mistake is `alt=""`, which is a deliberate claim that the image is decorative
and removes it from the accessibility tree — the gate cannot even find it by
role afterwards. The model answer defaults `size` to 40 in the parameter list
and spends it twice.

## ex3

Tests conditional attributes. The classic mistake is applying `target="_blank"`
to every link because one of them needed it, which hijacks internal navigation;
the second is adding the new-tab warning as a `title` or an `aria-label`, both
of which replace or duplicate the name rather than extending it. The model
answer yields `undefined` for the attributes in the internal case — React omits
an attribute whose value is `undefined` — and adds real text inside the anchor
for the external one, because a warning that only screen readers get is a
warning sighted users deserve too.

## ex4

Tests whether you can write a component that owns nothing. The gate clicks
`Increase` twice without changing the `value` prop; a component holding its own
`useState` answers 6 and then 7, and that second 7 is the moment the component's
idea of the number and the parent's idea of it part company. The classic mistake
is `useState(value)`, which reads as harmless because it initialises correctly
and is wrong ever after. The model answer has no state at all: the display is
the prop, and the buttons only ask.

## ex5

Tests a variant map plus the honest empty case. Roles are not decoration:
`status` is a polite live region and `alert` interrupts, so choosing between
them is a product decision about how loudly a failure should shout. The classic
mistake is an if-chain that falls through to a default pill for unknown input,
inventing UI for data the component does not understand. The model answer looks
the label up in one object and returns `null` when there is no entry.

## ex6

Tests derived values and the off-by-one that always comes with them. The classic
mistake is `last = page * pageSize`, which reads `Showing 51-60 of 57` on the
final page and is the single most common pagination bug in production. The model
answer clamps with `Math.min` and gives the empty case its own sentence rather
than rendering `Showing 1-0 of 0`.

## ex7

Tests the distinction between an accessible *name* and an accessible
*description*. Text placed inside the button joins the name, so a helpful
sentence rendered there silently renames the control from `Email alerts` to
`Email alerts We send at most one message a day` — the stub does exactly this,
and it is what happens in real code when a hint is dropped inside a label. The
model answer renders the description in its own element with a `useId` id and
points `aria-describedby` at it, leaving the attribute off entirely when there
is no description so nothing dangles.

## ex8

Tests all three absences in one component. `footer={null}` is a caller saying
"there is deliberately no footer", and both `||` and a naive default parameter
that the caller never triggers will talk over that instruction. The second half
tests optional callbacks: a Dismiss button that calls `undefined` looks fine
until someone clicks it, so the button should not exist unless the handler does.
The model answer defaults `footer` in the parameter list, tests `footer === null`
explicitly for the deliberate-nothing case, and renders the button only when
`onDismiss` was passed.

## Further reading

- [Passing props to a component](https://react.dev/learn/passing-props-to-a-component)
- [Sharing state between components (controlled components)](https://react.dev/learn/sharing-state-between-components)
- [Conditional rendering](https://react.dev/learn/conditional-rendering)
- [MDN: default parameters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters)
- [MDN: the switch role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/switch_role)
- [MDN: aria-describedby](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-describedby)
