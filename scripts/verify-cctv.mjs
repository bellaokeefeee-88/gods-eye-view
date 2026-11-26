#!/usr/bin/env node
/**
 * Free, read-only smoke test for the running GOD EYE VIEW CCTV API.
 *
 * Usage:
 *   node scripts/verify-cctv.mjs
 *   node scripts/verify-cctv.mjs --base-url https://your-codespace.app.github.dev
 *
 * This checks the app's own catalog/health/stream metadata endpoints. It does
 * not probe upstream camera hosts, bypass access controls, or claim that a
 * stream is live merely because a camera record exists.
 */
const args = process.argv.slice(2);
function option(name, fallback) {
  const index = args.indexOf(name);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
}
const baseUrl = option('--base-url', process.env.GEV_BASE_URL || 'http://localhost:4173').replace(/\/$/, '');
const jsonOnly = args.includes('--json');
const failures = [];
const checks = [];

async function getJson(pathname) {
  const response = await fetch(new URL(pathname, baseUrl), {
    headers: { accept: 'application/json' },
    signal: AbortSignal.timeout(12000),
    redirect: 'error',
  });
  const body = await response.text();
  if (!response.ok) throw new Error(`${pathname}: HTTP ${response.status}`);
  try {
    return JSON.parse(body);
  } catch {
    throw new Error(`${pathname}: response is not valid JSON`);
  }
}
function check(name, ok, detail) {
  checks.push({ name, ok, detail });
  if (!ok) failures.push(name);
}

try {
  const catalog = await getJson('/api/cctv/sources');
  const sources = Array.isArray(catalog.sources) ? catalog.sources : null;
  check('catalog-shape', !!sources, 'Expected { sources: [] }');
  if (!sources) throw new Error('CCTV catalog response has no sources array');

  const invalid = sources.filter((s) =>
    !s || typeof s.id !== 'string' || !s.id.trim()
    || !Number.isFinite(Number(s.lat)) || !Number.isFinite(Number(s.lon))
    || Math.abs(Number(s.lat)) > 90 || Math.abs(Number(s.lon)) > 180
    || (Number(s.lat) === 0 && Number(s.lon) === 0)
  );
  check('camera-records-valid', invalid.length === 0,
    `${sources.length} records; ${invalid.length} invalid IDs/coordinates`);
  check('catalog-nonempty', sources.length > 0,
    `${sources.length} camera records returned`);

  const health = await getJson('/api/cctv/health');
  const healthRows = Array.isArray(health.cameras) ? health.cameras : null;
  check('health-shape', !!healthRows, 'Expected { cameras: [] }');

  const local = sources.filter((s) =>
    Number(s.lat) >= 5.35 && Number(s.lat) <= 5.75
    && Number(s.lon) >= 95.15 && Number(s.lon) <= 95.55
  );
  const packs = [...new Set(sources.map((s) => s.pack).filter(Boolean))].sort();
  const summary = {
    baseUrl,
    catalogCount: sources.length,
    invalidRecords: invalid.length,
    healthEntries: healthRows?.length ?? null,
    bandaAcehApproximateCoordinateMatches: local.length,
    packs,
    note: 'Coordinate matches are only a geographic filter, not proof that a camera belongs to Banda Aceh or is authorized/live.',
  };
  if (!jsonOnly) {
    console.log('GOD EYE VIEW — CCTV FREE VERIFICATION');
    console.log(JSON.stringify(summary, null, 2));
    for (const item of checks) console.log(`${item.ok ? 'PASS' : 'FAIL'} ${item.name}: ${item.detail}`);
    console.log('NOTE: catalog presence and health metadata do not prove video playback.');
  } else {
    console.log(JSON.stringify({ summary, checks }, null, 2));
  }
} catch (error) {
  failures.push(error.message);
  if (jsonOnly) console.log(JSON.stringify({ baseUrl, failures, checks }, null, 2));
  else console.error(`FAIL CCTV API verification: ${error.message}`);
}

if (failures.length) process.exitCode = 1;
