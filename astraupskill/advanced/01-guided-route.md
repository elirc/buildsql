# Choose a route and make progress visible

## A short placement check

Answer these before opening source. What survives reloading after Apply but before Save workspace? Can a successful IndexedDB `put` request still belong to an aborted transaction? Why can a stale tab conflict even when it edits a different practice project? What is the difference between a project version and the workspace revision?

If any answer is uncertain, complete sessions 1–3. If you can answer all four and point to the implementing functions, begin session 4, but still write the state trace. Confidence without a source reference is a hypothesis to check.

## Session 1 — find the boundaries

Open [PracticeView](../../src/PracticeView.tsx), [progression](../../src/progression.ts), [useWorkspace](../../src/useWorkspace.ts) and [storage](../../src/storage.ts). Find `apply`, `putProject`, `save` and `commit`. Draw a four-box diagram with a verb on each arrow. Identify where form validation happens, where the draft changes, where the revision comparison happens and when the save promise resolves.

Deliver an annotated map of at most one page. Do not copy every function into it. A useful map lets another learner locate a rejected operation in under a minute. Checkpoint: explain why `setForm(null)` is not a durable save.

## Session 2 — perform one complete local change

Use the setup instructions in the [project README](../../README.md) and a disposable browser profile. Create an empty workspace explicitly. Add a practice project named Contact book, with a goal that describes valid and rejected behavior. Apply it, inspect the unsaved state, save, and reload. Record the project ID/version and workspace ID/revision separately.

Repeat with an edit, then a deletion. Before saving the deletion, export the draft. Label whether each export represents the current draft or accepted storage. Checkpoint: another learner can reproduce your observations from your steps, including which button was clicked.

## Session 3 — investigate a conflict

Open two tabs on the same origin and profile. Let both read the same accepted revision. Make different drafts, save A, then save B. Preserve B's draft through export before loading accepted data. Your artifact is a timeline, not a claim that different projects automatically merge. The transaction compares the whole workspace identity and revision.

## Session 4 — build a bounded view improvement

Complete exercise BSQL-01. Use synthetic projects so the page boundaries are predictable. Read React state and array transformations as needed from the archive, then return to the actual component. Do not study every React lesson before making a small observable change. Deliver the feature, a rejected/edge-case check, and a short explanation of where form state lives.

## Session 5 — transfer the contract to a backend

Create a separate Contact book workspace. Pick one backend stack. Define contact ID, display name, email and version. Write request/response examples before handlers. Add a persistence choice appropriate to your practice setup; use a temporary database in tests. Deliver create, list, detail, update and delete, with duplicate and stale-update cases.

## Session 6 — recovery and review

Reproduce a stale edit from two clients and an uncertain creation result. Explain when a retry means “repeat the same operation” and when it is a new operation. Use the capstone rubric to find the weakest evidence and improve that one item. A finished small feature with reproducible recovery teaches more than several screens whose data behavior is unexplained.

[Next: worked traces](02-worked-traces.md)
