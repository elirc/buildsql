# Reading — react/04_lists_conditional

## Notes

**Reconciliation, concretely.** When React re-renders a component it produces a
new tree of element descriptions and compares it with the previous one. The
comparison is deliberately shallow and fast, and it runs on two rules. First,
if the element *type* changed at a position — `<div>` became `<span>`, `Profile`
became `Settings` — React throws away that whole subtree and builds a new one,
state and all. Second, within a list of children it matches items up by `key`.
Everything about keys follows from that second rule.

**What "reuse" actually means.** When React decides two elements are the same
item, it keeps the existing DOM node and the existing component instance, and
updates only what changed. That means `useState` inside the row keeps its
value, the DOM node keeps its uncontrolled input value, its focus and its
scroll offset, and any running CSS transition continues. Those are exactly the
things that go wrong with a bad key, and they are also exactly the things a
naive test never checks — which is why the bug reaches production.

**When index keys are fine, honestly.** If the list is never reordered, never
filtered, never inserted into except at the end, and the items hold no state of
their own, an index key is harmless. That is a real set of conditions and a lot
of lists meet it. The reason the advice is stated as an absolute is that the
conditions are invisible at the call site and get violated a year later by
somebody adding a sort. Use the id when there is one; use an index knowingly,
and expect to be asked about it in an interview.

**The `key` is not a prop.** `key` is consumed by React and never appears in
`props`. If a component also needs the identifier — and it usually does — pass
it twice: `<Row key={row.id} id={row.id} />`. That surprises people; it follows
from `key` being part of how React addresses the element rather than part of
what the element is.

**Falsy is not the same as blank.** React's render rules treat `false`, `null`
and `undefined` as "nothing", and everything else as a value to display. So
`0`, `""` (invisible but present) and `NaN` all render. `&&` returns its
left operand when that operand is falsy, which is how the number `0` ends up on
the page. Reaching for a ternary (`cond ? <X/> : null`) sidesteps it entirely
and is the safer default when the condition is not obviously boolean.

## ex1 — `map`, and the warning nobody reads

Two things happen here that are worth separating. Rendering an array is not a
special React feature — an array of elements is a legal child, so any expression
that produces one works, including `.map()`, `Array.from`, or a literal.

The `key` requirement is React's, and its warning is one of the most-ignored
messages in front-end development because the app looks fine without it. The
gate checks for it deliberately: a warning you can see going red is a warning
you fix. Using the tag string itself as the key is correct here *because tags in
a tag list are unique* — that is a fact about the data, not a general licence to
key by content. Two people named Ada in a list of people would collide, and
React would render only one of them.

The other detail worth noticing: `key` goes on the outermost element returned
by the map callback, not on some element inside it. If your callback returns a
fragment and you need a key, the shorthand `<>` cannot take one; use
`<Fragment key={id}>`.

## ex2 — the exercise you will remember

This is the canonical demonstration, and the reason it works as a demonstration
is that the buggy version is *indistinguishable from the correct one* until the
list changes. The rows render, the labels are right, React logs no warning —
index keys satisfy the "you must supply a key" rule perfectly. What breaks is
identity.

Walk through it precisely. Before: keys `0 → Ada`, `1 → Lin`. The DOM node for
key `0` contains an input whose *DOM value* is `hello` (uncontrolled inputs are
owned by the browser, not by React). After prepending Zoe: keys `0 → Zoe`,
`1 → Ada`, `2 → Lin`. React matches key `0` to key `0`, decides that row simply
changed its name, and updates the label text and the input's `id` attribute in
place. It has no reason to touch `input.value` — nothing React manages changed
about it. So the text you typed is now sitting in Zoe's row, and Ada's row is a
freshly created node with an empty box.

With `key={person.id}`, React sees `zoe` has no counterpart (create it), and
`ada` and `lin` exist but have moved (move the nodes). Ada's DOM node — with
`hello` still inside it — moves down one position, and everything is where the
user left it.

The same mechanism destroys `useState` inside row components, kills focus while
someone is typing in a filtered list, and restarts animations. This exact
scenario, usually phrased "why shouldn't you use the array index as a key?", is
one of the two or three most common React interview questions, and the answer
that lands is the mechanical one above rather than "because it's bad practice".

## ex3 — three shapes of conditional, one trap

The early return is the right tool when the *whole component* has two modes,
and it keeps the main path un-nested. The ternary is right when two branches
both render something. `&&` is right when the choice is "render this or render
nothing" — and is where the trap lives.

`unreadCount && <Badge/>` is an expression whose value is `0` when
`unreadCount` is `0`, because `&&` returns the left operand rather than a
boolean. React then renders `0`, because `0` is a renderable value. The
canonical bug report is "a random zero appears next to my icon", and the fixes
in order of preference are: compare explicitly (`unreadCount > 0 &&`), coerce
(`Boolean(unreadCount) &&`), or use a ternary with `null`. `array.length &&` is
the same bug with a different variable name and is even more common.

Worth also noticing what the empty state is *for*. Rendering an empty `<ul>` is
technically correct and tells the user nothing — did it load? is it broken? An
empty state is a UI requirement, not a nicety, and it is where you say what
happened and what to do next.

## ex4 — deriving, and the mutation you did not intend

Sorting during render is the right instinct: the sorted list is a view of the
data, and storing it in state would create a second copy that can drift. The
danger is that JavaScript's two most useful array methods for this — `sort` and
`reverse` — are the two that mutate. `players.sort(...)` reorders the caller's
array and returns *the same array*, which means a component that "just
displays" data has quietly rewritten its parent's state. React will not warn;
the parent will simply start rendering in a different order for no visible
reason, and if the parent memoized on that array reference, it will not re-render
at all.

`[...players].sort(...)` copies first. (Modern JavaScript also offers
`toSorted()` and `toReversed()`, which return new arrays; they are available in
Node 20+ and every current browser, and they are worth knowing about.)

The comparator chain — `b.score - a.score || a.name.localeCompare(b.name)` — is
a small idiom worth having: a comparator returns `0` for "equal", `0` is falsy,
so `||` falls through to the tiebreaker. Deterministic tie-breaking is not
pedantry; without it, a leaderboard can render two orderings for the same data
depending on the engine's sort stability, and users notice things jumping
around.

## challenge — iterate the groups, not the items

The instinct is to loop over tasks and bucket them; the cleaner shape is to
loop over the *output structure* — the ordered list of groups — and ask the
data for each group's contents. That is what makes "always in this order" and
"skip empty groups" fall out for free instead of needing a sort afterwards.

Returning `null` from a `map` callback is legal and renders nothing, which is
how a group vanishes. An alternative is to `filter` the groups before mapping;
both are fine, and the second reads better once there is more than one reason
to skip.

Two nested maps means two key decisions, and they are independent: sibling keys
only need to be unique *among their own siblings*, so the inner lists never
collide with each other even if two groups contained tasks with the same title.
This is also the point where `filter(...).sort(...)` is safe without copying —
`filter` already handed you a new array.

## review1 — remove by identity

Everything in this exercise is a restatement of ex2 in a different register.
The handler is created inside the map, so it closes over the chip it belongs to
and can name it precisely; `filter` produces a new array so React sees a new
reference and re-renders; and removing by id rather than index means the
component keeps working when the list is sorted or filtered upstream.

The one new detail is `onClick={() => remove(chip.id)}`. That arrow creates a
new function on every render for every row, which is fine — creating a closure
is cheap, and this is the normal way to write it. It becomes worth thinking
about only when the row is a memoized component, which is exactly the situation
`11_performance_patterns` builds around.

## Further reading

- [react.dev — Rendering Lists](https://react.dev/learn/rendering-lists) — the map, the key rules, and the "where do I get an id" question.
- [react.dev — Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state) — the best explanation anywhere of what reconciliation actually preserves, and how to reset state deliberately with a key.
- [react.dev — Conditional Rendering](https://react.dev/learn/conditional-rendering) — including the `&&` trap, in the official words.
- [MDN — `Array.prototype.sort`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) — "sorts in place", stability, and the comparator contract.
- [MDN — `Array.prototype.toSorted`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/toSorted) — the non-mutating version, and where it is available.
- [MDN — Logical AND (`&&`)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_AND) — why it returns an operand rather than a boolean.
