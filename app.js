/* ==================================================================
   PettoVet — page vitrine autonome
   ------------------------------------------------------------------
   Aucun cadre applicatif, aucun module ES : un simple <script>.

   POURQUOI PAS DE MODULE
   ----------------------
   La page doit s'ouvrir par DOUBLE-CLIC sur index.html, donc en
   file://. Les navigateurs refusent d'y charger un module ES (politique
   d'origine). Un script classique fonctionne aussi bien depuis le
   disque que depuis Vercel — et cette page n'a de toute façon rien à
   assembler.
   ================================================================== */
(function () {
  "use strict";

  // ----------------------------------------------------------------
  //  Coordonnées — copie de frontend2/src/data/contact.js
  //  C'est l'UNIQUE duplication assumée de ce dossier : la vitrine ne
  //  peut rien importer de l'application. Toute correction faite là-bas
  //  doit être reportée ici (voir README.md).
  // ----------------------------------------------------------------
  var CONTACT = {
    facebook: "https://web.facebook.com/profile.php?id=61594945136996",
    instagram: "https://www.instagram.com/pettovet1/",
    instagramLabel: "@pettovet1",
    email: "contactpettovet@gmail.com",
    emailHref: "mailto:contactpettovet@gmail.com",
    // Profil PERSONNEL : le libellé est « LinkedIn », rien de plus.
    linkedin: "https://www.linkedin.com/in/hamla-ait-ellah-9b716a287/",
    whatsapp: "https://wa.me/213778788126",
    // dir="ltr" à l'affichage : sans cela l'arabe renvoie le « +213 » à
    // l'autre bout et le numéro devient impossible à recopier.
    whatsappLabel: "+213 778 78 81 26"
  };

  var LOCALES = {
    fr: { dir: "ltr", ogLocale: "fr_FR" },
    ar: { dir: "rtl", ogLocale: "ar_DZ" },
    en: { dir: "ltr", ogLocale: "en_US" }
  };
  var DEFAULT_LOCALE = "fr";
  var STORAGE_KEY = "pettovet-locale";

  var messages = window.PETTOVET_I18N || {};

  // ----------------------------------------------------------------
  //  Langue
  // ----------------------------------------------------------------
  function stored() {
    try {
      var value = localStorage.getItem(STORAGE_KEY);
      return LOCALES[value] ? value : null;
    } catch (e) {
      // Navigation privée, cookies bloqués : on s'en passe.
      return null;
    }
  }

  /**
   * Celle qu'il a choisie la dernière fois, sinon le français.
   *
   * Pas de déduction à partir de `navigator.language` : l'application,
   * elle, démarre en français sans rien deviner (frontend2/src/i18n).
   * Les deux pages doivent se comporter pareil — et un vétérinaire
   * algérien dont le navigateur est en anglais n'attend pas pour autant
   * une vitrine en anglais.
   */
  function initialLocale() {
    return stored() || DEFAULT_LOCALE;
  }

  var current = initialLocale();

  function t(key) {
    var pack = messages[current] || messages[DEFAULT_LOCALE] || {};
    return pack[key] !== undefined ? pack[key] : key;
  }

  // ----------------------------------------------------------------
  //  Les liens qui dépendent de la langue
  // ----------------------------------------------------------------
  //  Le message WhatsApp et l'objet du courriel sont pré-remplis dans la
  //  langue affichée : un vétérinaire arabophone à qui l'on présente un
  //  brouillon en français hésite, et l'hésitation se solde par un
  //  message jamais envoyé.
  function demoHref() {
    return CONTACT.whatsapp + "?text=" + encodeURIComponent(t("home.demoMessage"));
  }
  function contactHref() {
    return CONTACT.emailHref + "?subject=" + encodeURIComponent(t("home.contactSubject"));
  }

  // ----------------------------------------------------------------
  //  Les cinq contacts — même liste dans le pied de page et la
  //  section de contact, construite une fois.
  // ----------------------------------------------------------------
  var WHATSAPP_SVG =
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
    '<path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.3-1.38a9.86 9.86 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.44 9.9-9.9 0-2.65-1.03-5.13-2.9-7A9.82 9.82 0 0 0 12.04 2zm0 1.8c2.16 0 4.19.84 5.72 2.37a8.03 8.03 0 0 1 2.37 5.72c0 4.47-3.63 8.1-8.1 8.1a8.2 8.2 0 0 1-4.13-1.13l-.3-.18-3.07.8.82-3-.19-.31a8.08 8.08 0 0 1-1.24-4.32c0-4.47 3.64-8.1 8.12-8.1zM8.6 6.98c-.16 0-.42.06-.64.3-.22.24-.85.83-.85 2.02s.87 2.34.99 2.5c.12.16 1.7 2.72 4.19 3.72.58.25 1.04.4 1.4.51.59.19 1.12.16 1.54.1.47-.07 1.45-.6 1.66-1.17.2-.57.2-1.06.14-1.17-.06-.1-.22-.16-.46-.28-.24-.12-1.45-.72-1.67-.8-.22-.08-.39-.12-.55.12-.16.24-.63.8-.77.96-.14.16-.28.18-.52.06-.24-.12-1.04-.38-1.97-1.22-.73-.65-1.22-1.46-1.36-1.7-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.34-.76-1.83-.19-.44-.38-.38-.52-.39h-.45z"/>' +
    "</svg>";

  function icon(file) {
    return '<img src="assets/' + file + '" alt="" aria-hidden="true">';
  }

  function contactRows() {
    return [
      { href: CONTACT.emailHref, icon: icon("email-icon.png"), label: CONTACT.email, ltr: true, external: false },
      { href: CONTACT.whatsapp, icon: WHATSAPP_SVG, label: CONTACT.whatsappLabel, ltr: true, external: true },
      { href: CONTACT.instagram, icon: icon("ig-icon.png"), label: CONTACT.instagramLabel, ltr: true, external: true },
      { href: CONTACT.facebook, icon: icon("fb-icon.png"), label: t("footer.facebook"), ltr: false, external: true },
      { href: CONTACT.linkedin, icon: icon("linkedin-icon.png"), label: t("footer.linkedin"), ltr: false, external: true }
    ];
  }

  function renderContactLinks() {
    var html = contactRows()
      .map(function (row) {
        return (
          "<li><a class=\"contact-link\" href=\"" + row.href + "\"" +
          (row.external ? ' target="_blank" rel="noopener noreferrer"' : "") +
          ">" + row.icon +
          "<span" + (row.ltr ? ' dir="ltr"' : "") + ">" + row.label + "</span>" +
          "</a></li>"
        );
      })
      .join("");

    var lists = document.querySelectorAll(".contact-links");
    for (var i = 0; i < lists.length; i++) lists[i].innerHTML = html;
  }

  // ----------------------------------------------------------------
  //  Application de la langue
  // ----------------------------------------------------------------
  function apply() {
    var root = document.documentElement;
    root.setAttribute("lang", current);
    // C'est cet attribut qui déclenche le miroir de la mise en page :
    // tout le CSS est écrit en propriétés logiques.
    root.setAttribute("dir", LOCALES[current].dir);

    var nodes = document.querySelectorAll("[data-i18n]");
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].textContent = t(nodes[i].getAttribute("data-i18n"));
    }

    var labelled = document.querySelectorAll("[data-i18n-aria-label]");
    for (var j = 0; j < labelled.length; j++) {
      labelled[j].setAttribute("aria-label", t(labelled[j].getAttribute("data-i18n-aria-label")));
    }

    var demos = document.querySelectorAll('[data-link="demo"]');
    for (var k = 0; k < demos.length; k++) demos[k].href = demoHref();

    var contacts = document.querySelectorAll('[data-link="contact"]');
    for (var l = 0; l < contacts.length; l++) contacts[l].href = contactHref();

    var buttons = document.querySelectorAll(".locale-btn");
    for (var m = 0; m < buttons.length; m++) {
      var on = buttons[m].getAttribute("data-locale") === current;
      buttons[m].classList.toggle("is-active", on);
      buttons[m].setAttribute("aria-pressed", on ? "true" : "false");
    }

    var og = document.querySelector('meta[property="og:locale"]');
    if (og) og.setAttribute("content", LOCALES[current].ogLocale);

    renderContactLinks();
  }

  function setLocale(code) {
    if (!LOCALES[code]) return;
    current = code;
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch (e) {
      // Sans stockage, le choix ne survit pas au rechargement. Tant pis :
      // il vaut mieux une page qui change de langue qu'une page qui plante.
    }
    apply();
  }

  function start() {
    var buttons = document.querySelectorAll(".locale-btn");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener("click", function () {
        setLocale(this.getAttribute("data-locale"));
      });
    }
    apply();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
