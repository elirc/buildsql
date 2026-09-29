# Test the boundary that can actually fail

Run the commands in the root setup guide from this project. `npm test` runs the unit and component checks with one worker to keep resource use bounded. `npm run validate` scans every preserved curriculum pack. `npm run build` checks TypeScript and creates the production frontend. Browser verification exercises the built application with a fresh profile. A successful build does not demonstrate that a rejected edit retains its text, and a mocked component test does not demonstrate IndexedDB transaction rollback.

Read [game.test.ts](../src/game.test.ts) first. Its fixtures use real catalog identities instead of inventing a mission name that the application could never load. It checks reward idempotence, UTC recall intervals, first-attempt failure, prerequisites, malformed imports, forged XP, project versions, duplicate titles and bounded collections. When changing a rule, identify the invariant before deciding how many assertions to add.

For example, a stale edit test should keep a copy of the accepted project and then submit an old expected version. Assert rejection and assert that the old accepted value is unchanged. An assertion that merely checks for an error message could pass even if an earlier mutation already damaged the object. The pure domain functions return proposed new values; their tests check that the supplied state remains unchanged.

The component tests in [App.test.tsx](../src/App.test.tsx) focus on the practice form. They verify that insufficient completion evidence preserves the entered title and status, that valid input reaches the workspace draft, and that filtering changes the actual visible result set. The name of the test file is historical; full application initialization and storage are verified through a browser rather than being represented by a fake localStorage success path.

The content tests load the actual six preserved packs. They reconcile mission identities and rewards with the compact catalog and reject unsafe paths, missing missions and altered rewards. This is structural validation, not a manual judgment that every explanation or reference solution is correct. If a lesson contains a conceptual error, write a separate issue with the exact lesson, the claim, a reproducible counterexample and a proposed correction.

A useful browser debugging sequence is:

1. Reproduce the smallest action and record the visible workspace revision.
2. Inspect the form's proposed value before applying it.
3. Inspect the workspace draft before saving it.
4. Check the accepted IndexedDB document after acknowledgement.
5. Reload and compare the visible value with that accepted document.

When a save fails, do not immediately clear storage. Export the draft and accepted raw data. A parsing error, quota failure, missing workspace and stale revision require different responses. Clearing storage erases the evidence that would distinguish them. Use a disposable profile for deliberate corruption and rollback tests.

For a two-tab test, bring the tab you are interacting with to the foreground. Save in A, then save B's older draft. Check both the conflict notice and the retained draft. A BroadcastChannel message is useful context, but the assertion that protects data is that B cannot replace A's accepted revision. Test that even when the advisory is delayed or absent.

For a transaction test, arrange an abort after a `put` has succeeded but before transaction completion. Then read accepted data from a fresh transaction. The old state should remain and the save promise should reject. This distinguishes request success from commit acknowledgement. Keep the failure injection inside test code; do not ship a normal product button that corrupts data.

When investigating slow builds, retain logs and wait for the process exit code. Partial output such as “compiled successfully” may precede type checking or asset generation. Conversely, a terminal display failure after a process exits zero should not be misreported as a failed build. The dated [verification record](VERIFICATION.md) records completed outcomes and limitations separately from the presence of test source files.

## The stale-edit test, as written

The case described above is already in the suite at `src/game.test.ts:214`. Note the third assertion: after both rejections the accepted workspace still holds exactly one project, which is what distinguishes this from a test that only checks the error message.

```ts
  it("rejects stale edits and deletes without removing accepted evidence", () => {
    const input = project(),
      w = putProject(newWorkspace(), input, undefined, now);
    expect(() => putProject(w, input, 0, now)).toThrow(/version/);
    expect(() => deleteProject(w, input.id, 2)).toThrow(/version/);
    expect(w.projects).toHaveLength(1);
  });
```

## Test authoring without publishing

Run `python verification/verify_authoring.py` with a new empty destination configured by `IPSKILL_AUTHORING_OUTPUT`. The runner creates small synthetic six-track workspaces under that destination. It never points the authoring scripts at your published archive. Seven checks exercise successful candidate generation and index/catalog consistency, refusal to overwrite an existing candidate, incomplete mission rejection, duplicate lesson rejection, path traversal rejection, assembly into a new file, and duplicate section rejection. The successful fixture contains one SQL lesson and one core mission; compare its generated catalog identifier with its pack and index. A failure must leave published fixture bytes unchanged. Existing output directories are refused so a second run cannot silently erase evidence. Keep the generated command log when investigating a failure.

These checks exercise the command-line boundary in addition to the application content tests. They do not prove the educational accuracy of an authored solution. Review the prose, run its example in the appropriate external language workspace, validate the complete candidate, and release matching packs, index and catalog together. Never describe candidate generation as publication.
