# Kalipeiro Product Factory

A **Kalipeiro Product Factory** é um sistema operacional documental, reutilizável e executável para transformar uma ideia em um produto digital validado, seguro, publicável e mensurável. Ela foi extraída das experiências reais do BrazilBR, mas não é uma feature do BrazilBR e não altera sua arquitetura de runtime.

> A Factory não substitui julgamento humano. Ela torna o trabalho repetitivo verificável, cria gates objetivos e impede que um agente declare uma etapa concluída sem evidência.

## O que esta pasta resolve

Uma pessoa que nunca viu o BrazilBR pode iniciar uma ideia, saber qual agente chamar, qual prompt usar, quais entradas entregar, qual artefato esperar, como validar, quando avançar, quando voltar, quando abandonar e quando pedir aprovação humana. Cada estágio produz um artefato Markdown versionado; cada gate tem evidência e decisão.

A Factory começa com arquitetura de baixo custo, evita serviços pagos sem justificativa, trata preço e aquisição como hipóteses, preserva reversibilidade, exige testes antes de deploy e separa fatos observados de hipóteses.

## Como iniciar um produto novo

1. Inicialize um workspace vazio fora do produto, por exemplo:

   ```bash
   python3 product-factory/scripts/factory.py init --workspace projects/minha-ideia
   ```

2. Preencha `projects/minha-ideia/00-idea/idea-brief.md` com fatos, hipótese, problema, público, contexto e restrições conhecidas. Marque desconhecidos como `TBD`, não invente.
3. Confira o primeiro estágio incompleto:

   ```bash
   python3 product-factory/scripts/factory.py status --workspace projects/minha-ideia
   ```

4. Abra `orchestrator/MASTER-ORCHESTRATOR.md`. Ele identifica o estágio pelos artefatos e não pela afirmação de um agente. Execute o prompt em `agents/00-idea-agent.md` e salve a saída no caminho indicado pelo gate.
5. Valide o gate em `PIPELINE.md` e registre a decisão em `projects/minha-ideia/DECISION-LOG.md`.
6. Só avance quando os critérios do estágio estiverem satisfeitos. `No-Go` encerra ou congela a iniciativa; `Pivot` volta para Idea/Research/Product; `Go` permite o estágio seguinte.
7. No desenvolvimento, use uma branch, mudanças incrementais, testes, lint/build, diff revisado e commits pequenos. Nunca faça uma migração destrutiva ou ative cobrança automaticamente.
8. Antes de produção, execute as checklists, atribua proprietário e registre rollback, domínio, ambiente, segurança, monitoramento e smoke test.

O utilitário `factory.py` só cria diretórios/estado local e audita presença de artefatos. Ele não chama APIs, não executa agentes, não publica infraestrutura, não envia mensagens e não modifica um workspace não vazio sem `--force`; presença de arquivo não fecha um gate.

## Estrutura

| Diretório | Conteúdo |
|---|---|
| `00-idea` a `14-iteration` | Contratos de entrada, saída e gate de cada estágio. |
| `agents` | Quinze prompts operacionais reutilizáveis, incluindo Idea Agent. |
| `orchestrator` | Prompt mestre e estado mínimo da execução. |
| `templates` | Artefatos padrão de produto, mercado, engenharia, lançamento e pós-lançamento. |
| `checklists` | QA, security, deploy, CRO, SEO, aquisição, launch e incidentes. |
| `playbooks` | Procedimentos de baixo custo, primeiros 100 usuários, recuperação e iteração. |
| `decisions` | ADRs que preservam os princípios da Factory. |

## Agentes

| Stage | Agente | Saída principal |
|---|---|---|
| 00 | Idea Agent | Idea Brief |
| 01 | Research Agent | Market Intelligence Report |
| 02 | Validation Agent | Go / No-Go / Pivot |
| 03 | Product Agent | Product Brief e PRD |
| 04 | Architecture Agent | Technical Specification |
| 05 | Development Agent | MVP incremental + evidências |
| 06 | QA Agent | QA Report e matriz de cenários |
| 07 | Security Agent | Security Report + severidade |
| 08 | Deployment Agent | Deployment Report + rollback |
| 09 | CRO Agent | Landing Page Brief + CRO checklist |
| 10 | SEO Agent | SEO Strategy + mapa de páginas |
| 11 | Acquisition Agent | Acquisition Plan + primeiros 100 |
| 12 | Monetization Agent | Pricing Experiment |
| 13 | Analytics Agent | Analytics Plan + North Star |
| 14 | Growth Agent | Post-Launch Report + próximo loop |

## Automatizar versus aprovar

É adequado automatizar coleta de artefatos, verificação de links, lint, build, testes de Rules, smoke HTTP, comparação de diffs, cálculo do score e geração de relatórios. Não automatize sem aprovação humana: gasto, upgrade de plano, compra de domínio, envio de outreach, anúncios pagos, exclusão/migração de dados, publicação de Rules em produção, mudança de provedor, criação de credenciais administrativas ou lançamento público.

## Evidência mínima

Toda conclusão deve apontar para um arquivo, comando, URL, log, screenshot, teste, consulta, decisão ou dado observado. Uma frase como “feito”, “seguro” ou “pronto” sem evidência não fecha o gate. Quando uma integração exigir login que não está disponível, o agente deve registrar `NOT_TESTED`, o motivo e o teste manual necessário.

## Relação com o BrazilBR

O caso de referência está em `CASE-STUDY-BRAZILBR.md`. Ele registra fatos observados: fallback SPA do Vercel, Auth e Firestore, Rules com ownership, batches atômicos, boundary sem Storage, landing de conversão, SEO pré-renderizado, Red Team e limitações remanescentes. Essa experiência informa padrões; não autoriza copiar decisões técnicas para outro produto sem validar o contexto.

## Referências externas operacionais

Os playbooks devem apontar para documentação oficial quando afirmarem limites de preço, plataforma ou política: [Firebase Pricing](https://firebase.google.com/pricing), [Firestore Pricing](https://cloud.google.com/firestore/pricing), [Vercel Pricing](https://vercel.com/pricing), [Vercel Git Deployments](https://vercel.com/docs/deployments/git) e [OpenStreetMap Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/). Consulte os valores atuais no momento da decisão; eles mudam.
