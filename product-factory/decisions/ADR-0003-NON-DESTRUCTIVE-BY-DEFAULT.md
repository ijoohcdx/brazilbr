# ADR-0003: Não destrutivo por padrão

- **Status:** Accepted
- **Contexto:** bugs de produção e mudanças de schema podem causar perda de dados.
- **Decisão:** não apagar/migrar dados, não force-push, não enfraquecer Rules, não publicar cobrança e não reverter dados como efeito colateral de rollback de código sem aprovação humana e backup.
- **Consequência:** incidentes podem exigir contenção mais lenta, mas preservam recuperação e auditoria.
