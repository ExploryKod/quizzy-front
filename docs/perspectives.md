# Perspectives / dette technique

## API (Quizzam) — statut de fin de quiz en session live

**Contexte :** côté élève (`/join/...`), le statut WebSocket reste `started` même lorsque le quiz est terminé. La fin est devinée côté front à partir du dernier événement `newQuestion` avec **`answers: []`** et le texte de remerciement (voir correctif UI « Le quiz est terminé » vs « Le quiz a commencé ! »).

**À traiter plus tard côté API :**

- Émettre un événement ou un champ de statut explicite quand la session est **terminée** (ex. `status: 'completed'` sur l’événement `status`, ou événement dédié `quizCompleted`), plutôt que de laisser le client déduire la fin uniquement à partir du payload `newQuestion`.
- Optionnel : centraliser le message de clôture (au lieu de chaînes en dur dans le gateway) et documenter le contrat socket (types partagés front / API).

Cela simplifiera l’UI élève et hôte et évitera les ambiguïtés si le format du dernier message change.

## API — validation d’un code d’exécution avant `join` WebSocket

**Contexte :** sans endpoint REST public, l’app ne peut pas savoir si un code existe en base **avant** d’émettre `join`. Le front utilise un **timeout** (~12 s) si aucun `joinDetails` n’arrive (code faux, session absente, ou hôte n’a pas ouvert la page).

**À traiter plus tard côté API (optionnel) :** `GET /api/execution/:id` (ou `HEAD`) renvoyant 404 / 200 pour afficher une erreur **immédiate** sans attendre le timeout, et distinguer « code inconnu » vs « quiz non démarré » si le modèle de données le permet.
