# create-vite-html-starter

CLI scaffold for Vite-based HTML/CSS/JS projects.

## What you get

- Multiple presets:
  - `vanilla`
  - `vanilla-tailwind`
  - `uikit`
  - `full` (`uikit + tailwind`)
- Optional jQuery for any preset:
  - `--jquery`
  - `--no-jquery`
- Ready project structure with:
  - `index.html` and `second.html`
  - SCSS setup
  - Vite config

## Use locally from this repo

1) Install dependencies:

```bash
yarn install
```

2) Run the local CLI:

```bash
node ./bin/create-vite-html-starter.js
```

The CLI will ask for:
- project name
- preset
- jQuery on/off
- install dependencies now or later

3) Non-interactive example:

```bash
node ./bin/create-vite-html-starter.js my-app --yes --preset full --no-jquery --no-install
```

4) Run generated project:

```bash
cd my-app
npm install
npm run dev
```

## Use as published package

Use one of the following commands:

```bash
npm create vite-html-starter@latest
```

```bash
pnpm create vite-html-starter
```

```bash
yarn create vite-html-starter
```

## Presets

- `vanilla`: plain HTML + SCSS
- `vanilla-tailwind`: HTML + Tailwind
- `uikit`: HTML + UIkit
- `full`: UIkit + Tailwind

## CLI flags

- `--preset <name>`: choose preset
- `--jquery`: force jQuery ON
- `--no-jquery`: force jQuery OFF
- `--yes`: skip prompts and use defaults
- `--no-install`: skip dependency installation
- `--in-place`: create project in current directory
- `--package-manager <npm|pnpm|yarn>`: select package manager

Note: if you run without `--yes` and without explicit `--jquery`/`--no-jquery`, the CLI will ask `Include jQuery?`.

## Release checklist

Before each publish:

1) Ensure you are logged in:

```bash
npm whoami
```

2) Run package content check:

```bash
yarn pack:check
```

3) Run smoke generation:

```bash
yarn smoke
```

4) Bump version:

```bash
npm version patch
```

## Versioning guide (SemVer)

Use this rule for `npm version`:

- `patch` (`0.1.1` -> `0.1.2`): fixes and small improvements without breaking existing usage.
  - Example: bugfix in `--jquery` handling, README typo fixes, minor template style cleanup.
- `minor` (`0.1.1` -> `0.2.0`): new backward-compatible features.
  - Example: new preset, new CLI flag, additional generated file that does not break old commands.
- `major` (`0.1.1` -> `1.0.0`): breaking changes.
  - Example: rename/remove CLI flags, change command behavior in incompatible way, remove preset.

Useful commands:

```bash
npm version patch
```

```bash
npm version minor
```

```bash
npm version major
```

## Publish to npm

If you are not logged in yet:

```bash
npm login
```

Publish:

```bash
npm publish --access public
```

Verify install flow in a clean directory:

```bash
npm create vite-html-starter@latest
```

## Feedback

- Bug reports: `https://github.com/alex-boom/create-vite-html-starter/issues`
- Discussions and ideas: `https://github.com/alex-boom/create-vite-html-starter/discussions`

## For CLI development

```bash
yarn install
yarn smoke
yarn pack:check
```

