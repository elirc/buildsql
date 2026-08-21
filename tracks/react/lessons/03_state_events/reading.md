# Reading — react/03_state_events

## Notes

**Where state actually lives.** Not in your variable — in React. Each component
instance has a list of hook "slots", and `useState` reads and writes the next
one in order. That is the entire reason for the rules of hooks: React matches
the call to the slot by *call order*, so a `useState` inside an `if` shifts
every later hook by one and produces the famous "rendered fewer hooks than
expected" crash. Lesson 10 makes you fix one.

**A render is a snapshot.** When React calls your component it produces the JSX
for one particular set of props and state, and every function created during
that call closes over *those* values, permanently. An `onClick` created during
render #3 will always see render #3's `count`, even if it runs a minute later.
This is a feature — handlers see a consistent world — but it is also the source
of every stale-value bug in React, and the reason the same problem reappears in
`06_effects` with sharper teeth.

**The update queue.** Setter calls do not change state; they enqueue an
instruction. A value enqueues "replace with this", a function enqueues "compute
from whatever comes before you". At the end of the event React drains the queue
in order, producing the next state, and re-renders once. If the result is
`Object.is`-equal to the current state, React may skip the re-render entirely —
which is why `setCount(0)` on a counter already at `0` costs nothing, and why
mutating an array in place and setting it back renders nothing at all.

**Batching.** React 18 made batching universal — updates from promises,
`setTimeout` and native event listeners are batched just like React events. The
practical consequence is that you cannot observe intermediate state, and should
not try; `flushSync` exists to force a synchronous render and is a last resort
for things like measuring the DOM between two updates.

**Choosing state.** Three questions, in order. Does it change over time? If
not, it is a constant. Can it be computed from props or other state? If so,
compute it during render — derived values that are stored go stale. Is it
needed by more than one component? Then it belongs to their nearest common
ancestor, which is *lifting state up* (lesson 11 puts a name and a cost on it).

## ex1 — the smallest possible piece of memory

The two-line version of this exercise hides a decision worth naming: `count` is
a `const`, and that is deliberate. You never write to state; you ask for a new
render with a new value. Coming from imperative UI code — where you find the
label and set its text — this inversion is the single biggest adjustment, and
it is what makes React code auditable: the only way the screen changes is a new
render, and the only way a new render happens is a setter call.

`<output>` was chosen over `<span>` for the display because it carries
`role="status"`, which makes it a polite live region. Sighted users see the
number change; without a live region, screen-reader users get nothing at all
after clicking, because focus never moved and no text they are pointed at
changed. This is one of the most common gaps in otherwise careful UI work, and
it costs one element to avoid.

## ex2 — the exercise that explains the updater form

Almost everyone reads `setCount(count + 1); setCount(count + 1);` and expects
`+2`. Understanding why it is `+1` is understanding React's model. `count` is
not a live reading of some cell React owns; it is a value baked into this
render. Both calls therefore enqueue "become 1", and the second one wins by
doing exactly the same thing as the first.

The updater form changes what is enqueued from a value to a *recipe*. React
applies the recipes in order against the accumulating result, so "add one, add
one" composes. The rule to internalise — use the updater whenever the next
state depends on the current state — costs nothing when it was not needed and
saves you in three situations that are hard to see coming: two updates in one
handler, an update inside a `setTimeout` or `.then()` that captured an old
render's state, and an update fired from an event that arrived while another
render was pending.

This exact scenario is a top-five React interview question, usually phrased as
"what does this print?" The answer they are listening for is not "1" but
"because state is a snapshot of that render".

## ex3 — toggles, and why the label does not change

`useState(false)` and `setLiked((was) => !was)` are the mechanical part. The
interesting part is the ARIA. A *toggle button* is a single control with an
on/off state, and the pattern is: keep the accessible name constant, express
the state in `aria-pressed`. Swapping the name from "Like" to "Unlike" means
that after activation a screen reader announces a control that, as far as the
user can tell, is a different button — and it makes the button's name describe
the *action available* rather than the *thing it controls*, which reads
backwards when the state is announced too ("Unlike, pressed").

The related decision, which comes up constantly in real work, is toggle button
versus checkbox versus switch. A checkbox belongs in a form and is submitted; a
toggle button takes effect immediately; `role="switch"` is a toggle whose
states are on/off rather than pressed/not-pressed. Any of the three can be
right, but picking one and implementing it fully beats inventing a fourth.

Note also that `aria-pressed={liked}` renders `"false"` when `liked` is false —
React only drops `false` values for its own boolean DOM properties (`disabled`,
`checked`), not for `aria-*` and `data-*` attributes, which are strings all the
way down. That asymmetry catches people; `aria-hidden={false}` really does
render `aria-hidden="false"`.

## ex4 — measuring batching

The probe deserves a warning label, and the stub carries one: calling a prop
during render is a side effect, which React explicitly forbids. It is used here
because it is the only way to count renders without reaching into React's
internals, and because in `11_performance_patterns` the same technique becomes
the way you *prove* a memoization worked instead of guessing. In production
code, side effects go in event handlers or effects, never in the render body.

What the number tells you: three state updates in one handler produce one
render. React does not re-render between setter calls, so you cannot observe
`a` updated and `b` not. That guarantee is what makes it safe to split state
into several `useState` calls instead of one object — a common beginner worry
with no basis. Split state by what changes together, not by what renders
together.

The historical footnote is worth having for interviews. Before React 18,
batching only applied inside React's own event handlers; an update inside
`setTimeout` or a `.then()` rendered immediately, so two of them rendered
twice. React 18 made batching automatic everywhere, and `flushSync` is the
escape hatch for the rare case where you need a render *now*.

## challenge — modelling state instead of storing the display

The trap this exercise is built around is storing the answer instead of the
question. `count` is what the user sees, so it feels like the state; but undo
needs history, and history cannot be recovered from a number. Once you store
the array, the count stops being state at all — it is `history[history.length - 1]`,
computed fresh on every render, and therefore incapable of disagreeing with the
history.

That is the generalisable move: **keep the source, derive the view**. It also
generalises upward — the same reasoning gets you from "store the filtered list"
to "store the filter", and from "store the selected item" to "store the
selected id". Every derived value you store is a second copy that can go stale.

The immutability details matter here too. `previous.push(next)` mutates and
returns a length, so `setHistory(previous.push(next))` sets state to a number;
`[...previous, next]` builds a new array. `slice(0, -1)` returns a copy without
the last element, where `pop()` mutates and returns the element. If undo
"works" in your first attempt but the display does not update until you click
something else, mutation is the reason.

Finally, `disabled` on the Undo button is not just polish. A control that is
present, focusable and does nothing is worse than one that announces itself as
unavailable — and `disabled` is announced.

## review1 — clamping in the right place

Two buttons that differ by a sign is a hint that they should share one
function, and passing the step as an argument is the smallest way to do it.
The real content is *where* the clamp goes. Computing
`Math.min(max, temperature + 1)` outside the setter reads the snapshot, so two
clicks that land in the same batch both clamp against the same starting value.
Inside the updater you are handed the value the previous queued update
produced, so the clamp is applied to the truth.

This is the same lesson as ex2 wearing different clothes, which is why it is
the review exercise: any rule that reads current state to produce next state —
increment, clamp, toggle, append, "at most five" — belongs inside the updater.

## Further reading

- [react.dev — State: A Component's Memory](https://react.dev/learn/state-a-components-memory) — what `useState` actually gives you.
- [react.dev — State as a Snapshot](https://react.dev/learn/state-as-a-snapshot) and [Queueing a Series of State Updates](https://react.dev/learn/queueing-a-series-of-state-updates) — ex2 and ex4, explained by the people who built it.
- [react.dev — Updating Objects](https://react.dev/learn/updating-objects-in-state) and [Updating Arrays in State](https://react.dev/learn/updating-arrays-in-state) — the immutability cheat sheet the challenge needed.
- [react.dev — Choosing the State Structure](https://react.dev/learn/choosing-the-state-structure) — "keep the source, derive the view", at length.
- [MDN — `<output>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/output) — the element with `role="status"` built in.
- [MDN — `aria-pressed`](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-pressed) — toggle buttons, and how they differ from checkboxes and switches.
