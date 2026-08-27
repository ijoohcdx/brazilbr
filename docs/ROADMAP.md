# Roadmap e limitações conhecidas

Este roadmap não é promessa de produto. Ele organiza riscos e decisões para o mantenedor priorizar com base em evidência, tráfego e orçamento.

## Estado conhecido

O fluxo público, Auth Google/Email, onboarding atômico, perfis, descoberta, mapa, Places, contribuições, posts, conexões, conversas e mensagens estão implementados no frontend e protegidos por Rules locais testadas durante a auditoria. O deployment Vercel associado ao commit `9ea9209` foi reportado como concluído e as rotas principais responderam 200 durante a validação anterior.

A publicação real de `firestore.rules` não foi confirmada nesta sessão. Trate a versão do Console/Firebase como potencialmente diferente do arquivo do Git até que uma pessoa autenticada compare e publique.

## Limitações abertas

| Prioridade | Limitação | Impacto | Critério de avanço |
|---|---|---|---|
| Alta | Não há confirmação versionada da Rules atualmente publicada. | O comportamento de produção pode divergir do código. | Registrar revisão/data do deploy no runbook após revisão humana. |
| Alta | Não há backup/export automatizado do Firestore ou Auth no repositório. | GitHub não recupera documentos, usuários ou configurações Firebase. | Proprietário definir rotina de backup, retenção, restore e custo. |
| Alta | Não há rate limiting server-side para reports, notifications e reactions. | Abuso pode gerar writes/custos. | Adotar backend/Cloud Function/provedor adequado com threat model e orçamento. |
| Alta | Não há observabilidade centralizada. | Incidentes exigem browser/Vercel/Firebase Console. | Definir logging, alertas e política de PII. |
| Média | `reactionCount` pode divergir do número real de reactions em concorrência. | Contador social pode ficar inconsistente. | Reprojetar com transação/contador confiável e teste multiusuário. |
| Média | Algumas listas têm limites fixos e ordenação parcialmente em memória. | Itens podem faltar ou custo/UX degradar com escala. | Paginação, índices e ordenação server-side com medição. |
| Média | Várias entradas client-side não têm `maxLength` de UX. | Usuário pode receber erro tardio das Rules. | Alinhar validação visual aos limites de Rules sem relaxá-las. |
| Média | Chunk JavaScript acima de 500 KB gera warning. | Performance inicial pode degradar em redes lentas. | Medir Core Web Vitals; dividir rotas só se a medição justificar. |
| Baixa | Favicon pode responder 404. | Pequeno ruído de navegador/branding. | Adicionar asset aprovado e manter exceção do rewrite. |
| Baixa | Auditoria completa de dependências ficou inconclusiva sem Bun/package-lock no sandbox. | CVEs podem não ter sido avaliadas por ferramenta final. | Rodar auditoria com Bun em ambiente autorizado e revisar atualizações. |
| Baixa | Google OAuth, sessão expirada, dois usuários reais e alguns cenários mobile não foram executados com credenciais autorizadas nesta sessão. | Cobertura E2E não é completa. | Criar contas de teste e automatizar matriz sem dados reais. |

## Próximas prioridades sugeridas

### P0 — preservar segurança e recuperação

Confirmar o projeto Firebase correto, exportar/backup conforme política do proprietário, registrar acesso de recuperação e conferir a Rules publicada sem expor dados. Manter GitHub, Vercel e Firebase com administradores recuperáveis e MFA quando disponível.

### P1 — reduzir risco operacional

Adicionar uma suíte versionada de Rules Emulator e smoke E2E com duas contas de teste. Registrar códigos de erro, deployment e versão de Rules. Criar alertas de quota/billing e um pequeno runbook de incidente para `permission-denied`, indisponibilidade Firestore e popup Auth.

### P2 — melhorar escala e UX

Alinhar `maxLength` dos inputs às Rules; introduzir paginação e índices; decidir estratégia para `reactionCount`; reduzir chunk apenas após medir; tratar acessibilidade, mobile e network throttling.

### P3 — avaliar serviços novos

Somente com necessidade comprovada, avaliar rate limiting, observabilidade, backup gerenciado, provedor de tiles OSM-derived e eventual backend. Cada item exige ADR, privacy review, orçamento e plano de rollback. Firebase Storage permanece fora do escopo até decisão específica de produto.

## Decisões que devem permanecer documentadas

O MVP é uma comunidade contextual por cidade, não uma plataforma de booking, intermediação de serviços, aconselhamento legal ou sistema imutável de reputação. Posts, Place links e contribuições podem estar incompletos, desatualizados ou apontar para hosts externos. A localização é city-level e opcional; maior precisão não deve ser adicionada por conveniência de implementação.

O app usa Firebase direto no cliente porque o MVP não tem backend próprio. Isso reduz infraestrutura inicial, mas torna Rules, limites de query e rate limiting especialmente importantes. O desenho deliberadamente não usa Storage: links externos reduzem superfície/custo de binários, mas sacrificam durabilidade e controle da mídia.
