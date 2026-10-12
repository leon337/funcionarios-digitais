'use strict';

const { config, sendJson, requireAdmin, requestBody, graphRequest, routeError } = require('../../_lib/meta');

module.exports = async function sendWhatsAppMessage(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'method_not_allowed' });
  }
  if (!requireAdmin(req, res)) return;

  const cfg = config();
  if (!cfg.whatsappPhoneNumberId || !cfg.whatsappAccessToken) {
    return sendJson(res, 503, { error: 'whatsapp_not_configured', message: 'Configure META_WA_PHONE_NUMBER_ID e META_WA_ACCESS_TOKEN.' });
  }

  const body = requestBody(req);
  const rawTo = body && typeof body.to === 'string' ? body.to.replace(/[\s()+.-]/g, '') : '';
  if (!/^\d{8,15}$/.test(rawTo) || rawTo.startsWith('0')) {
    return sendJson(res, 400, { error: 'invalid_recipient', message: 'to deve ser um número internacional com código do país, contendo 8 a 15 dígitos.' });
  }

  let message;
  if (body && body.type === 'template') {
    const template = body.template;
    if (!template || typeof template.name !== 'string' || !/^[a-zA-Z0-9_]{1,512}$/.test(template.name) ||
        !template.language || typeof template.language.code !== 'string' ||
        !/^[a-z]{2}(?:_[A-Z]{2})?$/.test(template.language.code) ||
        (template.components !== undefined && !Array.isArray(template.components))) {
      return sendJson(res, 400, { error: 'invalid_template', message: 'Informe um template aprovado com name, language.code e components opcionais.' });
    }
    message = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: rawTo,
      type: 'template',
      template: {
        name: template.name,
        language: { code: template.language.code },
        ...(template.components ? { components: template.components } : {})
      }
    };
  } else {
    const text = body && typeof body.text === 'string' ? body.text.trim() : '';
    if (!text || text.length > 4096) {
      return sendJson(res, 400, { error: 'invalid_text', message: 'text é obrigatório e deve ter até 4.096 caracteres.' });
    }
    message = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: rawTo,
      type: 'text',
      text: { body: text, preview_url: body.previewUrl === true }
    };
  }

  try {
    const result = await graphRequest('/' + encodeURIComponent(cfg.whatsappPhoneNumberId) + '/messages', {
      method: 'POST',
      token: cfg.whatsappAccessToken,
      body: message
    });
    const messageId = result.messages && result.messages[0] && result.messages[0].id;
    return sendJson(res, 202, { ok: true, messageId: messageId || null, status: 'accepted_by_meta' });
  } catch (error) {
    return routeError(res, error);
  }
};
