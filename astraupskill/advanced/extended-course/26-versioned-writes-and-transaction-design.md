# 26. Capstone: versioned writes and transaction design

The proposed contact book now has a relational model. Next, make concurrent edits explicit. BuildSQL's local storage offers a useful analogy: an accepted workspace identity and revision are compared inside the transaction before writing. Read `commit` in [storage.ts](../../../src/storage.ts), then design the equivalent contract for a single contact in your separate backend. Do not assume that copying the field name revision automatically reproduces the guarantee.

## State the write precondition

A client loads contact C at version eight. Its edit request includes the expected version eight and a candidate change. The server accepts the edit only if C still belongs to the authorized owner and still has version eight at the authoritative write boundary. On success, the accepted version becomes nine. On conflict, the server preserves the current record and returns a response that lets the client recover deliberately.

The important phrase is at the write boundary. Reading version eight, performing unrelated work, and later issuing an unconditional update creates a race. Another request can update the row between those actions. Your database operation or transaction must bind the comparison and update in a way that enforces the precondition. Use your selected engine's documented behavior and verify it with two competing operations.

## Interpret the affected-row result

A conditional update may affect zero rows. That observation alone may not distinguish missing contact, wrong owner, stale version, or a state that no longer allows editing. Decide how much information the API should disclose and which follow-up read is appropriate. Do not leak another owner's contact existence simply to produce a more detailed error message.

Also decide whether submitting identical values counts as an edit. Some products increment version for every accepted command; others treat a no-op as unchanged. Either policy needs consistent response and retry behavior. Write an example with identical input before choosing. Avoid letting incidental database driver behavior decide the product rule without review.

## Transactions group accepted effects

Suppose a contact update must also create an audit entry. If the contact changes but the audit insert fails, should the update remain accepted? For this capstone, require both to succeed together. That means the operations share a transaction boundary, and success is reported only after commit. A unit test that mocks both repository methods as successful does not prove rollback on the second failure.

Create an integration test that causes the audit write to fail after the contact update has been attempted. Read the contact and audit records after the transaction settles. The accepted state should reflect neither partial effect. This is directly analogous to checking both workspace and recovery snapshot after a rejected local replacement. The shared principle is atomic acceptance, even though the storage technology differs.

## Exercise BX-26A: draw three schedules

Draw a schedule where A wins and B conflicts, one where B wins and A conflicts, and one where A fails before commit and B can still succeed using the original accepted version. Label reads, conditional writes, audit inserts, commits, and responses. Use the schedule to predict exactly one accepted update in the first two cases.

Your test should control the overlap rather than rely on two requests happening to race. A barrier or instrumented repository in a disposable test environment can pause both after a known point. Avoid adding arbitrary sleeps and assuming that they guarantee an interleaving. The evidence should identify the schedule actually exercised.

## Exercise BX-26B: design the conflict response

Specify the response fields the client needs without automatically discarding its draft. It may need a conflict category, the current version, and an authorized current representation or a route to reload it. Decide whether the server returns field-level differences or leaves comparison to the client. Do not include another user's data in a convenience response.

Write the client's recovery journey: retain local candidate, show current accepted state, let the learner compare, and require a deliberate new edit against the current version. An automatic retry with the latest version can silently turn optimistic concurrency into last-writer-wins. If you implement a merge, define its rules and revalidate the merged result before acceptance.

## Exercise BX-26C: test failure after success is possible

Consider a transaction that commits successfully but whose response never reaches the client. From the client's perspective the result is unknown, not definitely failed. A plain retry can create another accepted command unless the operation has a deduplication contract. Explain why the editing version may cause a conflict on retry but still does not necessarily tell the client whether its own first attempt succeeded.

This scenario leads into the next chapter. For now, write the three possible observations: definitely rejected before acceptance, definitely accepted with response, and acceptance unknown after transport failure. Keeping the third state explicit is essential to honest user feedback.

## Review discussion

Versioned writes protect against stale intent only when the comparison and accepted effects share an authoritative boundary. Transactions protect groups of writes only when every required effect participates. Your submission should include controlled concurrent schedules, a rollback test, and a conflict recovery design that preserves the user's draft. Explain the remaining unknown-result case rather than pretending a version counter solves every retry problem.
