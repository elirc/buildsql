# Reading — react/d01_jsx_rendering

## Notes

Every problem in this set is the same shape: props in, one element tree out, no
state anywhere. What varies is where the trap sits. Three of them are about the
boundary between JavaScript and markup — braces hold an expression, and that
expression is evaluated to a *value*, which React then inserts as text. Three
are about attributes: which ones are camelCase props (`dateTime`, `className`),
which ones keep their hyphens (`aria-*`, `data-*`), and what React does with an
attribute whose value is `undefined`. The last two are about the accessibility
tree, which is the only DOM the gates can see — a component that renders
beautifully and announces nothing is, to these tests and to a screen-reader
user, not finished.

## ex1

Tests whether you can keep a computation inside the render output instead of
smuggling it into a variable you then forget to use. The classic mistake is
`{cents}` — shipping the raw storage unit to the user, which is how you get a
coffee priced at 350 dollars. The model answer computes `cents / 100` and calls
`.toFixed(2)` at the point of use, because the formatted string has no reason to
exist anywhere else in the component.

## ex2

Tests whether you reach for the elements that carry meaning rather than the ones
that carry styles. The classic mistake is a `<div>` with an `<img>` and a `<p>`:
it looks identical and says nothing, so `getByRole("figure")` finds nothing. The
second trap is `alt=""`, which is a deliberate claim that the image is
decorative — it removes the image from the accessibility tree entirely, and with
it the `img` role the gate queries by. The model answer uses `figure` +
`figcaption` and puts the real description in `alt`.

## ex3

Tests two things at once: that a component returning several siblings returns a
fragment, and that you know which JSX attribute names differ from their HTML
spelling. The classic mistake is wrapping the pair in a `<div>` — invisible in
the browser, fatal inside a `<p>` or a `<dl>` where only certain children are
legal. The second is writing `datetime` in JSX and getting a React warning about
an unknown prop. The model answer returns `<>...</>` and spells the prop
`dateTime`, letting React lowercase it on the way to the DOM.

## ex4

Tests whether you can say the same fact twice — once visually, once to the
accessibility tree — from one computed value. The classic mistake is a
progress-shaped `<div>` with no role, which announces nothing at all; the second
is `done / total` with a total of zero, which renders the string `NaN%` in front
of the user. The model answer computes the percentage once, above the return,
with a guard for the empty case, then spends it in two places.

## ex5

Tests the boring correctness that interviews actually probe: the comparison, the
slice length, and the trailing space. The classic mistake is `>=` instead of `>`,
which truncates a string that fits perfectly and adds three dots to hide it. The
second is `slice(0, limit) + "..."` with no trim, which produces `Coffee is a
...` whenever the cut lands on a space. The model answer decides the string in a
`const` where both cases are visible side by side.

## ex6

Tests whether you understand what JSX interpolation actually does. The classic
mistake is the one the stub makes: reaching for `dangerouslySetInnerHTML`
because the string "contains HTML". It does not contain HTML; it contains angle
brackets, and turning them into markup is precisely how a notice string from a
database becomes a cross-site scripting hole. The model answer is `{text}` —
React escapes it, which is the default you should have to argue your way out of,
not into.

## ex7

Tests the two-audience problem. A rating drawn with characters is a picture: it
needs `role="img"` and a label that says what the picture shows, and the
characters themselves need to disappear from the accessibility tree or the user
hears the sentence and then a mouthful of punctuation. The classic mistake is
putting `aria-label` on the element and forgetting `aria-hidden` on the glyphs —
or the reverse, hiding the wrapper so the whole widget vanishes from the tree.
The model answer nests them: labelled outer element, hidden inner element.

## ex8

Tests three independent details spread over two elements. The `<th>` is what
carries the sort state, and `aria-sort` must be *absent* — not `"none"`, not
`"ascending"` by default — when the column is not sorted, because those are
different claims to a screen-reader user scanning a table. The classic mistake
is a ternary with two branches, which asserts a direction the component was
never given; the model answer computes the value with three cases and hands
React `undefined`, which it omits. The other two details are the arrow, which is
decoration next to a real label and so must stay out of the accessible name, and
`type="button"` on a control whose parent form this component cannot see.

## Further reading

- [Writing markup with JSX](https://react.dev/learn/writing-markup-with-jsx)
- [JavaScript in JSX with curly braces](https://react.dev/learn/javascript-in-jsx-with-curly-braces)
- [Common components: props and attributes](https://react.dev/reference/react-dom/components/common)
- [Fragment (`<>...</>`)](https://react.dev/reference/react/Fragment)
- [MDN: the `<figure>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/figure)
- [MDN: using ARIA — roles, states and properties](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes)
