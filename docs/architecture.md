# Arquitetura-alvo

## Princípio
Separar aquisição comercial da execução dos funcionários digitais. O portfólio pode ser publicado sem depender das plataformas futuras.

## A — Portfólio comercial inicial
HTML, CSS e JavaScript estáticos; hospedagem Vercel; metadados sociais; CTA de diagnóstico. Sem credenciais no frontend. A integração de contato só deve ser ativada após configurar dados reais.

## B — Plataforma comercial (futura)
Responsabilidades: captação e qualificação de leads, pipeline, histórico, campanhas e métricas.
Arquitetura candidata: Next.js + TypeScript, Neon Postgres, camada de servidor, migrações versionadas, variáveis de ambiente e controles de acesso. Incluir proteção contra spam, validação de entrada e minimização de dados pessoais.

## C — Plataforma de funcionários digitais (futura)
Responsabilidades: função, objetivos, instruções e limites; APIs oficiais de mensagens; webhooks e processamento assíncrono; ferramentas autorizadas e auditáveis; escalonamento humano; observabilidade; isolamento por cliente.

## Fluxo conceitual
Empresário → diagnóstico comercial → proposta → configuração do funcionário digital → integração do canal → execução de tarefas autorizadas → métricas e revisão humana.

## Neon
Neon será o banco PostgreSQL gerenciado previsto para fases futuras. Não é necessário criar ou conectar banco para o portfólio estático. Quando houver dados reais, definir schema, migrações, recuperação, acesso de menor privilégio e ambientes separados.

## Segurança e confiabilidade
- Usar APIs e permissões oficiais.
- Manter segredos somente em variáveis de ambiente do servidor/plataforma.
- Validar assinaturas de webhooks quando suportadas.
- Usar idempotência, limites de repetição e tratamento de falhas.
- Evitar expor credenciais ou conteúdo sensível em logs.
- Escalonar para humanos casos fora do escopo.
- Respeitar políticas de envio, consentimento, retenção e privacidade.
