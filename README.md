# Funcionários Digitais

Negócio de tecnologia que implanta funcionários digitais para ajudar empresas a atender clientes, acompanhar oportunidades e executar tarefas comerciais 24 horas por dia, 7 dias por semana.

**Posicionamento:** não vendemos ferramentas de IA; vendemos capacidade adicional de atendimento e operação comercial, implementada por funcionários digitais.

## Estado atual

- Portfólio comercial responsivo publicado na Vercel.
- WhatsApp, Facebook e Instagram configurados como links de contato no frontend.
- Camada inicial server-side para Facebook Pages, Instagram profissional, WhatsApp Cloud API e webhook de WhatsApp implementada no repositório.
- Testes automatizados sem chamadas reais à Meta.
- A conexão real permanece pendente: ativos da Meta, permissões, tokens, configuração Vercel e testes controlados ainda precisam ser verificados.

**Importante:** os links sociais atuais não representam uma integração ativa com as APIs da Meta. Publicações e envio de mensagens só funcionarão depois que os segredos e ativos oficiais forem configurados no servidor.

## Escopo

Nesta etapa estão sendo implementados:
- portfólio e páginas de presença;
- endpoints server-side protegidos para publicar na Página do Facebook e no Instagram profissional;
- endpoint de mensagem individual do WhatsApp Cloud API;
- verificação de webhook WhatsApp com assinatura;
- checklist auditável para ativação dos ativos, permissões e teste real.

Ainda não estão construídos:
- painel de calendário/agendamento de postagens;
- CRM e persistência de leads;
- processamento de mensagens recebidas por funcionários digitais;
- autenticação multiusuário/por função;
- plataforma comercial completa e plataforma de funcionários digitais;
- integração com Neon.

## Documentação

- docs/vision.md — visão e posicionamento.
- docs/roadmap.md — fases e entregáveis.
- docs/architecture.md — arquitetura-alvo e limites.
- docs/meta-integration-checklist.md — checklist atualizado das atividades de conta, código e validação.
- docs/meta-integration-architecture.md — endpoints, variáveis de ambiente, segurança e contratos de chamada.
- docs/decisions/ADR-001-scope-and-product-separation.md — decisão de separar as três superfícies.
- docs/deployment.md — publicação e verificações da Vercel.
- api/ — funções server-side para integrações oficiais.
- tests/ — testes automatizados locais.

## Tecnologias

- Portfólio: HTML, CSS e JavaScript estáticos.
- Backend de integração: funções Node.js na Vercel, sem dependência adicional no runtime.
- Testes: Node.js test runner nativo.
- Repositório: GitHub, branch main.
- Hospedagem: Vercel CLI no notebook.
- Banco futuro: Neon Postgres.

## Configuração pendente

Não versionar tokens. Configure as variáveis apenas no ambiente da Vercel conforme docs/meta-integration-architecture.md. Antes de ativar em produção, audite a Página do Facebook, converta o Instagram em conta profissional se necessário, confirme WABA/telefone e finalize Meta for Developers conforme docs/meta-integration-checklist.md.

## Critérios de aceite

- Layout responsivo em celular e desktop.
- APIs administrativas bloqueadas sem token válido.
- Entradas validadas e assinaturas de webhook verificadas.
- Testes locais passam sem usar credenciais reais.
- Ativos e permissões reais da Meta confirmados.
- Publicação de teste no Facebook e Instagram aprovada.
- Mensagem WhatsApp e webhook testados em ambiente controlado.
- URL publicada e verificada antes de considerar a etapa concluída.

## Publicação

Portfólio: https://funcionarios-digitais.vercel.app/
Repositório: https://github.com/leon337/funcionarios-digitais

Consulte docs/deployment.md para verificações de produção e docs/meta-integration-checklist.md para o estado real da integração Meta.

## Inventário Meta conhecido

Na auditoria inicial de 2026-10-12, a sessão do Business Suite mostrou o portfólio **Predix AI Br**. Meta for Developers já tem três apps: **Content Factory** (em desenvolvimento, com casos de uso de conteúdo do Instagram e gerenciamento da Página), **MCF Communications** (caso de uso WhatsApp; app ainda não publicado) e **Hello Agent** (ativo/publicado, adequação não auditada). Consulte docs/meta-integration-checklist.md. A existência desses apps não comprova que os ativos ou tokens estejam conectados ao projeto Funcionários Digitais; não crie ativos duplicados antes de confirmar propriedade, perfil Instagram, Página e WABA.

## Validação da base Meta

Em 2026-10-12, `npm run check` passou e `npm test` passou com 12/12 testes, incluindo chamadas simuladas da Graph API sem publicar ou enviar mensagens reais. O deploy está publicado em https://funcionarios-digitais.vercel.app/. A rota `GET /api/meta/status` respondeu HTTP 200; os três canais permanecem não configurados porque a Vercel ainda não possui variáveis de ambiente para a Meta. O teste de envio WhatsApp sem configuração respondeu HTTP 503, em comportamento fail-closed. Detalhes e próxima etapa em docs/meta-integration-checklist.md.
