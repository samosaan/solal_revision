/* Outils partagés par les jeux de Solal : voix, étoiles, déroulé d'une séance.
   À charger en fin de <body>. Expose un objet global `Solal`. */
(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const hasard = n => Math.floor(Math.random() * n);
  const choisir = a => a[hasard(a.length)];
  const melanger = a => { for (let i = a.length - 1; i > 0; i--) { const j = hasard(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pause = ms => new Promise(r => setTimeout(r, ms));
  const BRAVOS = ['Bravo !', 'Super !', 'Génial !', 'Bien joué !', 'Oui, bravo !'];

  /* ---------- Icônes partagées ---------- */
  document.body.insertAdjacentHTML('afterbegin', `
  <svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
    <symbol id="i-etoile" viewBox="0 0 100 100">
      <path d="M50 6 C55 6 58 30 62 36 C66 42 92 40 94 45 C96 50 74 62 72 69 C70 76 82 95 78 98 C74 101 56 84 50 84 C44 84 26 101 22 98 C18 95 30 76 28 69 C26 62 4 50 6 45 C8 40 34 42 38 36 C42 30 45 6 50 6 Z" fill="#EE7B5B" stroke="#C85D40" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="50" cy="52" r="3.5" fill="#FBF1DC"/><circle cx="50" cy="30" r="2.5" fill="#FBF1DC"/><circle cx="72" cy="48" r="2.5" fill="#FBF1DC"/><circle cx="28" cy="48" r="2.5" fill="#FBF1DC"/><circle cx="63" cy="74" r="2.5" fill="#FBF1DC"/><circle cx="37" cy="74" r="2.5" fill="#FBF1DC"/>
    </symbol>
    <symbol id="i-maison" viewBox="0 0 24 24"><path d="M3 11.5 12 4l9 7.5M5.5 10v9.5h5v-5h3v5h5V10" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></symbol>
    <symbol id="i-son" viewBox="0 0 24 24"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></symbol>
  </defs></svg>`);

  /* ---------- Sauvegarde locale ---------- */
  function lire(cle, defaut) {
    try { const b = localStorage.getItem(cle); if (b) return Object.assign(defaut(), JSON.parse(b)); } catch (e) {}
    return defaut();
  }
  function ecrire(cle, v) { try { localStorage.setItem(cle, JSON.stringify(v)); } catch (e) {} }

  /* ---------- Étoiles et jokers, communs à tous les jeux ---------- */
  const CLE_TRESOR = 'solal-tresor-v1';
  function lireTresor() {
    try {
      const b = localStorage.getItem(CLE_TRESOR);
      if (b) return JSON.parse(b);
      const n = JSON.parse(localStorage.getItem('solal-nombres-v1') || '{}');
      return { etoiles: n.etoiles || 0, jokers: n.jokers || 0 };
    } catch (e) { return { etoiles: 0, jokers: 0 }; }
  }
  function majTresor() {
    const t = lireTresor();
    $$('.js-etoiles').forEach(el => { el.textContent = t.etoiles; });
    $$('.js-jokers').forEach(el => { el.textContent = t.jokers; });
  }
  function gagnerEtoile() {
    const t = lireTresor();
    t.etoiles++;
    let joker = false;
    if (t.etoiles >= 10) { t.etoiles = 0; t.jokers++; joker = true; }
    ecrire(CLE_TRESOR, t);
    majTresor();
    return joker;
  }

  /* ---------- Voix ---------- */
  const parle = 'speechSynthesis' in window;
  let voix = null;
  function choisirVoix() {
    const fr = speechSynthesis.getVoices().filter(v => (v.lang || '').toLowerCase().startsWith('fr'));
    voix = fr.find(v => /fr[-_]fr/i.test(v.lang) && /amélie|amelie|thomas|audrey|marie|google/i.test(v.name))
        || fr.find(v => /fr[-_]fr/i.test(v.lang)) || fr[0] || null;
  }
  if (parle) { choisirVoix(); speechSynthesis.onvoiceschanged = choisirVoix; }
  function dire(texte, { vitesse = 0.85 } = {}) {
    return new Promise(fin => {
      if (!parle) { setTimeout(fin, 400 + texte.length * 40); return; }
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(texte);
      u.lang = 'fr-FR';
      if (voix) u.voice = voix;
      u.rate = vitesse;
      u.pitch = 1.05;
      let fait = false;
      const finir = () => { if (!fait) { fait = true; fin(); } };
      u.onend = finir;
      u.onerror = finir;
      setTimeout(finir, 900 + texte.length * 120);
      speechSynthesis.speak(u);
    });
  }
  function taire() { if (parle) speechSynthesis.cancel(); }

  /* ---------- Nombres en lettres ---------- */
  const UNITES = ['zéro', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf', 'dix',
    'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize'];
  const DIZAINES = { 20: 'vingt', 30: 'trente', 40: 'quarante', 50: 'cinquante', 60: 'soixante' };
  function enLettres(n) {
    if (n < 17) return UNITES[n];
    if (n < 20) return 'dix-' + UNITES[n - 10];
    if (n < 70) { const d = n - n % 10, u = n % 10; return DIZAINES[d] + (u === 0 ? '' : u === 1 ? ' et un' : '-' + UNITES[u]); }
    if (n < 80) return 'soixante' + (n === 71 ? ' et onze' : '-' + enLettres(n - 60));
    if (n < 100) return n === 80 ? 'quatre-vingts' : 'quatre-vingt-' + enLettres(n - 80);
    const c = Math.floor(n / 100), r = n % 100;
    const cent = c === 1 ? 'cent' : UNITES[c] + ' cent' + (r === 0 ? 's' : '');
    return r === 0 ? cent : cent + ' ' + enLettres(r);
  }
  function ordinal(n) {
    if (n === 1) return 'premier';
    let w = enLettres(n);
    if (w.endsWith('cinq')) return w + 'uième';
    if (w.endsWith('neuf')) return w.slice(0, -1) + 'vième';
    if (w.endsWith('s')) w = w.slice(0, -1);
    if (w.endsWith('e')) w = w.slice(0, -1);
    return w + 'ième';
  }

  /* ---------- Écrans ---------- */
  function montrer(id) {
    $$('.ecran').forEach(s => { s.hidden = s.id !== id; });
    majTresor();
  }

  function appuiLong(el, fn, duree = 1300) {
    let minuteur = null;
    const annuler = () => { clearTimeout(minuteur); el.classList.remove('charge'); };
    el.addEventListener('pointerdown', () => {
      el.classList.add('charge');
      minuteur = setTimeout(() => { annuler(); fn(); }, duree);
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => el.addEventListener(ev, annuler));
    el.addEventListener('contextmenu', e => e.preventDefault());
  }

  /* ---------- Déroulé d'une séance ----------
     jeux = { id: { preparer(m, palier), paliers, parSeance, libelle(palier), montee(palier) } } */
  function moteur({ cle, jeux, parSeance = 8 }) {
    const defaut = () => ({ paliers: {}, serie: {}, ratees: {}, stats: {} });
    const etat = lire(cle, defaut);
    for (const id in jeux) {
      etat.paliers[id] = Math.min(etat.paliers[id] || 0, (jeux[id].paliers || 1) - 1);
      etat.serie[id] = etat.serie[id] || 0;
      etat.ratees[id] = etat.ratees[id] || 0;
      etat.stats[id] = etat.stats[id] || {};
    }
    const m = { etat, jeu: null, occupe: false };
    const nbPaliers = id => jeux[id].paliers || 1;

    m.sauver = () => ecrire(cle, etat);
    m.palier = () => etat.paliers[m.jeu.id];

    m.libelles = () => {
      $$('[data-niveau]').forEach(el => {
        const j = jeux[el.dataset.niveau];
        el.textContent = j && j.libelle ? j.libelle(etat.paliers[el.dataset.niveau]) : '';
      });
    };

    m.lancer = id => {
      m.jeu = { id, num: 0, gagnees: 0, total: jeux[id].parSeance || parSeance };
      montrer('jeu');
      m.suivante();
    };

    function progres() {
      const j = m.jeu;
      $('#progres').innerHTML = j.total < 2 ? '' : Array.from({ length: j.total }, (_, i) =>
        `<i class="${i < j.num - 1 ? 'fait' : i === j.num - 1 ? 'encours' : ''}"></i>`).join('');
    }

    m.suivante = () => {
      const j = m.jeu;
      if (j.num >= j.total) { m.fin(); return; }
      j.num++;
      j.essais = 0;
      j.cle = null;
      j.consigne = '';
      progres();
      $('#scene').innerHTML = '';
      $('#reponses').innerHTML = '';
      jeux[j.id].preparer(m, etat.paliers[j.id]);
    };

    m.consigne = texte => {
      m.jeu.consigne = texte;
      m.occupe = true;
      return dire(texte).then(() => { m.occupe = false; });
    };

    m.noter = juste => {
      const k = m.jeu.cle;
      if (k == null) return;
      const s = etat.stats[m.jeu.id];
      if (!s[k]) s[k] = [0, 0];
      s[k][1]++;
      if (juste) s[k][0]++;
    };

    m.bonne = async (phrase, { etoile = true } = {}) => {
      const j = m.jeu;
      let texte = phrase || choisir(BRAVOS);
      if (j.essais <= 1) {
        m.noter(true);
        if (etoile) {
          j.gagnees++;
          if (gagnerEtoile()) texte += ' Tu as gagné un joker !';
        }
        etat.serie[j.id]++;
        etat.ratees[j.id] = 0;
        if (etat.serie[j.id] >= 5 && etat.paliers[j.id] < nbPaliers(j.id) - 1) {
          etat.paliers[j.id]++;
          etat.serie[j.id] = 0;
          const msg = jeux[j.id].montee && jeux[j.id].montee(etat.paliers[j.id]);
          if (msg) texte += ' ' + msg;
        }
      }
      m.sauver();
      await dire(texte);
      await pause(350);
      m.occupe = false;
      m.suivante();
    };

    m.mauvaise = () => {
      const j = m.jeu;
      if (j.essais !== 1) return;
      m.noter(false);
      etat.serie[j.id] = 0;
      etat.ratees[j.id]++;
      if (etat.ratees[j.id] >= 2 && etat.paliers[j.id] > 0) {
        etat.paliers[j.id]--;
        etat.ratees[j.id] = 0;
      }
      m.sauver();
    };

    /* Boutons de réponse. Toucher un bouton le dit à voix haute, puis le jeu juge.
       unCoup : pas de deuxième essai (réponses oui/non), on corrige et on passe. */
    m.choix = (options, { cible, rendu = v => v, dit = v => String(v), classe = '', style = () => '', aider, bravo, avantBravo, unCoup = false }) => {
      const zone = $('#reponses');
      zone.innerHTML = options.map((v, i) =>
        `<button class="rep ${classe}" data-i="${i}" style="${style(v)}">${rendu(v)}</button>`).join('');
      m.indice = () => {
        const b = $(`.rep[data-i="${options.indexOf(cible)}"]`, zone);
        if (b) b.classList.add('indice');
      };
      $$('.rep', zone).forEach(b => b.addEventListener('click', async () => {
        if (m.occupe || b.classList.contains('faux') || b.classList.contains('juste')) return;
        m.occupe = true;
        m.jeu.essais++;
        const v = options[+b.dataset.i];
        const texte = dit(v);
        if (texte) await dire(texte);
        if (v === cible) {
          $$('.rep', zone).forEach(x => x.classList.remove('indice'));
          b.classList.add('juste');
          if (avantBravo) await avantBravo(v);
          await m.bonne(bravo ? bravo(v) : null);
        } else {
          b.classList.add('faux');
          m.mauvaise();
          if (aider) await aider(v);
          if (unCoup) { await pause(300); m.occupe = false; m.suivante(); return; }
          if (m.jeu.essais >= 2) m.indice();
          m.occupe = false;
        }
      }));
    };

    m.fin = () => {
      montrer('fin');
      const n = m.jeu.gagnees;
      $('#fin-etoiles').innerHTML = Array.from({ length: n }, (_, i) =>
        `<svg class="etoile-svg" style="animation-delay:${i * 0.12}s"><use href="#i-etoile"/></svg>`).join('');
      $('#fin-texte').textContent = n === 0 ? 'Tu as bien travaillé.' : `${n} étoile${n > 1 ? 's' : ''} gagnée${n > 1 ? 's' : ''}`;
      const dit = n === 0 ? 'Tu as bien travaillé.' : `Tu as gagné ${n === 1 ? 'une étoile' : enLettres(n) + ' étoiles'}.`;
      dire(`Bravo Solal ! ${dit} Tu peux faire une pause.`);
    };

    /* Réussite par élément, pour l'espace parent. */
    m.statsHTML = (noms, ordre = {}) => Object.keys(jeux).map(id => {
      const s = etat.stats[id];
      let cles = Object.keys(s);
      if (ordre[id]) cles = ordre[id].filter(k => s[k]);
      const puces = cles.map(k => {
        const [ok, tot] = s[k];
        const t = ok / tot;
        const cls = t >= 0.8 ? 'vert' : t >= 0.5 ? 'orange' : 'rouge';
        return `<span class="puce ${cls}"><b>${k}</b>${ok}/${tot}</span>`;
      }).join('') || '<span class="puce">pas encore joué</span>';
      const lib = jeux[id].libelle ? ` · ${jeux[id].libelle(etat.paliers[id])}` : '';
      return `<h3>${noms[id]}<span style="font-weight:400;font-size:15px;color:var(--encre-douce)">${lib}</span></h3><div class="puces">${puces}</div>`;
    }).join('');

    m.effacer = () => {
      for (const id in jeux) { etat.paliers[id] = 0; etat.serie[id] = 0; etat.ratees[id] = 0; etat.stats[id] = {}; }
      m.sauver();
    };

    /* Navigation commune */
    $$('.tuile[data-jeu]').forEach(t => t.addEventListener('click', () => m.lancer(t.dataset.jeu)));
    const retour = () => { taire(); m.occupe = false; montrer('accueil'); m.libelles(); };
    $('#btn-maison') && $('#btn-maison').addEventListener('click', retour);
    $('#btn-accueil') && $('#btn-accueil').addEventListener('click', retour);
    $('#btn-encore') && $('#btn-encore').addEventListener('click', () => m.lancer(m.jeu.id));
    $('#btn-reecouter') && $('#btn-reecouter').addEventListener('click', () => {
      if (!m.occupe && m.jeu && m.jeu.consigne) m.consigne(m.jeu.consigne);
    });
    m.retour = retour;
    m.libelles();
    majTresor();
    return m;
  }

  window.Solal = {
    $, $$, hasard, choisir, melanger, pause, BRAVOS,
    lire, ecrire, dire, taire, enLettres, ordinal,
    montrer, appuiLong, majTresor, gagnerEtoile, moteur
  };
})();
