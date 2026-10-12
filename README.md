# Funcionários Digitais

Negócio de tecnologia que implanta funcionários digitais para ajudar empresas a atender clientes, acompanhar oportunidades e executar tarefas comerciais 24 horas por dia, 7 dias por semana.

**Posicionamento:** não vendemos ferramentas de IA; vendemos capacidade adicional de atendimento e operação comercial, implementada por funcionários digitais.

## Escopo atual

O primeiro entregável é um portfólio comercial responsivo, preparado para compartilhamento no WhatsApp Business, Instagram e Facebook.

Ainda não serão construídas nesta fase:
- Plataforma comercial completa (captação, CRM, diagnóstico e gestão de leads).
- Plataforma de funcionários digitais (orquestração, canais, integrações e execução de tarefas).
- Integração com Neon.

Esses componentes constam do plano de construção para missões futuras.

## Documentação
- docs/vision.md — visão e posicionamento.
- docs/roadmap.md — fases e entregáveis.
- docs/architecture.md — arquitetura-alvo e limites.
- docs/decisions/ADR-001-scope-and-product-separation.md — decisão de separar as três superfícies.
- index.html, css/, js/ e assets/ — primeiro entregável publicável.

## Tecnologias
- Portfólio inicial: HTML, CSS e JavaScript estáticos.
- Repositório: GitHub.
- Hospedagem: Vercel CLI no notebook.
- Banco futuro: Neon Postgres.

## Configuração pendente antes da divulgação
O WhatsApp e o Facebook do responsável já estão configurados em `js/config.js`. O Instagram ainda está pendente de confirmação pública; o nome definitivo da marca também pode ser ajustado nesse arquivo.

## Critérios de aceite
- Layout responsivo em celular e desktop.
- Proposta de valor clara para empresas de diferentes setores.
- Demonstração ilustrativa, identificada como exemplo.
- CTA de diagnóstico.
- Instruções de configuração.
- URL publicada e verificada antes de considerar a entrega concluída.

## Publicação inicial

O portfólio está publicado em https://funcionarios-digitais.vercel.app/ e servido a partir da raiz do repositório para manter os deploys do GitHub e da CLI consistentes. Consulte docs/deployment.md para validações e pendências antes da divulgação.
