# 04 — Use identity and versions to describe which state you mean

## One number cannot answer every concurrency question

IPSKILL uses a workspace identity, a workspace revision and per-project versions. These values are related but not interchangeable. The workspace identity distinguishes one aggregate from another, including a reviewed replacement. The revision identifies an accepted state of that aggregate. A project version protects an edit against a project that has changed since the form captured its expectation.

Imagine workspace W at revision 15 containing project P at version 3 and project Q at version 9. Editing P should not make Q become version 10 merely because both share one workspace. Persisting a draft containing the P edit does advance the workspace revision because the accepted aggregate changed. A diagram that labels all three values “version” hides this distinction and invites incorrect comparisons.

Read `putProject` in [progression.ts](../../../src/progression.ts). It looks for an existing project by identity and compares its version with the form's expected version. For creation, an unexpected version is also rejected. That prevents a caller from accidentally treating an edit as an unrelated creation under the same operation path.

## Work through two edit timelines

First consider two forms within a hypothetical interface that can retain both. Both open project P at version 3. One applies a change, producing project version 4 in the current draft. The other still expects version 3. A correct project-level comparison rejects the stale form rather than silently replacing the newer draft value. This is a domain-transformation boundary; it can matter before anything is persisted.

Now consider two browser tabs. Both load workspace W at revision 15. A edits P; B edits Q. A saves, producing accepted W/16. B attempts to save its old aggregate expecting W/15. The storage transaction rejects B even though the intended edits concerned different projects. B's entire aggregate also contains old values for P, so accepting it wholesale could erase A's work.

A future field-level or project-level merge could make some independent edits compatible, but that would require a new merge contract. It would need a common ancestor, conflict policy and rules for deletion, reordering and dependent data. The current refusal is a deliberate simple boundary, not proof that the developers forgot two different projects can change at once.

## Replacement exposes why identity matters

Suppose W has revision 0 and an old tab remembers W/0. A reviewed import replaces accepted data with a new workspace R, also starting at revision 0. Comparing only the revision would mistakenly treat R/0 as the old expected state. Comparing identity as well prevents that overwrite. Equal counters from different identity sequences do not establish equal states.

This pattern appears beyond browser storage. A recreated document, a restored dataset or a resource deleted and later re-created under a display name may need an identity distinction independent of an edit counter. The precise mechanism depends on the application, but the reasoning question is stable: could two different objects share the same apparent version value?

The storage `commit` function checks both accepted state and the draft's relationship to the expected identity/revision for ordinary writes. A caller cannot simply carry a valid expectation while supplying an unrelated draft and assume the comparison proves the draft belongs to that expectation. Follow all the checks, not only the first one that looks like optimistic concurrency.

## Preserve intent without silently changing its basis

When an edit is rejected, the learner's typed text can still be valuable. Retaining a draft is different from granting permission to write it over current data. The interface should make the next choice explicit: compare with current values, reapply the intended change or discard after preserving a copy if needed.

A subtle error is refreshing a record's version while keeping old field values in the form, then submitting automatically. The request now claims it is based on current data even though the user never reviewed that data. Version numbers are not magic tokens that should be refreshed until a write succeeds. They express the state against which an intention was formed.

For the current workspace-level conflict, export the losing draft before reloading. Then reapply the intended small change to the current accepted workspace. Do not import the entire stale export as a convenient merge unless you explicitly intend to replace accepted data through the reviewed replacement workflow. Recovery actions have different meanings even when both involve JSON files.

## Independent concurrency tasks

**BX-04A:** Draw a timeline with W/15, A's accepted W/16 and B's rejected expectation. Include P and Q versions separately. Identify exactly which stale fields would be overwritten if B's whole aggregate were accepted.

**BX-04B:** Design a test where workspace identities differ but revisions match. Explain why it would pass incorrectly if the identity comparison were removed. Keep the draft otherwise valid so the identity check is the intended rejecting boundary.

**BX-04C:** Propose a future merge of independent project edits. Specify what happens when one side deletes P and the other edits P, when both edit the goal differently and when both add different projects with similar titles. You are designing policy, not claiming that the current application performs it.

**BX-04D:** Review a retry button that always reloads the latest revision before re-sending the old draft. Write a concrete counterexample and propose a user decision that preserves the meaning of optimistic concurrency.

## Review discussion

A useful timeline names the aggregate and the record rather than drawing a single anonymous counter. A useful identity test distinguishes two valid aggregates, not a valid aggregate from malformed data. A useful merge proposal handles disagreement and deletion explicitly instead of promising that most edits are independent. The retry review should preserve both valuable user intent and the right of later accepted work not to be overwritten silently.

Versioning is a language for saying which state a command assumes. Once that language is precise, tests can ask whether the assumption still holds at the write boundary. Without that precision, a system can carry many version fields while providing little real protection.
