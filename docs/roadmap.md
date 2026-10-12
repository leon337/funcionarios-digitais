# Plano de construção

## Fase 0 — Alinhamento e fundação
**Objetivo:** preservar a visão, definir fronteiras e preparar o repositório.
Entregáveis: visão, posicionamento, roadmap, arquitetura-alvo, critérios de aceite e repositório GitHub.
**Saída:** documentação registrada e repositório acessível.
**Status:** concluída.

## Fase 1 — Portfólio comercial
**Objetivo:** fornecer presença profissional para redes sociais e conversas comerciais.
Escopo: página responsiva, proposta de valor, tipos de funcionários digitais, processo de implantação, FAQ, limites transparentes, metadados sociais/SEO, configuração de marca e links sociais.
**Status em 2026-10-12:** implementada, publicada e verificada em https://funcionarios-digitais.vercel.app/. Links de contato não são integrações API.
**Saída:** presença pública pronta para validação, sem afirmar que as APIs estão conectadas.

## Fase 1B — Integração oficial Meta
**Objetivo:** preparar a base técnica para operar com APIs oficiais de Facebook Pages, Instagram profissional e WhatsApp Cloud API.
Entregáveis:
- endpoints server-side separados do frontend;
- autorização administrativa por token de servidor;
- publicar texto/link em Página do Facebook;
- criar e publicar contêiner de imagem no Instagram após status FINISHED;
- enviar mensagem individual de texto ou template aprovado pelo WhatsApp Cloud API;
- verificar handshake e assinatura HMAC do webhook WhatsApp;
- testes locais e checklist de ativação.
**Status em 2026-10-12:** scaffold de endpoints e documentação implementados; ativação real depende de sessão Meta autenticada, inventário de ativos, permissões e segredos Vercel. O webhook aceita payload verificado, mas ainda não processa mensagens para funcionários digitais.
**Saída:** testes locais aprovados e um teste externo controlado por canal, sem segredos no Git.

## Fase 2 — Descoberta comercial e validação
- Entrevistar empresários de setores variados.
- Identificar frequência e custo das oportunidades perdidas.
- Registrar objeções, necessidades e disposição a pagar.
- Comparar segmentos antes de escolher campanhas específicas.
- Definir oferta inicial, implantação e suporte.
**Saída:** problema prioritário validado e primeira oferta definida.

## Fase 3 — Plataforma comercial
**Planejada; não construir antes da integração e da oferta inicial serem validadas.**
Capacidades: diagnóstico, registro/qualificação de leads, pipeline, histórico, propostas, páginas por segmento e métricas de aquisição/conversão.
Arquitetura candidata: Next.js + TypeScript, camada server-side, Neon Postgres, migrações versionadas, validação e controle de acesso.
**Saída:** fluxo comercial ponta a ponta testado com acesso seguro e métricas úteis.

## Fase 4 — Plataforma de funcionários digitais
**Planejada.**
Capacidades: configuração de função e políticas, base de conhecimento, integrações oficiais, webhooks, processamento assíncrono, ferramentas autorizadas, escalonamento humano, auditoria, observabilidade e isolamento por cliente.
**Saída:** atendimento/qualificação executado de ponta a ponta com segurança e avaliação documentada.

## Fase 5 — Piloto pago
Selecionar cliente piloto, medir linha de base, implantar fluxo limitado, avaliar qualidade, custos e resultados, corrigir falhas antes de expandir.

## Fase 6 — Expansão orientada por evidências
Criar campanhas para segmentos com maior aderência, reutilizar componentes, automatizar onboarding e ampliar canais conforme demanda validada.

## Dependências críticas
- Ativos Meta e números fornecidos/controlados pelo proprietário.
- Aprovação de contas e permissões das APIs oficiais.
- Política de privacidade, retenção, consentimento e opt-in adequados.
- Segredos configurados apenas nos ambientes server-side.
- Neon e credenciais somente quando a persistência for implementada.
- Orçamento operacional e limites de consumo de IA e mensagens.
