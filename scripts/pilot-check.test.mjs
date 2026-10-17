import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inspectPilotEnvironment } from './pilot-check.mjs';
const configured = {
  DATABASE_URL: 'postgresql://openpims_app:synthetic-secret@localhost/pilot',
  NEXTAUTH_SECRET: 'synthetic-test-secret-not-for-use-in-any-real-app',
  NEXTAUTH_URL: 'http://localhost:3001', NEXT_PUBLIC_APP_URL: 'http://localhost:3001',
  S3_ENDPOINT: 'http://localhost:9000', S3_ACCESS_KEY: 'synthetic-access', S3_SECRET_KEY: 'synthetic-secret', S3_BUCKET: 'pilot', S3_REGION: 'local',
};
test('missing required configuration fails without dumping values', () => {
  assert.equal(inspectPilotEnvironment({}).configurationValid, false);
  const out = JSON.stringify(inspectPilotEnvironment(configured));
  assert.equal(out.includes('synthetic-secret'), false);
  assert.equal(out.includes('synthetic-access'), false);
});
test('disabled AI does not claim pilot readiness', () => {
  const out = inspectPilotEnvironment(configured);
  assert.equal(out.configurationValid, true);
  assert.equal(out.aiTextEnabled, false);
  assert.equal(out.livePilotReady, false);
});
test('enabled AI needs its own provider key', () => {
  const env = { ...configured, AI_TEXT_ENABLED: 'true', AI_MODEL: 'gemini-2.5-flash', ANTHROPIC_API_KEY: 'synthetic' };
  assert.equal(inspectPilotEnvironment(env).configurationValid, false);
  env.GOOGLE_GENERATIVE_AI_API_KEY = 'synthetic-key';
  assert.equal(inspectPilotEnvironment(env).configurationValid, true);
});
test('rejects example auth secret, mismatched origins, provider URLs and unsafe flags', () => {
  for (const patch of [
    { NEXTAUTH_SECRET: 'generate-a-secret-with-openssl-rand-base64-32' },
    { NEXTAUTH_SECRET: 'docker-dev-secret-change-in-production' },
    { NEXT_PUBLIC_APP_URL: 'https://different.invalid' },
    { AI_TEXT_ENABLED: 'true', AI_MODEL: 'https://unapproved.invalid' },
    { AI_TEXT_ENABLED: 'yes' },
    { NEXT_PUBLIC_DEMO_MODE: 'true' },
    { OPENVPM_EXPOSE_AUTH_LINKS: 'true' },
    { SKIP_RLS_BOOT_ASSERTION: 'true' },
  ]) assert.equal(inspectPilotEnvironment({ ...configured, ...patch }).configurationValid, false);
});
