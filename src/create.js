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

const VANILLA_DEMO_SCSS = `:root {
  color-scheme: light;
}

body {
  margin: 0;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  line-height: 1.55;
  color: #0f172a;
  background: linear-gradient(160deg, #f8fafc 0%, #eef2ff 40%, #ecfeff 100%);
}

#wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

#main {
  flex: 1;
}

.container {
  width: min(1120px, calc(100% - 32px));
  margin: 0 auto;
}

.site-header {
  position: sticky;
  top: 0;
  z-index: 30;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(148, 163, 184, 0.25);
}

.site-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  min-height: 72px;
}

.site-logo {
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: #1d4ed8;
  text-decoration: none;
}

.site-nav {
  display: flex;
  align-items: center;
  gap: 18px;
}

.site-nav a {
  color: #334155;
  font-weight: 500;
  text-decoration: none;
}

.site-nav a.is-active,
.site-nav a:hover {
  color: #1d4ed8;
}

.demo-shell {
  padding: 48px 0 64px;
}

.demo-hero {
  display: grid;
  gap: 16px;
  padding: 30px;
  border-radius: 20px;
  background: linear-gradient(130deg, #0f172a 0%, #1d4ed8 52%, #7c3aed 100%);
  color: #fff;
  box-shadow: 0 24px 50px -30px rgba(15, 23, 42, 0.8);
}

.demo-tag {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(191, 219, 254, 1);
}

.demo-title {
  margin: 0;
  font-size: clamp(1.9rem, 4vw, 2.8rem);
  line-height: 1.15;
}

.demo-subtitle {
  margin: 0;
  color: rgba(226, 232, 240, 0.95);
}

.demo-hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.demo-button {
  border: 0;
  border-radius: 12px;
  padding: 11px 18px;
  font: inherit;
  font-weight: 600;
  color: #fff;
  background: #2563eb;
  cursor: pointer;
}

.demo-button:hover {
  background: #1d4ed8;
}

.demo-button-outline {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 12px;
  padding: 10px 18px;
  color: #fff;
  text-decoration: none;
  font-weight: 600;
}

.demo-visual {
  margin-top: 8px;
}

.demo-visual img {
  display: block;
  width: 100%;
  max-height: 340px;
  object-fit: cover;
  border-radius: 14px;
}

.demo-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  margin-top: 26px;
}

.demo-card {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 18px;
  background: #fff;
  box-shadow: 0 18px 30px -24px rgba(15, 23, 42, 0.55);
}

.demo-card img {
  display: block;
  width: 100%;
  height: 140px;
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 12px;
}

.demo-card h3 {
  margin: 0 0 8px;
  font-size: 1.1rem;
}

.demo-card p {
  margin: 0;
  color: #475569;
}

.demo-faq {
  margin-top: 24px;
  display: grid;
  gap: 10px;
}

.demo-faq details {
  border: 1px solid #dbeafe;
  border-radius: 12px;
  background: #f8fbff;
  padding: 12px 14px;
}

.demo-faq summary {
  font-weight: 600;
  cursor: pointer;
}

.demo-faq p {
  margin: 10px 0 0;
  color: #334155;
}

.demo-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 24px;
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
}

.site-footer {
  border-top: 1px solid rgba(148, 163, 184, 0.25);
  background: rgba(255, 255, 255, 0.85);
}

.site-footer__inner {
  min-height: 74px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.site-footer__inner p {
  margin: 0;
  color: #64748b;
}

@media (max-width: 767px) {
  .site-header__inner {
    min-height: 64px;
    flex-wrap: wrap;
    padding: 12px 0;
  }

  .site-nav {
    width: 100%;
    gap: 14px;
    padding-bottom: 8px;
  }

  .demo-shell {
    padding: 26px 0 44px;
  }

  .demo-hero {
    padding: 22px;
  }

  .site-footer__inner {
    min-height: 64px;
    flex-direction: column;
    justify-content: center;
    padding: 12px 0;
  }
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
  const importLines = [];
  if (features.jquery) importLines.push("import $ from 'jquery';");
  if (features.uikit) {
    importLines.push("import UIkit from 'uikit';");
    importLines.push("import Icons from 'uikit/dist/js/uikit-icons';");
    importLines.push("import 'uikit/dist/css/uikit.min.css';");
  }
  importLines.push("import '../styles/style.scss';");

  const uikitBootstrap = features.uikit ? 'UIkit.use(Icons);\n\n' : '';

  if (features.jquery) {
    return `${importLines.join('\n')}

${uikitBootstrap}(function ($) {
  const setDemoState = (active) => {
    const $console = $('#demo-console');
    const $status = $('#demo-status');
    if ($console.length) $console.attr('data-state', active ? 'on' : 'off');
    if ($status.length) $status.text(active ? 'ON' : 'OFF');
  };

  const initDemoToggle = () => {
    const $main = $('#main');
    if (!$main.length) return;
    let active = false;
    setDemoState(active);
    $main.on('click', '#demo-toggle', () => {
      active = !active;
      setDemoState(active);
    });
  };

  const initSmoothLinks = () => {
    $('a[href^="#"]').on('click', function (event) {
      const id = $(this).attr('href');
      if (!id || id === '#') return;
      const $target = $(id);
      if (!$target.length) return;
      event.preventDefault();
      $('html, body').animate({ scrollTop: $target.offset().top - 80 }, 300);
    });
  };

  const initMediaReveal = () => {
    const nodes = [].slice.call(document.querySelectorAll('[data-reveal]'));
    if (!nodes.length) return;
    if (!('IntersectionObserver' in window)) {
      nodes.forEach((node) => node.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.2 });
    nodes.forEach((node) => observer.observe(node));
  };

  const initScrollTop = () => {
    const $trigger = $('#scroll-top');
    if (!$trigger.length) return;
    $trigger.on('click', () => {
      $('html, body').animate({ scrollTop: 0 }, 350);
    });
  };

  const initFaqFromHash = () => {
    const hash = window.location.hash.replace('#', '');
    if (!hash) return;
    const $target = $('#' + hash);
    if (!$target.length) return;
    if ($target.is('details')) $target.attr('open', true);
    if (window.UIkit && $target.closest('[uk-accordion]').length) {
      const accordion = window.UIkit.accordion($target.closest('[uk-accordion]').get(0));
      accordion.toggle($target.index());
    }
  };

  const initUikitDemoComponents = () => {
    if (!window.UIkit) return;
    const $modalButton = $('#open-demo-modal');
    const $modalNode = $('#demo-modal');
    if ($modalButton.length && $modalNode.length) {
      const modal = window.UIkit.modal($modalNode.get(0));
      $modalButton.on('click', (event) => {
        event.preventDefault();
        modal.show();
      });
    }
  };

  $(function () {
    initDemoToggle();
    initSmoothLinks();
    initMediaReveal();
    initScrollTop();
    initFaqFromHash();
    ${features.uikit ? 'initUikitDemoComponents();' : ''}
    console.log('Starter demo ready (jQuery)');
  });
})($);
`;
  }

  return `${importLines.join('\n')}

${uikitBootstrap}const setDemoState = (active) => {
  const consoleNode = document.querySelector('#demo-console');
  const statusNode = document.querySelector('#demo-status');
  if (consoleNode) consoleNode.dataset.state = active ? 'on' : 'off';
  if (statusNode) statusNode.textContent = active ? 'ON' : 'OFF';
};

const initDemoToggle = () => {
  const root = document.querySelector('#main');
  if (!root) return;
  let active = false;
  setDemoState(active);
  root.addEventListener('click', (event) => {
    const trigger = event.target.closest('#demo-toggle');
    if (!trigger) return;
    active = !active;
    setDemoState(active);
  });
};

const initSmoothLinks = () => {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
    });
  });
};

const initMediaReveal = () => {
  const nodes = Array.from(document.querySelectorAll('[data-reveal]'));
  if (!nodes.length) return;
  if (!('IntersectionObserver' in window)) {
    nodes.forEach((node) => node.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.2 });
  nodes.forEach((node) => observer.observe(node));
};

const initScrollTop = () => {
  const trigger = document.querySelector('#scroll-top');
  if (!trigger) return;
  trigger.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
};

const initFaqFromHash = () => {
  const hash = window.location.hash.replace('#', '');
  if (!hash) return;
  const target = document.getElementById(hash);
  if (!target) return;
  if (target.tagName === 'DETAILS') target.open = true;
  if (window.UIkit && target.closest('[uk-accordion]')) {
    const accordion = window.UIkit.accordion(target.closest('[uk-accordion]'));
    accordion.toggle(Array.from(target.parentElement.children).indexOf(target));
  }
};

const initUikitDemoComponents = () => {
  if (!window.UIkit) return;
  const modalButton = document.querySelector('#open-demo-modal');
  const modalNode = document.querySelector('#demo-modal');
  if (!modalButton || !modalNode) return;
  const modal = window.UIkit.modal(modalNode);
  modalButton.addEventListener('click', (event) => {
    event.preventDefault();
    modal.show();
  });
};

const boot = () => {
  initDemoToggle();
  initSmoothLinks();
  initMediaReveal();
  initScrollTop();
  initFaqFromHash();
  ${features.uikit ? 'initUikitDemoComponents();' : ''}
  console.log('Starter demo ready (vanilla)');
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
`;
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
  if (features.uikit && features.tailwind) {
    return `<header id="header">
  <div class="uk-background-default uk-box-shadow-small">
    <div class="uk-container">
      <nav class="uk-navbar-container uk-navbar-transparent" uk-navbar>
        <div class="uk-navbar-left">
          <a class="uk-navbar-item uk-logo tracking-[0.14em] uppercase font-semibold text-violet-700" href="/">Starter</a>
          <ul class="uk-navbar-nav">
            <li><a href="/">Home</a></li>
            <li><a href="/second.html">Second</a></li>
          </ul>
        </div>
        <div class="uk-navbar-right">
          <a href="#features" class="uk-button uk-button-primary">Features</a>
        </div>
      </nav>
    </div>
  </div>
</header>
`;
  }

  if (features.uikit) {
    return `<header id="header">
  <div class="uk-background-default uk-box-shadow-small">
    <div class="uk-container">
      <nav class="uk-navbar-container uk-navbar-transparent" uk-navbar>
        <div class="uk-navbar-left">
          <a class="uk-navbar-item uk-logo" href="/">Starter</a>
          <ul class="uk-navbar-nav">
            <li><a href="/">Home</a></li>
            <li><a href="/second.html">Second</a></li>
          </ul>
        </div>
        <div class="uk-navbar-right">
          <a href="#features" class="uk-button uk-button-primary">Features</a>
        </div>
      </nav>
    </div>
  </div>
</header>
`;
  }

  if (features.tailwind) {
    return `<header id="header" class="border-b border-slate-200/80 bg-white/90 backdrop-blur">
  <div class="mx-auto flex min-h-[72px] w-full max-w-6xl items-center justify-between gap-6 px-4">
    <a href="/" class="text-sm font-bold uppercase tracking-[0.16em] text-blue-700">Starter</a>
    <nav class="flex items-center gap-5 text-sm font-medium text-slate-600">
      <a href="/" class="hover:text-blue-700">Home</a>
      <a href="/second.html" class="hover:text-blue-700">Second</a>
      <a href="#features" class="rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700">Features</a>
    </nav>
  </div>
</header>
`;
  }

  return `<header id="header">
  <div class="container site-header__inner">
    <a class="site-logo" href="/">Starter</a>
    <nav class="site-nav">
      <a href="/">Home</a>
      <a href="/second.html">Second</a>
      <a href="#features">Features</a>
    </nav>
  </div>
</header>
`;
}

function renderFooter(features) {
  if (features.uikit && features.tailwind) {
    return `<footer id="footer">
  <div class="uk-container">
    <div class="uk-flex uk-flex-between uk-flex-middle uk-padding-small">
      <p class="uk-text-muted uk-margin-remove">Built with create-vite-html-starter.</p>
      <button id="scroll-top" class="uk-button uk-button-default rounded-lg">Back to top</button>
    </div>
  </div>
</footer>
`;
  }

  if (features.uikit) {
    return `<footer id="footer">
  <div class="uk-container">
    <div class="uk-flex uk-flex-between uk-flex-middle uk-padding-small">
      <p class="uk-text-muted uk-margin-remove">Built with create-vite-html-starter.</p>
      <button id="scroll-top" class="uk-button uk-button-default">Back to top</button>
    </div>
  </div>
</footer>
`;
  }

  if (features.tailwind) {
    return `<footer id="footer" class="border-t border-slate-200/80 bg-white/80">
  <div class="mx-auto flex min-h-[74px] w-full max-w-6xl items-center justify-between gap-4 px-4">
    <p class="text-sm text-slate-500">Built with create-vite-html-starter.</p>
    <button id="scroll-top" class="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-400">Back to top</button>
  </div>
</footer>
`;
  }

  return `<footer id="footer">
  <div class="container site-footer__inner">
    <p>Built with create-vite-html-starter.</p>
    <button id="scroll-top" class="demo-button" type="button">Back to top</button>
  </div>
</footer>
`;
}

function renderMainContent(preset, features, page) {
  const pageMeta = page === 'index'
    ? {
      heading: 'Creative landing starter',
      subheading: 'A polished one-page style layout with responsive sections, visuals and interactive blocks.',
      ctaLabel: 'Start building',
      secondaryLabel: 'Explore features',
    }
    : {
      heading: 'Second page ready to scale',
      subheading: 'Use this as your inner page template with the same design system and component structure.',
      ctaLabel: 'View pricing',
      secondaryLabel: 'Read docs',
    };
  const heading = pageMeta.heading;
  const subheading = pageMeta.subheading;

  if (preset === 'vanilla-tailwind') {
    return `<main id="main" class="mx-auto max-w-6xl px-4 py-10">
  <section class="rounded-3xl bg-gradient-to-br from-slate-900 via-blue-700 to-violet-700 p-6 text-white shadow-xl md:p-8">
    <p class="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">Vanilla + Tailwind</p>
    <h1 class="mb-3 text-3xl font-bold md:text-5xl">${heading}</h1>
    <p class="max-w-3xl text-blue-100">${subheading}</p>
    <div class="mt-5 flex flex-wrap gap-3">
      <button id="demo-toggle" type="button" class="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100">${pageMeta.ctaLabel}</button>
      <a href="#features" class="rounded-xl border border-white/40 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">${pageMeta.secondaryLabel}</a>
    </div>
    <div class="mt-6 overflow-hidden rounded-xl">
      <img src="/img/starter-hero.svg" alt="Starter preview hero" class="h-56 w-full object-cover md:h-72">
    </div>
  </section>

  <section id="features" class="mt-8 grid gap-4 md:grid-cols-3">
      <article class="rounded-xl border border-slate-200 p-4">
        <img src="/img/starter-card-1.svg" alt="Tailwind card preview" class="mb-3 h-32 w-full rounded-lg object-cover">
        <h3 class="text-lg font-semibold text-slate-900">Tailwind utilities</h3>
        <p class="mt-2 text-sm text-slate-600">Spacing, typography and cards are utility-driven.</p>
      </article>
      <article class="rounded-xl border border-slate-200 p-4">
        <img src="/img/starter-card-2.svg" alt="HTML include preview" class="mb-3 h-32 w-full rounded-lg object-cover">
        <h3 class="text-lg font-semibold text-slate-900">HTML include</h3>
        <p class="mt-2 text-sm text-slate-600">Header and footer are injected from component files.</p>
      </article>
      <article class="rounded-xl border border-slate-200 p-4">
        <img src="/img/starter-card-3.svg" alt="Extendable structure preview" class="mb-3 h-32 w-full rounded-lg object-cover">
        <h3 class="text-lg font-semibold text-slate-900">Ready to extend</h3>
        <p class="mt-2 text-sm text-slate-600">Drop in your sections and keep utilities consistent.</p>
      </article>
  </section>

  <section class="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <h2 class="text-xl font-semibold text-slate-900">Quick FAQ</h2>
    <div class="mt-4 space-y-3">
      <details id="faq-stack" class="rounded-xl border border-slate-200 p-4">
        <summary class="cursor-pointer font-semibold text-slate-800">What is included in this preset?</summary>
        <p class="mt-2 text-sm text-slate-600">Tailwind config, PostCSS wiring, include-based layout structure and starter scripts.</p>
      </details>
      <details id="faq-edit" class="rounded-xl border border-slate-200 p-4">
        <summary class="cursor-pointer font-semibold text-slate-800">How should I start editing?</summary>
        <p class="mt-2 text-sm text-slate-600">Edit includes in <code>src/components</code> and page-specific content in <code>index.html</code>/<code>second.html</code>.</p>
      </details>
    </div>
    <div class="mt-6 flex flex-wrap items-center gap-3">
      <div id="demo-console" data-state="off" class="rounded-lg bg-blue-50 px-4 py-2 text-sm text-blue-700">Interaction state: <strong id="demo-status">OFF</strong>${features.jquery ? ' (jQuery)' : ' (Vanilla JS)'}</div>
    </div>
  </section>
</main>
`;
  }

  if (preset === 'uikit') {
    return `<main id="main" class="uk-container uk-section uk-section-default">
  <div class="uk-card uk-card-default uk-card-body uk-border-rounded uk-box-shadow-small">
    <p class="uk-text-meta uk-text-primary uk-text-bold">UIkit preset</p>
    <h1 class="uk-margin-small-top uk-heading-medium">${heading}</h1>
    <p class="uk-text-muted">${subheading}</p>
    <div class="uk-margin-medium-top uk-flex uk-flex-wrap uk-gap-small">
      <button id="demo-toggle" type="button" class="uk-button uk-button-primary">${pageMeta.ctaLabel}</button>
      <a href="#features" class="uk-button uk-button-default">${pageMeta.secondaryLabel}</a>
      <a id="open-demo-modal" href="#demo-modal" class="uk-button uk-button-secondary">Open modal</a>
    </div>
    <div class="uk-margin-medium-top">
      <img src="/img/starter-hero.svg" alt="Starter preview hero" class="uk-border-rounded">
    </div>
    <div id="features" class="uk-grid-small uk-child-width-1-3@m uk-margin-medium-top" uk-grid>
      <div>
        <article class="uk-card uk-card-secondary uk-card-body uk-border-rounded">
          <img src="/img/starter-card-1.svg" alt="UIkit card preview" class="uk-border-rounded uk-margin-small-bottom">
          <h3 class="uk-card-title uk-margin-remove-bottom">uk-card</h3>
          <p class="uk-margin-small-top">Core UIkit card styling is active.</p>
        </article>
      </div>
      <div>
        <article class="uk-card uk-card-default uk-card-body uk-border-rounded">
          <img src="/img/starter-card-2.svg" alt="UIkit grid preview" class="uk-border-rounded uk-margin-small-bottom">
          <h3 class="uk-card-title uk-margin-remove-bottom">uk-grid</h3>
          <p class="uk-margin-small-top">Responsive grid and spacing utilities work out of the box.</p>
        </article>
      </div>
      <div>
        <article class="uk-card uk-card-default uk-card-body uk-border-rounded">
          <img src="/img/starter-card-3.svg" alt="UIkit interactive preview" class="uk-border-rounded uk-margin-small-bottom">
          <h3 class="uk-card-title uk-margin-remove-bottom">uk-alert</h3>
          <p class="uk-margin-small-top">Interactive elements are available immediately.</p>
        </article>
      </div>
    </div>
    <ul uk-accordion class="uk-margin-medium-top">
      <li>
        <a class="uk-accordion-title" href="#faq-stack">What is included in this preset?</a>
        <div class="uk-accordion-content">
          <p>UIkit CSS/JS, responsive grid/cards, reusable includes and a ready JS entry point.</p>
        </div>
      </li>
      <li>
        <a class="uk-accordion-title" href="#faq-edit">How to start editing?</a>
        <div class="uk-accordion-content">
          <p>Update the includes in <code>src/components</code>, then replace demo sections in <code>index.html</code> and <code>second.html</code>.</p>
        </div>
      </li>
    </ul>
    <ul class="uk-tab uk-margin-medium-top" uk-tab>
      <li class="uk-active"><a href="#">Markup</a></li>
      <li><a href="#">Styles</a></li>
      <li><a href="#">Scripts</a></li>
    </ul>
    <ul class="uk-switcher uk-margin">
      <li><p class="uk-text-muted">Component includes keep your HTML sections reusable and easy to maintain.</p></li>
      <li><p class="uk-text-muted">SCSS layers are ready for base/layout/components scaling.</p></li>
      <li><p class="uk-text-muted">Starter JS already includes reusable init functions and demo interactions.</p></li>
    </ul>
    <div class="uk-margin-medium-top uk-flex uk-flex-middle uk-flex-wrap uk-gap-small">
      <div id="demo-console" data-state="off" class="uk-alert-primary uk-border-rounded uk-padding-small">Interaction state: <strong id="demo-status">OFF</strong>${features.jquery ? ' (jQuery)' : ' (Vanilla JS)'}</div>
    </div>
  </div>
  <div id="demo-modal" uk-modal>
    <div class="uk-modal-dialog uk-modal-body uk-border-rounded">
      <h3 class="uk-modal-title">UIkit modal demo</h3>
      <p class="uk-text-muted">Use this as a starting point for dialogs, overlays, or quick action panels.</p>
      <button class="uk-button uk-button-primary uk-modal-close" type="button">Close</button>
    </div>
  </div>
</main>
`;
  }

  if (preset === 'full') {
    return `<main id="main" class="uk-container uk-section uk-section-default">
  <section class="uk-card uk-card-default uk-card-body uk-border-rounded p-6 shadow-sm md:p-8">
    <p class="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">Full preset (UIkit + Tailwind)</p>
    <h1 class="mb-2 text-3xl font-bold text-slate-900">${heading}</h1>
    <p class="mb-6 text-slate-600">${subheading}</p>
    <div class="mb-4 flex flex-wrap gap-3">
      <button id="demo-toggle" type="button" class="uk-button uk-button-primary">${pageMeta.ctaLabel}</button>
      <a href="#features" class="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">${pageMeta.secondaryLabel}</a>
      <a id="open-demo-modal" href="#demo-modal" class="uk-button uk-button-secondary">Open modal</a>
    </div>
    <div class="mb-6 overflow-hidden rounded-xl">
      <img src="/img/starter-hero.svg" alt="Starter preview hero" class="h-56 w-full object-cover md:h-72">
    </div>
    <div id="features" class="uk-grid-small md:grid md:grid-cols-3 md:gap-4" uk-grid>
      <div class="rounded-xl border border-slate-200 p-4">
        <img src="/img/starter-card-1.svg" alt="UIkit layout preview" class="mb-3 h-32 w-full rounded-lg object-cover">
        <h3 class="mb-2 text-lg font-semibold text-slate-900">UIkit layout</h3>
        <p class="text-sm text-slate-600">Container/grid/navbar come from UIkit.</p>
      </div>
      <div class="rounded-xl border border-slate-200 p-4">
        <img src="/img/starter-card-2.svg" alt="Tailwind utilities preview" class="mb-3 h-32 w-full rounded-lg object-cover">
        <h3 class="mb-2 text-lg font-semibold text-slate-900">Tailwind utilities</h3>
        <p class="text-sm text-slate-600">Typography, spacing and emphasis use utility classes.</p>
      </div>
      <div class="rounded-xl border border-slate-200 p-4">
        <img src="/img/starter-card-3.svg" alt="Workflow preview" class="mb-3 h-32 w-full rounded-lg object-cover">
        <h3 class="mb-2 text-lg font-semibold text-slate-900">Ready workflow</h3>
        <p class="text-sm text-slate-600">Use whichever system is faster for each block.</p>
      </div>
    </div>
    <ul uk-accordion class="mt-6">
      <li>
        <a class="uk-accordion-title" href="#faq-stack">What does Full preset combine?</a>
        <div class="uk-accordion-content">
          <p class="text-sm text-slate-600">UIkit components plus Tailwind utility classes in one starter.</p>
        </div>
      </li>
      <li>
        <a class="uk-accordion-title" href="#faq-edit">Can I use jQuery here?</a>
        <div class="uk-accordion-content">
          <p class="text-sm text-slate-600">Yes. Enable it during scaffold or pass <code>--jquery</code> in CLI.</p>
        </div>
      </li>
    </ul>
    <ul class="uk-tab mt-6" uk-tab>
      <li class="uk-active"><a href="#">Design system</a></li>
      <li><a href="#">Components</a></li>
      <li><a href="#">Workflow</a></li>
    </ul>
    <ul class="uk-switcher uk-margin">
      <li><p class="text-sm text-slate-600">Blend utility classes with UIkit primitives depending on section complexity.</p></li>
      <li><p class="text-sm text-slate-600">Use cards, accordion and modal as a baseline for interactive UI.</p></li>
      <li><p class="text-sm text-slate-600">Start with includes, then move page sections into reusable blocks.</p></li>
    </ul>
    <div class="mt-6 flex flex-wrap items-center gap-3">
      <div id="demo-console" data-state="off" class="rounded-lg bg-violet-50 px-4 py-2 text-sm text-violet-700">Interaction state: <strong id="demo-status">OFF</strong>${features.jquery ? ' (jQuery)' : ' (Vanilla JS)'}</div>
    </div>
  </section>
  <div id="demo-modal" uk-modal>
    <div class="uk-modal-dialog uk-modal-body uk-border-rounded">
      <h3 class="uk-modal-title">Full preset modal</h3>
      <p class="text-sm text-slate-600">Modal is included to demonstrate JS UI flow when UIkit is enabled.</p>
      <button class="uk-button uk-button-primary uk-modal-close" type="button">Close</button>
    </div>
  </div>
</main>
`;
  }

  return `<main id="main" class="demo-shell">
  <div class="container">
    <section class="demo-hero">
    <p class="demo-tag">Vanilla preset</p>
    <h1 class="demo-title">${heading}</h1>
    <p class="demo-subtitle">${subheading}</p>
    <div class="demo-hero-actions">
      <button id="demo-toggle" type="button" class="demo-button">${pageMeta.ctaLabel}</button>
      <a href="#features" class="demo-button-outline">${pageMeta.secondaryLabel}</a>
    </div>
    <div class="demo-visual">
      <img src="/img/starter-hero.svg" alt="Starter preview hero">
    </div>
    </section>
    <section id="features" class="demo-grid">
    <article class="demo-card">
      <img src="/img/starter-card-1.svg" alt="Semantic HTML preview">
      <h3>Semantic HTML</h3>
      <p>Lightweight structure ready for classic slicing flow.</p>
    </article>
    <article class="demo-card">
      <img src="/img/starter-card-2.svg" alt="SCSS architecture preview">
      <h3>SCSS architecture</h3>
      <p>Base/layout/vendors stack is connected and editable.</p>
    </article>
    <article class="demo-card">
      <img src="/img/starter-card-3.svg" alt="Instant start preview">
      <h3>Instant start</h3>
      <p>Open pages and start replacing demo blocks with project sections.</p>
    </article>
    </section>
    <section class="demo-faq">
      <details id="faq-stack">
        <summary>What is included in this preset?</summary>
        <p>Responsive layout, include-based components, SCSS architecture and interactive starter JS.</p>
      </details>
      <details id="faq-edit">
        <summary>How should I start customizing this template?</summary>
        <p>Edit includes in <code>src/components</code>, then replace the demo sections with your own blocks.</p>
      </details>
    </section>
    <div class="demo-actions">
    <div id="demo-console" data-state="off" class="demo-console">Interaction state: <strong id="demo-status">OFF</strong>${features.jquery ? ' (jQuery)' : ' (Vanilla JS)'}</div>
    </div>
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
  const hasExplicitInstallFlag = rawArgs.some((arg) => arg === '--install' || arg === '--no-install');
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

  const shouldInstall = hasExplicitInstallFlag
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
