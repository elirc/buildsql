# Reading — react/d22_render_performance

## Notes

Memoization is the second thing to reach for. The first is structure, and the
reason is worth stating plainly: a memo is a comparison on every render plus a
dependency array somebody has to keep honest for ever, while moving state down
or lifting content up removes the problem outright and cannot rot. Three moves
cover most of this set. State belongs to the smallest component that needs it,
because a render caused by a piece of state reaches everything the component
holding it renders. Content that does not depend on a component's state can be
handed to it as `children`, which arrives as the same element object each time
and lets React skip the subtree. And the cheapest render is the one that never
happens — a closed row, a row below the fold, or a state change that is not a
change at all. The last exercise is the counterweight: when the work really is
derived data and per-row state, memoization is the right tool, and it only pays
once every prop reaching the memoized component is stable.

## ex1

Tests lifting content up as `children`. The classic mistake is not seeing that
there is a problem: the panel is written inside the ticker because that is where
it appears on screen, and so it is re-created every time the ticker's own state
moves. The model answer builds the panel's element in a component with no state
and passes it down, so React compares the same element object against itself and
skips the subtree — no `memo` involved.

## ex2

Tests moving state down. The classic mistake is putting a flag at the top of a
component "so everything can see it" when exactly one paragraph and one button
label depend on it — every toggle then re-renders a report that has nothing to
do with help text. The model answer extracts the button and its paragraph into a
component that owns the flag, which leaves the panel with no state and no reason
to render again.

## ex3

Tests not building what is not shown. The classic mistake is rendering
everything and hiding most of it with `hidden` or a CSS class, which looks
identical on screen and does the entire cost anyway: elements, DOM nodes, and —
the part that really hurts — every effect inside, which usually means every
request. The model answer renders the body only while the row is open, so a
closed row builds nothing.

## ex4

Tests the size of the list itself. The classic mistake is reaching for `memo`
on the row when the problem is that a hundred rows are being rendered for a
screen that shows five — memoizing each row makes re-renders cheaper and does
nothing about the first one. The model answer slices before it maps and keeps
the live region honest about how much of the list is on screen.

## ex5

Tests React's own bail-out. Setting state to the value it already holds is not
a change and costs nothing — but only if the values are comparable with
`Object.is`, which two freshly built objects never are. The classic mistake is
wrapping a value in an object out of habit; the model answer stores the string,
and the wasted render disappears without a guard being written anywhere.

## ex6

Tests lazy initial state. The classic mistake is starting at `null` and filling
the value in from an effect, which costs a render and — worse — commits a frame
showing the empty state, so the user sees "No session" flash past on every load.
The model answer passes the reader function to `useState`, which React calls once
before the first render, and the impossible state disappears from the component
along with it.

## ex7

Tests exercise 2's move applied twice. The classic mistake is a shell that
collects all the page's state "for convenience": every keystroke re-renders
everything the shell renders, and the usual response is to start wrapping
children in `memo` one at a time. The model answer gives each piece of state its
own small component, leaving the shell with none — which is a stronger
guarantee than any memo, since there is nothing left for a future prop to break.

## ex8

Tests knowing when memoization *is* the answer. Here the work really is derived
— a sort and a filter with different inputs — and the rows really do have their
own state, so the tools earn their place. Three things have to be right
together: two `useMemo`s with two honest dependency lists so typing cannot cost
a sort, `memo` on the row, and one `useCallback` handler shared by every row.
Get any one of them wrong and the other two buy nothing, which is the most
useful thing to take away from the pair of sets.

## Further reading

- [You might not need an effect](https://react.dev/learn/you-might-not-need-an-effect)
- [Sharing state between components](https://react.dev/learn/sharing-state-between-components)
- [Passing JSX as children](https://react.dev/learn/passing-props-to-a-component#passing-jsx-as-children)
- [`useState`: avoiding recreating the initial state](https://react.dev/reference/react/useState#avoiding-recreating-the-initial-state)
- [Conditional rendering](https://react.dev/learn/conditional-rendering)
- [`memo` reference](https://react.dev/reference/react/memo)
