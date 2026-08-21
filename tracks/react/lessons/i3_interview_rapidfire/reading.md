# Reading — react/i3_interview_rapidfire

## Notes

The five rounds here are the ⭐⭐⭐ concepts from `i1_interview_concepts`
re-dressed, and re-dressing is the whole design. A concept you can only
recognise in the example you first met it in has not been learned; it has been
memorised. Every round is marked for the spaced-review ladder, so `dojo review`
brings them back at 3, 7, 21 and 60 days — which is the mechanism that turns
this from a course you finished into knowledge you still have in October. Aim to
diagnose each one by reading before you run the gate.

## ex1 — keys control component instances, not just DOM nodes

Lesson 04 demonstrated index keys with an uncontrolled `<input>`, and it is easy
to come away thinking the problem is about the DOM: React reuses a node, the
browser-owned value stays behind. This round moves the state into a `useState`
inside the row component and the bug is identical — which tells you the rule is
one level up. Keys decide which **component instances** React considers to be
the same thing across renders, and an instance carries its whole hook list with
it.

So the list of things that go to the wrong row with a bad key is longer than
people expect: `useState` and `useReducer` values, refs, running effects and
their cleanups, uncontrolled input values, focus, selection, scroll position,
in-flight CSS transitions, and playing media. Any of those is a symptom.

The follow-up in hint 3 is worth rehearsing because it inverts the lesson.
Everything above describes keys *preserving* state you wanted preserved. The
same mechanism is the cleanest way to **destroy** state you want destroyed:
`<Editor key={documentId} />` gives every document a fresh editor, with no
effect watching a prop and calling setters. React's own documentation
recommends it, and candidates who reach for it unprompted stand out.

## ex2 — the four things an effect owes a subscription

This is the effect lifecycle with nowhere to hide. Subscribe on mount;
unsubscribe and resubscribe when the identity of the thing you are subscribed to
changes; unsubscribe on unmount; and do nothing at all when something unrelated
re-renders. A missing dependency array breaks the fourth, a missing cleanup
breaks the second and third.

The assertion that repays study is the one checking *which* channel is
unsubscribed. When the channel goes from `news` to `sport`, React runs the
cleanup created by the `news` render — which closed over `news` — before running
the new effect. You do not have to arrange that; it falls out of the cleanup and
its effect belonging to the same render. Once that clicks, a lot of effect code
stops being surprising: a cleanup closes *its own* socket, cancels *its own*
request, clears *its own* timer.

The dependency array here is `[channel, onSubscribe, onUnsubscribe]`, and the
two function props are where an interviewer will push. Including them is
correct: if the parent passed different functions and you had omitted them, the
effect would keep calling the old ones forever. The cost is that a parent
defining those inline re-subscribes on every render — cheap for a fake, ruinous
for a WebSocket — and the fix belongs in the parent (`useCallback`, or hoisting
the function), not in a shortened array. Being able to describe both sides of
that trade is the answer they are listening for.

## ex3 — one queue, one render

Two ⭐⭐⭐ ideas in eight lines. The first is that `count` is a `const` belonging
to the render that created the handler, so three calls to `setCount(count + 1)`
are the same instruction three times. Passing a function enqueues a recipe
instead of a value, and React applies the recipes in order against the
accumulating result.

The second is the render count, which is not something you fix — it is something
to notice. Three state updates inside one event produce **one** render, because
React collects everything the event produced and applies it in a single pass.
That guarantee is why splitting state into several `useState` calls is free, and
why you cannot observe a half-updated component.

Two follow-ups worth having. *"Was that always true?"* No — before React 18,
batching applied only inside React's own event handlers, so two updates inside a
`setTimeout` or a `.then` rendered twice; React 18 made it automatic everywhere.
*"How would you opt out?"* `flushSync`, which forces a synchronous render and is
a last resort for things like measuring the DOM between two updates.

## ex4 — the prop that makes memo impossible

`memo` compares props shallowly with `Object.is`. `{ padding: 8 }` written in
the render body allocates a new object every render: same contents, different
identity, comparison fails, child renders — and you have paid for a comparison
on top of the render you did not avoid. That is strictly worse than not
memoizing at all, which is the sentence to say out loud.

The family of props that do this is worth being able to list on demand:
`style={{…}}`, `items={[…]}`, `onClick={() => …}`, `config={{…}}`, and anything
built by a `.map()` or a `.filter()` in the render body. Each is a new reference
every time.

The fixes, in order of preference. If the value never varies, hoist it out of
the component so it is created once for the module — that is what the reference
does, and it costs nothing. If it depends on props or state, `useMemo` for
values and `useCallback` for functions. If the object is only ever passed to a
DOM element rather than a memoized component, do nothing at all: DOM elements
do not compare props, so the allocation is trivial and the memoization would be
pure ceremony.

The senior-level observation: a memoized component's effectiveness depends on
callers it cannot control, which means `memo` is a contract between two files.
That is a real argument for measuring with the Profiler rather than sprinkling,
and for the React Compiler, which does this bookkeeping mechanically.

## review1 — the two conditional-rendering mistakes

The stray zero is one of the most-reported React bugs in existence, and the
explanation is one sentence: `&&` returns its left operand when that operand is
falsy, and React renders `0` because it only skips `false`, `null` and
`undefined`. `0`, `""` and `NaN` are falsy in JavaScript and perfectly
renderable. `items.length && <List/>` is the same bug and is even more common.

Three fixes exist and they are not equal. `count > 0 && …` is the clearest
because it says what you meant. `Boolean(count) && …` works and reads like an
apology. `count ? <Badge/> : null` sidesteps the operator entirely and is the
safer default when the condition is not obviously boolean — which is why some
teams ban `&&` in JSX outright.

The empty state is the other half, and it is a product requirement rather than a
React one. An empty `<ul>` is technically correct and tells the user nothing:
did it load, is it broken, is there a filter on? An empty state says what
happened and, ideally, what to do next. Interviewers who have shipped products
notice when a candidate adds one without being asked, and notice when they do
not.

## Further reading

- [react.dev — Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state) — ex1, including resetting state deliberately with a key.
- [react.dev — Lifecycle of Reactive Effects](https://react.dev/learn/lifecycle-of-reactive-effects) — ex2, subscription by subscription.
- [react.dev — Queueing a Series of State Updates](https://react.dev/learn/queueing-a-series-of-state-updates) — ex3, with the queue drawn out.
- [react.dev — `memo`](https://react.dev/reference/react/memo) — ex4, including "should you add memo everywhere?".
- [react.dev — Conditional Rendering](https://react.dev/learn/conditional-rendering) — the `&&` trap, in the official words.
- [MDN — Logical AND (`&&`)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Logical_AND) — why it returns an operand rather than a boolean.
