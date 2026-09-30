# 18. Time as an explicit input

Time-related bugs often begin with an unstated choice about what a day means. This application uses fixed elapsed intervals of 86,400,000 milliseconds for review scheduling and UTC calendar dates for its activity streak. Read `completeMission` and `dueReviewIds` in [progression.ts](../../../src/progression.ts). The function accepts a `now` argument, which allows tests to make time an explicit input rather than waiting for the wall clock.

## Elapsed duration and calendar labels

A first successful completion schedules a review three fixed days later. If completion occurs at 23:59 UTC, the due timestamp remains 23:59 UTC after adding the duration. A local daylight-saving change does not alter that elapsed interval. The learner's local clock display may shift, but the stored instant is still defined by the UTC calculation. Explain both facts when reviewing user-facing time labels.

The activity streak uses the UTC date prefix of the timestamp. A transition from 23:59 UTC to 00:00 UTC on the next day can extend the streak after one minute. Two actions many hours apart on the same UTC day do not extend it twice. This is not inherently wrong; it is a specific product policy. A future local-calendar policy would need a chosen time zone and rules for travel or zone changes. Do not describe local calendar behavior as if the current code already implements it.

## Boundary equality matters

`dueReviewIds` includes reviews whose due instant is less than or equal to now. A review is due exactly at its timestamp, not one millisecond later. The successful review branch also compares due time with now using that inclusive boundary. Tests should include just before, exactly at, and just after the due instant. Use fixed dates and inspect the actual stage change rather than merely asserting that the function returns something.

The stage increases until it reaches the last configured interval. At the maximum stage, another due successful recall remains at that stage while scheduling a new due time from the current action time. A learner who reviews late does not necessarily get the next interval measured from the old due date; inspect the expression using `now.getTime()`. This choice avoids silently confusing lateness with the next spacing interval.

## Backward clocks and their limits

The completion function rejects an invalid date and rejects an activity day earlier than the recorded last active day. That protects one kind of time regression. It does not compare every action timestamp against a complete event history. An earlier instant within the same UTC day is a different case from an earlier UTC date. Describe the implemented check exactly and investigate its consequences with a valid fixture.

For a proposed server-backed version, decide whether client time is evidence, authority, or merely display context. A server clock can provide a consistent accepted instant, but offline learning introduces synchronization questions. Those are design choices beyond this local application. Write them as a proposal with examples rather than importing a distributed-time solution into a simple deterministic function without a demonstrated need.

## Exercise BX-18A: create a temporal boundary table

Choose a first completion near UTC midnight and calculate its initial due time. Add rows for an early success, an exactly due success, a retry after completion, a same-day second attempt, a next-day attempt, a skipped-day attempt, an earlier-day attempt, and an invalid date. For every row, identify whether the action is accepted and what changes to attempts, streak, stage, and due time.

Use ISO timestamps with milliseconds in your expected data. Avoid local date constructors whose meaning depends on the machine running the test. Where you intentionally test local display, record the time zone separately from the stored instant. This separation makes your notebook reproducible by a learner in another country.

## Exercise BX-18B: investigate overdue ordering

Construct a valid save containing two reviews with different due times and two with equal due times. Predict the order returned by `dueReviewIds`. The function sorts by due timestamp and uses mission identity as a tie-breaker. Explain why a stable secondary order improves a review queue: equal-time records should not appear to jump around because of incidental object insertion order.

Do not assume arbitrary date strings sort correctly. The save contract requires canonical timestamps, which makes the lexical comparison meaningful for these stored values. This is a connection between validation and downstream algorithm simplicity. If imports accepted mixed offsets and formats, the same sorting expression would need a different justification.

## Exercise BX-18C: compare two scheduling policies

Write a proposal comparing fixed elapsed days with local calendar days. Use a daylight-saving transition, travel across time zones, and a review performed late at night. For each policy, explain what the learner sees and what must be stored to reproduce the schedule. There is no required winner. The assessment is whether your recommendation follows from a clear learning experience and an implementable contract.

## Review discussion

Time becomes manageable when its semantics are explicit. Name the clock, distinguish an instant from a calendar date, test equality boundaries, and pass time into pure logic. Your final evidence should include predictions made before execution and an explanation of at least one case where the local display differs from a naive expectation while the stored UTC behavior remains correct.
