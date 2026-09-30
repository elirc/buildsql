# 05 — Learn from pure transformations before adding effects

## Separate deciding from persisting

The practice-project functions in [progression.ts](../../../src/progression.ts) transform values. They validate an aggregate, decide whether an operation is allowed and return a new aggregate or throw. Storage acceptance happens elsewhere. This separation makes it possible to investigate domain decisions without starting a browser database, but it also limits what a passing function test can establish.

Consider `putProject`. It first validates the workspace, finds an existing record and checks the expected project version. It constructs the updated project with normalized title/goal, version, creation timestamp and updated timestamp. It then builds a new project array and validates the resulting workspace. The return value describes a valid proposed state; it does not establish that any user will ever save that state.

This distinction is useful in a test. You can assert that an edit preserves the original creation timestamp while updating the edited timestamp and version. You can assert that another project's fields remain equal. You can also retain the input object and verify that it has not been mutated. Those are precise transformation properties even though no persistence has occurred.

## Immutability is observable behavior, not a slogan

Suppose a function changes `workspace.projects[0].title` in place and then returns the same workspace. A UI might render the new title in one path, hiding the mutation. Another caller retaining the original value now sees an unexpected change. An undo operation or comparison based on that original value may be compromised. The issue is ownership of a value, not merely whether spread syntax appears in the code.

A shallow copy also has limits. Copying an outer object while mutating a nested shared array still changes values visible through the original object. To reason accurately, draw the object graph and mark which references are shared. The current functions build new structures at the points they change, and some save operations use `structuredClone` for a larger independent copy. The appropriate technique depends on the shape and required ownership boundary.

Do not conclude that every object must be deeply cloned at every function call. That can add cost without improving the contract. Instead identify which caller may retain a reference and which operation is allowed to mutate it. A test can freeze selected input structures or compare a preserved serialization, but choose the method based on the property being investigated and the supported data types.

## Deterministic time is a test input

Several progression functions accept a `now` value. Passing a fixed time makes assertions reproducible. A test that calls the system clock repeatedly can accidentally compare values from different instants, especially around day boundaries. Supplying time explicitly also makes the policy visible: the function applies this operation at the supplied instant, subject to its validation rules.

For an edit example, choose a valid project created earlier and supply one fixed later timestamp. Assert preserved creation time and changed update time. Then supply the same fixed time to a repeated operation and reason about the version behavior separately. Time equality does not necessarily mean the command is a duplicate; operation identity and timestamps have different roles.

For a mission-completion example, a fixed `now` helps expose UTC-day and elapsed-day rules. Do not infer a local-calendar policy from a display label or from the timezone of your development machine. Follow the implementation's `toISOString`, day slicing and duration arithmetic. A later chapter can compare alternative policies, but the current test should establish the policy that actually exists.

## Validate both input and result

Why validate a result constructed by your own code? Because the operation can combine individually valid pieces into an invalid whole. A new project might exceed aggregate count or size limits. A progression change could create inconsistent maps. Result validation turns those conditions into a refusal before the candidate is accepted by the next layer.

Input validation also protects assumptions inside a function. Without it, a caller could supply malformed versions or unknown status values and receive confusing behavior from later comparisons. The order of checks should make failures understandable while avoiding mutation before an operation is known to satisfy its contract.

A rejected transformation should leave the original value available to the caller. That does not automatically guarantee the UI keeps the form open or displays a useful message; those are coordination and presentation behaviors. Precise tests separate the pure function's preservation property from the interface's recovery property.

## Independent transformation tasks

**BX-05A:** Write a contract table for create, valid edit, stale edit and delete. For each, list expected identity, version, creation time, updated time and whether the original workspace changes. Include a missing-project deletion case and explain the refusal.

**BX-05B:** Design an “archive project” transformation as a future exercise. Decide whether archive is a new status, a separate flag or a separate collection. Explain how that choice interacts with exact-shape validation and existing status rules before writing code.

**BX-05C:** Create a mutation detector for a small valid workspace fixture. Demonstrate that a deliberately in-place title edit changes the preserved input. Then explain what your detector does not prove about unsupported values or browser storage.

**BX-05D:** A test asserts only that a returned title equals the requested title. Add assertions that distinguish a correct edit from replacing the whole project with a new identity and fresh creation time. Explain why the happy-path title alone is insufficient.

## Review discussion

Strong answers preserve the meaning of identity and history while changing the requested fields. The archive proposal should acknowledge compatibility work instead of treating an extra boolean as free. The mutation detector should demonstrate an ownership property, not claim to prove every future implementation pure. The expanded edit test should catch a superficially correct result that loses the record's continuity.

Pure transformations are a useful teaching boundary because their inputs and outputs fit on one page. Their value grows when you also understand their limit: a proposed state is not a committed state. Keep that distinction intact as the workbook moves into interface coordination and durable transactions.
