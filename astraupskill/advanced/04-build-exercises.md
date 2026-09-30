# Build one complete behavior per exercise

These are proposed learner changes. They are not features implemented by this learning-pack expansion. Work in a branch or separate practice copy and retain the original behavior as a comparison.

## BSQL-01 — configurable page size

Add choices 5, 10 and 20 to the existing practice list. Keep the preference in view state for the first version. Write a policy for switching size: either reset to the first page or preserve the first visible record's approximate position. The policy must work when a filter removes most rows.

Use fixtures with 0, 1, 10, 11 and 21 projects. Assert actual visible IDs after filtering, deletion of the final row and a size change. Keep a partially typed form unchanged. Deliver a short explanation of the order: filter, sort, compute page count, clamp, slice. Extension: decide whether persisting the preference changes the workspace schema and migration obligations.

## BSQL-02 — evidence that survives migration

Design a list of evidence entries with stable ID, category, description and observed result. Decide which fields are optional. Specify limits for entry count and text lengths. Convert an existing free-text note into a `legacy-note` entry without inventing a command or verification date.

Prepare three input/output examples: a blank historical note, a completed project with useful prose, and malformed input with duplicate entry IDs. Require failed imports to preserve accepted state. Deliver a migration table, validation cases and a reviewer-readable limitation. A minimum text length is not an automatic judge of engineering quality.

## BSQL-03 — Contact book contract

In a separate application, implement create/list/detail/update/delete for a contact with ID, name, email and version. Choose React with either Node or .NET. Define normalization and uniqueness explicitly; do not assume every database collation treats email text identically. Include valid create, duplicate rejection, missing record and stale update examples.

List responses must expose a consistent total and stable ordering. Failed writes retain form input. Updates compare the expected version as part of the protected write, not in an earlier unprotected read. Deliver API examples and a persistence test that demonstrates rejection without a partial write.

## BSQL-04 — a lost acknowledgement

Extend your Contact book with an explicit operation identity for create. Simulate a response lost after the server commits. Retrying the exact operation should recover one result, not create another contact. Reusing that identity with a changed body must be rejected or handled by an explicitly documented contract.

Draw the timeline before coding. Include the operation record and contact write in one durability boundary. State the retention and expiration rule. Do not describe the existing IPSKILL browser workspace as an authenticated backend; this is a separate capstone extension.

## BSQL-05 — review someone else's claim

Review this statement: “The UI button is disabled while saving, so duplicate contacts are impossible.” Produce one counterexample involving another client or a retried request. Name the backend invariant and the test needed to support the stronger claim. Then rewrite the statement so it accurately describes the UI benefit that was actually established.

Each submission must contain one passing path, one rejecting path, an explanation of preserved state and a remaining limitation. See the [rubric](05-solutions-and-rubric.md) after making an independent attempt.
