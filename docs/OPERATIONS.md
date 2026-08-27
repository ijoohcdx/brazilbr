# Operação, deploy, rollback e recuperação

## Responsabilidades e contas

A manutenção depende de quatro acessos separados: GitHub para o código, Vercel para o frontend e deployments, Firebase/Google Cloud para Authentication/Firestore/Rules, e o domínio caso exista um domínio customizado. O Manus não é runtime, banco, CI obrigatório ou fonte de verdade.

| Recurso | Fonte de verdade | O que preservar |
|---|---|---|
| Código | GitHub `ijoohcdx/brazilbr`, branch `main` | Histórico, branches e permissões. |
| Frontend | Vercel project BrazilBR | Project settings, Production branch, env vars e deployments. |
| Auth/DB | Firebase project `brazilbr-e5576` | Providers, usuários, Firestore database e Rules. |
| Config local | `.env.local` fora do Git | Valores públicos do app web por ambiente. |
| Regras | `firestore.rules` no GitHub | Versão revisada e publicada separadamente. |
| Mapas | Leaflet + OpenStreetMap | Attribution, HTTPS tile URL e política de uso. |

## Variáveis de ambiente

Copie `.env.example` para `.env.local` localmente. No Vercel, configure as mesmas variáveis no ambiente **Production** e, quando necessário, também em Preview. Não imprima valores nos logs.

| Nome | Obrigatória no runtime | Onde é usada | Sensibilidade |
|---|---:|---|---|
| `VITE_FIREBASE_API_KEY` | Sim | Firebase App | Configuração pública do app web; não é service-account secret. |
| `VITE_FIREBASE_AUTH_DOMAIN` | Sim | Firebase Auth | Configuração pública. |
| `VITE_FIREBASE_PROJECT_ID` | Sim | Firebase App/Firestore | Configuração pública; deve ser `brazilbr-e5576` no ambiente atual. |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sim | Firebase App config | Configuração pública. |
| `VITE_FIREBASE_APP_ID` | Sim | Firebase App | Configuração pública. |
| `VITE_FIREBASE_MEASUREMENT_ID` | Não para Auth/Firestore | Preservado no objeto de config; Analytics não é inicializado pelo runtime atual. | Configuração pública. |

A configuração é lida em build time por `import.meta.env`. Alterar uma variável no Vercel exige novo deployment para que o bundle seja recompilado. `storageBucket` não é necessário e não deve ser adicionado de volta. Nunca coloque `GOOGLE_APPLICATION_CREDENTIALS`, service-account JSON, senha, token privado ou segredo de servidor em uma variável `VITE_*`, pois variáveis Vite são expostas ao browser.

## Ambiente local

Pré-requisitos: Git, Node.js 20+ e Bun 1.2.20 ou compatível. Em uma máquina nova:

```bash
git clone https://github.com/ijoohcdx/brazilbr.git
cd brazilbr
bun install --frozen-lockfile
cp .env.example .env.local
# editar .env.local sem commitar
bun run dev
```

Para build local:

```bash
bun run lint
bun run build
bun run preview
```

O `lint` atual é `tsc --noEmit`. O `build` executa `vite build` e `tsx scripts/prerender-seo.tsx`; o output é `dist/`. O warning conhecido de chunk acima de 500 KB não interrompe o build.

## Configuração do Vercel

O projeto deve estar ligado ao repositório `ijoohcdx/brazilbr`, com `main` como Production Branch. A configuração esperada é:

| Campo | Valor |
|---|---|
| Framework preset | Vite ou Other |
| Root directory | raiz do repositório |
| Install command | `bun install --frozen-lockfile` |
| Build command | `bun run build` |
| Output directory | `dist` |
| Node/Bun | compatível com `packageManager` do `package.json` |
| Production URL atual | `https://brazilbr-zeta.vercel.app/` |

`vercel.json` mantém duas responsabilidades: rewrite de rotas SPA para `/index.html` sem capturar assets, sitemap ou robots; e `X-Robots-Tag: noindex, nofollow` para rotas autenticadas. Não remova essas regras sem testar refresh direto e crawl.

O Vercel pode ser usado no plano Hobby ou Pro conforme o uso e o caráter comercial do produto; a página oficial atual lista os planos e limites [3]. Não presuma que uma quota gratuita é ilimitada.

## Deploy normal pelo GitHub

A publicação normal é automática após push em `main`. O procedimento seguro é:

```bash
git switch main
git pull --ff-only origin main
bun install --frozen-lockfile
bun run lint
bun run build
git diff --check
git status --short
git add <arquivos-revisados>
git commit -m "descrição curta da mudança"
git push origin main
```

Depois confirme o check Vercel no commit e verifique sem credenciais:

```bash
curl -I https://brazilbr-zeta.vercel.app/
curl -I https://brazilbr-zeta.vercel.app/map
curl -I https://brazilbr-zeta.vercel.app/robots.txt
curl -I https://brazilbr-zeta.vercel.app/sitemap.xml
```

Teste também pelo browser uma rota protegida com sessão anônima e uma rota SEO pública. O deploy do frontend **não publica Firestore Rules**.

## Deploy manual do frontend

Se a integração GitHub–Vercel for perdida, entre no Vercel com a conta proprietária e importe o repositório ou use o Vercel CLI autenticado. No diretório raiz:

```bash
bun install --frozen-lockfile
bun run build
# com Vercel CLI autenticado, se a equipe optar por CLI:
vercel --prod
```

Confirme que as variáveis Production estão configuradas no dashboard antes do build. Não faça upload de `.env.local`. Prefira a integração Git para preservar histórico e rollback; o CLI é um caminho de contingência.

## Deploy das Firestore Rules

Rules são um artefato separado. O proprietário precisa autenticar a Firebase CLI:

```bash
firebase login
firebase use brazilbr-e5576
firebase deploy --only firestore:rules
```

Antes de publicar, valide o conteúdo no emulator e revise o diff. Se a CLI não estiver disponível, abra Firebase Console → Firestore Database → Rules, cole o conteúdo versionado de `firestore.rules`, revise e publique. Não publique `storage.rules`, não crie bucket e não habilite Storage.

A aplicação pode estar em produção mesmo com Rules antigas; por isso, registre separadamente o commit do frontend e a versão/data das Rules publicadas.

## Rollback do frontend

O caminho preferido é o rollback do Vercel: abra o projeto, escolha um deployment anterior conhecido como saudável e use **Instant Rollback** conforme a documentação oficial [5]. Depois verifique home, login selector, uma rota protegida e o bundle. Rollback do Vercel não reverte Firestore Rules nem dados.

O caminho reproduzível por Git é criar um commit de revert:

```bash
git switch main
git pull --ff-only origin main
git revert <commit-problematico>
git push origin main
```

Não reescreva o histórico de `main` com force push como primeira resposta a incidente.

## Rollback de Rules

Rules devem ser revertidas para um arquivo conhecido no Git e publicadas explicitamente:

```bash
git show <commit-conhecido>:firestore.rules > /tmp/firestore.rules.rollback
# revisar o arquivo; depois substituir apenas após aprovação
firebase deploy --only firestore:rules --project brazilbr-e5576
```

Uma Rules rollback pode impedir writes novas e não desfaz writes que já ocorreram. Não apague documentos para reverter comportamento de aplicação.

## Recuperação se o ambiente atual desaparecer

O procedimento de recuperação é:

1. Obter acesso ao GitHub e clonar `https://github.com/ijoohcdx/brazilbr.git`.
2. Confirmar o commit saudável e executar `bun install --frozen-lockfile`, `bun run lint` e `bun run build`.
3. Criar ou recuperar um projeto Vercel, importar o repositório e apontar Production Branch para `main`.
4. Recriar no Vercel as seis variáveis `VITE_FIREBASE_*` sem imprimir valores.
5. Confirmar que o Firebase project ID continua `brazilbr-e5576`; se o projeto Firebase ainda existir, não crie outro projeto nem migre dados.
6. Configurar no Firebase Auth os provedores Google e Email/Password e autorizações de domínio.
7. Confirmar que o Cloud Firestore existe e publicar `firestore.rules` por CLI autenticada/Console.
8. Verificar a URL pública, Auth, onboarding, uma read/write autorizada e isolamento entre duas contas de teste.

O GitHub não contém usuários, Auth providers, documentos Firestore, variáveis Vercel ou histórico de cobrança. Se a conta Firebase/Google for perdida, o código sozinho não recupera os dados. Mantenha administradores, métodos de recuperação e acesso de cobrança fora deste repositório. Não existe backup automático versionado neste projeto no momento; configure export/backup do Firestore conforme necessidade e orçamento antes de considerar recuperação de dados garantida.

## Custos e serviços

| Serviço | Uso atual | Faixa sem custo/risco |
|---|---|---|
| GitHub | Código e histórico | O custo depende da conta/plano; Git é a fonte de recuperação. |
| Vercel | CDN, build, HTTPS, rewrites e deploy | Hobby é $0/mês segundo a página oficial, com limites; Pro aparece como $20/mês, e uso excedente/add-ons podem custar. [3] |
| Firebase Authentication | Google e Email/Password | A página oficial lista outros serviços de Auth com no-cost até 50K MAU; Phone Auth é cobrado por SMS. [1] |
| Cloud Firestore | Perfis, contexto, social, Places, mensagens | A página oficial lista, no default/free quota, 1 GiB, 50K reads/dia, 20K writes/dia, 20K deletes/dia e 10 GiB/mês egress; além disso é cobrado conforme localização/uso. [1] [2] |
| OpenStreetMap tiles | Mapa Leaflet | Dados OSM são livres, mas tile servers são best-effort, sem SLA; uso pesado pode ser bloqueado e exige attribution/cache/HTTPS. [4] |
| Firebase Storage | **Não usado** | Não habilitar nem estimar como dependência do MVP. |
| Cloud Functions/Run/SQL | **Não usado** | Qualquer adoção exige decisão de arquitetura e orçamento. |

Firestore cobra por reads, writes, deletes, index entries, armazenamento e bandwidth; queries vazias ainda têm mínimo de leitura e Rules com `get/exists/getAfter` podem adicionar reads [2]. Configure budgets e alertas no Google Cloud. Budget não é um hard stop automático: monitoramento não substitui controle de uso.

## Dados e backup

Antes de habilitar PITR, backups ou restore, revise o custo: a documentação oficial de Firestore informa que essas funções não possuem free usage [2]. Defina retenção, localização, quem pode restaurar e onde os exports serão armazenados. Nunca teste restore sobre a base de produção sem um projeto de staging.

## Dependências externas e indisponibilidade

A Auth e o Firestore dependem do Firebase; o mapa depende de tiles OSM; imagens e links de Places dependem de hosts externos; Vercel depende do GitHub para o caminho automático. A aplicação deve exibir estados de erro, fallback de mídia e não tratar um link externo como dado permanente.

## Referências

[1]: https://firebase.google.com/pricing "Firebase Pricing"
[2]: https://cloud.google.com/firestore/pricing "Cloud Firestore pricing"
[3]: https://vercel.com/pricing "Vercel Pricing"
[4]: https://operations.osmfoundation.org/policies/tiles/ "OpenStreetMap Tile Usage Policy"
[5]: https://vercel.com/docs/deployments/instant-rollback "Vercel Instant Rollback"
[6]: https://firebase.google.com/docs/cli "Firebase CLI reference"
