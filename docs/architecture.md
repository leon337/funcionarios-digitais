# Arquitetura-alvo

## Princípio
Separar aquisição comercial da execução dos funcionários digitais. O portfólio pode ser publicado sem depender das plataformas futuras. Integrações externas permanecem no servidor, nunca no JavaScript público do portfólio.

## A — Portfólio comercial inicial
HTML, CSS e JavaScript estáticos; hospedagem Vercel; metadados sociais; CTA de diagnóstico. O frontend mantém apenas links de contato e não contém tokens da Meta.

## A1 — Adaptadores Meta server-side
Funções Node.js da Vercel em api/meta:
- Facebook Pages API para publicar texto e link em Página autorizada.
- Instagram API para criar contêiner de imagem e publicar após status FINISHED.
- WhatsApp Cloud API para envio individual de texto ou template aprovado.
- Webhook WhatsApp para handshake GET e validação HMAC da assinatura POST.

O backend usa variáveis de ambiente e um token administrativo independente. Sem credenciais, os endpoints de escrita falham de forma fechada. O webhook validado é apenas aceito nesta etapa: ainda não existe fila, armazenamento, deduplicação, encaminhamento ou resposta automática. Consulte docs/meta-integration-architecture.md.

## B — Plataforma comercial (futura)
Responsabilidades: captação e qualificação de leads, pipeline, histórico, campanhas, consentimento e métricas.
Arquitetura candidata: Next.js + TypeScript, Neon Postgres, camada server-side, migrações versionadas, variáveis de ambiente e controles de acesso. Incluir proteção contra spam, validação de entrada e minimização de dados pessoais.

## C — Plataforma de funcionários digitais (futura)
Responsabilidades: função, objetivos, instruções e limites; APIs oficiais de mensagens; webhooks e processamento assíncrono; ferramentas autorizadas e auditáveis; escalonamento humano; observabilidade; isolamento por cliente.

## Fluxo conceitual
Empresário → diagnóstico comercial → proposta → configuração do funcionário digital → integração do canal → execução de tarefas autorizadas → métricas e revisão humana.

## Neon
Neon será o banco PostgreSQL gerenciado previsto para fases futuras. Não é necessário criar ou conectar banco para o portfólio estático. Quando houver dados reais, definir schema, migrações, recuperação, acesso de menor privilégio e ambientes separados.

## Segurança e confiabilidade
- Usar APIs e permissões oficiais; conferir permissões/App Review exigidos pela Meta.
- Manter segredos somente em variáveis de ambiente do servidor/plataforma.
- Validar assinatura dos webhooks sobre o corpo original.
- Usar idempotência, limites de repetição e tratamento de falhas antes de adicionar processamento automático.
- Evitar expor credenciais ou conteúdo sensível em logs.
- Respeitar políticas de envio, consentimento, templates, janelas de atendimento, retenção e privacidade.
- Escalonar para humanos casos fora do escopo.
- Revisar efeitos reais antes de publicar posts ou enviar mensagens; cada chamada de publicação pode causar efeito externo.
