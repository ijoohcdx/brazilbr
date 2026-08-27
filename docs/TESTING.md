# Testes e checklist de release

## Escopo atual

O projeto possui verificação TypeScript e build, mas não possui uma suíte unitária de frontend nem testes E2E versionados no repositório. O Firestore Rules pode ser validado no emulator com `@firebase/rules-unit-testing` quando o mantenedor instalar o utilitário de testes fora da aplicação. Não confunda `lint` com cobertura de comportamento.

## Verificações locais obrigatórias

Execute na raiz:

```bash
bun install --frozen-lockfile
bun run lint
bun run build
git diff --check
```

O resultado esperado de `bun run lint` é `tsc --noEmit` sem erro. O resultado de `bun run build` é `vite build` seguido do pré-render SEO, com `dist/index.html`, assets e as landings públicas. O warning de chunk acima de 500 KB é conhecido e não bloqueante; qualquer erro de compilação é bloqueante.

## Smoke test do frontend

Inicie o dev server ou preview:

```bash
bun run dev
# ou
bun run build
bun run preview
```

Teste a landing anônima em `/`. O primeiro CTA deve mostrar Google e Email antes do formulário. `Continue with Email` deve alternar para Sign In/Create Account; email malformado e senha curta devem ser rejeitados localmente. Sem ambiente Firebase, a landing deve renderizar e informar a configuração ausente sem tela branca.

Teste as URLs `/expat-community-brazil`, `/digital-nomad-brazil`, `/meet-people-in-brazil`, `/robots.txt` e `/sitemap.xml`. As três primeiras devem ter HTML/título/conteúdo distintos; robots e sitemap não devem ser capturados pelo rewrite SPA.

Com uma sessão de teste autorizada, percorra o fluxo: login → espera pelo sync do perfil → onboarding → Home → Discover → Map → Place → Profile → Messages → Conversation. Faça refresh direto em `/home`, `/map`, `/profile?uid=...` e `/conversation?id=...`; uma rota protegida nunca deve retornar 404 do servidor. Faça logout e confirme que dados privados desaparecem e que uma rota protegida retorna à landing.

## Matriz de casos

| Área | Casos mínimos | Resultado esperado |
|---|---|---|
| Cadastro | Google; Email/Password; email duplicado; senha curta; email inválido; popup cancelado. | Mensagem amigável, sem tela branca e sem estado autenticado falso. |
| Login | Credencial incorreta; usuário inexistente; rede indisponível; Auth desabilitado. | Erro visível, botão deixa de carregar e sessão não é criada. |
| Logout | Logout normal; refresh imediato; navegação por URL após logout. | Usuário anônimo e dados protegidos fora da tela. |
| Onboarding | Campo vazio; caracteres especiais; texto grande; falha Firestore entre tentativas; submit repetido. | Validação, batch atômico ou mensagem de erro; sem perfil pela metade. |
| Descoberta | Nenhum profile; profile próprio; lista grande; bloqueado; falha parcial. | Empty state, self omitido e erro parcial sem quebrar a tela. |
| Connections | Pedido válido; self; pedido repetido; aceite pelo destinatário; aceite pelo iniciador; bloqueio. | Rules impedem self/spoof; estado válido permanece consistente. |
| Messages | Conversa válida; self; sender falso; envio repetido; texto vazio/grande; falha de rede. | Apenas participante envia sua própria mensagem; batch mantém resumo consistente. |
| Posts | Texto vazio; link inválido; URL externa; comentário repetido; delete próprio/alheio. | Rules e UI rejeitam dados inválidos; ownership é mantido. |
| Places | Place válido; categoria inválida; URL inválida; Place + Contribution; mídia quebrada; delete alheio. | Batch evita órfão; fallback de mídia; ownership preservado. |
| Segurança | Usuário anônimo; UID adulterado; leitura privada; listagem indevida; Rules antigas. | Acesso negado e erro controlado. |
| Navegação | URLs diretas; query ID inexistente; refresh desktop/mobile. | SPA fallback 200, retorno seguro ou empty state. |
| Resiliência | Offline; latência; timeout; Firestore indisponível; sessão expirada. | Loading termina, erro é legível e não há write parcial. |

## Rules Emulator

O repositório contém `firestore.rules`. Para testar sem produção, use um projeto de teste e o Firestore Emulator. O teste deve criar contextos anônimo, owner e outro usuário. Valide pelo menos:

```text
owner cria o próprio publicProfile       ALLOW
anônimo lê publicProfile                  DENY
owner lê users de outro UID                DENY
owner cria connection com outro UID       ALLOW
owner cria connection consigo mesmo       DENY
owner aceita a própria connection          DENY
destinatário aceita connection             ALLOW
owner cria conversation com outro UID      ALLOW
owner cria mensagem como owner             ALLOW
outro cria mensagem fingindo owner         DENY
```

Se o Firebase CLI estiver autenticado, compile/publice Rules pelo procedimento em [`OPERATIONS.md`](./OPERATIONS.md). Não teste writes destrutivas no banco real; use emulator, projeto staging ou contas de teste e documentos identificados.

## Teste de produção sem mutação

Após um deploy, execute sem gravar dados:

```bash
BASE=https://brazilbr-zeta.vercel.app
curl -I "$BASE/"
curl -I "$BASE/expat-community-brazil"
curl -I "$BASE/map"
curl -I "$BASE/robots.txt"
curl -I "$BASE/sitemap.xml"
curl -sSI "$BASE/home" | grep -i x-robots-tag
```

Confirme status 200, `Content-Type` correto, `X-Robots-Tag: noindex, nofollow` em rota protegida, canonical/JSON-LD em páginas SEO e ausência de asset 404 no console. Para testar Auth/Firestore em produção, use contas explicitamente autorizadas e apague somente documentos criados pela própria bateria, respeitando o retention policy.

## Critério de release

Um release pode seguir para produção quando lint e build passam, o diff foi revisado, as Rules passaram no emulator, os caminhos públicos retornam 200, o Vercel reporta deployment concluído e não há mudança não intencional em Auth, modelo Firestore, Storage boundary ou fallback SPA. Uma falha em isolamento de dados, Auth, onboarding atômico, conexão, mensagem, regra, build ou deploy bloqueia a publicação.

## Testes ainda não automatizados

Não há testes E2E versionados para Google popup, expiração de sessão, rede lenta, múltiplos browsers, dois usuários reais, falha de Firestore em produção, Core Web Vitals ou acessibilidade automatizada. Planeje esses testes antes de abrir aquisição em escala; até lá, trate o produto como beta controlado.
