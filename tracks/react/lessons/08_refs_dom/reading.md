# Reading — react/08_refs_dom

## Notes

**A ref is a mutable box, and that is the whole implementation.** `useRef(x)`
allocates `{ current: x }` once per component instance and hands back the same
object forever. It is `useState` minus the render — literally, in that React
implements it with the same slot mechanism. Everything else about refs follows
from that: writes are invisible to React, reads during render are unreliable,
and the object identity is stable so it never needs to appear in a dependency
array.

**When React fills a DOM ref.** During the commit phase, after the DOM has been
mutated and before `useLayoutEffect` runs, React sets `ref.current` for every
attached node — and sets it to `null` for nodes it is removing. So by the time
any effect runs, refs are populated. During render they hold the *previous*
value, which is why reading them there is a bug even when it appears to work.

**State versus ref, decided in one question.** Does the value appear on screen,
directly or indirectly? Then it is state. Timer ids, "have I already scrolled",
the previous value of a prop, a mutable cache, a subscription object — none of
those are rendered, so they are refs. The failure mode of getting it wrong in
one direction is a stale screen; in the other, a component that re-renders on
every mouse move.

**`ref` is not `key`, and neither is a normal prop — except now it is.** React
19 made `ref` a regular prop for function components, so `forwardRef` is no
longer needed (it still works and is not being removed imminently). `key`
remains special and is still never visible in props.

**Imperative handles are an escape hatch with a cost.** Exposing methods
inverts React's data flow — the parent now *commands* the child rather than
describing what it wants — and that makes the interaction invisible to anyone
reading the JSX. The cases where it is genuinely right are small and
well-known: focus, scroll, select, play/pause, and resetting an uncontrolled
subtree. Anything you could express as a prop should be a prop.

## ex1 — the two-step that every DOM operation needs

The pattern — declare a ref, attach it, act on it in an effect — is the whole
of DOM access in React, and the reason it is two steps rather than one is worth
holding on to. Render describes what should exist; it does not create anything.
The node exists only after React commits, so the earliest moment you can touch
it is an effect.

Autofocus itself deserves a caveat that the exercise cannot express: it is a
usability decision, not a default. Focusing a field on page load moves a
screen-reader user past whatever came before it, and on mobile it opens the
keyboard and hides half the screen. The right places for it are narrow — a
search overlay the user just opened, the first field of a dialog, an inline edit
they just triggered — and they share the property that the user *asked* to be
put there.

`field.current?.focus()` rather than `field.current.focus()` is not defensive
noise. `current` is genuinely `HTMLInputElement | null` in the type system,
because React nulls it when the node unmounts, and the optional chain is the
honest way to say "if it is still there".

## ex2 — the other job of `useRef`

The render probe makes something visible that is normally invisible: the tap
count changes three times and the component does not render. That is the
distinction the exercise exists for. State is "the screen depends on this"; a
ref is "I need to remember this, and nothing on screen cares yet".

Notice which piece of the exercise is which. The count is a ref because nothing
displays it. The *revealed* total is state because something does. And the
moment you press Show total, the ref's value is copied into state — which is
the normal way these two cooperate.

The rule about not reading refs during render is worth understanding rather than
memorising. React reserves the right to render a component without committing
it (concurrent rendering does this — it can start a render, abandon it, and
start again), so a render that reads `taps.current` may be reading a value from
a render that never happened, or may be about to be thrown away. Event handlers
and effects run after a commit, so they see reality.

The classic production uses of a mutable ref: holding the id returned by
`setInterval` so a cleanup can clear it, holding the previous value of a prop to
compare against, holding an instance of a non-React library (a map, a chart, an
editor), and holding "has this already run" flags. All invisible, all persistent.

## ex3 — forwarding, and what React 19 changed

The fix was one attribute, which is the point: the machinery is now boring. It
is worth knowing what it replaced, because you will read code that uses it.
Before React 19:

```tsx
const FancyInput = forwardRef<HTMLInputElement, Props>(function FancyInput(props, ref) {
  return <input ref={ref} />;
});
```

`forwardRef` existed because `ref` was stripped from props before your component
saw them, so a wrapper had no way to receive one. React 19 removed that special
case for function components. Class components still have the old behaviour, and
`forwardRef` still works, so both forms will coexist in real codebases for
years.

The design point underneath is more durable than the API. Any component that
wraps a form control should let a ref through. Form libraries need it to focus
the first invalid field; design systems need it for tooltips and popovers to
position against; test code needs it for the occasional escape. A wrapper that
swallows refs gets forked, in exactly the same way as one that swallows
`className`.

## challenge — designing what the parent may do

The exercise is constructed so that forwarding the DOM node cannot work.
`focus()` is a DOM operation, but `clear()` has to set React state — the
textarea is controlled, so writing `node.value = ""` would be overwritten by the
next render, and would not update `text`. The only thing that can offer both is
an object that closes over the component's internals, which is exactly what
`useImperativeHandle` publishes.

Two details in the reference are deliberate. The internal `field` ref still
exists, because `focus` needs a real node — the imperative handle sits *beside*
the DOM ref, not instead of it. And the dependency array is `[]` because the
returned object's methods only close over things that are stable (the setter and
the ref object), so there is no reason to rebuild it. If a method closed over a
prop, that prop would belong in the array, and forgetting it would give the
parent a handle that calls yesterday's version — a stale closure with a new
face.

The larger judgement: two methods is a good handle, ten is a component that has
been turned inside out. Every method is API surface, and imperative API is
harder to change than props because callers invoke it from arbitrary places. If
you find the handle growing, the state it manipulates probably wants to be
lifted into the parent instead.

## review1 — focus is the keyboard user's cursor

The two directions fail differently, and both fail silently for anyone using a
mouse.

Opening without moving focus leaves a keyboard user parked on the trigger
button, behind the dialog they just opened; they have no idea it exists and
tabbing walks them through the page underneath it. Closing without restoring
focus is worse: the focused element is removed from the document, so the browser
resets focus to `<body>`, and the next Tab starts from the very top of the page.
Users experience this as "it jumped".

The mechanics show the two timings from ex1 in one component. Focusing the close
button has to wait for it to exist, so it goes in an effect keyed on `open`.
Restoring focus to the opener can happen right in the handler, because that
button never left the document. If you tried both in effects, or both in
handlers, one of them would be reaching for a `null` ref.

Everything a real dialog owes its users beyond this: trapping Tab inside it
while it is open, closing on Escape, marking the rest of the page inert, and
labelling the dialog. That is why the honest recommendation is the native
`<dialog>` element or a maintained library — but knowing what those are doing
for you is what lets you tell a good one from a bad one.

## Further reading

- [react.dev — Referencing Values with Refs](https://react.dev/learn/referencing-values-with-refs) — the mutable-box job, and when to prefer state.
- [react.dev — Manipulating the DOM with Refs](https://react.dev/learn/manipulating-the-dom-with-refs) — the DOM job, including refs to a list of nodes.
- [react.dev — `useImperativeHandle`](https://react.dev/reference/react/useImperativeHandle) and [`forwardRef`](https://react.dev/reference/react/forwardRef) — the challenge, and the API React 19 made unnecessary.
- [MDN — `HTMLElement.focus()`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus) — including `preventScroll`, which you will eventually need.
- [MDN — `document.activeElement`](https://developer.mozilla.org/en-US/docs/Web/API/Document/activeElement) — what `toHaveFocus()` is really checking.
- [WAI-ARIA Authoring Practices — Dialog (Modal): keyboard interaction](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) — the full focus contract the review exercise starts.
