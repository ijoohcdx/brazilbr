# BrazilBR — pacote completo para deploy manual

Este pacote contém o código-fonte completo, o build de produção já validado, `vercel.json`, `firebase.json`, `.env.example` e `firestore.rules`.

## Deploy no Vercel

Use o diretório raiz deste pacote (`brazilbr-complete-deploy`) para importar o projeto ou fazer upload manual. Se a plataforma pedir configurações, use: framework Vite ou Other; build command `bun run build`; output directory `dist`; install command `bun install --frozen-lockfile`.

Para um upload somente do build, use o conteúdo da pasta `dist`; mantenha o `vercel.json` junto se a plataforma aceitar configuração de fallback SPA. As rotas internas devem encaminhar para `index.html`.

## Firebase e segurança

A aplicação usa somente Firebase Authentication e Cloud Firestore no caminho auditado. Não habilite Firebase Storage, billing, Functions pagas ou qualquer outro serviço pago. As variáveis `VITE_FIREBASE_*` são configurações públicas do cliente; não coloque segredos no bundle.

O arquivo `firestore.rules` inclui a correção que torna mensagens imutáveis, pois a UI atual não oferece edição de mensagens. Publique essas regras separadamente somente em um projeto Firebase já autorizado, após revisão.

## Validação realizada

O pacote foi gerado após instalação congelada com Bun, `bun run lint` e `bun run build`. O build passou; permanece apenas o alerta conhecido de bundle JavaScript acima de 500 kB. O build incluído em `dist` foi produzido com a configuração pública Firebase do ambiente atual.

## Pendências conhecidas

QA anterior registrou indisponibilidade em Mapa, Discover e Messages no ambiente público, além de riscos de negócio ainda abertos em notificações, autoria declarada, comentários, reações, lugares e ausência de testes automatizados de regras. Essas pendências não são resolvidas pelo upload estático.
