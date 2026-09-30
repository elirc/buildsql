# 21. Browser failure investigations

Some important behavior exists only when the application, browser storage, and multiple tabs interact. The repository includes [verify_browser.py](../../../verification/verify_browser.py), which starts an owned loopback server and uses disposable browser data. Read its setup before running or extending it. It requires a fresh output directory and refuses an occupied verification port. Those checks protect the meaning of the evidence: the run should test the intended build with its own artifacts.

## Reproduction is a controlled experiment

A useful browser investigation specifies the initial workspace, the number of tabs, the sequence of user actions, and the storage observations after each accepted transition. Two tabs editing at the same time is too vague. Instead, record that both tabs loaded workspace identity W at revision seven, tab A changed the goal, tab B changed the title, A saved first, and B then attempted to save its stale draft. The expected result follows from that sequence.

Use unmistakable synthetic markers in each draft. If both tabs change a field to nearly identical text, a screenshot may not reveal which value won. Markers such as accepted-from-A and unsaved-from-B make the outcome inspectable without exposing personal learner data. Record both the visible message and a read of accepted storage after the operation settles.

## Inject one failure at a time

Choose a specific boundary: content fetch fails, storage open fails, a transaction aborts, a stale save conflicts, or a replacement reaches snapshot capacity. Each requires different setup. A general offline toggle may break several unrelated requests and obscure the behavior you intended to study. Prefer a targeted interception or fixture in a disposable environment, and explain exactly what it simulates.

For example, rejecting a content response tests loading feedback but does not simulate an IndexedDB write failure. Seeding malformed accepted data tests recovery behavior but is not the same as a quota failure. Both can be valuable, yet their conclusions differ. Name the injected condition in the evidence file and avoid broad claims such as handles every storage error.

## Observe after the correct boundary

A screenshot captured while a promise is pending may show a busy indicator, which is useful for that state, but it cannot prove final acceptance. A request success callback inside a transaction is likewise not the final durable boundary. The verification helper's state reads resolve on transaction completion. Study that choice and use the same discipline in your own experiments.

The browser test's save helper waits for accepted-local feedback and the saved revision notice, then checks that Save is disabled. Those observations connect interface state with an accepted workflow. For a stronger storage claim, pair them with a fresh read or a second-tab observation. A visual success message alone could be wrong if the UI were accidentally optimistic.

## Exercise BX-21A: write a two-tab script on paper

Before automating, list exact actions for a stale-save investigation. Include tab labels, initial identity and revision, field changes, first save, second save, retained draft, exported losing draft, and reload of accepted data. At each step, state what may change and what must remain unchanged. Make the script executable by another person without guessing which tab to use.

Then identify the smallest assertions needed to distinguish the correct outcome from silent last-writer-wins behavior. The stale tab must not replace accepted data. Its draft should remain available for preservation. The conflict message should tell the learner what happened. A test that only sees an error but loses the draft misses a major part of the user contract.

## Exercise BX-21B: design evidence capture

Choose artifacts for three failures: a screenshot for visible feedback, a structured state record for accepted data, and a short action log for timing. Explain what each artifact proves and what it cannot prove. Avoid collecting unnecessary full browser profiles or personal content. Synthetic fixtures are easier to share and compare.

Make output filenames unique to the run and refuse accidental overwriting. The existing verification script follows this principle for its output directory. A later run should not silently mix screenshots from one build with state records from another. Evidence provenance is part of reproducibility, even in a local learning project.

## Exercise BX-21C: investigate a flaky test

Suppose a conflict test passes when run alone but fails in the full browser suite. List plausible shared-state causes before increasing timeouts: reused storage, a server from another run, a previous tab still open, output from an old build, or an action that did not await acceptance. For each hypothesis, name an observation that would confirm or reject it.

Longer waits can hide a race without explaining it. Replace arbitrary sleep with a specific state or event when possible. If the system genuinely has a timing-sensitive requirement, document the timing and use controlled scheduling where feasible. A reproducible causal sequence is more educational than a test that happens to pass after waiting longer.

## Review discussion

Browser failure work is strongest when it combines a precise action timeline, a targeted fault, and observations at the correct boundary. Keep the environment disposable, the artifacts attributable to one run, and the conclusions narrow enough to be supported. Your final submission should let another learner repeat the failure and explain why the accepted data remains correct.
