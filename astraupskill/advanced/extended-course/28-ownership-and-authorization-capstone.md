# 28. Capstone: ownership and authorization

The contact-book capstone is a proposed multi-user extension built separately from IPSKILL. Adding a login screen does not automatically make every contact operation owner-scoped. Authentication establishes who the caller is under the chosen system. Authorization decides whether that caller may perform a particular action on a particular resource. This chapter asks you to make that decision visible in reads, writes, search, relationships, and replay receipts.

## Draw the resource boundary

Create two fictional owners, Alex and Morgan. Give each one contact with similar visible data but a different stable identity. Alex must be able to list and edit Alex's contact. Morgan must not gain access merely by supplying Alex's contact identifier. The identifier locates a resource; it is not a secret capability unless your product explicitly uses such a capability design. This capstone assumes ordinary owner-scoped resources.

Write a table of actions: list, fetch by identity, create, edit, archive, restore, attach a tag, export, and replay a prior operation. For every action identify the owner context, target resource, and authorization check. A list endpoint that filters correctly does not protect a direct fetch endpoint that accepts any identity. A protected edit does not protect an export route that gathers unscoped rows.

## Bind ownership to trusted context

The request body should not be the authority for which owner is acting. If the client can send ownerId and the server trusts it without checking the authenticated context, a modified request can target another account. In your design, derive the acting owner from the established authentication context and use that scope when querying or mutating resources. If an administrator can act across owners, model that as a separate authorized capability with explicit tests.

Do not confuse input validation with authorization. A syntactically valid identifier can still name a forbidden resource. Conversely, a malformed identifier may be rejected before a resource lookup. Both checks matter, but their errors and evidence differ. Your test matrix should include valid owned identity, valid other-owner identity, missing identity, and malformed identity.

## Relationships can cross boundaries accidentally

Suppose Alex attaches a tag to a contact. Checking that the contact belongs to Alex is insufficient if the tag belongs to Morgan. Both sides of the relationship must satisfy the intended ownership rule. The database design from the earlier chapter can help encode this, but the application still needs an understandable authorization path and response.

The same issue appears in bulk operations. A request containing ten identities may include nine owned contacts and one forbidden contact. Decide whether the operation rejects the whole batch or processes a documented subset. Do not silently choose based on convenient query results. If partial success is supported, report each result without exposing unauthorized content. For a first capstone, all-or-nothing behavior is often easier to specify and test.

## Exercise BX-28A: build an access matrix

Use Alex, Morgan, an unauthenticated caller, and a caller with a deliberately defined administrative role. For each action in your table, predict allowed or rejected behavior. Include the returned information, not just the status. A rejected response should not include the forbidden contact's full representation in a helpful error payload.

Implement direct boundary tests rather than relying on hidden buttons. A browser that does not show Morgan's Edit button says nothing about a direct request using Alex's identity. The test should exercise the server or authoritative operation with a caller context that lacks permission and confirm accepted data remains unchanged.

## Exercise BX-28B: review operation replay

Take the retry receipt design from the previous chapter. Explain why receipt lookup must be scoped to the current owner and why authorization must still be considered when replaying a result. A stored successful response is not automatically safe to return to any caller who knows the key. If access rights can change, define the replay policy deliberately.

Use a scenario in which a contact is shared temporarily, an operation succeeds, access is later revoked, and a replay is attempted. This is a future design question, not a claim that your personal contact book must support sharing. The exercise reveals that caching and authorization are connected whenever cached results contain protected information.

## Exercise BX-28C: specify export behavior

An export can include many records and therefore deserves the same ownership discipline as individual reads. Define which archived records are included, how the owner is selected, and what happens if an export fails halfway through generation. Do not report a complete export when only part of the intended dataset is present. Include a count or manifest that the receiver can use to validate completeness.

Use synthetic data for the rehearsal. The learning objective is boundary enforcement and completeness, not collecting real contacts. Record the query scope and compare exported identities with the expected owner-specific set. This independent set comparison catches both missing owned records and accidental inclusion of another owner's records.

## Review discussion

Authorization is a property of each resource operation, not a decoration on the interface. A strong submission identifies trusted caller context, scopes every path, checks both sides of relationships, and treats cached or exported results as protected data too. Your final evidence should include direct rejected requests and unchanged accepted state, alongside the ordinary successful owner journey.
