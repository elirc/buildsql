# 11. Recovery is a user workflow

The useful question about a backup is whether a person can recover a particular piece of work from it. A file called backup, a snapshot counter, or a successful download does not answer that question. In this application there are several different things a learner might want to recover: the draft currently visible in a tab, the workspace last accepted by browser storage, a workspace replaced earlier, and a legacy save imported during initialization. Those objects can legitimately disagree. Learning to name them precisely is the first recovery skill.

Read [storage.ts](../../../src/storage.ts) and [useWorkspace.ts](../../../src/useWorkspace.ts). Draw four boxes labeled working draft, accepted workspace, recovery snapshot, and downloaded file. Draw an arrow only when you can point to code that moves information between the two boxes. Label the arrow with its trigger. This produces a small operational map rather than an architectural wish list. In particular, an export of the working draft is not proof that the draft has been committed. An export of accepted raw data does not necessarily contain the edits still visible in the form.

## Follow the replacement transaction

The replacement branch of `commit` participates in a transaction containing both the workspace and backups stores. After checking the expected workspace identity and revision, it counts existing snapshots. At ten snapshots it fails with an instruction to export and review them; it does not silently remove the oldest snapshot. If capacity is available, it adds a backup and writes the replacement. When a current workspace exists, the stored backup text is a serialization of that current workspace. Otherwise it uses the supplied replacement raw text. This distinction matters during migration from legacy data because there may be no accepted workspace to preserve yet.

Consider a user importing a downloaded workspace while the current workspace contains last week's practice. The incoming file is the replacement candidate. The snapshot protects the outgoing current workspace. Calling both files the import backup obscures which one will help recover last week's work. A useful UI or support explanation names the outgoing workspace and the incoming candidate separately. A useful test makes their titles different enough that accidentally snapshotting the incoming candidate would be obvious.

The new accepted workspace receives a new identity and revision zero. Recovery therefore changes more than its visible content. An older tab holding the replaced identity must fail a subsequent save even if its revision also happens to be zero. Recovery tests should inspect that identity behavior. A test that only compares project titles can miss an obsolete tab overwriting the restored workspace.

## Design a rehearsal

Create a disposable browser profile and a workspace with two unmistakable projects. Name one Local notebook and the other Recovery marker. Give the marker a sentence you can recognize later. Export the accepted workspace and record its identity and revision in a worksheet. Make an unsaved edit to the marker. Export the draft separately. The two filenames should describe their roles and timestamps rather than overwrite each other.

Now rehearse a replacement using another valid workspace. Predict which version of the marker should appear in the recovery snapshot: the accepted version or the unsaved edit. The hook rejects replacement while its workspace draft is dirty, so include the actual prerequisite actions in your rehearsal. Do not invent a path through a dirty-state guard. Either save the edit, or preserve the draft and reload accepted data with the user's deliberate discard decision. Your log should explain which path you chose and why.

After replacement, inspect the snapshot and the accepted workspace through supported application controls or a carefully isolated test harness. Recovery success means the expected data is readable and can pass the relevant import contract. It also means the learner can tell which artifact to choose. A JSON file that parses but fails the application schema is useful forensic evidence, but it is not yet a restorable workspace.

## Exercise BX-11A: write a recovery decision table

Create rows for an unsaved text edit, a stale tab conflict, an accidental successful replacement, a malformed accepted record, and an import rejected before replacement. For each row, identify the artifact most likely to contain the desired information, the least destructive next action, and an observation that confirms progress. Keep uncertainty visible. For example, a malformed stored record may require raw export for inspection; the normal validated read cannot be assumed to succeed.

Your table should not recommend refreshing as the first response to every problem. Refreshing may destroy the only in-memory copy of work. Conversely, preserving a draft should not be described as committing it. Distinguish preservation, inspection, validation, and acceptance as separate operations. Each can succeed or fail independently.

## Exercise BX-11B: test the capacity boundary

In an isolated database, construct nine snapshots and perform a valid replacement. Then attempt another replacement. Predict the snapshot count, accepted identity, and accepted content after each attempt. The second attempt should leave the previously accepted workspace intact. A useful assertion reads both stores after the rejected transaction; checking only the rejection message is incomplete.

For a stronger experiment, arrange for a write failure after the backup request has been issued. Explain why observing a request's success callback does not establish that the backup is durably present. The transaction may still abort. Your evidence should therefore come from a later read after the transaction settles. Do not perform fault injection against your normal browser profile or valuable learner data.

## Review discussion

A good recovery design treats the user's decision as part of the protocol. It identifies which copy contains which edits, preserves evidence before risky transitions, and confirms the result from storage after completion. It also describes its limit: browser storage and downloaded files are different failure domains, and neither a local snapshot nor a single download is an organization-wide backup service. This course asks you to prove the application's local behavior. It does not claim that the existing application implements remote disaster recovery.

For your portfolio, submit a recovery rehearsal with before and after identities, the artifact chosen, the exact successful validation, and one rejected operation that left accepted data unchanged. Redact personal text. A short, reproducible recovery account is stronger evidence than a screenshot of a button labeled Export.
