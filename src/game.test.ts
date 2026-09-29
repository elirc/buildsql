// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  canComplete,
  completeMission,
  deleteProject,
  dueReviewIds,
  freshSave,
  levelFor,
  progressToNextLevel,
  putProject,
  xpFor,
} from "./game";
import {
  byId,
  catalog,
  parseImport,
  validateSave,
  validateWorkspace,
} from "./contracts";
import { importWorkspace, newWorkspace } from "./storage";
const first = catalog.find((m) => m.track === "sql" && m.kind === "core")!;
const evidence =
  "I ran SELECT 1 AS answer and compared the returned column and row with the expected result.";
const prepared = () => ({ ...freshSave(), work: { [first.id]: evidence } });
const now = new Date("2026-03-07T23:59:00.000Z");
const project = () => ({
  id: crypto.randomUUID(),
  title: "Contact book",
  goal: "Create, edit, list and delete contacts with rejected invalid email addresses.",
  evidence: "",
  status: "planned" as const,
});
describe("validated progression and applied CRUD projects", () => {
  it("keeps the original level curve and exact reward", () => {
    expect(levelFor(0)).toBe(1);
    expect(levelFor(350)).toBe(2);
    expect(progressToNextLevel(350).percent).toBe(0);
    expect(xpFor(completeMission(prepared(), first.id, now))).toBe(first.xp);
  });
  it("awards once, retains original completion, and does not advance early recall", () => {
    const a = completeMission(prepared(), first.id, now),
      b = completeMission(a, first.id, now);
    expect(b.earnedXp).toEqual(a.earnedXp);
    expect(b.completed).toEqual(a.completed);
    expect(b.reviews).toEqual(a.reviews);
    expect(b.attempts[first.id]).toBe(2);
  });
  it("schedules exact elapsed UTC days across daylight-saving changes", () => {
    const a = completeMission(prepared(), first.id, now);
    expect(a.reviews[first.id].due).toBe("2026-03-10T23:59:00.000Z");
    expect(dueReviewIds(a, new Date("2026-03-10T23:58:59Z"))).toEqual([]);
    expect(dueReviewIds(a, new Date(a.reviews[first.id].due))).toEqual([
      first.id,
    ]);
  });
  it("advances due successful recall by the configured interval", () => {
    const a = completeMission(prepared(), first.id, now),
      b = completeMission(a, first.id, new Date(a.reviews[first.id].due));
    expect(b.reviews[first.id]).toEqual({
      stage: 1,
      due: "2026-03-17T23:59:00.000Z",
    });
  });
  it("failed recall preserves earned completion and schedules tomorrow", () => {
    const a = completeMission(prepared(), first.id, now),
      b = completeMission(
        a,
        first.id,
        new Date("2026-03-08T00:00:00Z"),
        "retry",
      );
    expect(b.reviews[first.id]).toEqual({
      stage: 0,
      due: "2026-03-09T00:00:00.000Z",
    });
    expect(b.earnedXp).toEqual(a.earnedXp);
  });
  it("a failed first attempt does not award XP or create a review", () => {
    const a = completeMission(prepared(), first.id, now, "retry");
    expect(a.completed).toEqual({});
    expect(a.reviews).toEqual({});
    expect(a.attempts[first.id]).toBe(1);
  });
  it("advances streaks only at UTC day changes", () => {
    const a = completeMission(prepared(), first.id, now),
      b = completeMission(a, first.id, new Date("2026-03-08T00:00:00Z"));
    expect(b.streak).toBe(2);
    expect(
      completeMission(b, first.id, new Date("2026-03-10T00:00:00Z")).streak,
    ).toBe(1);
  });
  it("rejects backwards activity days and invalid clocks", () => {
    const a = completeMission(prepared(), first.id, now);
    expect(() =>
      completeMission(a, first.id, new Date("2026-03-06T00:00:00Z")),
    ).toThrow(/Clock/);
    expect(() =>
      completeMission(prepared(), first.id, new Date("bad")),
    ).toThrow(/time/);
  });
  it("rejects unknown mission IDs without changing the input", () => {
    const a = prepared(),
      before = JSON.stringify(a);
    expect(() => completeMission(a, "sql/unknown/ex1", now)).toThrow();
    expect(JSON.stringify(a)).toBe(before);
  });
  it("enforces earlier core prerequisites even when a mission is opened from the archive", () => {
    const later = catalog.find(
      (m) => m.track === "sql" && m.lesson !== first.lesson,
    )!;
    expect(canComplete(prepared(), later.id)).toBe(false);
    expect(() =>
      completeMission(
        { ...prepared(), work: { [later.id]: evidence } },
        later.id,
        now,
      ),
    ).toThrow(/prerequisite/);
  });
  it("requires written evidence before recording self-review", () => {
    expect(() => completeMission(freshSave(), first.id, now)).toThrow(
      /evidence/,
    );
    expect(() =>
      completeMission(
        { ...freshSave(), work: { [first.id]: "too short" } },
        first.id,
        now,
      ),
    ).toThrow();
  });
  it("allows known historical out-of-order completions to remain reviewable", () => {
    const m = catalog.find((m) => m.kind === "challenge")!,
      a = freshSave();
    a.completed[m.id] = now.toISOString();
    a.earnedXp[m.id] = m.xp;
    a.attempts[m.id] = 1;
    a.reviews[m.id] = { stage: 0, due: now.toISOString() };
    a.work[m.id] = evidence;
    expect(canComplete(validateSave(a), m.id)).toBe(true);
  });
  it("validates null, unknown, missing and wrong-version save shapes", () => {
    for (const value of [
      null,
      {},
      { ...freshSave(), version: 9 },
      { ...freshSave(), extra: 1 },
      { ...freshSave(), playerName: 42 },
    ])
      expect(() => validateSave(value)).toThrow();
  });
  it("rejects forged rewards and disconnected history", () => {
    const a = completeMission(prepared(), first.id, now);
    expect(() =>
      validateSave({ ...a, earnedXp: { [first.id]: 999999 } }),
    ).toThrow();
    expect(() => validateSave({ ...a, reviews: {} })).toThrow();
    expect(() => validateSave({ ...a, attempts: {} })).toThrow();
  });
  it("rejects impossible dates, unknown tracks and prototype-like mission keys", () => {
    expect(() =>
      validateSave({ ...freshSave(), selectedTrack: "../secret" }),
    ).toThrow();
    expect(() =>
      validateSave({ ...freshSave(), lastActive: "2026-02-30", streak: 1 }),
    ).toThrow();
    expect(() =>
      validateSave({ ...freshSave(), work: JSON.parse('{"__proto__":"bad"}') }),
    ).toThrow();
  });
  it("rejects oversized work and invalid review stages", () => {
    expect(() =>
      validateSave({ ...prepared(), work: { [first.id]: "x".repeat(100001) } }),
    ).toThrow();
    const a = completeMission(prepared(), first.id, now);
    a.reviews[first.id].stage = 10;
    expect(() => validateSave(a)).toThrow();
  });
  it("imports a legacy save without mutating or normalizing its source text", () => {
    const raw = JSON.stringify(prepared(), null, 4);
    const imported = importWorkspace(raw);
    expect(imported.save.work[first.id]).toBe(evidence);
    expect(JSON.stringify(parseImport(raw))).toBe(JSON.stringify(prepared()));
    expect(raw).toContain("\n    ");
  });
  it("refuses malformed and oversized imports instead of returning empty progress", () => {
    for (const raw of ["{broken", "null", "x".repeat(8 * 1024 * 1024 + 1)])
      expect(() => parseImport(raw)).toThrow();
  });
  it("creates a versioned practice project without changing the accepted input", () => {
    const w = newWorkspace(),
      input = project(),
      next = putProject(w, input, undefined, now);
    expect(w.projects).toEqual([]);
    expect(next.projects[0]).toMatchObject({
      title: "Contact book",
      version: 1,
      created: now.toISOString(),
    });
  });
  it("edits the expected project version and preserves creation time", () => {
    const input = project(),
      w = putProject(newWorkspace(), input, undefined, now),
      next = putProject(
        w,
        { ...input, title: "Better contact book" },
        1,
        new Date("2026-03-08T00:00:00Z"),
      );
    expect(next.projects[0].version).toBe(2);
    expect(next.projects[0].created).toBe(now.toISOString());
  });
  it("rejects stale edits and deletes without removing accepted evidence", () => {
    const input = project(),
      w = putProject(newWorkspace(), input, undefined, now);
    expect(() => putProject(w, input, 0, now)).toThrow(/version/);
    expect(() => deleteProject(w, input.id, 2)).toThrow(/version/);
    expect(w.projects).toHaveLength(1);
  });
  it("requires meaningful goal and status-specific evidence", () => {
    const input = project();
    expect(() =>
      putProject(newWorkspace(), { ...input, goal: "short" }, undefined, now),
    ).toThrow();
    expect(() =>
      putProject(
        newWorkspace(),
        { ...input, status: "review" },
        undefined,
        now,
      ),
    ).toThrow();
    expect(() =>
      putProject(
        newWorkspace(),
        { ...input, status: "complete", evidence: "x".repeat(79) },
        undefined,
        now,
      ),
    ).toThrow();
    expect(
      putProject(
        newWorkspace(),
        { ...input, status: "complete", evidence },
        undefined,
        now,
      ).projects[0].status,
    ).toBe("complete");
  });
  it("rejects duplicate project titles ignoring case and surrounding spaces", () => {
    const w = putProject(newWorkspace(), project(), undefined, now);
    expect(() =>
      putProject(
        w,
        { ...project(), title: "  CONTACT BOOK  " },
        undefined,
        now,
      ),
    ).toThrow(/Duplicate/);
  });
  it("deletes only the confirmed project and preserves other projects", () => {
    let w = putProject(newWorkspace(), project(), undefined, now);
    const id = w.projects[0].id;
    w = putProject(w, { ...project(), title: "Issue tracker" }, undefined, now);
    const next = deleteProject(w, id, 1);
    expect(next.projects.map((p) => p.title)).toEqual(["Issue tracker"]);
    expect(w.projects).toHaveLength(2);
  });
  it("rejects unknown workspace fields and invalid identities", () => {
    const w = newWorkspace();
    expect(() => validateWorkspace({ ...w, extra: true })).toThrow();
    expect(() => validateWorkspace({ ...w, id: "old-id" })).toThrow();
    expect(() => validateWorkspace({ ...w, revision: -1 })).toThrow();
  });
  it("bounds project count without pruning earlier records", () => {
    const base = project(),
      w = newWorkspace();
    w.projects = Array.from({ length: 100 }, (_, i) => ({
      ...base,
      id: crypto.randomUUID(),
      title: `Project ${i}`,
      version: 1,
      created: now.toISOString(),
      updated: now.toISOString(),
    }));
    expect(() =>
      putProject(w, { ...project(), title: "One too many" }, undefined, now),
    ).toThrow(/100/);
    expect(w.projects).toHaveLength(100);
  });
  it("does not share mutable maps across fresh saves", () => {
    const a = freshSave(),
      b = freshSave();
    a.work[first.id] = evidence;
    expect(b.work).toEqual({});
  });
  it("keeps the catalog unique and reward values explicit", () => {
    expect(catalog).toHaveLength(2155);
    expect(byId.size).toBe(catalog.length);
    expect(catalog.every((m) => [100, 140, 250].includes(m.xp))).toBe(true);
  });
});
