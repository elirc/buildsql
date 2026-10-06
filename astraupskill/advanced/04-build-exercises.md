# Build one complete behavior per exercise

These are proposed learner changes. They are not features implemented by this learning-pack expansion. Work in a branch or separate practice copy and retain the original behavior as a comparison.

## BSQL-01 — configurable page size

Same exercise as [core Exercise 4](../05-PRACTICE.md#exercise-4--configurable-page-size-medium), which lists the paging code that already exists (`src/PracticeView.tsx:55-56`, `:224`) and gives a test-based Check. Additional fixtures worth trying here: 0, 1, 10, 11 and 21 projects. Extension: decide whether persisting the preference changes the workspace schema and migration obligations.

## BSQL-02 — evidence that survives migration

Same exercise as [core Exercise 5](../05-PRACTICE.md#exercise-5--structured-evidence-with-a-migration-hard). Prepare three input/output examples before coding: a blank historical note, a completed project with useful prose, and malformed input with duplicate entry IDs.

## BSQL-03 — Contact book contract

Same exercise as [core Exercise 6](../05-PRACTICE.md#exercise-6--take-the-contract-to-a-server-hard-separate-project), using the reference in [08-BACKEND-TICKET.md](../08-BACKEND-TICKET.md). Define email normalization explicitly; do not assume every database collation compares email text the same way. List responses must expose a consistent total and stable ordering.

## BSQL-04 — a lost acknowledgement

Extend your Contact book with an explicit operation identity for create. Simulate a response lost after the server commits. Retrying the exact operation should recover one result, not create another contact. Reusing that identity with a changed body must be rejected or handled by an explicitly documented contract.

Draw the timeline before coding. Include the operation record and contact write in one durability boundary. State the retention and expiration rule. Do not describe the existing IPSKILL browser workspace as an authenticated backend; this is a separate capstone extension.

## BSQL-05 — review someone else's claim

Review this statement: “The UI button is disabled while saving, so duplicate contacts are impossible.” Produce one counterexample involving another client or a retried request. Name the backend invariant and the test needed to support the stronger claim. Then rewrite the statement so it accurately describes the UI benefit that was actually established.

Each submission must contain one passing path, one rejecting path, an explanation of preserved state and a remaining limitation. See the [rubric](05-solutions-and-rubric.md) after making an independent attempt.
