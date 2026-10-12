'use strict';

const crypto = require('node:crypto');

function config() {
  const version = process.env.META_GRAPH_API_VERSION || 'v26.0';
  return {
    adminToken: process.env.META_ADMIN_TOKEN || '',
    appId: process.env.META_APP_ID || '',
    appSecret: process.env.META_APP_SECRET || '',
    webhookVerifyToken: process.env.META_WEBHOOK_VERIFY_TOKEN || '',
    graphVersion: /^v\d+\.\d+$/.test(version) ? version : 'v26.0',
    pageId: process.env.META_PAGE_ID || '',
    pageAccessToken: process.env.META_PAGE_ACCESS_TOKEN || '',
    instagramUserId: process.env.META_IG_USER_ID || '',
    instagramAccessToken: process.env.META_IG_ACCESS_TOKEN || '',
    whatsappPhoneNumberId: process.env.META_WA_PHONE_NUMBER_ID || '',
    whatsappAccessToken: process.env.META_WA_ACCESS_TOKEN || ''
  };
}

function sendJson(res, status, payload) {
  return res.status(status).json(payload);
}

function constantTimeEqual(left, right) {
  if (typeof left !== 'string' || typeof right !== 'string' || !left || !right) return false;
  const a = Buffer.from(left, 'utf8');
  const b = Buffer.from(right, 'utf8');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function requireAdmin(req, res) {
  const expected = config().adminToken;
  if (!expected) {
    sendJson(res, 503, { error: 'integration_not_configured', message: 'Configure META_ADMIN_TOKEN no ambiente do servidor.' });
    return false;
  }
  const header = req.headers && req.headers.authorization;
  const match = typeof header === 'string' && header.match(/^Bearer\s+(.+)$/i);
  if (!match || !constantTimeEqual(match[1].trim(), expected)) {
    sendJson(res, 401, { error: 'unauthorized', message: 'Token administrativo ausente ou inválido.' });
    return false;
  }
  return true;
}

function requestBody(req) {
  if (req && req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) return req.body;
  if (typeof (req && req.body) === 'string') {
    try { return JSON.parse(req.body); } catch { return null; }
  }
  return null;
}

function isPublicHttpsUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) return false;
    const hostname = url.hostname.toLowerCase();
    if (hostname === 'localhost' || hostname === '::1' || hostname.endsWith('.local')) return false;
    if (/^(127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(hostname)) return false;
    if (/^172\.(1[6-9]|2\d|3[01])\./.test(hostname)) return false;
    return true;
  } catch {
    return false;
  }
}

async function graphRequest(path, options = {}) {
  const cfg = config();
  if (!/^\/[A-Za-z0-9_./-]+(?:\?[A-Za-z0-9_=,&%-]+)?$/.test(path) || path.includes('..')) {
    throw Object.assign(new Error('Caminho Graph API inválido.'), { status: 400 });
  }
  const headers = { Accept: 'application/json', ...(options.headers || {}) };
  if (options.token) headers.Authorization = 'Bearer ' + options.token;
  let body;
  if (options.form) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    body = new URLSearchParams(options.form).toString();
  } else if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.body);
  }

  const response = await fetch('https://graph.facebook.com/' + cfg.graphVersion + path, {
    method: options.method || 'GET',
    headers,
    body
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.error) {
    const message = payload.error && typeof payload.error.message === 'string'
      ? payload.error.message.slice(0, 500)
      : 'A Graph API recusou a solicitação.';
    throw Object.assign(new Error(message), {
      status: response.status >= 400 && response.status < 600 ? response.status : 502,
      metaCode: payload.error && payload.error.code
    });
  }
  return payload;
}

function routeError(res, error) {
  const status = Number.isInteger(error && error.status) ? error.status : 502;
  return sendJson(res, status, {
    error: status === 502 ? 'meta_api_error' : 'request_failed',
    message: error && error.message ? String(error.message).slice(0, 500) : 'Falha na integração Meta.'
  });
}

function verifyWebhookSignature(rawBody, signature, appSecret) {
  if (!Buffer.isBuffer(rawBody) || !signature || !appSecret) return false;
  const match = /^sha256=([a-f0-9]{64})$/i.exec(signature);
  if (!match) return false;
  const expected = crypto.createHmac('sha256', appSecret).update(rawBody).digest();
  const actual = Buffer.from(match[1], 'hex');
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

async function readRawBody(req, maxBytes = 1024 * 1024) {
  if (Buffer.isBuffer(req.rawBody)) {
    if (req.rawBody.length > maxBytes) throw Object.assign(new Error('Payload excede o limite.'), { status: 413 });
    return req.rawBody;
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > maxBytes) throw Object.assign(new Error('Payload excede o limite.'), { status: 413 });
    chunks.push(buffer);
  }
  return Buffer.concat(chunks);
}

module.exports = {
  config, sendJson, constantTimeEqual, requireAdmin, requestBody,
  isPublicHttpsUrl, graphRequest, routeError, verifyWebhookSignature, readRawBody
};
