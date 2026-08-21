# Interview prep, across every track

Every track in this dojo ends the same way: an **interview part** built for
mid-level full-stack SWE interviews. It is not a separate product — it is the
last part of each course, graded by the same gates, fed into the same
spaced-review scheduler, and honest in the same way (nothing multiple-choice,
nothing autocompleted).

## Where it lives

| track | lessons |
|---|---|
| SQL | `lessons/53_interview_concepts`, `lessons/54_interview_drills` (Part 9) |
| TypeScript | `tracks/typescript/lessons/i1_interview_concepts`, `i2_interview_drills`, `i3_interview_rapidfire` |
| Node | `tracks/node/lessons/i1_…`, `i2_…`, `i3_…` |
| React | `tracks/react/lessons/i1_…`, `i2_…`, `i3_…` |
| C# | `tracks/csharp/lessons/i1_…`, `i2_…`, `i3_…` |
| ASP.NET Core | `tracks/dotnet/lessons/i1_…`, `i2_…`, `i3_…` |

## The three pieces

**1. The question bank (`i1_interview_concepts`).** Each track's bank lives in
that lesson's `reading.md`: 50+ questions with model answers, grouped by
topic, each tagged by how often it actually comes up:

- ⭐⭐⭐ — asked in most interviews for this stack. Know these cold.
- ⭐⭐ — common; expect at least a few.
- ⭐ — differentiators; the questions that separate "pass" from "strong hire".

(The C# track writes these as `[*]`–`[***]` — same scale.)

Answers are written the way a strong candidate would say them out loud — a few
sentences, one concrete example, and the classic follow-up named so it never
surprises you. Every question cross-references the lesson that teaches it:
weak on an answer means redo that lesson, not reread the answer.

How to self-test: open the reading (`dojo read <track> i1_interview_concepts`),
cover each answer, say yours out loud, then compare. Saying it out loud is the
exercise — recognizing a good answer is easy, producing one is the skill.

**2. The drills (`i2_interview_drills`).** Graded exercises written the way an
interviewer would actually phrase them, with a suggested time-box. Treat the
time-box as real: set a timer, no hints on the first attempt. These replicate
the classic hands-on screens for each stack (top-N-per-group in SQL, the
stale-closure counter in React, implement-a-typed-utility in TypeScript,
event-loop output prediction in Node, fix-the-async-bug in C#, the captive
dependency in ASP.NET Core). Each track's challenge exercise is a realistic
45-minute composite task.

**3. Rapid-fire + spaced repetition (`i3_interview_rapidfire`).** The ⭐⭐⭐
concepts appear *again* as fresh exercises, and every interview lesson ships a
review variant wired into the dojo's spaced-review ladder (3 → 7 → 21 → 60
days). This is deliberate: the highest-frequency interview material is exactly
the material worth over-learning, and the ladder does the repetition for you.
Run `dojo review` when it tells you something is due — that is the whole
system.

## A schedule that works

- **Learning phase:** finish a track's numbered lessons before its interview
  part. The drills assume the course.
- **Maintenance phase:** `dojo review` daily (it is usually empty; when it
  isn't, it is short). This keeps every track's ⭐⭐⭐ set warm indefinitely.
- **Two weeks before interviewing:** redo `i2_interview_drills` for your
  target stack under real time-boxes, and read the full `i1` bank for every
  track the role touches. `dojo status` shows where you are weakest — the
  lessons with the most attempts and hints are the ones to redo.
