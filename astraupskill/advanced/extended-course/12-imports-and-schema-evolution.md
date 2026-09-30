# 12. Imports and schema evolution

An import turns external bytes into trusted application state. Even when the file was exported by the same application, the receiving code cannot know whether it was edited, truncated, produced by an older version, or copied from another tool. TypeScript declarations do not inspect those bytes. This project makes the transition explicit in [contracts.ts](../../../src/contracts.ts): `parseImport` checks encoded size, parses JSON, then selects the workspace validator for schema two or the save validator otherwise. Follow that actual dispatch before designing migration exercises.

## Separate format recognition from acceptance

It is tempting to say that every object without schema two is a legacy save. The code routes such objects toward the save validator, but routing is not acceptance. An object with a future schema value can still fail the exact save shape. A learner should explain the complete path, including the rejecting validator, rather than infer that the fallback accepts arbitrary historical formats. Likewise, JSON parsing accepts many values that this application rejects, including arrays, numbers, and null.

Build a fixture table with a valid current workspace, a valid legacy save, a scalar, an array, a workspace with schema three, and an object with an extra field. Keep each invalid fixture close to a known valid fixture so the reason for rejection is understandable. One fixture with six independent errors proves little about any particular boundary. When a test says unknown schema is rejected, ensure it reaches the schema decision instead of failing earlier because the JSON is malformed.

`importWorkspace` wraps an accepted legacy save in a new workspace. That wrapper creates an identity, revision zero, and an empty practice-project list. It does not reconstruct projects that never existed in the legacy format. Write this as an explicit migration result. A migration can preserve every representable old value while still introducing new empty fields. The important question is whether that choice matches the product's intended meaning.

## A proposed schema-three migration

For this exercise only, imagine adding a project category. Do not change the production schema as part of reading the lesson. First decide whether category is optional, whether an uncategorized value has a distinct meaning, and whether categories are free text or stable identifiers. Those decisions determine whether an old file can be converted without asking its owner a question.

Write a pure migration specification from schema two to schema three. The input is a validated schema-two workspace, not arbitrary unknown JSON. The output is a candidate for a schema-three validator. Define the default category and demonstrate that every old project receives it consistently. Preserve project identity, creation time, and evidence unless a documented rule requires otherwise. Decide whether a migration changes an editing version. There is no universal answer: the version may represent changes to editable content, storage representation, or any accepted update. State your choice before testing it.

Now ask what happens when an older application opens the new file. Quietly removing category may lose meaningful work. Rejecting a future schema with an actionable message is often easier to reason about than pretending full compatibility. If you propose a downgrade exporter, define its loss report. A field that cannot be represented should be disclosed rather than silently erased. This is a design exercise, not a claim that the current application provides downgrade support.

## Migration properties

A migration should have properties stronger than passes one example. It should preserve the number of projects when no filtering is intended. It should preserve the association between identities and evidence. It should not turn two distinct valid titles into a duplicate under the new normalization rule. Its output should satisfy the new schema. Running a format-recognition function on an already migrated document should recognize the new format rather than attempt the old migration again.

Be precise about idempotence. A function specifically typed as schema-two to schema-three is not necessarily meant to accept its own output. A broader migration dispatcher may be idempotent because it returns already-current documents after validation. Tests should target the intended public contract instead of imposing a property on the wrong internal function. This distinction prevents confusing test failures caused by invalid test inputs.

## Exercise BX-12A: build a migration notebook

Use five small synthetic workspaces. Include empty projects, a completed project with sufficient evidence, a title with surrounding whitespace that is valid under the current rules, the maximum supported project count, and two projects that differ in a way your proposed category scheme must preserve. For each, write the expected output before implementing a migration prototype in a separate practice directory.

Your notebook should include a loss analysis. A default category carries less information than a category selected by the learner. Do not report the migration as having inferred the learner's intent. Label defaults as defaults. This is especially useful when product stakeholders see populated fields and assume the information was already known.

## Exercise BX-12B: reason about import atomicity

Suppose parsing succeeds, migration succeeds, and the final replacement conflicts because another tab saved first. Which changes are accepted? The parsing and transformation can produce an in-memory candidate, but acceptance is still controlled by the storage transaction. The existing workspace should remain the winner, and the candidate can remain available for the user to inspect or retry through an appropriate workflow. Migration success is not permission to bypass optimistic concurrency.

Draw the stages bytes, parsed unknown value, recognized version, validated old state, migrated candidate, validated new state, committed workspace. Mark where each failure is reported and which artifacts still exist. This diagram is a useful review tool because it exposes accidental writes during what should be a pure conversion stage.

## Review discussion

The best migration submissions explain meaning, compatibility, and preservation. They include rejection cases and show that a rejected conversion cannot partially replace accepted data. Avoid generic claims such as supports all old versions unless you have enumerated those versions and their contracts. A future maintainer needs a small, explicit compatibility table more than an optimistic promise.
