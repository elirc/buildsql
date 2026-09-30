# 08 — Coordinate asynchronous work and report what actually happened

## Promises describe completion, not automatic correctness

The workspace hook's `run` helper sets an in-flight guard, displays busy state, awaits an action, catches errors and clears busy state in a finally block. This centralizes a useful pattern, but the meaning of success still comes from the action being awaited. If an action resolves too early, a correctly written wrapper can still display misleading feedback.

Inspect `save` in [useWorkspace.ts](../../../src/useWorkspace.ts). It awaits `commit`, then calls `accept`, updates the notice and broadcasts that a save occurred. The order expresses the intended promise: acceptance follows the storage operation's completion. Moving the notice before the awaited commit would change what the message establishes, even if the eventual operation usually succeeds.

Asynchronous reasoning requires a timeline. A source file's top-to-bottom appearance is not enough when callbacks run later. Write down event delivery, guard update, awaited work, completion or rejection, state acceptance and feedback. This exposes which values can be observed between stages.

## Work through a double action

Suppose two Save events arrive quickly. The first sets `inflight.current` before awaiting storage. The second sees the current guard and returns without starting another operation. The busy state helps the interface communicate progress, but it may not have rendered before the second event. The ref is part of immediate coordination; the state is part of presentation.

Now imagine a future action performs two independent writes before resolving. The in-flight guard prevents another local action through the same helper, but it does not make those two writes atomic. Another tab, another process or an error between writes can still expose a partial result depending on the underlying storage contract. A local lock-like flag and a durable transaction are different mechanisms.

The same caution applies to disabling buttons. It reduces accidental duplicate interaction in one UI. It does not enforce uniqueness across clients or recover a response lost after a server commit. When extending the capstone to a backend, choose operation identity and database constraints according to the actual requirement rather than treating the existing busy flag as universal duplicate prevention.

## Errors need ownership too

The hook catches rejected storage actions and retains the working draft. The error string communicates the failure. A component can separately reject an invalid project transformation before persistence. If both layers reuse one ambiguous notice, the user may not know whether the form was refused, the draft changed but was not saved, or accepted storage changed while a later auxiliary operation failed.

Consider `save` accepting a committed workspace and then an unrelated feedback operation throwing. A broad catch could report failure after durability has already succeeded. The current code's actual sequence should be examined before designing such extensions. The general lesson is to identify the point after which “failed” no longer means “no accepted effect.”

For a backend operation, a network failure is especially ambiguous. The request may never arrive, may be rejected, or may commit before the response is lost. A good interface distinguishes a known rejection from an uncertain result when the contract supports recovery. IPSKILL's local storage workflow and a remote request have different failure surfaces; do not copy one error message into the other without analysis.

## Cancellation is not time travel

A learner may navigate away while content loads. Canceling or ignoring a stale response can protect the current view, but it does not undo work already performed elsewhere. If you introduce cancellation, state which effect it prevents and at what point. Does it stop fetching bytes, stop committing a rendered value, or attempt to interrupt an operation that may already have persisted?

There is also a distinction between obsolete intent and failed work. If a user selects track B after requesting track A, a late A response may be valid data for A but no longer relevant to the current view. Labeling it a server failure would be misleading. A generation token or captured identity can decide whether the result still belongs to the current request; the chosen mechanism must be tested against both late successes and late errors.

## Independent timing tasks

**BX-08A:** Draw the exact save timeline and mark when the in-flight flag, busy state, accepted expectation and notice change. Identify the event that must occur before the interface may claim the workspace is saved.

**BX-08B:** Design a future two-step export-and-upload workflow. An export succeeds locally and upload fails. Write feedback that preserves the distinction and identify which artifact can still be used. Do not call the whole operation “nothing happened.”

**BX-08C:** Build a small independent request-generation exercise with two deferred promises. Deliver B's success before A's success, then B's success before A's failure. Define which result may update the current view. Explain why debounce alone does not establish that ordering property.

**BX-08D:** Review a test that starts a save promise, immediately asserts an old success notice and ends without awaiting the promise. Name a mutation that could make the real save fail while the test still passes. Replace the assertion sequence with one tied to the new accepted revision.

## Review discussion

The save timeline should place acceptance after the storage promise's meaningful completion. The partial export/upload example should retain the successful local artifact and describe the failed transfer. The request-generation exercise should reject obsolete failures as well as obsolete successes; an old error can overwrite a successful current screen just as an old result can.

The weak-test review should distinguish an existing notice from evidence of the new operation. Awaiting a promise is necessary only when that promise corresponds to the behavior being asserted; awaiting an unrelated timer is not a substitute. Honest asynchronous feedback comes from knowing which operation completed and what effect that completion establishes.
