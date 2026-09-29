// Assembles content-src/vol3/build/<slug>.partN.txt bundles into
// content-src/vol3/sql-a.json.
//
// Bundle format:
//   @@@META
//   {"slug": "...", "title": "...", "summary": "..."}
//   @@@FILE briefing.md
//   ...markdown...
//   @@@FILE ex1/prompt.md
//   ...
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const buildDir = resolve(import.meta.dirname)
const outFile = resolve(buildDir, '..', 'sql-a.json')

const ORDER = [
  'ex1', 'ex2', 'ex3', 'ex4', 'ex5', 'ex6', 'ex7', 'ex8', 'challenge', 'review1',
]
const KIND = (id) =>
  id === 'challenge' ? 'challenge' : id === 'review1' ? 'review' : 'core'
const XP = (id) => (id === 'challenge' ? 250 : id === 'review1' ? 140 : 100)
const TITLE = (id) =>
  id === 'challenge' ? 'Challenge' : id === 'review1' ? 'Review 1' : `Ex${id.slice(2)}`

const files = (await readdir(buildDir)).filter((n) => /\.part\d+\.txt$/.test(n))
const bySlug = new Map()
for (const name of files.sort()) {
  const slug = name.replace(/\.part\d+\.txt$/, '')
  if (!bySlug.has(slug)) bySlug.set(slug, [])
  bySlug.get(slug).push(name)
}

const problems = []
const lessons = []

for (const [slug, parts] of [...bySlug.entries()].sort()) {
  const chunks = []
  for (const name of parts.sort((a, b) => {
    const na = Number(a.match(/part(\d+)/)[1])
    const nb = Number(b.match(/part(\d+)/)[1])
    return na - nb
  })) {
    chunks.push(await readFile(resolve(buildDir, name), 'utf8'))
  }
  const text = chunks.join('\n')
  const sections = new Map()
  let meta = null
  let current = null
  let buffer = []
  const flush = () => {
    if (current === '@@@META') meta = JSON.parse(buffer.join('\n'))
    else if (current) sections.set(current, buffer.join('\n').replace(/\s+$/, '') + '\n')
    buffer = []
  }
  for (const line of text.split(/\r?\n/)) {
    if (line === '@@@META') {
      flush()
      current = '@@@META'
    } else if (line.startsWith('@@@FILE ')) {
      flush()
      current = line.slice('@@@FILE '.length).trim()
    } else if (current) {
      buffer.push(line)
    }
  }
  flush()

  if (!meta) {
    problems.push(`${slug}: no @@@META block`)
    continue
  }
  if (meta.slug !== slug) problems.push(`${slug}: meta.slug is ${meta.slug}`)

  const need = (path) => {
    const value = sections.get(path)
    if (!value || !value.trim()) problems.push(`${slug}: missing ${path}`)
    return value ?? ''
  }

  const exercises = []
  for (const id of ORDER) {
    const refs = { 'solution.sql': need(`${id}/solution.sql`) }
    const expected = sections.get(`${id}/expected.sql`)
    if (expected && expected.trim()) refs['expected.sql'] = expected
    exercises.push({
      id,
      title: TITLE(id),
      kind: KIND(id),
      prompt: need(`${id}/prompt.md`),
      hints: need(`${id}/hints.md`),
      importantHints: need(`${id}/importantHints.md`),
      references: refs,
      xp: XP(id),
    })
  }

  const known = new Set([
    'briefing.md', 'explanation.md', 'fullReadme.md', 'fullReading.md',
    ...ORDER.flatMap((id) => [
      `${id}/prompt.md`, `${id}/hints.md`, `${id}/importantHints.md`,
      `${id}/solution.sql`, `${id}/expected.sql`,
    ]),
  ])
  for (const key of sections.keys()) {
    if (!known.has(key)) problems.push(`${slug}: unexpected section ${key}`)
  }

  lessons.push({
    slug,
    title: meta.title,
    summary: meta.summary,
    briefing: need('briefing.md'),
    explanation: need('explanation.md'),
    fullReadme: need('fullReadme.md'),
    fullReading: need('fullReading.md'),
    exercises,
  })
}

if (problems.length) {
  console.error(`assemble failed with ${problems.length} problem(s):`)
  for (const p of problems.slice(0, 40)) console.error(`- ${p}`)
  process.exit(1)
}

await writeFile(outFile, `${JSON.stringify({ track: 'sql', lessons }, null, 2)}\n`)
console.log(
  `wrote ${outFile}: ${lessons.length} lessons, ` +
    `${lessons.reduce((n, l) => n + l.exercises.length, 0)} missions`,
)
for (const l of lessons) {
  const words = (s) => s.trim().split(/\s+/).length
  console.log(
    `  ${l.slug}  brief ${words(l.briefing)}  expl ${words(l.explanation)}  ` +
      `readme ${words(l.fullReadme)}  reading ${words(l.fullReading)}  ` +
      `missions ${l.exercises.length}`,
  )
}
