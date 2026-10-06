# 08. Backend ticket: the contacts API behind practice Exercise 6

[Course index](README.md)

Practice Exercise 6 asks for a real backend. This chapter scaffolds it so the course's ideas (expected versions, rejected-write UX, validation at the boundary) reach Node. **None of these files exist in this repo** — create them in a separate practice project. You need Node 22.16+ (where `node:sqlite` loads without a flag but prints an `ExperimentalWarning`), `express`, and, for the tests, `supertest`.

What was actually checked for this chapter: the schema and the case-insensitive unique index were executed with `node:sqlite` on Node 22.16 (a second insert differing only in case fails with `UNIQUE constraint failed: index ...`, which is what the router's `includes('UNIQUE')` relies on), and an `UPDATE ... WHERE id = ? AND version = ?` that matches nothing returns `changes: 0`. The Express router and the test were not run.

## Schema (`api/schema.sql`)

```sql
CREATE TABLE IF NOT EXISTS contacts (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL CHECK (length(name) BETWEEN 1 AND 120),
  email      TEXT NOT NULL,
  goal       TEXT NOT NULL DEFAULT '',
  status     TEXT NOT NULL CHECK (status IN ('planned', 'active', 'complete')),
  version    INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS contacts_email_ci ON contacts (lower(email));
```

## Router (`api/contacts.js`)

```js
import { Router } from 'express';
import { randomUUID } from 'node:crypto';

// IPSKILL's src/contracts.ts has no contact validator; write your own, in the same style as validateProject.
export function validateContact(body) {
  const errors = [];
  if (typeof body?.name !== 'string' || body.name.trim().length < 1 || body.name.length > 120) errors.push('name must be 1-120 characters');
  if (typeof body?.email !== 'string' || !/^[^\s@]+@[^\s@]+$/.test(body.email)) errors.push('email must look like an address');
  if (!['planned', 'active', 'complete'].includes(body?.status)) errors.push('status must be planned, active or complete');
  return errors;
}

export function contactsRouter(db) {
  const r = Router();
  const etag = (v) => `"${v}"`;
  const expected = (req) => { const m = /^"(\d+)"$/.exec(req.get('if-match') ?? ''); return m ? Number(m[1]) : null; };

  r.get('/', (req, res) => {
    const page = Math.max(1, Number(req.query.page) || 1), size = 20;
    const q = String(req.query.q ?? '').trim().toLowerCase();
    const where = q ? `WHERE lower(name) LIKE ? OR lower(email) LIKE ?` : '';
    const args = q ? [`%${q}%`, `%${q}%`] : [];
    const total = db.prepare(`SELECT count(*) AS n FROM contacts ${where}`).get(...args).n;
    const items = db.prepare(`SELECT * FROM contacts ${where} ORDER BY name, id LIMIT ? OFFSET ?`).all(...args, size, (page - 1) * size);
    res.json({ items, page, size, total });
  });

  r.post('/', (req, res) => {
    const errors = validateContact(req.body); if (errors.length) return res.status(400).json({ errors });
    const row = { id: randomUUID(), ...req.body, version: 1, updated_at: new Date().toISOString() };
    try { db.prepare('INSERT INTO contacts (id, name, email, goal, status, version, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(row.id, row.name, row.email, row.goal ?? '', row.status, 1, row.updated_at); }
    catch (e) { if (String(e.message).includes('UNIQUE')) return res.status(409).json({ error: 'A contact with this email already exists.' }); throw e; }
    res.status(201).set('ETag', etag(1)).json(row);
  });

  r.get('/:id', (req, res) => {
    const row = db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id);
    return row ? res.set('ETag', etag(row.version)).json(row) : res.status(404).end();
  });

  r.put('/:id', (req, res) => {
    const v = expected(req); if (v === null) return res.status(428).json({ error: 'Send If-Match with the version you loaded.' });
    const errors = validateContact(req.body); if (errors.length) return res.status(400).json({ errors });
    const result = db.prepare('UPDATE contacts SET name = ?, email = ?, goal = ?, status = ?, version = version + 1, updated_at = ? WHERE id = ? AND version = ?')
      .run(req.body.name, req.body.email, req.body.goal ?? '', req.body.status, new Date().toISOString(), req.params.id, v);
    if (result.changes === 0) return db.prepare('SELECT 1 FROM contacts WHERE id = ?').get(req.params.id) ? res.status(409).json({ error: 'Changed since you loaded it. Reload and reapply your edit.' }) : res.status(404).end();
    res.set('ETag', etag(v + 1)).json({ ...req.body, id: req.params.id, version: v + 1 });
  });

  r.delete('/:id', (req, res) => { res.status(db.prepare('DELETE FROM contacts WHERE id = ?').run(req.params.id).changes ? 204 : 404).end(); });
  return r;
}
```

## Reference integration test for the 409 (`api/contacts.test.js`, node:test + supertest)

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import request from 'supertest';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { contactsRouter } from './contacts.js';

const db = new DatabaseSync(':memory:');
db.exec(readFileSync(new URL('./schema.sql', import.meta.url), 'utf8'));
const app = express().use(express.json()).use('/contacts', contactsRouter(db));

test('a stale If-Match is refused and the row is unchanged', async () => {
  const created = await request(app).post('/contacts').send({ name: 'Ada', email: 'ada@example.com', status: 'planned' }).expect(201);
  await request(app).put(`/contacts/${created.body.id}`).set('If-Match', '"1"').send({ ...created.body, name: 'Ada L.' }).expect(200);
  const stale = await request(app).put(`/contacts/${created.body.id}`).set('If-Match', '"1"').send({ ...created.body, name: 'Ada X' });
  assert.equal(stale.status, 409);
  const row = await request(app).get(`/contacts/${created.body.id}`).expect(200);
  assert.equal(row.body.name, 'Ada L.'); assert.equal(row.body.version, 2);
});
```

Add the other four (400 from `validateContact`, 409 on a duplicate email differing only by case, 428 without `If-Match`, 404 after delete) and connect `PracticeView` to it: the form's rejected-write UX (keep the draft, show the message) is unchanged, only the acceptance moves to the server.
