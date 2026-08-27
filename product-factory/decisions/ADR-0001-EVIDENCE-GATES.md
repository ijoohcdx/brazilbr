# ADR-0001: Gates baseados em evidência

- **Status:** Accepted
- **Contexto:** agentes podem declarar conclusão sem evidência, levando desenvolvimento prematuro.
- **Decisão:** cada estágio precisa de artefato, fonte/teste, owner, status e decisão; Orchestrator verifica independentemente.
- **Consequência:** mais trabalho de registro, menos avanço ilusório; `NOT_TESTED` permanece explícito.
- **Reversibilidade:** alterar template/gate com ADR e manter compatibilidade de artefatos existentes.
