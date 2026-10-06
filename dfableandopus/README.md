# Interview preparation from IPSKILL (buildsql)

Despite the folder name, this project is a React and TypeScript application that displays a preserved curriculum archive and keeps a local practice workspace in IndexedDB. Six tracks, 310 lessons and 2,155 missions are read-only content; the writeable part is a workspace holding save progress and up to 100 practice projects. The `astraupskill/` course walks the draft-to-accepted path and its validation. This folder turns the same project into hiring material.

## The pitch

"I built a local-first CRUD workspace with the concurrency story made explicit. Edits go into an in-memory draft, and nothing is durable until an explicit save. The save is a conditional commit: inside one IndexedDB read-write transaction, `commit` re-reads the stored workspace, compares its id and revision against the caller's expectation, and throws a `ConflictError` if either moved (`src/storage.ts:121`). The draft is never discarded on conflict, and the message tells the user to export it before loading current data. Individual practice projects carry their own `version`, so `putProject` refuses a stale edit independently of the workspace revision (`src/progression.ts:165`). Validation is total: `validateWorkspace` rejects unknown or missing fields, duplicate project titles compared case-insensitively, a save whose completion, reward, review and attempt histories disagree, and anything over 8 MiB. 43 unit and component tests pass, alongside 19 real-Chromium scenarios and seven authoring-command checks."

## Which stack this maps to

TypeScript, React 19, Vite, Vitest and IndexedDB, with no server. Chapter `astraupskill/08-BACKEND-TICKET.md` supplies the bridge a backend interview needs: the same design as an Express and `node:sqlite` contacts API, with `If-Match` carrying the version, 428 when it is missing, 409 when it is stale, and a `UNIQUE INDEX` on `lower(email)` for the case-insensitive duplicate rule. The answers here use that mapping rather than pretending the browser code is a server. Two things to volunteer: there is no authentication or multi-user model at all, and the archive's structural validation checks identities, counts and rewards but does not establish that any historical lesson explanation is correct, which `astraupskill/VERIFICATION.md` says directly.

## Two weeks

Only two of the planned files exist in this folder; the rest of the plan uses material already in `astraupskill/`.

- Days 1-3: [01-INTERVIEW-QUESTIONS.md](01-INTERVIEW-QUESTIONS.md) with `src/contracts.ts` and `src/storage.ts` open.
- Days 4-5: [02-STORIES-AND-RESUME.md](02-STORIES-AND-RESUME.md).
- Days 6-8: code reading, cold and timed — the step table in [01-CODEBASE-MAP.md](../astraupskill/01-CODEBASE-MAP.md) and the trace lab in [07-TRACE-LAB.md](../astraupskill/07-TRACE-LAB.md).
- Days 9-11: a take-home — Exercise 4 or 5 in [05-PRACTICE.md](../astraupskill/05-PRACTICE.md), graded with [06-SOLUTIONS-AND-REVIEW.md](../astraupskill/06-SOLUTIONS-AND-REVIEW.md).
- Days 12-13: system-design follow-ups — [08-BACKEND-TICKET.md](../astraupskill/08-BACKEND-TICKET.md) and extended-course chapters 26-28.

Run the tests with `npx vitest run` from the project root; the suite uses a 30-second correctness timeout because parsing the full SQL pack exceeds Vitest's five-second default on a normal laptop.
