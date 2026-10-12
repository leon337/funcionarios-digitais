'use strict';

const { config, sendJson } = require('../_lib/meta');

module.exports = function metaStatus(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return sendJson(res, 405, { error: 'method_not_allowed' });
  }

  const cfg = config();
  return sendJson(res, 200, {
    ok: true,
    provider: 'Meta',
    graphApiVersion: cfg.graphVersion,
    channels: {
      facebookPagePublishing: Boolean(cfg.adminToken && cfg.pageId && cfg.pageAccessToken),
      instagramImagePublishing: Boolean(cfg.adminToken && cfg.instagramUserId && cfg.instagramAccessToken),
      whatsappCloudApi: Boolean(cfg.adminToken && cfg.whatsappPhoneNumberId && cfg.whatsappAccessToken),
      whatsappWebhookVerification: Boolean(cfg.webhookVerifyToken),
      whatsappWebhookSignatureValidation: Boolean(cfg.appSecret)
    }
  });
};
