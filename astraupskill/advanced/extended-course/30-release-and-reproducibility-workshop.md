# 30. Release and reproducibility workshop

A learning project becomes easier to trust when another person can reproduce its setup and checks. The repository's [package.json](../../../package.json) declares its Node engine range and scripts for validation, tests, build, and preview. Read those exact declarations rather than assuming commands from another React project. This chapter asks you to produce a compact release notebook that distinguishes source state, dependencies, generated assets, and verification evidence.

## Know what a command establishes

The check script runs content validation, tests, and build in sequence. A failure in the first command prevents later commands from establishing their results. If validation fails, do not report the unexecuted test suite as failed assertions or as passing. Record where execution stopped. Likewise, a successful build establishes that the configured compilation and bundling completed; it does not prove every browser interaction or recovery scenario.

The dev and preview scripts use a fixed loopback host and strict port. If that port is occupied, the expected behavior is not to quietly test an unrelated server. Identify the process you own or choose a documented isolated verification route. The browser verification script uses its own port and output directory checks for the same reason: evidence should be attributable to the application and build under test.

## Separate reproducibility from environmental luck

Record the runtime version, package manager version, dependency lockfile, and commands used. Do not rely on globally installed tools whose versions are absent from the project. A working local installation can hide missing setup instructions. On the other hand, do not reinstall every dependency during a documentation-only review when the existing environment is adequate for the relevant checks. Choose verification proportionate to the change.

For a release rehearsal, use a clean disposable checkout or copy when practical. Confirm that generated content and checked-in catalog belong to the same source state. A build that combines an old content pack with a new catalog can fail at runtime despite each file existing. The cross-file integrity chapter explains why release coherence matters beyond compilation.

## Exercise BX-30A: write a reproducible setup card

Create a short card with prerequisites, working directory, dependency installation command appropriate to the lockfile, validation command, test command, build command, and preview command. State which commands you actually ran and which are instructions for a future reader. Include expected categories of output, such as successful content validation or a named test suite, without hardcoding a count that you have not checked.

If a prerequisite is missing, record the missing item and the affected check. Do not mark the whole application broken merely because an optional browser tool is absent. Conversely, do not mark browser verification complete when it was skipped. A useful setup card helps the next person distinguish an environment issue from a product failure.

## Exercise BX-30B: assemble a release evidence manifest

List the source revision or local source snapshot identifier, relevant changed files, executed checks, timestamps, and artifact paths. For important generated files, a hash can help prove which bytes were reviewed. Explain that a hash establishes identity, not semantic correctness. A perfectly repeatable broken file still has a stable hash.

Keep the manifest concise and avoid collecting secrets or unrelated local configuration. If the project has uncommitted user changes, describe that limitation honestly instead of claiming a clean revision. A local documentation delivery can still be useful without being a published release. The manifest should state what was actually produced and where it lives.

## Exercise BX-30C: rehearse a failed release

Imagine the build succeeds but content validation fails on a mismatched reward. Decide whether the release should proceed and why. Then imagine all automated checks pass but a targeted browser recovery scenario fails. Explain how the severity and scope affect the decision. Avoid reducing release readiness to one green command.

For the learning exercise, write a rollback or withdrawal plan for a bad content release. Identify which coherent set of assets would be restored and how a client selects it. Do not propose deleting learner storage to repair a content mismatch. User state and curriculum assets are separate concerns and should remain distinguishable in the recovery plan.

## Exercise BX-30D: review another learner's instructions

Follow a peer's setup card in a disposable environment and record every unstated assumption you encounter. Examples include the wrong working directory, an omitted runtime range, a port conflict, or a command that relies on an existing generated file. Turn each issue into a concrete documentation improvement rather than a vague complaint that setup is difficult.

## Review discussion

Reproducibility is a communication skill supported by tooling. Clear commands, coherent artifacts, accurate check results, and honest limitations let another person assess the work. Your final deliverable is a setup card and evidence manifest that distinguish a local edit, a verified build, a browser-tested workflow, and a published release instead of treating them as the same event.
