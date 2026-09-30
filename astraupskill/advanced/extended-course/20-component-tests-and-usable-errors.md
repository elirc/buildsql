# 20. Component tests and usable errors

A form can reject invalid input correctly and still be difficult to use. It might erase the entered text, hide the error from assistive technology, or close before the learner can correct a mistake. The existing [App.test.tsx](../../../src/App.test.tsx) tests demonstrate a useful combination: rejected completion evidence produces an alert, the project title remains in the form, and the parent change callback is not called. Read this test alongside [PracticeView.tsx](../../../src/PracticeView.tsx).

## Test the user's contract

The test locates controls by labels and buttons by accessible role and name. These queries express how the interface identifies an action to the learner. They also make missing labels visible during development. However, passing a label query is not a complete accessibility audit. Keyboard order, focus management, contrast, zoom behavior, and announcements during asynchronous transitions need their own observations. Keep the claim proportional to the check.

The rejected submission test fills a valid title and goal, selects complete, and omits the required completion evidence. This isolates the status-specific evidence rule. The useful outcome is a combination of preserved input, visible explanation, and absence of the parent change. If the test asserted only that an alert exists, the form could still erase the learner's work. If it asserted only that the callback was not called, the interface could fail silently.

## A callback is not persistence

The successful form test observes a call to `onChange`, then applies the supplied transformation to the provided workspace to inspect the proposed project. This proves the component proposes a valid change to its parent. It does not prove that IndexedDB has accepted a save. The button name itself describes applying to the workspace draft. Preserve that distinction in tests and product explanations.

Imagine a future test that clicks Apply and immediately expects a saved notice. That test would encode a different workflow unless the application were deliberately redesigned. Tests can accidentally become a source of product drift when their author substitutes a familiar pattern for the actual contract. Before adding assertions, trace the ownership boundary from component to hook to storage.

## Exercise BX-20A: design a correction journey

Write a component test plan in which the learner submits insufficient completion evidence, receives an error, adds adequate evidence, and submits again. Identify which values should remain between submissions. Identify when the parent callback may run and when the form should close. Include an assertion that the first failed attempt did not create a partial project in the parent draft.

The test fixture should contain evidence that satisfies the actual length contract, but your explanation should acknowledge that length is not semantic correctness. Do not describe the test as grading the learner's project implementation. It verifies the form's validation and state-preservation behavior.

## Exercise BX-20B: inspect keyboard behavior

In a disposable browser session, open the new-project form using the keyboard. Move through its controls, attempt an invalid submission, correct the error, and dismiss the form through the supported route. Record the focused element after each transition. Where behavior is unclear, describe what you observed and propose a desired focus policy separately.

For example, a product decision might move focus to the first invalid field or to an error summary. Either can be reasonable if the user understands the problem and can continue efficiently. Merely adding `role=alert` does not settle that decision. Your evidence should describe the actual experience, including whether the error is discoverable without using a pointer.

## Exercise BX-20C: test empty states accurately

The existing component suite checks an empty list without inventing example projects. That matters because sample-looking records can be mistaken for saved learner data. Design separate scenarios for a genuinely empty workspace and a nonempty workspace whose current filters match nothing. Explain whether the same message is sufficient and what action helps the learner recover.

A proposed empty-state improvement should not change the stored project list merely to make the screen look populated. If you want demonstration data, give it an explicit opt-in workflow and distinguish it from the learner's records. In this lesson, a clear explanation and a route to create or clear filters may be enough.

## Exercise BX-20D: choose stable assertions

Compare asserting a CSS class with asserting that a named button is disabled during a busy state. The latter expresses a behavior the learner can observe. A class assertion may be appropriate for a visual implementation detail, but it should not be the only evidence that an action is unavailable. Similarly, searching arbitrary text across the whole document can accidentally match a hidden or unrelated element. Choose queries that correspond to the specific control and state under investigation.

## Review discussion

A good component test protects a small user journey: enter information, receive feedback, correct a problem, and retain control of the work. It also respects system boundaries. Draft application is not durable acceptance, a semantic label is not a full accessibility certification, and an evidence-length check is not automated grading. These distinctions make both tests and documentation more trustworthy.
