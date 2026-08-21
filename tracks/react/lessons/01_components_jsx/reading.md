# Reading — react/01_components_jsx

## Notes

**What JSX compiles to.** `<p className="x">hi</p>` becomes a call to the JSX
runtime — with the modern transform, `jsx("p", { className: "x", children: "hi" })`
— which returns a frozen object often called an *element*: a description of
what you want, not a DOM node. Rendering is the separate step where React reads
those descriptions and issues DOM operations. This is why you can build a tree
of elements, throw it away, and pay nothing: elements are cheap objects, and
until React commits them nothing has touched the document.

**Why capitalisation is load-bearing.** The compiler decides between "HTML tag"
and "your component" by the first character. `<header>` compiles to the string
`"header"` and produces a real element; `<Header>` compiles to a reference to a
variable called `Header` and calls it. A lowercase component name therefore
fails silently: React renders a `<pageheader>` element that no browser knows,
and nothing appears. If a component renders as literally nothing and there is
no error, check the capital letter first.

**Fragments and why they exist.** Before fragments, "return two siblings" was
solved by wrapping in a `<div>`, which was fine until the parent cared about
its direct children — tables, description lists, flexbox and grid all do.
Fragments group children for React's benefit and emit nothing to the DOM. The
long form, `<React.Fragment key={…}>`, is the version you need when a fragment
is generated in a loop, because the shorthand `<>` cannot take a `key`; that
comes up in `04_lists_conditional`.

**Expressions, not statements.** The braces in JSX interpolate the value of an
*expression*. That rules out `if`, `for`, `switch` and variable declarations,
and rules in ternaries, `&&`, function calls, template literals and array
methods. The practical consequence is a style: when rendering logic gets past
one ternary, hoist it into a `const` above the `return` or into a small helper
component. React code that stays readable is almost always code where the
`return` is a flat description and the decisions were made above it.

**Semantics are not decoration.** Every exercise in this lesson was gradeable
because the elements carried meaning: `<header>` gives you `banner`, `<a href>`
gives you `link`, `<dt>`/`<dd>` give you `term`/`definition`, `role="alert"`
gives you a live region. The gate can only ask questions the platform can
answer, which turns out to be the same constraint a screen reader operates
under. Write `<div>` everywhere and both go blind at once.

## ex1 — one root element

The rule "a component returns one element" is not a React rule at all — it is
the rule that a function returns one value, wearing a costume. Once you see it
that way the follow-up questions answer themselves: yes, you can return `null`
(render nothing); yes, you can return an array; no, you cannot return two
adjacent elements, for the same reason you cannot write `return 1, 2`.

The parentheses after `return` deserve a sentence of their own. JavaScript's
automatic semicolon insertion will end a statement at a line break if what
follows cannot continue it, and `return` on its own line is the classic
casualty: the function returns `undefined` and React renders nothing. Wrapping
multi-line JSX in `(` … `)` makes the problem structurally impossible, which is
why essentially all React code does it.

The choice of `<header>` over `<div>` is what made the exercise checkable.
Landmarks — `banner`, `navigation`, `main`, `contentinfo` — are how a
screen-reader user skips around a page instead of reading it linearly, and they
come free from `<header>`, `<nav>`, `<main>` and `<footer>` when those elements
sit at the top level of the document.

## ex2 — the two kinds of braces

`href={href}` versus `href="href"` is a one-character-class mistake that
survives review because it looks right. It is worth understanding rather than
memorising: in attribute position, a quoted value is a *string literal* — the
same as HTML — and a braced value is *an expression evaluated now*. So
`href="/people/ada"` is fine, `href={"/people/ada"}` is the same thing said
noisily, and `href={href}` is the only form that varies with the prop.

The accessible-name check is the other half. For a link with no `aria-label`,
the accessible name is its text content, which means `Open Ada` had to be
assembled from a literal and an interpolation. Watch for the whitespace rule
while you do that: JSX preserves spaces *within* a line of text but strips
leading and trailing whitespace on each line and collapses line breaks between
text and elements. `Open{name}` gives `OpenAda`; putting `Open` and `{name}` on
separate lines gives `Open Ada`, because the newline collapses to one space.

Finally, an `<a>` without `href` genuinely has no `link` role — the HTML
specification calls it a "placeholder link". If you catch yourself writing
`<a onClick={…}>` with no href, the element you actually wanted was a
`<button>`.

## ex3 — the wrapper you are not allowed to add

The `<dl>` was chosen because it makes the constraint real rather than
stylistic. HTML says a description list's children must be `<dt>`, `<dd>`, or
`<div>` grouping *pairs* of them — a `<div>` around a single `dt`/`dd` from
each component would produce a structure browsers and assistive technology
parse differently from what you meant. The same class of problem shows up
constantly: `<tr>` may only contain cells, `<ul>` may only contain `<li>`, and a
CSS grid lays out its direct children, so an extra `<div>` collapses your
columns.

Fragments also matter for a reason you cannot see in the DOM: they keep the
tree shallow. Every wrapper is another node React has to create, diff and
store, and in a list of a thousand rows the wrappers are not free. That is a
minor point next to correctness, but it is why "just wrap it in a div" is a
habit worth not forming.

## ex4 — computing an attribute

This is the first exercise where the component makes a *rendering decision*
rather than formatting a value, and the shape it teaches — decide above the
`return`, interpolate below — scales all the way up. The alternative, writing
two nearly identical `return` statements for the two tones, works here and
becomes unmaintainable the moment there are three tones and four attributes
that vary. Prefer varying the values; reach for a second `return` only when the
*elements* differ, which is exactly what the challenge asks you to notice.

The ARIA content matters as much as the JSX. A live region is a promise to the
user: "if this changes, you will be told". `alert` interrupts speech
immediately and should be reserved for things that need it — a failed save, a
validation error blocking submission. `status` queues politely and is right for
confirmations and progress. Marking everything an alert is the accessibility
equivalent of a form that shouts every field back at you, and users turn it off.

## challenge — when the elements themselves differ

The breadcrumb rule is a real accessibility guideline, not an invented
constraint: the current page in a breadcrumb trail is marked with
`aria-current="page"` and is not a link. Implementing it forces you to notice
that "conditional rendering" covers two different situations. When one *value*
varies, vary the value (ex4). When one *element* varies, branch and return
different JSX. Trying to force the second case into the first — an `<a>` whose
`href` is sometimes `undefined` — produces exactly the placeholder link that
has no role and no keyboard behaviour.

`aria-current` takes several values (`page`, `step`, `location`, `date`,
`time`, `true`), and using the specific one gives assistive technology more to
work with than the generic `true`. Interviewers rarely ask about it; users
notice it every day.

## review1 — invisible wires made of ids

Two independent relationships, both expressed as id strings, both easy to break
silently. `htmlFor` → `id` gives the input its accessible *name*, which is what
`getByLabelText` searches on and what a screen reader announces when focus
lands. `aria-describedby` → `id` gives it an accessible *description*,
announced after the name, which is where hints and error messages belong.

Deriving the second id from the first (`${id}-hint`) rather than accepting it
as another prop is the pattern you will keep using, and it has a wrinkle worth
knowing about early: ids must be unique in a document, so a component rendered
twice with the same `id` prop breaks both copies. React's `useId` hook exists
for exactly this and is the right tool once a component generates its own ids;
here the parent supplies one, which keeps the exercise about the wiring.

## Further reading

- [react.dev — Writing Markup with JSX](https://react.dev/learn/writing-markup-with-jsx) — the three rules, including fragments, straight from the source.
- [react.dev — JavaScript in JSX with Curly Braces](https://react.dev/learn/javascript-in-jsx-with-curly-braces) — text braces, attribute braces, and the double-brace confusion.
- [react.dev — `<Fragment>` (`<>…</>`)](https://react.dev/reference/react/Fragment) — including the keyed long form you will need for lists.
- [MDN — `<dl>`, `<dt>`, `<dd>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dl) — why the wrapper rules exist.
- [MDN — ARIA live regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions) — `alert` vs `status`, and how not to overuse them.
- [MDN — `aria-current`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-current) — the breadcrumb rule from the challenge.
