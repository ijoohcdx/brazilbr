# BrazilBR

Aplicativo comunitário para pessoas viajando, morando ou trabalhando no Brasil.

## Executar localmente

**Pré-requisito:** Bun 1.2.20 ou compatível.

1. Instale as dependências com `bun install`.
2. Copie `.env.example` para `.env.local`.
3. Preencha as variáveis `VITE_FIREBASE_*` do projeto Firebase utilizado pelo ambiente.
4. No Firebase Console, habilite somente os provedores de Authentication necessários e o Cloud Firestore.
5. Execute `bun run dev`.

## Build de produção

Use `bun run lint` para validar TypeScript e `bun run build` para gerar o bundle de produção. O projeto é uma SPA estática e o fallback de rotas é configurado em `vercel.json`.

## Arquitetura do MVP

O frontend usa React, Vite e TypeScript. Authentication e Cloud Firestore são acessados pelo SDK cliente e protegidos por `firestore.rules`. O MVP não usa Firebase Storage, upload de arquivos nem API própria. As contribuições de mídia armazenam apenas referências públicas HTTP/HTTPS fornecidas pelo usuário; a disponibilidade e a permanência desses links dependem do serviço externo.

## Variáveis e segurança

As variáveis `VITE_FIREBASE_*` são configurações públicas do cliente Firebase, não substituem as Security Rules. Nunca coloque senhas, tokens privados ou credenciais administrativas no bundle. Antes de publicar, valide Auth, regras Firestore e isolamento entre contas de teste.

## Deploy

A Vercel deve usar o lockfile `bun.lock` e a versão declarada em `package.json`. Não habilite Firebase Storage, billing ou outros serviços pagos como parte do deploy do MVP.
