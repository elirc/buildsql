# 32. Assessment and learning routes

This workbook contains more material than most learners should attempt in one uninterrupted sequence. Choose a route based on the skill you want to demonstrate, then use the assessment below to identify gaps. Completion means producing and reviewing evidence, not merely opening every Markdown file. The routes are suggestions for practice organization, not changes to the application's mission catalog or reward rules.

## Route A: read and explain an unfamiliar application

Begin with chapters 01-05, then 16-19. Your main deliverables are a source map, a model vocabulary, a boundary fixture table, a concurrency timeline, and a test-design review. You do not need to build a new backend for this route. The goal is to explain the existing application accurately enough that another person can predict its behavior from your account.

Use a three-pass reading method. On the first pass, identify inputs, outputs, and effects without trying to understand every helper. On the second, investigate validation and rejected paths. On the third, compare your claims with tests and controlled examples. This sequence keeps the first encounter manageable while still reaching the difficult boundaries that distinguish confident guessing from source-based understanding.

Assess yourself by asking another learner to choose a surprising case: a repeated completion, a stale project edit, a replacement with the same numeric revision, or an unknown mission identity. Explain which function decides the outcome and what remains unchanged. If you cannot locate the boundary, add it to your source notebook and repeat the explanation after a delay.

## Route B: frontend state and failure recovery

Study chapters 06-15 and 20-23, then complete chapter 31. Your deliverables are a state diagram, a correction-journey test plan, a controlled two-tab investigation, a recovery rehearsal, and a measured performance decision. This route emphasizes what the learner experiences when asynchronous work succeeds, fails, or becomes stale.

Keep a distinction between the current interface and your proposed improvements. For every proposal, write the observed problem, the desired behavior, and the acceptance example. Do not quietly edit the course narrative to describe the proposal as an existing feature. When you implement an improvement in a separate branch or practice copy, add evidence showing the before and after behavior.

The route's final demonstration should include an invalid form, a pending save, a rejected stale save, and successful recovery. Explain where text is held at each moment. A smooth happy path alone does not demonstrate control of asynchronous state. The valuable skill is preserving the learner's intent while respecting the application's acceptance rules.

## Route C: backend design through an independent capstone

Read chapters 24-28 after the foundations and transaction chapters. Build the contact book separately from IPSKILL and use a practice-project record to track its observable goal and evidence. Choose technologies you can run and verify, then consult their official version-specific documentation when implementing database or server behavior. The workbook's contract examples are technology-neutral starting points.

Deliver a narrow vertical slice before expanding features. Create, reload, reject invalid input, reject stale edits, and preserve the rejected form. Then add archive, ownership, transactional audit, and retry receipts if they are part of your declared scope. Each addition should come with a small acceptance matrix and a failure case. Avoid adding background jobs or deployment machinery before the basic boundaries are clear.

The final capstone review should ask whether the system enforces its own rules when the UI is bypassed. Direct invalid requests, other-owner identifiers, concurrent edits, and lost responses are the important probes. A polished page cannot compensate for a write path that trusts arbitrary owner identity or silently overwrites accepted changes.

## Route D: curriculum and evidence engineering

Study chapters 12-15, 17-19, 29, and 30. Your deliverables are a cross-file invariant ledger, a content-release proposal, a clearer mission prompt, a structured-evidence comparison, and a reproducible verification report. This route suits learners interested in developer education, content tooling, and reliable authoring workflows.

Choose one real mission and improve its assessability without changing its identity or reward. Name the artifact the learner must produce and the observation that would establish success. Review the revised prompt with a learner attempt. If the task can be satisfied by vague prose that never touches the intended skill, revise the acceptance example rather than merely adding more paragraphs.

For the evidence design, distinguish an executed experiment from a prediction or source trace. All can be valuable, but they support different claims. A useful curriculum helps learners express uncertainty honestly and improve it through observation. Your review should reward precise evidence, not simply a longer submission.

## A common scoring rubric

Use five dimensions worth twenty points each. Contract accuracy asks whether the submission states the actual rule and distinguishes proposals. Causal reasoning asks whether it traces the input through the deciding boundary to the observed result. Experimental quality asks whether fixtures isolate the intended behavior and include independent expected results. Preservation asks whether rejected actions retain the correct accepted state and valuable drafts. Communication asks whether another learner can reproduce and assess the work.

For each dimension, zero means missing or fundamentally misleading; five means a partial attempt with major gaps; ten means the main idea is present but important boundaries are omitted; fifteen means a sound explanation with minor limitations; twenty means a precise, reproducible account including a meaningful counterexample. Use the same rubric for your first and revised submission so improvement is visible.

Do not convert the score into application XP unless you deliberately implement a supported catalog change. This is a workbook assessment tool. Its purpose is to guide review and practice. A low score on one dimension identifies a next action, such as adding a preserved-state assertion or correcting a claim about persistence.

## Oral defense questions

Prepare short answers to these questions without reading your notes. Why can a form close before a workspace is saved? Why do workspace identity and revision both matter? What does a pure transformation test fail to prove about storage? Why can an equal-count content pack still contain the wrong missions? What happens to reward and attempts on a repeated completion? Why is a lost response not proof of rejection? What does an export hash prove, and what does it leave unproven?

For each answer, give a concrete example. A general statement such as concurrency is hard is not enough. Use W/15 and W/16, a mission due at a fixed timestamp, or a contact update committed before its response disappears. Examples make the reasoning inspectable and expose gaps that broad terminology can hide.

## Spaced revision plan

After finishing a route, wait before revisiting its central prediction tasks. First repeat a small set without notes. Then compare with your original answers and the review guides. Focus on the mechanism you forgot rather than rereading the entire workbook automatically. For example, if you remember that a stale save fails but forget why independent project edits still conflict, redraw the whole-aggregate P/Q timeline.

On a later pass, change one meaningful condition: replace the workspace identity while keeping revision equal, move a review from just before due to exactly due, or add a second tag to a paginated contact query. These variants are useful because they probe the same invariant from a new boundary. Do not create dozens of cosmetic renamings and count them as new mastery.

Keep a learning log with prediction, observation, corrected rule, and next check. A corrected misconception is a positive result when it is supported by evidence. The purpose of review is to make future reasoning more reliable, not to preserve the appearance that your first answer was always right.

## Portfolio assembly

Choose a small coherent set of artifacts rather than submitting every temporary file. Include the source map or schema, the most informative fixture table, one successful path, two rejected paths, a recovery account, and a verification note. Give each artifact a short explanation of the claim it supports. Keep synthetic data and redact any incidental personal information from screenshots.

Your portfolio introduction should state the scope accurately: source investigation, prototype, verified local feature, or independently implemented capstone. A proposed design can be excellent work without being called a deployed system. A local browser test can be strong evidence without being called production validation. Precise scope makes the achievement easier to trust.

Finish with an unresolved-question list containing only questions that matter to the declared scope. Each should include a proposed next experiment or source to inspect. Avoid vague future-work lists that promise every possible feature. A good engineer can explain both what the evidence establishes and what would be required to establish the next claim.
