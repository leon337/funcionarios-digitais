'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const statusHandler = require('../api/meta/status');
const facebookPublishHandler = require('../api/meta/facebook/publish');
const instagramContainerHandler = require('../api/meta/instagram/container');
const instagramPublishHandler = require('../api/meta/instagram/publish');
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


test('Facebook Page publication uses only the configured server token and returns the post ID', async () => withEnv({
  META_ADMIN_TOKEN: 'admin-token-for-test',
  META_PAGE_ID: '112233445566',
  META_PAGE_ACCESS_TOKEN: 'page-token-for-test',
  META_GRAPH_API_VERSION: 'v26.0'
}, async () => {
  const oldFetch = global.fetch;
  let captured;
  global.fetch = async (url, options) => {
    captured = { url: String(url), options };
    return { ok: true, status: 200, json: async () => ({ id: '112233445566_778899' }) };
  };
  try {
    const res = responseMock();
    await facebookPublishHandler({
      method: 'POST',
      headers: { authorization: 'Bearer admin-token-for-test' },
      body: { message: 'Post de teste simulado', link: 'https://example.org/offer' }
    }, res);
    assert.equal(res.statusCode, 201);
    assert.equal(res.data.id, '112233445566_778899');
    assert.match(captured.url, /graph\.facebook\.com\/v26\.0\/112233445566\/feed$/);
    assert.equal(captured.options.method, 'POST');
    assert.equal(captured.options.headers.Authorization, 'Bearer page-token-for-test');
    assert.match(captured.options.body, /message=Post/);
    assert.match(captured.options.body, /link=https%3A%2F%2Fexample.org%2Foffer/);
  } finally {
    global.fetch = oldFetch;
  }
}));

test('Instagram status query and media publishing flow work with mocked Graph API responses', async () => withEnv({
  META_ADMIN_TOKEN: 'admin-token-for-test',
  META_IG_USER_ID: '998877665544',
  META_IG_ACCESS_TOKEN: 'ig-token-for-test',
  META_GRAPH_API_VERSION: 'v26.0'
}, async () => {
  const oldFetch = global.fetch;
  const calls = [];
  global.fetch = async (url, options) => {
    calls.push({ url: String(url), options });
    if (calls.length === 1) return { ok: true, status: 200, json: async () => ({ status_code: 'FINISHED', status: 'Finished' }) };
    return { ok: true, status: 200, json: async () => ({ id: '998877665544_123456' }) };
  };
  try {
    const res = responseMock();
    await instagramPublishHandler({
      method: 'POST',
      headers: { authorization: 'Bearer admin-token-for-test' },
      body: { creationId: '1234567890123' }
    }, res);
    assert.equal(res.statusCode, 201);
    assert.equal(res.data.id, '998877665544_123456');
    assert.match(calls[0].url, /1234567890123\?fields=status_code,status$/);
    assert.match(calls[1].url, /998877665544\/media_publish$/);
    assert.equal(calls[1].options.method, 'POST');
  } finally {
    global.fetch = oldFetch;
  }
}));

test('Instagram cannot publish a container that is not finished', async () => withEnv({
  META_ADMIN_TOKEN: 'admin-token-for-test',
  META_IG_USER_ID: '998877665544',
  META_IG_ACCESS_TOKEN: 'ig-token-for-test'
}, async () => {
  const oldFetch = global.fetch;
  let count = 0;
  global.fetch = async () => {
    count += 1;
    return { ok: true, status: 200, json: async () => ({ status_code: 'IN_PROGRESS', status: 'Media is being processed' }) };
  };
  try {
    const res = responseMock();
    await instagramPublishHandler({
      method: 'POST',
      headers: { authorization: 'Bearer admin-token-for-test' },
      body: { creationId: '1234567890123' }
    }, res);
    assert.equal(res.statusCode, 409);
    assert.equal(res.data.error, 'container_not_ready');
    assert.equal(count, 1);
  } finally {
    global.fetch = oldFetch;
  }
}));

test('WhatsApp message sending path formats a single-recipient request without using a real network call', async () => withEnv({
  META_ADMIN_TOKEN: 'admin-token-for-test',
  META_WA_PHONE_NUMBER_ID: '123456789012345',
  META_WA_ACCESS_TOKEN: 'wa-token-for-test',
  META_GRAPH_API_VERSION: 'v26.0'
}, async () => {
  const oldFetch = global.fetch;
  let captured;
  global.fetch = async (url, options) => {
    captured = { url: String(url), options };
    return { ok: true, status: 200, json: async () => ({ messages: [{ id: 'wamid.test' }] }) };
  };
  try {
    const res = responseMock();
    await whatsappMessageHandler({
      method: 'POST',
      headers: { authorization: 'Bearer admin-token-for-test' },
      body: { to: '+55 (81) 99999-9999', text: 'Mensagem simulada; não enviada' }
    }, res);
    assert.equal(res.statusCode, 202);
    assert.equal(res.data.messageId, 'wamid.test');
    assert.match(captured.url, /123456789012345\/messages$/);
    assert.equal(captured.options.method, 'POST');
    const sent = JSON.parse(captured.options.body);
    assert.equal(sent.to, '5581999999999');
    assert.equal(sent.text.body, 'Mensagem simulada; não enviada');
    assert.equal(captured.options.headers.Authorization, 'Bearer wa-token-for-test');
  } finally {
    global.fetch = oldFetch;
  }
}));
