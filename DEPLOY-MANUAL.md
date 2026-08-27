# Deploy manual — legado e contingência

Este arquivo permanece por compatibilidade com referências antigas. O fluxo normal do BrazilBR é **GitHub `main` → Vercel**, com build automático de `bun run build` e output `dist/`. Não faça upload manual de `dist/` como procedimento padrão.

Para o procedimento operacional atual, consulte [`docs/OPERATIONS.md`](./docs/OPERATIONS.md), especialmente as seções de configuração Vercel, deploy pelo GitHub, deploy manual de contingência, publicação de Firestore Rules, rollback e recuperação.

## Contingência do frontend

Se a integração GitHub–Vercel estiver indisponível, um mantenedor autorizado pode importar o repositório no Vercel ou usar a CLI autenticada:

```bash
bun install --frozen-lockfile
bun run lint
bun run build
vercel --prod
```

As variáveis `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_MESSAGING_SENDER_ID` e `VITE_FIREBASE_APP_ID` devem estar configuradas no ambiente de build. Não coloque `.env.local` no repositório e não imprima os valores.

## Firestore Rules

O deploy do Vercel não publica Rules. Depois de revisar/testar [`firestore.rules`](./firestore.rules), um administrador Firebase pode executar:

```bash
firebase login
firebase deploy --only firestore:rules --project brazilbr-e5576
```

Não crie Storage Rules, bucket ou upload: Firebase Storage não faz parte do runtime do MVP. O rollback de frontend não reverte dados ou Rules; siga o runbook atual.
