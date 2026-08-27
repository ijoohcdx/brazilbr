# Product Readiness Score 0–100

O score é uma ferramenta de decisão, não uma prova de sucesso de mercado. Cada dimensão recebe 0–100 com evidência, owner e data; ausência de evidência recebe 0 na dimensão afetada, não uma estimativa.

## Pesos

| Dimensão | Peso | Evidência mínima |
|---|---:|---|
| Product | 15 | Problema, ICP, outcome, MVP e não-funcionalidades validados. |
| Technology | 15 | Build, arquitetura, banco, APIs, dependências e recuperação. |
| Security | 15 | Auth, authorization, secrets, isolation, XSS/injection, uploads, admin e rate limit. |
| UX | 10 | Fluxo novo/existente, erros, mobile/desktop, acessibilidade básica. |
| Production | 10 | Deploy, env, domínio, smoke, rollback, custos e monitoramento. |
| Conversion | 10 | Landing, CTA, claims verificáveis e teste de caminho principal. |
| SEO | 8 | Intent, metadata, canonical, schema, sitemap, robots e links. |
| Acquisition | 7 | Canais, oferta, mensagens, métrica, custo e abandono. |
| Monetization | 5 | Pricing como hipótese, experimento e limites. |
| Analytics | 5 | North Star, eventos, consentimento, retenção e dashboard. |
| **Total** | **100** |  |

## Rubrica por dimensão

| Nota | Critério |
|---:|---|
| 0 | Não analisado ou sem evidência. |
| 25 | Hipótese ou protótipo, riscos principais desconhecidos. |
| 50 | Parcialmente testado, falhas ou dependências importantes abertas. |
| 75 | Evidência suficiente para beta/lançamento controlado, riscos residuais registrados. |
| 100 | Evidência repetível, owner, monitoramento, rollback e limites claros. |

Calcule `sum(nota_da_dimensão × peso / 100)`, sem arredondar para esconder lacunas. Anexe a tabela de evidências ao score.

## Thresholds

| Score | Significado | Ação |
|---:|---|---|
| 0–39 | NÃO LANÇAR | Voltar a Product/Architecture/Security; não publicar. |
| 40–59 | PROTÓTIPO | Testar hipótese, não escalar aquisição nem cobrança. |
| 60–74 | BETA | Usuários controlados, observabilidade e feedback explícitos. |
| 75–89 | LANÇÁVEL | Lançamento controlado com rollback e owners. |
| 90–100 | ALTAMENTE PREPARADO | Pode escalar com monitoramento; não elimina risco de mercado. |

## Hard caps

Mesmo com score alto, o produto não pode avançar para lançamento se houver Critical aberto, High em Auth/authorization/data loss sem exceção aprovada, build quebrado, core action não testada, segredo exposto, ausência de rollback, cobrança não aprovada ou coleta de PII sem decisão de privacy. Em caso de `NOT_TESTED` em Auth/DB/produção, o máximo recomendado é `BETA` até teste autorizado.
