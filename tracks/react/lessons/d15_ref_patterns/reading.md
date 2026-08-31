# Reading — react/d15_ref_patterns

## Notes

Everything here follows from one sentence: a ref is per-instance memory that
survives renders and never schedules one. Each half of that does work. "Per
instance" is what a module-level variable is not, which is why the first
problem breaks the moment two gauges share a page. "Survives renders" is what a
`let` in the component body is not. "Never schedules one" is why a ref is the
right home for bookkeeping nobody looks at — what has already been reported,
which request is newest, whether a submit is already in flight — and it is
equally why a ref is the *wrong* home for anything the screen depends on, since
writing it will never update the display. The set also drills the second
meaning of a ref, `useImperativeHandle`: a component choosing a small, named
API for its parent instead of handing over a DOM node it cannot defend. The
recurring interview trap in both halves is time — a ref is readable and
writable *now*, while state is a value that only exists between renders, and
half these problems are decided by which of those two clocks the code needs.

## ex1

Tests where per-instance memory lives. The classic mistake is the stub's:
module scope looks like it works, because with one component on screen it does,
and it fails silently the moment a second instance mounts and starts reading
the first one's numbers. The model answer keeps a ref, reads `.current` during
render to get the old value and writes the new one in an effect with no
dependency array, so the write always lands after the commit that displayed the
previous value.

## ex2

Tests remembering across effect runs rather than between two of them. The
classic mistake is trusting the dependency array to do it: an array compares
this run against the previous one, so returning to a slot looks exactly like
seeing it for the first time, and an analytics backend gets billed twice for
one impression. The model answer keeps a `Set` in a ref — deliberately not
state, because nothing renders from it and putting it in state would put it in
the dependency array and start a loop.

## ex3

Tests the basic shape of an imperative handle. The point the exercise makes by
construction is why a DOM node would not do: `play()` has to flip React state,
and no element can. The classic mistake once people find `useImperativeHandle`
is exposing too much — returning the node, or a method per internal field —
where the discipline is that every method you expose is a promise you have to
keep. The model answer returns three verbs backed by state setters, which are
stable, so an empty dependency array is honest here.

## ex4

Tests the latest-value ref. The classic mistakes are the two obvious dependency
arrays, and each is a real bug: including the callback tears down a live
connection on every parent render, excluding it leaves the subscription calling
the first render's function for ever. The model answer stores the newest
callback in a ref updated by its own tiny effect and reads `ref.current` when a
message arrives — the pattern `useEffectEvent` is being designed to replace,
and worth recognising in existing code either way.

## ex5

Tests the gap between an event and the render that answers it. The classic
mistake is guarding with state and believing the disabled attribute: both
clicks of a double-click are handled before React re-renders, so both read the
same `false` and the DOM button is still enabled when the second one lands.
The model answer keeps both — state for what the user sees, a ref for what the
code tests — and clears the ref in a `finally` so a failed payout does not
leave the button dead.

## ex6

Tests sharing one node between the component and its caller. The classic
mistake is the stub's: using the parent's ref for your own internal work, which
makes the component's behaviour depend on a prop the caller was never obliged
to pass, and breaks in the ordinary case rather than the exotic one. The model
answer attaches a callback ref that writes the node into an internal ref *and*
forwards it to whatever the parent gave — remembering that a `Ref` may be a
function, an object, or absent.

## ex7

Tests lazy initialisation. The classic mistake is `useRef(createSession())`,
which reads as "create it once" and means "create it on every render and throw
all but the first away" — the argument is evaluated before `useRef` is called,
so every keystroke opens a connection. The model answer starts the ref at
`null` and fills it only when it is still `null`, and pairs that with a cleanup
in a mount effect so what was opened once is closed once.

## ex8

Tests the dependency array of a handle. The classic mistake is `[]`, which
freezes the returned object around the first render's state: `read()` answers
with the text as it was then, for ever, and an `insert` that computes from the
old text overwrites whatever has been typed since. The model answer puts the
functional updater form in `insert` and `clear` — which need no dependencies at
all — and lists `text` for the sake of `read`, which genuinely has to see the
present.

## Further reading

- [Referencing values with refs](https://react.dev/learn/referencing-values-with-refs)
- [`useRef` reference](https://react.dev/reference/react/useRef)
- [`useImperativeHandle` reference](https://react.dev/reference/react/useImperativeHandle)
- [Separating events from effects](https://react.dev/learn/separating-events-from-effects)
- [Choosing the state structure](https://react.dev/learn/choosing-the-state-structure)
- [MDN: `Set`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set)
