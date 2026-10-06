# IPSKILL: six-track curriculum and applied CRUD practice

**Continue with the [expanded learning path](astraupskill/advanced/README.md): guided checkpoints, worked traces, debugging labs, independent exercises, solutions and a capstone.**

**This is IPSKILL, a React app.** It displays a SQL/TS/Node/React/C#/.NET lesson archive; it is not itself a SQL course, despite the folder name `buildsql`.

IPSKILL is a local React and TypeScript learning workspace. It preserves 310 lessons and 2,155 missions across SQL, TypeScript, Node, React, C# and .NET, with explicit progress saves, recall scheduling, an archive and a CRUD practice-project tracker.

Start the detailed junior-to-mid-level course at [astraupskill/README.md](astraupskill/README.md). It includes a source tour, a worked change, examples, failure investigations, six graded exercises and review guidance. Check [the dated verification record](astraupskill/VERIFICATION.md) for actual completed checks and limits.

## Local setup

Use Node 22.16 or a compatible Node 22 release below 23. Dependency versions are pinned to the versions recorded in the existing lockfile. From this folder:

```powershell
npm ci
npm run dev
```

Open `http://127.0.0.1:5187`. The port is strict: an occupied port produces an error rather than silently selecting another origin. The app stores data in this browser profile and origin. An old workspace on port 5173 remains associated with that origin; export it there and use reviewed import at the new origin. No cloud account or backend service is involved.

To run the production build:

```powershell
npm run build
npm run preview
```

Create an empty local workspace explicitly. Applying a practice form updates the workspace draft. Click **Save workspace** to persist it, and wait for the saved revision. Mission notes, profile changes and completion records also remain drafts until that save. Export regular copies because browser storage can be cleared or evicted.

## Existing progress and recovery

The earlier app stored progress under `ipskill.save.v1` in localStorage. On the same origin, the revised app detects that value and offers reviewed migration. It validates known mission IDs, rewards, dates and related histories, preserves the original raw text and creates an IndexedDB recovery snapshot. It never silently resets malformed data or deletes the legacy value.

If migration rejects data, export the original and review a copy. Do not clear storage as a first troubleshooting step. The new workspace uses `ipskill-workspace-v2` with `workspace` and `backups` object stores. An invalid active aggregate remains available through **Export accepted raw data**. Recovery of corrupt active data requires reviewing the exported copy in a separate profile; the normal UI will not overwrite an unreadable aggregate.

In **Save data**, preview an import before applying it. Resolve dirty changes first. Replacement stores the previous accepted aggregate as a snapshot and creates a new workspace identity, preventing an old tab from overwriting the replacement. Ten snapshots are retained; a full snapshot store refuses another replacement. Download snapshots for independent recovery. There is no automatic history pruning or merge engine.

When two tabs conflict, export the losing draft before loading current data. Then manually reapply the intended change to current records. The transaction protects a complete workspace, so independent edits can still conflict. A notification is advisory; the identity and revision comparison inside the write transaction is the actual protection.

## Learning and practice

The mission workspace records written practice and self-review. **Compare with reference** does not execute code. Archived CLI commands and source file paths belong to the original course workspaces, which are not all included in this repository. Run those exercises only in a matching source workspace, then record the command, observed result and reasoning here.

The CRUD practice view supports create, list, search, status filtering, pagination, edit and delete. A project needs a title and observable goal. Review and completion require written evidence. The length thresholds discourage empty submissions; they do not certify correctness. New completions follow catalog prerequisites, configured XP is awarded once, and failed recall schedules another attempt. Streak days use UTC; review intervals use elapsed 24-hour days.

## Checks

```powershell
npm test
npm run validate
npm run build
python -m venv .venv
.venv/Scripts/python -m pip install -r verification/requirements-browser.txt
.venv/Scripts/python -m playwright install chromium
.venv/Scripts/python verification/verify_browser.py
```

Browser verification starts its own loopback preview server on port 5587 and uses disposable browser contexts. Build first and use a new empty output directory for each run. Set `IPSKILL_BROWSER_OUTPUT` to choose it; optionally set `ASTRA_BROWSER_EXECUTABLE` to an already installed compatible Chromium executable. Existing evidence and occupied ports are refused. The browser script requires Python with Playwright; application use does not.

## Curriculum authoring

The original packs under `public/content` are retained. `src/catalog.json` contains their compact identity, kind and reward catalog. Keep packs, index and catalog consistent when making a reviewed curriculum release.

```powershell
node scripts/merge-content.mjs new_volume candidate_name
node scripts/validate-content.mjs candidate_name
```

The merge tool reads an authored volume and creates a new directory under `content-candidates`. It refuses duplicate or incomplete lessons and existing candidate names. Published content is not overwritten. A failed generation can leave an incomplete candidate directory; a candidate is not a release. Review lesson accuracy, promote the packs/index/catalog together in a separate reviewed checkout, and rerun application checks.

The volume-three assembler requires a new output name and refuses to overwrite an existing authored file. It also rejects duplicate section markers. Earlier source versions are retained as text under `docs/original` for comparison.

## Practical limits

Workspace size is limited to 8 MiB, notes to 100,000 characters per mission, projects to 100 and snapshots to ten. There is no authentication, shared server, cloud backup, automatic grading, account recovery or public deployment in this app. The backend, ownership and booking projects in the course are future exercises with explicit acceptance criteria.
