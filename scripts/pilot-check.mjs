#!/usr/bin/env node
import { pathToFileURL } from 'node:url';

/** Configuration-only preflight. Does not connect, deploy or print env values. */
export function inspectPilotEnvironment(env = process.env) {
  const checks = [];
  const value = (name) => env[name]?.trim() || '';
  const add = (id, status, message) => checks.push({ id, status, message });
  const requireValue = (name) => {
    if (!value(name)) add(name, 'FAIL', `Set ${name} in the server environment.`);
    else add(name, 'CONFIGURED', `${name} is present; not connectivity-tested.`);
  };
  requireValue('DATABASE_URL');
  if (value('DATABASE_URL')) {
    try {
      const url = new URL(value('DATABASE_URL'));
      if (!['postgres:', 'postgresql:'].includes(url.protocol)) throw new Error();
      if (['openpims', 'postgres'].includes(url.username)) add('DB_ROLE', 'WARN', 'Owner/default DB role: use and live-test openpims_app for pilot isolation.');
      else add('DB_ROLE', 'UNVERIFIED', 'Verify actual role is non-owner, non-superuser and has no BYPASSRLS.');
    } catch { add('DATABASE_URL_FORMAT', 'FAIL', 'DATABASE_URL must be a valid Postgres connection URL.'); }
  }
  if (!value('NEXTAUTH_SECRET') || value('NEXTAUTH_SECRET').length < 32 || /generate-a-secret|change.?me|example|docker-dev-secret/i.test(value('NEXTAUTH_SECRET'))) add('NEXTAUTH_SECRET', 'FAIL', 'Generate a unique NEXTAUTH_SECRET of at least 32 characters; do not use the example value.');
  else add('NEXTAUTH_SECRET', 'CONFIGURED', 'Secret present; uniqueness/entropy not tested.');
  for (const key of ['NEXTAUTH_URL', 'NEXT_PUBLIC_APP_URL']) {
    if (!value(key)) { add(key, 'FAIL', `Set ${key} to the browser-facing app origin.`); continue; }
    try {
      const url = new URL(value(key));
      if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.search || url.hash || url.pathname !== '/') throw new Error();
      add(key, url.protocol === 'http:' ? 'WARN' : 'CONFIGURED', url.protocol === 'http:' ? 'HTTP is local-only; pilot ingress requires HTTPS.' : 'Origin configured; TLS not tested.');
    } catch { add(key, 'FAIL', `${key} must be an HTTP(S) origin without credentials, path or query.`); }
  }
  if (value('NEXTAUTH_URL') && value('NEXT_PUBLIC_APP_URL') && value('NEXTAUTH_URL').replace(/\/$/, '') !== value('NEXT_PUBLIC_APP_URL').replace(/\/$/, '')) add('APP_ORIGINS', 'FAIL', 'Auth and browser-facing app origins disagree.');
  for (const key of ['S3_ENDPOINT', 'S3_ACCESS_KEY', 'S3_SECRET_KEY', 'S3_BUCKET', 'S3_REGION']) requireValue(key);
  if (value('S3_ACCESS_KEY') === 'openpims' || value('S3_SECRET_KEY') === 'openpims123') add('STORAGE_DEFAULTS', 'WARN', 'Example MinIO credentials are local-only; replace for shared/pilot infrastructure.');
  const enabled = value('AI_TEXT_ENABLED') === 'true';
  if (value('AI_TEXT_ENABLED') && !['true', 'false'].includes(value('AI_TEXT_ENABLED'))) add('AI_FLAG', 'FAIL', 'AI_TEXT_ENABLED accepts true or false, not yes/1.');
  if (!enabled) add('AI', 'DISABLED', 'Text generation disabled. This is not a failure of the core PIMS.');
  else {
    const model = value('AI_MODEL') || value('AGENT_MODEL') || 'claude-sonnet-4-6';
    const key = /^claude-[a-z0-9.-]+$/i.test(model) ? 'ANTHROPIC_API_KEY' : /^gemini-[a-z0-9.-]+$/i.test(model) ? 'GOOGLE_API_KEY' : /^(gpt-[a-z0-9.-]+|o[134](?:-[a-z0-9.-]+)?)$/i.test(model) ? 'OPENAI_API_KEY' : null;
    if (!key) add('AI_MODEL', 'FAIL', 'Use a supported bare model ID, not a URL or provider-prefixed name.');
    else {
      const credential = value(key) || (key === 'GOOGLE_API_KEY' ? value('GOOGLE_GENERATIVE_AI_API_KEY') : '');
      add('AI_KEY', !credential || /^(sk-\.\.\.|sk-ant-\.\.\.|AIza\.\.\.)$/.test(credential) ? 'FAIL' : 'CONFIGURED', `Matching ${key} (or documented Google fallback) required; provider validity not tested.`);
    }
    add('AI_CONFIGURATION_SOURCE', 'UNVERIFIED', 'Cross-check ai.configuration / AI Settings; database model rows and client keys are not used.');
  }
  if (value('HOSTED_BILLING_ENABLED') === 'true') add('HOSTED', 'UNVERIFIED', 'Follow docs/hosted-cloud-production.md; Stripe, email, ops, storage and deployed health checks are additionally required.');
  if (value('NEXT_PUBLIC_DEMO_MODE') === 'true' || value('OPENVPM_EXPOSE_AUTH_LINKS') === 'true' || value('SKIP_RLS_BOOT_ASSERTION') === 'true') add('UNSAFE_PILOT_FLAGS', 'FAIL', 'Demo login, exposed auth links or skipped RLS assertions must not be enabled for live data.');
  return { configurationValid: !checks.some((c) => c.status === 'FAIL'), aiTextEnabled: enabled, livePilotReady: false, checks, note: 'Presence checks only. Local HTTP, two-tenant RLS, restore, provider smoke and clinical review remain required.' };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = inspectPilotEnvironment();
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = result.configurationValid ? 0 : 1;
}
