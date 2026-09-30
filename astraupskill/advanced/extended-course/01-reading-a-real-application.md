# 01 — Read a real application without reading every file

## Begin with a behavior you can observe

A repository is easier to understand when you bring it a question. “Learn the codebase” has no natural stopping point. “Explain what happens when I apply a project edit and then reload” has a trigger, a sequence and an observable result. This chapter develops a method for following that question through IPSKILL without confusing the displayed interface, an in-memory draft and persistent data.

Start from the [root README](../../../README.md). It identifies the product as a local React learning workspace, explains explicit saves and identifies browser origin as part of the storage boundary. Those facts should shape your investigation. A project folder named buildsql is not evidence that the application is a SQL server. A six-track archive can teach backend concepts while the application hosting it remains a frontend-only workspace.

Write three initial statements: what the user wants; what action the interface offers; and what evidence would show success. For a practice-project edit, the user wants a revised goal to survive the intended save workflow. Applying a form changes a draft. Saving the workspace asks storage to accept it. A reload after the save, showing the accepted value, is stronger persistence evidence than seeing the field update before any save request.

## Follow a narrow vertical path

Open [PracticeView.tsx](../../../src/PracticeView.tsx) and find its `apply` function. Read its arguments and the values it captures. It separates the form's expected project version from the input, calls `putProject`, passes the resulting workspace to `onChange`, then closes the form. Do not assume that closing a form means writing a database; follow the actual callback.

Next find `putProject` in [progression.ts](../../../src/progression.ts). Its return type and operations show that it transforms a workspace. It validates the input aggregate, compares a project version and constructs a new project list. It does not call fetch, open IndexedDB or resolve a storage transaction. That absence matters because it defines what a successful return can establish.

Continue to [useWorkspace.ts](../../../src/useWorkspace.ts). The hook keeps a working draft and expected accepted state. Its `edit` path marks the draft dirty. Its `save` path calls `commit`, accepts the returned value and displays a saved revision. Finally inspect [storage.ts](../../../src/storage.ts), where the transaction checks identity and revision and resolves when the transaction completes.

Your map should now contain four meaningful boundaries: user form, pure domain transformation, workspace coordination and durable transaction. Drawing arrows between every imported helper would add noise. Annotate each arrow with the value crossing it: form input plus expected version, returned workspace draft, draft plus expected identity/revision, accepted workspace. This makes the map useful during a later failure.

## Separate an observation from its explanation

Suppose the form disappears and the project title changes on screen. That is an observation. “The application saved my work” is an interpretation requiring additional evidence. A different explanation is that the form successfully updated a draft that has not yet been persisted. To choose between explanations, inspect the dirty indicator, follow the code path and repeat with an explicit save followed by reload in a disposable profile.

The same discipline applies to failures. An error after clicking Save may mean validation rejected the draft before a transaction, the stored revision differed, the browser refused storage or a transaction aborted. Do not name one cause merely because it is familiar. Read the error boundary and locate the first stage that did not complete. A good investigation narrows possible causes rather than treating all rejected actions as database bugs.

## Build a useful source notebook

For each function on the path, record its inputs, output, effects and failure signal. `putProject` receives a validated-workspace candidate and edit input, returns a workspace or throws, and does not itself persist. `commit` receives storage, a draft and an expectation, and resolves only after acceptance or rejects after failure. `accept` updates the hook's accepted expectation and clears dirty state. These summaries are small enough to check against the source after a refactor.

Add one example per boundary. Use fictional project P at version 4 in workspace W at revision 12. Applying a valid edit gives a draft with project version 5. Until the storage transaction completes, accepted storage still contains the earlier aggregate. An ordinary successful save then advances the workspace revision. The values are illustrative; their usefulness is that different counters have visibly different jobs.

Avoid copying entire source files into your notebook. A copied file becomes stale and hides what you learned. Prefer a function name, a relative link and a short claim you can test. If a claim depends on a package version or browser behavior not established by local source, identify that uncertainty instead of inventing an explanation.

## Independent investigations

**BX-01A:** Trace project deletion from its button to accepted storage. Explain why removing an item from a draft is not yet proof of a persisted deletion. Identify the confirmation message and the next explicit user action needed for durability.

**BX-01B:** Trace `exportDraft` and `exportRaw`. For each, name the source of the exported data. Construct a situation where the files should differ. Do not open either export and assume its filename alone proves which state it represents.

**BX-01C:** A reviewer says, “This hook has too many refs; replace all of them with state.” Before editing, select one ref and explain which synchronous decision it supports. Describe a possible race if the decision relied only on a later render. You do not need to prove every ref is necessary to show that a blanket replacement needs reasoning.

## Review discussion

A strong deletion trace follows the domain operation, workspace draft and save transaction separately. A strong export comparison uses an unsaved edit so draft and accepted state intentionally diverge. The ref investigation should distinguish data used for rendering from a current value used to guard an event before another render occurs. That distinction is more informative than declaring one React primitive universally better.

Finish by explaining the edit path aloud in two minutes without reading code. Then let another learner ask where a stale version is rejected. If you can name the boundary and demonstrate its consequence, your source map has become a practical tool rather than a list of filenames.
