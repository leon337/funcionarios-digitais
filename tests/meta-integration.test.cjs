'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const statusHandler = require('../api/meta/status');
const facebookPublishHandler = require('../api/meta/facebook/publish');
const instagramContainerHandler = require('../api/meta/instagram/container');
const whatsappMessageHandler = require('../api/meta/whatsapp/messages');
const whatsappWebhookHandler = require('../api/meta/webhooks/whatsapp');

function responseMock() {
  return {
    statusCode: 200,
    headers: {},
    data: undefined,
    text: undefined,
    status(code) { this.statusCode = code; return this; },
    json(value) { this.data = value; return this; },
    send(value) { this.text = value; return this; },
    setHeader(name, value) { this.headers[name] = value; }
  };
}

async function withEnv(values, fn) {
  const previous = {};
  for (const [key, value] of Object.entries(values)) {
    previous[key] = process.env[key];
    if (value === undefined || value === null) delete process.env[key];
    else process.env[key] = value;
  }
  try { return await fn(); } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test('status endpoint exposes only flags and uses a valid default Graph version', async () => withEnv({
  META_GRAPH_API_VERSION: undefined,
  META_ADMIN_TOKEN: undefined,
  META_PAGE_ID: undefined,
  META_PAGE_ACCESS_TOKEN: undefined,
  META_IG_USER_ID: undefined,
  META_IG_ACCESS_TOKEN: undefined,
  META_WA_PHONE_NUMBER_ID: undefined,
  META_WA_ACCESS_TOKEN: undefined,
  META_APP_SECRET: undefined,
  META_WEBHOOK_VERIFY_TOKEN: undefined
}, async () => {
  const res = responseMock();
  statusHandler({ method: 'GET', headers: {} }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.data.graphApiVersion, 'v26.0');
  assert.equal(res.data.channels.facebookPagePublishing, false);
  assert.equal(res.data.channels.instagramImagePublishing, false);
  assert.equal(res.data.channels.whatsappCloudApi, false);
  assert.equal(JSON.stringify(res.data).includes('AccessToken'), false);
}));

test('status endpoint rejects methods other than GET', () => {
  const res = responseMock();
  statusHandler({ method: 'POST', headers: {} }, res);
  assert.equal(res.statusCode, 405);
  assert.equal(res.headers.Allow, 'GET');
});

test('publishing endpoint fails closed when admin secret is absent', async () => withEnv({
  META_ADMIN_TOKEN: undefined
}, async () => {
  const res = responseMock();
  await facebookPublishHandler({ method: 'POST', headers: {}, body: { message: 'Teste' } }, res);
  assert.equal(res.statusCode, 503);
  assert.equal(res.data.error, 'integration_not_configured');
}));

test('publishing endpoint rejects missing or incorrect admin bearer token', async () => withEnv({
  META_ADMIN_TOKEN: 'admin-token-for-test'
}, async () => {
  const res = responseMock();
  await instagramContainerHandler({ method: 'POST', headers: {}, body: { imageUrl: 'https://example.org/image.jpg' } }, res);
  assert.equal(res.statusCode, 401);
  assert.equal(res.data.error, 'unauthorized');
}));

test('Instagram refuses non-public or non-HTTPS media URLs', async () => withEnv({
  META_ADMIN_TOKEN: 'admin-token-for-test',
  META_IG_USER_ID: '123456789',
  META_IG_ACCESS_TOKEN: 'fake-token'
}, async () => {
  const res = responseMock();
  await instagramContainerHandler({
    method: 'POST',
    headers: { authorization: 'Bearer admin-token-for-test' },
    body: { imageUrl: 'http://localhost/private.jpg', caption: 'teste' }
  }, res);
  assert.equal(res.statusCode, 400);
  assert.equal(res.data.error, 'invalid_image_url');
}));

test('WhatsApp validates an individual recipient and malformed bodies', async () => withEnv({
  META_ADMIN_TOKEN: 'admin-token-for-test',
  META_WA_PHONE_NUMBER_ID: '12345678',
  META_WA_ACCESS_TOKEN: 'fake-token'
}, async () => {
  const invalidRecipient = responseMock();
  await whatsappMessageHandler({
    method: 'POST',
    headers: { authorization: 'Bearer admin-token-for-test' },
    body: { to: '55abc', text: 'Teste' }
  }, invalidRecipient);
  assert.equal(invalidRecipient.statusCode, 400);
  assert.equal(invalidRecipient.data.error, 'invalid_recipient');

  const malformed = responseMock();
  await whatsappMessageHandler({
    method: 'POST',
    headers: { authorization: 'Bearer admin-token-for-test' },
    body: null
  }, malformed);
  assert.equal(malformed.statusCode, 400);
}));

test('WhatsApp webhook handshake returns challenge only for the configured verify token', async () => withEnv({
  META_WEBHOOK_VERIFY_TOKEN: 'verify-token-for-test'
}, async () => {
  const good = responseMock();
  await whatsappWebhookHandler({
    method: 'GET',
    headers: { host: 'example.org' },
    url: '/api/meta/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=verify-token-for-test&hub.challenge=12345'
  }, good);
  assert.equal(good.statusCode, 200);
  assert.equal(good.text, '12345');

  const bad = responseMock();
  await whatsappWebhookHandler({
    method: 'GET',
    headers: { host: 'example.org' },
    url: '/api/meta/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=12345'
  }, bad);
  assert.equal(bad.statusCode, 403);
}));

test('WhatsApp webhook accepts signed payload and rejects tampered signature', async () => withEnv({
  META_APP_SECRET: 'secret-for-test'
}, async () => {
  const raw = Buffer.from('{"object":"whatsapp_business_account","entry":[]}');
  const valid = 'sha256=' + crypto.createHmac('sha256', process.env.META_APP_SECRET).update(raw).digest('hex');
  const ok = responseMock();
  await whatsappWebhookHandler({
    method: 'POST',
    headers: { 'x-hub-signature-256': valid },
    rawBody: raw
  }, ok);
  assert.equal(ok.statusCode, 200);
  assert.deepEqual(ok.data, { received: true });

  const bad = responseMock();
  await whatsappWebhookHandler({
    method: 'POST',
    headers: { 'x-hub-signature-256': 'sha256=' + '0'.repeat(64) },
    rawBody: raw
  }, bad);
  assert.equal(bad.statusCode, 401);
  assert.equal(bad.data.error, 'invalid_webhook_signature');
}));
