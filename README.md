# daily-kcorp-matches

Poste chaque jour un récap des matchs Karmine Corp (LoL, Rocket League, Valorant, TFT) dans un salon Discord, à partir des pages Liquipedia.

## Fonctionnement

1. Pour chaque équipe surveillée (`src/config.ts`), le script interroge l'API MediaWiki de Liquipedia (`action=parse`) et extrait les matchs programmés le jour courant, fuseau **Europe/Paris**.
2. Les matchs sont triés chronologiquement puis envoyés dans un salon via un **bot Discord** (connexion gateway, envoi du message, déconnexion).

## Configuration

Copier `.env.example` vers `.env` puis remplir :

- `DISCORD_BOT_TOKEN` : [Discord Developer Portal](https://discord.com/developers/applications) → New Application → Bot → Reset Token. Le bot doit être invité sur le serveur cible (OAuth2 → URL Generator, scope `bot`, permission `Send Messages`).
- `DISCORD_CHANNEL_ID` : clic droit sur le salon → Copier l'identifiant du salon (activer le mode développeur dans Paramètres → Avancés).
- `REPLAY_DATE` (optionnel) : rejouer une journée précise, format `YYYY-MM-DD`, interprétée en heure de Paris.
- `LIQUIPEDIA_USER_AGENT` (optionnel) : identifiant de projet, exigé par le [ToS Liquipedia](https://liquipedia.net/api-terms-of-use). Une valeur par défaut (nom du projet, sans email) est déjà en place.

## Lancer

```bash
yarn install
yarn start        # exécution unique, à planifier en cron
yarn test
yarn lint
```

## Limites connues

- ToS Liquipedia : 1 requête `action=parse` toutes les 30 s. Un run complet (8 pages) prend environ 4 minutes ; la limite est gérée automatiquement dans le scraper. Pas de retry : un échec réseau ou un statut 5xx/429 fait échouer le run.
- Le scraper ne récupère que la **section 0** de chaque page d'équipe (`section=0`), là où Liquipedia injecte le widget "Upcoming Matches" : ~20× moins de HTML à télécharger et parser que la page entière.
- Le carrousel des pages d'équipe ne montre que les matchs à venir **programmés** (les tours de playoffs non planifiés avec adversaire TBD n'apparaissent pas encore), et un match déjà commencé n'y figure plus. Lancer le script avant les matchs du jour.
- La structure HTML diffère selon le wiki : le carrousel n'existe que sur `leagueoflegends`. Les pages Rocket League / Valorant / TFT sont à revalider le jour d'un match réel (ex. `REPLAY_DATE=2026-09-24` pour le Champions de Valorant). Les tests unitaires figent la structure attendue et échoueront en premier si Liquipedia change son markup.
- Pour supprimer le parsing HTML : l'API [LPDB v3](https://liquipedia.net/api-terms-of-use) (clé gratuite sur demande via leur Discord, 60 req/h) renvoie les matchs finis et à venir du jour dans un format JSON identique pour tous les wikis.
