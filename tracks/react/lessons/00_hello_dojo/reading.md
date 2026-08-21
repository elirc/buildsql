# Reading — react/00_hello_dojo

The loop you just ran — write, grade, read the evidence — is the whole course.
This page is the other half of every lesson: the *why* behind the problems you
just solved. Read it **after** you attempt a problem, whether the gate went
green or red. Failing first and reading second is not a consolation prize; it
is the version of studying that sticks.

## Notes

**What React actually is.** React is a library for describing what the screen
should look like *as a function of data*, plus a runtime that makes the real
DOM match that description. You never write "add a list item" or "change this
text"; you write "given these props, the UI looks like this", and React works
out the smallest set of DOM operations that gets from what is on screen now to
what you just described. That process is called **reconciliation**, and almost
every React behaviour that surprises people — why keys matter, why a component
"loses its state", why an effect runs twice — is reconciliation showing
through. You will meet it properly in `04_lists_conditional`.

**JSX is not HTML and it is not a template language.** `<p>hi</p>` compiles to
a plain function call that returns an object describing an element. That is why
JSX can be assigned to a variable, returned from a function, put in an array,
or passed as a prop — it is just a value. It is also why the attribute names
differ from HTML in a few places: they are JavaScript property names, so
`class` (a reserved word) is `className` and `for` is `htmlFor`. And it is why
a component must return *one* root element or a fragment: a function returns
one value.

**Props are one-way and read-only.** Data flows down from parent to child, and
a child may never write to the props object it was handed. When a child needs
to affect the world above it, the parent passes down a *function* — exactly
what `onPress` is in ex3. This "props down, events up" shape is the single most
important structural idea in React, and it is why the framework scales to large
trees without becoming impossible to reason about.

**Why the gates are written in roles and names.** Testing Library's guiding
principle is that a test should resemble the way software is used. The
practical payoff is that gates written this way fail for the same reasons real
users get stuck. If `getByRole("button", { name: "Close panel" })` cannot find
your control, a keyboard user cannot tab to it and a screen-reader user cannot
identify it. The grader and the person are, by construction, asking the same
question.

## ex1 — a component is a function

The interesting part of this exercise is the part the gate checked that you
were not asked to think about: the *element*. Plenty of people would ship a
`<div className="title">` here and every human looking at the page would see a
heading. The machine would not, and neither would a screen reader building its
list of page landmarks. Headings are the table of contents of a document; the
level says where you are in the outline. `getByRole("heading", { level: 1 })`
is the gate asking a question a real user has: "what is this page about?"

The second thing hiding here is that rendering twice is a real test-design
decision. One render can be satisfied by a hard-coded string. Two renders with
different inputs can only be satisfied by a function of the input. You will see
this pattern in every gate in the track — whenever a check is repeated with
different data, the repetition *is* the assertion.

## ex2 — logic lives before the return

Pluralisation is a deliberately unglamorous problem, chosen because it splits
cleanly into "what React does for you" and "what it does not". React will
faithfully render whatever string you produce. It has no opinion whatsoever
about whether `0` is plural, and no amount of framework knowledge substitutes
for reading your three expected outputs carefully.

The classic mistake is `lessons > 1 ? "lessons" : "lesson"`, which is right for
15, right for 1, and wrong for 0. Interviewers use almost exactly this question
— usually phrased as "render 1 file / 2 files" — precisely because the zero
case separates people who tested their component from people who eyeballed it.

The structural lesson is where the decision goes. A component body is an
ordinary function body right up to the `return`, so compute your `noun` there,
as a `const`, and interpolate the result. Cramming the ternary inline works too
and reads worse. Statements — `if`, `for`, `switch` — cannot go inside JSX
braces at all, because braces hold an *expression*; when you need one, put it
above the `return`, which is where React developers naturally end up.

## ex3 — the accessible name is a separate thing from the text

This exercise exists to make one distinction permanent: what an element
*contains* and what it is *called* are computed separately, and for icon
controls they are deliberately different. The accessible name comes from the
first of these that exists: `aria-labelledby`, then `aria-label`, then the
element's own text content. An `<button>✕</button>` with no label is announced
as "✕" or, depending on the screen reader, as nothing — one of the most common
real accessibility defects on the web, and the reason icon-only toolbars are
so often unusable without sight.

The other half of the exercise is the function prop. `onPress` arrives as a
value and is handed straight to `onClick`, unchanged and uncalled. Writing
`onClick={onPress()}` invokes it during render, which in a real app fires your
"delete account" handler the instant the button appears; React would then try
to use the return value as an event handler. If you ever need to pass an
argument, wrap it — `onClick={() => onPress(id)}` — which creates a new
function on every render, a fact that stops being harmless in
`11_performance_patterns`.

Finally, `user-event` rather than `fireEvent`. `fireEvent.click` dispatches one
synthetic click. `user-event`'s click reproduces what a browser actually does:
hover, pointer down, focus, pointer up, click. That is why it catches a
`<div onClick>` that a plain `fireEvent` would happily "click" — the div never
takes focus, is never reachable by keyboard, and is not a button no matter how
it is styled.

## Further reading

- [react.dev — Your First Component](https://react.dev/learn/your-first-component) — the official on-ramp; twenty minutes and it is written unusually well.
- [react.dev — Writing Markup with JSX](https://react.dev/learn/writing-markup-with-jsx) and [JavaScript in JSX with Curly Braces](https://react.dev/learn/javascript-in-jsx-with-curly-braces) — the two pages that answer 90% of "why won't this compile".
- [react.dev — Passing Props to a Component](https://react.dev/learn/passing-props-to-a-component) — props, destructuring, defaults, and children.
- [Testing Library — Guiding Principles](https://testing-library.com/docs/guiding-principles/) and [About Queries](https://testing-library.com/docs/queries/about/) — why the gates are written the way they are, and the priority order of queries.
- [MDN — ARIA: the accessible name](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label) — how `aria-label` participates in name computation, and when not to use it.
