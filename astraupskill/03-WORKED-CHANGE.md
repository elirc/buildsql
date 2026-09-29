# Worked change: a project may enter review only with evidence

The product requirement is concrete: a learner should be able to create an applied project, explain its observable goal, and record implementation evidence before requesting review. A title and a green status are insufficient. The current application implements this through the `planned`, `building`, `review` and `complete` statuses. Follow this existing feature before extending it.

Start with a user story: “As a learner, I want my reviewer to reproduce a change without having to guess which files or checks matter.” Turn that into acceptance criteria. A project needs a nonblank title of at most 80 characters, a goal of at least 20 characters, and a known status. Review requires at least 40 characters of evidence; completion requires 80. Titles are unique after trimming and case normalization. Those lengths are guardrails for empty submissions, not a quality score.

Create this first example through CRUD practice:

```text
Title: Contact book
Goal: Create, list, update and delete contacts while rejecting duplicate email addresses.
Status: planned
Evidence: [leave empty initially]
```

Applying it creates version 1 in the workspace draft. Saving the workspace persists the aggregate. Reload, reopen the project and choose review without adding evidence. The rejection should retain the selected status, title and goal. If it instead returns to a blank form, the validation rule may be correct while the user experience is still wrong.

Read `validateProject` in [contracts.ts](../src/contracts.ts). The status-specific rule belongs here because both ordinary form changes and imported workspaces must obey it. A check located only in a React button handler would let import bypass the rule. The relevant shape is equivalent to:

```ts
if (project.status === "review") {
  text(project.evidence, "Review evidence", 10000, 40);
}
```

Do not copy that small fragment into a second import validator. Shared validation reduces the chance that UI and recovery disagree about what constitutes a valid project. Also inspect the common title, goal, date and identity checks; a status rule does not replace them.

Next, follow `putProject` in [progression.ts](../src/progression.ts). It receives the workspace, the proposed project fields, an expected project version for edits, and an injectable time. A new project has no expected version. An existing project must match the version that was opened. The function builds a new array and returns a validated workspace rather than mutating the caller's accepted object.

The time parameter makes examples deterministic. If version 1 was created at `2026-03-07T23:59:00.000Z` and edited on the next UTC day, the new record preserves its original creation time while updating its modified time. A test can assert both values without racing the wall clock. The project version advances to 2 only in the proposed result; the old input remains version 1.

The React handler in [PracticeView.tsx](../src/PracticeView.tsx) follows an equally important sequence: prevent form submission navigation, build the proposed change, call the domain function, apply the valid result to the workspace draft, and close the form. If the domain function throws, display the error and leave the form object untouched. The form is closed after validation, not in a `finally` block that would run on rejection too.

Add useful evidence and try again:

```text
Changed contact validation and the edit form. Ran the contact tests locally:
duplicate email rejected, original record unchanged, valid rename accepted.
Checked the rejected form retained its input. Still missing pagination coverage.
```

The project may now enter review. Save the workspace and reload to verify persistence. A list update before that save only proves that React rendered a new draft. Use the visible revision and a fresh read to support a claim about accepted storage.

Now exercise concurrency. Open the project in two tabs, apply different changes and save tab A. Saving tab B must fail at the workspace boundary. The earlier project version check cannot prevent this by itself, because each tab had its own local copy when applying its form. Export B's workspace draft, load current accepted data, and manually reapply the intended change to the current project. There is no automatic merge here.

For your extension, add an optional evidence category such as test, debugging, design or review. Before coding, decide whether one project may have several evidence entries and whether entries can be edited. An array of typed evidence records is a data-model change, not merely a dropdown. Update imported-workspace validation, version behavior, recovery fixtures and tests together. Submit a review description containing a successful example, a rejected example and the remaining limits.
