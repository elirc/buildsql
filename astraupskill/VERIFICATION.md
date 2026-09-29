# Verification status and practical limits

The application passed 69 distinct checks on September 9, 2026: 28 domain and project tests, four component tests, 11 content tests, seven isolated authoring checks and 19 real-browser scenarios. Dependency installation, TypeScript, complete content validation and the Vite production build also completed successfully. The central implementation report records the separate delivery step after finite-file and original-source comparisons.

## Recorded command outcomes

| Gate | Outcome | Evidence in central `checks/buildsql` |
| --- | --- | --- |
| Locked dependency installation | Exit 0; 259 packages installed | `install-01-execution.json` |
| TypeScript | Exit 0 | `typecheck-03-execution.json` |
| Domain, component and content tests | 43 passed | `tests-03.json`, `tests-03-execution.json` |
| Complete published content validation | Exit 0 | `content-01.log`, `content-01-execution.json` |
| Production build | Exit 0 | `build-01.log`, `build-01-execution.json` |
| Isolated authoring command checks | Seven passed | `authoring-01/results.json`, `authoring-01/commands.log` |
| Disposable Chromium interaction | 19 passed | `browser-01/results.json`, `browser-01-execution.json` |

The browser suite exercised explicit empty initialization, draft versus accepted state, rejected completion evidence, practice creation/edit/deletion, literal search and pagination, navigation guards, archived mission gating, self-review without repeat XP, competing tabs, a real IndexedDB abort after a successful put, rejected malformed imports, reviewed replacement, stale workspace identity rejection, exact recovery downloads, responsive forms, supported legacy migration, malformed legacy preservation, corrupt active-data export and final reload. A passing save checks the accepted-state transition and disabled save button, not merely an old success message.

The authoring suite runs the actual command-line scripts against small synthetic workspaces. It proves coherent candidate output, byte-preserved published inputs, refusal to overwrite an existing candidate, rejection of missing text, duplicate lessons and unsafe path names, ten-mission assembly, and duplicate section rejection. Those checks do not publish a curriculum release or judge whether an explanation teaches the right concept.

## Corrections made during verification

The original shared test setup assumed `window` existed. Node-environment tests therefore failed before executing their assertions. A browser-environment guard fixed that setup boundary. The next run passed 41 of 43 tests; parsing the complete SQL pack and rendering a form exceeded the default five-second deadline on this machine. The suite now uses a 30-second correctness-test timeout. All 43 assertions passed on the rerun, without weakening them or skipping large content. This timeout is not a performance target or a claim that the application handles arbitrary datasets.

Screenshot review led to a separate evidence refinement: scroll to the document top and wait for animation frames before full-page captures, and capture the responsive form itself instead of including ten unrelated cards underneath it. The original 19-scenario run passed; repeated scenarios used to refine screenshots are not counted twice. Final image provenance and any repeat-run outcome are recorded with the central aggregate results.

## Visual walkthrough

- [Rejected evidence with retained form](images/01-rejected-practice-form.png)
- [Accepted practice project](images/02-practice-project.png)
- [Search and status filtering](images/03-filtered-projects.png)
- [Written self-review workspace](images/04-self-review-workspace.png)
- [Reviewed import and recovery snapshot](images/05-reviewed-import.png)
- [Desktop form](images/06-practice-form-1440.png), [tablet form](images/06-practice-form-800.png) and [phone form](images/06-practice-form-390.png)
- [Accepted projects after final reload](images/07-final-practice-list.png)

The intended verification covers four distinct boundaries. Domain tests exercise progress, rewards, recall, import validation and practice-project rules. Component tests exercise retained input and visible list behavior. Content checks load the actual preserved curriculum packs and reconcile them with the compact catalog. Browser checks exercise the running application, real IndexedDB transactions, explicit saves, conflicting tabs, recovery and responsive layouts. Repeating a suite after a fix is necessary evidence but does not create additional unique scenarios.

The preserved archive contains six tracks, 310 lessons and 2,155 missions based on the parsed source packs. Structural validation can check identities, counts, fields and reward consistency. It does not establish that every historical explanation or reference solution is correct. Commands and source paths in those lessons refer to original workspaces; this repository does not include all of those runtimes or execute their graders.

The current product is a local browser application. It has no server-side account system, collaborative merge service, cloud synchronization, persistent storage guarantee or automatic backup scheduler. Written self-review and evidence length requirements do not certify that code is correct. CRUD practice tracks the learner's work; the backend, ownership and booking tickets remain explicit future exercises.

Workspace data is bounded to 8 MiB, mission notes to 100,000 characters per known mission, practice projects to 100 records and recovery snapshots to ten. Replacements refuse a full snapshot store. Imports validate the current or known legacy structure and preserve earlier accepted data through snapshots; incompatible historical data requires manual review. The legacy localStorage value is not rewritten or deleted by migration.

Browser evidence on one Windows machine cannot establish all-browser support, full accessibility conformance, arbitrary power-loss durability or behavior under every quota policy. The transaction checks have a narrower purpose: confirm that the application acknowledges completed transactions, rejects stale expectations and retains drafts and accepted data in the exercised failure cases. Read the [testing guide](04-TESTING-AND-DEBUGGING.md) before reproducing failure injection in a disposable profile.

## Final screenshot and delivery evidence

The refined browser-02 run passed all 19 scenarios again, exiting 0 in 181.31 seconds against the same production build. All nine delivered screenshots come from that run and were visually inspected. The rejected form capture now keeps the sticky navigation at the top; the three responsive form images show the actual form at 1440, 800 and 390 pixel viewport widths. Labels, inputs and actions remain visible, with no horizontal overflow detected. The long final-list image documents the accepted 13 projects and pagination after reload; use the focused form images for close reading. All eight original public/content JSON files were compared against their baseline SHA-256 hashes and remain byte-identical. Aggregate results total 69 distinct scenarios; reruns are retained as provenance, not added to that count.
