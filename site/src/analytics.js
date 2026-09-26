// analytics.js: named game events for PostHog (loaded by ../posthog.js, live site only). A no-op when PostHog isn't
// there (local preview, ad blocker), so the game never depends on it.
export function track(event, props) {
  try { window.posthog?.capture?.(event, props); } catch {}
}
// every event after this carries site_version (PostHog super property), so a change can be read version by version
export function setVersion(v) {
  try { window.posthog?.register?.({ site_version: v }); } catch {}
}
