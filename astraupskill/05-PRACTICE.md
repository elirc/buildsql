# Practice: six exercises, easy to hard

Exercises 1-2 need only Python 3 or a browser. Exercises 3-5 change this repo and are checked with its Vitest suite (`npm ci` once, then `npm test`; the suite currently has 43 tests: 28 in `src/game.test.ts`, 4 in `src/App.test.tsx`, 11 in `src/content.test.ts`). Exercise 6 is built in a separate project. Create a practice project in the app for each exercise and record the contract before you implement. Reference answers are in [06-SOLUTIONS-AND-REVIEW.md](06-SOLUTIONS-AND-REVIEW.md).

---

## Exercise 1 — Predict the state model (easy, no install)

**Goal.** Check your mental model of drafts, versions, revisions and identities before reading more code.

Follow [advanced/labs/README.md](advanced/labs/README.md): copy `astraupskill/advanced/labs/answers.template.json` somewhere outside the repo, fill in the eight answers, then run:

```text
python astraupskill/advanced/labs/check-answers.py C:/path/to/my-answers.json
```

*Hints:* P2 and P3 are both "+1" questions but on different counters (`src/progression.ts:177` vs `src/storage.ts:141`). P5 is the replacement branch of that same line. P6 is `src/PracticeView.tsx:55-56`.

**Check.** The checker prints `8/8 predictions match the documented contract.` and exits 0. For every case it lists as wrong, write down the line that changes your answer before retrying.

---

## Exercise 2 — See the draft/accepted split in the browser (easy)

**Goal.** Observe, not just read, that Apply and Save are different boundaries.

1. `npm run dev`, open `http://127.0.0.1:5187` in a fresh profile, and create an empty workspace.
2. In CRUD practice, create "Contact book" with a 20+ character goal and click Apply. Note the toolbar text (`src/App.tsx:293-294`).
3. Reload the page. Is the project there?
4. Create it again, Apply, then **Save workspace**, and reload.

*Hints:* Apply ends in `edit` (`src/useWorkspace.ts:95-109`), which never touches IndexedDB. Reload re-reads accepted storage with `readWorkspace` (`src/storage.ts:49-70`). The browser will warn on reload while the draft is dirty (`src/useWorkspace.ts:80-86`); accept the warning.

**Check.** After step 2 the toolbar shows "Unsaved changes · revision 0"; after step 3 the project is gone. After step 4 the toolbar shows "Accepted locally · revision 1" and the project survives the reload.

---

## Exercise 3 — Pin the evidence thresholds exactly (easy-medium)

**Goal.** Turn a stated rule into tests at its boundaries.

`validateProject` requires at least 40 characters of evidence for `review` and 80 for `complete` (`src/contracts.ts:204-206`). The existing test at `src/game.test.ts:221` checks that 79 characters fail for `complete` and that a 91-character string passes, but nothing pins 80 exactly, and `review` is only tested with empty evidence.

Add one `it(...)` to `src/game.test.ts` that asserts: review with 39 characters throws, review with 40 is accepted, complete with 80 is accepted. Reuse the file's `project()` helper and `now`.

*Hints:* `putProject(newWorkspace(), { ...project(), status: "review", evidence: "x".repeat(40) }, undefined, now)`. Whitespace-only evidence does not count: `text()` compares `value.trim().length` against the minimum (`src/contracts.ts:62`).

**Check.** `npm test` reports 44 passed. Temporarily change the 40 in `src/contracts.ts:204` to 41 and confirm your new test is the one that fails; then revert.

---

## Exercise 4 — Configurable page size (medium)

**Goal.** Add a 5 / 10 / 20 page-size selector to CRUD practice without breaking the paging rules that already exist.

Read what is already there before designing: the page size is the literal `10` in two places (`src/PracticeView.tsx:55` and `:224`); search and status changes reset to page 1 (`:200-211`); and the displayed page is clamped with `current = Math.min(page, pages)` (`:56`), so deleting the last item on page 2 shows page 1 without changing the stored `page`.

Decide and document: does changing size reset to page 1, or keep the first visible project on screen? Keep the preference as view state (no workspace schema change).

*Hints:* introduce one `pageSize` state and use it in both places. Notice the clamp side effect: with `page` still 2 after a deletion, adding a project back makes page 2 reappear. Decide whether to `setPage(current)` when clamping matters to your policy.

**Check.** Add a component test to `src/App.test.tsx` that builds 13 projects with `putProject`, renders `PracticeView`, asserts the text `13 projects · page 1 of 2`, switches the selector to 20, and asserts `13 projects · page 1 of 1`. `npm test` passes. In the browser, an open edit form keeps its typed values while you change the page size.

---

## Exercise 5 — Structured evidence with a migration (hard)

**Goal.** Replace the single `evidence` string with a list of entries, without losing or inventing anything in existing workspaces.

Each entry needs an id, a category, a description and an observed result. Decide whether entries can be edited or only appended, and the maximum count and lengths.

*Hints:* this is a schema change. `validateWorkspace` accepts only `schema: 2` and rejects unknown fields (`src/contracts.ts:210-211`), and `object()` with a field list rejects any extra key (`:45-50`), so you need `schema: 3`, a migration in `parseImport` (`:234-241`), and new status rules to replace the length checks at `:204-206`. The existing evidence text should become one `legacy-note` entry with no invented command or date. `commit` (`src/storage.ts:95`) and the recovery snapshots store whatever `validateWorkspace` accepts, so they need no change if migration happens on import and load. Remember `readWorkspace` also validates (`src/storage.ts:60`): a browser that already has a schema 2 workspace must still load.

**Check.** New tests prove: (a) `importWorkspace(JSON.stringify(oldSchema2Workspace))` returns a workspace whose project has exactly one `legacy-note` entry containing the original text byte for byte; (b) a duplicate entry id is rejected; (c) a `complete` project with no entries is rejected. All earlier tests still pass (update the ones that construct `evidence: ""` directly).

---

## Exercise 6 — Take the contract to a server (hard, separate project)

**Goal.** Re-implement expected-version updates and duplicate rejection behind HTTP.

Use the reference in [08-BACKEND-TICKET.md](08-BACKEND-TICKET.md) (Express + `node:sqlite`) or the same contract in .NET. Then, in order, add the extensions that make it mid-level work:

1. **Ownership** — derive the owner from the authenticated request, never from the body; test two users against the same record id on list, detail, update and delete.
2. **Bookings** — two overlapping accepted bookings for one resource must be impossible; enforce it in the database transaction or a constraint, not in a preliminary availability check.
3. **Lost acknowledgements** — give create an operation id so a retried request returns the original result instead of inserting a second row.

*Hints:* for each step, write the HTTP examples (valid, rejected, stale, retried) before the handler. The extended workbook covers these in chapters 26-28.

**Check.** In your separate project, the five tests listed at the end of chapter 08 pass, plus for each extension one test that fails before the change: a second user's update returns 403/404; two concurrent overlapping bookings end with exactly one row; a repeated create with the same operation id leaves exactly one contact.
