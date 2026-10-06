# Read the code in the order a change travels

Begin at [App.tsx](../src/App.tsx). It selects the current view and connects the curriculum to the local workspace. It does not decide whether a project has enough evidence or whether an old revision may overwrite a new one. Those decisions belong to more focused modules. When reading a large component, identify the functions it delegates to before attempting to memorize its markup.

The important boundaries are:

| File                        | Responsibility                                                 | Question to ask while reading                            |
| --------------------------- | -------------------------------------------------------------- | -------------------------------------------------------- |
| `src/App.tsx`               | Routing, the workspace hook, and view selection (449 lines) | Which view owns which piece of state?                    |
| `src/views/*.tsx`           | `HomeView`, `JourneyView`, `MissionView`, `ReviewsView`, `WorldCard`; `shared.tsx` holds the helpers they share | What does each view read from the workspace, and what does it write back? |
| `src/PracticeView.tsx`      | Controlled project form, list, search, filter and pagination   | What happens to input after rejection?                   |
| `src/progression.ts`        | Mission completion, recall, project create/update/delete rules | Which state changes are allowed?                         |
| `src/contracts.ts`          | Runtime validation and limits                                  | What assumptions does imported data need to satisfy?     |
| `src/storage.ts`            | IndexedDB transactions, revision comparison and snapshots      | When is a write actually accepted?                       |
| `src/useWorkspace.ts`       | Draft state, asynchronous save lifecycle, export and recovery  | Which data is accepted and which is still editable?      |
| `src/content-loader.ts`     | Bounded downloads and curriculum validation                    | Can a stale or malformed response become active content? |
| `src/LibraryView.tsx`       | Filtered archive and lazily rendered full notes                | Are reading access and completion permission distinct?   |
| `src/WorkspaceSettings.tsx` | Import preview and snapshot export                             | Is replacement explicit and recoverable?                 |

Trace a project creation using these concrete stages. A title typed into Project title first exists in the PracticeView form. Applying the form calls `putProject`. That function validates the existing workspace, creates a project identity and version, normalizes the title, and validates the resulting aggregate. The UI then passes the valid result to the workspace draft. No IndexedDB write has occurred yet.

Save workspace calls the hook's `save`, which calls `commit`. The store reads the current accepted document inside a readwrite transaction. It compares that document's identity and revision with the caller's expectation. Only a matching expectation permits the candidate write. The promise resolves from transaction completion; the hook then updates its accepted expectation and clears the dirty indicator. Locate every one of those transitions in source.

The same path with line numbers, so you can set breakpoints:

| Step | Code | What to observe |
| --- | --- | --- |
| Submit the form | `apply` in `src/PracticeView.tsx:57-69` | `event.preventDefault()`, then `putProject(workspace, input, version)`; `setForm(null)` runs only if that call did not throw |
| Domain rule | `putProject` in `src/progression.ts:157-185` | version check at 165-172, trim + version bump at 173-180, whole-workspace `validateWorkspace` at 184 |
| Draft update | `onChange={workspace.edit}` at `src/App.tsx:437` → `edit` in `src/useWorkspace.ts:95-109` | sets `working.current`, `draft` and `dirty`; no storage call |
| Visible state | `src/App.tsx:293-294` | toolbar reads "Unsaved changes" vs "Accepted locally" and shows `revision` |
| Save click | `save` in `src/useWorkspace.ts:135-148` | calls `commit(db, working.current, expected.current)` |
| Conditional write | `commit` in `src/storage.ts:95-173` | identity/revision comparison at 121-128 inside the readwrite transaction opened at 108; `put` at 162; resolves on `tx.oncomplete` at 167 |
| Acknowledge | `accept` in `src/useWorkspace.ts:128-134` | the returned workspace becomes the new `expected`; `dirty` clears |

Now trace an edit. The form holds the project version that was opened. `putProject` checks that version before producing the next project version. Later, saving the whole draft checks the workspace revision. These are related but different boundaries: one protects a project editing operation inside the local draft, while the other protects the entire accepted document against another tab.

The curriculum is split into six files under `public/content`. `src/catalog.json` is a compact list of mission identities, kinds, tracks and rewards generated from those packs. The application can validate imported progress and enforce prerequisites without downloading all 63 MB of lesson text. A track loader still verifies that the full pack agrees with the catalog. When editing curriculum, treat the pack, index and catalog as one release.

Look at `src/game.ts` and `src/content.ts` last. They are compatibility entry points that re-export the focused implementations. The original files are preserved as text in `docs/original`, which allows you to compare behavior without accidentally running both persistence strategies.

Your reading exercise is to draw four boxes: form, workspace draft, transaction, accepted storage. Label the values crossing each boundary. Add the catalog beside validation rather than beside storage. Then draw a red arrow from transaction rejection back to the unchanged draft. If your diagram instead points from rejection to an empty form, it describes the data-loss behavior the current implementation is designed to avoid.

## House style

`src/progression.ts` (and a few other files) declare several constants in one `const a = ..., b = ...;` statement. It is a style choice, not a trick: read each comma as a new declaration. If you touch such a file, split it into one declaration per line in the same change; the fix pass left the existing ones alone so the diff stays about behavior.

