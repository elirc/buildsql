# Reading — react/d03_children_composition

## Notes

Composition is the answer React gives to the question every UI library has to
answer: how do you write a component that is useful in situations its author
never imagined? The answer is that you do not add another prop. You leave a hole
and let the caller fill it. This set walks the ladder of holes, from the plain
one to the awkward ones: `children` as markup, several named slots, a
specialised component built on a general one, `children` as a *function* so the
caller gets access to state the component owns, and finally children that the
parent inspects rather than merely renders. The higher you climb, the more the
component knows about its children and the less freely it can be reused - which
is why the last two rungs need a real reason.

## ex1

Tests the plain slot and the discipline of not looking inside it. The classic
mistake is a `title` prop that the component renders in a `<div>` styled to look
like a heading, which leaves the document with no outline for a screen-reader
user to navigate. The model answer is three lines: a sectioning element, a real
`<h2>`, and `{children}` rendered untouched.

## ex2

Tests the two ways of associating a label with a control, and which one survives
not knowing what the control is. `htmlFor` needs an id, and this wrapper was
never given one and must not invent one, because the caller may have set an id
already. The classic mistake is a `<span>` holding the label text next to the
input: visually identical, invisible to `getByLabelText` and to every assistive
technology. The model answer wraps the children in a real `<label>`, which
associates implicitly.

## ex3

Tests that the wrapper decides the container and nothing else, with the tone
choosing between two live-region roles. The classic mistake is hard-coding
`role="alert"` because the first case needed it - which means every draft-saved
message interrupts whatever the user was reading. The model answer computes the
role from the prop and puts the children inside the region, so an announcement
carries the link it came with.

## ex4

Tests named slots. Once a component has more than one hole, only one of them can
be `children`, and the rest arrive as props whose values are markup. The classic
mistake is rendering all three slots into anonymous `<div>`s, which produces a
page with no landmarks at all: keyboard users lose the "skip to main content"
target, and screen-reader users lose the ability to jump between regions. The
model answer maps each slot to the element that already carries the right role.

## ex5

Tests specialisation. `DangerButton` is not a new button; it is `Button` with
one decision taken, and the way you can tell is that it does not contain the
word `<button>` anywhere. The classic mistake is copying the markup so the two
diverge the first time someone adds a loading state to one of them. The model
answer renders `Button` with `tone="danger"` and forwards `children` and
`onClick` - about four lines, none of them markup.

## ex6

Tests the render prop, which is the first pattern in this set where the caller
gets something back. `Toggler` owns the state and knows nothing about the UI;
the function it calls owns the UI and knows nothing about how the state is
kept. The classic mistake is wrapping the result in a `<div>`, which quietly
imposes a layout decision on every caller, and the second is a `toggle` that
sets state from a captured value rather than the updater form. The model answer
returns a fragment and flips with `setOn((current) => !current)`.

## ex7

Tests the `Children` API, which exists precisely because `props.children` is not
an array. It might be a single element, a string, `false`, or a nested array,
and `Children.toArray` flattens all of that while dropping the empty slots.
`isValidElement` is the guard that makes `child.type` and `child.props` safe to
read at all. The classic mistake is `children.map(...)`, which throws the moment
someone passes one child; the second is comparing `child.type.name`, which does
not survive minification. The model answer compares `child.type === Case` by
reference and renders that Case's own children.

## ex8

Tests the compound component: three parts, one shared identity, no props passed
between them. Context is what carries the id down, `useId` is what makes it
unique per instance, and `Object.assign` is what puts `Label`, `Control` and
`Hint` on `FormField` so the caller writes them as a set. The classic mistake is a
hard-coded id string, which works perfectly in a demo with one field and breaks
in production the moment there are two - both labels then point at the first
input. The second is an unconditional `aria-describedby`, which leaves a
dangling reference no browser reports; the model answer asks whether a `Hint`
is among the children before deciding what the context carries.

## Further reading

- [Passing JSX as children](https://react.dev/learn/passing-props-to-a-component#passing-jsx-as-children)
- [Extracting state logic and sharing behaviour with render props](https://react.dev/reference/react/Children)
- [`useId`](https://react.dev/reference/react/useId)
- [`createContext` and `useContext`](https://react.dev/reference/react/useContext)
- [MDN: the `<label>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/label)
- [MDN: ARIA landmark roles](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles#landmark_roles)
