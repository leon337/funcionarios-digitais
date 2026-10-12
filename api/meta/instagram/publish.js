'use strict';

const { config, sendJson, requireAdmin, requestBody, graphRequest, routeError } = require('../../_lib/meta');

module.exports = async function publishInstagramContainer(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'method_not_allowed' });
  }
  if (!requireAdmin(req, res)) return;

  const cfg = config();
  if (!cfg.instagramUserId || !cfg.instagramAccessToken) {
    return sendJson(res, 503, { error: 'instagram_not_configured', message: 'Configure META_IG_USER_ID e META_IG_ACCESS_TOKEN.' });
  }

  const body = requestBody(req);
  const creationId = body && typeof body.creationId === 'string' ? body.creationId.trim() : '';
  if (!/^\d{5,40}$/.test(creationId)) {
    return sendJson(res, 400, { error: 'invalid_creation_id', message: 'creationId inválido.' });
  }

  try {
    const status = await graphRequest('/' + encodeURIComponent(creationId) + '?fields=status_code,status', {
      token: cfg.instagramAccessToken
    });
    if (status.status_code !== 'FINISHED') {
      return sendJson(res, 409, {
        error: 'container_not_ready',
        status: status.status_code || 'UNKNOWN',
        message: status.status || 'A Meta ainda não liberou o contêiner para publicação.'
      });
    }

    const result = await graphRequest('/' + encodeURIComponent(cfg.instagramUserId) + '/media_publish', {
      method: 'POST',
      token: cfg.instagramAccessToken,
      form: { creation_id: creationId }
    });
    return sendJson(res, 201, { ok: true, id: result.id });
  } catch (error) {
    return routeError(res, error);
  }
};
