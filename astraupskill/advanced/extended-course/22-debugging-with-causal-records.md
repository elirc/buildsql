# 22. Debugging with causal records

When a learner says my work disappeared, several different events may fit that description. A form may have closed without applying, a draft may not have been saved, a filter may hide a project, another tab may have replaced the workspace, or a malformed stored record may prevent loading. Good debugging separates these hypotheses using observations. Start with [PracticeView.tsx](../../../src/PracticeView.tsx), [useWorkspace.ts](../../../src/useWorkspace.ts), and [storage.ts](../../../src/storage.ts).

## Build a causal timeline

Record the last known accepted workspace identity and revision, the action the learner took, the feedback shown, and the next observation. Avoid filling gaps with assumptions. If you do not know whether Save completed, write unknown. A timeline with one honest gap is more useful than a confident narrative that silently assumes acceptance.

For a worked example, a learner creates a project, clicks Apply to workspace draft, then closes the page. On reopening, the project is absent. The first hypothesis is not necessarily database corruption. Trace whether Apply updates only the draft and whether Save was performed. The debugging question is which boundary the user crossed, not whether they clicked a button with a positive-sounding label.

Another learner reports that a project disappeared after changing a status filter. The accepted workspace may still contain the project. Inspect query, status, pagination, and actual records before proposing recovery. A filter issue and a persistence issue can have the same visible symptom but require very different actions. Exporting and replacing data prematurely would make the investigation more confusing.

## Separate facts, hypotheses, and interventions

Create three columns in your notebook. Facts are observations such as accepted revision is twelve or the title exists in a raw export. Hypotheses explain facts, such as the current status filter excludes the project. Interventions are actions designed to test a hypothesis, such as clearing the filter. Write the expected observation before performing the intervention.

This practice prevents random changes from destroying evidence. Reloading, clearing storage, reinstalling dependencies, and resetting a workspace are large interventions. They may change several variables at once. Prefer the smallest reversible observation that distinguishes two hypotheses. Reading a draft export or checking a filter state can be more informative than restarting the entire application.

## Proposed diagnostic events

As a design exercise, propose a small diagnostic record for save attempts. It might contain an operation label, expected workspace identity and revision, result category, accepted revision, and elapsed time. It should not need to include full learner evidence text. The purpose is to explain the state transition, not collect every input.

Do not claim the application currently emits this event schema. Define it as a proposed improvement and identify where each field becomes available. Expected revision exists before commit; accepted revision is known only after success. A failed operation should not invent an accepted revision. A correlation identifier can connect related events, but it is not itself a deduplication guarantee or an authorization mechanism.

## Exercise BX-22A: triage five reports

For each report, write two plausible hypotheses and one low-impact discriminating observation: project missing after refresh, import says invalid, Save conflicts, review appears early, and content page is empty. Use actual source boundaries. For an early review, compare stored UTC due time with display time and the supplied current instant. For an empty content page, distinguish a fetch failure from a validated empty filter result.

Your answer should avoid a universal clear-cache remedy. There are multiple caches and storage layers, and clearing the wrong one can erase useful evidence without addressing the cause. Name the resource you intend to inspect or change. If an action is destructive, explain what must be preserved first in the rehearsal.

## Exercise BX-22B: write a minimal bug report

Choose one reproducible behavior from a disposable investigation. Include the project version or file revision available to you, environment facts relevant to the issue, initial data, exact steps, expected result, observed result, and the smallest supporting artifact. Distinguish a confirmed bug from an unclear product expectation.

A report saying review time is wrong is weak. A report saying completion at a specified UTC instant produces a due timestamp three fixed days later while the local display crosses daylight saving is much more precise. It may reveal correct behavior under the current policy rather than a bug. Good debugging is allowed to conclude that documentation or expectations need improvement.

## Exercise BX-22C: review a proposed log

Imagine a diagnostic statement that serializes the entire workspace on every save attempt. Evaluate its usefulness, size, exposure of learner text, and duplication of existing exports. Propose a smaller record that still distinguishes stale identity, stale revision, validation rejection, and successful acceptance. Keep detailed content capture as an explicit local troubleshooting action when it is actually needed.

## Review discussion

Debugging becomes faster when records preserve causality rather than volume. Name the state boundary, preserve uncertain facts, choose interventions that distinguish hypotheses, and collect only the evidence needed for the claim. The final artifact for this lesson is a causal timeline and a concise bug report that another developer can reproduce without reconstructing the whole conversation.
