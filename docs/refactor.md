# Refactorisation

Ce document définit une feuille de route de refactorisation globale du projet, avec une approche incrémentale et sécurisée.
L'objectif est d'améliorer durablement la qualité du code, la maintenabilité, la robustesse runtime et la lisibilité des contrats entre les différentes couches applicatives.

Le périmètre couvre notamment :
- l'architecture applicative (responsabilités des modules, couplage inter-couches) ;
- la qualité des contrats API (DTO, validation, documentation Swagger) ;
- la cohérence des conventions de code (noms, structures, patterns partagés) ;
- la réduction de la dette technique priorisée par impact et risque.

La section DTO ci-dessous correspond à un premier chantier prioritaire, mais elle s'inscrit dans un plan de refactorisation plus large.

## Refactorisation à réaliser : 
- Fiabiliser les contrats d'entrée/sortie API (DTO) pour réduire les erreurs runtime.
- Clarifier les frontières entre DTO d'API, modèles métier et payload internes.

## Refactoring des objets DTO

### Constats positifs (à conserver)
- La documentation Swagger est déjà bien avancée (tags, opérations, réponses).
- Des DTO dédiés existent déjà pour plusieurs endpoints (`auth`, `users`, `quiz`).
- Les exemples Swagger (`@ApiProperty`) améliorent la lisibilité des contrats.
- `ZodValidationPipe` existe pour des usages ciblés ; le périmètre **HTTP** principal s’appuie sur **class-validator** + `ValidationPipe` global (voir *Journal (validation)*).

### Écarts / points à améliorer
- Validation d'entrée: un `ValidationPipe` global (`class-validator`) couvre désormais les routes typées (auth, users, quiz) ; d'autres points peuvent rester à durcir ou à documenter (erreurs 400 homogènes, etc.).
- Certains DTO servent aussi à des usages internes (couplage API/interne), au lieu d'être uniquement des contrats de transport.
- Fuite de modèles métier dans certains DTO (dépendance à des entités au lieu de DTO dédiés).
- Couplage entre couches: certains repositories manipulent des DTO d'API directement.
- Nommage : la convention **`…Dto` (PascalCase)** est en cours côté quiz/users (voir *Journal (nommage Dto)*) ; repasser le reste du monorepo si besoin.
- Schéma **400** partagé : `HttpValidationErrorDto` documenté + enregistré en **`extraModels`** OpenAPI (voir *Journal (OpenAPI — erreur 400)*). D’autres codes (401/404/500) restent par tag si besoin d’alignement.

### Plan de refactorisation progressif
1. **Validation à la frontière API** (fait sur les DTO d’entrée `auth` / `users` / `quiz` : `class-validator` + `ValidationPipe` global) — la suite = homogénéiser les réponses d’erreur, nommage `*Dto`, Zod seulement là où c’est volontaire.
2. **Séparer DTO externes et payloads internes**
   - Laisser dans `dto/` uniquement les contrats d'API (request/response).
   - Déplacer les structures internes vers des types applicatifs dédiés.
3. **Découpler persistence et DTO d'API**
   - Faire manipuler aux repositories des modèles métier/types de persistence, pas les DTO HTTP.
   - Ajouter des mappings explicites à l'entrée/sortie des contrôleurs/services.
4. **Uniformiser conventions et nommage** *(Quizzam : voir journal étape 4 — DTO d’erreur partagés, payload users, chat/auth/users alignés)*
   - Standardiser sur un seul format (`*Dto` recommandé).
   - Harmoniser les noms et la structure des dossiers DTO.
5. **Finaliser les contrats de réponse** *(Quizzam : erreurs HTTP + validation en `extraModels` — étapes 4–5 ; réponses GET mappées avec `plainToInstance` — voir journal étape 5)*
   - Introduire des DTO d'erreur partagés (`ErrorResponseDto`, erreurs de validation).
   - Normaliser les codes/réponses HTTP documentées.

### Ordre recommandé d'exécution
- Étape 1: module `auth` (surface réduite, impact rapide).
- Étape 2: module `users`.
- Étape 3: module `quiz` (plus volumineux, plus de couplage).
- Étape 4: harmonisation transverse (noms, erreurs, mapping) — **réalisé** (voir *Journal (étape 4 — harmonisation transverse Quizzam)*).

### Méthode DTO (alignement [Mastering DTOs in NestJS](https://dev.to/cendekia/mastering-dtos-in-nestjs-24e4))

L’article propose une progression **class-validator** + **class-transformer** + **`ValidationPipe` global** + DTO d’**entrée** / **sortie** distincts + `PartialType` pour les mises à jour, et **Swagger** (`@ApiProperty`).

**Adaptation Quizzam** :
- **Entrée HTTP** : `ValidationPipe` global + DTO décorés (`class-validator`) sur `auth`, `users`, `quiz` — voir *Journal (validation)*. **Zod** (`ZodValidationPipe`, `contract.ts`) reste disponible ailleurs si besoin, sans exiger « tout Zod partout ».
- **Dév local** : `nx serve` (port du `.env`, souvent 3000) ; **API en Docker watch** : mappage hôte par défaut **3002** (`QUIZZAM_HOST_PORT`) → Swagger `http://localhost:3002/api/docs` pour inspecter / tester les mêmes DTOs.
- **Comportement** : des **400** apparaissent sur corps invalides (emails, champs vides, `PATCH` hors `op: replace`, etc.) ; les brouillons d’`addQuestion` restent volontairement permisifs côté validation.

**Phases proposées (itérations courtes, comportement métier inchangé sauf point marqué)** :
1. **Séparer DTO HTTP vs payloads internes** (ex. corps `POST` qui ne contient que ce que le client envoie vraiment ; l’`uid` vient du JWT, pas du body).
2. **Réponse dédiée** pour les `GET` quand aujourd’hui le même type sert de « vue » et de persistance (même champs, noms de classes distincts + `@ApiProperty`).
3. **Mises à jour (PATCH)** : `PartialType` / équivalent pour les DTO d’update une fois les types de base stabilisés.
4. **Poursuivre** : DTO d’erreur partagés (`HttpValidationErrorDto` enregistré en `extraModels` Swagger dans `main.ts`), `PartialType` / PATCH ciblé, homogénéisation `*Dto` (voir *Écarts*).

**Journal (étape 1 — users)** : introduction de `CreateUserProfileBodyDto` (champ `username` uniquement) pour `POST /api/users` ; côté application le typage interne a évolué en `CreateUserProfilePayload` (étape 4). Aucun changement de règle métier : l’`uid` était déjà pris sur le token, pas sur le body.

**Journal (étape 2 — quiz create)** : `CreateQuizRequestBodyDto` (`title`, `description` seuls) pour `POST /api/quiz` et Swagger ; côté commande / dépôts, le type applicatif `CreateQuizPayload` (incl. `userId`) porte l’`userId` issu du JWT, distinct du corps HTTP.

**Journal (plan refactor — étape 2, module `quiz` : DTO HTTP vs payloads)** : les contrats **Swagger / corps HTTP** restent dans `quizzam/src/quiz/dto/` (y compris `answer-question.schemas.ts` pour `AnswerDto` / `QuestionDto` documentés). Les entrées **application / repository** (après normalisation côté contrôleur ou hors HTTP) sont typées par des **payloads** dans `quizzam/src/quiz/payloads/` : `DecodedToken`, `CreateQuizPayload`, `CreateQuestionPayload`, `StartQuizPayload`. Les commandes, requêtes, adaptateurs (Mongo, in-memory, Firebase) et le contrôleur importent ces types pour le domaine interne, sans mélanger avec les DTOs de transport. Vérification : `nx run quizzam:build` et `nx run quizzam:test` (depuis le répertoire `quizzam/` de l’espace Nx).

**Journal (plan refactor — étape 3, module `quiz` : persistance / domaine vs DTO HTTP)** : le port `IQuizRepository` et les adaptateurs n’importent plus les classes DTO de `quiz/dto` pour les listes, snapshots d’exécution, résultats de suppression et opérations de patch. Des types **sans décorateurs Swagger** dans `quizzam/src/quiz/models/` ciblent le domaine / la persistance : `UserQuizzesList`, `QuizSnapshot`, `DeleteQuizResult`, `JsonPatchReplaceOperation`. Les DTO `GetUserQuizDto`, `DeletedQuizResponseDto`, `PatchOperation` (classe) restent à la **frontière HTTP** (validation, `@Api*`) ; le contrôleur **mappe** le corps `PATCH` vers `JsonPatchReplaceOperation[]` avant la commande. `contract.ts` s’appuie sur ces modèles pour les types côté Zod. Vérification : `nx run quizzam:build` + `nx run quizzam:test` (répertoire `quizzam/`).

**Journal (étape 5 — réponses HTTP / `plainToInstance`)** : **Users** — `UserRecord` dans `users/models/` pour les lectures dépôt / requête ; `FindUserDto` remplacé par **`UserProfileResponseDto`** (DTO de sortie pur avec `@Expose`) ; `GET /api/users/me` retourne `plainToInstance(UserProfileResponseDto, record, { excludeExtraneousValues: true })`. **Quiz** — `GetQuizByIdResponseDto` enrichi de `@Expose` ; `GET /api/quiz/:id` construit la réponse avec `plainToInstance` depuis l’entité `Quiz`. **Non couvert ici** : `PartialType` sur des updates REST « champs plats » (le quiz utilise du JSON Patch). Vérification : `nx run quizzam:build` + `nx run quizzam:test`.

**Journal (étape 4 — harmonisation transverse Quizzam)** : **OpenAPI** — `HttpExceptionBodyDto` (corps type Nest pour 401/403/404/409/500 hors validation stricte) enregistré en `extraModels` à côté de `HttpValidationErrorDto` ; décorateurs `ApiHttpUnauthorized`, `ApiHttpNotFound`, `ApiHttpForbidden`, `ApiHttpConflict`, `ApiHttpInternalServerError` dans `core/dto/api-http-responses.ts`, appliqués aux contrôleurs `quiz`, `auth`, `users`, `ping`. **Users** — suppression de `CreateUserDto` côté dépôt ; `CreateUserProfilePayload` dans `users/payloads/` ; commande / `IUserRepository` / adaptateurs sur ce type. **Auth / users** — `class-transformer` `@Transform` (trim, email en minuscules) sur les corps JWT et `CreateUserProfileBodyDto` ; `users` : `generateDecodedToken` typé `Promise<DecodedToken>`. **Chat** — `AddMessageDto` avec `class-validator` + `ApiProperty` et `ValidationPipe` sur l’abonnement WebSocket. Vérification : `nx run quizzam:build` + `nx run quizzam:test`.

**Journal (validation — frontière API)** : `ValidationPipe` global dans `main.ts` (`transform`, `whitelist: true`, `forbidNonWhitelisted: false`) ; décorateurs `class-validator` sur les DTO d’entrée concernés (auth, users, quiz). Les **brouillons** d’ajout de question restent volontairement souples (`CreateQuestionDraftDto` : pas de `ValidateNested` sur `answers`) ; le **remplacement** de question (`PUT .../questions/...`) valide `UpdateQuestionDto` + `AnswerDto` de façon stricte. Le `PATCH` quiz (tableau d’opérations) passe par `ParseArrayPipe` et `PatchOperation` (`op` limité à `replace`). Le spec `update-quiz-command.spec.ts` utilise `op: 'replace' as const` pour respecter le type `PatchOperation`. Vérification : `nx run quizzam:test` au vert.

**Journal (nommage Dto — harmonisation sufixe `*Dto`)** : renommage des types `quiz` qui utilisaient encore le suffixe `...DTO` en `...Dto` (`AnswerDto`, `QuestionDto`, `CreateQuestionDto`, `UpdateQuestionDto`, `QuizDto`, `GetQuizByIdResponseDto`, `CreateQuizDto`, `DeletedQuizResponseDto`, `StartQuizDto`). Côté **users** : `FindUserDTO` → `FindUserDto` (puis **`UserProfileResponseDto`** + `UserRecord` à l’étape 5). Aucun changement de champs ni de sémantique sur les cycles intermédiaires, uniquement les identifiants TypeScript / exports. Build + `quizzam:test` vérifiés.

**Journal (OpenAPI — erreur 400 partagée)** : `HttpValidationErrorDto` est passé en troisième argument de `SwaggerModule.createDocument` via **`extraModels`**, afin qu’il figure toujours dans **`components.schemas`** (Swagger UI `/api/docs`, codegen, inspection hors route spécifique). Rappel dans [quizzam/docs/api.md](../../quizzam/docs/api.md).

**Journal (étape 2 — auth, doc seulement)** : JSDoc sur les DTO JWT pour distinguer corps de requête (`register` / `login`) et réponse (`JwtAuthResponseDto` / `JwtAuthUserDto`), sans renommage de classes.

### Contrat `GET /api/quiz/:id` — champ `id` dans le corps de réponse
- **Constat** : le front historique typait `Quiz` avec un `id` obligatoire, alors que le corps HTTP ne contenait que `title`, `description`, `questions` (l’identifiant n’apparaissait que dans l’URL).
- **Risque fonctionnel** : stockage ou clés dérivées (`quiz-score:${quiz.id}`, etc.) pouvant recevoir `undefined` à l’exécution malgré le typage.
- **Décision** : exposer explicitement `id` dans la réponse (même valeur que le segment `:id`), DTO `GetQuizByIdResponse` côté Quizzam, descriptions et exemples dans Swagger ; rappel opérationnel dans [quizzam/docs/api.md](../../quizzam/docs/api.md).

## Refactor des tests

### Contexte et problèmes identifiés
- Le lancement `pnpm run test` pouvait entrer dans une boucle (`nx test` -> `nx run quizzam:test` -> script npm `test` -> ...).
- Le helper e2e d'authentification était couplé à Firebase, alors que le mode utilisé actuellement est `AUTH_TYPE=JWT`.
- Certaines suites de tests ne reflètent plus exactement l'état réel de l'API (dette de maintenance des tests).

### Correctifs déjà réalisés
- **Fix durable Nx (anti-récursion)** :
  - ajout d'un target explicite `test` dans `quizzam/project.json` (executor Jest),
  - correction du chemin `outputs` vers `coverage/quizzam` (compatible avec `projectRoot='.'`),
  - scripts npm clarifiés dans `quizzam/package.json` :
    - `test` -> `nx run quizzam:test`
    - `test:e2e` -> `nx run e2e:e2e`
    - `test:all` -> `nx run-many -t test --projects quizzam,e2e`
- **Découplage AuthHelper Firebase/JWT** :
  - `AuthHelper` choisit la stratégie selon `AUTH_TYPE`,
  - branche Firebase conservée pour `AUTH_TYPE=FIREBASE`,
  - branche JWT ajoutée (`/api/auth/register`, `/api/auth/login`) pour `AUTH_TYPE=JWT`,
  - création de profil utilisateur rendue tolérante (`200`, `201`, `409`) pour éviter les faux échecs.
- **Brouillons `addQuestion` (alignement front historique)** : le corps accepté est un draft (`CreateQuestionDraftDto` : `title?`, `answers?`), normalisé en `CreateQuestionPayload` dans le contrôleur. Titre minimal, réponses vides, plusieurs `isCorrect: true` sont acceptés à l'ajout ; la validation stricte (titre, ≥2 choix, un seul correct) reste le fait du **démarrage** du quiz (`start`), pas de `POST .../questions`. Les e2e et tests unitaires du contrôleur reflètent ce contrat.

### Points restants à traiter
- Aligner les assertions e2e avec les contrats API actuels (ex: `ping.spec.ts`).
- Réduire le couplage des tests aux détails internes de certaines implémentations.

### Plan de refactorisation des tests (progressif)
1. **Remettre les unit tests au vert**
   - corriger les mocks/providers dans les specs contrôleurs/services.
2. **Sécuriser l'e2e en mode JWT**
   - valider les parcours auth (`register/login`) et propagation des tokens.
3. **Rendre l'e2e multi-mode**
   - conserver la compatibilité Firebase uniquement si explicitement activée.
4. **Fiabiliser les assertions de contrat**
   - vérifier les statuts/corps selon Swagger et comportements métier actuels.
5. **Industrialiser l'exécution**
   - utiliser `test`, `test:e2e`, `test:all` selon le besoin (rapide vs complet).

### Journal des actions réalisées
- Correction de l'erreur Nx liée à `outputs` avec `projectRoot='.'` (chemin explicite vers `coverage/quizzam`).
- Ajout d'un target `quizzam:test` explicite dans `quizzam/project.json` (executor Jest) pour éviter la récursion de commandes.
- Normalisation des scripts de test dans `quizzam/package.json` (`test`, `test:e2e`, `test:all`).
- Refactor de `AuthHelper` e2e pour sélection automatique de la stratégie d'auth selon `AUTH_TYPE` :
  - `FIREBASE` -> endpoints Firebase conservés
  - `JWT` -> endpoints applicatifs `/api/auth/register` et `/api/auth/login`
- Correction de `quiz.controller.spec.ts` avec injection complète de mocks providers (dépendances constructeur du contrôleur).
- Vérification post-correctifs: tests unitaires `quizzam` relancés avec succès (`2/2` suites passées).
- Ajout d'un premier lot de tests unitaires sur `auth` :
  - `src/auth/controllers/jwt-auth.controller.spec.ts`
  - `src/auth/application/jwt-credentials.service.spec.ts`
- Couverture ajoutée sur les cas essentiels JWT/IN-MEMORY :
  - délégation contrôleur -> service (`register`, `login`),
  - register succès,
  - register en doublon (conflit),
  - login succès,
  - login en échec (credentials invalides),
  - payload incomplet (unauthorized),
  - mode base non supporté (erreur interne).
- Vérification post-ajout : tests unitaires `quizzam` au vert (`4` suites, `10` tests).
- Ajout d'un deuxième lot de tests unitaires sur `users` :
  - `src/users/controllers/users.controller.spec.ts`
  - `src/users/commands/add-username.spec.ts`
  - `src/users/queries/get-user-by-id.spec.ts`
- Couverture ajoutée sur les cas essentiels `users` :
  - création de profil utilisateur authentifié,
  - rejet si token invalide / `user_id` absent,
  - lecture du profil courant,
  - mapping commande `AddUsername` -> repository,
  - comportement `GetUserByIdQuery` (utilisateur trouvé / introuvable).
- Vérification post-ajout : tests unitaires `quizzam` au vert (`7` suites, `16` tests).
- Ajout d'un troisième lot de tests unitaires sur la couche applicative `quiz` :
  - `src/quiz/commands/create-quiz-command.spec.ts`
  - `src/quiz/queries/get-user-quizzes.spec.ts`
  - `src/quiz/queries/delete-quiz-by-id.spec.ts`
  - `src/quiz/queries/start-quiz-query.spec.ts`
- Couverture ajoutée sur les cas essentiels `quiz` (niveau commande/query) :
  - délégation commande `create` vers repository,
  - récupération des quizzes utilisateur,
  - suppression quiz (non trouvé / interdit / succès),
  - démarrage quiz (délégation + retour URL d'exécution).
- Vérification post-ajout : tests unitaires `quizzam` au vert (`11` suites, `22` tests).
- Ajout d'un quatrième lot de tests unitaires `quiz` pour compléter la couche applicative :
  - `src/quiz/commands/update-quiz-command.spec.ts`
  - `src/quiz/commands/add-question-command.spec.ts`
  - `src/quiz/commands/update-question-command.spec.ts`
  - `src/quiz/queries/get-quiz-by-id.spec.ts`
  - `src/quiz/queries/get-quiz-by-executionId.spec.ts`
- Couverture ajoutée :
  - délégation des commandes `update`, `addQuestion`, `updateQuestion`,
  - comportement query `getById` (trouvé / non trouvé),
  - comportement query `getByExecutionId` (trouvé / non trouvé).
- Vérification post-ajout : tests unitaires `quizzam` au vert (`16` suites, `29` tests).
- Nettoyage du bruit console dans les tests unitaires :
  - suppression des `console.log` de debug dans
    - `src/quiz/queries/delete-quiz-by-id.ts`
    - `src/quiz/queries/start-quiz-query.ts`
- Vérification post-nettoyage : tests unitaires `quizzam` toujours au vert (`16` suites, `29` tests).
- Renforcement majeur de `quiz.controller.spec.ts` :
  - couverture endpoint par endpoint (happy path + erreurs principales),
  - vérification des délégations vers les commands/queries,
  - vérification des comportements auth (`user_id` manquant),
  - vérification des headers (`Location`) et réponses attendues.
- Vérification post-renforcement : tests unitaires `quizzam` au vert (`16` suites, `45` tests).
- Point d'attention restant : certains `console.log/error` dans les contrôleurs produisent encore du bruit en sortie test.
- Ajout d'un cinquième lot de tests unitaires sur le périmètre infrastructure légère/API root :
  - `src/ping/version-repository.command.spec.ts`
  - `src/ping/ping.controller.spec.ts`
  - `src/core/app.controller.spec.ts`
- Couverture ajoutée :
  - agrégation des états/version dans `GetVersionCommand`,
  - mapping de réponse `PingController`,
  - modèle de vue retourné par `AppController`.
- Vérification post-ajout : tests unitaires `quizzam` au vert (`19` suites, `48` tests).
- Ajout d'un sixième lot de tests orienté auth JWT mode MongoDB :
  - `src/auth/application/jwt-credentials.service.spec.ts`
- Couverture ajoutée sur la branche `DATABASE_NAME=MONGODB` :
  - `register` succès (création utilisateur Mongo mockée + token),
  - `register` en doublon (détection `findOne` + erreur Mongo `code=11000`),
  - `login` succès (vérification hash mot de passe),
  - `login` échec (utilisateur absent / credentials invalides),
  - gestion du cas d'erreur d'injection (`userModel` non disponible).
- Mise à jour du test e2e ping obsolète :
  - `e2e/src/server/ping.spec.ts` aligné sur le contrat actuel `{ status, details: { database } }`.
- Vérification post-ajout : tests unitaires `quizzam` au vert (`19` suites, `54` tests).
- Point de blocage e2e actuel (hors périmètre des changements de ce lot) :
  - le build `quizzam:build` échoue avant exécution e2e à cause d'erreurs TypeScript sur des adapters quiz (`firebase`, `in-memory`, `mongo`) qui retournent des objets incompatibles avec `QuizDTO` (`description/questions` manquants).
- Correctif de déblocage e2e appliqué sur les repositories quiz :
  - `src/quiz/adapters/in-memory/in-memory-quiz-repository.ts`
  - `src/quiz/adapters/mongo/mongo-quiz-repository.ts`
  - `src/quiz/adapters/firebase/firebase-quiz-repository.ts`
- Alignement des retours `findAllFromUser` avec le contrat `QuizDTO` :
  - ajout systématique de `description` et `questions` dans chaque élément de `data`.
- Vérification après correctif :
  - `nx run quizzam:build` passe à nouveau.
- Ajustement e2e pour environnement multi-port :
  - `e2e/src/constants.ts` lit désormais `HOST`/`PORT` (fallback `localhost:3000`) au lieu d'un `defaultUrl` figé.
- Vérification `ping.e2e` :
  - exécution via `PORT=3002 nx run e2e:e2e -- --runInBand --testPathPattern=src/server/ping.spec.ts` => succès (`1` suite, `2` tests) — ici `PORT=3002` cible l’**API déjà** exposée (ex. Docker), pas un second `nx serve` sur ce port.

### Audit actuel de la couverture unitaire
- Vérification effectuée via la configuration Jest + détection des fichiers exécutés.
- Constat: la commande unitaire `quizzam:test` exécute actuellement **2 fichiers uniquement** :
  - `src/chat/chat.gateway.spec.ts`
  - `src/quiz/controllers/quiz.controller.spec.ts`
- Conclusion: le faible volume de tests n'est **pas** dû à un outil mal configuré; c'est un manque réel de tests unitaires dans `src/`.
- Les autres tests présents sont des e2e (`e2e/src/server/*.spec.ts`) et ne remplacent pas la granularité attendue des unit tests.

### Plan d'extension des tests unitaires
1. **Priorité haute: Auth**
   - `jwt-auth.controller.spec.ts`
   - `jwt-credentials.service.spec.ts`
   - Cas clés: register/login succès, credentials invalides, email déjà existant.
2. **Priorité haute: Users**
   - `users.controller.spec.ts`
   - `add-username.spec.ts`, `get-user-by-id.spec.ts`
   - Cas clés: utilisateur authentifié/non authentifié, utilisateur introuvable.
3. **Priorité haute: Quiz (couche applicative)**
   - specs unitaires des commandes/queries (`create`, `update`, `delete`, `start`, `get-user-quizzes`).
   - Mock systématique des repositories pour tester uniquement la logique applicative.
4. **Priorité moyenne: Repositories**
   - tests ciblés des adapters (in-memory en priorité).
   - Cas limites: quiz inexistant, ownership, contraintes de démarrage.
5. **Priorité moyenne: Contrats DTO/validation**
   - tests de validation des payloads (une fois stratégie de validation stabilisée).
   - objectif: sécuriser les erreurs 400 attendues sur payload invalide.

### Objectif court terme (itératif)
- Passer de **2 suites unitaires** à un socle minimum de **10+ suites** sur les modules critiques (`auth`, `users`, `quiz` applicatif).
- Garder les tests rapides et isolés (mocks), et réserver les scénarios transverses aux e2e.

Sources inspiration : 
- [Article sur les DTO dans NestJS](https://dev.to/cendekia/mastering-dtos-in-nestjs-24e4)

### Stabilisation e2e (JWT + MongoDB)
- Diagnostic des échecs e2e globaux sur `quiz.spec.ts` et `user.spec.ts` :
  - conflits de statuts attendus dans `AuthHelper` (JWT register/login),
  - hypothèses de contrat obsolètes dans des assertions e2e,
  - et surtout conflits d'index Mongo hérités (`executionId_1`, `questions.id_1`) provoquant des `500` à la création de quiz.
- Correctifs appliqués :
  - `e2e/src/helpers/auth.helper.ts`
    - support des statuts `200/201` pour register/login JWT,
    - fallback login en cas de `409` register,
    - email de test unique par défaut,
    - nettoyage `deleteUser` plus tolérant.
  - `e2e/src/constants.ts`
    - URL e2e pilotée par `HOST`/`PORT` (plus de host/port figé).
  - `src/quiz/adapters/mongo/mongo-quiz.ts`
    - retrait des contraintes `unique` sur `executionId` (via index DB) et `questions.id` dans le schéma.
  - `src/quiz/adapters/mongo/mongo-quiz-repository.ts`
    - alimentation d'un `executionId` unique à la création pour éviter les collisions avec index historique.
  - `src/quiz/controllers/quiz.controller.ts`
    - validation défensive payload `addQuestion` (titre requis, >=2 réponses, exactement 1 correcte) avec retour `400`.
  - `e2e/src/server/user.spec.ts` et `e2e/src/server/quiz.spec.ts`
    - alignement des assertions sur les contrats réels (`FindUserDTO` sans `email`, ownership non exposé en `404`).
- Correctif data/index en environnement local Mongo :
  - suppression des index historiques problématiques `questions.id_1` et `executionId_1` dans `quizapp.quizzes`.
- Vérification finale :
  - `PORT=3002 AUTH_TYPE=JWT nx run e2e:e2e -- --runInBand` => **3 suites passées, 27 tests passés** (l’e2e pointe sur l’API joignable à ce port ; en parallèle d’un *watch* Docker sur 3002, ne pas lancer un autre processus sur 3002 — voir [quizzam/README.md](../../quizzam/README.md#tests-e2e-http)).
- Nettoyage bruit de logs e2e :
  - `e2e/src/helpers/quiz.helper.ts`
    - suppression d'un `console.log` de debug sur `addQuestion`,
    - nettoyage `deleteQuiz` silencieux sur `404` (cas normal de ressource déjà supprimée),
    - garde-fou si `quizId` absent.
- Vérification post-nettoyage :
  - suite e2e complète toujours verte (`3` suites, `27` tests).
- Validation à la frontière API (détail : section **DTO**, *Journal (validation)*) : `nx run quizzam:test` au vert après typage `PatchOperation` dans `update-quiz-command.spec.ts`.
