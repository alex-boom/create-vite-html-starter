import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import minimist from 'minimist';
import fs from 'fs-extra';
import { execa } from 'execa';
import { input, select, confirm } from '@inquirer/prompts';

const PRESET_MAP = {
  vanilla: [],
  'vanilla-tailwind': ['tailwind'],
  uikit: ['uikit'],
  full: ['uikit', 'tailwind'],
};

const PRESET_CHOICES = [
  { name: 'Vanilla', value: 'vanilla' },
  { name: 'Vanilla + Tailwind', value: 'vanilla-tailwind' },
  { name: 'UIkit', value: 'uikit' },
  { name: 'Full (UIkit + Tailwind)', value: 'full' },
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const TEMPLATE_DIR = path.join(ROOT_DIR, 'templates', 'base');
const SHARED_STYLES_DIR = path.join(ROOT_DIR, 'templates', 'shared', 'styles');
const NON_INTERACTIVE_DEFAULTS = {
  projectName: 'my-vite-project',
  preset: 'vanilla',
  includeJquery: false,
  install: true,
};

const VANILLA_DEMO_SCSS = `.demo-hero {
  display: grid;
  gap: 12px;
  padding: 28px;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #fff;
}

.demo-title {
  margin: 0;
  font-size: clamp(1.6rem, 2vw, 2.1rem);
}

.demo-tag {
  margin: 0;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #2563eb;
}

.demo-subtitle {
  margin: 0;
  color: #4b5563;
}

.demo-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  margin-top: 24px;
}

.demo-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 18px;
  background: #fff;
}

.demo-card h3 {
  margin: 0 0 8px;
}

.demo-card p {
  margin: 0;
  color: #4b5563;
}

.demo-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 24px;
}

.demo-button {
  border: 0;
  border-radius: 10px;
  padding: 10px 16px;
  font: inherit;
  color: #fff;
  background: #2563eb;
  cursor: pointer;
}

.demo-button:hover {
  background: #1d4ed8;
}

.demo-console {
  padding: 10px 14px;
  border-radius: 10px;
  background: #eef2ff;
  color: #3730a3;
}

.demo-console[data-state='on'] {
  background: #dcfce7;
  color: #166534;
}`;

function toValidPackageName(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-._~]/g, '-')
    .replace(/^-+|-+$/g, '');
}

function detectPackageManager() {
  const ua = process.env.npm_config_user_agent || '';
  if (ua.startsWith('pnpm')) return 'pnpm';
  if (ua.startsWith('yarn')) return 'yarn';
  return 'npm';
}

function mergePackage(target, patch) {
  if (patch.dependencies) {
    target.dependencies = target.dependencies || {};
    Object.assign(target.dependencies, patch.dependencies);
  }
  if (patch.devDependencies) {
    target.devDependencies = target.devDependencies || {};
    Object.assign(target.devDependencies, patch.devDependencies);
  }
  if (patch.scripts) {
    target.scripts = target.scripts || {};
    Object.assign(target.scripts, patch.scripts);
  }
}

function renderMainJs(features) {
  const lines = [];
  if (features.jquery) {
    lines.push("import $ from 'jquery';");
  }
  if (features.uikit) {
    lines.push("import UIkit from 'uikit';");
    lines.push("import Icons from 'uikit/dist/js/uikit-icons';");
    lines.push("import 'uikit/dist/css/uikit.min.css';");
  }
  lines.push("import '../styles/style.scss';");
  lines.push('');
  if (features.uikit) {
    lines.push('UIkit.use(Icons);');
    lines.push('');
  }
  lines.push('const setDemoState = (active) => {');
  lines.push("  const consoleNode = document.querySelector('#demo-console');");
  lines.push("  const statusNode = document.querySelector('#demo-status');");
  lines.push('  if (consoleNode) {');
  lines.push("    consoleNode.dataset.state = active ? 'on' : 'off';");
  lines.push('  }');
  lines.push('  if (statusNode) {');
  lines.push("    statusNode.textContent = active ? 'ON' : 'OFF';");
  lines.push('  }');
  lines.push('};');
  lines.push('');
  lines.push('const initApp = () => {');
  lines.push("  const root = document.querySelector('#main');");
  lines.push('  if (!root) return;');
  lines.push('  let active = false;');
  lines.push('  setDemoState(active);');
  lines.push('');
  if (features.jquery) {
    lines.push("  const $root = $('#main');");
    lines.push('  if (!$root.length) return;');
    lines.push("  $root.on('click', '#demo-toggle', () => {");
    lines.push('    active = !active;');
    lines.push('    setDemoState(active);');
    lines.push('  });');
  } else {
    lines.push("  root.addEventListener('click', (event) => {");
    lines.push("    const trigger = event.target.closest('#demo-toggle');");
    lines.push('    if (!trigger) return;');
    lines.push('    active = !active;');
    lines.push('    setDemoState(active);');
    lines.push('  });');
  }
  lines.push('');
  lines.push("  console.log('Demo ready');");
  lines.push('};');
  lines.push('');
  if (features.jquery) {
    lines.push('$(function () {');
    lines.push('  initApp();');
    lines.push('});');
  } else {
    lines.push("if (document.readyState === 'loading') {");
    lines.push("  document.addEventListener('DOMContentLoaded', initApp);");
    lines.push('} else {');
    lines.push('  initApp();');
    lines.push('}');
  }
  lines.push('');
  return lines.join('\n');
}

function buildStyleEntry(preset, features) {
  const lines = [];

  lines.push(`$breakpoints: (`);
  lines.push(`  'xs-phone': 320px,`);
  lines.push(`  'phone': 480px,`);
  lines.push(`  'tablet': 768px,`);
  lines.push(`  'desktop': 1024px,`);
  lines.push(`  'widescreen': 1200px`);
  lines.push(`);`);
  lines.push(``);
  lines.push(`$media-expressions: (`);
  lines.push(`  'screen': 'screen',`);
  lines.push(`  'print': 'print',`);
  lines.push(`  'handheld': 'handheld',`);
  lines.push(`  'landscape': '(orientation: landscape)',`);
  lines.push(`  'portrait': '(orientation: portrait)',`);
  lines.push(`  'retina2x': '(-webkit-min-device-pixel-ratio: 1.5), (min-resolution: 144dpi)',`);
  lines.push(`  'retina3x': '(-webkit-min-device-pixel-ratio: 2.5), (min-resolution: 240dpi)'`);
  lines.push(`);`);
  lines.push(``);

  lines.push(`@import 'base/variables';`);
  lines.push(`@import 'base/functions';`);
  lines.push(`@import 'base/mixins';`);
  lines.push(`@import 'base/helpers';`);

  // Tailwind and UIkit presets already provide base normalization/preflight.
  if (preset === 'vanilla') {
    lines.push(`@import 'base/reset';`);
  }

  lines.push(`@import 'base/typography';`);
  lines.push(`@import 'base/forms';`);
  lines.push(``);
  lines.push(`@import 'vendors/include-media';`);

  if (preset === 'vanilla') {
    lines.push(`@import 'vendors/normalize';`);
  }

  if (features.tailwind) {
    lines.push(`@tailwind base;`);
    lines.push(`@tailwind components;`);
    lines.push(`@tailwind utilities;`);
  }

  lines.push(``);
  lines.push(`@import 'layout/grid';`);
  lines.push(``);
  if (preset === 'vanilla') {
    lines.push(VANILLA_DEMO_SCSS.trimEnd());
    lines.push(``);
  }
  return lines.join('\n');
}

function renderHeader(features) {
  if (features.uikit) {
    return `<header id="header">
  <nav class="uk-container" data-uk-navbar>
    <div class="uk-navbar-left">
      <a class="uk-navbar-item uk-logo" href="/">LOGO</a>
      <ul class="uk-navbar-nav">
        <li class="uk-active"><a href="/">Home</a></li>
        <li><a href="/second.html">Second</a></li>
      </ul>
    </div>
  </nav>
</header>
`;
  }

  return `<header id="header">
  <div class="container">
    <nav>
      <a href="/">Home</a> |
      <a href="/second.html">Second</a>
    </nav>
  </div>
</header>
`;
}

function renderFooter(features) {
  if (features.uikit) {
    return `<footer id="footer">
  <div class="uk-container">
    <p>Generated with create-vite-html-starter.</p>
  </div>
</footer>
`;
  }

  return `<footer id="footer">
  <div class="container">
    <p>Generated with create-vite-html-starter.</p>
  </div>
</footer>
`;
}

function renderMainContent(preset, features, page) {
  const heading = page === 'index' ? 'Starter preview' : 'Second page preview';
  const subheading = page === 'index'
    ? 'Everything is wired so you can validate integrations immediately.'
    : 'This page mirrors the same include and framework setup.';

  if (preset === 'vanilla-tailwind') {
    return `<main id="main" class="mx-auto max-w-6xl px-4 py-10">
  <section class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
    <p class="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-600">Vanilla + Tailwind</p>
    <h1 class="mb-3 text-3xl font-bold text-slate-900">${heading}</h1>
    <p class="text-slate-600">${subheading}</p>
    <div class="mt-6 grid gap-4 md:grid-cols-3">
      <article class="rounded-xl border border-slate-200 p-4">
        <h3 class="text-lg font-semibold text-slate-900">Tailwind utilities</h3>
        <p class="mt-2 text-sm text-slate-600">Spacing, typography and cards are utility-driven.</p>
      </article>
      <article class="rounded-xl border border-slate-200 p-4">
        <h3 class="text-lg font-semibold text-slate-900">HTML include</h3>
        <p class="mt-2 text-sm text-slate-600">Header and footer are injected from component files.</p>
      </article>
      <article class="rounded-xl border border-slate-200 p-4">
        <h3 class="text-lg font-semibold text-slate-900">Ready to extend</h3>
        <p class="mt-2 text-sm text-slate-600">Drop in your sections and keep utilities consistent.</p>
      </article>
    </div>
    <div class="mt-6 flex flex-wrap items-center gap-3">
      <button id="demo-toggle" type="button" class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">Toggle demo state</button>
      <div id="demo-console" data-state="off" class="rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-700">Interaction state: <strong id="demo-status">OFF</strong>${features.jquery ? ' (jQuery)' : ' (Vanilla JS)'}</div>
    </div>
  </section>
</main>
`;
  }

  if (preset === 'uikit') {
    return `<main id="main" class="uk-container uk-section uk-section-default">
  <div class="uk-card uk-card-default uk-card-body uk-border-rounded">
    <p class="uk-text-meta uk-text-primary uk-text-bold">UIkit preset</p>
    <h1 class="uk-margin-small-top">${heading}</h1>
    <p class="uk-text-muted">${subheading}</p>
    <div class="uk-grid-small uk-child-width-1-3@m uk-margin-medium-top" uk-grid>
      <div>
        <article class="uk-card uk-card-secondary uk-card-body uk-border-rounded">
          <h3 class="uk-card-title uk-margin-remove-bottom">uk-card</h3>
          <p class="uk-margin-small-top">Core UIkit card styling is active.</p>
        </article>
      </div>
      <div>
        <article class="uk-card uk-card-default uk-card-body uk-border-rounded">
          <h3 class="uk-card-title uk-margin-remove-bottom">uk-grid</h3>
          <p class="uk-margin-small-top">Responsive grid and spacing utilities work out of the box.</p>
        </article>
      </div>
      <div>
        <article class="uk-card uk-card-default uk-card-body uk-border-rounded">
          <h3 class="uk-card-title uk-margin-remove-bottom">uk-alert</h3>
          <p class="uk-margin-small-top">Interactive elements are available immediately.</p>
        </article>
      </div>
    </div>
    <div class="uk-margin-medium-top uk-flex uk-flex-middle uk-flex-wrap uk-gap-small">
      <button id="demo-toggle" type="button" class="uk-button uk-button-primary">Toggle demo state</button>
      <div id="demo-console" data-state="off" class="uk-alert-primary uk-border-rounded uk-padding-small">Interaction state: <strong id="demo-status">OFF</strong>${features.jquery ? ' (jQuery)' : ' (Vanilla JS)'}</div>
    </div>
  </div>
</main>
`;
  }

  if (preset === 'full') {
    return `<main id="main" class="uk-container uk-section uk-section-default">
  <section class="uk-card uk-card-default uk-card-body uk-border-rounded p-6 md:p-8">
    <p class="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">Full preset (UIkit + Tailwind)</p>
    <h1 class="mb-2 text-3xl font-bold text-slate-900">${heading}</h1>
    <p class="mb-6 text-slate-600">${subheading}</p>
    <div class="uk-grid-small md:grid md:grid-cols-3 md:gap-4" uk-grid>
      <div class="rounded-xl border border-slate-200 p-4">
        <h3 class="mb-2 text-lg font-semibold text-slate-900">UIkit layout</h3>
        <p class="text-sm text-slate-600">Container/grid/navbar come from UIkit.</p>
      </div>
      <div class="rounded-xl border border-slate-200 p-4">
        <h3 class="mb-2 text-lg font-semibold text-slate-900">Tailwind utilities</h3>
        <p class="text-sm text-slate-600">Typography, spacing and emphasis use utility classes.</p>
      </div>
      <div class="rounded-xl border border-slate-200 p-4">
        <h3 class="mb-2 text-lg font-semibold text-slate-900">Ready workflow</h3>
        <p class="text-sm text-slate-600">Use whichever system is faster for each block.</p>
      </div>
    </div>
    <div class="mt-6 flex flex-wrap items-center gap-3">
      <button id="demo-toggle" type="button" class="uk-button uk-button-primary">Toggle demo state</button>
      <div id="demo-console" data-state="off" class="rounded-lg bg-violet-50 px-4 py-2 text-sm text-violet-700">Interaction state: <strong id="demo-status">OFF</strong>${features.jquery ? ' (jQuery)' : ' (Vanilla JS)'}</div>
    </div>
  </section>
</main>
`;
  }

  return `<main id="main" class="container">
  <section class="demo-hero">
    <p class="demo-tag">Vanilla preset</p>
    <h1 class="demo-title">${heading}</h1>
    <p class="demo-subtitle">${subheading}</p>
  </section>
  <section class="demo-grid">
    <article class="demo-card">
      <h3>Semantic HTML</h3>
      <p>Lightweight structure ready for classic slicing flow.</p>
    </article>
    <article class="demo-card">
      <h3>SCSS architecture</h3>
      <p>Base/layout/vendors stack is connected and editable.</p>
    </article>
    <article class="demo-card">
      <h3>Instant start</h3>
      <p>Open pages and start replacing demo blocks with project sections.</p>
    </article>
  </section>
  <div class="demo-actions">
    <button id="demo-toggle" type="button" class="demo-button">Toggle demo state</button>
    <div id="demo-console" data-state="off" class="demo-console">Interaction state: <strong id="demo-status">OFF</strong>${features.jquery ? ' (jQuery)' : ' (Vanilla JS)'}</div>
  </div>
</main>
`;
}

function renderPageHtml(page, preset, features) {
  return `<!doctype html>
<html lang="en">
<%- head %>

  <body>
    <div id="wrapper">
      <%- header %>
      ${renderMainContent(preset, features, page)}
      <%- footer %>
    </div>
    <script type="module" src="/src/js/main.js"></script>
  </body>

</html>
`;
}

function overlayTailwind(context) {
  context.features.tailwind = true;
  mergePackage(context.pkg, {
    devDependencies: {
      tailwindcss: '^3.4.17',
      postcss: '^8.5.6',
      autoprefixer: '^10.4.21',
    },
  });
  context.filesToWrite.push({
    rel: 'tailwind.config.js',
    content: `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './*.html',
    './src/**/*.{js,html,scss}',
    './src/components/*.html'
  ],
  theme: {
    extend: {}
  },
  plugins: []
};
`,
  });
  context.filesToWrite.push({
    rel: 'postcss.config.js',
    content: `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};
`,
  });
  context.filesToWrite.push({
    rel: '.vscode/settings.json',
    content: `{
  "css.lint.unknownAtRules": "ignore",
  "scss.lint.unknownAtRules": "ignore",
  "less.lint.unknownAtRules": "ignore"
}
`,
  });
}

function overlayUikit(context) {
  context.features.uikit = true;
  mergePackage(context.pkg, {
    dependencies: {
      uikit: '^3.23.2',
    },
  });
}

function overlayJquery(context) {
  context.features.jquery = true;
  mergePackage(context.pkg, {
    dependencies: {
      jquery: '^3.7.1',
    },
  });
}

async function installDependencies(targetDir, packageManager) {
  const argsByPm = {
    npm: ['install'],
    pnpm: ['install'],
    yarn: [],
  };
  const args = argsByPm[packageManager] || ['install'];
  await execa(packageManager, args, { cwd: targetDir, stdio: 'inherit' });
}

async function copySharedStyles(targetDir) {
  const targetStylesDir = path.join(targetDir, 'src', 'styles');
  await fs.remove(targetStylesDir);

  if (await fs.pathExists(SHARED_STYLES_DIR)) {
    await fs.copy(SHARED_STYLES_DIR, targetStylesDir);
  } else {
    await fs.ensureDir(targetStylesDir);
  }
}

function resolvePreset(value) {
  if (!value) return null;
  return PRESET_MAP[value] ? value : null;
}

function resolveTargetDirectory(projectName, cwd, inPlace) {
  const directTarget = path.resolve(cwd, projectName);
  if (inPlace) return directTarget;

  // If CLI is launched from its own repository root, scaffold next to it.
  if (path.resolve(cwd) === ROOT_DIR) {
    return path.resolve(cwd, '..', projectName);
  }

  return directTarget;
}

export async function run() {
  const rawArgs = process.argv.slice(2);
  const hasExplicitJqueryFlag = rawArgs.some((arg) => arg === '--jquery' || arg === '--no-jquery');
  const argv = minimist(rawArgs, {
    boolean: ['yes', 'jquery', 'install', 'in-place'],
    string: ['preset', 'package-manager'],
    alias: {
      y: 'yes',
    },
    default: {
      install: true,
    },
  });

  const cwd = process.cwd();
  const projectName = argv._[0] || (argv.yes
    ? NON_INTERACTIVE_DEFAULTS.projectName
    : await input({
      message: 'Project name',
      default: NON_INTERACTIVE_DEFAULTS.projectName,
    }));

  const targetDir = resolveTargetDirectory(projectName, cwd, argv['in-place']);
  const preset = resolvePreset(argv.preset) || (argv.yes
    ? NON_INTERACTIVE_DEFAULTS.preset
    : await select({
      message: 'Select preset',
      choices: PRESET_CHOICES,
    }));

  const includeJquery = hasExplicitJqueryFlag
    ? argv.jquery
    : argv.yes
      ? NON_INTERACTIVE_DEFAULTS.includeJquery
    : await confirm({
      message: 'Include jQuery?',
      default: false,
    });

  const shouldInstall = typeof argv.install === 'boolean'
    ? argv.install
    : argv.yes
      ? NON_INTERACTIVE_DEFAULTS.install
    : await confirm({
      message: 'Install dependencies now?',
      default: true,
    });

  const packageManager = argv['package-manager'] || detectPackageManager();

  if (await fs.pathExists(targetDir)) {
    const entries = await fs.readdir(targetDir);
    if (entries.length > 0) {
      throw new Error(`Target directory is not empty: ${targetDir}`);
    }
  }

  await fs.copy(TEMPLATE_DIR, targetDir);
  await copySharedStyles(targetDir);

  const pkgPath = path.join(targetDir, 'package.json');
  const pkg = await fs.readJson(pkgPath);
  pkg.name = toValidPackageName(projectName) || 'vite-project';

  const context = {
    features: {
      uikit: false,
      tailwind: false,
      jquery: false,
    },
    pkg,
    filesToWrite: [],
  };

  for (const overlay of PRESET_MAP[preset]) {
    if (overlay === 'tailwind') overlayTailwind(context);
    if (overlay === 'uikit') overlayUikit(context);
  }

  if (includeJquery) {
    overlayJquery(context);
  }

  await fs.writeJson(pkgPath, context.pkg, { spaces: 2 });
  await fs.writeFile(path.join(targetDir, 'src', 'js', 'main.js'), renderMainJs(context.features), 'utf8');
  await fs.writeFile(path.join(targetDir, 'src', 'styles', 'style.scss'), buildStyleEntry(preset, context.features), 'utf8');
  await fs.writeFile(path.join(targetDir, 'index.html'), renderPageHtml('index', preset, context.features), 'utf8');
  await fs.writeFile(path.join(targetDir, 'second.html'), renderPageHtml('second', preset, context.features), 'utf8');
  await fs.writeFile(path.join(targetDir, 'src', 'components', 'header.html'), renderHeader(context.features), 'utf8');
  await fs.writeFile(path.join(targetDir, 'src', 'components', 'footer.html'), renderFooter(context.features), 'utf8');

  for (const file of context.filesToWrite) {
    const fullPath = path.join(targetDir, file.rel);
    await fs.ensureDir(path.dirname(fullPath));
    await fs.writeFile(fullPath, file.content, 'utf8');
  }

  if (shouldInstall) {
    await installDependencies(targetDir, packageManager);
  }

  console.log('');
  console.log(`Project created: ${targetDir}`);
  console.log('Next steps:');
  const relativeCd = path.relative(cwd, targetDir) || '.';
  console.log(`  cd ${relativeCd}`);
  if (!shouldInstall) {
    if (packageManager === 'npm') console.log('  npm install');
    if (packageManager === 'pnpm') console.log('  pnpm install');
    if (packageManager === 'yarn') console.log('  yarn');
  }
  if (packageManager === 'npm') console.log('  npm run dev');
  if (packageManager === 'pnpm') console.log('  pnpm dev');
  if (packageManager === 'yarn') console.log('  yarn dev');
}
