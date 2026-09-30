# 03 — Validate at the boundary you actually cross

## Types help callers; validation decides acceptance

TypeScript can prevent an internal caller from passing a number where a string is expected, but a JSON file arrives as runtime data. Old exports, hand-edited fixtures and corrupted storage can all contain shapes the compiler never saw. [contracts.ts](../../../src/contracts.ts) therefore accepts unknown values and validates them before treating them as a workspace or save.

This distinction matters during reviews. A cast such as `value as Workspace` tells the compiler how to treat a value; it does not inspect its runtime fields. A validator produces evidence that the actual value meets a contract. Replacing validation with a cast may make an error disappear from the editor while allowing invalid data to reach persistence.

Read the `object` helper. It rejects null, arrays and values whose prototype is not the plain object prototype. When supplied an exact field list, it checks the number of keys and ownership of required fields. A missing field and an unexpected field are both important under an exact-shape contract. The application does not simply ignore every property it does not recognize.

## Validation order affects explanations

Suppose an imported project has an unknown status and a negative version. The validator may reject the version before reaching the status check. The resulting error establishes the first violated boundary encountered; it does not establish that all remaining fields were valid. A test intended to isolate status validation should keep other fields valid. Otherwise it can pass for an unrelated reason.

This is a common source of weak tests. A fixture named “rejects invalid timestamp” may also have an unknown mission ID. If the ID check rejects first, changing timestamp validation would not make the test fail. The test's label is not evidence of what it exercised. Construct one intentional invalid condition per focused case, then add separate multi-error behavior tests if the product needs them.

The same reasoning applies to UI messages. A single reported error is often adequate for a bounded import operation, but a future bulk diagnostic tool may need a list of findings. That is a different contract with different memory and usability tradeoffs. Do not change a fail-fast validator into an error collector without considering how far invalid intermediate values are allowed to travel.

## Text normalization is field-specific

The `text` helper requires a string, checks its raw maximum length, checks a trimmed minimum length and rejects a specified set of control characters. It returns the original string. Meanwhile `putProject` explicitly trims title and goal when building a project. These details mean “the application trims text” is too broad a summary. Name the field and function responsible.

Consider a note with leading spaces used for readable formatting. A generic trim applied everywhere could remove intentional layout. A title containing only spaces should be rejected. A maximum-length rule on the raw string differs from a rule on normalized text. Build examples that make those choices visible rather than assuming all text should share one normalizer.

For a future field, write its normalization contract first. If you reuse `text`, account for its actual behavior. If you introduce a new normalizer, state why the existing rule does not fit. Avoid two helpers with subtly different rules for what users perceive as the same field; inconsistency makes import and form behavior difficult to explain.

## Bounded numbers and canonical timestamps

The `integer` helper uses `Number.isSafeInteger` and bounds. This rejects fractions and values outside JavaScript's safe integer range. A string containing digits is still a string unless a boundary intentionally parses it. Parsing and validation are separate decisions: accepting form text as a number does not imply accepting arbitrary import strings for every numeric field.

The timestamp validator requires the expected UTC format, a finite parse and an exact round trip through `toISOString`. Those checks provide a canonical representation suitable for the application's comparisons. A human-readable date that another system accepts is not automatically valid here. Canonicalization reduces ambiguity, but it does not prove that the originating device clock was correct.

Read `uuid` as a contract for workspace/project identity rather than a general validator for every identifier in the application. Mission IDs follow catalog conventions. Reusing one identity validator for a different namespace can reject valid domain IDs or accept values with the wrong meaning. Similar-looking strings do not necessarily belong to the same identity system.

## Size limits belong to encoded data

The workspace size check encodes serialized JSON through `TextEncoder` and compares byte length with the configured maximum. Character count and UTF-8 byte count differ for many characters. If a UI warns based only on string length, it may be a rough indicator rather than the authoritative persistence boundary. Tests should include non-ASCII data when the contract is expressed in bytes.

Limits are product behavior. An 8 MiB aggregate limit should produce an understandable refusal and preserve previously accepted data. Automatically deleting old notes to squeeze under the limit would be a destructive change to the contract, not a harmless optimization. A better learning exercise is to help the user identify large content and export it for deliberate review.

## Independent boundary tasks

**BX-03A:** Build a table for a proposed integer field with inputs `4`, `4.5`, `"4"`, null, a negative value and a value above its maximum. Separate parsing decisions from bounded-number validation. Explain which boundary owns each conversion.

**BX-03B:** Design two timestamp cases: one structurally invalid and one structurally valid but chronologically inconsistent with earlier activity. Name the different functions or rules that should reject them. Do not collapse representation and chronology into one vague “bad date” test.

**BX-03C:** Create an import fixture with exactly one extra project property and otherwise valid data. Predict whether an exact-shape validator accepts it. Then write a migration proposal explaining how a future supported property becomes recognized without weakening all shape checks.

## Review discussion

Strong answers identify what is known after each successful check and what remains unproven. A valid integer does not establish a meaningful business quantity. A canonical timestamp does not establish a trustworthy clock. A structurally valid workspace still needs its cross-field relationships checked. Validation is most useful when the resulting confidence is precise enough to support the next operation without being inflated into a universal guarantee.
