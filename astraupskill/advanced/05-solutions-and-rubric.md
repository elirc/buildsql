# Review the explanation as well as the result

Use this guide after predicting or implementing. Different code structures can satisfy the same contract. Evaluate observable behavior and the boundary that protects it, rather than matching the author's exact variable names.

## Expected reasoning

For BSQL-L1, Apply changes the draft. Reloading without a workspace save reloads accepted storage. That result does not establish a failed IndexedDB write because no write was requested. The form may close successfully while the workspace remains dirty.

For BSQL-L2, B expects an earlier identity/revision pair. A's completed commit changes the accepted revision, so B's transaction refuses the aggregate. A replacement also changes identity; equal revision numbers from different identities are not interchangeable. Exporting B's draft preserves intent without granting it permission to overwrite new accepted data.

For BSQL-L3 and BSQL-01, use the filtered, stably sorted collection as the basis for page count. With 13 records and size 10, page two contains three. With two filtered records, the valid displayed page is one. A deletion or size change must recompute the bounds before slicing. Form state is independent; a list preference does not justify discarding an edit.

For BSQL-L4 and BSQL-02, validation should reject structurally invalid values before acceptance. A successful migration preserves actual legacy text and marks absent metadata as absent. It does not convert an unverified claim into a verified test record. Keep the original export available so a reviewer can compare it with the candidate.

For BSQL-03, a frontend precheck can improve feedback but cannot enforce uniqueness under competing requests. The persistence boundary must enforce the selected normalized identity. A version comparison separated from its write permits a race; test two clients based on the same version and require a defined winner/rejection result.

For BSQL-04, request identity and data version serve different purposes. The first asks whether this operation already happened; the second asks whether the edit is based on a still-current record. An uncertain network result is not evidence of rollback. A retained result must be bound to the operation's meaning so a changed request cannot reuse an unrelated response.

## Review scale

| Dimension | 0 — missing | 1 — partial | 2 — demonstrated |
|---|---|---|---|
| Contract | Desired UI only | Happy path written | Valid, invalid and retry behavior specified |
| State | Counters mixed up | Correct outcome, weak trace | Form, draft, accepted data and versions traced |
| Evidence | “It works” | One repeatable case | Passing and rejecting cases with observed state |
| Recovery | Data loss ignored | Error displayed | Useful draft retained and recovery demonstrated |
| Explanation | Copied solution | Names the code | Explains the invariant and its limits |

Aim for 8/10 before asking for a feature review, with no zero in recovery. This is a course threshold, not a certification. If a test was skipped or setup failed, record that result rather than awarding its points.

## Give actionable feedback

Replace “improve concurrency” with “both writers can pass the version read before either update; move the comparison into the protected update and show a two-writer case.” Replace “more tests” with the exact missed input and preserved state. Good review comments help the learner choose the next experiment.

[Capstone](06-capstone.md) · [Course index](README.md)
