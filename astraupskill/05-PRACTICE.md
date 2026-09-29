# Five applied tickets toward mid-level CRUD development

Work through these tickets in order. They are future exercises, not features already claimed by the application. Create a practice project for each, record the contract before implementation, and attach reproducible evidence when requesting review. Prefer one small complete behavior over several half-connected screens.

**Ticket 1: configurable project page size.** The practice list currently displays ten projects per page. Add a choice of 5, 10 or 20. Begin with a view-only preference so you do not need to migrate persisted workspaces. Decide whether changing the size resets the page or preserves the first visible project. Explain the decision in your review description. Test an empty list, a last partial page, a filter that reduces results, deletion of the final item on the last page, and changing size while a form is open. Keep the form's input intact.

Example: thirteen projects at size ten produce pages of ten and three. Filtering down to two matches should not leave the user on an empty second page. The selected page must be clamped to the filtered page count. A reviewer should be able to reproduce this with fixture projects rather than hundreds of manual clicks.

**Ticket 2: structured evidence entries.** Replace the single evidence text field with a small list of entries containing an identity, category, command or explanation, observed result and timestamp. Keep the first version deliberately small: no uploads, external links that auto-fetch content, or rich text editor. Decide whether evidence can be edited or only appended. Add a schema migration that preserves the original text as one legacy entry instead of dropping it.

The acceptance criteria include import validation, duplicate evidence identities, bounded entry counts, rejected empty results, project status rules and draft export. Test a migrated completed project: it should not become invalid simply because the new evidence structure has more fields. Document any information that cannot be inferred from the old text.

**Ticket 3: a Node or .NET contact API.** Build a separate small backend as an extension, then connect a dedicated contact screen. Choose one backend stack. Define a contact identity, display name, email and version. Add create, paginated list, detail, update and delete routes. Validate on the server, keep email uniqueness consistent, and use expected versions for changes. Do not transmit the entire learning workspace merely to update one contact.

Write the HTTP contract before the route handlers. Show one valid creation, one rejected duplicate, one missing record and one stale edit. A failed request must retain the frontend draft. Use a temporary database in tests, a loopback development port and explicit configuration. The current IPSKILL application has no account system, so this exercise must not silently invent an authorization model.

**Ticket 4: owned records and permissions.** Extend the contact API with authenticated users and ownership. Define which actions belong to an owner, a viewer and an administrator, if those roles are actually needed. Derive identity from the server's authenticated context rather than accepting an arbitrary owner ID from a form. Test two users accessing the same record identity. The interface hiding a button is helpful presentation; server-side authorization is the control that protects the operation.

Include registration or local test-user provisioning, password/session handling appropriate to the chosen stack, logout and rejected requests. Use framework documentation for the concrete authentication implementation. Keep this extension isolated until its tests and data migration are complete; do not describe the existing local workspace as authenticated.

**Ticket 5: a booking workflow with a real conflict.** Add a resource, booking interval and status. Two overlapping accepted bookings for one exclusive resource must be impossible. Express that invariant in the database transaction or constraint, not only in a preliminary availability request. Then test two simultaneous requests that both initially observe an available slot. Exactly one may succeed if the intervals conflict.

Record how the losing form recovers. It should explain the conflict, retain the proposed interval and allow a new choice. Add a test for retries after a lost creation acknowledgement so the same booking request cannot create duplicates. Discuss cancellation, time zones and daylight-saving transitions explicitly. Avoid claiming global scheduling correctness from tests that only use one UTC timestamp.

Each completed ticket should contain changed files, commands run, observed results, one rejected-path trace, a screenshot where useful, and a limitation you intentionally left for later. Use the [review guide](06-SOLUTIONS-AND-REVIEW.md) to check whether your explanation is as reproducible as your code.
