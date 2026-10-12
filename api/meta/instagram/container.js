'use strict';

const { config, sendJson, requireAdmin, requestBody, isPublicHttpsUrl, graphRequest, routeError } = require('../../_lib/meta');

module.exports = async function createInstagramImageContainer(req, res) {
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
  const imageUrl = body && typeof body.imageUrl === 'string' ? body.imageUrl.trim() : '';
  const caption = body && typeof body.caption === 'string' ? body.caption.trim() : '';
  if (!isPublicHttpsUrl(imageUrl)) {
    return sendJson(res, 400, { error: 'invalid_image_url', message: 'imageUrl deve ser uma URL HTTPS pública e acessível pela Meta.' });
  }
  if (caption.length > 2200) {
    return sendJson(res, 400, { error: 'caption_too_long', message: 'caption deve ter até 2.200 caracteres.' });
  }

  try {
    const result = await graphRequest('/' + encodeURIComponent(cfg.instagramUserId) + '/media', {
      method: 'POST',
      token: cfg.instagramAccessToken,
      form: { image_url: imageUrl, caption }
    });
    if (!result.id) throw Object.assign(new Error('A Meta não retornou o ID do contêiner.'), { status: 502 });
    return sendJson(res, 201, {
      ok: true,
      creationId: result.id,
      next: 'Consulte o status do contêiner e chame /api/meta/instagram/publish quando status_code for FINISHED.'
    });
  } catch (error) {
    return routeError(res, error);
  }
};
