/**
 * Fabrique landing/translations.js à partir des fichiers de langue de
 * l'application.
 * ==================================================================
 *
 * POURQUOI UN GÉNÉRATEUR PLUTÔT QU'UNE COPIE À LA MAIN
 * -----------------------------------------------------
 * La page vitrine autonome ne peut rien importer de `frontend2` : elle
 * doit tourner sur Vercel sans build, et s'ouvrir par double-clic.
 * Les textes doivent pourtant être EXACTEMENT ceux de l'application,
 * dans les trois langues — sinon la vitrine promet une chose et le
 * logiciel en affiche une autre.
 *
 * Ce script recopie donc les seules clés dont la vitrine a besoin, et
 * il est rejouable : après toute retouche de fr/ar/en.json, relancer
 *
 *     node landing/build-translations.mjs
 *
 * Il ÉCHOUE si une clé attendue manque, plutôt que d'écrire une page
 * avec des trous — un libellé vide en production ne se remarque
 * qu'une fois le lien partagé.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const LOCALES = join(HERE, "..", "frontend2", "src", "locales");
const LANGS = ["fr", "ar", "en"];

/** Les clés affichées par index.html, et elles seules. */
const KEYS = [
  "nav.language",
  "home.tagline",
  "home.titleBefore",
  "home.titleMiddle",
  "home.titleAfter",
  "home.intro",
  "home.secondTitle",
  "home.secondText",
  "home.ctaDemo",
  "home.ctaContact",
  "home.demoMessage",
  "home.contactSubject",
  "home.featuresTitle",
  "home.contactTitle",
  "home.contactText",
  ...["records", "vaccines", "agenda", "billing", "stock", "offline"].flatMap((f) => [
    `home.features.${f}.title`,
    `home.features.${f}.desc`,
  ]),
  "footer.getInTouch",
  "footer.rights",
  "footer.facebook",
  "footer.linkedin",
];

const dig = (object, path) =>
  path.split(".").reduce((node, part) => (node == null ? undefined : node[part]), object);

const bundle = {};
const missing = [];

for (const lang of LANGS) {
  const source = JSON.parse(readFileSync(join(LOCALES, `${lang}.json`), "utf8"));
  const flat = {};
  for (const key of KEYS) {
    const value = dig(source, key);
    if (typeof value !== "string") missing.push(`${lang}: ${key}`);
    else flat[key] = value;
  }
  bundle[lang] = flat;
}

if (missing.length) {
  console.error("Clés absentes des fichiers de langue :");
  missing.forEach((m) => console.error("  " + m));
  process.exit(1);
}

const out = `/* ------------------------------------------------------------------
 * FICHIER GÉNÉRÉ — ne pas modifier à la main.
 *
 * Source : frontend2/src/locales/{fr,ar,en}.json
 * Régénérer :  node landing/build-translations.mjs
 * ------------------------------------------------------------------ */
window.PETTOVET_I18N = ${JSON.stringify(bundle, null, 2)};
`;

writeFileSync(join(HERE, "translations.js"), out, "utf8");
console.log(`translations.js écrit — ${KEYS.length} clés × ${LANGS.length} langues`);
