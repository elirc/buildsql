# 29. Design project: structured learning evidence

The current IPSKILL save stores written work as text associated with mission identity. Completion requires sufficient written evidence, but the application does not automatically judge the semantic quality of that evidence. Read [contracts.ts](../../../src/contracts.ts) and [progression.ts](../../../src/progression.ts). This chapter proposes a future structured evidence format and asks you to evaluate it before changing the application.

## Start from a learning problem

Suppose learners often record only it worked and later cannot remember what they tested. A structured form could ask for a claim, method, observation, boundary case, and reflection. That might improve recall and review. It could also create friction or force unsuitable categories onto every mission. Begin by collecting three example missions with different outputs: a SQL query, a TypeScript function, and a user-interface interaction. Determine which evidence fields help all three and which should remain optional.

Avoid equating structure with truth. A filled observation field can still contain an invented result. The software can validate shape, length, and known categories; a reviewer may still need to assess correctness. State those limits in the design. The goal is to make good evidence easier to record and review, not to advertise automated verification that the application does not perform.

## Define the proposed representation

One candidate format contains a version, a summary, a list of observations, optional reproduction steps, and a reflection. Each observation might include an input description, expected result, actual result, and outcome category. Decide whether outcome categories include not-run or inconclusive. Those states are valuable because they let learners distinguish a planned experiment from an executed one.

Bound the representation. A list without a maximum length can undermine the workspace size budget even when individual strings are bounded. Repeated nested structures can also make validation and rendering expensive. Define maximum observation count and field lengths, then retain the overall encoded workspace limit. Explain why local field bounds and a global size bound solve different problems.

## Preserve old evidence

Existing text should not be silently discarded because a new form expects structured fields. Propose a migration that preserves the original text in a legacy-note field or a clearly labeled imported observation. Do not pretend that an old paragraph can be reliably split into claim, method, and result without review. A deterministic preservation rule is safer than an invented semantic conversion.

Consider reversibility. If a learner exports a new-format workspace, an older application may reject it. Decide whether the project needs a text-only compatibility export and what information it loses. The migration chapter's loss-report principle applies here: a downgrade can be useful if the user understands which structure will be flattened.

## Exercise BX-29A: compare three designs

Compare plain text with guidance, a fixed structured form, and a flexible list of evidence entries. Evaluate learning usefulness, authoring effort, validation complexity, migration cost, and accessibility. Use the three chosen missions as worked examples. A comparison that only lists abstract advantages is weaker than showing what each learner would actually enter.

Recommend one design for a small first iteration. It may be improved prompts around the existing text area rather than a schema change. Explain how you would evaluate the effect: perhaps by reviewing whether submissions include a reproducible observation, not by counting characters. Keep the metric connected to learning quality.

## Exercise BX-29B: specify validation and rendering

For your selected structured design, create valid, missing-field, unknown-field, excessive-count, excessive-size, and unsupported-version fixtures. Include text containing Markdown punctuation and code-like strings. Decide how the UI displays that content without treating learner text as executable application code. Consult the actual rendering path before making claims about existing behavior.

The renderer should handle long content without making navigation unusable. Describe headings, collapsible details if appropriate, and an accessible reading order. A schema that is easy for a machine to validate may still be cumbersome for a person to review. Include a sample rendered outline as part of the proposal.

## Exercise BX-29C: design evidence review

Write a review rubric that distinguishes an unsupported assertion, a source trace, a simulated prediction, and an executed experiment. All can contribute to learning, but they should not be mislabeled. A source trace predicts behavior under stated assumptions; an executed test adds observation from a specific environment. A screenshot can document appearance without proving hidden persistence state.

Apply the rubric to three sample submissions of your own. Show how a learner can improve each one with the smallest useful addition. This keeps feedback actionable. Instead of saying needs more detail, ask for the missing fixture, boundary result, or reproduction command that would make the claim assessable.

## Review discussion

Structured evidence is a product and pedagogy decision as much as a schema decision. The best proposal preserves existing work, makes uncertainty expressible, keeps resource bounds clear, and improves the learner's ability to explain what they actually verified. Submit the comparison, migration rule, validation fixtures, and reviewed examples before implementing a broad format change.
