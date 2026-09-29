# 08. Backend ticket: the contacts API behind practice ticket 3

[Course index](README.md)

Practice ticket 3 asks for a real backend. This chapter scaffolds it so the course's ideas (expected versions, rejected-write UX, shared validation) reach Node. Everything here runs with Node 22 and no packages except Express; the schema is SQLite via `node:sqlite`.

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
import { validateContact } from '../src/contracts.js';        // shared validation: the same rules the React form uses

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
test('a stale If-Match is refused and the row is unchanged', async () => {
  const created = await request(app).post('/contacts').send({ name: 'Ada', email: 'ada@example.com', status: 'planned' }).expect(201);
  await request(app).put(`/contacts/${created.body.id}`).set('If-Match', '"1"').send({ ...created.body, name: 'Ada L.' }).expect(200);
  const stale = await request(app).put(`/contacts/${created.body.id}`).set('If-Match', '"1"').send({ ...created.body, name: 'Ada X' });
  assert.equal(stale.status, 409);
  const row = await request(app).get(`/contacts/${created.body.id}`).expect(200);
  assert.equal(row.body.name, 'Ada L.'); assert.equal(row.body.version, 2);
});
```

Add the other four (400 from the shared validator, 409 on a duplicate email differing only by case, 428 without `If-Match`, 404 after delete) and connect `PracticeView` to it: the form's rejected-write UX (keep the draft, show the message) is unchanged, only the acceptance moves to the server.
