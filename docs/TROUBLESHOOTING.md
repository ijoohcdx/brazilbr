# Troubleshooting

Comece identificando o ambiente, o commit do frontend, o deployment Vercel e o projeto Firebase. Não peça ao usuário para colar API keys, tokens, senhas ou exports de dados. Compare o comportamento com os procedimentos de [`OPERATIONS.md`](./OPERATIONS.md) e [`TESTING.md`](./TESTING.md).

## A página está branca

Abra o console do browser e confirme se o HTML contém `#root`. Rode `bun run lint` e `bun run build` localmente. Verifique se `src/main.tsx` continua importando `App` e `index.css`, se não existe exceção síncrona em `src/firebase/config.ts` e se o fallback sem Firebase ainda monta `WelcomeScreen`.

Se a landing aparece, mas o login informa configuração ausente, verifique no Vercel os nomes exatos `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_MESSAGING_SENDER_ID` e `VITE_FIREBASE_APP_ID`. Variáveis Vite entram no bundle durante o build; salvar no dashboard sem redeploy não atualiza o JavaScript já publicado. Não imprima valores durante a investigação.

## Auth não funciona

Confirme no Firebase Console → Authentication → Sign-in method que Google e Email/Password estão habilitados. Para Google, confira domínios autorizados, popup bloqueado e o domínio do Vercel. Para Email/Password, confira formato, senha, usuário existente e mensagens de erro mapeadas em `src/firebase/auth.ts`.

Se o popup for fechado ou bloqueado, ofereça o fluxo Email. Não troque o provider, não adicione Phone Auth e não coloque OAuth secrets no frontend. Se a sessão parece criada, mas a UI não avança, observe a sequência `onAuthStateChanged` → sync profile → `profileLoading`; não remova o loading para “forçar” a tela.

## Onboarding não salva

Confirme que o usuário está autenticado no momento do submit e que o `uid` do contexto é o documento que será escrito. Verifique o erro exato no console, a coleção atingida e se as Rules publicadas correspondem ao `firestore.rules` do commit. `saveOnboardingProfile` deve escrever `users/{uid}`, `publicProfiles/{uid}` e `userContext/{uid}` em um batch atômico.

Campos vazios, tipos inesperados ou strings acima dos limites das Rules podem gerar `permission-denied`. Corrija a validação/UX ou o payload de forma compatível; não relaxe a Rule. Se uma parte do perfil aparece e outra não, confirme se o erro é de uma versão antiga da aplicação/Rules e não tente “consertar” apagando documentos.

## `permission-denied` em Discover ou Map

People Discovery lê `publicProfiles` com usuário autenticado e não deve depender de `users` privado. Connections usa a lista `users: [uid1, uid2]`; a Rule precisa validar essa lista com helper próprio, não reutilizar `participants` de conversas. O usuário não deve aparecer como self.

No Map, `Promise.allSettled` permite dados parciais quando Places ou profiles falha. Veja qual promise falhou, o path/operation e se a query foi alterada. Confira se a query é compatível com a Rule: uma query Firestore deve ser restrita de modo que todos os resultados possíveis satisfaçam a regra, não apenas filtrar depois em memória.

## Messages não funciona

Conversations usa `participants`, não `users`. A lista deve consultar `conversations` com `where('participants', 'array-contains', uid)`; mensagens vivem em `conversations/{conversationId}/messages`. A Rule deve exigir que o autenticado esteja em `participants` e que `senderId` seja o próprio UID.

Diferencie `permission-denied`, `unavailable`, `failed-precondition`, `not-found` e erro de rede. `permission-denied` aponta primeiro para Rules/query/projeto; `unavailable` sugere rede/serviço/offline; `failed-precondition` pode indicar índice; `not-found` pode indicar conversa ou banco incorreto. Registre somente código e contexto mínimo, nunca credentials.

## Refresh retorna 404

Confirme que o deployment usa [`vercel.json`](../vercel.json), que o rewrite para `/index.html` exclui `assets/`, `robots.txt`, `sitemap.xml` e `favicon.ico`, e que a build gerou `dist/index.html`. Um refresh direto em `/home`, `/map` ou `/conversation?...` deve receber o app shell; o roteamento final é do React.

Se `robots.txt` ou `sitemap.xml` retornarem o HTML da SPA, o rewrite foi ampliado de forma incorreta. Se assets retornarem HTML, restaure as exceções antes de qualquer otimização.

## Mapa vazio ou quebrado

Verifique se o mapa falha ao obter dados ou ao carregar tiles. OpenStreetMap exige URL HTTPS, attribution visível, referer no browser e caching adequado. Tile servers públicos não oferecem SLA e podem bloquear uso pesado; não faça prefetch, bulk download ou modo offline. Se os tiles carregam e não há markers, investigue a query de Places/profiles e o campo city-level, não troque automaticamente para Google Maps.

## Mídia externa não aparece

As URLs aceitas são apenas `http`/`https`, limitadas a 2.000 caracteres. Abra a URL fora da aplicação, confira `Content-Type` e CORS, e examine o fallback de `ExternalMediaPreview`. A origem pode exigir login, bloquear hotlink ou ter removido o recurso; isso não significa que Firebase Storage esteja faltando. Não implemente upload/proxy como correção rápida.

## SEO, robots ou favicon

As páginas públicas dependem de `src/seo.ts`, `SeoHead`, `SeoLandingPage` e `scripts/prerender-seo.tsx`. Rode `bun run build` e confira no `dist` as quatro páginas públicas, titles, descriptions, canonical, Open Graph, Twitter e JSON-LD. Rotas autenticadas devem manter `noindex`.

O favicon 404 é uma limitação conhecida se não houver `public/favicon.ico`. Corrija apenas se houver uma alteração de asset/branding aprovada; não remova a exceção do rewrite, pois ela evita devolver o app shell para o favicon.

## Deployment Vercel falhou

Verifique no log se falhou install, TypeScript, Vite ou pré-render. O install oficial é `bun install --frozen-lockfile`, o build é `bun run build` e o output é `dist`. Não faça upload de `dist` como fluxo normal; o Vercel deve gerar o artefato a partir do commit.

Se local passa e Vercel falha, compare versão Node/Bun, variáveis Production e diretório raiz. Não gere `package-lock.json` só para satisfazer um diagnóstico; preserve `bun.lock` até uma migração deliberada.

## Firestore database/rules

`getFirestore(app)` usa Cloud Firestore. Não há Realtime Database. Confirme no Firebase Console que o Cloud Firestore foi criado no projeto correto e que o bundle aponta para `brazilbr-e5576`. Se `firestore.rules` local passa, mas produção nega, compare a revisão publicada: deploy Vercel não publica Rules.

Para uma Rules nova, use emulator primeiro e publique apenas:

```bash
firebase deploy --only firestore:rules --project brazilbr-e5576
```

Isso exige login na Firebase CLI e deve ser feito por uma pessoa autorizada. Não use `allow read, write: if true` para diagnosticar.

## Sem observabilidade centralizada

O projeto não possui logging/metrics/tracing centralizados nem rate limiting server-side para reports, notifications e reactions. Em incidentes, use console do browser, logs Vercel, Firebase Console e uma conta de teste; registre commit, timestamp, ambiente e código do erro. Não transforme logs de diagnóstico em coleta permanente de PII sem revisão.
