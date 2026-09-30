# 06 — Give each piece of interface state an owner

## Start with a state inventory

Open [PracticeView](../../../src/PracticeView.tsx) and list its local state: the form, error, query, status filter and page. Then open [useWorkspace](../../../src/useWorkspace.ts) and list the larger workspace state: draft, accepted expectation, dirty state, busy state, storage connection and recovery snapshots. The two lists have different responsibilities. A form knows what a learner is typing; the workspace coordinator knows what aggregate may be saved.

State ownership becomes important when two actions happen close together. Changing a filter should not erase a form. Saving a workspace should not secretly reinterpret a form that has not been applied. Reloading accepted data should not discard an unsaved draft without the defined user decision. These behaviors depend on where state lives and which operation is allowed to replace it.

Avoid beginning with a rule such as “put everything in one global store.” Centralizing values does not automatically clarify their meaning. It may make unrelated transitions able to overwrite one another. Conversely, keeping everything local can make coordinated behavior impossible. Choose ownership by asking who creates the value, who changes it, who must observe it and how long it must survive.

## Distinguish source state from derived state

The practice list derives filtered projects, sorted order, page count and current clamped page from the workspace plus view preferences. These derived values can be recomputed. Storing an additional independently updated copy of the filtered collection would create another consistency problem: every project edit, deletion, query change and status change would need to update it correctly.

Imagine an implementation storing `visibleProjects` and `totalProjects` separately. A delete removes a row from the first but forgets the second. The interface now displays nine rows while claiming ten. The problem is not merely a missing setter; it is duplicated ownership of a fact that can be derived from one collection. A better design computes the count from the same filtered collection used for paging.

Derived values can still have policy. The current list sorts by updated time with identity as a tie-breaker and clamps the displayed page. Those are decisions worth testing, not incidental implementation details. Recomputing the values does not make the policy disappear; it reduces the number of places where the policy must stay synchronized.

## Follow an unfinished form through a list change

Suppose a learner opens project P and types a new goal. Before applying it, they change the search query so P disappears from the visible list. What should happen to the form? A reasonable contract preserves it because the query changes presentation, not the learner's intent. Closing it silently would connect two unrelated state transitions and risk losing work.

Now suppose a different action replaces the entire workspace. The form may no longer refer to a project in the accepted identity. Preserving it without marking its basis stale could also be wrong. The difference is not whether the action changes the screen; it is whether the action changes the domain state on which the form is based.

Write this distinction as a table. A filter change preserves the form. A page change preserves it unless the product explicitly defines otherwise. An accepted change to the edited project requires a version comparison. A workspace replacement requires a deliberate review of stale local intent. Tables expose policy before code makes the behavior accidental.

## Use refs and rendered state for their actual jobs

The workspace hook uses refs for values needed immediately during event coordination and state for rendered feedback. For example, an in-flight guard is set before awaiting work and cleared afterward. A second event arriving before a render still needs to observe that operation as in flight. A rendered disabled button is useful feedback, but the synchronous guard owns the immediate decision.

This does not mean refs are always safer than state. A ref update does not request a render. If the interface should display a change, it needs an appropriate rendered-state update. The design can legitimately keep related values for different purposes, but their relationship must remain clear. A comment or test explaining that relationship is more useful than a blanket ban on either primitive.

## Design a transition table

For one editing session, use states closed, editing, rejected and applied. For workspace persistence, use ready, saving, accepted and failed. Do not combine these into a single enormous status string unless that representation genuinely simplifies the allowed transitions. The form can be editing while the workspace draft is dirty; those dimensions are not always mutually exclusive.

List events and owners. Opening a form belongs to the practice view. Applying it invokes a domain transformation. Saving belongs to the workspace coordinator. A transaction completion supplies a new accepted aggregate. A transaction rejection supplies an error while retaining useful draft state. The table should say which event may replace which value.

## Independent tasks

**BX-06A:** Create a state inventory for the existing practice view. Mark each value as user input, authoritative domain data, derived display data or asynchronous coordination. Defend one ambiguous classification.

**BX-06B:** Design a “show archived projects” preference as a future feature. Decide whether it is persisted, whether changing it resets the page and whether it can close a form. Provide one interaction sequence that would expose an accidental coupling.

**BX-06C:** Review a patch that calls `setForm(null)` inside a search-input change handler. Explain the user-visible loss and propose a test that begins with typed form content before changing the query.

**BX-06D:** Design a test for two Save events delivered before the first asynchronous operation completes. State which guard you expect to reject or ignore the second event and which rendered indicator communicates progress.

## Review discussion

The inventory should distinguish accepted storage from a draft even though both share the Workspace type. The archive preference should not become a data migration accidentally unless persistence is part of the requirement. The form-loss test needs actual typed input so a silent reset becomes observable. The double-save test should examine the operation count or accepted-state transition, not only whether the button looked disabled in a screenshot.

State ownership is successful when the next change has an obvious home. If adding a filter requires editing persistence code or if saving storage resets unrelated view preferences, investigate whether responsibilities have become entangled. Clear ownership reduces the number of surprising interactions a learner must memorize.
