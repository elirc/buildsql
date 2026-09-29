# Trace accepted, rejected and recovered work

For each scenario, write the starting values, action, validation result, persistence result and visible outcome. Predict the result before running the application. Then compare your prediction with the actual code and browser behavior. Use a disposable profile and exported fixtures, not your only copy of learning progress.

**Trace A: applying a practice form.** Start with workspace identity A at revision 0 and no projects. Enter Contact book with a valid goal and planned status. Applying the form produces one project at version 1 in the workspace draft. The workspace remains based on revision 0 and is marked unsaved. Accepted IndexedDB data still contains no projects. Saving accepts revision 1; reloading should then show the project. Name the exact function responsible for each transition.

**Trace B: insufficient evidence.** Open that project, choose complete, and leave evidence empty. `validateProject` rejects the proposed result. The form remains visible with the entered title, goal and selected status. The workspace draft remains unchanged, so saving another unrelated draft must not accidentally include the rejected completion. Record both the form value and the project value from the workspace when explaining this result.

**Trace C: two competing tabs.** Both tabs load identity A at revision 1. Tab one changes the operative name; tab two changes a project goal. Tab one saves revision 2. Tab two still expects A/1 and must fail when it tries to save. Export its draft. The accepted workspace contains tab one's change; the exported draft contains tab two's proposed change. Loading current data after confirmation discards the in-memory draft, so the export is the manual recovery artifact.

**Trace D: reviewed replacement.** With no dirty changes, preview a valid workspace import. Applying it stores a snapshot of the current accepted aggregate and creates a new identity B. A tab still holding A must not save over B, even if the numeric revisions happen to match. Explain why a new identity is needed in addition to a revision reset. Inspect the recovery snapshots and download the old aggregate before attempting another experiment.

**Trace E: malformed legacy data.** Place malformed JSON under the known legacy save key in a disposable profile, then open the application. It should offer preservation and review, not silently replace the raw text with an empty initial state. Export the exact original text. Compare this behavior with [the original game module](../docs/original/src__game.ts.txt), whose catch-and-default approach could make an unreadable save look like a new user.

**Trace F: successful recall.** Complete the first known mission with written evidence at `2026-03-07T23:59:00.000Z`. The first review is due exactly three elapsed days later. A repeat before that due time adds an attempt but does not advance the interval or grant another reward. A successful due review advances to the next configured interval. A failed recall retains earned completion and schedules another attempt for the following elapsed day.

**Trace G: filtered pagination.** Create thirteen practice projects, then search for a phrase matching two. The page count must come from the filtered set. The project list cannot display a made-up total or remain stranded on an invalid second page. Repeat after deleting the final record on a last page. Explain why the visible page is derived from both the requested page and the current result count.

**Trace H: content loading race.** Select one track, then quickly select another while the first request is slow. The first response may still finish, but it must not replace the active pack for the later selection. Find the effect cleanup that marks a request's result inactive. Then block the current request and check that an actionable error and retry appear instead of an endless loading animation.

Finish the lab by writing one short incident note: observed symptom, evidence, root cause, fix and regression check. Use actual values from one scenario. Do not claim that a screenshot alone proves storage rollback or that a passing structural content validator proves the correctness of every archived reference answer.

## Check your Trace F prediction against the suite

Trace F has an exact expected answer already encoded in `src/game.test.ts:57`. Write your own prediction for the due timestamp first, then read this.

```ts
  it("advances due successful recall by the configured interval", () => {
    const a = completeMission(prepared(), first.id, now),
      b = completeMission(a, first.id, new Date(a.reviews[first.id].due));
    expect(b.reviews[first.id]).toEqual({
      stage: 1,
      due: "2026-03-17T23:59:00.000Z",
    });
  });
```

