# Review behavior, evidence and tradeoffs

This guide provides expected reasoning for the practice tickets without pretending that one code fragment solves every implementation detail. A reviewer should be able to understand the product trigger, the resulting behavior and the evidence without reading your chat history. Lead with a concrete example: “When a filter reduces thirteen projects to two, the list now moves to the first valid page.” Then explain the small change that makes that behavior reliable.

For page size, derive the visible slice from the filtered collection. Compute the page count after filtering, with a minimum of one page for an empty collection. Clamp the current page before taking the slice. Keep page size within an explicit set. A test that only checks that a dropdown changes its own value is weak; a test that checks the actual item identities on the second page is useful. Keep form state separate from pagination so changing a view preference cannot discard an unfinished edit.

For structured evidence, start with a migration table. Write down how each old property maps into the new schema. Old free text might become one entry with category `legacy-note` and an unknown command field. Do not invent a successful test command or execution date from prose that lacks it. A migration that refuses ambiguous data with an actionable report may be better than one that silently invents proof. Preserve the raw source or a snapshot before accepting the transformed workspace.

For a contact API, the route handler should translate HTTP into a domain command, invoke the persistence operation, and translate the result into a stable response. Keep validation and uniqueness rules available to every write path. A typical versioned update reads the expected version, updates only if the current version matches, and increments it as part of the same transaction. Reading first and writing later without a protected comparison leaves a race between those steps.

The frontend should store the expected version from when editing began. Refreshing a displayed contact must not silently change that expectation while preserving an old draft. Otherwise the client can overwrite new data while claiming it used optimistic concurrency. Use an explicit compare-and-review action if the user wants to reapply the draft to a newer version. Record that decision in the interface and test it across two actual clients.

For owned records, review both list and detail endpoints. Filtering a list by owner while leaving direct access unrestricted is an incomplete permission model. Check update and delete paths separately, including guessed IDs and records that were reassigned. Error behavior should not reveal unnecessary private data. Use explicit server test identities, and explain what the test environment simulates rather than claiming it proves every production identity-provider configuration.

For booking conflicts, a preliminary availability response is information, not a reservation. The final write must enforce the invariant. Your review should show the two-request timeline and the transaction boundary. Add a deterministic concurrency test with a barrier if necessary so both requests reach the competing point. A test that sends requests one after the other cannot establish that simultaneous writes are safe.

Use this review checklist for every ticket: Can a valid operation be reproduced? Can the important invalid operation be reproduced? Is previously accepted data preserved on rejection? Does the form retain useful input? Does a retry have a defined meaning? Are schema changes reflected in import and recovery? Are displayed counts based on actual records? Are limits and omitted behavior stated accurately?

An effective review comment identifies the risk and a specific counterexample. For example: “This update reads version 3 before starting the transaction. Another writer could accept version 4 before the replacement. Move the comparison inside the write transaction and add a two-writer test.” That is more actionable than “make this safer.” Apply the same standard to your own review explanations.

Compare your implementation with the current [storage boundary](../src/storage.ts) and [worked change](03-WORKED-CHANGE.md). They illustrate one bounded local design. They are not instructions to serialize every future backend into a single JSON aggregate. Mid-level judgment includes recognizing when a design's simplicity has become a throughput, data-size or collaboration limitation.

## The compare-and-update this project actually ships

`src/progression.ts:157` is the local equivalent of the versioned update described below: the expected version is compared against the stored one *before* any new value is built, and the increment happens in the same returned workspace rather than in a later write.

```ts
export function putProject(
  workspace: Workspace,
  input: Omit<PracticeProject, "created" | "updated" | "version">,
  expectedVersion?: number,
  now = new Date(),
): Workspace {
  const current = validateWorkspace(workspace),
    existing = current.projects.find((p) => p.id === input.id);
  if (
    existing
      ? existing.version !== expectedVersion
      : expectedVersion !== undefined
  )
    throw Error(
      "Practice project changed. Reopen its current version before saving.",
    );
  const project = {
    ...input,
    title: input.title.trim(),
    goal: input.goal.trim(),
    version: existing ? existing.version + 1 : 1,
    created: existing?.created ?? now.toISOString(),
    updated: now.toISOString(),
  };
  const projects = existing
    ? current.projects.map((p) => (p.id === input.id ? project : p))
    : [...current.projects, project];
  return validateWorkspace({ ...current, projects });
}
```

