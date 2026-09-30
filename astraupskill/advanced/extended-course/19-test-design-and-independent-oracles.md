# 19. Test design and independent oracles

A test is useful when it can reject a plausible wrong implementation. Copying the implementation's formula into the expected value can make a test look comprehensive while preserving the same mistake on both sides. Read [game.test.ts](../../../src/game.test.ts) and select three tests whose expectations come from the product rule: once-only rewards, exact elapsed review intervals, and stale project rejection. Explain the independent reasoning behind each expected result.

## Start with a claim

Write a single sentence that the test is meant to establish. For example: a rejected stale edit preserves the accepted project's evidence and version. That sentence immediately suggests more than checking for an exception. You need an accepted input, a stale expected version, a candidate containing a recognizable change, and an assertion that the accepted input remains unchanged. If the test only expects any error, a failure caused by malformed setup can accidentally satisfy it.

Keep setup valid except for the one condition under investigation. A stale edit with a goal shorter than the required minimum might fail validation before it reaches the stale-version rule. A test named rejects stale edits should demonstrate that a current-version version of the same candidate would otherwise be acceptable. This control case makes the negative test far more persuasive.

## Three kinds of oracle

An example oracle gives a specific expected output, such as a review due exactly three days after a known instant. A property oracle states a relationship, such as the input workspace remains unchanged after a pure transformation. A model oracle compares behavior with a simpler independent representation, such as a small table of prerequisite dependencies. Different oracles reveal different mistakes.

Do not call a model independent if it reproduces the same slices, filters, and arithmetic in the same order as the production code. For a prerequisite test, a hand-authored dependency table for a small known section can be easier to review. For reward accounting, expected totals can come from a fixed list of first completions rather than summing the returned map with the same helper under test.

## Mutation as a question

Without modifying production code, ask which assertion would fail if the due comparison changed from inclusive to exclusive. Ask what would fail if the project version stopped increasing, if rewards were paid on every pass, or if a replacement reused its predecessor's workspace identity. These thought experiments help identify missing assertions. If you perform actual mutation testing, use a disposable copy and record that scope.

A surviving mutation is evidence of a test gap or an equivalent behavior, not automatically proof that the application is broken. Analyze the mutation. Removing a redundant validation call may leave all externally observable behavior unchanged for the tested API. Conversely, changing a boundary can be important even if ordinary happy-path tests remain green. The goal is informed test design rather than maximizing an unexplained score.

## Exercise BX-19A: repair a weak negative test

Design a stronger version of a test that currently does only expect operation to throw. Choose one of these behaviors: importing an oversized file, deleting a stale project, or completing a locked mission. State the valid control fixture, the isolated mutation, the expected rejection category, and the state that must remain unchanged. Include an observation proving that the intended boundary was reached.

For oversized imports, distinguish raw UTF-8 size from parsed object size. For stale deletion, retain a copy of the original project list. For a locked mission, choose a real catalog identity and provide sufficient written evidence so a missing-evidence error cannot masquerade as prerequisite enforcement. Your answer should explain why each preparation step is necessary.

## Exercise BX-19B: choose the right test layer

Classify these claims: the level curve at 350 experience, the Save button's busy state during a pending write, atomic replacement of workspace and backup, a visible error after a failed content request, and keyboard navigation through a project form. For each, choose a pure unit test, component test, storage integration test, or browser test and justify the boundary.

The categories can overlap. A critical behavior may have a fast lower-level test and a smaller number of end-to-end checks. The mistake is assuming that one test layer proves every other layer. A unit test of a pure transform cannot prove that a button calls it, while a browser screenshot cannot precisely establish all persistence invariants.

## Exercise BX-19C: write a test result honestly

Draft a verification note for a run where ten tests passed, two were deliberately skipped because they require a database, and one setup command failed before tests ran. Report each outcome separately. Do not turn skipped cases into passing cases or describe a failed runner as an assertion failure. Include enough command and environment context for another learner to reproduce the result.

## Review discussion

Strong tests connect a product claim to a controlled experiment and an independent expected result. Strong reports preserve the distinction between executed behavior, skipped behavior, and untested assumptions. Your portfolio should contain a small set of tests with clear explanatory value rather than a large set of assertions that mirror implementation details. A reviewer should be able to name the plausible bug each test would catch.
