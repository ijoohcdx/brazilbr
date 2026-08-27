# Segurança e privacidade

## Modelo de confiança

O frontend é público e pode ser modificado por qualquer usuário no próprio browser. Portanto, tudo que chega do cliente é não confiável: `uid`, `authorId`, `senderId`, `recipientId`, `contributorId`, status, URLs, textos e IDs. O cliente fornece conveniência; [`firestore.rules`](../firestore.rules) fornece autorização.

Nunca use uma condição equivalente a `allow read, write: if true`. O fallback final das Rules deve continuar negando o que não foi explicitamente autorizado.

## Identidade e autenticação

O Firebase Authentication oferece Google e Email/Password. O código usa `onAuthStateChanged` para obter a identidade atual. As Rules devem comparar identidades com `request.auth.uid`, nunca com email ou nome exibido.

As cinco variáveis obrigatórias de configuração são `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_MESSAGING_SENDER_ID` e `VITE_FIREBASE_APP_ID`. `VITE_FIREBASE_MEASUREMENT_ID` existe no exemplo, mas não é necessário para Auth/Firestore no runtime atual. Esses valores identificam a aplicação web; não são service-account secrets. Mesmo assim, nunca coloque credenciais administrativas, tokens privados ou chaves privadas no bundle.

Quando a configuração está ausente, `src/firebase/config.ts` deixa `auth` e `db` nulos; a landing deve continuar renderizando e as ações mostram uma mensagem de configuração. Não contorne esse guard inicializando serviços com valores falsos.

## Firestore Rules críticas

As regras atuais protegem:

| Área | Invariante |
|---|---|
| `users` | Somente o próprio UID lê/cria/atualiza; listagem privada permanece negada. |
| `publicProfiles` | Leitura exige sessão; escrita exige que o UID do documento seja o usuário autenticado. |
| `userContext` | Somente o próprio usuário lê e grava seu contexto. |
| `connections` | `users` é lista com duas identidades distintas; o próprio iniciador não pode aceitar a solicitação. |
| `conversations` | `participants` contém participantes distintos; somente participante acessa a conversa e mensagens. |
| `messages` | `senderId` deve ser o usuário autenticado; texto limitado; update/delete negados no cliente atual. |
| `posts` | Autor controla o próprio post; visibilidade controla leitura pública; media/links são validados. |
| `contributions` | Autor controla o próprio conteúdo; URL/media e status seguem limites. |
| `places` | Criador controla a base do Place; referências externas comunitárias ficam na subcoleção com ownership individual. |
| `reports` | Usuário autenticado pode criar sua denúncia; leitura/update/delete pelo cliente são negados. |

Ao alterar uma regra, primeiro escreva um teste positivo e um negativo no emulator. Teste sempre `unauthenticated`, owner, outro usuário, spoofing de UID, array com self, status inválido, URL inválida e tentativa de read/list fora do escopo.

## Privacidade

O mapa trabalha com contexto de cidade, não com coordenadas precisas publicadas como identidade. `showOnMap` é opcional. Não adicione latitude/longitude precisa ao perfil público, nem exponha email privado em `publicProfiles`, sem revisão explícita de privacy.

Referências externas de mídia e Places são links enviados pelo usuário. O browser acessa o host externo diretamente. A UI deve usar `target="_blank" rel="noopener noreferrer"` para links em nova aba e não deve usar `dangerouslySetInnerHTML`. O host pode registrar o acesso e pode remover a URL; isso deve ser tratado como limitação do MVP.

## Dados sensíveis e logs

Não registre senhas, tokens, credenciais OAuth ou documentos completos no console. O tratamento de erro atual inclui metadados de autenticação para diagnóstico; revise logs antes de enviar para um serviço centralizado e prefira UID truncado/anonimizado e códigos de erro.

Não copie `.env.local`, exportações Firestore ou arquivos de contas de teste para o repositório. Ao compartilhar diagnóstico, remova emails, UIDs e URLs privadas.

## Rotina de segurança antes de merge

Execute `git diff --check`, procure `firebase/storage`, service-account JSON, `allow read, write: if true`, `dangerouslySetInnerHTML`, `eval`, `innerHTML`, tokens e `.env` versionado. Execute `bun run lint`, `bun run build` e a suíte de Rules no emulator. Revise se uma query nova é compatível com a Rules e se limita resultados.

## Incidentes

Se houver exposição ou escrita indevida, não apague dados como primeira reação. Preserve o commit, timestamps, logs e evidência; suspenda o fluxo afetado no cliente se necessário; publique uma Rules restritiva depois de testar; revogue credenciais comprometidas no provedor responsável; e registre a decisão. Para dados reais, siga as obrigações aplicáveis de privacidade e o processo do proprietário do projeto.

## O que não ativar

Não habilite Firebase Storage, Cloud Functions pagas, Cloud Run, Phone Auth, APIs de mapas pagas, analytics ou qualquer serviço não documentado como parte do MVP sem decisão explícita de custo/privacy. Storage é especialmente proibido no contrato atual: o produto não faz upload ou proxy de binários.

## Referências

[1]: https://firebase.google.com/docs/rules "Firebase Security Rules"
[2]: https://firebase.google.com/docs/firestore/security/rules-conditions "Firestore Rules conditions"
[3]: https://firebase.google.com/docs/auth/web/manage-users "Manage Firebase Users"
[4]: https://owasp.org/www-project-top-ten/ "OWASP Top 10"
[5]: https://operations.osmfoundation.org/policies/tiles/ "OpenStreetMap Tile Usage Policy"
