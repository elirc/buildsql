# IPSKILL: build reliable CRUD behavior while studying six tracks

This course follows the application in this repository. IPSKILL contains a preserved learning archive with 310 lessons and 2,155 missions across SQL, TypeScript, Node, React, C# and .NET. The browser presents that archive, records your written self-review, schedules recall, and tracks applied CRUD projects. It does not contain all the source workspaces or execute the commands mentioned in archived lessons. A button click is evidence that you recorded a decision, not evidence that a compiler accepted a solution.

Start with the root [setup guide](../README.md), then create an empty local workspace in a disposable browser profile. The application uses IndexedDB in that browser. There is no account, shared backend or cloud synchronization. Keep your regular work in its existing profile and use exports when transferring between profiles or origins. Changing a localhost port changes the storage origin, so an apparently empty workspace on a new port does not demonstrate that old data disappeared.

Follow these files in order:

1. [Codebase map](01-CODEBASE-MAP.md): trace input, validation, persistence and acknowledgement.
2. [Concepts](02-CONCEPTS.md): distinguish drafts, project versions, workspace revisions and identities.
3. [Worked change](03-WORKED-CHANGE.md): implement a review-ready practice project with rejected-path evidence.
4. [Testing and debugging](04-TESTING-AND-DEBUGGING.md): investigate the layer that actually failed.
5. [Practice tickets](05-PRACTICE.md): extend the application in progressively harder steps.
6. [Solutions and review](06-SOLUTIONS-AND-REVIEW.md): assess behavior and tradeoffs.
7. [Trace lab](07-TRACE-LAB.md): explain successful and rejected operations without guessing.
8. [Verification](VERIFICATION.md): separate executed checks from planned checks and practical limits.

For your first session, open CRUD practice and create a project called Contact book. Write a goal such as: “Create, list, edit and delete contacts while rejecting a duplicate email and retaining the rejected form.” Apply the form to the workspace draft. Observe that the list changes while the toolbar still says unsaved. Click Save workspace, wait for the saved revision, then reload. Explain the difference between those two buttons before implementing a new feature.

For your second session, open the same workspace in two tabs. Make a different draft change in each. Save the first tab, then try the second. Export the second draft before loading current accepted data. Compare the exported document with the current workspace. The conflict protects a complete aggregate; it does not automatically merge independent projects. Being able to name that limitation is part of mid-level engineering judgment.

For your third session, complete the first available mission through written self-review. Record the command you ran in its actual source workspace, the expected result, the result you observed, and one case that should fail. The browser requires written evidence, but a minimum character count cannot determine whether the reasoning is correct. Ask a reviewer to reproduce the result. Repeat a mission and confirm that it does not earn new XP merely because you clicked again.

Use the archive as a reference while building one small product end to end. SQL helps you define records and constraints; TypeScript clarifies contracts; React teaches controlled forms; Node or .NET supplies an HTTP boundary when you undertake the backend exercise. Do not begin by combining all six stacks in one application. Pick one frontend, one backend and one persistence system, and make rejected writes as understandable as successful writes.

The old application is retained under [docs/original](../docs/original/src__App.tsx.txt). Compare it with the current implementation to see concrete changes: automatic unacknowledged localStorage writes became explicit transaction-backed saves; invented challenge counts became catalog-derived counts; and a misleading execution button became an explicit self-review action. Preserve those behavioral improvements when you refactor.

## Prerequisites and glossary

**Prerequisites:** React components with `useState` and controlled inputs; TypeScript interfaces and unions; promises that can reject; enough data modelling to know a duplicate email should be refused. The `buildwhiteboard` course here is a natural predecessor.

| term | meaning | where in this project |
| --- | --- | --- |
| workspace | the whole aggregate this app saves and loads as one unit | `Workspace` in `src/contracts.ts`, created by `newWorkspace` in `src/storage.ts` |
| draft | the edited in-memory copy; the list can change while nothing is durable | the `draft` state in `useWorkspace` in `src/useWorkspace.ts` |
| revision | the integer on the accepted workspace that detects another tab saving first | `revision` on `Workspace` in `src/contracts.ts`, checked in `commit` |
| accepted data | what the database holds, as opposed to what the form shows | `readWorkspace` in `src/storage.ts` |
| conditional commit | the write comparing expected id and revision inside one IndexedDB transaction | `commit(db, draft, expected)` in `src/storage.ts` |
| conflict | the rejection when that revision no longer matches; the draft is kept | `ConflictError` in `src/storage.ts` |
| validation | the shape and rule check on every read, write and import | `validateWorkspace` and `validateProject` in `src/contracts.ts` |
| project status | the four-state lifecycle a practice project moves through | the `statuses` tuple in `src/contracts.ts` |
| evidence gate | review and complete demand progressively longer written evidence | the `status` checks in `validateProject` in `src/contracts.ts` |
| self-review completion | recording a mission outcome in writing; it earns XP once, not per click | `canComplete` and `completeMission` in `src/progression.ts` |
| catalog-derived count | totals read from shipped content rather than hard-coded numbers | `src/catalog.json` loaded by `src/content-loader.ts` |
| export / import | the only way data crosses profiles or ports, since storage is per origin | `downloadText` in `src/useWorkspace.ts`, `importWorkspace` in `src/storage.ts` |

