# 14. Catalogs and cross-file integrity

A collection of individually valid files can still form an invalid application. A content index might report one mission count while a track pack contains another. A mission might have the correct shape but an unexpected reward. This project uses the checked-in catalog as a common reference for index and track validation. Read `validateIndex` and `validateTrack` in [content-loader.ts](../../../src/content-loader.ts), then compare their responsibilities with [contracts.ts](../../../src/contracts.ts).

## Local shape versus relational meaning

The index validator checks its exact top-level shape and requires the expected number of tracks. For each track it checks a known identity, uniqueness, and an exact pack path derived from that identity. It then compares reported lesson, exercise, and core counts with catalog-derived values. Finally it compares global totals with the sum of track totals. These are several different invariants. A test that changes all counts at once may show rejection without teaching which relationship matters.

The track validator checks lesson identities and order, then builds mission keys from lesson and mission identity. It looks those keys up in the catalog and compares kind and reward. It also tracks duplicates and checks the final mission count. Membership, uniqueness, and count work together. Count alone would permit replacing a missing mission with a duplicate. Membership alone would permit omitting known missions. A complete inventory proof needs all the relevant relationships.

## Work through a small imaginary catalog

Use a miniature catalog on paper with two lessons and three missions. The first lesson has two core missions; the second has one extension. Write a valid index and track outline. Then make six independent mutations: duplicate a track identity, alter a pack path, remove a mission, duplicate a mission, change a reward, and swap lesson order values without moving the lessons. Predict which check rejects each mutation.

This miniature example is a reasoning aid, not a replacement for the real checked-in catalog. To test the real functions, use fixtures consistent with their actual imported catalog or construct a deliberate isolated abstraction. Do not claim a three-mission object is a valid production SQL track. Clearly label fictional fixtures and actual application fixtures in your notebook.

## Exact keys make authorship stricter

The object helper can require an exact set of fields. That helps catch a typo such as importantHint instead of importantHints, but it also means adding metadata is a coordinated format change. An author cannot append an arbitrary field and assume it will be ignored. Before proposing a difficulty label, trace the type, validator, generator, and renderer that would need to agree.

This is a tradeoff, not a universal verdict on extensibility. Strict shape validation gives a clear failure when files drift. More permissive formats can support forward-compatible metadata, but they need an explicit policy about unknown fields. In this repository, teach the current strict contract first. Put alternative designs in a separate proposal with migration and compatibility consequences.

## Exercise BX-14A: produce an invariant ledger

List each cross-file relationship and identify its authority. For mission reward, the runtime track validator compares against the catalog. For track display description, text constraints apply but the code does not necessarily compare the wording with another file. Distinguish identity facts, numeric consistency facts, and free-form instructional content. This prevents treating every string difference as a corruption bug.

For each ledger row, include a valid example, a single-change invalid example, and the expected rejection point. If you cannot find an enforcement point, mark the relationship as a desired rule rather than an existing guarantee. An honest gap is useful engineering information. A confident but unsupported assertion can mislead a future author into relying on validation that does not exist.

## Exercise BX-14B: plan an atomic content release

Imagine deploying an updated index before its matching track pack. Explain what a learner could observe. The loader may reject inconsistent content, which protects state from accepting an unexpected catalog, but the learner still experiences an outage. Validation detects inconsistency; it does not by itself make deployment atomic.

Propose a release packaging approach that keeps the catalog, index, and track packs from different builds apart. You might use immutable versioned asset directories or a build manifest, but describe this as a future design. Define how a client selects a coherent set, what happens to cached old assets, and how a failed release is rolled back. Avoid a vague instruction to clear all caches; identify which cache and which version it contains.

## Exercise BX-14C: review an authoring change

Choose one real mission and propose a clearer prompt without changing its identity, kind, or reward. Make a review checklist that separates prose quality from schema validity. A syntactically valid mission can still have an ambiguous task, an answer leaked in its prompt, or a reference that teaches a different skill. Conversely, excellent prose cannot compensate for a broken mission key that disconnects saved progress.

Your review should include a learner attempt. Ask what artifact the learner must produce and what evidence would show that the artifact meets the prompt. If the instruction says understand transactions, replace it in your proposal with an observable task such as drawing an abort timeline and predicting accepted state. This improves assessability without changing the application's reward rules.

## Review discussion

Cross-file integrity is an application-level concern. Shape validators establish local facts; catalogs establish relationships; release processes keep those related files together. A good submission explains all three layers while remaining precise about which ones the repository currently implements. Keep your miniature examples, real fixture results, and future release proposal visibly separate so readers can tell evidence from design.
