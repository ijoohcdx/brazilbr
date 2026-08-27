# APIs e boundaries de integração

## Não há API HTTP própria

O BrazilBR não possui servidor Express/FastAPI, endpoints REST, GraphQL ou funções server-side no repositório. O browser chama o SDK Firebase diretamente; portanto, qualquer mudança de API deve ser tratada como mudança de arquitetura, não como simples criação de rota.

## Módulos Firebase do cliente

| Módulo | Boundary | Operações principais |
|---|---|---|
| `src/firebase/config.ts` | Firebase App/Auth/Firestore | Inicialização com `VITE_FIREBASE_*`; fallback seguro sem configuração. |
| `src/firebase/auth.ts` | Firebase Authentication | Google Popup, Email/Password sign-up/sign-in e logout. |
| `src/firebase/userProfile.ts` | `users`, `publicProfiles`, `userContext` | Sync após Auth, onboarding atômico e foto como URL externa. |
| `src/firebase/discovery.ts` | `publicProfiles` | Lista de perfis públicos autenticados. |
| `src/firebase/connections.ts` | `connections` | Criar, aceitar, recusar, bloquear e listar conexões por par de UIDs. |
| `src/firebase/messages.ts` | `conversations` e `messages` | Criar conversa, listar conversas, listar mensagens e enviar com batch. |
| `src/firebase/posts.ts` | `posts`, `comments`, `reactions` | Feed, comentário com contador em batch e reactions. |
| `src/firebase/contributions.ts` | `contributions` | Criar, listar e consultar histórico por autor/status. |
| `src/firebase/places.ts` | `places` e subcoleções | Places, mídia externa e contribuições do Place. |
| `src/firebase/publishing.ts` | `places` + `contributions` | Publicação conjunta atômica. |
| `src/firebase/notifications.ts` | `notifications` | Listar/marcar notificações dentro do ownership. |
| `src/firebase/groups.ts` | `groups` | Grupos e membros conforme Rules. |
| `src/firebase/search.ts` | Dados públicos suportados | Busca do domínio conforme limites definidos pelo cliente. |
| `src/firebase/safety.ts` | `reports` | Criação de report sem leitura do acervo de denúncias. |
| `src/firebase/media.ts` | Referências externas | Aceitar somente URL `http/https`; nenhum upload. |

Os nomes exatos das funções e payloads são o código-fonte autoritativo. Ao adicionar uma operação, atualize primeiro o módulo do domínio, depois `firestore.rules`, testes do emulator e documentação do modelo de dados.

## Contratos de erros

O SDK pode retornar códigos como `auth/popup-closed-by-user`, `auth/invalid-credential`, `permission-denied`, `unavailable`, `failed-precondition` e `not-found`. A interface deve converter erros esperados em estado legível, sem ocultar a causa no console de desenvolvimento e sem exibir credenciais.

`permission-denied` exige revisar Auth, query e Rules publicadas; `unavailable` exige revisar conectividade/indisponibilidade; `failed-precondition` pode indicar índice ou precondição; `not-found` pode indicar path/projeto/banco incorreto. Não transforme um erro de autorização em retry infinito.

## Firebase SDK e integridade

O projeto usa módulos diretos `@firebase/app`, `@firebase/auth` e `@firebase/firestore`. Não reintroduza o pacote agregado `firebase` sem uma decisão deliberada de dependência e não importe `firebase/storage`. As operações críticas são batches: onboarding (`users` + `publicProfiles` + `userContext`), mensagem (mensagem + resumo), comentário (comentário + contador) e publicação Place + Contribution.

## Serviços externos

| Serviço | Protocolo/endpoint | Observação |
|---|---|---|
| Firebase Auth | SDK HTTPS/WebSocket interno do Firebase | Google Popup e Email/Password. |
| Cloud Firestore | SDK Firestore | Rules são a autorização; não há Admin SDK no browser. |
| OpenStreetMap | Tiles HTTPS via Leaflet | Respeitar attribution, referer e caching; sem bulk/offline. |
| Hosts de mídia/Places | URLs `http/https` do usuário | Podem exigir login, bloquear hotlink ou desaparecer. |
| Vercel | HTTPS/CDN | Entrega bundle, HTML pré-render e fallback SPA. |

Nunca implemente um proxy de mídia no Vercel como “correção” para CORS sem threat model, limite de tamanho, allowlist, custo e decisão explícita. O desenho atual não transfere binários.
