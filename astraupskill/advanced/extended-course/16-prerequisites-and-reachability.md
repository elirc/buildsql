# 16. Prerequisites and reachability

An unlocked lesson is a statement about a learner's recorded history. It is not simply a visual property of a button. In [progression.ts](../../../src/progression.ts), the application has helpers for lesson presentation, mission presentation, and authoritative completion eligibility. Read `lessonUnlocked`, `missionUnlocked`, and `canComplete` together. Ask what data each function receives and whether that data alone is enough to enforce the whole progression rule.

`lessonUnlocked` examines earlier lessons in the provided array and requires their core missions to be completed. `missionUnlocked` examines missions within one lesson. `canComplete` looks up a known mission in the checked-in catalog and derives earlier core requirements within its track. These functions operate at different scopes. A mission can appear locally ready within a lesson while the complete action still needs to account for earlier lessons. The authoritative transition calls `canComplete` before awarding completion.

## Derive the rule from a small course

On paper, define lesson A with core missions A1 and A2 and challenge A3. Define lesson B with core B1 and extension B2. At the beginning, A1 has no earlier core prerequisites. A2 requires A1. A3 requires both A1 and A2. B1 requires earlier lesson cores A1 and A2, but it does not require A3 merely because A3 is an earlier optional challenge. B2 requires A1, A2, and B1. Draw directed arrows from each required mission to the mission it enables.

Now compare the diagram with the loops and slices in the real functions. The point is not to replace this compact implementation with a graph library. The graph makes dependency meaning visible. It also helps detect accidental coupling to optional missions. If your diagram requires every challenge before advancing, you have described a different curriculum policy and should label it as a proposal.

## Historical completion is a deliberate exception

`canComplete` returns true for a known mission that is already recorded as completed before checking its current prerequisites. The existing tests explain the intended use: known historical out-of-order completions remain reviewable. This is an important distinction between eligibility for first completion and eligibility for reviewing an existing achievement. A curriculum can evolve after a learner has already made progress.

Do not mistake that exception for permission to import arbitrary forged history. `validateSave` still validates the save and the relationships among completion, rewards, attempts, and review records. The lesson here is narrower: the completion action's prerequisite gate recognizes already-completed known missions. State exactly which layer enforces which fact. Combining all validation into the phrase the app checks everything hides the parts a maintainer needs to understand.

## Exercise BX-16A: build an eligibility truth table

Use the miniature two-lesson course to predict first-completion eligibility for every mission under five histories: none completed, A1 only, A1 and A2, all cores, and a valid historical record containing B2. For each cell, write the smallest missing prerequisite or the reason eligibility is allowed. Then choose actual catalog missions with the same relationships and investigate the real helpers using valid fixtures.

When constructing a historical fixture, include all required companion records. A completion timestamp alone may be rejected as disconnected history before eligibility is checked. This is a good example of layered test setup: the fixture must satisfy the save contract to reach the rule you want to study. Keep the fixture builder readable enough that a reviewer can distinguish preparation from the actual behavior under test.

## Exercise BX-16B: compare UI and action boundaries

Find the caller of each unlocking helper. Record whether it controls navigation, enabled state, explanatory text, or an actual state transition. Imagine a user opening a mission from an archive route. Explain why a disabled button elsewhere is insufficient protection. The state-changing function must enforce its own prerequisites because there may be multiple entry points and future callers.

Your answer should also avoid treating every duplicate check as waste. A presentation check can help the learner understand what to do next, while the action check protects the invariant. They serve different audiences. The maintenance challenge is keeping their rules consistent, which can be addressed with shared helpers and tests rather than by removing all presentation feedback.

## Exercise BX-16C: propose branching prerequisites

As a future design, let a learner unlock an advanced lesson after completing either a SQL path or a TypeScript path. Write the rule in terms of explicit all-of and any-of groups. Explain how you would detect unknown mission references and cycles at authoring time. Decide how historical completions behave when a prerequisite group changes.

A valid proposal includes at least one example where a naive flat list produces the wrong result. If the rule is complete SQL1 and SQL2, or complete TS1 and TS2, a flat any-of list would unlock after just SQL1. A flat all-of list would require all four. The grouping is part of the meaning, so it belongs in the data model and in the tests.

## Review discussion

Progression rules are small policy engines. Their correctness depends on mission identity, ordering, history, and the distinction between first completion and review. A strong submission derives the rule from source, predicts a matrix of cases, and describes proposed extensions without pretending they already exist. The most valuable artifact is often the eligibility table: it gives designers, testers, and developers a shared language for discussing progression changes.
