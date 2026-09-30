# 27. Capstone: retries and operation identity

This chapter extends the proposed contact-book backend with a retry protocol. It is not a description of a feature already present in BuildSQL. The motivating case is simple: the server commits a request, but the client loses the response. The client cannot safely infer either success or rejection from the transport error. An operation identity can let a later retry refer to the same logical intent rather than create a new command.

## Define the identity's scope

Choose an operation key generated when the user begins a specific save intent. Keep it stable across transport retries of that same intent. A changed body or a newly confirmed edit should normally be a new intent and receive a new key. Scope the key to the authenticated owner so two users choosing the same text cannot retrieve each other's result. The key does not replace authentication or authorization.

Define a request fingerprint containing the semantic facts that must remain the same for a replay. Depending on the API, those may include method, route, target identity, expected version, and normalized request body. Be explicit about canonicalization. Comparing arbitrary serialized JSON can distinguish harmless property-order changes unless the serialization policy is controlled. Comparing too few fields can replay a result for a different command.

## Store acceptance and replay evidence together

A receipt might record owner, operation key, fingerprint, result status, accepted resource identity and version, and expiry. If the business change commits but its receipt does not, a retry may be processed again. For this capstone, require the accepted mutation and durable receipt to share a transaction. The response is sent after that transaction commits.

Now consider a repeated key with a different fingerprint. Replaying the old success would misrepresent the new request. Executing the new request would violate the key's meaning. Define a conflict response that explains the key was reused for a different intent. The client should preserve the new draft and create a new key only after treating it as a new operation, not silently hide the mistake.

## Pending operations and concurrency

Two identical requests can arrive before either has committed a receipt. A simple read-then-insert sequence may let both see no receipt. Your storage design needs an authoritative uniqueness or locking strategy for owner plus operation key. Investigate your database engine's behavior and write a controlled concurrent test. Do not assume that a dictionary in one server process coordinates multiple processes.

Decide how a second request observes an in-flight first request. It might wait, receive a retryable pending response, or collide with a unique constraint and then read the completed receipt after an appropriate boundary. The policy should avoid replaying an incomplete result. Document timeouts and distinguish an operation still pending from one known to have failed before acceptance.

## Exercise BX-27A: write a replay matrix

Include first request success, same-key same-body replay, same-key changed-body conflict, different-owner same-key isolation, first request rejected before mutation, first request committed with lost response, and two simultaneous identical requests. For each row, specify mutation count, receipt count, returned resource version, and client-visible state.

The mutation count is a crucial oracle. Two responses that look successful do not prove only one business effect occurred. Read the accepted resource and any audit rows after the requests settle. If your operation creates contacts, count the created identities. If it updates a contact, inspect the accepted version and history according to your chosen semantics.

## Exercise BX-27B: design expiry behavior

Receipts cannot necessarily be retained forever. Choose a retention policy and explain what happens when a client retries after the receipt has expired. It may no longer be possible to promise the original replay guarantee. The user-facing workflow should not claim certainty beyond the retention window. Consider whether the client can reconcile using the resource identity and accepted version before issuing a new intent.

Also decide how cleanup interacts with active operations. A receipt should not disappear while a still-valid retry is being resolved under your stated contract. Use fixed times in tests and include the exact expiry boundary. As with review scheduling, less-than versus less-than-or-equal can change behavior at the boundary.

## Exercise BX-27C: preserve the request body

On the client, capture the body and expected version associated with the operation key. If the user edits the form while the first request is pending, those new edits should not silently alter a retry of the old operation. Draw separate boxes for current form, captured operation, accepted response, and newer unsaved changes.

Write a test where the first response is lost, the user changes the form, and the client retries the original operation. The server should receive the original fingerprint for that retry. After reconciliation, the newer form changes remain a separate draft. This is a subtle but valuable ownership exercise that connects asynchronous UI state with server-side deduplication.

## Review discussion

Retry safety requires more than sending a random header. It requires a stable intent, scoped identity, fingerprint policy, atomic receipt, concurrency behavior, and an honest expiry contract. A strong capstone demonstrates the lost-response case and proves one accepted business effect. It also explains where certainty ends, so the interface can guide reconciliation without inventing success or failure.
