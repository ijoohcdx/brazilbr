# Stage 08 — PRODUCTION

**Entrada:** Build, env, security, platform

**Saída:** `Deployment Report`

**Critério de gate:** Build, environment, domain, Auth, database, security, monitoring, errors, mobile, desktop, smoke, rollback.

**Restrições:** Nenhuma ação paga automática.

**Evidência obrigatória:** arquivo de saída versionado, fontes/testes, owner, data, riscos, decisão e próxima ação. Se algo não foi testado, registre `NOT_TESTED` e explique como testar.

**Próximo passo:** use o agente correspondente em `../agents/` e o template apropriado em `../templates/`. O Orchestrator somente avança depois de validar o gate em `../PIPELINE.md`.
