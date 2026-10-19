// HTML templates. Each returns a full page as a string. `site` is site/site.json, `app` is an app's app.json plus `slug`.

export const esc = (s = '') =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const BAR_COLORS = ['pink', 'orange', 'yellow', 'green', 'blue', 'purple'];
const bars = (cls) => `<span class="${cls}" aria-hidden="true">${'<i></i>'.repeat(cls === 'bars' ? 7 : 6)}</span>`;
const brand = 'Tuned <em>Echo</em><span class="tm">™</span>';

const STATUS_LABELS = {
  available: 'On the App Store',
  beta: 'In beta',
  'coming-soon': 'Coming soon',
  showcase: 'Project',
};

// Where analytics cookies wait for consent: the EU, the rest of the EEA, the UK and Switzerland.
// Google applies this by the visitor's IP address, so it holds even when the banner's guess (site/consent.js) is wrong.
const CONSENT_REGIONS = ['AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU',
  'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'IS', 'LI', 'NO', 'GB', 'CH'];

/** Google Analytics tag with consent defaults, and the cookie banner script. Goes first in <head> on every page; scripts/build.mjs checks that it's there. */
export const googleTag = (site) => `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${site.googleTagId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('consent', 'default', {analytics_storage: 'denied', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', region: ${JSON.stringify(CONSENT_REGIONS).replace(/"/g, "'")}});
  try { if (localStorage.getItem('te-consent') === 'granted') gtag('consent', 'update', {analytics_storage: 'granted'}); } catch (e) {}
  gtag('js', new Date());

  gtag('config', '${site.googleTagId}');
</script>
<script src="${site.base}/consent.js?v=${site.assetVersion || 1}" data-privacy="${site.base}/privacy/" defer></script>
`;

export const statusLabel = (app) => app.statusLabel || STATUS_LABELS[app.status];

function accentStyle(app) {
  if (!app?.accent) return '';
  const dark = app.accentDark || app.accent;
  return `<style>:root{--accent:${app.accent}}@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){--accent:${dark}}}:root[data-theme="dark"]{--accent:${dark}}</style>`;
}

// The same menu as tunedecho.com, so the two sites read as one. Section links go to the home page; Apps stays here.
const MAIN_NAV = [['Services', '#services'], ['Method', '#method'], ['Work', '#work'], ['Apps', null], ['About', '#about'], ['Story', '#story'], ['Contact', '#contact']];
function mainNav(site, path) {
  return MAIN_NAV.map(([label, hash]) => {
    if (!hash) return `      <li><a href="${site.base}/"${path === site.base + '/' ? ' aria-current="page"' : ''}>${label}</a></li>`;
    return `      <li><a href="${esc(site.home + hash)}">${label}</a></li>`;
  }).join('\n');
}

function layout({ site, title, description, path, app, icon, body }) {
  const url = site.url + path;
  return `<!doctype html>
<html lang="en">
<head>
${site.googleTagId ? googleTag(site) : ''}<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(url)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:type" content="website">
${icon ? `<meta property="og:image" content="${esc(site.url + icon)}">\n<link rel="icon" href="${esc(icon)}">\n<link rel="apple-touch-icon" href="${esc(icon)}">` : `<link rel="icon" href="${site.base}/assets/seal.svg" type="image/svg+xml">`}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Oswald:wght@400;500&family=Plus+Jakarta+Sans:wght@400;500;600&display=swap">
<link rel="stylesheet" href="${site.base}/styles.css?v=${site.assetVersion || 1}">
${accentStyle(app)}
</head>
<body>
<header class="wrap">
  <nav class="nav" aria-label="Primary">
    <a class="brand" href="${esc(site.home)}">${brand}</a>
    <ul>
${mainNav(site, path)}
    </ul>
  </nav>
</header>
<main>
${body}
</main>
<div class="wrap">${bars('rule')}</div>
<footer class="wrap">
  <span>© ${site.year} Tuned Echo Systems LLC</span>
  <span><a href="${site.base}/">All apps</a> · <a href="${site.base}/privacy/">Privacy</a><span data-consent-choices hidden> · <button type="button" class="linkish">Cookie choices</button></span> · <a href="${esc(site.home)}">tunedecho.com</a></span>
  <p class="legal">Tuned Echo is a trademark of Tuned Echo Systems LLC. Apple, the Apple logo, Apple Music and iPhone are trademarks of Apple Inc.</p>
</footer>
</body>
</html>
`;
}

function statusButton(app) {
  const { status, links = {} } = app;
  if (status === 'available') return `<a class="btn primary" href="${esc(links.appStore)}">Download on the App Store</a>`;
  if (status === 'beta') return `<a class="btn primary" href="${esc(links.testFlight)}">Join the beta on TestFlight</a>`;
  if (status === 'coming-soon') return `<span class="status">${esc(statusLabel(app))}</span>`;
  return '';
}

function subnav(site, app, pages, current) {
  const items = [{ name: '', title: 'Overview' }, ...pages];
  const links = items.map((p) => {
    const href = `${site.base}/${app.slug}/${p.name ? p.name + '/' : ''}`;
    return `<li><a href="${href}"${p.name === current ? ' aria-current="page"' : ''}>${esc(p.title)}</a></li>`;
  });
  return `<nav class="subnav" aria-label="${esc(app.name)}"><div class="wrap"><ul>${links.join('')}</ul></div></nav>`;
}

export function indexPage({ site, apps }) {
  const cards = apps.map((app) => `
    <li class="card" style="--accent:${esc(app.accent || 'var(--ink)')}">
      <img class="card-icon" src="${site.base}/${app.slug}/icon.png" alt="" width="72" height="72" loading="lazy">
      <div>
        <h3><a href="${site.base}/${app.slug}/">${esc(app.name)}</a></h3>
        <p>${esc(app.tagline)}</p>
        ${STATUS_LABELS[app.status] && app.status !== 'showcase' ? `<span class="status small">${esc(STATUS_LABELS[app.status])}</span>` : ''}
      </div>
    </li>`).join('');
  const { work, appsIntro } = site;
  const workItems = (work?.items || []).map((w, i) => `
      <li class="feature"><span class="dot" style="background:var(--${BAR_COLORS[i % BAR_COLORS.length]})"></span><h3>${esc(w.title)}</h3><p>${esc(w.body)}</p></li>`).join('');
  const demoHref = work?.demoEmail ? `mailto:${work.demoEmail}?subject=${encodeURIComponent('Demo request')}` : '';
  const body = `
<section class="wrap index-hero">
  <h1 class="wordmark"><span class="wm-text">Tuned <em>Echo</em> Apps</span>${bars('bars')}</h1>
  <p class="tagline">${esc(site.tagline)}</p>
  <p class="lede">${esc(site.lede)}</p>
  ${demoHref ? `<div class="cta"><a class="btn primary" href="${esc(demoHref)}">Request a demo</a>${work.methodLink ? `<a class="btn ghost" href="${esc(work.methodLink)}">How we work</a>` : ''}</div>` : ''}
</section>
${work ? `<section class="wrap work" aria-labelledby="work-h">
  <p class="eyebrow">${esc(work.eyebrow)}</p>
  <h2 id="work-h">${esc(work.heading)}</h2>
  ${work.intro ? `<p class="intro">${esc(work.intro)}</p>` : ''}
  <ul class="features">${workItems}
  </ul>
  ${work.demoBody ? `<hr class="sep">
  <div class="demo">
    <p class="demo-label">${esc(work.demoHeading || 'Demos by request')}</p>
    <p>${esc(work.demoBody)}</p>
  </div>` : ''}
</section>` : ''}
<section class="${work ? 'alt' : ''}" aria-labelledby="apps-h"><div class="wrap">
  ${appsIntro ? `<p class="eyebrow">${esc(appsIntro.eyebrow)}</p>
  <h2 id="apps-h">${esc(appsIntro.heading)}</h2>
  <p class="intro">${esc(appsIntro.body)}</p>` : '<h2 id="apps-h" class="visually-hidden">Apps</h2>'}
  <ul class="cards">${cards}
  </ul>
</div></section>`;
  return layout({ site, title: site.title, description: site.description || site.lede, path: site.base + '/', body });
}

export function appPage({ site, app, pages, contentHtml, contentHeading, screenshots }) {
  const icon = `${site.base}/${app.slug}/icon.png`;
  const features = (app.features || []).map((f, i) => `
      <li class="feature"><span class="dot" style="background:var(--${BAR_COLORS[i % BAR_COLORS.length]})"></span><h3>${esc(f.title)}</h3><p>${esc(f.body)}</p></li>`).join('');
  const steps = (app.steps || []).map((s) => `
      <li><span class="n">Step </span><h3>${esc(s.title)}</h3><p>${esc(s.body)}</p></li>`).join('');
  const shots = screenshots.map((src) => `<img src="${esc(src)}" alt="${esc(app.name)} screenshot" loading="lazy">`).join('');
  const meta = [app.platforms?.join(', '), app.requires].filter(Boolean).join(' · ');

  const body = `
<section class="wrap app-hero">
  <div class="app-hero-grid">
    <img class="app-icon" src="${icon}" alt="${esc(app.name)} app icon" width="176" height="176">
    <div>
      ${meta ? `<p class="eyebrow">${esc(meta)}</p>` : ''}
      <h1>${esc(app.name)}</h1>
      <p class="tagline">${esc(app.tagline)}</p>
      ${app.summary ? `<p class="lede">${esc(app.summary)}</p>` : ''}
      <div class="cta">${statusButton(app)}${pages.some((p) => p.name === 'guide') ? `<a class="btn ghost" href="${site.base}/${app.slug}/guide/">Read the guide</a>` : ''}</div>
    </div>
  </div>
</section>
${subnav(site, app, pages, '')}
${steps ? `<section class="wrap"><p class="eyebrow">How it works</p><h2>${esc(app.stepsHeading || 'How it works')}</h2><ol class="steps">${steps}
  </ol></section>` : ''}
${features ? `<section class="alt"><div class="wrap"><p class="eyebrow">Features</p><h2>${esc(app.featuresHeading || 'What it does')}</h2><ul class="features">${features}
  </ul></div></section>` : ''}
${shots ? `<section class="wrap"><p class="eyebrow">Screenshots</p><div class="shots">${shots}</div></section>` : ''}
${contentHtml ? `<section class="wrap">${contentHeading ? `<p class="eyebrow">${esc(contentHeading)}</p>` : ''}<div class="prose">${contentHtml}</div></section>` : ''}`;
  return layout({ site, title: `${app.name} · Tuned Echo`, description: app.tagline, path: `${site.base}/${app.slug}/`, app, icon, body });
}

export function subPage({ site, app, pages, page, html }) {
  const icon = `${site.base}/${app.slug}/icon.png`;
  const body = `
<section class="wrap page-head">
  <a class="app-line" href="${site.base}/${app.slug}/"><img src="${icon}" alt="" width="28" height="28">${esc(app.name)}</a>
  <h1>${esc(page.title)}</h1>
  ${page.updated ? `<p class="updated">Last updated ${esc(page.updated)}</p>` : ''}
</section>
<div style="margin-top:2rem">${subnav(site, app, pages, page.name)}</div>
<section class="wrap"><div class="prose">${html}</div></section>`;
  return layout({
    site,
    title: `${page.title} · ${app.name}`,
    description: page.description || `${page.title} for ${app.name}, an app by Tuned Echo.`,
    path: `${site.base}/${app.slug}/${page.name}/`,
    app,
    icon,
    body,
  });
}

export function sitePage({ site, page, html }) {
  const body = `
<section class="wrap page-head">
  <h1>${esc(page.title)}</h1>
  ${page.updated ? `<p class="updated">Last updated ${esc(page.updated)}</p>` : ''}
</section>
<section class="wrap"><div class="prose">${html}</div></section>`;
  return layout({ site, title: `${page.title} · ${site.title}`, description: page.description || site.description, path: `${site.base}/${page.name}/`, body });
}

export function redirectPage(to, origin = '') {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Redirecting</title>
<link rel="canonical" href="${esc(origin + to)}">
<meta name="robots" content="noindex">
<meta http-equiv="refresh" content="0; url=${esc(to)}">
</head>
<body><p><a href="${esc(to)}">${esc(to)}</a></p></body>
</html>
`;
}

export function notFoundPage({ site, apps }) {
  const slugs = JSON.stringify(apps.map((a) => a.slug));
  const body = `
<section class="wrap page-head">
  <h1>Page not found</h1>
</section>
<section class="wrap"><div class="prose">
  <p>There is no page at this address. <a href="${site.base}/">See all apps</a>.</p>
</div></section>
<script>
// Fix the letter case of an app name in the address, e.g. /apps/dialupsoundz/guide/ to /apps/DialUpSoundz/guide/.
(function () {
  var base = ${JSON.stringify(site.base)}, slugs = ${slugs};
  var path = location.pathname;
  if (path.toLowerCase().indexOf(base.toLowerCase() + '/') !== 0) return;
  var parts = path.slice(base.length + 1).split('/');
  var match = slugs.filter(function (s) { return s.toLowerCase() === (parts[0] || '').toLowerCase(); })[0];
  if (!match) return;
  var rest = parts.slice(1).join('/').toLowerCase();
  var to = base + '/' + match + '/' + rest;
  if (to !== path) location.replace(to + location.search + location.hash);
})();
</script>`;
  return layout({ site, title: `Not found · ${site.title}`, description: site.description, path: `${site.base}/404.html`, body });
}
