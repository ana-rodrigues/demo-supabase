# Demo Boilerplate

A starter for interactive UI demos and prototypes.

## Stack

- **React 19** with **TypeScript**
- **Vite 8** for dev server and builds
- **React Compiler** via `babel-plugin-react-compiler` and `@rolldown/plugin-babel`
- **ESLint 10** with `typescript-eslint`, `react-hooks` and `react-refresh` rules
- **Agentation** for annotating the UI while reviewing demos

## Getting started

This project uses **npm** (see `package-lock.json`), not yarn.

```bash
npm install
npm run dev
```

The dev server runs at http://localhost:5173.

## Scripts

| Command           | What it does                       |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Start the Vite dev server with HMR |
| `npm run build`   | Type-check (`tsc -b`) and build    |
| `npm run preview` | Serve the production build locally |
| `npm run lint`    | Run ESLint                         |

## Requirements

Node.js 20.19+ or 22.12+ (required by Vite 8).
