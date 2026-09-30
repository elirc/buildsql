# 17. Rewards, attempts, and learning evidence

This project records several facts that are related but not interchangeable: written work, attempts, first completion, earned experience, and a review schedule. Inspect `completeMission` in [progression.ts](../../../src/progression.ts) and the corresponding tests in [game.test.ts](../../../src/game.test.ts). The transition requires written evidence before recording self-review. It increments an attempt for a valid action. It awards experience only on the first successful completion. A later failed recall can reset review scheduling without deleting the original earned completion.

## Separate achievement from activity

Suppose a learner completes a mission on Monday, reviews it successfully before it is due on Tuesday, and reports retry on Wednesday. The first completion timestamp remains the historical achievement. The experience reward is not paid again for the extra activity. Attempts record the additional interactions. The retry changes the review schedule according to its branch. These fields answer different questions: when was it first completed, how much reward has been earned, how often has the learner attempted it, and when should they revisit it?

A single counter called progress could not answer all four questions without ambiguity. This is why a useful data model often stores several narrowly defined facts instead of a broad status. At the same time, storing related facts creates consistency obligations. The save validator rejects disconnected completion, reward, review, and attempt histories. Read those checks before designing an importer or analytics view that reconstructs only part of the history.

## Idempotence needs a named effect

Calling the completion function twice with the same valid completed mission does not award twice, but it can increment attempts twice. Therefore saying the operation is idempotent without qualification is misleading. The reward effect is protected from duplication; the whole returned state is not necessarily identical after repeated calls. Always name the effect you mean when discussing idempotence.

For a future remote API, duplicate transport retries might need to count as one logical attempt. That would require an operation identity or another deduplication contract. The current pure function does not receive such an identity. Do not infer a network retry guarantee from the once-only reward branch. Instead, use the distinction to write a concrete extension proposal: which retries represent the same intent, how long the identity remains valid, and which response is replayed.

## Evidence length is not evidence quality

The code checks the written evidence with a maximum length and a minimum trimmed length. That prevents an empty or extremely short self-review from being recorded, but it does not prove the learner's code is correct. A paragraph of repeated characters can satisfy a length rule while conveying no useful learning evidence. This application records self-review; it is not secretly executing every exercise submission.

Create a rubric with four dimensions: observable result, explanation of the mechanism, boundary case, and reproducibility. For a SQL query exercise, useful evidence might describe the exact fixture rows, the returned columns and ordering, one null or duplicate case, and the command used to reproduce the result. For a UI exercise, useful evidence might include a keyboard path and an observed error state. Adapt the rubric to the task instead of demanding the same screenshot for every skill.

## Exercise BX-17A: predict five transitions

Start from a valid save with sufficient work for a known eligible mission. Predict the maps after a first retry, a first pass, a repeated early pass, a due pass, and a retry after completion. For each transition record attempts, completion timestamp, earned reward, review stage, and review due time. Use distinct fixed timestamps so you can see which fields are preserved and which are recomputed.

The first retry is especially useful. It records an attempt without awarding a completion or creating a review. Do not fabricate a review record just because the function name contains complete. Follow the branch conditions. Your answer should include a short explanation of how the result still satisfies the save validator despite having an attempt without a completion.

## Exercise BX-17B: improve an evidence submission

Rewrite this weak submission: I did the task and it worked. Choose a real mission and produce a stronger account using only observations you can actually make. Include one initial wrong assumption and the experiment that corrected it. Avoid inventing a test run. If you only traced source, call it a source trace; if you ran an executable test, record its command and result.

Now review your improved submission using the rubric. A polished explanation can still omit the boundary condition that the mission teaches. Conversely, a concise table of inputs and outputs can be excellent evidence if it makes the mechanism and reproduction clear. Evaluate substance, not word count or confidence of tone.

## Exercise BX-17C: design an analytics view

Propose a dashboard that distinguishes first completions, total attempts, due reviews, and reward totals. Define each metric mathematically in terms of the stored maps. Identify a misleading chart, such as treating every attempt as a newly completed mission. Explain how historical imported data and retries affect the interpretation.

Keep this as a proposed feature. The course is asking you to reason about metrics, not claiming that the existing application provides these charts. Your deliverable should include sample data for two learners who earn equal experience with different attempt histories. A useful dashboard would show that difference without labeling the learner with more attempts as less capable; repeated practice can be valuable learning activity.

## Review discussion

Reward systems are data systems with human consequences. Precise field meanings prevent duplicate rewards and misleading reports, while thoughtful evidence rubrics make self-review more useful. The strongest answer connects the branch logic to the learner's experience and makes clear what the software can verify automatically versus what requires human judgment.
