// errors.js: the page's last errors (uncaught errors, unhandled rejections, console.error), kept in memory for Kob's
// bug reports so the bug desk sees what broke. main.js imports it first, so it catches everything after it. Nothing
// leaves the page unless a visitor sends a report.
const MAX = 20;
let list = [];
const push = s => { list = [...list, String(s).slice(0, 300)].slice(-MAX); };
const text = x => x instanceof Error ? `${x.name}: ${x.message}` : typeof x === 'string' ? x : (() => { try { return JSON.stringify(x); } catch { return String(x); } })();

addEventListener('error', e => push(e.error ? `${text(e.error)} (${(e.filename || '').split('/').pop()}:${e.lineno})` : e.message));
addEventListener('unhandledrejection', e => push(`unhandled rejection: ${text(e.reason)}`));
const consoleError = console.error.bind(console);
console.error = (...a) => { push(a.map(text).join(' ')); consoleError(...a); };

export const recentErrors = () => list;
