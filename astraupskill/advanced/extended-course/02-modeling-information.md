# 02 — Model information before choosing components

## A model is a collection of promises

The [contracts module](../../../src/contracts.ts) describes a `PracticeProject` and a `Workspace`. A project has identity, version, title, goal, evidence, status and timestamps. A workspace has schema version, identity, revision, learning save state and projects. These are not merely convenient shapes for JSON. Their relationships express promises about what a valid stored workspace means.

For example, a project's `id` answers which project it is. Its `version` describes an accepted sequence of edits within a workspace transformation. A title is descriptive text, so two projects might have similar titles without being the same entity. Treating a title as identity would make renaming difficult and could confuse two independent projects. Treating array position as identity would make deletion or sorting change the apparent identity of later records.

Before adding a field, identify its owner and meaning. A page-size preference belongs to presentation unless the product requires it to travel with the workspace. A contact's email belongs to a future Contact book's model. An evidence note belongs to a practice project but does not automatically establish that the described command ran. Good modeling keeps facts, preferences and claims distinguishable.

## Read the current shapes carefully

`PracticeProject.status` uses the finite choices planned, building, review and complete. The type definition helps TypeScript callers avoid arbitrary status strings, but imported JSON is not automatically constrained by the compiler. The runtime validator must enforce the same domain. This illustrates the difference between an internal programming aid and a boundary that accepts untrusted or old data.

`Workspace.schema` describes the shape of the aggregate. It is not a record edit counter. `Workspace.revision` describes changes to accepted aggregate state. A future schema migration could produce a different representation without implying that the same record versioning rules have disappeared. When two fields are both numbers, names and documentation must prevent their meanings from being exchanged accidentally.

The learning save state has maps keyed by mission identity: completion, earned XP, attempts, work and reviews. These maps are related. A reward entry cannot be interpreted independently of the mission catalog. An imported record claiming a reward for an unknown mission should not become valid merely because its value is numeric. Modeling therefore includes cross-field and cross-file relationships, not just the type of each individual property.

## Work through a field proposal

Imagine adding a `priority` field to practice projects. Begin by writing questions rather than code. Is priority one of three named values or any integer? Is it required for old projects? Does changing it affect updated time and project version? Should it change list ordering? Does the import format reject unknown values or migrate an older missing value? Is priority evidence of actual urgency or a learner preference?

Choose a narrow first contract: a finite preference with a documented default when migrating an older schema. That choice still requires coordinated work in the type, runtime validator, form, display, import path and tests. If the current exact-field validator rejects additional properties, merely adding a property to a TypeScript interface will not make saved imports work. Follow actual validation behavior before proposing compatibility.

Now contrast a derived field. “Number of completed projects” can be computed from projects. Storing it separately creates a second source of truth and requires every relevant operation to update both. A computed count may be sufficient. If performance later motivates materializing it, document the consistency boundary and how to detect/rebuild disagreement. Do not introduce a duplicate fact simply because it makes one render line shorter.

## Distinguish absence, empty text and invalid text

An optional value may be absent, explicitly null or an empty string. Those states are not interchangeable without a contract. In the current practice-project model, evidence is a string and status-dependent validation determines whether it is sufficient. A future optional description might choose null for an intentionally empty value, but that policy should not be silently imported into every field.

Consider a draft containing only spaces in a title. A form may display those spaces, but the domain operation trims the title and goal before validating the resulting project. The runtime text validator also checks constraints that differ from simple JavaScript truthiness. Neither `if (title)` nor a TypeScript `string` annotation establishes an acceptable title.

The general technique is to create a small truth table before writing normalization. Include missing, null, empty, spaces, ordinary text, boundary-length text and text containing a disallowed control character. State accepted representation and error behavior. That table reveals whether the intended model is precise enough to implement.

## Independent modeling tasks

**BX-02A:** Design a practice-project “next action” field. Decide whether it is required in every status or only building/review. Write four examples that distinguish an unfinished thought from an observable next step. Explain which parts can be validated mechanically and which require human review.

**BX-02B:** Propose a structured evidence list. Give each entry identity, category and observed result. Decide whether a command is optional for manual observations. Convert a legacy note without inventing a timestamp. Explain how the migration preserves uncertainty instead of turning prose into fabricated verification.

**BX-02C:** Draw relationships between mission catalog entries and the five save maps. For each map, state what an unknown mission ID would mean. Then identify a cross-map condition that cannot be checked by validating only one property at a time.

## Review discussion and transfer

A useful next-action design does not claim that a minimum character count proves quality. It can require nonblank bounded text and let a reviewer assess whether the action is observable. A useful evidence model allows honest manual observations rather than forcing a fake shell command into every entry. A useful catalog map recognizes that mission identity and reward policy are owned by the catalog, while learner work references them.

These habits transfer to larger applications. Distinguishing identity from presentation, authoritative facts from derived values and observed evidence from claims reduces accidental complexity before any database or framework enters the design. The model does not need to predict every future requirement. It needs to state the current promises clearly enough that a proposed change can identify which promise it would extend or replace.
