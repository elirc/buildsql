# Review guide: integration and capstones

This guide supports chapters 20-31. The early chapters examine the existing application; the contact-book chapters specify an independent proposed application. Do not report a proposed backend behavior as an IPSKILL feature. Assess your work by the evidence and contracts below rather than by whether your code matches an imagined reference implementation.

## Correction journeys and component boundaries

For BX-20A, the first submission should produce an understandable evidence error while retaining the entered title, goal, status, and evidence. The parent change callback should not run for that rejected candidate. After the learner supplies valid evidence, the component can propose the change and close the form according to its successful path. This sequence verifies recovery from an error, which is stronger than testing rejection and success in unrelated fresh renders.

The callback argument represents a workspace transformation. Applying that function to the supplied fixture lets the test inspect the proposed project. It does not establish IndexedDB durability. A correct test report says that the component applied a valid change to the parent draft, while a separate storage or browser check establishes accepted persistence. Using the word saved for both events would blur the contract the application deliberately exposes.

For BX-20B, a keyboard investigation should report the actual focused elements and whether the learner can discover and correct the error. There is no evidence-based reason to claim a complete accessibility audit from a single role query. A good proposal might focus an error summary and link to the affected control, or focus the first invalid field with a clear announcement. The proposal must be verified in the implemented interaction rather than assumed from markup alone.

For BX-20C, no projects and no matching projects are different underlying states. A message can serve both if it is accurate, but a contextual action can help: create a first project for the empty workspace, clear or adjust filters for the nonempty one. Inventing stored sample projects is not a necessary solution. For BX-20D, role and label queries generally express the behavior under test more clearly than incidental CSS classes, while focused visual tests can still inspect styling when that is the actual claim.

## Browser experiments and failure provenance

For BX-21A, the stale-save sequence needs a shared initial accepted state, distinct tab edits, a known first successful save, and the later stale attempt. The accepted read after the second attempt should contain the winner's state. The losing tab's draft should remain available for export. A screenshot of a conflict banner proves feedback, but not by itself the accepted storage or retained draft contents.

For BX-21B, pair the screenshot with structured state and an action log. The screenshot shows the visible recovery path. The state record shows the accepted identities, revisions, and markers. The action log connects them causally. A new output directory prevents artifacts from different runs being mistaken for one coherent result. Hashes can identify files, but a hash does not prove that a screenshot shows the intended step; the manifest and sequence provide that context.

For BX-21C, investigate reused state and unawaited boundaries before adding sleeps. A tab left open can hold a stale workspace; an old server can serve the wrong build; an output directory can contain yesterday's evidence. Each is a distinct hypothesis. Record which observation eliminates it. A stable test waits for a specific acceptance or rejection condition instead of assuming a delay is always long enough.

## Debugging reports and performance claims

For BX-22A, a missing project after refresh might mean it was never accepted, was filtered out, or belongs to another browser origin's storage. The first observation should narrow these possibilities, such as inspecting the accepted export or current filter. An invalid import can fail at byte size, JSON parsing, shape, or cross-field validation. A useful report identifies the first failed boundary rather than labeling every failure corruption.

For BX-22B, include exact reproduction steps and the expected contract. A report may conclude the code follows its current UTC scheduling policy while the display or documentation leaves the learner confused. That is still a useful finding. For BX-22C, a concise diagnostic event can record expected identity and revision, result category, and accepted revision after success without logging full learner evidence on every attempt.

For BX-23A, the zero/one/ten/eleven/one-hundred fixtures explore empty state, basic rendering, page boundaries, and supported scale. Equal timestamps investigate deterministic tie-breaking. Long valid fields investigate a realistic upper workload. Invalid oversized fixtures belong to rejection testing unless explicitly labeled as stress experiments. Mixing these categories makes performance conclusions difficult to interpret.

For BX-23B, memoization is useful only if its dependencies are complete and its measured benefit justifies added complexity. A stale filter result is a correctness regression even if rendering is faster. For BX-23C, distinguish cold loading from a cache hit and separate transfer from parse, validation, and display. For BX-23D, report the measured scenario and distribution; a local reduction from forty to twenty-five milliseconds is not proof of universal scalability or a meaningful user benefit on every device.

## Contact-book acceptance examples

A strong BX-24A decision record names what a contact is, who owns it, which fields are optional, how archive differs from deletion, and what version means. Email should be treated according to the declared product rule rather than assumed to be a universal identity. The record should explain why rejected alternatives do not fit this particular product. This gives later tests a source of expected behavior independent of the implementation.

For BX-24B, a complete vertical slice crosses the actual persistence boundary and reloads the accepted record. It also rejects a direct invalid request that bypasses client validation. The UI retains a rejected draft and displays the relevant error. A mocked repository can help component development, but it does not finish the durable capstone. State clearly which part has been implemented and which remains simulated.

For BX-24C, archive-versus-edit needs a concurrent example. If archiving increments version from four to five, an edit still expecting four should not silently restore active state. A deliberate restore can be a separate command based on the current version. If you choose another policy, explain it in the acceptance examples and prove it. The important requirement is that incidental stale data does not choose the policy for you.

## Relational design review

For BX-25A, the schema should enforce declared identity and uniqueness rules. Owner-scoped tag names require a different key from globally unique names. A contact-tag association needs both existence and the intended ownership relationship. Foreign keys to two independently existing rows do not automatically prove matching owners. A composite relationship or an authoritative transactional check may address this, but the chosen design must be demonstrated with a cross-owner negative fixture.

For BX-25B, a join can produce one row per contact-tag pair. Limiting joined rows can split one contact's tag set or reduce the number of distinct contacts on a page. A two-stage strategy that selects contact identities for the page before loading tags is one reasonable answer. Whatever strategy you choose, compare its output with a hand-written expected set from the small fixture. This is a better oracle than rerunning a slightly different version of the same query.

For BX-25C, adding an optional field is usually easier to preserve than making an old optional field required. The latter needs a policy for existing missing values. A migration that substitutes invented data to satisfy a constraint should disclose that substitution or avoid it. Preflight, conversion, and post-check stages let you discover incompatible rows before claiming the migration is safe.

## Versioned writes and rollback

For BX-26A, the accepted version comparison must be tied to the write. In an A-wins schedule, A changes version eight to nine and B's expectation of eight no longer holds. In the reverse schedule, B wins. If A's transaction aborts before acceptance, its attempted version change and audit entry must not survive; B can still act against the original accepted state. The exact database mechanism depends on the chosen engine, so verify its documented behavior rather than assuming an isolation guarantee.

For BX-26B, a conflict response should preserve local intent and support a deliberate comparison with authorized current data. Reloading the latest version number and automatically resending the old body undermines the meaning of the precondition. If a merge is proposed, define how it handles the common baseline, concurrent same-field edits, deletion, and aggregate invariants.

For BX-26C, a lost response after commit creates an unknown client outcome. A later stale-version rejection can be consistent with the first request having succeeded, but it can also be consistent with another request having changed the record. The editing version alone does not identify whose operation produced the new state. This is why the next chapter introduces logical operation identity rather than treating retry as an ordinary fresh edit.

## Retry receipt review

For BX-27A, same-owner same-key same-fingerprint replay should produce the defined original accepted result without another business mutation. A changed fingerprint under the same key should conflict under the proposed contract. A different owner with the same textual key must remain isolated. Concurrent first requests need an authoritative uniqueness or coordination mechanism; a process-local map alone does not establish cross-process safety.

The receipt and business effect must share the chosen atomic boundary if you promise durable replay of acceptance. A test should force a failure between the attempted mutation and receipt write and inspect accepted state afterward. For a committed lost-response case, inspect mutation count or accepted version and audit history, not just the two responses. Two successful-looking responses can hide duplicate effects.

For BX-27B, expiry defines the limit of the replay guarantee. After expiry, reconciliation may require reading the resource before issuing a new intent. The interface should not promise an old result can always be recovered. For BX-27C, the captured operation body remains stable across retry even if the current form changes. Those newer edits belong to another draft. This separation prevents one key from acquiring a new fingerprint accidentally.

## Ownership, evidence, and release

For BX-28A, every direct resource path needs the declared authorization scope. Hidden buttons are not a server-side boundary. For BX-28B, replayed responses remain protected information; key knowledge does not replace current caller authorization. For BX-28C, compare exported identities with the expected owner-specific set to detect both omissions and leaks. A count alone can miss one omitted record offset by one wrongly included record.

For BX-29A, the simplest useful improvement may be guidance around existing text rather than a new schema. The recommendation should follow from examples and learning needs. For BX-29B, bound nested list counts as well as individual strings and total encoded size. For BX-29C, allow evidence to say not run or inconclusive so the form does not pressure learners into inventing results. Preservation of old text is more important than pretending an automatic migration understands its meaning.

For BX-30A through BX-30D, accurate command accounting and coherent artifacts matter. A build, unit suite, browser rehearsal, and publication are distinct achievements. Record only executed checks as executed. Preserve unrelated local changes and explain any source-state limitation. Reproduction instructions should identify working directory and prerequisite versions, while release evidence should identify the exact artifacts assessed.

## Final integration standard

For BX-31A through BX-31D, the best submission connects form state, workspace draft, expected accepted state, and persisted state in one causal account. It proves preservation at three rejection layers, exports the losing draft, deliberately reconciles, and verifies replacement identity. The final walkthrough should explain why each artifact exists and which claim it supports. A reader should not need to trust the author's confidence; the sequence and evidence should make the conclusion inspectable.
