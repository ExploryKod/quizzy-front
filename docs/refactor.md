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
- Une base de validation existe dans le projet via Zod (`ZodValidationPipe` + schemas).

### Écarts / points à améliorer
- Validation d'entrée non systématique: pas de pipeline global actif sur toutes les routes.
- Certains DTO servent aussi à des usages internes (couplage API/interne), au lieu d'être uniquement des contrats de transport.
- Fuite de modèles métier dans certains DTO (dépendance à des entités au lieu de DTO dédiés).
- Couplage entre couches: certains repositories manipulent des DTO d'API directement.
- Nommage hétérogène (`DTO`/`Dto`) et conventions non uniformes.
- Réponses d'erreur pas encore complètement homogènes (schémas partagés à formaliser).

### Plan de refactorisation progressif
1. **Activer la validation à la frontière API**
   - Choisir une stratégie unique: `class-validator` + `ValidationPipe` global, ou Zod appliqué de façon homogène.
   - Démarrer par `auth`, puis `users`, puis `quiz`.
2. **Séparer DTO externes et payloads internes**
   - Laisser dans `dto/` uniquement les contrats d'API (request/response).
   - Déplacer les structures internes vers des types applicatifs dédiés.
3. **Découpler persistence et DTO d'API**
   - Faire manipuler aux repositories des modèles métier/types de persistence, pas les DTO HTTP.
   - Ajouter des mappings explicites à l'entrée/sortie des contrôleurs/services.
4. **Uniformiser conventions et nommage**
   - Standardiser sur un seul format (`*Dto` recommandé).
   - Harmoniser les noms et la structure des dossiers DTO.
5. **Finaliser les contrats de réponse**
   - Introduire des DTO d'erreur partagés (`ErrorResponseDto`, erreurs de validation).
   - Normaliser les codes/réponses HTTP documentées.

### Ordre recommandé d'exécution
- Étape 1: module `auth` (surface réduite, impact rapide).
- Étape 2: module `users`.
- Étape 3: module `quiz` (plus volumineux, plus de couplage).
- Étape 4: harmonisation transverse (noms, erreurs, mapping).

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
- **Brouillons `addQuestion` (alignement front historique)** : le corps accepté est un draft (`CreateQuestionDraftDto` : `title?`, `answers?`), normalisé en `CreateQuestionDTO` dans le contrôleur. Titre minimal, réponses vides, plusieurs `isCorrect: true` sont acceptés à l'ajout ; la validation stricte (titre, ≥2 choix, un seul correct) reste le fait du **démarrage** du quiz (`start`), pas de `POST .../questions`. Les e2e et tests unitaires du contrôleur reflètent ce contrat.

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
  - exécution via `PORT=3002 nx run e2e:e2e -- --runInBand --testPathPattern=src/server/ping.spec.ts` => succès (`1` suite, `2` tests).

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
  - `PORT=3002 AUTH_TYPE=JWT nx run e2e:e2e -- --runInBand` => **3 suites passées, 27 tests passés**.
- Nettoyage bruit de logs e2e :
  - `e2e/src/helpers/quiz.helper.ts`
    - suppression d'un `console.log` de debug sur `addQuestion`,
    - nettoyage `deleteQuiz` silencieux sur `404` (cas normal de ressource déjà supprimée),
    - garde-fou si `quizId` absent.
- Vérification post-nettoyage :
  - suite e2e complète toujours verte (`3` suites, `27` tests).
