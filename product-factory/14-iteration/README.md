# Stage 14 — ITERATION

**Entrada:** Production data and previous reports

**Saída:** `Post-Launch Report`

**Critério de gate:** Measure → Analyze → Hypothesis → Change → Test → Measure again.

**Restrições:** Não virar fila infinita de features sem evidência.

**Evidência obrigatória:** arquivo de saída versionado, fontes/testes, owner, data, riscos, decisão e próxima ação. Se algo não foi testado, registre `NOT_TESTED` e explique como testar.

**Próximo passo:** use o agente correspondente em `../agents/` e o template apropriado em `../templates/`. O Orchestrator somente avança depois de validar o gate em `../PIPELINE.md`.
