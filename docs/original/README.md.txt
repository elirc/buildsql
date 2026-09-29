# IPSKILL

An active, gamified software-learning journey built with React and TypeScript.
The original six-track dojo has been migrated into a single browser experience:
310 sectors, 2,155 missions, progressive hints, preserved reference answers,
and the complete lesson archive.

## Run it

```bash
npm ci
npm run check
npm start
```

Open `http://127.0.0.1:5173`. Node.js 22 or newer is required. The same
commands work in macOS Terminal, Windows PowerShell, and Linux shells.

For everyday development after the first setup:

```bash
npm run dev
```

## How the journey works

- Choose one of six worlds: SQL, TypeScript, Node, React, C#, or ASP.NET Core.
- Clear core missions in order to unlock the next mission and sector.
- Finish every core mission in a sector to unlock its challenge and review missions.
- Work in the autosaved mission workspace before revealing hints or references.
- Earn XP, gain levels, maintain a daily streak, and revisit due material through
  the ten-stage spaced-repetition queue.
- Use the Knowledge Vault when you need the important explanation or the complete
  preserved source lesson, including the 100-prompt retrieval banks.

## Saves

Progress, drafts, XP, streaks, and review dates are automatically stored in the
browser. The Save Data screen can export a portable JSON backup and import it on
another browser.

## Content architecture

Curriculum data lives in lazy-loaded track packs under `public/content/`. The app
loads only the selected world, keeping all migrated material available without
placing the entire archive in the JavaScript bundle.

## Commands

```bash
npm run dev       # local development
npm start         # local server at 127.0.0.1
npm run validate  # verify every curriculum pack and mission
npm run check     # validation, interaction tests, and production build
npm test          # progression and save-system tests
npm run build     # typecheck and production build
npm run preview   # serve the production build
```
