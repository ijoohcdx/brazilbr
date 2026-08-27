# Modelo de dados do BrazilBR

O Cloud Firestore é schemaless, mas o aplicativo possui contratos lógicos definidos em `src/types.ts`, nos módulos `src/firebase/` e em `firestore.rules`. Este documento descreve o contrato operacional atual. Não use `firebase-blueprint.json` como fonte autoritativa: ele é parcial e não cobre o estado atual do produto.

## Coleções principais

| Coleção | Visibilidade | Ownership | Uso |
|---|---|---|---|
| `users/{uid}` | Privada ao próprio usuário | `uid == request.auth.uid` | Perfil privado, email e estado do onboarding. |
| `publicProfiles/{uid}` | Leitura autenticada | O próprio `uid` cria/edita | Projeção pública para Discover, Map e Profile. |
| `userContext/{uid}` | Privada ao próprio usuário | `uid == request.auth.uid` | Necessidade atual e cidade atual. |
| `connections/{connectionId}` | Participantes | `request.auth.uid` em `users` | Pedido/estado de conexão entre duas contas. |
| `conversations/{conversationId}` | Participantes | `request.auth.uid` em `participants` | Resumo de conversa e última mensagem. |
| `posts/{postId}` | Posts públicos ou autor | `authorId` para escrita | Feed e posts da comunidade. |
| `comments/{commentId}` | Autenticada | `authorId` para alteração/remoção | Comentários vinculados por `postId`. |
| `reactions/{reactionId}` | Autenticada | `userId` para criação/remoção | Reação determinística por post/usuário. |
| `contributions/{contributionId}` | Publicadas para leitura | `authorId` | Conhecimento comunitário, links e mídia externa. |
| `places/{placeId}` | Autenticada | `createdBy` para base | Places comunitários e links práticos. |
| `notifications/{notificationId}` | Destinatário | `recipientId` | Notificações de ações sociais. |
| `reports/{reportId}` | Somente criação | `reporterId` | Denúncias; não são legíveis pelo cliente. |
| `groups/{groupId}` | Membros | `ownerId` | Grupos e membros. |

## Subcoleções

`conversations/{conversationId}/messages/{messageId}` contém mensagens. A regra consulta o documento pai e exige que o usuário seja participante. A criação exige `conversationId`, `senderId == request.auth.uid`, texto não vazio e limite de 2.000 caracteres. Mensagens são imutáveis no cliente atual: update e delete devem continuar negados.

`places/{placeId}/media/{mediaId}` contém referências externas contribuídas pela comunidade. Não contém bytes. O documento exige `id == mediaId`, `placeId`, `contributorId == request.auth.uid`, URL `http/https`, tipo permitido e `createdAt` string. Somente o contribuidor pode atualizar/remover sua referência.

`places/{placeId}/placeContributions/{placeContributionId}` contém correções, recomendações, menu, tip, wifi ou review relacionados a um Place. O autor pode alterar/remover o próprio registro; qualquer usuário autenticado pode ler.

## Contratos de perfil

`users/{uid}` deve conter `uid` igual ao documento e, quando presentes, email, displayName, photoURL, bio, países, cidade, languages, interests, timestamps, `onboardingCompleted` boolean e `showOnMap` boolean. `publicProfiles/{uid}` não deve receber campos privados sem revisão de Rules e privacidade.

A função `syncUserProfile` cria ou atualiza o perfil após Auth. `saveOnboardingProfile` grava `users`, `publicProfiles` e `userContext` em batch. `saveProfilePhotoURL` grava apenas uma referência de foto externa validada, sem upload. Se uma alteração voltar a separar essas writes, deve haver revisão de integridade.

## Contratos de conexão e conversa

Uma conexão representa exatamente duas identidades distintas em `users`. O criador grava `initiatedBy` com seu UID e estado inicial `pending` ou `blocked`. O destinatário pode aceitar/recusar uma solicitação pendente; participantes podem bloquear. A Rules não deve permitir que o iniciador aceite a própria solicitação, altere o iniciador ou faça self-connection.

Uma conversa válida possui exatamente dois participantes distintos. O ID usado pelo cliente é determinístico para o par, mas isso não substitui a validação nas Rules. O resumo contém os dados necessários para a lista de mensagens; a mensagem é gravada com batch junto da atualização do resumo.

## Posts, comentários e reactions

Posts públicos têm `authorId`, `content`, `city`, `media`, `linkUrl`, `visibility`, contadores e timestamps. Mídias externas são referências `http/https`; `mediaUrl` legado deve permanecer nulo para novos posts. Comentários são documentos separados e o contador é atualizado junto em batch.

A reaction usa um ID determinístico baseado em post e usuário. O cliente atual persiste a reação em documento separado. `reactionCount` pode não refletir perfeitamente a soma quando várias sessões operam simultaneamente; não altere a Rules para permitir contadores arbitrários sem projetar uma validação atômica.

## Contributions e Places

Contribuições gerais têm `authorId`, `type`, `title`, `description`, `location`, `city`, `country`, `placeId?`, `media`, `links`, `metadata`, `status` e timestamps. `status` pode ser `published` ou `draft`, mas a leitura pública atual exige `published`.

Quando a tela cria um novo Place junto de uma Contribution, `src/firebase/publishing.ts` grava ambos em um único batch. Essa operação é crítica: não reintroduza dois writes independentes que possam deixar um Place sem a contribuição que o originou.

## Mídia externa

`MediaReference` contém `id`, `externalUrl`, `type`, `caption?`, `contributorId` e `createdAt`. Apenas `http://` e `https://` são aceitos, com limite de 2.000 caracteres. O browser pode falhar ao carregar ou o host pode remover a URL; a UI deve exibir fallback e nunca tratar a URL externa como arquivo próprio.

> Não há bucket, path, upload, download ou proxy de Firebase Storage no modelo atual.

## Regras para migrações

Antes de alterar campos ou coleções, faça uma migração aditiva e documente versão, leitura retrocompatível e rollback. Nunca renomeie uma coleção em produção por edição manual. Nunca apague documentos para corrigir um schema sem backup/export aprovado. O cliente deve tolerar campos legados durante uma janela de migração.

## Operações e custos de leitura

Queries com `limit` protegem o custo, mas não substituem paginação quando o produto crescer. Firestore cobra leituras, writes, deletes, index entries, armazenamento e rede; Rules que usam `get`, `exists` ou `getAfter` podem adicionar leituras. Consulte [Firestore pricing](https://cloud.google.com/firestore/pricing) antes de aumentar listeners, limites ou resultados.
