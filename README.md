# create-vite-html-starter

[![npm version](https://img.shields.io/npm/v/create-vite-html-starter.svg)](https://www.npmjs.com/package/create-vite-html-starter)
[![npm downloads](https://img.shields.io/npm/dm/create-vite-html-starter.svg)](https://www.npmjs.com/package/create-vite-html-starter)
[![license](https://img.shields.io/npm/l/create-vite-html-starter.svg)](https://www.npmjs.com/package/create-vite-html-starter)

Starter CLI for creating production-ready HTML projects on top of Vite.

The goal of this tool is to remove repetitive setup work and let you start UI/layout development immediately.
It generates a clean project structure with multi-page support, HTML includes, SCSS architecture, and optional framework integrations.

## Why this starter

Most teams spend time recreating the same baseline:
- Vite config for HTML pages
- shared `head/header/footer` includes
- styles architecture and reset/base layers
- optional Tailwind or UIkit setup
- basic interactive JS wiring

This starter gives you all of that in one command, with a predictable structure that is easy to scale.

## Key features

- Vite-based development with fast reload
- Multi-page HTML setup out of the box
- Include-driven reusable layout components (`head`, `header`, `footer`)
- SCSS architecture with shared base/layout/vendor layers
- Optional Tailwind, UIkit, and jQuery integrations
- Non-interactive mode for automation/CI usage

## Requirements

- Node.js 18+
- npm, pnpm, or yarn

## Quick Start

No global installation is required.

```bash
npm create vite-html-starter@latest
```

Alternative package managers:

```bash
pnpm create vite-html-starter
```

```bash
yarn create vite-html-starter
```

After project generation:

```bash
cd my-app
npm install
npm run dev
```

## What the CLI asks (interactive flow)

In interactive mode, CLI asks:
- project name
- preset
- include jQuery or not
- install dependencies now or not

If you pass `--yes`, prompts are skipped and defaults are used.

## What gets generated (project structure)

Typical generated structure:

```text
my-app/
├── src/
│   ├── components/
│   │   ├── head.html
│   │   ├── header.html
│   │   └── footer.html
│   ├── js/
│   │   └── main.js
│   └── styles/
│       ├── style.scss
│       ├── base/
│       ├── layout/
│       └── vendors/
├── index.html
├── second.html
├── vite.config.js
└── package.json
```

How it works:
- `index.html` and `second.html` use include placeholders.
- `vite.config.js` injects `head/header/footer` from `src/components`.
- style entry is generated based on selected preset.
- JS entry is generated based on selected features (`uikit`, `jquery`).

## Presets

| Preset | Description |
| --- | --- |
| `vanilla` | Plain HTML + SCSS stack, no Tailwind/UIkit |
| `vanilla-tailwind` | HTML + Tailwind utilities, PostCSS + Tailwind config |
| `uikit` | HTML + UIkit components/styles, UIkit JS + icons connected |
| `full` | UIkit + Tailwind in one project |

`jQuery` can be enabled or disabled independently for any preset.

## CLI options (detailed)

| Option | Description |
| --- | --- |
| `--preset <name>` | Preset: `vanilla`, `vanilla-tailwind`, `uikit`, `full` |
| `--jquery` | Force jQuery ON |
| `--no-jquery` | Force jQuery OFF |
| `--yes` | Non-interactive mode with defaults |
| `--no-install` | Skip dependency installation after scaffold |
| `--in-place` | Scaffold directly into current directory |
| `--package-manager <npm\|pnpm\|yarn>` | Explicit package manager selection |

If `--jquery` / `--no-jquery` is not passed and you are in interactive mode, CLI asks `Include jQuery?`.

## Usage examples

### Interactive

```bash
npm create vite-html-starter@latest
```

### Non-interactive (fast automation)

```bash
npm create vite-html-starter@latest my-app -- --yes --preset full --no-jquery --no-install
```

### Run local source (this repository)

```bash
yarn install
node ./bin/create-vite-html-starter.js
```

### Generate into current directory

```bash
node ./bin/create-vite-html-starter.js my-app --in-place
```

## Troubleshooting

### `dist/index.html` opened with `file://` has no proper styles/scripts

This is expected for modern module-based bundles.
Use HTTP instead:

```bash
npm run preview
```

or any static server for `dist`.

### SCSS warning `Unknown at rule @tailwind`

For Tailwind presets this is handled by generated `.vscode/settings.json`.

### Can I deploy static output to local web server folders (for example OpenServer/OSPanel)?

Yes. Use `npm run build`, then serve `dist` through HTTP domain/server.
Do not open build output directly as `file://...`.

## How to customize generated project

Most common entry points:

- layout includes:
  - `src/components/head.html`
  - `src/components/header.html`
  - `src/components/footer.html`
- page content:
  - `index.html`
  - `second.html`
- styles:
  - `src/styles/style.scss` and partials
- JS logic:
  - `src/js/main.js`

Recommended flow:
1. run `npm run dev`
2. replace demo blocks with project blocks
3. split styles by sections/components
4. build with `npm run build`
5. verify with `npm run preview`

## Feedback and support

- Report bugs: [GitHub Issues](https://github.com/alex-boom/create-vite-html-starter/issues)
- Ask questions / share ideas: [GitHub Discussions](https://github.com/alex-boom/create-vite-html-starter/discussions)
- npm page: [create-vite-html-starter](https://www.npmjs.com/package/create-vite-html-starter)
- source code: [alex-boom/create-vite-html-starter](https://github.com/alex-boom/create-vite-html-starter)

If this starter helps your workflow, consider giving the repository a star.

## Release workflow (for maintainer)

```bash
npm whoami
yarn smoke
yarn pack:check
npm version patch
npm publish --access public
```

Post-publish check:

```bash
npm create vite-html-starter@latest
```

## Versioning

- `patch` - fixes and small improvements, no breaking changes
- `minor` - backward-compatible features
- `major` - breaking changes in CLI behavior or generated project contract

Typical examples:
- `patch`: README improvement, bugfix in CLI flags, template style cleanup
- `minor`: new preset, new optional feature/flag
- `major`: removed/renamed flags, changed generated structure in incompatible way

## Author

- Dudka Alexandr
- Email: `dudka.alexandr83@gmail.com`
- GitHub: [alex-boom](https://github.com/alex-boom)

