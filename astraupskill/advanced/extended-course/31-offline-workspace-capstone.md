# 31. Capstone: an offline workspace investigation

This final integration capstone uses the existing IPSKILL application as its subject. It does not require building a remote service. Your goal is to explain and verify the complete life of a practice project: form input, validated draft, accepted local workspace, exported artifact, conflicting edit, recovery, and later review. Use a disposable browser profile and synthetic project text.

## The scenario

Create a project called Recovery notebook with an observable goal describing a small contact-book feature. Apply it to the workspace draft and save the workspace. Record the accepted workspace identity, revision, project identity, and project version. These four values have different meanings. The workspace identity distinguishes replacements, the workspace revision orders accepted local saves, the project identity names the project, and the project version detects stale project edits.

Open a second tab from the accepted state. In the first tab, edit the goal and save. In the second, edit the title using its stale workspace view and attempt to save. Observe the conflict and preserve the second tab's draft. Do not resolve it by clearing storage. Your task is to explain which copy contains each change and how the learner can recover deliberately.

## Required artifacts

Produce a transition ledger with one row per user action. Include the relevant identities and versions, dirty state, visible feedback, and accepted storage observation. Add a diagram showing which operations are pure transformations and which cross a persistence boundary. Keep exported accepted and draft files separately named. Finally, write a recovery narrative that explains which artifact you used and why.

The ledger should distinguish form state from workspace draft state. Text still inside an unapplied form may not be present in an export of the workspace draft. Inspect the actual workflow and record when the form is applied. This is an important boundary that broad phrases such as my changes can conceal. A complete account names the exact state holder.

## Exercise BX-31A: prove preservation on rejection

Trigger three different rejections: insufficient completion evidence in a project form, a stale project operation in an isolated pure-function fixture, and a stale workspace save across tabs. For each, identify the rejected candidate and the state that must remain intact. Use a different recognizable marker for each case.

Do not assume that all three rejections occur at the same layer. The form validates a project candidate before applying it. The project helper checks expected project version against its workspace input. The storage transaction checks accepted workspace identity and revision. Your explanation should connect the layers without collapsing them into one generic validation event.

## Exercise BX-31B: recover through export and reload

After the stale workspace save, export the losing draft and inspect that it contains the intended unsaved change. Then reload accepted data through the supported workflow. Compare the accepted state with the exported draft. Write a deliberate merge plan for the two independent edits, or explain why one should be discarded.

If you apply a merged candidate, base it on the current accepted state and validate it through normal operations. Do not edit the storage record directly to bypass version checks. The learning objective is to preserve and reconcile user intent while respecting the application's acceptance boundary. Direct storage editing belongs only in explicitly isolated fault-injection fixtures.

## Exercise BX-31C: test replacement identity

Export a valid workspace, make another accepted change, then rehearse replacement through the supported settings workflow after preserving any drafts. Record the new workspace identity and reset revision. Keep an older tab open and predict its next save result. The older tab's obsolete identity should matter even if a numeric revision happens to match.

Inspect the recovery snapshot's content to determine which outgoing accepted workspace it preserved. Do not infer this solely from a timestamp or filename. The content markers should distinguish the outgoing accepted state from the incoming replacement and any unsaved draft. This three-way distinction is the core of the recovery investigation.

## Exercise BX-31D: present the investigation

Prepare a ten-minute walkthrough for another learner. Start with the user problem, show the state diagram, reproduce one rejection, and demonstrate recovery. Use source function names to support the explanation, but keep the main narrative understandable without reading every implementation line. Answer why the application cannot simply save the stale tab automatically.

Include one limitation you discovered. It might concern the difference between text evidence and executed code, local browser storage versus remote backup, or a proposed merge feature that does not exist. A limitation should be specific and supported. Avoid a generic warning that all software can fail.

## Assessment rubric

Award twenty-five points for a correct state and identity model, twenty-five for controlled rejection experiments, twenty-five for recovery evidence, and twenty-five for a clear explanation with reproducible artifacts. A submission that loses the only copy of the losing draft cannot receive full recovery credit. A submission that bypasses normal acceptance by editing storage cannot claim to have verified the supported user workflow.

## Review discussion

This capstone brings together the course's central skill: tracing a concrete user intent through distinct state boundaries and proving what each observer can see. The result should be a small, coherent evidence package. Another learner should be able to repeat your actions, predict the same accepted state, and understand how the application preserves work when an operation is rejected.
