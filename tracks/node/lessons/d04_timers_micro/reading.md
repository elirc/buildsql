# Reading - node/d04_timers_micro

What each problem was really testing, the mistake that costs people the
question, and one line of the model answer's reasoning.

## Notes

The skill being drilled is **making time an input**. Every one of these eight
utilities is trivial to write and horrible to test if it reads the clock itself
and sleeps for real; every one of them becomes a two-line test the moment the
clock is either faked by the runner (`vi.useFakeTimers`) or handed in as a
`now()` function. The pattern that unites the set: hold a *handle* for anything
you armed, compute delays from absolute deadlines rather than from elapsed gaps,
and make sure that when the work is finished nothing is left armed — because in
Node a live timer is a live handle, and a live handle is a process that will not
exit. Half the bugs here are the same bug at different scales: two timers where
there should have been one.

## ex1 — a microtask is not a zero-length timer

**What it tested:** that you can tell the two deferral mechanisms apart, and
that "as soon as possible" has two very different meanings.

**The classic mistake:** implementing `immediate` as `setTimeout(resolve, 0)`.
It looks equivalent and behaves completely differently: a timer is a whole turn
of the event loop away, it can be starved, and — the part the gate checks — it
registers a handle. In a CLI that means the process cannot exit until it fires.

**Model answer:** `Promise.resolve()` is already settled, so a handler attached
to it is a microtask by definition; there is nothing to schedule and nothing to
clear.

## ex2 — the handle is the state

**What it tested:** the smallest possible resource lifecycle. Arm, hold the
handle, clear it, forget it.

**The classic mistake:** a separate `running` boolean beside the handle. The two
drift — most often when `start()` is called twice, which arms a second interval
and overwrites the handle, so the first one can never be cleared and ticks
forever. That is a leak with a heartbeat, and it survives every code review that
only reads the happy path.

**Model answer:** let `handle !== undefined` be the running flag, guard both
transitions with an early return, and keep the counter in the closure so a
restart continues rather than resets.

## ex3 — the reset is the whole idea

**What it tested:** whether you clear before you arm. A debounce that arms a new
timer without clearing the old one fires once per call, `waitMs` after each —
which is not a debounce, it is a delay.

**The classic mistake:** capturing the arguments at schedule time in a way that
keeps the *first* call's arguments rather than the last. Storing them in a
closure variable that every call overwrites is the fix, and it is why the gate
passes `"a"` then `"b"` and expects `"b"`.

**Model answer:** `clearTimeout` then `setTimeout` on every call, arguments
stashed in a shared variable, and the handle cleared inside the callback before
`fn` runs so `pending()` tells the truth.

## ex4 — leading, trailing, and the timer that never dies

**What it tested:** the shape of a rate limiter you would actually ship. The
leading call is what makes it feel instant; the trailing call is what stops the
last event of a burst from being lost.

**The classic mistake:** re-arming unconditionally when the window closes. The
throttle then holds a timer forever, ticking every `waitMs` for the lifetime of
the process, and a CLI using it simply never exits. The gate catches it by
advancing a full second and demanding a timer count of zero.

**Model answer:** one variable for "window open", stash-or-run in the returned
function, and a closing callback that only opens a new window if it actually ran
something.

## ex5 — two timers with two different jobs

**What it tested:** polling with a deadline, and the cleanup discipline that
makes both exits safe.

**The classic mistake:** clearing only the timer belonging to the path you took.
Resolving without clearing the deadline leaves a timer that will fire on a
settled promise — harmless in behaviour, fatal for process exit. Rejecting
without clearing the poll leaves a `check()` running forever against a caller
that has already given up, which is how a load test turns a 500ms timeout into a
permanent background workload.

**Model answer:** one `cleanup()` closing over both handles, called from both
exits, and the first check made directly rather than through the first interval.

## ex6 — the fake timers, from the inside

**What it tested:** that "virtual time" is not magic. It is a sorted list, a
number, and a loop — the same thing `vi.useFakeTimers()` is doing for the other
seven problems.

**The classic mistake:** sorting the due entries once and then walking the
snapshot. A callback that schedules something inside the window you are
advancing through is invisible to a pre-computed list, so `e` never runs. The
other one is forgetting the insertion-order tie-break, which makes the output
depend on array churn and therefore irreproducible.

**Model answer:** advance the clock first, then loop — find the earliest due
entry, remove it, run it, repeat — so anything a callback adds is picked up by
the next pass.

## ex7 — measure from the grid, not from the gap

**What it tested:** the difference between `setInterval` and a re-armed
`setTimeout`, and why anything that has to stay aligned to real time uses the
second one.

**The classic mistake:** computing the next delay as `intervalMs` minus the
measured handler duration, which is nearly right and accumulates rounding, or
using `setInterval` and being surprised that a one-second ticker has drifted
minutes by the end of an hour. The subtler one is letting the delay go negative
when the handler overran; `setTimeout` treats anything below 1 as 1, so the
symptom is a schedule that is silently one millisecond off forever.

**Model answer:** keep `startedAt` and a tick count, compute
`startedAt + (n + 1) * intervalMs - now()`, clamp at zero, re-arm from inside
the callback.

## ex8 — one timer is an invariant, not an optimisation

**What it tested:** the timer-wheel idea in miniature, and the discipline of a
single `rearm()` that every mutating operation ends with.

**The classic mistake:** one `setTimeout` per entry. It works, and it stops
working at scale: ten thousand pending jobs become ten thousand libuv handles,
and cancelling one means finding its handle. The second mistake is cancelling
the earliest entry without re-arming, which leaves the timer pointed at a
deadline that will never be honoured and stalls the whole queue.

**Model answer:** absolute deadlines, an insertion sequence for ties, and one
`rearm()` called from enqueue, from cancel and from the end of a firing pass —
with the due batch removed from the queue before any of it runs.

## Further reading

- [Node.js: Timers](https://nodejs.org/api/timers.html) — `setTimeout`, `setInterval`, `setImmediate`, and the `unref()` that answers "why has my CLI not exited".
- [Node.js: Discover JavaScript timers](https://nodejs.org/en/learn/asynchronous-work/discover-javascript-timers) — including why a timer delay is a minimum, never a guarantee.
- [MDN: `setTimeout()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout) — the clamping rules and the reasons a delay is not honoured exactly.
- [MDN: `queueMicrotask()`](https://developer.mozilla.org/en-US/docs/Web/API/Window/queueMicrotask) — the microtask half of problem 1, and when to prefer it.
- [Vitest: mocking timers](https://vitest.dev/guide/mocking.html#timers) — `advanceTimersByTimeAsync`, `getTimerCount`, and the API every one of these gates is written against.
