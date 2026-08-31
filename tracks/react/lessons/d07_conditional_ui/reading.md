# Reading — react/d07_conditional_ui

## Notes

Conditional rendering looks like the easiest thing in React and produces some of
its most durable bugs, because three separate questions hide inside "show this
when that". The first is what JavaScript actually evaluates: `&&` returns an
operand, not a boolean, and React renders every value except `false`, `null`,
`undefined` and the empty string. The second is what "hidden" means — a branch
that is not rendered does not exist, which is what makes conditionals a real
access boundary and also what makes them destroy state. The third is where the
condition belongs: sometimes it swaps an element, and sometimes it should only
change an attribute on an element that stays put. This set walks all three, and
the last problem is the one that separates people who have shipped React from
people who have read about it.

## ex1

Tests whether you treat mutually exclusive states as one decision. The classic
mistake is the stub: three independent conditions that can all be true at once,
so a signed-in user is offered Sign in and Sign out side by side. The model
answer returns early for the signed-out case, which makes the exclusivity a
property of the code rather than something you have to keep true by hand.

## ex2

Tests the falsy-zero leak, which is the single most-seen React bug on earth. The
classic mistake is `{count && <Badge/>}`: when `count` is `0` the expression
evaluates to `0`, React renders it, and a lone zero appears where the badge was
meant to be absent. The model answer compares explicitly and returns `null`,
which also documents the intent - zero is a state, not a falsy accident.

## ex3

Tests that you know a component may render nothing at all. The classic mistake is
returning an empty wrapper, which is invisible in a screenshot and very visible
in a layout with gaps, borders or grid gutters - and which a screen reader still
walks through. The model answer guards at the top and returns `null`, leaving the
rest of the component to deal only with the case that has content.

## ex4

Tests branch selection when the branches differ structurally rather than
cosmetically. The classic mistake is nesting ternaries three deep until nobody
can read them, or - worse - rendering all four and hiding three with CSS. The
model answer switches on the discriminant, which both reads like the
specification and lets TypeScript narrow the union so each arm can reach the
fields that only exist in it.

## ex5

Tests priority ordering and what a gate actually means. The classic mistake is
rendering the children and putting the message over them, or joining the
conditions with `&&` so that "signed out" and "not entitled" can both try to
render. The model answer uses two guard clauses in priority order, so the content
is never even created for a user who may not have it - the markup is not in the
DOM to be found in devtools.

## ex6

Tests knowing when *not* to branch on elements. Everything here is one button
whose word, disabled state and busy state change - so the condition belongs on
the attributes. The classic mistake is two separate `<button>` elements in a
ternary, which loses focus when the branch flips, and `aria-busy={saving}`, which
writes `aria-busy="false"` and tells assistive technology about a wait that is
not happening. The model answer keeps one element and lets `undefined` remove the
attribute.

## ex7

Tests separating what a control says from what it draws. The classic mistakes
come in pairs: the pluralisation that renders `1 reviews waiting`, and the
badge cap that is applied to the accessible name as well, so a screen-reader user
is told there are `9+` reviews when the component knows there are twelve.
The model answer computes the label and the badge as two independent values above
the return, checks the snoozed case first in both, and represents "no badge" as
`null` rather than as a falsy number.

## ex8

Tests the rule that carries the most weight in real applications: state lives at
a position in the tree, and unmounting a subtree destroys everything it held. The
draft is kept in the DOM node of an uncontrolled textarea, so switching to
Preview deletes it - and the same failure mode shows up as a lost scroll position,
a reset accordion or a re-triggered animation. The classic mistake is trying to
fix it by hiding the panel with CSS instead of understanding it. The model answer
lifts the draft into state above the branch and makes the textarea controlled,
which is also what gives the preview something to show.

## Further reading

- [Conditional rendering](https://react.dev/learn/conditional-rendering)
- [Preserving and resetting state](https://react.dev/learn/preserving-and-resetting-state)
- [Sharing state between components](https://react.dev/learn/sharing-state-between-components)
- [MDN: logical AND returns an operand, not a boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_AND)
- [MDN: aria-busy](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-busy)
