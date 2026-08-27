# ADR-0002: Low-cost first e saída reversível

- **Status:** Accepted
- **Contexto:** serviços pagos podem introduzir custo, lock-in e risco antes da validação.
- **Decisão:** começar por arquitetura simples/gerenciada, registrar quotas/custos/exit path e exigir aprovação antes de billing, domínio, anúncios ou serviço pago.
- **Consequência:** talvez haja limites de escala; o roadmap deve justificar quando trocar.
- **Reversibilidade:** export/backup e provider boundary são requisitos de Architecture/Operations.
