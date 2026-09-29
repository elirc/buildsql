# Stories and resume material from IPSKILL (buildsql)

## Story 1: the save that refuses to lose another tab's work

**Situation.** IPSKILL keeps its whole practice workspace, mission progress plus up to 100 practice projects, as one record in IndexedDB under the key `current` (`src/storage.ts:30`). Two browser tabs can both have the app open, and every save replaces that record, so a tab holding an old copy could erase everything the other had done.

**Task.** Make a stale save impossible, and make the resulting rejection cost the user nothing.

**Action.** I made the save a conditional commit inside a single read-write transaction. `commit` at `src/storage.ts:95` validates the draft before opening anything, then, inside the transaction, re-reads and validates the stored record and compares its `id` and `revision` against the caller's expectation at line 121, throwing `ConflictError` on any mismatch. The accepted record is written with `revision: current.revision + 1` at line 141, so the next save has a fresh expectation. Because the check and the write share one transaction, nothing can slip between them. Then I designed the rejection path: the draft stays in `working.current`, the error surfaces through `run` at `src/useWorkspace.ts:117` with a message naming the next action rather than the cause, `reload` at line 175 confirms before discarding a dirty draft, and a `BroadcastChannel` at line 71 warns the other tab so it does not waste an attempt.

**Result.** The 19-scenario Chromium suite recorded in `astraupskill/VERIFICATION.md` covers competing tabs, stale workspace identity rejection and a real IndexedDB abort after a successful put, all passing, alongside 43 unit and component tests.

## Story 2: two version checks at two scopes

**Situation.** The workspace revision catches another tab, but it catches it late: the user discovers the conflict at save time, after a long editing session. Individual practice projects needed their own answer.

**Task.** Detect a conflicting project edit while the user is still editing, without duplicating the storage-level mechanism.

**Action.** Every project carries an integer `version` (`src/contracts.ts:16`). `putProject` at `src/progression.ts:157` takes an `expectedVersion` and throws unless the existing project's version matches it exactly, or, for a genuinely new project, unless no expectation was supplied at all (`src/progression.ts:165`). On acceptance it sets `version: existing.version + 1` and preserves the original `created` timestamp while refreshing `updated` (lines 177 to 179). `deleteProject` at line 186 applies the same rule, refusing a delete whose expected version has moved. Both functions are pure and return a new workspace, so a rejection cannot leave a half-applied change; `edit` in `src/useWorkspace.ts:95` catches the throw and keeps the draft.

**Result.** `src/game.test.ts:214` asserts that a stale edit and a stale delete both throw and that the accepted project survives with its evidence intact; `:202` asserts an accepted edit bumps the version to 2 and keeps the original creation time; `:191` asserts a create does not mutate the input workspace.

## Story 3: validation as a trust boundary, not a formality

**Situation.** A workspace can be imported from a JSON file the user supplies, and the app derives a level and an XP total from what it reads. Anything the file can claim, the UI will show.

**Task.** Make the file untrusted and the catalog authoritative.

**Action.** I made the shape check exact in both directions: `object()` at `src/contracts.ts:33` refuses a value whose prototype is not `Object.prototype`, and, when given a field list, requires the key set to match exactly, so an extra field fails like a missing one. Then I added the checks a type system cannot express. Each stored reward must equal the catalog's `xp` for that mission (`src/contracts.ts:149`), so an edited export cannot inflate a level. The `completed`, `earnedXp`, `reviews` and `attempts` maps must describe the same mission set (lines 165 to 175). `lastActive` and `streak` must agree about whether any activity exists (line 133). Every map key must name a mission that exists (line 147). Sizes are bounded at 8 MiB on the raw import string before parsing (line 235) and again on the accepted object (line 231).

**Result.** `src/game.test.ts:153` proves forged rewards and disconnected history are refused, `:161` covers impossible dates, unknown tracks and prototype-like mission keys, and `:187` proves a malformed or oversized import is refused rather than silently returning empty progress, which would have looked like data loss.

## Resume bullets

- Built a local-first CRUD workspace whose save is a conditional commit inside a single IndexedDB transaction, comparing a stored revision before writing so a second browser tab cannot overwrite accepted data.
- Added per-record optimistic concurrency on top of the document-level check, so a stale edit or delete of one practice project is refused in memory during editing rather than at save time.
- Wrote a total validator that enforces exact field sets, prototype safety, catalog-derived reward values, cross-map history consistency, case-insensitive title uniqueness and an 8 MiB ceiling, checked on both import and acceptance.
- Designed the rejection path as a first-class outcome: drafts are retained on conflict, messages name the next action, destructive reloads are confirmed, and recovery snapshots are never silently evicted.
- Delivered 43 unit and component tests plus 19 real-Chromium scenarios covering competing tabs, a storage abort after a successful put, reviewed replacement and legacy migration.

## 60-second spoken summary

IPSKILL is a React and TypeScript app over a preserved curriculum archive, with a local practice workspace in IndexedDB: mission progress, spaced-repetition reviews, and up to a hundred practice projects. The part worth talking about is how a change becomes durable. Editing only touches an in-memory draft; nothing is stored until an explicit save, and the save is conditional. Inside one IndexedDB transaction I re-read the stored workspace, compare its id and revision against what the user loaded, and refuse if either has moved, which is how a second tab cannot wipe the first. The draft is never thrown away on a refusal, and the message tells the user to export before loading current data. On top of that, each project has its own version, so a conflicting edit to one project is caught while the user is still editing rather than at save time. Validation is the other half: the file a user imports is untrusted, so rewards must match the catalog, the completion, XP, review and attempt maps must agree with each other, and unknown fields are fatal. Forty-three unit tests and nineteen real-browser scenarios. What it does not have: any server, any user model, and any proof that the archived lesson text is correct, which the verification record states.

## What I would do next

1. Write the four remaining integration tests from `astraupskill/08-BACKEND-TICKET.md`: 400 from the shared validator, 409 on a duplicate email differing only by case, 428 without `If-Match`, and 404 after a delete. The 409-on-stale test is already written there as the reference.
2. Split `projects` into its own IndexedDB object store keyed by id. Today one save rewrites, re-validates and re-encodes the entire document, which is why `assertSize` at `src/contracts.ts:97` exists at all.
3. Add a real schema upgrade path. `parseImport` at `src/contracts.ts:238` already branches on the `schema` marker to accept a legacy save, so the hook is there; what is missing is an upgrade function, and without it any new field breaks every previously exported file.
4. Replace the ten-backup refusal at `src/storage.ts:147` with a flow that helps the user export and clear snapshots in place, keeping the "never silently evict" property while removing the dead end.
5. Extend the `dirty` guard to cover navigation as well as unload; `beforeunload` is wired at `src/useWorkspace.ts:86`, but an in-app route change is a separate path.
