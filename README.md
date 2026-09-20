# Daybook — To-Do List Application

A simple, clean To-Do List web app built with HTML, CSS, and vanilla JavaScript.
Tasks are saved in the browser's `localStorage`, so your list survives a page refresh.

## Features

- Add tasks with a priority (Low / Medium / High)
- Mark tasks complete / incomplete
- Delete individual tasks
- Filter by All / Active / Completed
- Clear all completed tasks at once
- Live task counter
- Responsive layout (works on mobile)
- Data persists locally between visits

## Running locally

No build step needed — it's plain HTML/CSS/JS.

1. Clone this repository.
2. Open `index.html` directly in your browser
   (or serve it, e.g. `npx serve .`).

## Tests / CI

`tests/basic.test.js` runs a few sanity checks (required files exist,
`index.html` links the right files, `script.js` is valid JS, `style.css`
has the expected rules). Run locally with:

```bash
npm test
```

This same command runs automatically in GitHub Actions on every push to
`main` — see `.github/workflows/ci.yml`.

## Deployment

This app is deployed with GitHub Pages. Live link: **(add your Pages URL here)**

## Project structure

```
todo-app/
├── index.html
├── style.css
├── script.js
├── package.json
├── tests/
│   └── basic.test.js
└── .github/
    └── workflows/
        └── ci.yml
```
