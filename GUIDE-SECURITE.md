# Guide de sécurisation — FasoPagnes Tissé D'lux

Ce guide explique les **3 réglages à faire dans la console Firebase** pour activer
la nouvelle sécurité (authentification réelle + règles Firestore), puis comment
**déployer** et **tester**.

> Tant que ces étapes ne sont pas faites, le site public continue de fonctionner
> normalement (les produits restent affichés). La connexion admin, elle, ne
> marchera qu'une fois l'étape 1 et 2 terminées.

---

## Étape 1 — Activer l'authentification par email

1. Va sur https://console.firebase.google.com et ouvre le projet **fasopagnes-b3408**.
2. Menu de gauche : **Authentication** → bouton **Commencer / Get started**.
3. Onglet **Sign-in method** → clique sur **Email/Password** → active le 1er
   interrupteur (**Enable**) → **Enregistrer**.

## Étape 2 — Créer ton compte administrateur

1. Toujours dans **Authentication** → onglet **Users** → **Add user**.
2. Saisis ton **email** (ex. `admin@fasopagnes.bf`) et un **mot de passe solide**
   (au moins 8 caractères, évite `Faso2026!` qui était public dans l'ancien code).
3. **Add user**. C'est ce couple email + mot de passe que tu utiliseras pour te
   connecter sur la page **Se connecter** du site.

## Étape 3 — Publier les règles de sécurité

1. Menu de gauche : **Firestore Database** → onglet **Règles / Rules**.
2. Remplace tout le contenu par celui du fichier [`firestore.rules`](firestore.rules)
   de ce projet (copier/coller).
3. Clique sur **Publier / Publish**.

---

## Déploiement sur Hostinger

Envoie (via le gestionnaire de fichiers Hostinger ou FTP) les fichiers modifiés :

- `index.html`
- `script.js`

> Astuce : vide le cache du navigateur (Ctrl+F5) après l'upload pour bien charger
> la nouvelle version.

---

## Test de validation (5 minutes)

1. **Site public** : ouvre le site → la boutique affiche bien les pagnes. ✅
2. **Connexion admin** : page **Se connecter** → entre l'email + mot de passe
   créés à l'étape 2 → tu arrives sur le tableau de bord. ✅
3. **Migration auto** : à la première connexion, le code copie automatiquement tes
   anciens produits/commandes vers les nouvelles collections. Vérifie dans
   **Firestore Database > Données** : tu dois voir deux collections `products` et
   `orders` remplies. (Ouvre la console du navigateur F12 → tu verras des messages
   `[Migration] X produit(s) migré(s)`.) ✅
4. **Test commande visiteur** : déconnecte-toi, va sur **Commander**, passe une
   commande test → elle doit apparaître dans le tableau de bord admin après
   reconnexion. ✅
5. **Test sécurité** : déconnecté, dans la console navigateur, une tentative de
   lecture des commandes doit échouer (permission denied) — c'est voulu. ✅

---

## Ce qui change (résumé technique)

| Avant | Après |
|-------|-------|
| Mot de passe admin écrit en clair dans `script.js` | **Firebase Authentication** (vérifié côté serveur) |
| Toutes les commandes dans 1 seul document | **1 document par commande** (collection `orders`) |
| Tous les produits dans 1 seul document | **1 document par produit** (collection `products`) |
| N'importe qui pouvait tout écraser | **Règles Firestore** : écriture admin uniquement, commandes en lecture admin |

## Point restant (faible risque)

La clé **ImgBB** (`IMGBB_API_KEY` dans `script.js`) reste visible côté navigateur :
c'est inévitable sans backend, et le plan Firebase gratuit (Spark) ne permet pas
les Cloud Functions pour la masquer. Le risque est faible (upload d'images
uniquement). Si besoin plus tard, on pourra la régénérer ou passer par un proxy.
