# Reading — react/i1_interview_concepts

## Notes

This page is a bank of 55 questions with model answers, grouped by topic and
tagged ⭐ to ⭐⭐⭐ by how often they actually come up. Work it out loud, with
the answers covered, rather than reading it through — the skill being practised
is speaking, not recognising. Every question names the lesson that teaches it,
so anything you fumble converts directly into a lesson to redo. The ⭐⭐⭐
subset is about fifteen minutes and is the right thing to run through on the
morning of an interview.

## The question bank

### Rendering, JSX and reconciliation

**1. What is JSX, really?** ⭐⭐⭐ *(01_components_jsx)*
JSX is syntax sugar that a compiler rewrites into function calls — `<p id="x">hi</p>`
becomes roughly `jsx("p", { id: "x", children: "hi" })`, which returns a plain
object describing an element. Nothing is parsed at runtime and no DOM is created
until React commits. That is why JSX can be stored in a variable, returned from
a function or passed as a prop, and why attributes are camelCase JavaScript
property names (`className`, `htmlFor`).
*Follow-up: "so what is the difference between an element and a component?" — a
component is the function; an element is one object describing one invocation of
it, with particular props.*

**2. What is the virtual DOM?** ⭐⭐⭐ *(04_lists_conditional)*
It is the tree of those lightweight element objects. On a re-render React builds
a new tree, compares it with the previous one, and applies the minimal set of
real DOM operations. The value is not that it is faster than hand-written DOM
code — it is not — but that you get to describe the UI declaratively and let
React work out the transitions. Be careful not to oversell it: "the virtual DOM
is fast" is a red flag answer.
*Follow-up: "is it always faster than direct DOM manipulation?" — no; it is
usually fast enough, and the win is in maintainability.*

**3. What does reconciliation actually do?** ⭐⭐⭐ *(04_lists_conditional)*
It walks the old and new trees together, position by position. Two rules do most
of the work: if the element *type* at a position changed, the whole subtree is
thrown away and rebuilt from scratch — state and all; and within a list of
children, items are matched by `key`. Everything surprising about React state
disappearing or persisting comes from one of those two rules.
*Follow-up: "what happens to state when a component's type changes?" — it is
destroyed, because React unmounts the old instance.*

**4. Why does React re-render children when a parent re-renders?** ⭐⭐
*(11_performance_patterns)*
Because comparing props costs time and memory, and for most components the
comparison is more expensive than just re-running the function. React chose the
default that is right most of the time and made the opt-out explicit with
`memo`. Re-rendering is not repainting either — React still only touches the DOM
nodes that actually differ.
*Follow-up: "when is that default a problem?" — when render does expensive work,
or when a big subtree re-renders because of unrelated state.*

**5. Why must a component return a single root element?** ⭐ *(01_components_jsx)*
Because it is a function and a function returns one value. When you genuinely
need siblings with no wrapper — inside a `<dl>`, a `<tr>`, or a CSS grid — use a
fragment, `<>…</>`, which groups children and renders nothing itself.
*Follow-up: "how do you put a key on a fragment?" — use the long form,
`<Fragment key={id}>`; the shorthand cannot take one.*

**6. What does it mean that a component must be pure?** ⭐⭐ *(11_performance_patterns)*
Given the same props and state it must produce the same JSX, and it must not do
anything observable while rendering — no mutating props, no writing to
variables outside itself, no network calls, no DOM writes. Every optimisation
React ships is licensed by that purity: bailouts, memoization, concurrent
rendering, and Strict Mode's deliberate double-render in development.
*Follow-up: "why does React call my component twice in dev?" — to surface impure
renders.*

**7. Why do component names have to be capitalised?** ⭐ *(01_components_jsx)*
The compiler decides between "HTML tag" and "your component" by the first
character. `<header>` compiles to the string `"header"`; `<Header>` compiles to
a reference to the variable. A lowercase component name therefore fails silently
— React renders an unknown element and nothing appears.
*Follow-up: "what if the component is a property, like `obj.Thing`?" — dotted
names are always treated as components regardless of case.*

### State

**8. Why does calling `setCount(count + 1)` twice only add one?** ⭐⭐⭐ *(03_state_events)*
Because `count` is a snapshot of the render that created the handler; it does
not change while the handler runs. Both calls therefore enqueue "become 1", and
the second is identical to the first. Passing a function instead —
`setCount(c => c + 1)` — enqueues a *recipe*, and React applies the recipes in
order against the accumulating result.
*Follow-up: "when should you always use the updater form?" — whenever the next
state is computed from the current state.*

**9. What is batching, and what changed in React 18?** ⭐⭐ *(03_state_events)*
React collects every state update produced by one event and applies them
together, rendering once. Before React 18 that only applied inside React's own
event handlers, so updates inside `setTimeout` or a `.then` rendered
immediately and separately; React 18 made batching automatic everywhere.
*Follow-up: "how do you opt out?" — `flushSync`, which forces a synchronous
render and should be rare.*

**10. Why can't you mutate state directly?** ⭐⭐⭐ *(03_state_events)*
React decides whether anything changed by comparing the new value with the old
using `Object.is`. `items.push(x)` returns a length and leaves the reference
unchanged, so React concludes nothing happened and renders nothing. Replace
instead: `setItems(prev => [...prev, x])`.
*Follow-up: "what's the symptom of getting this wrong?" — a UI that only updates
when something else forces a render.*

**11. `useState` vs `useReducer` — how do you choose?** ⭐⭐ *(09_context_reducer)*
Not by how many fields. Reach for a reducer when the *transitions have rules* —
when one action changes several things together, when the same change is
triggered from several places, or when the logic is worth testing on its own.
A reducer is a pure function you can call directly in a test, and `dispatch` is
guaranteed stable, so it never needs to appear in a dependency array.
*Follow-up: "is `useReducer` faster?" — no; it is a structural choice, not a
performance one.*

**12. What is the lazy initialiser and when do you need it?** ⭐⭐ *(10_custom_hooks)*
`useState(() => expensive())` runs the function only on the first render;
`useState(expensive())` evaluates on every render and throws the result away.
Use it whenever the initial value costs something — parsing JSON out of
`localStorage`, building a large structure.
*Follow-up: "does the same apply to `useRef`?" — `useRef` has no lazy form, so
the usual trick is `if (ref.current === null) ref.current = create()`.*

**13. How do you reset a component's state when a prop changes?** ⭐⭐
*(04_lists_conditional)*
Give it a different `key`. Changing the key makes React unmount the old
instance and mount a fresh one, which is a complete, honest reset. The
alternative people reach for — an effect that watches the prop and calls setters
— renders twice and is easy to get subtly wrong.
*Follow-up: "when is the effect version right?" — when only part of the state
should reset.*

**14. What state should you not store?** ⭐⭐ *(03_state_events)*
Anything you can compute during render from props or other state: a filtered
list, a total, whether the form is valid. Every derived value you store is a
second copy that can go stale, and keeping it in step is work you took on for
nothing. Store the source; derive the view.
*Follow-up: "what about expensive derivations?" — compute them during render and
wrap in `useMemo` if profiling says so.*

**15. What is "lifting state up"?** ⭐⭐ *(11_performance_patterns)*
Moving a piece of state to the nearest common ancestor of the components that
need it, then passing the value down and a callback up. It is the standard fix
for two siblings that must agree. The counter-move matters just as much: state
that only one subtree uses should be pushed *down* into it, so unrelated
siblings stop re-rendering.
*Follow-up: "what's the cost of lifting?" — everything under the new owner
re-renders on every change.*

### Props, composition and structure

**16. What is prop drilling and what are the fixes, in order?** ⭐⭐ *(09_context_reducer)*
Passing a prop through components that do not use it. In order of preference:
restructure so the data is nearer its consumer; pass JSX down as `children`,
which frequently deletes the problem entirely; then context; then a store. The
common mistake is jumping to a global store first.
*Follow-up: "is two levels of drilling a problem?" — no; it is normal and
explicit.*

**17. Composition versus configuration — what's the difference?** ⭐⭐ *(02_props_composition)*
Configuration is `<Card hasFooter footerText="Save" />`; composition is
`<Card footer={<button>Save</button>} />`. Configuration works until somebody
wants two buttons and an icon, at which point you are in the business of
predicting everything callers might want. Composition never has that problem
because the component was never describing the content.
*Follow-up: "when is a config prop right?" — when it is a decision the component
owns, like `max` or `variant`.*

**18. Why should a wrapper component spread `...rest`?** ⭐ *(02_props_composition)*
Because swallowing props people expect — `className`, `aria-*`, `data-*`,
`onBlur`, `ref` — is how design-system components get forked. `...rest` is a
one-line insurance policy, and spread order decides whether callers can override
your defaults.
*Follow-up: "what breaks if you spread unknown props onto a DOM element?" —
React warns about unrecognised attributes.*

**19. Why are props read-only?** ⭐⭐ *(02_props_composition)*
Because data flows one way: a child cannot rewrite its parent's variables any
more than a function can rewrite its caller's. Mutating a prop object often
appears to work and then fails invisibly — another holder of the same object
sees the change with no re-render, or a memoized child skips an update because
the reference did not change.
*Follow-up: "how does a child change something above it?" — the parent passes a
function down.*

**20. What is `children` and is it special?** ⭐⭐ *(02_props_composition)*
It is an ordinary prop with syntax: whatever sits between a component's tags is
put on the props object under that name. `<Box children={<p/>} />` is legal and
identical. It is typed `ReactNode`, which covers elements, strings, numbers,
arrays, `null`, `undefined` and `false`.
*Follow-up: "what about `React.Children` and `cloneElement`?" — legacy; they
couple you to the exact shape callers pass.*

### Lists and keys

**21. Why do lists need keys?** ⭐⭐⭐ *(04_lists_conditional)*
So React can tell which item is which between renders. Keys decide which DOM
nodes and component instances are reused, moved, created or destroyed — and
therefore which pieces of state, focus and uncontrolled input values survive a
reorder. Without them React falls back to position and warns.
*Follow-up: "unique where?" — among siblings, not globally.*

**22. Why is the array index a bad key?** ⭐⭐⭐ *(04_lists_conditional)*
Because position is not identity. Prepend an item and every index now points at
a different thing, so React concludes row 0 is the same row with new text and
*reuses its DOM node* — updating what it manages (text, attributes) and leaving
what the DOM manages (an uncontrolled input's value, focus, scroll) attached to
the wrong item. The correct answer names that mechanism rather than saying "it's
bad practice".
*Follow-up: "when is an index key fine?" — a list that never reorders, filters
or inserts except at the end, whose items hold no state.*

**23. Why not `key={Math.random()}`?** ⭐⭐ *(04_lists_conditional)*
It is unique but not stable, so every render looks like a completely new set of
items. React destroys and rebuilds the entire list every time, losing state and
focus and doing the maximum possible work.
*Follow-up: "where should an id come from when the data has none?" — generate it
where the item is created, not during render.*

**24. Is `key` a prop?** ⭐ *(04_lists_conditional)*
No. React consumes it and it never appears in `props`. If the component also
needs the identifier, pass it twice: `<Row key={row.id} id={row.id} />`.
*Follow-up: "what else is like that?" — `ref` was, until React 19 made it a
normal prop for function components.*

**25. Why does `{count && <Badge/>}` sometimes render a `0`?** ⭐⭐⭐
*(04_lists_conditional)*
Because `&&` returns its left operand when that operand is falsy, and React
renders `0` — it only skips `false`, `null` and `undefined`. `0`, `""` and `NaN`
are falsy but perfectly renderable. Fix by making the left side a real boolean:
`count > 0 && …`.
*Follow-up: "what about `items.length &&`?" — same bug, more common.*

### Effects

**26. What is `useEffect` for?** ⭐⭐⭐ *(06_effects)*
Synchronising your component with something outside React — the document, a
subscription, a timer, a server. The framing matters, because it answers most
"should this be an effect" questions on its own: if there is no external system,
there is probably no effect.
*Follow-up: "name three things people put in effects that shouldn't be" —
deriving data for rendering, resetting state on a prop change, and reacting to a
user event.*

**27. Explain the dependency array honestly.** ⭐⭐⭐ *(06_effects)*
It is a claim: "this effect reads exactly these values, and if none of them
changed, running it again would produce the same result." Omitted means run
after every render; `[]` means run once on mount; `[a, b]` means re-run when `a`
or `b` changes by `Object.is`. Every value from inside the component that the
effect reads belongs in it.
*Follow-up: "what happens if you lie?" — either a stale closure or an infinite
loop.*

**28. What is a stale closure?** ⭐⭐⭐ *(06_effects)*
A function created during one render that keeps reading that render's props and
state forever. The classic is `setInterval(() => setCount(count + 1), 1000)`
with `[]` deps: the callback captured `count` at `0`, so every tick computes
`0 + 1` and the counter freezes at 1. The fix is usually to stop reading the
value — `setCount(c => c + 1)` describes a change instead of capturing a value.
*Follow-up: "what would adding `count` to the deps cost?" — the interval is
destroyed and recreated every second, so the cadence drifts.*

**29. When does a cleanup function run?** ⭐⭐ *(06_effects)*
Before every re-run of the effect, and once more on unmount. The cleanup belongs
to the render that created it, so it closes over that render's values — which is
why the cleanup for a `Saved` message clears `Saved`, not the new one.
*Follow-up: "so is it the unmount handler?" — no; it is the undo for one
particular run.*

**30. Why does React run effects twice in development?** ⭐⭐ *(06_effects)*
Strict Mode mounts, runs effects, runs cleanups, and runs effects again, to
prove your effect can be run twice safely. An effect that opens something and
never closes it fails that test — which is exactly the bug it is designed to
surface.
*Follow-up: "how do you fix a double-fetch on mount?" — write the cleanup that
ignores or aborts the first request; do not add a ref guard.*

**31. `useEffect` vs `useLayoutEffect`?** ⭐⭐ *(06_effects)*
Both run after the commit; `useLayoutEffect` runs *before* the browser paints
and blocks it. Use it only when you must measure and adjust the DOM without the
user seeing an intermediate state — positioning a tooltip, preventing a scroll
jump. Default to `useEffect`; a visible flicker is the signal to switch.
*Follow-up: "what's the downside?" — it blocks painting, and it does not run on
the server.*

**32. Should this go in an effect or an event handler?** ⭐⭐⭐ *(06_effects)*
If it happened *because the user did a specific thing*, it belongs in the
handler — sending analytics, POSTing a form, showing a toast. If it is about
keeping something in sync with the current state, whoever caused it, it is an
effect. Putting event logic in an effect makes it fire in situations you did not
intend, such as a remount.
*Follow-up: "where does 'fetch when the id changes' go?" — an effect, because
the id can change for reasons other than a click.*

**33. What is the exhaustive-deps lint rule and should you disable it?** ⭐⭐
*(06_effects)*
It statically works out what your effect reads and requires those values in the
array. It is essentially never wrong about what is read, though it can be wrong
about what you *want* — and the right response then is to change the code, not
to silence the rule. Every codebase littered with disable comments has an
undiscovered stale-closure bug.
*Follow-up: "how do you avoid needing a dependency?" — updater functions, refs,
or moving the value out of the component.*

### Data fetching

**34. Walk me through fetching data in a component.** ⭐⭐⭐ *(07_data_fetching)*
Three states, not one: loading, success and error, all of which the user must be
able to see. Kick the request off in an effect keyed on whatever identifies it,
store the result in state, and stop the spinner on both paths — `.finally` makes
that hard to forget. A component that renders only its happy path shows a blank
box on a slow connection and forever on a 500.
*Follow-up: "what's missing from that?" — cancellation and races.*

**35. What is the race condition in data fetching?** ⭐⭐⭐ *(07_data_fetching)*
Two requests in flight, and the slower one answers last. Render with id 1, then
id 2; request 2 resolves and shows the right thing; request 1 resolves later and
overwrites it with data nobody asked for. Nothing about React is wrong — the
`.then` was scheduled before the effect was cleaned up, and promises cannot be
un-started.
*Follow-up: "how do you fix it?" — see the next question.*

**36. How do you fix it?** ⭐⭐⭐ *(07_data_fetching)*
A flag declared *inside* the effect body, checked before setting state, flipped
by the cleanup — so each effect run retires only its own request. Where the
transport supports it, `AbortController` is better because it actually stops the
work and frees the connection. The two compose: abort what you can, ignore what
you cannot.
*Follow-up: "why not a `useRef` for the flag?" — one ref is shared by every
effect run, so retiring the old request would retire the new one too.*

**37. Why is it better to inject the fetcher than to import it?** ⭐ *(07_data_fetching)*
Because the component then states what it needs — "something that turns an id
into a promise of a user" — rather than naming an implementation. It becomes
testable with no network and no mocking library, and reusable against a cache, a
different backend or a fixture.
*Follow-up: "how do you keep the injected function stable?" — define it outside
the component or wrap it in `useCallback`.*

**38. Why would you use TanStack Query or SWR instead?** ⭐⭐ *(10_custom_hooks)*
Because hand-rolled fetching gives you loading, error and data, and nothing
else. Those libraries add caching by key, request deduplication, retries,
revalidation on focus and reconnect, pagination and optimistic updates — all of
which you would otherwise reimplement badly. The decision is an engineering one:
you should be able to name exactly which of those you need.
*Follow-up: "is that state management?" — it is *server* state, which has
different rules from client state and is why the split exists.*

**39. What does `AbortController` actually do?** ⭐ *(07_data_fetching)*
It signals the underlying operation to stop. `fetch` opts into it and rejects
the promise with an `AbortError` — so the promise is not "cancelled", it is
rejected, and you have to remember not to display that rejection as an error.
*Follow-up: "does it work with any promise?" — no, only with APIs that accept a
signal.*

### Hooks: rules and custom hooks

**40. State the rules of hooks and say why they exist.** ⭐⭐⭐ *(10_custom_hooks)*
Call hooks only at the top level — never in a condition, a loop, a callback, or
after an early return — and only from components or other hooks. The reason is
mechanical: React stores hook state in a list per component instance and matches
each call to a slot by call order, so a render that skips a hook shifts every
later hook by one.
*Follow-up: "how do you do something conditionally, then?" — put the condition
inside the hook, or split into two components.*

**41. What is a custom hook?** ⭐⭐⭐ *(10_custom_hooks)*
A function whose name starts with `use` and which calls other hooks. There is no
machinery: the state it creates belongs to the calling component's hook list, so
two components calling `useToggle()` get two independent toggles. It shares
*logic*, never a value.
*Follow-up: "how would you share a value?" — context, or a store.*

**42. Why does the `use` prefix matter?** ⭐⭐ *(10_custom_hooks)*
It is how the lint rules decide which functions may contain hooks and which call
sites are legal. Naming a hook `getSomething` silently turns off all of that
checking.
*Follow-up: "what about React 19's `use()`?" — a built-in for reading promises
and context that, unusually, may be called conditionally.*

**43. Why should a custom hook return stable functions?** ⭐⭐ *(10_custom_hooks)*
Because a consumer who correctly puts your returned function in a dependency
array cannot fix its identity from the outside. If it is new on every render,
their effect runs on every render forever. Wrap returned callbacks in
`useCallback`; setters and `dispatch` are already stable.
*Follow-up: "how do you test a hook?" — `renderHook`, asserting on the return
value, which is its public API.*

**44. Explain a debounce, and how it differs from a throttle.** ⭐⭐ *(10_custom_hooks)*
Debounce waits for a pause and fires once at the end — right for
search-as-you-type, autosave and validation. Throttle fires at most once per
interval regardless of pauses — right for scroll and resize. In React, a
debounce is an effect that `setTimeout`s the new value and whose cleanup clears
the pending timer; the cleanup *is* the debounce.
*Follow-up: "does debouncing fix the race condition?" — no, it reduces how often
it happens; you still need the guard.*

**45. What is `useRef` for?** ⭐⭐⭐ *(08_refs_dom)*
Two jobs. A ref attached to a JSX element gives you the DOM node, for the
imperative things you cannot describe — focus, scroll, measure, play. And a ref
is a box that survives re-renders without causing them, for values nothing
renders from: timer ids, the previous value of a prop, an instance of a non-React
library. The rule: if changing it should change the screen, it is state.
*Follow-up: "why shouldn't you read a ref during render?" — React may render
without committing, so the value may be from a render that never happened.*

### Context and state management

**46. What is context, and what is it not?** ⭐⭐⭐ *(09_context_reducer)*
It is a lookup: `useContext(C)` walks up the tree and returns the value of the
nearest provider. It holds nothing itself — the state lives in whatever
component renders the provider. It is not a state manager: no selectors, no
caching, no devtools, and every consumer re-renders when the value changes.
*Follow-up: "so when is it right?" — values that are tree-wide and change
rarely: theme, locale, current user, dispatch.*

**47. Why is `value={{ user, logout }}` a bug?** ⭐⭐ *(09_context_reducer)*
It is a new object on every render of the provider, so `Object.is` always fails
and every consumer re-renders even when nothing changed. `useMemo` it, or split
into two contexts — one for the value and one for the stable `dispatch`, so
components that only dispatch never re-render at all.
*Follow-up: "does `memo` on the consumer help?" — no; memo compares props, and
context is not a prop.*

**48. How do you make a context impossible to misuse?** ⭐⭐ *(09_context_reducer)*
Default it to `null`, export a `useThing()` hook that throws a named error when
the value is `null`, and do not export the context object. A missing provider
becomes a loud error naming what to add, instead of a component that silently
renders a plausible default — and TypeScript narrows the value for every
consumer for free.
*Follow-up: "what does the default argument to `createContext` actually mean?" —
the value when there is no provider, not an initial value.*

**49. When do you reach for Redux/Zustand/Jotai?** ⭐⭐ *(09_context_reducer)*
When client state is large, frequently changing, and read by many components in
different parts of the tree — because those libraries let a component subscribe
to a *slice*, which context cannot do. If the state in question is really server
data, a data-fetching library is the better answer.
*Follow-up: "could you build a simple store yourself?" — yes, with
`useSyncExternalStore`.*

### Performance

**50. What does `memo` compare, and when does it do nothing?** ⭐⭐⭐
*(11_performance_patterns)*
It compares props shallowly, each with `Object.is`, and skips the render when
they all match. It does nothing when a prop is rebuilt every render — an inline
arrow, an object literal, an array literal — because those are new references
every time. It also does not prevent re-renders caused by the component's own
state or by a context it reads.
*Follow-up: "so what does memo cost when it fails?" — a comparison on every
render plus the render you did not avoid.*

**51. `useMemo` and `useCallback` — when are they worth it?** ⭐⭐⭐
*(11_performance_patterns)*
When the computation is genuinely expensive, or when the identity matters to
something else — a memoized child's props, an effect's dependency array, a
custom hook's return value. `useCallback(fn, deps)` is exactly
`useMemo(() => fn, deps)`. Memoizing a handler passed to a plain `<button>`
buys nothing, because DOM elements do not compare props.
*Follow-up: "what's the cost of memoizing everything?" — a wrong dependency
array is a correctness bug, not a slow one.*

**52. A search box is making a big table janky. What do you do?** ⭐⭐
*(11_performance_patterns)*
Profile first, then look at structure before memoization. Usually the input's
state lives too high, so every keystroke re-renders the table; moving that state
down into its own component fixes it with no memo, no comparison and nothing to
keep stable. If the table itself is the cost, memoize the rows — and if there are
tens of thousands, virtualise so only the visible ones exist.
*Follow-up: "what does `useDeferredValue` do here?" — it lets the expensive list
lag behind the input without blocking typing.*

**53. What is the React Compiler?** ⭐ *(11_performance_patterns)*
A build-time tool that inserts the equivalent of `memo`, `useMemo` and
`useCallback` automatically where it can prove it is safe. It is a strong signal
about how much manual memoization is mechanical bookkeeping — and it only works
on code that follows the rules of hooks and does not mutate props or state.
*Follow-up: "does it mean you can stop understanding this?" — no; you still have
to read profiles and design structure.*

### Modern React, awareness level

**54. What is Suspense?** ⭐⭐ *(awareness)*
A boundary that lets a component "suspend" while something it needs is not
ready, and renders a fallback in the meantime — so loading states move from
inside each component to a boundary that covers a region. With `lazy()` it does
code splitting; with a data source that integrates with it, or React 19's
`use()`, it does data. It does not make anything faster; it changes where waiting
is expressed.
*Follow-up: "how does an error boundary relate?" — the same idea for failures,
and it must be a class component or a library.*

**55. What are server components, in one paragraph?** ⭐⭐ *(awareness)*
Components that run on the server, never ship to the browser, and can read from
a database or the filesystem directly. They render to a description the client
merges into the tree, which cuts bundle size and removes a round trip. They
cannot use state, effects or event handlers — anything interactive is a client
component marked `"use client"`.
*Follow-up: "how do the two compose?" — server components can render client
components and pass them serialisable props, but not the other way round.*

## ex1 — the stale-closure counter

This is the single most-asked React debugging question, and it is asked because
answering it well requires understanding closures, effect dependencies and the
update queue at once. The mechanism, said out loud: the arrow function handed to
`setInterval` was created during the first render; it captured that render's
`count`, which was `0`; the effect's empty dependency array means it never runs
again, so the interval is never rebuilt with a fresh closure; every tick
therefore calls `setCount(0 + 1)`; after the first tick, state is already `1` and
React bails out of an identical update.

The two fixes are both worth naming, and the reason to prefer one is worth more
than the fix itself. Adding `count` to the dependency array works — the effect
re-runs after each tick with a new closure — but tears down and recreates the
interval every second, so the timing drifts and any partial second is lost. The
updater form works better because it removes the capture entirely: the callback
no longer reads state, it describes a change to it, so the effect's honest
dependency list stays `[running]` or `[]`.

The generalisation to offer unprompted: when a dependency array feels like a
fight, the effect is usually *reading* a value it should have been *describing*.

## ex2 — index keys, again and cold

Lesson 04 introduced this; here it arrives with no warning and a slightly
different shape, which is how it arrives in an interview. Sorting is more
convincing than prepending because it makes the point that any reordering
breaks index keys, not just insertion at the front.

The full answer names three things. What React does: matches children by key, so
key `0` before and key `0` after are "the same row", and it reuses that DOM node
and updates the text and attributes on it. What survives incorrectly: everything
the *DOM* owns rather than React — an uncontrolled input's value, focus,
selection, scroll position, playing media, in-progress CSS transitions — plus
any `useState` inside a row component. Why no warning appears: index keys
satisfy the "you must supply a key" rule perfectly; they are unique and present,
just meaningless.

Be ready for the honest nuance, because good interviewers probe it: index keys
are genuinely fine for a list that never reorders, never filters, only appends,
and whose rows hold no state. The reason the advice is stated absolutely is that
those conditions are invisible at the call site and get violated a year later by
someone adding a sort.

## ex3 — controlled versus uncontrolled

The tell in this bug is the character counter: it updates correctly, so React
plainly knows the text. That proves the state is not the problem, and points at
the question of *who renders the value*. `defaultValue` is read once, when React
creates the DOM node; after that the browser owns `input.value` and React never
writes to it again. The state has become a copy that the change handler happens
to keep in step — and a copy can be changed independently, which is exactly what
Reset did.

Switching to `value` inverts the relationship: the input renders state on every
render, so the only way its contents can change is through state. That is what
"controlled" means, and it is why controlled inputs make live validation,
character counts, dependent fields, formatting-as-you-type and disabled submit
buttons all trivial.

The follow-up is always the same and deserves a real answer rather than
"controlled is better". Uncontrolled inputs are the right choice for large forms
where a re-render per keystroke is measurable, for integrating a non-React
widget, and for simple forms you read once on submit — where `FormData` on the
submitted form is genuinely simpler than a dozen `useState` calls. React 19's
form actions lean into that.

## ex4 — the effect that should not exist

The bug is invisible in the final output, which is what makes it a good
interview question: the component "works". What it does badly is render twice
for every change — once with `total` at its previous value, once with the real
one — so the user sees `Total: 0` for a frame, and on a slow device for several.
Under Strict Mode it is even louder.

The diagnosis that scores is the question rather than the fix: *is this
synchronising with an external system?* Summing numbers you were handed is not.
So the state and the effect both go, and `total` becomes a plain `const`
computed during render — which cannot be stale, cannot be half-updated, and
cannot disagree with the items, because there is nothing left to keep in step.

This is the most common unnecessary-effect shape, and it generalises: an effect
whose only job is `setState` from props or other state is almost always a
calculation in disguise. The related shapes worth being able to name are
resetting state when a prop changes (use a `key`), notifying a parent about a
state change (call the callback in the same handler), and initialising state
from props (use the initial value, or a key).

## review1 — two defects that compound

Interviewers often hand you a small effect and ask what you would change, and
this one has two problems that are worse together than apart. No dependency
array means the effect runs after every render; no cleanup means nothing is ever
removed. So render three times and three listeners are attached, and one
keystroke fires the handler three times. That is a leak that gets *worse* the
longer the component lives, which is the version that reaches production and
looks like a mysterious duplicate-submit bug.

The complete fix is a cleanup that calls `removeEventListener`, plus a
dependency array. Two details are worth saying while you write them. The handler
must be declared inside the effect, because `removeEventListener` matches on
function identity and a new arrow would remove nothing. And the array should
contain `onSave`, which means the subscription is torn down and re-established
whenever the parent passes a new function — cheap for a DOM listener, and the
sort of thing you would think harder about for a WebSocket.

The follow-up worth pre-empting: "does it matter that this re-subscribes when
`onSave` changes?" The honest answer is that it usually does not, that the
alternative of omitting it gives you a stale callback, and that the pattern for
"always call the latest without re-subscribing" is to keep the callback in a ref
updated by its own effect — the problem React's `useEffectEvent` is designed to
solve.

## Further reading

- [react.dev — Describing the UI](https://react.dev/learn/describing-the-ui) and [Adding Interactivity](https://react.dev/learn/adding-interactivity) — the two chapters that cover most of the ⭐⭐⭐ questions.
- [react.dev — You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) — ex4, and half the effect questions in the bank.
- [react.dev — Preserving and Resetting State](https://react.dev/learn/preserving-and-resetting-state) — reconciliation, keys, and resetting by key.
- [react.dev — Separating Events from Effects](https://react.dev/learn/separating-events-from-effects) — the question 32 material, in depth.
- [react.dev — Suspense](https://react.dev/reference/react/Suspense) and [Server Components](https://react.dev/reference/rsc/server-components) — the awareness-level questions.
- [MDN — Closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures) — the JavaScript underneath every stale-closure question.
