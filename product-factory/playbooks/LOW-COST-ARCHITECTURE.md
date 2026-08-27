# Playbook: arquitetura de baixo custo

1. Comece pelo core outcome e o volume esperado, não pela stack favorita.
2. Prefira serviço gerenciado gratuito/baixo custo quando não reduzir segurança ou reversibilidade.
3. Liste custo fixo, variável, quota, egress, backup, observabilidade e caminho de saída.
4. Separe frontend, Auth, database, storage, APIs e jobs; registre owner de cada conta.
5. Não habilite billing, Storage, Phone Auth, mapas pagos, Functions ou backend sem ADR e aprovação.
6. Proteja dados no servidor/Rules; o browser não é trusted.
7. Faça batch/transação quando uma ação exige múltiplos documentos.
8. Defina env names, secret handling, backup, restore e rollback antes do deploy.
9. Teste cold start, offline, quota, empty state, error state e custo de query.
10. Se o serviço pago desaparecer, saiba exportar dados e trocar provider.

O caso BrazilBR demonstrou por que um cliente Firebase direto pode ser adequado para MVP, mas também por que Rules, limites e rate limiting precisam ser tratados como arquitetura, não como detalhe de UI.
