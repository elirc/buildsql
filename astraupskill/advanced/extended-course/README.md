# IPSKILL engineering workbook

This extended course follows the real local application from form input through validation, progression, asynchronous coordination, browser persistence, recovery, testing and release evidence. Contact-book backend chapters are independent proposed capstones; they do not describe features added to IPSKILL.

Start with the [earlier advanced path](../README.md) for a shorter introduction, or choose a route in [chapter 32](32-assessment-and-learning-routes.md). Keep predictions and observations in your own notebook. Attempt exercises before consulting the separate review guides. Commands and experimental procedures are reproduction instructions unless a verification record explicitly says they were executed.

## Chapters

- [01 — Read a real application without reading every file](01-reading-a-real-application.md)
- [02 — Model information before choosing components](02-modeling-information.md)
- [03 — Validate at the boundary you actually cross](03-validation-boundaries.md)
- [04 — Use identity and versions to describe which state you mean](04-identity-and-versions.md)
- [05 — Learn from pure transformations before adding effects](05-pure-state-transitions.md)
- [06 — Give each piece of interface state an owner](06-interface-state-and-ownership.md)
- [07 — Treat a form as an editing protocol](07-forms-as-editing-protocols.md)
- [08 — Coordinate asynchronous work and report what actually happened](08-asynchronous-work-and-honest-feedback.md)
- [09 — Understand the transaction you are relying on](09-indexeddb-transaction-boundaries.md)
- [10 — Recover a conflict without erasing either person's work](10-conflict-recovery-and-merge-design.md)
- [11. Recovery is a user workflow](11-recovery-is-a-user-workflow.md)
- [12. Imports and schema evolution](12-imports-and-schema-evolution.md)
- [13. Streaming bytes and content limits](13-streaming-bytes-and-content-limits.md)
- [14. Catalogs and cross-file integrity](14-catalogs-and-cross-file-integrity.md)
- [15. Cache behavior and resource ownership](15-cache-behavior-and-resource-ownership.md)
- [16. Prerequisites and reachability](16-prerequisites-and-reachability.md)
- [17. Rewards, attempts, and learning evidence](17-rewards-attempts-and-learning-evidence.md)
- [18. Time as an explicit input](18-time-as-an-explicit-input.md)
- [19. Test design and independent oracles](19-test-design-and-independent-oracles.md)
- [20. Component tests and usable errors](20-component-tests-and-usable-errors.md)
- [21. Browser failure investigations](21-browser-failure-investigations.md)
- [22. Debugging with causal records](22-debugging-with-causal-records.md)
- [23. Performance and measurement design](23-performance-and-measurement-design.md)
- [24. Capstone: define a contact book before building it](24-contact-book-domain-capstone.md)
- [25. Capstone: relational modeling and constraints](25-relational-modeling-and-constraints.md)
- [26. Capstone: versioned writes and transaction design](26-versioned-writes-and-transaction-design.md)
- [27. Capstone: retries and operation identity](27-retries-and-operation-identity.md)
- [28. Capstone: ownership and authorization](28-ownership-and-authorization-capstone.md)
- [29. Design project: structured learning evidence](29-structured-evidence-design-project.md)
- [30. Release and reproducibility workshop](30-release-and-reproducibility-workshop.md)
- [31. Capstone: an offline workspace investigation](31-offline-workspace-capstone.md)
- [32. Assessment and learning routes](32-assessment-and-learning-routes.md)
- [33. Incident clinic: diagnose before changing code](33-incident-clinic.md)

## Separate review guides

- [Review guide: foundations and state ownership](solutions-01-foundations.md)
- [Review guide: content, recovery, progression, and time](solutions-02-content-and-progression.md)
- [Review guide: integration and capstones](solutions-03-integration-and-capstones.md)

## Practice standard

For each investigation record the starting state, action, prediction, observation, source function, and remaining uncertainty. Distinguish source traces, simulated examples, executed tests and proposals. Use disposable browser data for failure experiments and a separate practice project for backend capstones. Preserve learner answers and existing work.

The workbook is locally authored and its source links are checked. It does not claim that all proposed capstones or browser experiments have been executed. The organizer's `reportsfile/tenfold/buildsql.json` records the measured content and verification scope.
