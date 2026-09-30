# 33. Incident clinic: diagnose before changing code

These cases combine several workbook topics into realistic review exercises. They are fictional incident reports built around the actual local contracts. They are not claims that these incidents occurred in the user's workspace. For each case, write an initial hypothesis, the smallest discriminating observation, a predicted result, and a proposed response before reading the review notes. Use synthetic data and disposable environments for any experiment.

## Case one: the project count is correct, but the wrong project appears

A learner imports a workspace containing three projects. The screen also shows three projects, so the learner assumes the import is correct. Later, they notice that one project contains another project's evidence. A teammate proposes adding a test that checks the number of projects after import.

The count assertion is necessary for some preservation claims but insufficient for association correctness. Three records can remain while their identities and evidence are mismatched. Design an oracle that maps each expected identity to its title, goal, and evidence marker. Compare the actual mapping with that independently written expectation. A set of titles alone could miss swapped evidence. A sorted array comparison that sorts only one field could accidentally obscure the relationship you need to protect.

For your investigation, construct three valid projects with distinctive paired markers. Project A has evidence A, project B has evidence B, and project C has evidence C. Write the expected association table before importing. After a successful import and acceptance, read the accepted workspace and compare the table. If you deliberately simulate a swapped-evidence candidate, confirm that your association check fails even though project count remains three.

**BX-33A:** Explain which parts of this mismatch the current schema validator can detect. It can enforce valid shapes, unique identities, unique normalized titles, and evidence requirements, but it cannot know that a semantically valid paragraph belongs to a particular fictional project unless that relationship is represented as a rule. Distinguish structural integrity from human meaning. Propose an authoring or review practice that helps catch association mistakes without inventing a universal semantic validator.

Review note: the strongest answer does not blame validation for failing to infer unstored intent. It uses a fixture-specific independent oracle to verify a transformation's preservation property and recognizes that arbitrary imported prose can satisfy a structural contract while conveying the wrong meaning.

## Case two: a title is accepted in one path and rejected in another

A learner edits a title in the form and succeeds, but a hand-edited import containing apparently similar text is rejected. The initial bug report says title validation is inconsistent. Inspect the exact strings and the sequence of transformations before concluding that both paths received the same input.

The project operation explicitly trims title and goal before validating its result. The generic text helper checks raw maximum length and trimmed minimum length while returning the original string. An imported project goes through its own validation path. Surrounding whitespace, embedded tabs, line breaks, and raw length can therefore matter at different points. The screen may make two strings look similar even though their code points and lengths differ.

Construct a comparison table with ordinary text, surrounding spaces, an embedded tab, an embedded newline, and a value whose raw length exceeds the title bound but whose trimmed length does not. For every row, write the form-operation input, the normalized candidate, and the direct-import input. Do not call the cases identical unless the bytes and transformations actually match. Keep all other fields valid so the intended title boundary is reached.

**BX-33B:** Decide whether the observed difference is a bug, a deliberate boundary distinction, or an unclear product contract. Support your conclusion with exact examples. If you recommend consistent normalization on import, explain compatibility, preservation, and duplicate-title consequences. Two titles that were distinct before normalization may collide afterward. A proposed convenience change therefore needs aggregate tests, not just one trim call.

Review note: a precise report can recommend improvement while still describing current behavior accurately. The useful artifact is the transformation table. It reveals whether the disagreement lies in representation, normalization, validation order, or user expectation.

## Case three: the learner clicks twice and sees two attempts

A learner reports two attempts for one apparent action. A teammate says completion is idempotent because experience is awarded once, so the report must be a display bug. Another teammate proposes making the pure function return the original state whenever a completion already exists.

Both reactions skip the field meanings. The transition can preserve first completion and reward while recording another attempt or review. Returning early for every already-completed mission would break due reviews and failed-recall scheduling. At the same time, an accidental duplicate UI event may not represent two intended learning attempts. The investigation must distinguish the domain contract from event coordination.

Trace the actual caller and any busy or in-flight guard. Record whether two actions reached the pure function, whether both were accepted into the workspace draft, and whether one or more saves occurred. Use a controlled test rather than clicking rapidly and guessing the timing. If you propose deduplicating one user intent, identify where that intent begins and ends. A timestamp alone is an unreliable substitute for an explicit operation model.

**BX-33C:** Write two separate acceptance examples: a learner deliberately attempts the same mission twice, and a single intended action is delivered twice by the interface. Explain whether their attempt counts should differ under your proposed product rule. Then identify the smallest layer that can distinguish them. Do not alter reward, review, and attempt semantics together without separate evidence for each change.

Review note: a strong answer preserves the legitimate second attempt while addressing duplicate delivery at the appropriate boundary. It names the specific effect being deduplicated. The phrase idempotent completion is too broad unless the contract defines which state changes are repeated and which are suppressed.

## Case four: a late review appears to skip an interval

A learner completes a mission, waits well beyond its due date, then passes the review. They expected the next due date to be calculated from the old due date, but the application schedules from the current review action. They describe this as skipping the calendar.

Read the scheduling expression and calculate both policies using fixed instants. Under the current action-based calculation, the next interval begins at the successful recall time. Under a schedule-anchored policy, it begins at the old due time and may already be overdue again. These are different product choices. The current code's use of now establishes one, but does not prove it is the only reasonable learning design.

Build a timeline with initial completion, first due instant, actual late review instant, and both candidate next due instants. Use a large enough delay that the difference is visible. Include the review stage before and after. Then ask what the user interface should communicate: due since a prior date, completed late, or next review in the configured interval. A clear label can prevent misunderstanding without changing the scheduler.

**BX-33D:** Write a product decision note comparing the policies. Include a learner who returns after a long break and one who reviews exactly on time. Recommend a policy and explain its consequences for overdue queues. If you implement an alternative in a practice copy, keep the original source and tests available for comparison and clearly label the changed behavior.

Review note: the correct source-reading answer identifies the current action instant as the basis for the new due time. The design answer may choose another policy if it explains the learning goal and tests the edge cases. Do not mark a difference in preference as an implementation defect without a supporting requirement.

## Case five: a release passes build but fails content loading

A contributor updates a mission's reward in one generated pack, builds the frontend successfully, and opens the corresponding track. Loading fails because the pack no longer agrees with the checked-in catalog. The contributor suggests bypassing runtime validation so learners can continue reading.

The runtime rejection is evidence of a coherence problem. Bypassing it would allow a content representation to disagree with the reward authority used by save validation and progression. The immediate investigation should identify which files belong to the intended content revision and rerun the authoring validation process. Compilation alone did not establish cross-file consistency.

Create a dependency map from authoring inputs to generated pack, index, catalog, and build output. Identify which generation or validation commands the repository actually provides before inventing a repair command. Preserve the inconsistent files as disposable diagnostic fixtures if useful, but do not publish a mixed set merely because it can render. A coherent prior set may be a better rollback candidate than a selectively patched asset.

**BX-33E:** Write a release-blocking report with the exact invariant violated, the affected track, the successful checks that remain valid, and the unexecuted or failed checks. Avoid saying the whole build failed if compilation succeeded. Also avoid saying the release passed because one command did. State the smallest correction that restores coherence and the checks needed afterward.

Review note: this case rewards precise outcome accounting. Build success, content validity, browser usability, and release coherence are related but separate claims. The best report preserves each fact and explains why the failed invariant still prevents the intended delivery.

## Case six: a recovery snapshot exists but the desired sentence is missing

A learner typed a long evidence note, imported another workspace, and later looked in a recovery snapshot for the note. The snapshot contains the prior project but not the new sentence. The first response is that snapshots are unreliable.

Reconstruct where the sentence lived. Was it only in the open form, applied to the workspace draft, or accepted by Save? The snapshot branch preserves outgoing accepted workspace data when it exists. It cannot preserve text that never reached that accepted state. The hook also has dirty-state protections around replacement, so the exact sequence must account for those guards. A report that jumps directly from typing to replacement may omit an intervening apply, save, discard, or reload decision.

Use three markers in a disposable rehearsal: accepted evidence, an applied unsaved addition, and an unapplied form addition. Determine which supported actions permit progression to replacement and what preservation choices are required. Export the appropriate artifacts before discarding anything. Then inspect snapshot content and compare it with the state boundary it actually promises to preserve.

**BX-33F:** Write an improved recovery guide that names the three text locations and the export or save action relevant to each. Keep the language understandable to a learner who does not know React state. For example, distinguish text still in the editor from changes applied to the workspace and changes accepted locally. Do not promise that every export contains every visible character.

Review note: the investigation should either identify an actual preservation failure at a promised boundary or explain the missing transition in the user's mental model. Both outcomes can justify a product improvement, but they require different fixes. Better labels or a stronger unsaved-form warning may address one; transaction or export repair may address the other.

## Case seven: a correct feature has an unconvincing verification report

A developer submits a working stale-edit fix with a report saying all tests passed. The attached output shows a pure helper suite, while database integration cases were skipped because the local dependency was unavailable. The implementation may be correct, but the report overstates its evidence.

Rewrite the report without discarding the useful result. State that the pure helper suite passed, identify the behavior it exercises, and list the skipped integration scope separately. If the fix changes transaction behavior, explain why the skipped scope remains material. If it changes only a documentation label, the integration gap may be irrelevant to that change. Verification should be proportionate, but it must remain truthful.

**BX-33G:** Produce a review response that names the missing claim and the smallest meaningful check needed to establish it. Avoid requesting every test in the repository by habit. A targeted rollback or concurrent-write test may be more informative than rerunning unrelated UI snapshots. If the environment cannot run it, record a reproducible command and the limitation rather than converting not-run into passed.

Review note: trustworthy engineering communication preserves partial evidence without inflating it. A limitation does not erase completed work, and completed work does not erase a limitation. The final report should let a reviewer decide what has actually been established and what remains uncertain.

## Clinic submission

Choose three cases from different areas and submit your initial predictions, observations, revised explanations, and proposed fixes or documentation changes. Include at least one case where the correct conclusion is that the current implementation follows its contract. This guards against the habit of treating every surprising result as a reason to edit code. The core skill is diagnosis: identify the boundary, design the discriminating experiment, and change only what the evidence supports.
