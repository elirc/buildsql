# Review guide: content, recovery, progression, and time

Attempt chapters 11-19 before reading this guide. The examples below emphasize rejection boundaries and independent expected results. They are explanations of the current local source where named, and design criteria for proposals where the exercise asks for a future feature.

## Recovery artifacts and snapshot capacity

For BX-11A, an unsaved workspace edit is most likely preserved by exporting the draft before reload. A stale-tab conflict likewise calls for preserving the losing draft before loading accepted data. An accidental successful replacement may be recoverable from the outgoing accepted snapshot. A malformed accepted record can require raw export for investigation because validated reads may reject it. An import rejected before replacement should leave the existing accepted workspace intact. Each row names a different artifact because the failure stages differ.

The capacity sequence in BX-11B starts with nine snapshots. A valid replacement adds the tenth and accepts a new workspace identity at revision zero. The next replacement sees count ten and aborts. A later read should show ten snapshots and the workspace accepted by the previous successful replacement. Checking only the error text does not prove preservation. The transaction must be observed after completion or abort, not during an individual request callback.

An especially useful fixture makes outgoing accepted content, incoming replacement content, and an unsaved draft visibly different. The replacement snapshot protects outgoing accepted content when a current workspace exists. It does not magically include edits held only in an unapplied form or unsaved draft. This is why recovery documentation must name the state being preserved.

## Migration reasoning

For BX-12A, the proposed category migration should preserve every old project identity and its evidence, assign a documented default, and validate the result under the new schema. The default is not inferred user intent. If the new field changes title normalization or uniqueness, include a fixture showing whether formerly distinct projects collide. A migration that unexpectedly drops a project to resolve that collision violates preservation unless the user explicitly chose that policy.

For BX-12B, parsing and migration can succeed while the final replacement conflicts. The candidate exists in memory, but accepted storage remains unchanged because acceptance belongs to the transaction. A staged diagram should not contain a write arrow during pure conversion. This separation makes it possible to inspect or export a converted candidate without claiming it has replaced the workspace.

Format routing should also be described carefully. The current parser recognizes schema two for workspace validation and otherwise tries save validation. That does not mean every other schema is supported. Exact-shape and version checks can reject the fallback candidate. A future migration dispatcher should enumerate supported formats and explain unsupported ones rather than relying on a vague legacy label.

## Byte streams and failure stages

For BX-13A, unsuccessful HTTP status and missing body reader fail before decoding. Byte overflow fails when the cumulative chunk size exceeds the limit. Invalid UTF-8 fails during decoding, including a possible final flush failure for an incomplete character. Malformed JSON fails after decoding. A curriculum shape failure occurs only when a public loader applies the corresponding validator to parsed unknown data. A stage matrix should show that later stages do not run after an earlier rejection.

For BX-13B, streaming reads do not imply constant memory because the implementation accumulates decoded text and then parses it. The configured limits bound the accepted input, while runtime memory can include multiple representations. A measurement plan should inspect actual largest packs and relevant devices. The source alone does not establish an optimal memory budget or universal loading speed.

For BX-13C, useful messages distinguish a missing asset, oversized content, and inconsistent catalog data. The learner's saved work should not be blamed for a deployment content mismatch. A proposed message can suggest retrying a temporary fetch failure or reporting a content build problem, but should avoid promising that every retry will fix a structural validation error.

## Catalog consistency and cache order

For BX-14A, mission identity, kind, and reward are checked against the catalog. Track and global counts are checked for consistency. Descriptive strings have text constraints but are not all equal to a second canonical wording source. The invariant ledger should distinguish those categories. An authoring review can therefore approve a clearer prompt without treating a changed sentence as an identity migration.

For BX-14B, immutable versioned assets are one possible future release design, but the proposal must explain how the client selects a coherent catalog and pack set. Merely making filenames longer does not ensure coherence. A manifest or build identity needs to connect the files, and rollback must select a prior coherent set. The current validators detect mismatch; they do not by themselves orchestrate deployment.

For BX-15A, the requested cache sequence gives these orders after each step: SQL; SQL then React; React then SQL after the SQL hit; unchanged after Node fails; SQL then TypeScript after TypeScript succeeds and React is evicted; TypeScript then React after React loads and SQL is evicted. The failed load does not enter the cache. Recording order as well as membership is necessary to predict the next eviction.

For BX-15B, a pending-promise cache needs a rejection policy. Removing a failed promise allows a later retry; retaining it can make a temporary failure permanent until another invalidation event. Shared cancellation requires an ownership decision because one consumer leaving should not necessarily abort another consumer's needed load. A complete proposal specifies both callers' outcomes, not just the number of fetch calls.

For BX-15C, the map's two-entry bound is not a proof of total retained-memory size. Other references can keep evicted packs alive. A measured investigation must distinguish cache membership from object reachability and should avoid declaring a leak from a single noisy memory reading.

## Eligibility and optional work

For the miniature course in BX-16A, no history permits A1. Completing A1 permits A2. Completing A1 and A2 permits A3 and B1. Completing all cores permits B2 as well. Optional challenge A3 is not required merely because it is earlier in display order. A valid historical completion of known B2 remains reviewable under the explicit early return in `canComplete`, even if the current prerequisite route would not permit a first completion from that history.

A real fixture for historical completion needs valid companion maps. If the validator rejects disconnected history, the test has not reached the eligibility question. This is a recurring lesson: valid setup is part of a focused negative test. The control fixture should make the intended rejecting or accepting branch observable.

For BX-16B, presentation checks provide guidance and disabled states, while the action check protects the transition regardless of entry point. Keeping both is reasonable when they share a consistent policy. An archive route or future caller can reach the action without using the usual lesson navigation, so UI restrictions alone are insufficient evidence of enforcement.

## Reward and attempt predictions

For BX-17A, a first retry records one attempt but no completion, reward, or review. A first pass records the original completion instant, the catalog reward, and a stage-zero review due three fixed days later. A repeated early pass increases attempts without paying again or advancing the not-yet-due review. A due pass advances the stage, capped at the final configured stage, and computes a new due time from the action instant. A retry after completion preserves the earned achievement and schedules stage zero one fixed day after the retry.

These results show why once-only reward is narrower than whole-operation idempotence. Repeated calls can change attempts and activity information even when reward does not change. A remote transport-deduplication design would need an explicit logical operation contract. The current function's parameters do not include one.

For BX-17B, strong evidence describes a concrete input, expected result, observed result, and reproduction method. It can also explain a corrected misconception. More words are not automatically better: a concise fixture and output table can be stronger than a page of unsupported confidence. For BX-17C, equal experience with different attempt counts is a valid outcome and should not be mislabeled as inconsistent data.

## Temporal boundaries and test claims

For BX-18A, use exact fixed instants. An action just before due does not advance a successful review; an action exactly due can. A same-UTC-day action does not extend the streak again, while a next-UTC-day action can. A skipped day resets the streak according to the implementation. An earlier UTC day is rejected, and an invalid Date is rejected separately. Do not infer a stricter monotonic timestamp rule from the day comparison.

For BX-18B, due reviews sort by canonical due timestamp and then mission identity. Canonical timestamp validation supports the lexical ordering assumption. If a future format accepted arbitrary offsets, the sorting argument would need to be reconsidered. This illustrates how an upstream contract can simplify downstream logic.

For BX-19A, a strong negative test has a valid control, one intentional invalid condition, a relevant rejection assertion, and preserved state. For BX-19B, choose the layer that can observe the claim: pure arithmetic in a unit test, component feedback in an interaction test, transaction rollback in storage integration, and actual keyboard behavior in a browser. For BX-19C, report passed, skipped, setup-failed, and not-run separately. Honest test accounting is part of the engineering skill this workbook assesses.
