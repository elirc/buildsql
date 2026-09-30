# 23. Performance and measurement design

Performance work should begin with an observable problem and a representative workload. The practice view filters projects, sorts matching records, and displays a page of results. The workspace contract limits the number of practice projects. The content loader separately handles much larger curriculum packs. These are different workloads, so one generic optimization story is unlikely to fit both. Read [PracticeView.tsx](../../../src/PracticeView.tsx), [contracts.ts](../../../src/contracts.ts), and [content-loader.ts](../../../src/content-loader.ts).

## Estimate before optimizing

For a workspace capped at one hundred projects, filtering and sorting a list may be entirely adequate. That does not prove every render is fast, but it gives scale to the question. A proposed index or complex memoization layer needs evidence that it improves a meaningful interaction without introducing stale results. For a large track pack, network transfer, UTF-8 decoding, JSON parsing, validation, and rendering may dominate instead.

Write a simple cost map. Filtering examines candidate records. Sorting orders the matches. Pagination selects a slice. Rendering builds the visible cards. If only ten cards are rendered but all records are filtered, the page size does not reduce every earlier cost. Conversely, a slow content load may have little to do with project pagination. Locate the expensive stage before changing code.

## Define the measurement

Choose a user-visible interval such as changing the search query to the updated result list, or selecting a track to readable lesson content. Define start and end events. Record warm and cold conditions separately because a cached track behaves differently from its first load. Include the browser, build mode, dataset size, and machine conditions that matter to reproduction.

One measurement is a clue, not a distribution. Repeat a controlled scenario enough to see variability, but avoid running unrelated heavy tasks during the comparison. If you compare two implementations, use the same dataset and environment. Explain whether you measured development mode or a built preview, because tooling overhead can change the result.

## Exercise BX-23A: build representative fixtures

Create a disposable fixture plan for zero, one, ten, eleven, and one hundred projects. Include long but valid goals and evidence, varied statuses, equal updated timestamps, and search terms that match title, goal, neither, or many records. Explain what each fixture investigates. Eleven projects is useful for crossing the page boundary; equal timestamps exercise the secondary ordering rather than raw speed.

Do not use oversized invalid data to claim ordinary workload performance. The validator may reject it before the view runs. Stress tests beyond supported bounds can still be useful for defensive behavior, but label them separately. A performance report should make clear whether it describes supported data, invalid input rejection, or a future larger-scale proposal.

## Exercise BX-23B: examine a memoization proposal

Suppose someone proposes memoizing filtered projects. Identify the complete set of dependencies: project data, query, status, and any ordering rule used. Explain how missing a dependency could display stale results. Then compare the complexity and maintenance cost with the measured benefit at the supported project limit.

A correct answer may recommend no change. Optimization is not a requirement to add a cache. If the measured interaction is already comfortably responsive, improving a loading message or reducing a large content payload may provide more value. State the evidence that supports your choice rather than treating a particular React technique as a universal best practice.

## Exercise BX-23C: analyze content loading

Separate transfer, decoding, parsing, validation, and display for a large track. The loader's byte limit bounds input size, while the two-entry cache reduces repeated successful loads. Propose measurements that distinguish a slow first load from slow repeated navigation. Investigate whether the repeated path is a cache hit before drawing conclusions from network tools alone.

If you propose splitting track packs further, describe how lesson identity and catalog consistency would be preserved. Smaller downloads can increase request count and complicate release coherence. A design recommendation should include those tradeoffs and an experiment that could validate the expected improvement.

## Exercise BX-23D: write a performance conclusion

Given a hypothetical improvement from 40 milliseconds to 25 milliseconds on one local machine, write a cautious conclusion. State the scenario, the number of runs, the range or distribution observed, and whether the difference affects the learner's experience. Do not claim universal speedup or scalability to thousands of projects when the application supports one hundred.

Also include a correctness check. A faster filter that omits goal matches is not an acceptable optimization. Performance experiments should preserve the behavior being optimized, and the report should say how that equivalence was checked.

## Review discussion

Performance engineering is evidence-driven prioritization. Understand supported scale, measure a named interaction, separate warm and cold paths, and keep correctness in the comparison. The most useful portfolio artifact is a small reproducible experiment with a justified decision, including a decision to retain simple code when the evidence supports it.
