// Cookie banner for visitors in Europe. Static hosting can't see where a visitor is, so this guesses from the browser's
// time zone. The real safeguard is the consent default in the Google tag (site/templates.mjs): Google keeps analytics
// cookies off in the EEA, UK and Switzerland, by IP address, until the visitor accepts here.
(function () {
  var KEY = 'te-consent';
  var tz = '';
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
  if (!/^(Europe\/|Atlantic\/(Canary|Madeira|Azores|Faroe|Reykjavik)|Arctic\/Longyearbyen)/.test(tz)) return;

  var privacy = (document.currentScript && document.currentScript.getAttribute('data-privacy')) || 'privacy/';
  var stored = null;
  try { stored = localStorage.getItem(KEY); } catch (e) {}

  var bar = document.createElement('div');
  bar.className = 'consent';
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', 'Cookies');
  bar.innerHTML = '<p>We use Google Analytics cookies to count visits. <a href="' + privacy + '">More</a></p>' +
    '<button type="button" data-v="granted">Accept</button><button type="button" data-v="denied">Decline</button>';

  function choose(v) {
    try { localStorage.setItem(KEY, v); } catch (e) {}
    if (window.gtag) gtag('consent', 'update', { analytics_storage: v });
    if (v === 'denied') {
      // Remove analytics cookies set by an earlier "Accept".
      document.cookie.split(';').forEach(function (c) {
        var name = c.split('=')[0].trim();
        if (name.indexOf('_ga') !== 0) return;
        var host = location.hostname, parts = host.split('.');
        [host, '.' + parts.slice(-2).join('.')].forEach(function (d) {
          document.cookie = name + '=; Max-Age=0; path=/; domain=' + d;
        });
        document.cookie = name + '=; Max-Age=0; path=/';
      });
    }
    bar.hidden = true;
  }
  bar.addEventListener('click', function (e) {
    var v = e.target.getAttribute && e.target.getAttribute('data-v');
    if (v) choose(v);
  });

  function ready() {
    if (!stored) document.body.appendChild(bar);
    var link = document.querySelector('[data-consent-choices]');
    if (link) {
      link.hidden = false;
      link.querySelector('button').addEventListener('click', function () {
        if (!bar.parentNode) document.body.appendChild(bar);
        bar.hidden = false;
        bar.querySelector('button').focus();
      });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else ready();
})();
