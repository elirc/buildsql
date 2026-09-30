# 24. Capstone: define a contact book before building it

This capstone is a proposed independent project, not an existing IPSKILL backend. The application already lets you record a practice project with an observable goal and evidence. Use that feature to track the work, while implementing the contact book in a separate practice repository or disposable workspace. The learning objective is to connect domain rules, interfaces, persistence, and verification without treating a list of technologies as a specification.

## Product brief

Build a personal contact book in which a signed-in owner can create, view, edit, search, and archive contacts. Each contact has a stable identity, display name, optional email, optional phone note, editing version, and timestamps. The owner should be able to recover from a rejected edit without retyping the form. A second editing session should not silently overwrite changes accepted from the first. Archived contacts should be distinguishable from permanently erased records.

The brief intentionally leaves several decisions open. Decide whether two contacts may share an email, whether display names must be unique, and whether an archived contact appears in ordinary search. Those are domain choices. Do not assume email is a universal unique identifier for a person. Shared inboxes, missing addresses, and changed addresses make that assumption unsuitable for many contact books. State the product you are building and make its rules explicit.

## Write observable acceptance examples

For creation, use an example with a display name and no email. State whether it succeeds and what identity and version are returned. For an invalid email, state the rejection and preservation of entered values. For editing, specify that the client sends the version it originally loaded. For a stale edit, define the response and the accepted record that remains unchanged. For archiving, define visibility in normal and archived views.

These examples should be precise enough for a tester who has not read your code. Replace phrases such as works correctly with specific fields and outcomes. A useful stale-edit example starts with version four, accepts one edit as version five, then rejects another request still expecting version four. The rejected candidate should contain a recognizable value so accidental overwrite is easy to detect.

## Model identity and normalization

Choose a stable contact identifier that is independent of its display name and email. Define normalization separately for each field. A display name might trim surrounding whitespace while preserving internal spacing. An optional field may map blank input to absence. Email validation should match the product's intended scope and should not claim to establish deliverability merely by checking syntax. A phone note may intentionally remain free text because the application is not dialing calls.

Keep raw form text and accepted normalized values conceptually separate. A user should be able to see and correct rejected input. If normalization changes meaningful text, explain the change before acceptance or make the policy clear. BuildSQL's distinction between generic text validation and field-specific trimming is a useful source-reading comparison, but your capstone must define its own contract.

## Exercise BX-24A: create the domain decision record

Write one page with the decisions above and a reason for each. Include at least two rejected alternatives. For example, rejecting email-as-primary-key can be justified by address changes and shared addresses. Rejecting automatic hard deletion can be justified by the recovery workflow you chose. The record should explain consequences, not merely list preferences.

Add a vocabulary section distinguishing contact identity, owner identity, editing version, archived state, and operation identity if you later implement retry deduplication. These values solve different problems. A contact identifier does not authorize access, and an editing version does not identify a particular HTTP request. Keeping those meanings separate prevents several common design errors.

## Exercise BX-24B: build a vertical slice

Implement one narrow route through the system: create a contact, return the accepted representation, display it, and reload it from persistence. Use synthetic data. Before adding search, import, or background jobs, demonstrate that validation errors retain the form and that a failed persistence operation does not produce a success message.

Your evidence should identify where the authoritative validation lives. Client validation can improve feedback, but a caller that bypasses the form still reaches the server or persistence boundary. Write a direct invalid request or lower-level test to prove the boundary rejects it. Then show that the interface presents the failure usefully.

## Exercise BX-24C: add archive semantics

Define whether archiving is reversible and whether it increments the editing version. Specify what happens when two sessions concurrently edit and archive the same contact. If archiving changes the representation, a stale edit should not accidentally resurrect the record unless that is a deliberate supported action. Write the race as a timeline before implementing it.

Create acceptance tests for ordinary listing, archived listing, direct access to an archived contact, and restoration if supported. A hidden row is not the same as an inaccessible row. Decide which operations remain allowed and enforce them at the appropriate boundary. Your UI should reflect those rules without becoming their only enforcement point.

## Evidence and assessment

Submit the decision record, a small schema diagram, the vertical-slice implementation, five acceptance examples, and a recovery demonstration. The assessor should be able to create a contact, reject an invalid edit without losing text, reproduce a stale-version conflict, and distinguish archive from deletion. A polished interface is welcome, but it does not replace these behaviors.

Award yourself up to twenty points: four for explicit domain rules, four for boundary validation, four for versioned edits, four for usable failure recovery, and four for reproducible evidence. A missing persistence boundary caps the submission at a prototype rather than a completed durable application. Record that honestly in your IPSKILL project evidence.
