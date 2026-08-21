# Reading — react/07_data_fetching

## Notes

**Why fetching in an effect is awkward at all.** Rendering is synchronous and
must be pure, so a component cannot wait for data while it renders. That leaves
"render nothing useful, start a request, render again when it arrives", which is
what every one of these exercises does. The awkwardness is real and React knows
it: `Suspense`, server components and framework loaders all exist to move the
waiting somewhere better. Understanding the manual version is still the
foundation, because the failure modes are the same wherever the fetch lives.

**Injected dependencies are not a testing hack.** Taking `fetchUser` as a prop
is dependency inversion: the component declares the *shape* of what it needs
rather than naming an implementation. The payoff in this course is deterministic
gates with no network and no mocking library. The payoff in production is a
component you can reuse against a different backend, a cached client, or a
Storybook fixture without touching it.

**Promises cannot be cancelled.** This is the fact everything else follows from.
`promise.then(f)` schedules `f`; there is no API to unschedule it. `AbortController`
does not cancel the promise either — it aborts the *underlying operation* and
causes the promise to reject with an `AbortError`, which the `fetch` API opts
into. For any promise you did not create, the only defence is to ignore its
result.

**Every asynchronous update needs an owner check.** The general pattern is: when
an async operation completes, ask "is this still the operation the component
wants?" before writing state. A boolean flag scoped to the effect run answers
that question for the common case. Libraries answer it with request keys and a
cache, which is the same idea generalised.

**Four states, not three.** The honest enumeration of a request is idle,
loading, success, error — and "idle" matters as soon as the request is triggered
by something other than mounting. Modelling them as separate booleans lets you
express impossible combinations (`loading && error`); modelling them as one
discriminated union (`{ status: "loading" } | { status: "error", message } | …`)
makes those unrepresentable. The TypeScript track's `04_unions_narrowing` is the
same idea from the other end.

## ex1 — why `loading` starts `true`

The first render happens before any effect runs. If `loading` starts `false`,
that render says "not loading, no data" and produces an empty card, which is
then replaced by the spinner one tick later — a flash of nothing that looks like
a bug on a fast connection and looks like a broken layout on a slow one.
Starting at `true` says the truthful thing: we have not asked yet, so we are
certainly not done.

The choice of `role="status"` for the spinner is the accessibility half. A
visual spinner communicates nothing to a screen reader; a polite live region
containing the word "Loading" is announced when it appears. The refinement real
applications add is `aria-busy` on the region being replaced, and not
announcing anything at all for waits under a few hundred milliseconds — a
spinner that flashes for 80ms is worse than no spinner.

The dependency array is the same discipline as lesson 06: `[userId, fetchUser]`,
because both are read. `fetchUser` being a stable reference is the caller's
responsibility, and if the caller gets it wrong, the symptom is an infinite
fetch loop — which is exactly why it belongs in the array rather than being
quietly omitted.

## ex2 — the failure path, and `unknown`

`.finally` is the small structural win here: the spinner stops on both paths
with one line, and there is no branch left in which you can forget it.

The TypeScript detail is worth its own paragraph because it comes up in
interviews. In a `catch`, the caught value is typed `unknown`, not `Error` —
JavaScript lets you `throw` anything, including a string or `undefined`, and
`useUnknownInCatchVariables` (part of `strict`) makes TypeScript admit it. So
you narrow: `problem instanceof Error ? problem.message : "Something went wrong"`.
Writing `catch (e: any) { setError(e.message) }` produces `undefined` on screen
the day something throws a string.

A design question the exercise raises without answering: should the error be
the raw message from the server? Usually not. `Failed to fetch` and
`Unexpected token < in JSON at position 0` mean nothing to a user; a real
implementation maps known failures to sentences a person can act on and keeps
the raw text for the log. The gate asks for `error.message` because that is what
is checkable, not because it is what you would ship.

Also notice `setError(null)` at the *start* of each request. Without it, a
failed load followed by a successful one leaves the old error on screen next to
fresh data — a specific, common, extremely confusing bug.

## ex3 — the race, in detail

The sequence the gate performs is the whole lesson:

1. Render with `userId="1"`. Effect starts request A.
2. Re-render with `userId="2"`. React runs the previous effect's cleanup, then
   the new effect, which starts request B. **Request A is still in flight.**
3. B resolves. `setUser(second)`. Correct.
4. A resolves. Its `.then` — a closure created back in step 1 — runs and calls
   `setUser(first)`. The screen now shows a user the component stopped caring
   about two steps ago.

Nothing here is a React bug, and no dependency array fixes it. The `.then`
callback was scheduled before the cleanup ran, and there is no mechanism to
unschedule it.

The `let current = true` inside the effect works because of scoping. Each run of
the effect body creates a fresh binding; the `.then` closure and the cleanup
closure both capture *that* binding. When the id changes, the cleanup for run 1
sets run 1's `current` to `false`, and run 2's `current` is untouched. Hoisting
the flag to a `useRef` breaks this immediately — there would be one flag shared
by every run, and retiring the old request would also retire the new one.

The `AbortController` version is strictly better when the transport supports it,
because it stops the work rather than discarding it: less bandwidth, less server
load, and the promise rejects with an `AbortError` you then have to remember not
to display as an error. The two techniques compose — abort what you can, ignore
what you cannot.

Why this is *the* interview question: it is invisible in code review, never
reproduces locally, and the correct answer demonstrates that you understand
closures, effect cleanup, and promise semantics at once. If you can narrate the
four steps above, you have answered it.

## ex4 — making the request callable from two places

The structural move — hoist the request into a named function that both the
effect and a handler call — is one you will make constantly, and it exposes a
tension worth understanding. A function declared in a component body is a new
value on every render. Put it in the effect's dependency array and the effect
re-runs every render, which is an infinite fetch loop. Leave it out and the
linter is right that you are lying.

`useCallback(fn, deps)` resolves it by returning the *same* function object
until its dependencies change, so `[load]` becomes an honest dependency that
changes exactly when `userId` or `fetchUser` does. This is the one situation
where `useCallback` is not a performance optimisation but a correctness tool —
it makes a dependency array truthful — and it is worth separating from the
memoization use in lesson 11.

The alternative shapes, both legitimate: move the fetching function outside the
component so it is never recreated, or give the retry a "nonce" piece of state
(`const [attempt, setAttempt] = useState(0)`) and put `attempt` in the effect's
dependency array so clicking Try again just increments it. The second is
delightfully simple and worth knowing.

## challenge — what is state and what is an answer

The design pressure in this exercise is real and shows up in every list UI. It
is tempting to store `items`, `page`, `hasMore`, `loading`, and maybe
`canGoNext` — five pieces of state, several of which restate each other. Ask
which one the *user* changes: the page number. Everything else either arrives
from the server as a unit (`items`, `hasMore`) or is computed during render
(`disabled`).

Replacing rather than appending is what the "no items from page 1" assertion is
about. Appending is the correct behaviour for an infinite scroll and the wrong
behaviour for pagination, and the bug where a "load more" implementation gets
reused for pages is common enough to be worth naming.

The race applies here too, and more visibly than anywhere else: click Next
twice quickly and two page requests are running. Without the guard, the slower
one wins and you land on a page whose number does not match its contents. Real
pagination also has to decide what to show *while* loading — the old page
greyed out, a skeleton, or nothing — and each choice has a different feel. There
is no correct answer, only a decided one.

## review1 — the same bug, where users actually meet it

Search-as-you-type is where the race stops being theoretical: the query changes
several times a second, every keystroke starts a request, and the results
flicker between queries as answers arrive out of order. Users describe this as
"the search is broken", and they are right.

The fix is identical to ex3, which is the point of it being the review
exercise: one technique, two places, and the shape is now familiar enough to
write without thinking. The natural next question — should you be firing a
request per keystroke at all? — is answered by debouncing, which you build from
scratch as a custom hook in `10_custom_hooks` and use in the interview drills.
Debouncing reduces the number of races; it does not eliminate them, so you want
both.

## Further reading

- [react.dev — Synchronizing with Effects: "Fetching data"](https://react.dev/learn/synchronizing-with-effects#fetching-data) — the race, the cleanup flag, and React's own advice about using a framework or library instead.
- [react.dev — You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect) — worth rereading now that you have written four effects that genuinely needed to exist.
- [MDN — `AbortController`](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) — real cancellation, and the `AbortError` you have to handle afterwards.
- [MDN — `Promise.prototype.finally`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/finally) — the one-line "always stop the spinner".
- [MDN — Using the Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch) — including the detail that a 404 does not reject.
- [Testing Library — Async methods](https://testing-library.com/docs/dom-testing-library/api-async/) — `findBy*` and `waitFor`, and why you should not `waitFor` an assertion that can pass at the wrong time.
