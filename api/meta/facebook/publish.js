'use strict';

const { config, sendJson, requireAdmin, requestBody, graphRequest, routeError } = require('../../_lib/meta');

module.exports = async function publishFacebookPagePost(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'method_not_allowed' });
  }
  if (!requireAdmin(req, res)) return;

  const cfg = config();
  if (!cfg.pageId || !cfg.pageAccessToken) {
    return sendJson(res, 503, { error: 'facebook_not_configured', message: 'Configure META_PAGE_ID e META_PAGE_ACCESS_TOKEN.' });
  }

  const body = requestBody(req);
  const message = body && typeof body.message === 'string' ? body.message.trim() : '';
  const link = body && typeof body.link === 'string' ? body.link.trim() : '';
  if (!message || message.length > 5000) {
    return sendJson(res, 400, { error: 'invalid_message', message: 'message é obrigatório e deve ter até 5.000 caracteres.' });
  }
  if (link) {
    try {
      const url = new URL(link);
      if (url.protocol !== 'https:' || url.username || url.password) throw new Error('invalid');
    } catch {
      return sendJson(res, 400, { error: 'invalid_link', message: 'link, quando informado, deve ser uma URL HTTPS válida.' });
    }
  }

  try {
    const form = { message };
    if (link) form.link = link;
    const result = await graphRequest('/' + encodeURIComponent(cfg.pageId) + '/feed', {
      method: 'POST',
      token: cfg.pageAccessToken,
      form
    });
    return sendJson(res, 201, { ok: true, id: result.id });
  } catch (error) {
    return routeError(res, error);
  }
};
