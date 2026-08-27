# Stage 07 — SECURITY

**Entrada:** Código, Rules, env, APIs

**Saída:** `Security Report`

**Critério de gate:** Auth, authorization, rules, secrets, isolation, XSS, injection, CSRF, uploads, admin, exposure, rate limit.

**Restrições:** Zero regra aberta ou segredo publicado.

**Evidência obrigatória:** arquivo de saída versionado, fontes/testes, owner, data, riscos, decisão e próxima ação. Se algo não foi testado, registre `NOT_TESTED` e explique como testar.

**Próximo passo:** use o agente correspondente em `../agents/` e o template apropriado em `../templates/`. O Orchestrator somente avança depois de validar o gate em `../PIPELINE.md`.
