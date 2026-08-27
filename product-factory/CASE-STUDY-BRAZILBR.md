# Caso de referência: o que o BrazilBR ensinou à Factory

Este arquivo é um ledger de fatos observados durante a construção, auditoria e preparação operacional do BrazilBR. Ele não é uma avaliação nova do produto e não transforma hipóteses em fatos.

## Problemas e correções observados

| Observação real | Padrão reutilizável |
|---|---|
| Um build Vercel concluído não garantia página útil; houve blank page por falha de runtime/configuração. | Landing pública deve renderizar antes de Auth; configuração ausente deve produzir fallback seguro e diagnóstico legível. |
| Auth funcionava, mas Firestore precisou ser criado/configurado e as Rules não podiam ser presumidas como publicadas. | Separar deployment de frontend, Auth/DB e Rules; registrar revisão publicada como evidência. |
| Refresh de rota autenticada retornava 404 em SPA Vite/Vercel. | Testar navegação interna e refresh direto; manter rewrite para `index.html` com exceções de assets/robots/sitemap. |
| Onboarding falhou quando payload e Rules não estavam alinhados. | Especificar campos, tipos, limites e owner antes do write; testar owner/other/anonymous. |
| `connections` usa `users`, enquanto um helper genérico esperava `participants`. | Helpers de autorização devem refletir o modelo de cada coleção; query e Rule devem ser comparadas juntas. |
| Red Team encontrou self-connection, self-conversation, auto-accept e transições indevidas. | Testar IDs iguais, spoofing e transições de estado como casos de primeira classe. |
| Writes separadas podiam deixar onboarding parcial, Place órfão, comentário sem contador ou mensagem sem resumo. | Usar batch/transação para invariantes multi-documento e testar falha entre etapas. |
| Histórico de contribuições precisava filtrar autor/status antes do `limit`. | Query Firestore deve restringir o conjunto no servidor, não depender só de filtro em memória. |
| Firebase Storage foi removido intencionalmente; mídia passou a ser URL externa HTTP/HTTPS. | Escolher boundaries de baixo custo, validar URL/tamanho/tipo, fallback visual e documentar dependência externa. |
| Landing foi reorientada para conversão e Auth mostrou Google + Email antes do formulário. | CTA deve ser testado como fluxo; não inventar depoimentos, usuários, resultados ou pricing ativo. |
| SEO exigiu páginas públicas reais, metadata, sitemap, robots, schema e pré-render. | Criar poucas páginas com intenção distinta; validar HTML servido, não só DOM após JavaScript. |
| Red Team deixou riscos: reactionCount, rate limiting, observabilidade, chunks, favicon e E2E real. | Relatório deve separar corrigido de residual; roadmap não pode esconder riscos. |

## O que funcionou

A combinação de stack simples, Firebase direto no cliente, Rules explícitas, batches atômicos, Vercel Git deployment, SPA fallback e mídia sem Storage reduziu infraestrutura inicial. A landing pública como primeiro estado evitou que Auth impedisse o visitante de entender o produto. O processo Red Team encontrou falhas de autorização e integridade que testes felizes não cobririam.

## O que falhou ou ficou inconclusivo

Build verde não provou runtime; dashboard Vercel não provou disponibilidade de variáveis durante o build; Rules locais não provaram publicação no Firebase real; autenticação real com Google, multiusuário e sessão expirada não foram plenamente automatizadas; auditoria de dependências ficou limitada quando Bun não estava disponível; métricas de produto não estavam centralizadas.

## Generalização permitida

A Factory pode reutilizar o método: preservar uma primeira renderização pública, mapear contratos de dados, testar matriz de autorização, preferir baixo custo, separar deploys, escrever smoke tests e exigir evidência. Ela não deve copiar Firebase, Leaflet, Vercel, pricing, claims ou coleções do BrazilBR para outro produto sem um Architecture Agent.
