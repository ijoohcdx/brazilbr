# BrazilBR

Aplicativo comunitário para pessoas viajando, morando, trabalhando ou se estabelecendo no Brasil. O produto conecta **pessoas, Places e contexto local** por cidade e necessidade atual. O MVP usa React/Vite/TypeScript no frontend, Firebase Authentication, Cloud Firestore, Leaflet/OpenStreetMap e Vercel.

> **Objetivo deste repositório:** permitir que outro desenvolvedor clone, execute, valide, publique, faça rollback e recupere o BrazilBR sem depender do Manus.

## Kalipeiro Product Factory

Este repositório também contém a **Kalipeiro Product Factory**, um sistema documental e executável para repetir o processo de ideia → pesquisa → validação → produto → arquitetura → desenvolvimento → QA → segurança → deploy → conversão → SEO → aquisição → monetização → analytics → iteração. Ela foi extraída das experiências reais do BrazilBR e não é uma feature do produto.

Comece em [`product-factory/README.md`](./product-factory/README.md). O sistema inclui pipeline e gates, 15 prompts de agentes (incluindo Idea Agent), Master Orchestrator, templates, checklists, playbooks, score de prontidão, manifestos e ADRs. A Factory não altera automaticamente o runtime, não ativa cobrança, não publica infraestrutura e não executa ações destrutivas sem decisão humana.

## Estado atual e links

| Recurso | Local |
|---|---|
| Repositório | [github.com/ijoohcdx/brazilbr](https://github.com/ijoohcdx/brazilbr) |
| Branch de produção | `main` |
| Produção | [brazilbr-zeta.vercel.app](https://brazilbr-zeta.vercel.app/) |
| Projeto Firebase | `brazilbr-e5576` |
| Regras Firestore | [`firestore.rules`](./firestore.rules) |
| Configuração Vercel | [`vercel.json`](./vercel.json) |
| Configuração Firebase CLI | [`firebase.json`](./firebase.json) e [`.firebaserc`](./.firebaserc) |

## Começar em uma máquina nova

Os comandos oficiais usam Bun porque o lockfile versionado é `bun.lock` e o pacote declara `bun@1.2.20` como package manager. Instale Node.js 20 ou superior e Bun 1.2.20 ou compatível.

```bash
git clone https://github.com/ijoohcdx/brazilbr.git
cd brazilbr
bun install --frozen-lockfile
cp .env.example .env.local
```

Preencha `.env.local` com os valores da aplicação Web Firebase. Os nomes exatos estão documentados em [`docs/OPERATIONS.md`](./docs/OPERATIONS.md). Nunca faça commit de `.env.local`.

```bash
bun run dev
```

Abra o endereço local mostrado pelo Vite. Para validar o artefato de produção antes de publicar:

```bash
bun run lint
bun run build
bun run preview
```

`lint` executa `tsc --noEmit`. `build` executa o build Vite e o pré-render das páginas SEO públicas.

## Documentação de manutenção

| Documento | Conteúdo |
|---|---|
| [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) | Arquitetura, stack, estrutura de pastas, rotas e dependências reais. |
| [`docs/DATA-MODEL.md`](./docs/DATA-MODEL.md) | Coleções, subcoleções, campos, ownership e fluxos de dados. |
| [`docs/API.md`](./docs/API.md) | Boundaries do SDK, integrações externas e ausência de backend HTTP próprio. |
| [`docs/SECURITY.md`](./docs/SECURITY.md) | Regras Firestore, limites de confiança, privacidade e invariantes. |
| [`docs/OPERATIONS.md`](./docs/OPERATIONS.md) | Ambiente, produção, custos, deploy, rollback e recuperação. |
| [`docs/TESTING.md`](./docs/TESTING.md) | Validação local, smoke test, regras e checklist antes de publicar. |
| [`docs/TROUBLESHOOTING.md`](./docs/TROUBLESHOOTING.md) | Diagnóstico de Auth, Firestore, Vercel, rotas, mapa e mídia externa. |
| [`docs/ROADMAP.md`](./docs/ROADMAP.md) | Limitações conhecidas, prioridades e decisões futuras. |

## Guardrails: o que não deve ser alterado sem revisão

O projeto possui decisões de segurança e compatibilidade que não devem ser removidas em uma refatoração comum. Não troque o projeto Firebase `brazilbr-e5576`, não substitua o `AuthProvider`, não remova o guard de `profileLoading`, não transforme a SPA em um app que dependa de servidor sem atualizar o runbook de produção e não remova o fallback de `index.html` no `vercel.json`.

As coleções privadas devem continuar protegidas pelas regras de [`firestore.rules`](./firestore.rules). Nunca adicione `allow read, write: if true`, nunca coloque service-account keys no frontend e nunca confie no `authorId`, `uid`, `senderId` ou `contributorId` enviado pelo cliente sem validação nas Rules.

> **Firebase Storage é intencionalmente não utilizado.** O MVP funciona com texto, links e referências externas `http/https`. Não adicione `firebase/storage`, bucket, Storage Rules, upload de arquivos ou proxy de binários sem uma decisão arquitetural nova, revisão de custos e migração documentada.

Não apague coleções, documentos, usuários ou regras para “resetar” um ambiente. Use um projeto Firebase de demonstração ou o emulator para testes destrutivos.

## Fluxo principal do usuário

O visitante começa na landing pública, escolhe Google ou Email, autentica, aguarda a sincronização do perfil, conclui o onboarding e define cidade, idiomas, interesses e necessidade atual. Depois usa Home, Discover, Map, Places, Feed, Contributions, Connections e Messages. A localização compartilhada é city-level e a visibilidade no mapa é opcional.

As rotas públicas SEO são `/`, `/expat-community-brazil`, `/digital-nomad-brazil` e `/meet-people-in-brazil`. As rotas autenticadas são `/home`, `/onboarding`, `/map`, `/place`, `/discover`, `/profile`, `/messages`, `/conversation`, `/groups`, `/search`, `/contribute`, `/notifications` e `/friends`. O Vercel encaminha rotas da SPA para `index.html`; o cliente decide se deve mostrar a landing, onboarding ou app autenticado.

## Deploy resumido

O deployment normal é feito por push na `main`. O Vercel deve usar `bun install --frozen-lockfile`, `bun run build` e `dist`. Antes do push:

```bash
git switch main
git pull --ff-only origin main
bun install --frozen-lockfile
bun run lint
bun run build
git diff --check
git add <arquivos>
git commit -m "descrição curta da mudança>"
git push origin main
```

O deployment automático pode ser acompanhado no dashboard do Vercel. Alterações em `firestore.rules` são separadas do Vercel e precisam ser publicadas no projeto Firebase por uma CLI autenticada ou pelo Firebase Console. O procedimento completo, rollback e recuperação estão em [`docs/OPERATIONS.md`](./docs/OPERATIONS.md).

## Serviços e custos

O runtime atual usa Firebase Authentication, Cloud Firestore, Vercel, GitHub e tiles públicos do OpenStreetMap. Auth não-phone e quotas iniciais do Firestore possuem faixas sem custo conforme os planos e páginas oficiais, mas leituras, writes, armazenamento, egress, MAU acima das faixas, Vercel comercial/uso excedente, domínio e eventual provedor alternativo de mapas podem gerar custos. O projeto não usa Storage, Functions, Cloud Run, banco SQL ou backend próprio.

Não trate “free tier” como orçamento ilimitado. Configure alertas no Google Cloud/Firebase e monitore quotas antes de abrir o produto para tráfego relevante. Consulte [`docs/OPERATIONS.md`](./docs/OPERATIONS.md) para os limites documentados e links oficiais.

## Licença e responsabilidade operacional

Este repositório não contém credenciais privadas. A configuração pública do Firebase no bundle não é um segredo; a proteção real está nas Rules. O proprietário deve manter acesso ao GitHub, Vercel, Firebase Console, domínio e contas de cobrança. Se o ambiente do Manus desaparecer, o código continua recuperável pelo GitHub e os dados continuam no projeto Firebase, desde que essas contas e configurações sejam preservadas.
