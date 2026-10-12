# Checklist de integração Meta

Atualizado em 2026-10-12. Este checklist é a fonte de estado para a integração de Facebook Pages, Instagram profissional e WhatsApp Business Platform (WABA).

**Regra:** código publicado não significa conta conectada. Marcar tarefas de conta somente após verificação na Meta e um teste real controlado.

## 0. Estado inicial conhecido

- [x] Repositório leon337/funcionarios-digitais existe e usa a branch main.
- [x] Portfólio está publicado em https://funcionarios-digitais.vercel.app/.
- [x] O responsável informou que já possui Meta Business Suite. A existência foi informada pelo usuário, ainda não auditada nesta sessão.
- [x] Dual Browser MCF 0.6.9 está instalado no notebook.
- [ ] Confirmar que a conta Meta correta está autenticada no painel Workspace do Dual Browser.
- [ ] Confirmar o portfólio empresarial, os administradores e a propriedade dos ativos.

## 1. Ativos e acesso Meta

- [ ] Identificar ou criar uma Página do Facebook pertencente ao portfólio empresarial correto.
- [ ] Verificar o acesso de Leandro à Página e se tem controle total ou permissões de publicação suficientes.
- [ ] Verificar o Instagram @leandrocarlos.leonett e sua categoria atual.
- [ ] Converter o Instagram para conta profissional Business se ainda for pessoal; confirmar categoria e contato exibidos publicamente antes de salvar.
- [ ] Vincular o Instagram profissional à Página correta, se adotarmos a rota Instagram API com Facebook Login.
- [ ] Identificar a conta WABA existente; não criar uma segunda conta ou migrar um número sem conferir o impacto.
- [ ] Identificar o número de telefone associado à WABA e seu estado de registro/verificação.
- [ ] Confirmar se já existe uma aplicação em Meta for Developers. Se existir, auditar antes de criar outra.

## 2. Meta for Developers

- [ ] Selecionar ou criar uma aplicação apropriada ao caso de uso empresarial.
- [ ] Adicionar os produtos/casos de uso necessários: Facebook Login/Pages, Instagram e WhatsApp.
- [ ] Configurar URI de redirecionamento OAuth apenas se o fluxo OAuth escolhido precisar dela.
- [ ] Configurar o webhook WhatsApp com a URL pública https://funcionarios-digitais.vercel.app/api/meta/webhooks/whatsapp.
- [ ] Configurar messages e demais campos de webhook necessários; inscrever a aplicação na WABA.
- [ ] Identificar permissões necessárias e separar modo de desenvolvimento de modo Live.
- [ ] Determinar a necessidade de App Review e verificação da empresa para os ativos e permissões solicitados.
- [ ] Gerar tokens com escopo mínimo. Nunca copiar tokens para código, navegador do site ou GitHub.

## 3. Servidor e segredos

- [x] Criar camada de servidor independente do JavaScript público.
- [x] Proteger operações de publicação/envio com META_ADMIN_TOKEN.
- [x] Implementar validação de método, entrada e limites básicos.
- [x] Implementar verificação de assinatura X-Hub-Signature-256 para POSTs recebidos do webhook.
- [ ] Cadastrar, somente no ambiente Production da Vercel, os segredos reais listados em docs/meta-integration-architecture.md.
- [ ] Definir e guardar com segurança um token administrativo de alta entropia.
- [ ] Confirmar que Production, Preview e Development não compartilham segredos desnecessariamente.

## 4. Testes controlados

- [x] Testes automatizados de autenticação, validação e handshake de webhook.
- [ ] Testar status sem credenciais e confirmar que não vaza IDs nem tokens.
- [ ] Testar mensagem WhatsApp somente para um destinatário autorizado que tenha dado opt-in.
- [ ] Testar publicação de texto/link em uma Página de teste ou Página autorizada.
- [ ] Testar publicação de uma imagem não sensível no Instagram e confirmar o post publicado.
- [ ] Validar recebimento de webhook sem registrar conteúdo pessoal em logs.
- [ ] Conferir rate limits, erros de token/permissão e política de mensagens da Meta.

## 5. Critérios para concluir a etapa

- [ ] Ativos corretos identificados, conectados e verificados na Meta.
- [ ] Segredos inseridos no backend da Vercel, sem segredos versionados.
- [ ] Um teste de publicação em Facebook, um em Instagram e um teste de mensagem/retorno WhatsApp aprovados.
- [ ] Webhook confirmado na Meta e evento real recebido com assinatura válida.
- [ ] Logs, privacidade, opt-in, templates e retenção revisados.
- [ ] Checklist atualizado com evidência, data e resultado de cada teste.

## Bloqueio atual

O código inicial e seus testes ficam prontos no repositório, mas os testes de integração reais dependem de sessão autenticada e de ativos/tokens que pertencem à conta do responsável. Não serão fabricados IDs, tokens, aprovações ou resultados. Se o Dual Browser não tiver uma sessão válida, será necessária a autenticação manual do proprietário.

## Auditoria inicial no Meta (2026-10-12)

- [x] Meta Business Suite abriu numa sessão autenticada do notebook.
- [x] Portfólio/ativo empresarial visível no Business Suite: **Predix AI Br**. A tela oferece ações de Página do Facebook e Instagram, mas o handle Instagram e o vínculo exato ainda precisam ser confirmados.
- [x] Foram encontrados três apps em Meta for Developers; a inspeção inicial localizou ativos de app existentes, portanto não criar um quarto app como primeiro passo.
- [x] **Content Factory** está em modo de desenvolvimento e a lista de casos de uso exibe gerenciamento de conteúdo no Instagram e gerenciamento da Página.
- [x] **MCF Communications** tem o caso de uso para conectar com clientes pelo WhatsApp. O painel está marcado **Não publicado** e apresenta etapas de experimento, configuração de produção e verificação da empresa.
- [x] **Hello Agent** aparece como ativo/publicado; os seus casos de uso e a adequação ao projeto ainda não foram auditados.
- [ ] Confirmar no Workspace paralelo se o Instagram de fato é @leandrocarlos.leonett, se é pessoal ou profissional, e se o ativo mostrado no Business Suite é o mesmo perfil do proprietário.
- [ ] Verificar na WABA existente se há número de telefone já registrado e se está autorizado para Cloud API antes de iniciar experimentos ou adicionar número.
- [ ] Escolher formalmente o app Meta a ser usado em produção. Hipótese inicial: avaliar se MCF Communications pode acomodar também os casos de Página/Instagram ou manter Content Factory para esses canais; decidir após verificar permissões, produto e propriedade.
- [ ] Não criar Página, WABA, app ou vínculo duplicado enquanto o inventário de ativos não estiver concluído.

## Registro de teste e publicação (2026-10-12)

- [x] `npm run check` passou sem erros.
- [x] `npm test` passou com **12/12 testes**, usando fetch simulado para evitar publicações e envios reais.
- [x] Commit e push para GitHub: implementação `41f721c`, testes ampliados `5a61226` (branch `main`).
- [x] Deploy de produção da Vercel concluído no domínio https://funcionarios-digitais.vercel.app/.
- [x] `GET /api/meta/status` respondeu HTTP 200, versão Graph API configurada como `v26.0` e todos os canais sinalizados como não configurados.
- [x] `POST /api/meta/whatsapp/messages` sem credenciais foi testado e respondeu HTTP 503 `integration_not_configured` sem efetuar envio.
- [x] Vercel CLI confirmou que o projeto não tem variáveis de ambiente configuradas.
- [ ] Configurar segredos reais apenas depois de concluir o inventário dos ativos e identificar o app/conta corretos. Até lá, as APIs de escrita permanecem inativas.
