# Prediction lab

Predict each outcome before reading the answer key. These questions isolate the conditions in their prompts. Real requests may be rejected earlier when those assumptions do not hold.

Use Python 3. Copy `answers.template.json` to a new filename in a location you choose, replace each null with your answer, then pass its absolute path to the checker. Copying is a learner action; the checker only reads files and never changes your answers.

From the project root:

```powershell
python astraupskill/advanced/labs/check-answers.py C:/path/to/my-answers.json
```

Use JSON booleans (`true`/`false`), numbers, arrays or objects exactly as requested. Array order matters. Keys in an object may appear in any order. Exit 0 means every prediction matches; exit 1 means one or more answers need review; exit 2 means malformed/missing input.

## Cases

### BSQL-P1

You Apply a form, but never Save workspace. Does Apply alone persist the new project across reload?

### BSQL-P2

Existing project version is 2. A valid putProject edit expects version 2. What project version is in the returned draft?

### BSQL-P3

Existing accepted workspace W has revision 7. An ordinary valid save expects W/7 and the transaction completes. What revision is accepted?

### BSQL-P4

Both tabs read W/7. A commits W/8. B saves its old draft expecting W/7. Is B accepted?

### BSQL-P5

A reviewed replacement succeeds. Return an object with sameIdentity (whether it keeps the old workspace ID) and revision.

### BSQL-P6

Current page is 2, page size is 10, filtered count becomes 2. What clamped page is displayed?

### BSQL-P7

An IndexedDB put request succeeds, then its transaction aborts. May the UI claim a durable save from that request success alone?

### BSQL-P8

A future evidence migration only has a legacy prose note. May it invent the exact command and execution date as verified facts?

## After checking

For each mismatch, name the source function or stated contract that changes your prediction. The checker reports case IDs without printing the answer, so you can make another independent attempt.

Compare with [the answer key](answer-key.json) only after your attempt. The separate chapter answer guide explains the reasoning. This lab grades a mental model and does not compile, start, test or modify the application.

[Return to the advanced course](../README.md)
