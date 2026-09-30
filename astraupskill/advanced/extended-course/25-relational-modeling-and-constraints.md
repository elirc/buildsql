# 25. Capstone: relational modeling and constraints

Continue the proposed contact-book project from the previous chapter. This chapter is database design practice; it does not add a database to IPSKILL. Your task is to translate explicit domain rules into a relational model and decide which invariants the database can enforce directly. Choose a database engine for your implementation and consult its installed version's official documentation before relying on engine-specific syntax. The conceptual exercises here do not assume a particular engine.

## Identify functional dependencies

A contact identity determines its owner, display name, optional communication fields, version, and timestamps in the current-record model. An owner may have many contacts. If you add tags, a contact may have many tags and a tag may belong to many contacts. Storing a comma-separated tag list in one field makes membership and uniqueness harder to enforce. A join relation can express the many-to-many association explicitly.

Before adding tables, ask what the product needs to query and preserve. A full event history is a different model from a current record with an updated timestamp. If you only store the current record, do not claim that you can reconstruct every prior edit. If you add an audit table, define which facts it records and whether they must be committed atomically with the contact change.

## Constraints are executable rules

Use a primary key for stable identity and a foreign key for ownership relationships where appropriate. Decide which fields may be absent. A non-null column can enforce presence, but it may not enforce meaningful trimmed text by itself. A uniqueness constraint should reflect an actual product rule, such as a tag name unique within one owner, rather than a convenient assumption about all users.

Consider two owners who both create a tag called Friends. Global uniqueness would reject the second owner even though the product may intend personal vocabularies. The candidate key may be owner identity plus normalized tag name. Write a fixture that demonstrates this distinction. Then consider whether the same owner can create friends and Friends. Your normalization and comparison policy must agree with the database constraint.

## Check-before-write is not a uniqueness guarantee

Suppose two requests both query whether a tag name exists and both see no row. Both can then attempt insertion. Application prechecks may improve error messages, but the final invariant needs an authoritative mechanism that survives concurrency. A database uniqueness constraint is one common way to enforce it. Your application must still translate a rejected insert into a useful response and leave unrelated state unchanged.

This is a reasoning pattern, not a demand to catch every database error as a duplicate. Distinguish the specific constraint violation from connection failure or malformed SQL. Your tests should provoke the intended conflict using valid competing requests. A broad catch that reports every failure as name already exists will mislead users and hide operational problems.

## Exercise BX-25A: design three tables

Draw Contact, Tag, and ContactTag with keys, ownership relationships, nullable fields, and uniqueness rules. Explain how you prevent a contact owned by one person from being associated with another person's private tag. A simple pair of foreign keys may establish that both rows exist without establishing that their owners match. Identify the additional design or transactional validation needed for your chosen schema.

Do not force a particular solution without considering its costs. Composite keys can carry ownership into references, while application checks can be simpler but require careful concurrency and authorization reasoning. The assessment is whether the design enforces the declared invariant, not whether it uses the most elaborate schema.

## Exercise BX-25B: write query result examples

Create a small dataset with two owners, four contacts, three tags, one untagged contact, and one archived contact. Write the expected result of listing active contacts with their tags. Include a contact with two tags so you can see whether a join duplicates contact rows. Decide whether the API returns one row per association or groups tags under each contact.

Now add pagination. Explain why applying a row limit after a one-to-many join can return fewer distinct contacts than intended. Propose a query strategy that first selects the intended contact page and then obtains its related tags, or another strategy with equivalent semantics. Verify the result using the small fixture before measuring large-data performance.

## Exercise BX-25C: plan a schema migration

Add an optional preferred-name field to an existing contact table. Describe the default for old rows, validation for new writes, compatibility with an older client, and rollback consequences. Then consider a harder change: making a previously optional field required. Identify which existing rows violate the new rule and how you would remediate them before enforcing the constraint.

A migration plan should not assume production data already matches the desired schema. Include a preflight query or validation step, a conversion policy, and a post-migration check. For this learning project, use synthetic fixtures representing difficult historical rows. Do not practice destructive migration experiments against valuable personal contact data.

## Review discussion

Relational design turns domain meaning into relationships that can be queried and enforced. The key skills are identifying the real candidate keys, distinguishing absence from invalid content, understanding join cardinality, and placing concurrency-sensitive invariants at an authoritative boundary. Submit the schema, fixture, expected query results, and a migration rehearsal. These artifacts explain far more than a screenshot of tables in a database viewer.
