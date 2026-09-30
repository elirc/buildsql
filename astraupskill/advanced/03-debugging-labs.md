# Investigate a failure before changing code

Use a disposable profile and fictional data. Keep your normal learning progress elsewhere. Each lab asks for a prediction first, a reproducible observation second, and a proposed fix only after locating the boundary. Do not clear browser storage to make a failure disappear.

## BSQL-L1 — the project disappeared after reload

Create a project and click Apply, then reload before Save workspace. Start with a clean accepted baseline so the observation is unambiguous. Does the form action promise persistence? Read the button text and follow `apply` into `putProject` and `onChange` in [PracticeView](../../src/PracticeView.tsx).

Record which state changed and which did not. A useful issue report says “the draft changed but no commit was requested,” rather than asserting a database failure. Propose a small explanatory UI change if the distinction remains confusing; preserve the explicit-save design unless your feature contract deliberately changes it.

## BSQL-L2 — two tabs disagree

Load the same accepted workspace in A and B. Save A, then attempt B's previously prepared change. Capture the losing draft, accepted revision and displayed error. Reload accepted state only after exporting the draft. Explain why manually reapplying one intended edit is different from importing the entire stale aggregate.

Challenge: replace the accepted workspace from A while B remains open. Predict what happens if the numeric revision is again zero. Identify the identity check that prevents an old workspace from being confused with a new one. Do not edit IndexedDB by hand merely to obtain a convenient result.

## BSQL-L3 — pagination shows no rows

Create thirteen fixture projects and navigate to page two. Apply a filter with two matches. In [PracticeView](../../src/PracticeView.tsx), follow `filtered`, `pages` and `current`. Check that slicing uses the clamped page. Record the IDs of visible projects, not just the text in the pagination control.

For an exercise variant, move page-count calculation before filtering in a disposable copy and explain the resulting mismatch. Keep a form open while changing the filter. A page control must not reset unrelated form input. This proposed mutation is a learning experiment; the current implementation already clamps its derived page.

## BSQL-L4 — an import looks plausible but is invalid

Export a small disposable workspace. Work on a copy of that JSON and change one project version to a negative number. Preview the import. Locate validation in [contracts](../../src/contracts.ts) and identify the first rejecting rule. Compare the accepted export before and after the rejection. Do not “repair” validation by silently replacing invalid fields with defaults.

Next, design a future evidence-list migration from one free-text field. Write down which data can be preserved exactly and which cannot be inferred. An old paragraph saying “tests passed” does not reveal a command, timestamp or machine. Label unknowns honestly.

## A reusable investigation note

For each lab, submit seven lines: starting accepted state; action; expected state; observed state; first relevant boundary; evidence path; remaining uncertainty. Add a timeline when more than one asynchronous event matters. “I tried again and it worked” is a useful observation, but it does not explain the original failure or establish a durable fix.

[Build exercises](04-build-exercises.md) · [Answer guide](05-solutions-and-rubric.md)
