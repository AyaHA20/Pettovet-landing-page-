# La page vitrine de PettoVet

Une page statique, autonome, destinée aux vétérinaires qui **n'ont pas
encore** le logiciel. Elle ne contient ni application, ni base de
données, ni appel au serveur : rien que du HTML, du CSS et un fichier
JavaScript.

C'est vers elle que pointent les publications Instagram et Facebook.

---

## L'ouvrir tout de suite

Double-cliquez sur `index.html`. C'est tout — il n'y a rien à installer,
rien à compiler, et tout fonctionne depuis le disque, y compris le
changement de langue.

---

## La mettre en ligne sur Vercel

1. Allez sur <https://vercel.com> et connectez-vous.
2. **Add New… → Project**, puis importez ce dépôt.
3. Dans les réglages d'importation :

   | Réglage | Valeur |
   |---|---|
   | **Root Directory** | `landing` |
   | **Framework Preset** | `Other` |
   | Build Command | *(laisser vide)* |
   | Output Directory | *(laisser vide)* |
   | Install Command | *(laisser vide)* |

   > Le **Root Directory** est le seul réglage qui compte vraiment. Sans
   > lui, Vercel publie la racine du dépôt — donc le code du cabinet, y
   > compris `backend/`, au lieu de la page vitrine.

4. **Deploy**. Une trentaine de secondes plus tard, l'adresse
   `…vercel.app` est en ligne.

Les mises en ligne suivantes sont automatiques à chaque `git push` sur
la branche principale.

### Après la première mise en ligne : l'aperçu de partage

C'est la vignette qui s'affiche dans un fil Facebook ou une bulle
WhatsApp — souvent la seule chose que les gens voient avant de cliquer.

**Une correction à faire une fois, dès que l'adresse est connue.**
Dans `index.html`, `og:image` et `twitter:image` pointent sur
`assets/og-image.jpg`, un chemin relatif — on ne peut pas y écrire
l'adresse du site avant de la connaître. Remplacez-les par l'adresse
complète :

```html
<meta property="og:image" content="https://VOTRE-SITE.vercel.app/assets/og-image.jpg">
<meta name="twitter:image" content="https://VOTRE-SITE.vercel.app/assets/og-image.jpg">
```

Facebook résout en général un chemin relatif, mais la spécification
demande une adresse absolue et certains lecteurs n'affichent rien sans
elle. Comme c'est précisément ce que voient les gens sur Instagram et
WhatsApp, cela vaut la minute que ça coûte.

Ensuite, vérifiez :

- Facebook : <https://developers.facebook.com/tools/debug/> → coller
  l'adresse → **Scrape Again**.
- WhatsApp : envoyez-vous le lien à vous-même.

Facebook garde l'ancien aperçu en cache pendant des jours : après toute
modification de `og-image.jpg` ou des balises `og:`, il faut repasser
par le débogueur.

---

## Ce qu'il y a dans le dossier

| Fichier | Rôle |
|---|---|
| `index.html` | toute la page |
| `styles.css` | la mise en forme |
| `app.js` | langue, liens de contact, boutons |
| `translations.js` | **généré** — les textes FR / AR / EN |
| `build-translations.mjs` | le générateur de `translations.js` |
| `build-assets.py` | le générateur de `assets/` (images et aperçu) |
| `assets/` | images, logo, icônes, aperçu de partage |
| `vercel.json` | cache des images, en-têtes de sécurité |

---

## Modifier les textes

Les textes ne se modifient **pas** dans `translations.js` : ce fichier
est écrasé à chaque génération.

La source est celle de l'application, dans
`frontend2/src/locales/{fr,ar,en}.json`. Corrigez-y le texte, puis
depuis la racine du dépôt :

```
node landing/build-translations.mjs
```

Le script échoue s'il manque une clé dans l'une des trois langues,
plutôt que de publier une page avec des libellés vides.

---

## ⚠️ Les deux pages sont jumelles, et il faut les tenir ensemble

La même page vitrine existe **deux fois** :

| | |
|---|---|
| **Dans l'application** | `frontend2/src/views/HomePage.vue` + `frontend2/src/components/Footer.vue` + `ContactLinks.vue` |
| **Ici** | `index.html` + `styles.css` + `app.js` |

Elles doivent rester identiques à l'œil. Ce n'est pas une élégance : un
numéro de téléphone corrigé d'un seul côté donne une vitrine qui promet
un contact injoignable, et personne ne s'en aperçoit avant de perdre une
demande de démo.

**Ce qui est partagé automatiquement** — les textes, via
`build-translations.mjs`.

**Ce qui est dupliqué à la main** — trois choses, et seulement trois :

1. **Les coordonnées.** `frontend2/src/data/contact.js` ⇄ l'objet
   `CONTACT` en haut de `app.js`.
2. **La mise en forme.** Les styles de `HomePage.vue` et `Footer.vue` ⇄
   `styles.css`.
3. **Les pictogrammes** des six points forts. `FeatureIcon.vue` ⇄ les
   `<svg>` de `index.html`.

Pourquoi ne pas partager le code ? Parce que la vitrine doit tourner
sans build sur Vercel et s'ouvrir par double-clic. L'y faire dépendre de
Vue et de Vite reviendrait à compiler toute l'application du cabinet
pour publier une page de présentation.

---

## Les images

`assets/` pèse environ **430 ko** au total. Les deux photos venaient de
l'application en PNG de 1,2 Mo chacune ; elles sont ici redimensionnées
à 760 px et réencodées en JPEG (45 ko et 30 ko). Elles sont opaques :
rien n'a été perdu du côté de la transparence.

Pour les régénérer après avoir changé une image dans l'application,
depuis la racine du dépôt :

```
pip install Pillow          # une seule fois
python landing/build-assets.py
```

Le script recopie les icônes telles quelles, réencode les deux photos et
recompose `og-image.jpg`. Il est rejouable : il écrase `assets/` sans
rien demander.
