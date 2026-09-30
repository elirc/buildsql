# 10 — Recover a conflict without erasing either person's work

## A conflict is information

The current workspace conflict says that the accepted state no longer matches the state your draft expected. That refusal protects later work. Treating every conflict as an inconvenience to suppress can turn a visible recoverable problem into silent data loss. The right next step is to preserve intent and compare meanings, not to keep refreshing the version until the write is accepted.

In the existing workflow, export the losing draft before loading accepted data. The export is a preservation artifact, not automatic permission to replace current storage. Reapply the intended change deliberately to current data. This manual process is bounded and understandable, even though a future product may introduce a more sophisticated merge.

## Identify the three states needed for a merge

A meaningful three-way comparison uses the common baseline, the local draft and the newly accepted state. Comparing only local and accepted values cannot reliably distinguish a local change from an unchanged value. If both differ, the baseline tells you which side changed and whether their changes are compatible under a chosen policy.

For example, baseline project P has title “Contacts” and goal “Create records.” Local changes the goal; accepted state changes the title. A field-level policy might combine these changes. If both change the goal differently, a policy must resolve or surface a conflict. If local deletes P while accepted state edits it, treating absence as an empty object can conceal a real delete/edit disagreement.

The current IPSKILL workflow does not implement this merge. Use it as a design exercise in a separate model. Do not label a newly combined JSON object safe merely because all its individual fields pass structural validation. Cross-field relationships, versions, mission progression and evidence semantics may require more than field-wise selection.

## Choose the granularity deliberately

Whole-workspace conflict detection is simple: one expectation protects an aggregate. Per-project reconciliation can permit independent edits but must still account for shared save data and aggregate limits. Field-level merging can preserve more simultaneous edits while creating difficult semantic combinations. A changed status and changed evidence may each be individually plausible but jointly violate a completion requirement.

A good proposal names what it will merge automatically and what remains a review decision. “Merge independent project creations by distinct identity” is narrower than “merge all changes.” It should also define ordering, duplicate identity handling, schema compatibility and maximum-size behavior. Narrow automation can be useful without pretending every conflict has a mechanical answer.

## Design a comparison interface

Show baseline, local and accepted values where that helps a learner understand the disagreement. Label the source and time of each view rather than using ambiguous “old” and “new” labels. A local draft may contain newer user intent while accepted state contains a later durable revision; those are different notions of newness.

Let the learner choose or edit the resulting value and explain which expectation will be used for the new attempt. Preserve an export before discarding unresolved work. If another accepted change occurs during review, the next write may conflict again. A comparison panel should not imply that viewing current state freezes it.

The interface must also handle missing records. A deleted project needs a different presentation from a project whose title is blank. Distinguish absence from a field value. If restoration creates a new identity, say so; if it restores the old identity under a supported protocol, define how versions and history behave.

## Test policies through counterexamples

Start with small fixtures that isolate a policy. Both sides unchanged should preserve the baseline. One side changing a field while the other remains unchanged should follow the chosen one-sided rule. Equal changes should not become a false conflict. Different changes to the same field should produce the documented disagreement. Delete/edit and duplicate-identity cases deserve explicit fixtures.

Then test invariant preservation. A result must still pass workspace validation. A merged completed project must carry valid evidence under the chosen contract. A result exceeding the size limit should not be accepted by silently dropping data. Passing a few comparison examples is not proof that every merged aggregate is semantically valid.

## Independent design tasks

**BX-10A:** Write a three-way table for title and goal changes. Include equal edits, independent edits and conflicting edits. Separate the algorithm's suggested value from the learner's final review decision.

**BX-10B:** Design a delete/edit conflict display. Specify how a learner preserves the edited text before choosing deletion or restoration. Explain whether restoration retains identity and why.

**BX-10C:** Propose automatic merging only for distinct new project identities. List five conditions under which automation must stop, including schema and aggregate-size concerns. Provide one fixture per condition.

**BX-10D:** Review a merge implementation that uses `undefined` to mean both “missing project” and “no decision yet.” Construct an ambiguous case and propose a representation that keeps those meanings separate.

## Review discussion

Strong answers treat absence as meaningful and do not confuse temporal labels with authority. A narrow automatic-creation merge can be a reasonable exercise if it still validates the combined aggregate and refuses incompatible inputs. A useful comparison interface preserves choices through a second conflict instead of hiding that possibility. A useful representation distinguishes a deleted entity, an unresolved choice and an empty field.

Conflict recovery is complete when the learner can preserve work, understand the disagreement and make a deliberate next attempt. Eliminating every visible conflict is not the goal if doing so removes the information needed to protect accepted data.
