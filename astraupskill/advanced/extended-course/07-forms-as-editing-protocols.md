# 07 — Treat a form as an editing protocol

## A form carries more than field values

A project form contains identity and an expected version as well as visible text. Those invisible values describe the record being edited and the state from which the edit began. [PracticeView](../../../src/PracticeView.tsx) separates the captured version from the input before calling the domain transformation. That small detail connects interface editing to the model's concurrency contract.

If you build a form by copying only visible fields, you can lose the distinction between create and update. A renamed project may be accidentally treated as a new record. A stale edit may be submitted without any expectation. A form is therefore a protocol: begin from a known record, collect an intention, validate it, apply it under its assumptions and respond to acceptance or rejection.

## Separate syntactic feedback from acceptance

An input control can provide immediate hints such as required text or a maximum length. That feedback helps the learner correct mistakes before submission. The domain validator still decides whether the resulting operation is acceptable. A browser control can be bypassed, a form can hold old data, and imported state may never pass through the form at all.

Suppose the title is nonempty but the goal is too vague to demonstrate a feature. Mechanical validation may accept the text while a reviewer asks for a more observable goal. Those judgments operate at different levels. Do not turn a minimum character count into a claim that the learner has specified a meaningful project. Instead use the form for bounded structural requirements and the course rubric for engineering quality.

Error messages should identify a next action. “Invalid” leaves the learner guessing. A message about a changed project should invite reopening or reviewing current state; a message about missing evidence should point to the required field or stage. An error that appears after the form has already disappeared may fail the recovery interaction even if the domain state remained unchanged.

## Work through create and edit separately

For create, generate a new project identity and begin without an expected existing version. Fill title, goal and status according to the current contract. Applying creates a versioned project in the workspace draft. The explicit workspace save remains a separate durability step.

For edit, retain the existing identity and captured project version. A valid edit increments the project version and preserves creation time. If the draft's current project has changed since the form opened, the operation rejects rather than treating the form as current. The user should be able to inspect their typed values and decide what to do next.

These flows share fields but not every assumption. Reusing a visual component is reasonable; erasing the distinction in the command contract is not. A useful review asks whether a helper's convenience hides create/update semantics, rather than judging reuse by the number of duplicated input elements.

## Deletion is a protocol too

The current delete action confirms the intention and explains that the deletion affects a workspace draft until saved. That wording matters because a learner can otherwise mistake disappearance from the list for durable removal. The domain delete operation also requires the expected project version and rejects missing or changed records.

A future undo feature must define which state it restores. Undoing a draft deletion before save differs from restoring a record after accepted persistence or after a workspace replacement. An “undo” button that simply re-adds an old object could collide with a newer record or restore stale versions. Begin with the smallest contract and state the boundary explicitly.

## Design around interruptions

Users navigate, filter, switch tabs and reload while editing. The practice view reports whether a form is pending and installs a before-unload interaction. The presence of such a handler is useful, but it is not a guarantee that every browser shutdown can be intercepted. A robust learning workflow still uses explicit saves and exports rather than treating a warning dialog as durable storage.

When writing a test, simulate the intended interaction rather than relying on a vague “form is accessible” statement. Can a learner focus the field, understand its label, submit it, hear or see the error and recover without losing text? Which parts require a real browser and which can be checked in a component environment? Evidence should match the claim's layer.

## Independent form assignments

**BX-07A:** Write a form-state table for create and edit. Include identity, expected version, visible fields, apply behavior and rejected-state behavior. Highlight a value that should not be editable as ordinary text.

**BX-07B:** Improve a goal prompt for Contact book. Provide three weak goals and rewrite each into an observable contract with a rejected case. Explain why a validator cannot fully automate this review.

**BX-07C:** Design a stale-edit recovery panel for a future multi-form interface. Show current accepted values beside the local draft. Specify the explicit action that adopts a new expectation while preserving chosen text.

**BX-07D:** Propose draft-only undo for deletion. Define its lifetime, identity behavior and what happens after workspace save. Write a counterexample showing why restoring an old snapshot after an unrelated accepted change needs more than reinserting an array element.

## Hints and review discussion

For the state table, start from the actual `Form` type and `apply` function rather than inventing a backend API that the application does not have. For the goal exercise, “make a contact page” lacks failure behavior; “create a contact while rejecting a duplicate normalized email and preserving the draft” gives a reviewer something to observe. The latter is still a proposed capstone contract, not an existing IPSKILL feature.

The stale panel should preserve intent while making its changed basis visible. An automatic version refresh can turn conflict handling into silent overwrite. Draft-only undo can be deliberately narrow and useful; it does not need to promise historical restoration across every accepted state. Good forms help users make informed transitions instead of concealing those transitions behind a single Save label.
