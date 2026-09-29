# Concepts demonstrated by this application

A draft is a proposed value. An accepted value is one the persistence boundary has acknowledged. IPSKILL deliberately has two draft layers: the practice form and the whole workspace draft. Applying a form checks domain rules and updates the workspace draft. Saving the workspace checks concurrency and persists it. This is useful for learning because both transitions are visible. In another product, you might combine them into a single save interaction, but you still need to distinguish them in code.

Consider a project with version 4 inside workspace revision 12. Changing its evidence produces project version 5 in a draft still based on revision 12. Saving accepts workspace revision 13. A second tab that still expects revision 12 is stale even if it edited a different project. Whole-document concurrency is simple and conservative. Row-level transactions could permit more independent edits, but would require a different storage design and different conflict tests.

An identity answers “which workspace?” A revision answers “which accepted state of that workspace?” Importing a replacement creates a new identity. Otherwise, an older tab could coincidentally hold a matching numeric revision from an unrelated imported document. Matching only the number would let old content overwrite the replacement. Read the identity and revision comparison together in [storage.ts](../src/storage.ts).

Runtime validation answers a different question from TypeScript. TypeScript can tell a function that its parameter is declared as `Workspace`; it cannot guarantee that a downloaded JSON file obeys that declaration. `parseImport` starts with unknown data, checks its bounded size and schema, and validates mission identities, rewards, dates, histories and practice projects. A cast such as `JSON.parse(raw) as Workspace` would skip that boundary while making later code look deceptively safe.

Validation also checks relationships. A completed mission must have the catalog's reward, an attempt and a recall record. A project title must be unique within the workspace after trimming and case normalization. These rules involve more than one property. Testing each field independently would miss a forged reward attached to an otherwise valid completion. Historical known completions remain reviewable even if the older interface allowed them out of order; new completions obey the current prerequisite rules.

Transactions make related changes succeed or fail together. A reviewed import must preserve the previous accepted aggregate and replace the active workspace as one operation. Those writes share a transaction across `workspace` and `backups`. A successful individual `put` request is not the same as successful transaction completion. The promise resolves only at the transaction's completion event. This follows the browser's [transaction completion contract](https://developer.mozilla.org/en-US/docs/Web/API/IDBTransaction/complete_event).

An aborted transaction can roll back changes already issued within it. That is why a useful storage test aborts after a write request, then reads the old accepted value again. Merely throwing an exception before any write is scheduled tests a much weaker property. See the browser's [abort behavior](https://developer.mozilla.org/en-US/docs/Web/API/IDBTransaction/abort) and compare it with the project's failure tests. Neither API implies that browser storage can never be evicted or that your disk can survive arbitrary power loss.

BroadcastChannel provides an advisory that another context changed something. It does not provide the concurrency guarantee. The save transaction must still compare identities and revisions even if no notification arrives. One persistent channel object is used for both listening and sending; the sending object does not receive its own message. Creating a second sender object in the same tab can produce a misleading “another tab” notice. The [BroadcastChannel reference](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel) describes that communication model.

Finally, self-review is a learning record, not an automated grader. The application can enforce a minimum evidence length, award a configured reward once and schedule recall. It cannot determine whether your SQL query is correct by inspecting the length of your notes. The useful evidence is reproducible: a command, an expected result, an observed result, a rejected case and an explanation. Keep that distinction when adding badges, dashboards or progress metrics.

## The three states a project passes through

```
  form draft ──(apply: putProject in progression.ts)──▶ workspace draft ──(save: commit in storage.ts)──▶ accepted IndexedDB state
  (PracticeView local state)                            (useWorkspace draft, "unsaved", still revision N)   (revision N+1, what a reload shows)
        ▲ validateProject rejects here: the form keeps its values, the draft is untouched
```

Three functions, three transitions: `putProject` validates and produces the next project list inside the workspace draft; `useWorkspace`'s apply marks the draft unsaved; `commit` in `storage.ts` compares the revision and writes. Trace A in `07-TRACE-LAB.md` asks you to name each of them; this is the chain.

