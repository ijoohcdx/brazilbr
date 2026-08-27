# Pipeline e gates

O pipeline é deliberadamente sequencial. Um estágio pode voltar a um anterior, mas não pode ser pulado por conveniência. O Orchestrator lê os artefatos, verifica evidências e registra uma decisão; ele não confia somente no status informado pelo agente.

## Contrato universal de estágio

Cada estágio recebe `context/`, `inputs/`, `constraints/`, `previous_decisions/` e `evidence/`. Ele deve produzir um artefato com fatos, hipóteses, desconhecidos, riscos, recomendações, evidências e `next_gate`. A saída sempre inclui `status: DRAFT | READY | BLOCKED | NOT_TESTED`.

| Campo obrigatório | Regra |
|---|---|
| Owner | Pessoa responsável por revisar a saída. |
| Date/version | Data e versão do artefato. |
| Facts | Observações com fonte. |
| Assumptions | Hipóteses não confirmadas. |
| Evidence | Links, dados, comandos, testes ou capturas. |
| Risks | Riscos com probabilidade, impacto e mitigação. |
| Decision | Go, No-Go, Pivot ou Blocked. |
| Next action | Uma ação concreta e seu responsável. |

## Stages

| Stage | Entrada | Saída | Gate objetivo |
|---|---|---|---|
| 00 — IDEA | Ideia, hipótese, problema, público | `Idea Brief` | Problema e público têm hipótese falsificável; desconhecidos estão explícitos. |
| 01 — MARKET RESEARCH | Idea Brief + fontes | `Market Intelligence Report` | Há fontes primárias/observações reais, alternativas, preços, reclamações, keywords e lacunas; não há números inventados. |
| 02 — VALIDATION | Research + entrevistas/testes | `Validation Report` e decisão | Problema, urgência, ICP, willingness to pay, oportunidade, riscos e aquisição foram testados. Resultado é Go/No-Go/Pivot. |
| 03 — PRODUCT DEFINITION | Validation Go/Pivot | `Product Brief` + `PRD` | Core problem/outcome, MVP, não-funcionalidades, métricas, pricing como hipótese e limites definidos. |
| 04 — ARCHITECTURE | Product Brief/PRD | `Technical Specification` + ADRs | Stack, dados, Auth, APIs, custo, segurança, backup, rollback e dependências possuem dono e justificativa. |
| 05 — DEVELOPMENT | Technical Spec + constraints | MVP + commits + testes + docs | Código incremental; lint/build/testes passam; mudança destrutiva bloqueada; integração real marcada como testada ou pendente. |
| 06 — QA | MVP + test plan | `QA Report` | Novo, existente, malicioso e adverso foram exercitados; falhas têm severidade, reprodução e decisão. |
| 07 — SECURITY | Código, Rules, env, APIs | `Security Report` | Nenhum Critical/High sem mitigação aceita; isolamento, secrets, XSS, injection, uploads, admin e rate limiting revisados. |
| 08 — PRODUCTION | Build + env + security | `Deployment Report` | Build e smoke passam; domínio, Auth, DB, Rules, rollback, observabilidade e custos estão aprovados. |
| 09 — CONVERSION | Product + audience + working MVP | `Landing Page Brief` | Página responde o quê/para quem/problema/como/preço/próximo passo; claims verificáveis; CTA testado. |
| 10 — SEO | Intent research + pages | `SEO Strategy` | Cada página tem intenção real, conteúdo distinto, metadata, canonical, schema, sitemap, robots e links internos. |
| 11 — ACQUISITION | ICP + offer + channels | `Acquisition Plan` | Canal, mensagem, oferta, CTA, esforço, custo, métrica, sucesso e abandono definidos; sem spam. |
| 12 — MONETIZATION | Outcome + validation evidence | `Pricing Experiment` | Preço é hipótese; plano, limites, trial, upgrade e cancelamento têm experimento e não prometem valor não testado. |
| 13 — ANALYTICS | Core loop + privacy | `Analytics Plan` | North Star, acquisition, activation, retention, revenue, eventos, propriedades, consentimento e retenção definidos. |
| 14 — ITERATION | Production data + reports | `Post-Launch Report` | Measure → Analyze → Hypothesis → Change → Test → Measure again; mudança prioritizada por evidência. |

## Hard stops

Pare e solicite intervenção humana quando houver Critical aberto, High sem plano aceito, falta de Auth/DB/backup owner, build quebrado, dados reais em risco, segredo exposto, custo incerto, domínio sem controle, ausência de rollback, claims não comprováveis, ação destrutiva, anúncio/outreach que possa ser spam ou um Go decidido sem evidência.

## Regras de decisão

`Go` significa que os critérios do gate estão completos e o owner aprovou. `No-Go` significa que o problema ou canal não demonstrou evidência suficiente; arquive e não desenvolva. `Pivot` significa que a evidência sugere uma hipótese adjacente; atualize Idea Brief e volte ao estágio indicado. `Blocked` significa que falta acesso, dado ou decisão humana; não maquie como No-Go.
