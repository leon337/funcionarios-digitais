# Arquitetura da integração Meta

Atualizado em 2026-10-12.

## Escopo desta etapa

A base server-side cria uma ponte com APIs oficiais da Meta para três canais. Ela é infraestrutura de integração, não ainda um agendador de campanhas, CRM, painel de conteúdo, motor de funcionário digital ou sistema de filas. Esses componentes ficam para etapas posteriores.

- Facebook Pages: publicar texto com link em uma Página autorizada.
- Instagram profissional: criar um contêiner de imagem com legenda e publicar quando o contêiner estiver pronto.
- WhatsApp Cloud API: enviar uma mensagem por chamada (texto na janela de atendimento ou template aprovado).
- Webhook WhatsApp: validar o handshake GET e a assinatura HMAC do POST; nesta etapa o corpo validado é aceito, mas não é persistido nem encaminhado a um agente.

Instagram pessoal não é suportado pela API de publicação. O Instagram precisa ser Business ou Creator. Na rota com Facebook Login, é exigida uma Página vinculada ao perfil profissional; o checklist mantém a escolha do fluxo e a verificação dos ativos como tarefas explícitas.

## Endpoints Vercel

Todos os caminhos usam HTTPS em produção.

| Método | Endpoint | Proteção | Função |
|---|---|---|---|
| GET | /api/meta/status | Público; somente flags booleanas | Informa quais canais têm configuração mínima, sem retornar IDs ou segredos |
| POST | /api/meta/facebook/publish | Bearer META_ADMIN_TOKEN | Publica texto e link em uma Página |
| POST | /api/meta/instagram/container | Bearer META_ADMIN_TOKEN | Cria contêiner de imagem para Instagram |
| POST | /api/meta/instagram/publish | Bearer META_ADMIN_TOKEN | Verifica se o contêiner terminou e publica |
| POST | /api/meta/whatsapp/messages | Bearer META_ADMIN_TOKEN | Envia um texto ou template aprovado para um destinatário |
| GET/POST | /api/meta/webhooks/whatsapp | Verificação de token no GET e HMAC no POST | Handshake e recepção verificada de evento |

A API administrativa não é chamada pelo JavaScript público do portfólio. Chamadas diretas precisam do token administrativo, guardado somente em ambiente confiável. Não adicionar controles CORS abertos ou colocar esse token em js/config.js.

## Variáveis de ambiente

Configurar valores reais no Project Settings / Environment Variables da Vercel. .env.example contém somente nomes e campos vazios.

| Variável | Finalidade |
|---|---|
| META_GRAPH_API_VERSION | Versão Graph API; padrão atual do scaffold: v26.0, mantendo-a configurável |
| META_APP_ID | ID da aplicação Meta (referência/documentação) |
| META_APP_SECRET | Segredo usado para autenticar assinatura dos webhooks |
| META_ADMIN_TOKEN | Segredo independente para bloquear operações administrativas |
| META_WEBHOOK_VERIFY_TOKEN | Valor escolhido pelo operador para o handshake do webhook |
| META_PAGE_ID | ID da Página autorizada |
| META_PAGE_ACCESS_TOKEN | Token da Página com permissões aprovadas para publicar |
| META_IG_USER_ID | ID da conta profissional Instagram |
| META_IG_ACCESS_TOKEN | Token com permissão de publicar conteúdo nessa conta |
| META_WA_PHONE_NUMBER_ID | ID do número registrado na Cloud API |
| META_WA_ACCESS_TOKEN | Token com permissões de envio/recepção necessárias |

Não guardar tokens no GitHub, no HTML/JavaScript do site, em screenshots, em logs ou nesta documentação. Preferir token de sistema/credencial compatível com as políticas atuais da Meta e permissões mínimas; rever expiração e rotação.

## Contratos de chamada

Publicar em Facebook (texto e link):

    POST /api/meta/facebook/publish
    Authorization: Bearer <META_ADMIN_TOKEN>
    Content-Type: application/json
    {"message":"Texto aprovado para a Página","link":"https://exemplo.com"}

Criar contêiner no Instagram:

    POST /api/meta/instagram/container
    Authorization: Bearer <META_ADMIN_TOKEN>
    Content-Type: application/json
    {"imageUrl":"https://servidor-publico.example/imagem.jpg","caption":"Legenda revisada"}

Depois de receber creationId, aguardar até que o status Graph API seja FINISHED e chamar /api/meta/instagram/publish com {"creationId":"..."}.

WhatsApp (um destinatário por chamada):

    POST /api/meta/whatsapp/messages
    Authorization: Bearer <META_ADMIN_TOKEN>
    Content-Type: application/json
    {"to":"5581999999999","text":"Mensagem individual para contato com opt-in"}

Para template, usar um objeto com type=template, nome aprovado, idioma pt_BR e componentes compatíveis com o template. Templates e envio devem seguir as regras de consentimento, janela de atendimento, qualidade e limites da Meta. A implementação não oferece envio em massa.

## Decisões de segurança e limites

1. Tokens e segredo do aplicativo só são lidos no servidor; endpoints nunca os retornam.
2. Comparações de segredo são em tempo constante.
3. O webhook valida assinatura sobre os bytes originais; body-parser está desativado apenas nesse endpoint.
4. Conteúdo do webhook não é salvo, ecoado ou registrado nesta versão.
5. Mensagens são para um destinatário por chamada; texto tem limite de tamanho; template precisa de nome e idioma validados.
6. A publicação Instagram exige imagem por URL pública HTTPS, porque a Meta precisa buscar o mídia.
7. A versão da Graph API é configurável e deve ser revisada ao configurar a aplicação, em vez de atualizada silenciosamente.
8. As ações externas são reais e podem publicar conteúdo ou enviar mensagens. Validar o destino e o texto antes de cada chamada de produção.
9. META_ADMIN_TOKEN funciona como segredo administrativo compartilhado. Se mais pessoas operarem a integração, trocar por autenticação individual e autorização por função antes de ampliar o uso.

## Referências oficiais

- Meta, Instagram API (documentação da Meta publicada no Postman): https://www.postman.com/meta/instagram/documentation/6yqw8pt/instagram-api
- Meta, WhatsApp Cloud API (documentação da Meta publicada no Postman): https://www.postman.com/meta/whatsapp-business-platform/documentation/wlk6lh4/whatsapp-cloud-api
- Meta, webhook payload / requisitos HTTPS e inscrição da WABA: https://www.postman.com/meta/whatsapp-business-platform/folder/tduohwq/webhook-payload-reference
