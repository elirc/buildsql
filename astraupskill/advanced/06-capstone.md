# Capstone: Contact book with understandable failures

Build a small independent Contact book and use IPSKILL to record the work. Choose one backend stack, one persistence layer and a React interface. A feature is complete when a second person can reproduce its contract and recovery; the number of screens is not the measure.

## Milestone A — agree on the model

Write a one-page contract for ID, name, normalized email and version. State which fields may be empty, how duplicate emails are detected and whether deletes are permanent. Include example requests and responses. Mark authentication as absent unless you deliberately add and test it; a locally named owner field does not establish an authorization system.

## Milestone B — make the ordinary path work

Create, browse, inspect, edit and delete fictional contacts. Include enough fixture data to span two pages. Keep ordering deterministic, including a tie-breaker. A fresh clone should have clear setup instructions and a known fictional dataset. Avoid coupling contact persistence to IPSKILL's entire learning-workspace JSON.

## Milestone C — make failure understandable

Demonstrate duplicate creation, invalid input, a missing record and a stale edit. For each, show the response, the surviving form draft and the stored data afterward. Open two independent clients for the stale-edit case. The reviewer must see that refreshing a row does not silently overwrite the edit's expected version while leaving stale field values in place.

## Milestone D — recover an uncertain creation

Simulate a dropped response after a successful commit in an owned test environment. Recover the result with the same operation identity. Then try changed input with that identity and demonstrate your documented rejection. Include a timeline and database assertions proving that the exact retry did not insert a second contact.

## Milestone E — hand it to another learner

Your handoff includes setup, fixture creation, one short demo, exact checks, observed outcomes and known limitations. Attach an example failed response and explain which layer produced it. Ask the reviewer to choose one case you did not rehearse. If your setup only works because of an unrecorded local tool or existing database, improve the instructions before adding more features.

Use the course rubric, then write a three-sentence retrospective: what invariant you initially missed; which experiment changed your understanding; what evidence would be needed for a larger deployment. Future ownership, booking conflicts and cross-device synchronization are separate extensions. Finish this feature's contract before adding them.
