# 09 — Understand the transaction you are relying on

## Read a transaction as a state machine

In [storage.ts](../../../src/storage.ts), `commit` validates the candidate workspace, opens a read/write transaction over workspace and backups stores, reads the current accepted workspace and compares the expected state. It then schedules writes and resolves from the transaction's completion event. Any rejection path aborts or rejects while preserving the caller's useful draft.

This is more than a sequence of database calls. The transaction defines the boundary within which related reads and writes participate. The expectation check belongs inside that boundary so the decision is tied to the state being updated. A check performed earlier in UI memory would be stale by the time another tab writes.

Think of the transaction as moving through active work, scheduled requests, completion or abort. A request's success callback can run while the transaction is still capable of failing. The final promise must therefore represent the transaction outcome, not just the success of one request. The current code makes that distinction explicit with `tx.oncomplete` and `tx.onabort`.

## Work through an ordinary save

Assume accepted W/21 and a valid draft based on W/21. The transaction reads the current value. Identity and revision match, so it constructs the next aggregate with revision 22 and schedules a put. If the transaction completes, the returned accepted value becomes the hook's new expectation. The form and draft may have changed earlier, but accepted storage advances at this boundary.

Now introduce a competing tab that already committed W/22 before this transaction's comparison. The expected W/21 does not match. The operation refuses the stale aggregate. Your test should inspect the accepted value afterward and confirm it remains the competing tab's state. The refusal is useful because it prevents an old complete aggregate from replacing newer accepted data.

## Work through a replacement

A reviewed replacement affects both the current workspace and recovery snapshots. It checks backup capacity, saves the previous accepted representation and writes a new workspace identity at revision zero. These effects belong together: accepting a replacement while losing the promised recovery snapshot would violate the recovery contract.

The capacity check is also behavior. If ten snapshots already exist, the operation refuses another replacement. It does not silently delete an older snapshot to make room. A UI can help the learner export and review snapshots, but a convenience feature must not erase the preservation promise without a deliberate product decision.

When no accepted workspace exists during reviewed legacy initialization, the raw legacy representation can become the preserved recovery material. Read the exact branch before describing every snapshot as the same kind of source. Recovery data should retain what the workflow actually possessed, not a normalized reconstruction falsely labeled original.

## Avoid extending the transaction carelessly

Suppose a future version performs a network request while a storage transaction is open. Whether that is safe depends on the storage API's transaction lifecycle; do not assume an arbitrary awaited operation can be inserted without changing activity and completion behavior. Keep the current code's event-based sequence visible when proposing an extension.

Likewise, introducing another storage system does not automatically include it in the existing IndexedDB transaction. A local file, remote API and browser database do not share a transaction merely because one JavaScript function calls all three. A cross-system workflow needs an explicit failure and recovery protocol. The current local aggregate design is intentionally narrower.

## Choose an observer for failure evidence

A retained in-memory draft shows that user intent survived. Reading accepted storage after an abort shows the persisted result. Reloading the application exercises the load path. A screenshot of the error message shows feedback. These observations complement one another and should not be substituted indiscriminately.

For a deliberately injected abort after a put request succeeds, assert the accepted database value from a fresh read and the draft's retained content separately. If the test inspects only the same mutated object that was passed into the write, it may not observe durable state at all. Name the observer in the test description so a reviewer can understand the claim.

## Independent transaction tasks

**BX-09A:** Draw an ordinary save and a reviewed replacement side by side. Mark the stores involved, expectation checks, new identity/revision decisions and final acceptance event. Explain why the replacement requires a recovery-store participant.

**BX-09B:** Design a test where a put request succeeds but the transaction aborts afterward. Specify the in-memory and persisted observations required to reject a false “saved” claim. Keep the injection confined to an owned test environment.

**BX-09C:** Propose an auto-prune feature for snapshots. Write a product review identifying the behavior it would replace, the user decision needed and a non-destructive alternative. Do not implement deletion as part of this writing exercise.

**BX-09D:** Review a patch that reads the current revision outside the transaction, compares it in the hook and later writes unconditionally. Draw a two-tab interleaving that passes both prechecks but loses one update.

## Review discussion

The ordinary save and replacement differ in identity and recovery effects, not merely in the filename of imported JSON. The abort test must tie success feedback to transaction completion. The pruning proposal should acknowledge that bounded refusal protects existing recovery artifacts. The lost-update interleaving demonstrates why a comparison's location matters: a correct equality expression can provide little protection when separated from the write it is supposed to guard.

Understanding a transaction means knowing its participants, its acceptance point and its observers. Once those are explicit, you can design extensions without attributing guarantees to code that never participates in the same boundary.
