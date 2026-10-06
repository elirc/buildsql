# Interview questions on IPSKILL (buildsql)

24 questions with model answers. Paths are relative to the project root. Where a backend answer is wanted, the app's behavior comes first and the server mapping from `astraupskill/08-BACKEND-TICKET.md` second.

## Screening

**S1 (junior). What is stored, and where?**
One `Workspace` object in IndexedDB. `src/storage.ts:9` names the database `ipskill-workspace-v2`, with two object stores created on upgrade at lines 30 and 31: `workspace`, keyed manually and holding a single record under the key `current`, and `backups`, keyed by `id`. The `Workspace` shape is at `src/contracts.ts:26`: `schema: 2`, a uuid `id`, a numeric `revision`, a `save` holding mission progress, and up to 100 `projects`.

**S2 (junior). What is the difference between a draft and accepted data?**
The draft is React state; accepted data is what is in IndexedDB. `edit` in `src/useWorkspace.ts:95` applies a pure change function to the working copy, sets `dirty`, and stores nothing. `save` at `src/useWorkspace.ts:135` calls `commit` and, only on success, calls `accept` at line 128, which moves the expectation forward and clears `dirty`. Nothing reaches storage without an explicit save.

**S3 (junior). Describe a practice project.**
`src/contracts.ts:16`: a uuid `id`, an integer `version`, a one-line `title` of 1 to 80 characters, a `goal` of at least 20 characters, `evidence` up to 10,000, a `status` from `planned`, `building`, `review`, `complete`, and `created` and `updated` timestamps. The interesting rule is that evidence requirements rise with status: `review` needs at least 40 characters and `complete` at least 80 (`src/contracts.ts:204` and `:205`).

**S4 (junior). Where is the validation boundary?**
`src/contracts.ts` is the whole boundary, and it is total. `object()` at line 33 refuses anything that is not a plain object with `Object.getPrototypeOf(value) !== Object.prototype`, which blocks prototype-polluted payloads, and when a field list is supplied it requires an exact match, so an extra key is as fatal as a missing one. Every write path runs through `validateWorkspace` at line 209, including inside `commit` before the transaction opens.

**S5 (mid). How does a save avoid overwriting another tab's work?**
A conditional commit. `src/storage.ts:108` opens one read-write transaction over both stores, re-reads the stored workspace, and at line 121 compares it against the caller's `expected` pair of `id` and `revision`. Any mismatch, or a stored record existing when the caller expected none, throws `ConflictError`. On success the new record is written with `revision: current.revision + 1` at line 141. The whole read-check-write sequence is inside one IndexedDB transaction, so the check and the write cannot be separated.

**S6 (mid). What happens to the user's work on a conflict?**
Nothing is discarded. `ConflictError`'s message at `src/storage.ts:19` is "Another tab saved or replaced this workspace. Your draft is retained. Export it before loading current data." The catch in `run` at `src/useWorkspace.ts:117` puts the message on screen and leaves the draft in `working.current`, and `reload` at line 175 asks for confirmation before discarding a dirty draft. Rejection is a routine outcome here, so it is made cheap.

**S7 (junior). How does a second tab find out about a save?**
A `BroadcastChannel` named `ipskill-workspace-v2` (`src/useWorkspace.ts:71`). A successful save posts to it at line 146, and the receiving tab sets a notice at line 76 rather than reloading, because reloading would destroy an unsaved draft. The channel is advisory: the conditional commit is what actually prevents a bad write, and the notice only saves the user a wasted attempt.

## Deep dive

**D1 (mid). There are two independent version checks. Why?**
Different scopes. `revision` on the workspace answers "has anything in this workspace changed since I read it", and is enforced in `commit` at `src/storage.ts:121`. `version` on a project answers "has this project changed since I opened it", and is enforced by `putProject` at `src/progression.ts:165`, which throws unless the existing project's version equals the `expectedVersion` argument, or, for a new project, unless no version was supplied at all. The project-level check runs in memory, during editing, so a conflicting edit is caught before the user has invested in a save; the workspace-level check runs against storage and catches the other tab.

**D2 (mid). Walk `commit` and name what each branch protects.**
`src/storage.ts:95`. It validates the draft first, before anything opens, so an invalid draft never starts a transaction. It rejects a replacement backup over 8 MiB at line 104. Inside the transaction it re-reads and validates the current record, applies the conflict check at 121, then a second check at 129: when there is no replacement, the draft's own `id` and `revision` must match the expectation too, which catches a caller that passed someone else's draft. The new record's identity is decided at lines 140 and 141: a replacement gets a fresh uuid and revision 0, an ordinary save gets the current revision plus one. If a replacement is in play, it counts existing backups and refuses at ten (line 147), then adds the backup and writes the record in the same transaction.

**D3 (mid). Why does a replacement refuse at ten backups instead of evicting the oldest?**
Because an eviction policy deletes the user's recovery data silently, at exactly the moment they are doing something destructive. The message at `src/storage.ts:148` says so: ten snapshots exist, export and review them, and no snapshot was removed. The cost is that a user can get stuck and must act; the benefit is that the app never destroys the only copy of something. For a local-first tool with no server backup, that trade is the right way round.

**D4 (mid). What does `validateSave` check beyond field types?**
Cross-field consistency, which is the part that catches real corruption. `src/contracts.ts:133` requires `lastActive === null` and `streak === 0` to agree, so a streak cannot exist without an activity day. Lines 165 to 175 require the `completed`, `earnedXp`, `reviews` and `attempts` maps to describe the same set of mission ids, so a forged reward with no completion is refused. Line 149 requires each `earnedXp` value to equal the catalog's `xp` for that mission, so rewards cannot be inflated by editing an export. Every key must name a mission that exists in the catalog (line 147).

**D5 (mid). What breaks if you delete the check at `src/contracts.ts:149`?**
That is `if (field === "earnedXp" && v !== m.xp) throw Error("Reward differs from the curriculum.")`. Removing it makes XP client-authored: anyone can edit an exported JSON file, raise a reward, import it and change their level, because `xpFor` at `src/progression.ts:30` simply sums the stored values and `levelFor` at line 32 derives the level from that sum. The test "rejects forged rewards and disconnected history" at `src/game.test.ts:153` fails. On a server this is the canonical "never trust the client for a value the server can derive" rule, and the answer worth giving is that the catalog is the authority in both cases.

**D6 (mid). Explain the review scheduling.**
`completeMission` at `src/progression.ts:93`. A first pass records the completion timestamp, the catalog's XP, and a review at stage 0 due in three days (line 117). A `retry` on an already-completed mission keeps the completion and the XP and schedules a review for tomorrow (line 122), so failing a recall never removes credit already earned. Otherwise, when a review is actually due, the stage advances by one, bounded by the interval table, and the next due date is the interval for that stage (line 132). `REVIEW_INTERVALS` at line 13 is 3, 7, 21, 60, 120, 240, 365, 540, 730, 1095 days. The key property is the "actually due" condition at line 126: recalling early does not advance the interval.

**D7 (mid). Why compute days from UTC strings rather than local dates?**
Because a local-time day boundary moves with daylight saving and the user's travel, and a streak computed from it would break or double-count. The code slices `now.toISOString().slice(0, 10)` for the day (`src/progression.ts:110`) and compares it against `lastActive`; the streak increments only when the previous day, computed by subtracting exactly 86,400,000 milliseconds, equals `lastActive` (line 141). The test at `src/game.test.ts:49` is named for this: it schedules exact elapsed UTC days across daylight-saving changes.

**D8 (mid). The app refuses a clock that has gone backwards. Why?**
`src/progression.ts:105` throws when today's UTC day is earlier than `lastActive`. Without it, a device clock set back would let a user record activity on a day before their last recorded one, and the streak arithmetic, which assumes a monotonic day sequence, would produce nonsense that then validates fine on the next load. Failing loudly with "Review the device clock" is better than silently repairing data whose meaning is unknown. `src/game.test.ts:93` covers it.

**D9 (mid). How are duplicate project titles handled?**
`validateWorkspace` at `src/contracts.ts:220` compares `p.title.trim().toLowerCase()` across all projects and refuses when the set is smaller than the array. So "Contact Book" and " contact book " collide. The test is `src/game.test.ts:251`. The server translation in `astraupskill/08-BACKEND-TICKET.md` is exactly the same rule expressed as `CREATE UNIQUE INDEX contacts_email_ci ON contacts (lower(email))`, and the API maps the resulting UNIQUE violation to 409, which is worth saying because it shows the difference between checking in code and letting the database enforce it.

**D10 (mid). What are the size limits and where are they enforced?**
`MAX_BYTES` is 8 MiB (`src/contracts.ts:14`). `assertSize` at line 97 encodes the JSON and refuses above it, and it is called both at the end of `validateSave` (line 176) and at the end of `validateWorkspace` (line 231), so the limit applies to whatever is about to be accepted. `parseImport` at line 235 checks the raw string before parsing, which matters because parsing an enormous string is itself the expensive part. `commit` separately bounds a replacement backup at `src/storage.ts:104`. The structural caps sit beside it: at most 100 projects (`src/contracts.ts:215`), and no more mission entries than the catalog has missions (line 143).

**D11 (mid). What does the `inflight` ref protect?**
`src/useWorkspace.ts:37`. `run` at line 110 returns immediately when a storage action is already running, and `edit` at line 96 refuses to change the working copy while one is in flight. Together they stop a user from mutating the draft between the moment a commit reads the expectation and the moment it resolves, which would leave `accept` overwriting the draft with a value that no longer reflects what the user typed. It is a single-threaded version of the same concern the conditional commit handles across tabs.

**D12 (mid). What do the tests establish, and what do they not?**
`astraupskill/VERIFICATION.md` records 69 checks: 28 domain and project tests, four component tests, 11 content tests, seven authoring-command checks and 19 real-Chromium scenarios, plus install, typecheck, content validation and build. The browser suite is the one that matters for the storage claims, because it exercises real IndexedDB transactions, competing tabs, an abort after a successful put, and reviewed replacement. What is not established: that any historical lesson explanation or reference solution in the archive is correct. Structural validation reconciles identities, counts, fields and rewards against the catalog and stops there, and the record says so.

## Behavioral

**B1. Tell me about designing for a failure you expected to happen often.**
Situation: IPSKILL keeps a local workspace that two browser tabs can both edit, and a conflict is a normal event rather than an exception. Task: make a rejected save cost the user nothing. Action: I made the commit conditional inside a single IndexedDB transaction, so the check and the write cannot drift (`src/storage.ts:121`), and then designed around the rejection: the draft stays in memory, the error message names the next action rather than the cause ("Your draft is retained. Export it before loading current data.", `src/storage.ts:19`), `reload` asks for confirmation before discarding a dirty draft, and a `BroadcastChannel` notice warns the other tab before it wastes an attempt. Result: the browser suite covers competing tabs, stale workspace identity rejection and a real IndexedDB abort after a successful put, among its 19 scenarios, all passing.

**B2. Describe a validation decision that was stricter than it had to be.**
Situation: the workspace is imported from user-supplied JSON, so validation is a trust boundary. Task: decide how strict to be. Action: I made `object()` at `src/contracts.ts:33` refuse anything whose prototype is not `Object.prototype` and, when a field list is given, require an exact key-set match, so an extra field is as fatal as a missing one. On top of that I added cross-field checks: the completion, reward, review and attempt maps must describe the same mission set, and each stored reward must equal the catalog's value for that mission. Result: `src/game.test.ts:153` proves forged rewards and disconnected history are refused, and `:161` covers impossible dates, unknown tracks and prototype-like mission keys. The cost, which I wrote down, is that any schema change breaks every previously exported file.

**B3. Tell me about splitting a file that had grown too large.**
Situation: `src/App.tsx` had accumulated the routing, the workspace hook and five full views. Task: make it reviewable without changing behavior. Action: I moved `HomeView`, `WorldCard`, `JourneyView`, `MissionView` and `ReviewsView` into `src/views/`, put the shared helpers into `src/views/shared.tsx`, and left `App.tsx` with routing and the workspace hook at 449 lines. I updated the course's codebase map in the same pass so the chapter table names the new files rather than a shape that no longer exists. Result: `tsc -b` exits zero, the build succeeds, and all 43 unit and component tests still pass, which is the only claim a pure move is entitled to make.

**B4. When did you write down a limit you could have left implicit?**
Situation: the archive is large, six tracks, 310 lessons, 2,155 missions, and the content tests pass. Task: decide what that proves. Action: I stated in `astraupskill/VERIFICATION.md` that structural validation checks identities, counts, fields and reward consistency and does not establish that any historical explanation or reference solution is correct, and that commands and source paths inside those lessons refer to original workspaces this repository does not contain or execute. I did the same for the test timeout: the suite uses a 30-second correctness deadline because parsing the complete SQL pack exceeded the five-second default, and the record says plainly that this is not a performance target and that no assertion was weakened or skipped. Result: a reader knows which of the 69 checks support which claim.

## Follow-ups an interviewer asks next

**F1. Your conflict check compares a revision. Why not compare content?**
A revision is cheap, monotonic and unambiguous: `commit` increments it at `src/storage.ts:141` and every save gets a new value. Comparing content would mean hashing an 8 MiB document on every save, and it would answer a different question, "is it identical", which would silently accept a save on top of a change that had been reverted. The server version of this is the ETag in `astraupskill/08-BACKEND-TICKET.md`, where the version is the entity tag and a stale `If-Match` is a 409.

**F2. `putProject` throws for a stale edit. Is a thrown error the right interface?**
Inside a synchronous pure function operating on an in-memory workspace, yes: there is no partial state to clean up, and `edit` at `src/useWorkspace.ts:104` catches it and turns it into a message while keeping the draft. It would be the wrong interface on a repository that also performs IO, where a thrown error and a returned failure carry different information about whether anything was written. The server version returns status codes, and the mapping is explicit: 428 with no `If-Match`, 409 when stale, 404 when the row is gone.

**F3. You said validation is total. What does that cost when you change the schema?**
An exact key-set comparison means that adding one field to `PracticeProject` invalidates every previously exported workspace, with the message "Unexpected or missing fields." There is no migration path in the code; the `schema: 2` marker at `src/contracts.ts:211` exists to make a version bump possible, and `parseImport` at line 238 already branches on it to accept a legacy save without the workspace wrapper. So the machinery is there and the upgrade function is not, which is the honest description.

**F4. Reviews are scheduled per mission. What happens at 2,155 missions?**
`dueReviewIds` at `src/progression.ts:149` reads `Object.entries(save.reviews)`, filters by due date and sorts, in memory, on every call. At the real ceiling, which `validateSave` caps at the catalog length (`src/contracts.ts:143`), that is a few thousand entries and is fine. What is not fine is the storage shape: the whole workspace is one record, so adding one review rewrites the entire document, and `assertSize` re-encodes it to check the limit. The fix is per-record storage, which IndexedDB supports natively and this design deliberately does not use.

**F5. If this had a server, what would you build first?**
The ticket in `astraupskill/08-BACKEND-TICKET.md`: the contacts router with `If-Match` on PUT, 428 when the header is absent, 409 when the update affects zero rows but the row exists, 404 when it does not, and a unique index on `lower(email)` so the case-insensitive duplicate rule is enforced by the database rather than by a scan. The reference integration test for the 409 is already written there; the remaining four are the exercise.

**F6. What is the weakest part of the current design?**
The single-record workspace. Every save serializes and validates everything, `assertSize` encodes the whole document twice on a save path that already validated it, and one corrupt write costs all of a user's data rather than one project. The backups store mitigates the last part deliberately, and the 8 MiB ceiling keeps the first part bounded, but it is a cap standing in for a design. Splitting `projects` into their own object store, keyed by id, would remove all three problems and cost the ability to validate the whole workspace as one unit, which is exactly what makes the current code easy to reason about.
