# Relatório executivo — Kalipeiro Product Factory

## A. O que foi criado

Foi criada uma fábrica documental e executável para repetir o ciclo completo de produto: Idea, Market Research, Validation, Product Definition, Architecture, Development, QA, Security, Production, Conversion, SEO, Customer Acquisition, Monetization, Analytics e Iteration. O sistema usa evidência, gates, decisões versionadas, templates e prompts; ele não modifica o runtime do BrazilBR, não cria outro produto e não ativa serviços externos.

O ponto de entrada é [`README.md`](./README.md). O contrato do pipeline está em [`PIPELINE.md`](./PIPELINE.md), o Master Orchestrator em [`orchestrator/MASTER-ORCHESTRATOR.md`](./orchestrator/MASTER-ORCHESTRATOR.md), o score em [`SCORING.md`](./SCORING.md) e os princípios em [`MANIFESTO.md`](./MANIFESTO.md).

## B. Estrutura de arquivos

```text
product-factory/
├── README.md
├── EXECUTIVE-REPORT.md
├── PIPELINE.md
├── SCORING.md
├── MANIFESTO.md
├── CASE-STUDY-BRAZILBR.md
├── 00-idea/ ... 14-iteration/README.md
├── agents/00-idea-agent.md ... 14-growth-agent.md
├── orchestrator/MASTER-ORCHESTRATOR.md
├── orchestrator/factory-state.example.yml
├── templates/18+ artefatos Markdown
├── checklists/14 gates e cenários
├── playbooks/4 procedimentos operacionais
├── decisions/3 ADRs
└── scripts/factory.py
```

O utilitário local foi mantido deliberadamente pequeno e sem dependências externas. `init` cria um workspace vazio com os 15 diretórios de estágio, estado, log de decisão e README. `status` encontra o primeiro estágio sem os artefatos esperados. Presença de arquivo não fecha um gate: evidência, decisão e aprovação continuam obrigatórias.

## C. Todos os agentes

A Factory contém 15 prompts, incluindo o agente inicial de Idea e os 14 agentes solicitados: Idea, Research, Validation, Product, Architecture, Development, QA, Security, Deployment, CRO, SEO, Acquisition, Monetization, Analytics e Growth. Cada prompt possui papel, contexto, objetivo, entrada, processo, restrições, critérios de sucesso, formato de saída e condições de intervenção humana.

## D. Todos os prompts

Os prompts estão em `agents/`. O Master Orchestrator escolhe o agente com base no primeiro gate incompleto e nos artefatos presentes, mas não executa uma conclusão automática. Todo agente deve separar facts, assumptions, evidence, risks, decision, next action e human action. O prompt de Development preserva funcionalidades existentes e bloqueia alterações destrutivas; QA cobre usuário novo, existente, malicioso e ambiente adverso; Security cobre Auth, authorization, database Rules, APIs, secrets, env, isolation, XSS, injection, CSRF quando aplicável, uploads, admin e rate limiting.

## E. Master Orchestrator

O Orchestrator faz inventário, identifica estágio real, verifica artefatos, seleciona agente, exige evidência, testa ou compara a saída, registra decisão e bloqueia avanço. Ele não aceita a frase “feito” sem evidência, não inicia Development sem Go/Pivot aprovado, não oculta `NOT_TESTED` e solicita intervenção quando há custo, acesso, segredo, dados, ação destrutiva, risco Critical/High ou decisão legal/privacy.

## F. Templates

Os templates cobrem Idea Brief, Market Intelligence Report, Validation Report, Product Brief, PRD, Technical Specification, ADR, Development Report, QA Report, Security Report, Deployment Report, Landing Page Brief, CRO Report, SEO Strategy, Acquisition Plan, Pricing Experiment, Analytics Plan, Launch Checklist, Post-Launch Report e Decision Log. Eles exigem owner, data, versão, fatos, hipóteses, evidências, riscos, decisão e próxima ação.

## G. Checklists e playbooks

As checklists cobrem Idea, Research, Validation, QA de usuário novo/existente/malicioso/adverso, Security, Deployment, CRO, SEO, Acquisition, Launch e Incident/Rollback. Os playbooks cobrem primeiros 100 usuários, arquitetura de baixo custo, incidente/recuperação e o loop Measure → Analyze → Hypothesis → Change → Test → Measure again.

## H. Score de Product Readiness

O mecanismo está em [`SCORING.md`](./SCORING.md). Ele pesa Product 15%, Technology 15%, Security 15%, UX 10%, Production 10%, Conversion 10%, SEO 8%, Acquisition 7%, Monetization 5% e Analytics 5%, com thresholds: 0–39 não lançar, 40–59 protótipo, 60–74 beta, 75–89 lançável e 90–100 altamente preparado. Critical aberto, High não aprovado, build quebrado, core action não testada, segredo exposto, ausência de rollback ou billing não aprovado são hard stops.

Não foi atribuído um score de Product Readiness a um novo produto nesta missão, porque a missão criou a Factory e não validou uma nova ideia. O score só deve ser calculado após preencher os artefatos do produto e anexar evidências.

## I. Fluxo completo da Factory

```text
IDEA
→ MARKET RESEARCH
→ VALIDATION (Go / No-Go / Pivot)
→ PRODUCT DEFINITION
→ ARCHITECTURE
→ DEVELOPMENT
→ QA
→ SECURITY
→ PRODUCTION
→ CONVERSION
→ SEO
→ CUSTOMER ACQUISITION
→ MONETIZATION
→ ANALYTICS
→ ITERATION
```

`No-Go` encerra/congela; `Pivot` atualiza a hipótese e retorna a um estágio anterior; `Blocked` pede informação ou aprovação; `Go` libera o próximo gate. Depois de produção, o loop de iteração não libera features por inércia: exige métrica, análise, hipótese e teste.

## J. Como iniciar um produto novo

```bash
python3 product-factory/scripts/factory.py init --workspace projects/minha-ideia
python3 product-factory/scripts/factory.py status --workspace projects/minha-ideia
```

Preencha `00-idea/idea-brief.md`, execute `agents/00-idea-agent.md`, valide `checklists/IDEA-GATE.md`, registre `DECISION-LOG.md` e repita pelos estágios. O workspace deve ser versionado com o projeto, sem secrets. O utilitário recusa diretórios não vazios; para recuperar um projeto existente, primeiro faça inventário e não sobrescreva artefatos.

## K. O que ainda precisa ser automatizado

A Factory já automatiza criação de workspace, status por artefato, lint/build/testes como processos recomendados e verificações documentais. Ainda podem ser automatizados, em ambiente escolhido pelo proprietário, link checking, execução de Rules Emulator, smoke HTTP, cálculo do score, coleta de resultados de CI, snapshots de metadata, alertas de quota, dashboards e geração de relatórios. Qualquer automação que envolva APIs, mensagens, dados ou cobrança deve ter credenciais, retenção, rate limit, owner, custo e rollback definidos.

Não foi criado um daemon, webhook, cron, bot de outreach ou serviço de monitoramento persistente. Isso evita custo e mudanças de infraestrutura no BrazilBR. Se uma implementação futura precisar de execução recorrente, primeiro compare uma rotina local/manual, uma automação gerenciada de baixo custo e um serviço persistente; não use o sandbox efêmero como produção.

## L. O que exige decisão humana

Exigem decisão humana: Go/No-Go/Pivot; definição de ICP e problema; claims sensíveis; privacy/legal; escolha de stack e provedor; ativação de billing, upgrade, domínio, anúncio, checkout ou serviço pago; publicação de Auth/Rules/produção; migração, exclusão ou restauração de dados; envio de outreach; armazenamento de PII; exceção de Security High; release público; rollback de dados; backup/retention; e adoção de automação que acesse terceiros.

## Verificação executada

A estrutura passou por verificador local de 15 stages, 15 agents, 20 templates, 14 checklists, 4 playbooks e 3 ADRs; os links Markdown do repositório passaram; o utilitário passou por `py_compile`, inicialização de workspace temporário e recusa de diretório não vazio; `npm run lint`, `npm run build` e `git diff --check` do BrazilBR passaram. O commit foi publicado na branch `main`, o check Vercel concluiu com sucesso e as rotas de produção do BrazilBR permaneceram HTTP 200.

## Limitações honestas

A Factory é um sistema operacional documental com um pequeno helper local, não um orquestrador distribuído que executa agentes sozinho. Ela não possui banco próprio, painel, CI dedicado, observabilidade ou integração de pagamento/outreach. A qualidade final depende de evidência, acesso autorizado, revisão humana e execução dos agentes. O caso BrazilBR informa padrões, mas não substitui pesquisa ou validação de um novo produto.
