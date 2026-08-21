# Reading — react/02_props_composition

## Notes

**Props are a function's arguments, nothing more.** React calls your component
with one object. Destructuring in the parameter list is a JavaScript feature,
defaults are a JavaScript feature, rest and spread are JavaScript features. The
only React-specific thing in this whole lesson is the `children` convention:
the compiler takes whatever sits between a component's opening and closing tags
and puts it on the props object under that name. Knowing this stops a whole
category of confusion — you cannot "pass props up", for the same reason a
function cannot rewrite its caller's variables.

**Immutability is a contract, not a suggestion.** Mutating `props.items.push(x)`
often *appears* to work and then fails in ways that look like React bugs:
another component holding the same array sees the change without re-rendering,
or a memoized child skips an update because the array reference did not change.
React's model is that rendering is a pure function of props and state, and
every optimisation it ships — bailouts, memoization, concurrent rendering — is
licensed by that purity. Break it and you are outside the contract.

**Composition instead of inheritance.** React has no component inheritance and
does not want any. Anything you would reach for a base class to do — shared
layout, shared behaviour, shared defaults — is done by containing components
inside other components, or by extracting a custom hook (lesson 10). The
official guidance is blunt about this, and after a few years of it the absence
stops feeling like a gap.

**`ReactNode` vs `ReactElement`.** `ReactNode` is the type of "anything you can
render": elements, strings, numbers, `null`, `undefined`, `false`, and arrays
of those. `ReactElement` is specifically the object a JSX tag produces. Type
slot props as `ReactNode` — it is what callers expect to be able to pass, and
`false` and `null` in particular need to be legal so that `{cond && <X/>}` can
be passed as a slot.

**Prop drilling has a threshold, not a rule.** Passing a prop through two
components that do not use it is fine. Passing it through six is a smell, and
the fixes in order of preference are: restructure so the data is closer to its
consumer, pass JSX down instead of data (composition often deletes the problem
outright), then context (lesson 09). Reaching for a global store first is the
usual overcorrection.

## ex1 — children is the composition primitive

The stub for this exercise rendered everything except `children`, which is
exactly how the mistake happens in real code: you write the wrapper, you style
it, you forget the one interpolation, and the content silently disappears with
no error. React has nothing to warn you about — you asked for a component that
renders a heading, and it rendered a heading.

Worth noticing is what `Card` does *not* do. It does not know it was given a
paragraph. It does not lay the paragraph out, or restrict what may go inside,
or take a `bodyText` string. That ignorance is the feature: the same `Card`
will hold a form, a chart or another `Card` without a line of change. When you
find yourself adding a prop that describes the *shape* of the content rather
than a decision about it, `children` was probably the answer.

The ordering check exists because it is the one thing `Card` genuinely decides.
A composition component's whole API surface is "where do the pieces go".

## ex2 — defaults, and the `||` trap

`max = 5` in the destructuring pattern is the correct place for a default, and
the reason is narrow but important. The parameter default fires only for
`undefined`. The older idiom, `const max = props.max || 5`, fires for every
falsy value — `0`, `""`, `false`, `NaN` — which is a real bug the moment a prop
can legitimately be zero. `props.max ?? 5` (nullish coalescing) is the
equivalent modern fix when you cannot use a parameter default, and it is a
common interview question in exactly this form: "what is the difference between
`||` and `??`, and when does it bite?"

The `role="img"` half of the exercise is a small lesson in accessible naming
that is genuinely used in production. A run of `★★★☆☆` is a picture drawn with
characters; without a role and a name a screen reader reads five star
characters, or, with some voices, the word "star" five times. Giving the
wrapper `role="img"` plus `aria-label` makes it announce as one image called
"3 out of 5 stars" — and, because `role="img"` tells assistive technology to
treat the subtree as opaque, the individual characters are no longer visited.

## ex3 — slots, and when to prefer them over children

`children` handles one hole. The moment there are two — header and footer, list
and detail, trigger and content — you need names, and a prop holding JSX is the
whole mechanism. There is no separate "slot API" in React because there does
not need to be one.

The thing to resist is inspecting what you were handed. React has
`React.Children` utilities that can map over or count children, and
`cloneElement` can inject props into an element you were passed. Both exist,
both are legacy, and both couple your component to the exact shape of what
callers pass — the component stops working the moment someone wraps their
button in a fragment or a conditional. Modern React's answer is: if you need to
influence what is inside, pass the influence down another way (context, lesson
09) rather than rewriting the JSX.

The other honest trade-off: a slot prop is *evaluated at the call site*, before
your component decides whether to render it. `<Panel footer={<Expensive />} />`
builds the element object either way — cheap, since elements are just objects —
but any code you run *while building it* runs regardless. For genuinely
expensive or conditional content, pass a function instead of an element.

## ex4 — forwarding what you do not own

Every wrapper component you write is a small API, and the most common defect in
those APIs is swallowing. A `<Button>` that does not forward `className` cannot
be positioned. One that does not forward `aria-label` cannot be made
accessible. One that does not forward `onBlur`, `data-testid` or `ref` breaks
form libraries, test suites and focus management respectively. `...rest` is a
one-line insurance policy against all of it, and `& ComponentProps<"input">` is
how you tell TypeScript which props those are without listing them.

Spread order is the part people get wrong under pressure. `<input {...rest} id={id} />`
means "the caller may not override the id"; `<input id={id} {...rest} />` means
"they may". Neither is universally right — a design-system component often
wants to lock down a couple of props and open the rest — but you should be able
to say which you chose and why. That is a real interview follow-up.

One trap worth naming: spreading onto a DOM element passes *everything*
through, including props that are not valid HTML attributes, and React will
warn about unknown props in the console. If your component has extra props of
its own, name them in the destructuring so they are pulled out of `rest`.

## challenge — the naming wire, and `useId`

A dialog with no accessible name is announced as "dialog" and nothing else,
which is the accessibility equivalent of a window with a blank title bar. There
are two ways to name it: `aria-label="Delete file?"` duplicates the string, and
`aria-labelledby` points at the element already showing it. Prefer the second —
one source of truth, and it stays correct when the title is translated or
changes.

`useId` is React's answer to a genuinely awkward problem: you need a unique
string, it must be the same on every render (or React would rewire the
attribute every time), and it must be the same on the server and the client (or
hydration mismatches). A module-level counter fails the last requirement, and
`Math.random()` fails all three. `useId` is the only correct answer, and the
rule that comes with it is the rule for every hook: call it unconditionally at
the top level of the component.

`aria-modal="true"` is a claim, not a mechanism. It tells assistive technology
that content outside the dialog is inert; it does not *make* it inert. A real
modal also traps focus, moves focus in on open, restores it on close, and
closes on Escape — which is why the honest advice in 2026 is to use the native
`<dialog>` element or a well-tested library rather than rebuilding it. You will
implement focus management yourself in `08_refs_dom`.

## review1 — the same pattern, smaller

The media object is worth recognising by name because it is the canonical
example in every discussion of composition, and because it makes the "do not
reach inside" rule concrete: the caller handed you a complete `<img>` with its
own `alt`, and any attempt to improve it — adding a class, defaulting the alt,
wrapping it in a figure with a caption — is you deciding something that was not
yours to decide.

`compareDocumentPosition` is worth knowing about too. It answers "where is this
node relative to that one" without any assumption about nesting, which makes it
the right tool for asserting order in a test that must not care about your
markup. The return value is a bitmask; `4` means the argument follows the node
you called it on.

## Further reading

- [react.dev — Passing Props to a Component](https://react.dev/learn/passing-props-to-a-component) — destructuring, defaults, spreading and `children`, in order.
- [react.dev — Extracting State Logic / Composition vs inheritance](https://react.dev/learn/thinking-in-react) — how the tree gets carved up in the first place.
- [react.dev — `useId`](https://react.dev/reference/react/useId) — why it exists and what it is not for.
- [MDN — Rest parameters and destructuring defaults](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment) — the JavaScript half of ex4.
- [MDN — Nullish coalescing `??`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing) — the `||` trap from ex2, spelled out.
- [WAI-ARIA Authoring Practices — Dialog (Modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) — everything a real modal owes its users beyond the two attributes in the challenge.
