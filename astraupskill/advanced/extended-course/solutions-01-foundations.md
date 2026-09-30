# Review guide: foundations and state ownership

Use this guide after attempting chapters 01-10. It gives reasoning standards and worked counterexamples rather than a single code patch. Many exercises ask for a design proposal, so more than one implementation can be correct if its contract is explicit. Keep your own answers beside the guide and revise the reasoning you cannot support from source.

## Source tracing and exports

For BX-01A, the deletion button's confirmation describes removal from the workspace draft. The domain helper validates the workspace, finds the project, compares its expected version, and returns an aggregate without that project. The hook's edit path receives the change and marks the working draft dirty. Only an explicit save reaches the storage commit boundary. A correct trace therefore has two successful events: draft removal and accepted persistence. Stopping at the first event does not prove that a reload will preserve the deletion.

A useful counterexample is a project removed from the draft while accepted storage still contains it. Export the draft and accepted raw data before saving. The former should omit the project; the latter should still contain it. This answers BX-01B with an observable difference instead of relying on filenames. If the two exports match in your experiment, check whether you accidentally saved first or exported before applying the form change. The fixture must deliberately create divergence.

For BX-01C, the in-flight ref is a useful candidate. The hook checks it synchronously before beginning an action and sets it before awaiting work. Rendered busy state communicates to the interface, while the ref provides a current guard inside event handling. Replacing it with state without analyzing scheduling can leave a window in which another call sees an old rendered value. The correct conclusion is that a ref has a specific coordination role, not that every ref in every hook is necessary.

## Models and cross-map consistency

For the proposed next-action field, a reasonable mechanical contract is bounded nonblank text required when a project is building, with a migration default or an explicit incomplete state for older projects. That rule cannot prove the action is useful. Compare investigate database with run the duplicate-email fixture and record whether the second insert is rejected. The latter names an observable experiment. A reviewer assesses that distinction; a character-count validator does not.

For structured evidence, preserve a legacy paragraph as original text with unknown observation time unless the source provides a trustworthy timestamp. Do not assign the migration time as the time the experiment happened. If you need a conversion timestamp, name it convertedAt and distinguish it from observedAt. This simple naming discipline prevents invented historical certainty. A manual keyboard observation can be valid evidence without a shell command, so a command field should not be required for every category.

The save maps reference known mission identities. Unknown keys cannot be made valid by supplying plausible values. Completion, reward, attempt, and review records also have relationships: an earned reward must agree with the known mission and its completion history. Written work can exist before completion, so not every map needs identical keys. A good diagram shows actual required relationships instead of drawing equality signs between all five maps. Read the validator to identify which inclusion relationships it enforces.

## Boundary fixtures

For BX-03A, distinguish a form parser from the imported numeric contract. A form may intentionally parse the text 4 into a number after checking its syntax. The bounded integer validator accepts the numeric value four when it is within bounds. It rejects a fraction, a string, null, a disallowed negative value, or a value above the chosen maximum. The form's willingness to parse text does not require the JSON import format to accept numeric strings.

For BX-03B, a timestamp missing the canonical millisecond UTC form is a representation case. A canonical instant on a day before lastActive is a chronology case for mission completion. Keep other fields valid in both fixtures. If you use an invalid Date object, you are testing finite-time validation, not the canonical serialized timestamp helper. The input type and boundary determine which claim the experiment supports.

For BX-03C, a project with one extra property fails the exact-field contract even if every recognized field is valid. A future supported field requires a coordinated format change, validator update, and migration policy. Removing all unknown-field checks would be a broad compatibility decision, not a narrow implementation of one field. A strong proposal explains how old and new formats are recognized and what an older reader does with a newer export.

## Two levels of versioning

For BX-04A, start with W/15 containing P/3 and Q/9. Tab A edits P to P/4 and saves W/16. Tab B's candidate still contains P/3 even if its intended change is Q/10. Accepting B's whole aggregate would restore P's old fields and lose A's edit. The storage conflict protects the aggregate. It is not evidence that Q's own version changed in A's tab.

For BX-04B, use two valid workspace identities with the same revision. An old tab expects W/0 while accepted storage now contains R/0 after replacement. The identity mismatch must reject the save. If you deliberately remove identity comparison in a disposable mutation experiment, a test that compares only numeric revisions would miss the problem. Keep the draft's own relationship to its expectation valid so the intended identity check is isolated.

A future merge for BX-04C needs a common baseline. If only local P differs from the baseline, local P may be a candidate for the merge. If only accepted P differs, keep accepted P. If both differ, compare the changes under an explicit policy. Delete-versus-edit is a conflict unless the product defines a deliberate precedence. Two added projects may have distinct identities but duplicate normalized titles, so the final merged workspace must still pass aggregate validation. Independent identities do not guarantee a valid combination.

For BX-04D, refreshing only the expected revision before resending the old aggregate makes the request falsely claim a current basis. The concrete P/Q example above demonstrates the loss. A better recovery preserves the stale draft, loads accepted data, and lets the learner reapply or merge the intended changes deliberately. A retry control should not turn a conflict into silent overwriting merely to make the error disappear.

## Pure transformations and history

For BX-05A, creation keeps the supplied new project identity, starts its project version at one, and uses the supplied time for creation and update. A valid edit preserves identity and creation time, increases the project version, and uses the supplied time for update. A stale edit throws before returning a candidate. Deletion requires a matching existing project and expected version. None of these pure operations commits storage or changes the original workspace value.

The archive proposal in BX-05B must account for the current finite status set and exact field shape. Adding archived as a status changes status validation and display filtering. Adding a flag changes shape and migration. Moving projects to another collection changes aggregate structure and identity lookup. There is no free option; choose based on the user workflow and explain compatibility. An answer that adds a boolean only to the TypeScript type is incomplete.

For BX-05C, preserve a serialization of a valid fixture before a deliberately mutating operation, then compare afterward. This catches a changed nested title in that fixture. It does not prove purity for every unsupported object type or prove anything about browser persistence. A deep-freeze experiment can provide another signal, but its behavior depends on execution mode and the objects frozen. State the detector's scope rather than promoting it into a universal proof.

For BX-05D, assert stable identity, preserved creation time, incremented version, expected update time, requested field changes, and unchanged unrelated projects. Also inspect the original input. These assertions reject an implementation that creates a fresh project with the right title but loses continuity. They turn a superficial happy-path test into a contract test.

## Interface and transaction review

For chapters 06-10, a strong state diagram distinguishes form, working draft, expected accepted state, and current persisted state. The form can contain text not yet applied to the draft. The draft can contain changes not yet accepted by storage. The expected state can become stale when another tab saves. A successful transaction returns a new accepted value, which the hook uses to update its expectation and clear dirty state.

When evaluating asynchronous feedback, ask which event justifies each message. Starting a save justifies busy feedback. A completed transaction justifies accepted-local feedback. A rejection justifies an error and retained draft. A request callback inside the transaction is not the final acceptance event. This reasoning catches premature success messages and incorrect cleanup that clears valuable drafts after failure.

The final foundation check is an oral explanation: choose one action and say what is known after each boundary. If you cannot distinguish a valid candidate from accepted storage, revisit the source trace. If you can, you have a reusable method for reading larger applications without confusing UI activity with durable state.
