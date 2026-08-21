# Reading — react/10_custom_hooks

## Notes

**A custom hook is inlined, conceptually.** When `Widget` calls
`useOnlineStatus()`, the `useState` inside it takes a slot in *Widget's* hook
list. The hook function has no identity of its own at runtime — it is not an
object, not an instance, and it holds nothing between calls. That single fact
answers most beginner questions: two components do not share a hook's state,
calling a hook twice in one component gives two independent copies, and a hook
cannot be called outside a render.

**The `use` prefix is a contract with tooling.** ESLint's rules-of-hooks plugin
decides whether a function may contain hook calls by looking at its name, and
whether a call site is legal by the same rule. Naming a hook `getOnlineStatus`
disables all of that checking silently. React 19 added a separate `use()` API
for reading promises and contexts, which — unusually — *may* be called
conditionally; it is a built-in, not a naming convention, and does not change
the rules for your own hooks.

**Extract for meaning, not for line count.** The good reasons to make a custom
hook: the logic appears in more than one component, the logic has a name, or a
component has become a pile of unrelated effects that would each be clearer
alone. The bad reason is "this component is long" — a hook that exists only to
move lines elsewhere leaves you with two places to look and no new concept.

**Return stable identities.** Anything a consumer might put in a dependency
array — functions, objects, arrays — should be memoized inside the hook, because
the consumer has no way to fix it from outside. `useState` setters and
`useReducer` dispatchers are stable by guarantee; everything you build yourself
is not, until you say so.

**Hooks and testing.** `renderHook` is the honest way to test a hook: it renders
a minimal component, calls the hook, and exposes the return value. That is not
"testing implementation details" — the return value is the hook's entire public
API, in the same way a function's return value is. What *would* be
implementation-testing is asserting on how many `useState` calls it made.

## ex1 — the smallest possible extraction

`useToggle` is barely worth extracting for its own sake — its whole body is one
`useState` and one updater — but it is exactly the right size to isolate the two
decisions that matter in every hook you will write.

The first is **the shape of the return value**. A tuple works here because the
convention is already established by `useState`, and because tuples let callers
rename freely: `const [isOpen, toggleOpen] = useToggle()` reads better than
destructuring an object and aliasing. Once you get to three or four values,
switch to an object; positional arguments stop being memorable somewhere around
three.

The second is **function stability**, and it is the one that catches people. A
consumer writing `useEffect(() => { … }, [toggle])` is doing the right thing —
the linter told them to — and if your hook hands back a new `toggle` on every
render, their effect runs on every render forever. They cannot fix it from their
side. This is why library hooks are so careful about identity, and why
`useCallback` in a *hook* is a correctness concern rather than the performance
tweak it usually is inside a component.

Note that the empty dependency array is only correct because the body uses the
updater form. A `toggle` written as `() => setOn(!on)` reads `on` from the
render, so it would need `[on]` in the array and would change identity on every
flip — the same "describe the change rather than capture the value" move from
lesson 03, now paying a second dividend.

## ex2 — lazy initial state, and the flash you avoid

The interesting line is `useState(() => …)`. Passing a *function* to `useState`
makes React call it only on the first render of that component instance;
passing a value evaluates that expression on every render and throws the result
away. For `useState(0)` the waste is nothing. For
`useState(JSON.parse(localStorage.getItem(key)))` it is a synchronous storage
read and a parse on every keystroke of an unrelated field.

Reading during initial state rather than in an effect also removes a visible
defect. The effect version renders once with the default, then re-renders with
the stored value — so a user with dark mode saved sees a white flash on every
page load. Storage is synchronous, so there is no reason to pay that.

Two failure modes the reference handles that people usually forget.
`localStorage.getItem` returns `null` for a missing key, and `JSON.parse(null)`
returns `null` rather than throwing — so without an explicit check you get
`null` where you wanted your default. And stored data can be corrupt (a schema
change, a half-written value, a user editing devtools), so the `try/catch` is
not paranoia; a thrown error during initial state takes the whole app down.

What this hook deliberately does not do, and what a production version needs:
listen for the `storage` event so two tabs stay in sync, handle
`localStorage` being unavailable (Safari private mode used to throw on write,
and some corporate policies block it), and cope with server-side rendering,
where `localStorage` does not exist at all.

## ex3 — the cleanup *is* the debounce

Nearly everyone writes the `setTimeout` and forgets the `clearTimeout`, and the
result is not "no debounce" but something stranger: every intermediate value
arrives, each one 300ms late, in order. The box appears to work and then floods
the network on the next slow connection.

The mechanism is worth stating precisely. React runs the previous effect's
cleanup before running the next effect. So when `value` changes: cancel the
timer scheduled by the previous value, schedule a new one. A value that changes
faster than `delay` never gets its timer to fire, which is exactly the
definition of debouncing. You are not implementing a queue or comparing
timestamps; the effect lifecycle already has the semantics.

Debounce versus throttle is a standard interview follow-up. Debounce waits for a
pause and fires once at the end — right for search-as-you-type, autosave and
validation. Throttle fires at most once per interval regardless of pauses —
right for scroll and resize handlers, where you want steady updates rather than
one at the end. Both are two lines with `setTimeout`; knowing which you want is
the skill.

Note also what debouncing does *not* solve: requests still race. A debounced
search can still have two requests in flight if the user pauses, types, and
pauses again, and the first can still answer last. Debounce reduces the number
of races; the cleanup guard from lesson 07 eliminates the damage. Real search
boxes use both.

## ex4 — why the rules exist

React does not know your state is called `claps`. Internally, each component
instance holds a linked list of hook records, and each `useState`/`useEffect`
call consumes the next one in order. Render one: the early return fires before
the `useState`, so zero hooks are consumed. Render two: `signedIn` is true, the
`useState` runs, and React finds one more hook than the previous render had.
There is no way to reconcile that — is this new state, or state that belonged to
something else? — so it throws.

That framing tells you what the legal moves are:

- To do work conditionally, put the condition *inside* the hook: an effect that
  returns early, a `useMemo` whose body branches.
- To reset state when something changes, give the component a different `key`
  so React unmounts the old instance and mounts a fresh one — the cleanest
  answer, and the one people reach for last.
- To genuinely vary the number of hooks, split into two components and choose
  between them in the parent. Each component gets its own hook list.

Also worth knowing: `eslint-plugin-react-hooks` catches this statically and the
React Compiler (now shipping) refuses to optimise components that break the
rules. Both are reasons the rules are getting stricter rather than looser.

## challenge — the shape of every data-fetching library

Writing `useAsync` is worth the effort mainly because of what it reveals when
you then read the documentation for TanStack Query or SWR: the surface is the
same — status, data, error, a way to refetch — and everything *else* those
libraries offer is the part you did not build. Caching by key so two components
asking for the same thing make one request. Deduplication. Retries with
backoff. Revalidation on focus and reconnect. Pagination helpers. Optimistic
updates and rollback.

That is the honest conclusion of this whole thread of the course: hand-rolled
fetching is correct and it is not enough at scale, and knowing precisely which
parts you are missing is what makes the choice to adopt a library an engineering
decision instead of a fashion.

Two implementation notes. The `attempt` counter is a neat and widely used idiom
for "run this effect again on demand" — the effect depends on a number nobody
renders, and incrementing it is a refetch. And checking `current` in the
`.catch` as well as the `.then` matters more than it looks: without it, a stale
*failure* can overwrite a fresh success, which is the worst possible version of
the race because the screen shows an error for a request that succeeded.

The contract that `run` must be stable is a real API design decision with a real
cost — a caller who passes an inline arrow gets an infinite loop. The
alternatives are to keep `run` in a ref and drop it from the deps (which
silently uses a stale function), or to take a dependency array parameter the way
`useEffect` does (which is what most libraries end up doing, via a query key).
There is no free option; being able to name the trade-off is the point.

## Further reading

- [react.dev — Reusing Logic with Custom Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks) — the whole lesson, including when *not* to extract.
- [react.dev — Rules of Hooks](https://react.dev/reference/rules/rules-of-hooks) — the rules, with the reasoning.
- [react.dev — `useState`: avoiding recreating the initial state](https://react.dev/reference/react/useState#avoiding-recreating-the-initial-state) — the lazy initialiser from ex2.
- [react.dev — `useCallback`](https://react.dev/reference/react/useCallback) — including the "should I add it to every function?" answer.
- [MDN — `Window.localStorage`](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) and the [`storage` event](https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event) — what a production `useLocalStorage` owes you.
- [MDN — `clearTimeout`](https://developer.mozilla.org/en-US/docs/Web/API/Window/clearTimeout) — the one line that turns a delay into a debounce.
- [Testing Library — `renderHook`](https://testing-library.com/docs/react-testing-library/api/#renderhook) — the API these gates are written in.
