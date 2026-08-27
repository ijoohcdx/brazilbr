# Playbook: incidente e recuperação independente

## Triagem

Identifique produto, ambiente, commit, serviço afetado, janela, sintomas, usuários impactados e se há security/data issue. Preserve evidências e não faça limpeza destrutiva.

## Contenção

Pause somente o fluxo afetado quando possível. Para exposição de dados, restrinja Rules e preserve logs. Para erro de frontend, use rollback de deployment ou `git revert`; para Rules, use uma revisão conhecida. Não reverta dados automaticamente.

## Recuperação

Reestabeleça GitHub → hosting, env por ambiente, Auth providers/domínios, database, Rules, domínio e smoke tests. Se o banco foi perdido, Git não recupera usuários/documentos; restaure somente de backup/export previamente configurado e em staging primeiro.

## Pós-incidente

Registre timeline, root cause, impacto, correção, teste preventivo, owner, prazo e residual risk. Atualize o agente/checagem que deveria ter detectado o problema.
