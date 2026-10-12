'use strict';

const {
  config, sendJson, constantTimeEqual, verifyWebhookSignature, readRawBody
} = require('../../_lib/meta');

function queryValue(req, name) {
  const parsed = req.query && req.query[name];
  if (typeof parsed === 'string') return parsed;
  try {
    return new URL(req.url, 'https://' + (req.headers.host || 'localhost')).searchParams.get(name) || '';
  } catch {
    return '';
  }
}

module.exports = async function whatsappWebhook(req, res) {
  const cfg = config();

  if (req.method === 'GET') {
    const mode = queryValue(req, 'hub.mode');
    const token = queryValue(req, 'hub.verify_token');
    const challenge = queryValue(req, 'hub.challenge');
    if (mode === 'subscribe' && cfg.webhookVerifyToken &&
        constantTimeEqual(token, cfg.webhookVerifyToken) && challenge) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.status(200).send(challenge);
    }
    return sendJson(res, 403, { error: 'webhook_verification_failed' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return sendJson(res, 405, { error: 'method_not_allowed' });
  }
  if (!cfg.appSecret) {
    return sendJson(res, 503, { error: 'webhook_not_configured', message: 'Configure META_APP_SECRET para verificar assinaturas.' });
  }

  try {
    const rawBody = await readRawBody(req);
    const signature = req.headers && req.headers['x-hub-signature-256'];
    if (!verifyWebhookSignature(rawBody, signature, cfg.appSecret)) {
      return sendJson(res, 401, { error: 'invalid_webhook_signature' });
    }
    try { JSON.parse(rawBody.toString('utf8')); } catch {
      return sendJson(res, 400, { error: 'invalid_json' });
    }
    // Intencionalmente não persiste nem registra o conteúdo do cliente neste estágio.
    return sendJson(res, 200, { received: true });
  } catch (error) {
    const status = Number.isInteger(error && error.status) ? error.status : 400;
    return sendJson(res, status, { error: status === 413 ? 'payload_too_large' : 'invalid_webhook_request' });
  }
};

// Keep the body raw so the X-Hub-Signature-256 check is computed over the exact bytes sent by Meta.
module.exports.config = { api: { bodyParser: false } };
