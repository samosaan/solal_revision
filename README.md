# Révisions de Solal

Petits jeux de révision pour le CP, à utiliser sur tablette en mode paysage.
Toutes les consignes sont dites à voix haute, et l'enfant répond en touchant l'écran, sans rien écrire.

## Modules

La page d'accueil (`index.html`) regroupe tous les jeux. La voix dit le nom de chaque jeu quand on le touche ;
les jeux pas encore prêts apparaissent avec un cadenas.

| Module | Dossier | Contenu |
|---|---|---|
| L'île aux nombres | `nombres/` | Nombres de 1 à 10 : reconnaître une quantité, compter en touchant, retrouver un chiffre entendu, remplir une boîte de dix |
| Les sons | `sons/` | Compter les syllabes, entendre un son dans un mot, retrouver la lettre, assembler consonne et voyelle (ordre Taoki : l, r, m, s, f, ch, v, n, j) |
| J'écris | `ecrire/` | Tracer au doigt les gestes de base, les chiffres de 0 à 9 et les lettres a, i, o, u, é, l, avec une piste large ; conseils pour gaucher |
| Les jours | `jours/` | Rituel « Chaque jour compte » (compteur des jours d'école, dizaines et unités), la semaine, hier et demain, les saisons |

| English | `anglais/` | Écouter et reconnaître en anglais : couleurs, nombres de 1 à 10, émotions, météo (les rituels d'anglais de la classe) |
| Le monde | `monde/` | Vivant ou pas, le corps et les cinq sens, où vivent les animaux, qui mange quoi |
| La boutique | `boutique/` | Échanger ses étoiles : autocollants surprise pour un album, et cadeaux choisis par le parent (bons à montrer, marqués « donnés » dans l'espace parent) |

Le code partagé (voix, étoiles, déroulé des séances) est dans `commun/`.

## Principes

- Séances courtes : 8 questions, soit 5 minutes environ.
- Chaque jeu monte seul d'un palier (jusqu'à 5, puis 7, puis 10) après 3 réussites du premier coup d'affilée, et redescend après 2 erreurs d'affilée.
- En cas d'erreur, le jeu montre la bonne démarche (on recompte ensemble) plutôt que de sanctionner.
- 1 étoile par bonne réponse au premier essai, 10 étoiles = 1 joker, comme en classe. Les étoiles sont communes à tous les jeux.
- Espace parent (appui long sur le bouton en bas à droite) : réussite par nombre et par jeu. Les données restent sur la tablette.

## Ouvrir sur la tablette

Une fois GitHub Pages activé (Settings → Pages → Deploy from a branch → `main`, dossier `/ (root)`),
le jeu est disponible à l'adresse `https://samosaan.github.io/solal_revision/`.
Sur iPad, Safari → Partager → « Sur l'écran d'accueil » pour l'ouvrir en plein écran comme une application.
