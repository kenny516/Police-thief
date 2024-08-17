class Game {
  get thief() {
    return this._thief;
  }

  set thief(value) {
    this._thief = value;
  }

  get police() {
    return this._police;
  }

  set police(value) {
    this._police = value;
  }

  constructor(thief = null, police = []) {
    // center
    let cn = new Sommet("cn");
    let cs = new Sommet("cs");
    let cw = new Sommet("cw");
    let ce = new Sommet("ce");
    let cc = new Sommet("cc");
    //nord
    let nn = new Sommet("nn");
    let ns = new Sommet("ns");
    let nw = new Sommet("nw");
    let ne = new Sommet("ne");
    //south
    let sn = new Sommet("sn");
    let ss = new Sommet("ss");
    let sw = new Sommet("sw");
    let se = new Sommet("se");
    //west
    let wn = new Sommet("wn");
    let ws = new Sommet("ws");
    let ww = new Sommet("ww");
    let we = new Sommet("we");
    //east
    let en = new Sommet("en");
    let es = new Sommet("es");
    let ew = new Sommet("ew");
    let ee = new Sommet("ee");

    // linking
    // center
    cn.voisins = cw;
    cn.voisins = ce;
    cn.voisins = ns;
    cn.voisins = cc;

    cc.voisins = cs;
    cc.voisins = cw;
    cc.voisins = ce;
    cc.voisins = cn;

    cs.voisins = cc;
    cs.voisins = cw;
    cs.voisins = ce;
    cs.voisins = sn;

    cw.voisins = cn;
    cw.voisins = cs;
    cw.voisins = cc;
    cw.voisins = we;

    ce.voisins = cn;
    ce.voisins = cs;
    ce.voisins = cc;
    ce.voisins = ew;

    //nord
    nn.voisins = ns;
    nn.voisins = nw;
    nn.voisins = ne;

    ns.voisins = nn;
    ns.voisins = nw;
    ns.voisins = ne;
    ns.voisins = cn;

    nw.voisins = nn;
    nw.voisins = ns;
    nw.voisins = wn;

    ne.voisins = nn;
    ne.voisins = ns;
    ne.voisins = en;

    //south
    sn.voisins = ss;
    sn.voisins = sw;
    sn.voisins = se;
    sn.voisins = cs;

    ss.voisins = sn;
    ss.voisins = sw;
    ss.voisins = se;

    sw.voisins = sn;
    sw.voisins = ss;
    sw.voisins = ws;

    se.voisins = sn;
    se.voisins = ss;
    se.voisins = es;

    //west
    wn.voisins = nw;
    wn.voisins = we;
    wn.voisins = ww;

    ws.voisins = ww;
    ws.voisins = we;
    ws.voisins = sw;

    ww.voisins = wn;
    ww.voisins = ws;
    ww.voisins = we;

    we.voisins = wn;
    we.voisins = ws;
    we.voisins = ww;
    we.voisins = cw;

    //east
    en.voisins = ne;
    en.voisins = ee;
    en.voisins = ew;

    es.voisins = ee;
    es.voisins = ew;
    es.voisins = se;

    ew.voisins = en;
    ew.voisins = es;
    ew.voisins = ee;
    ew.voisins = ce;

    ee.voisins = en;
    ee.voisins = es;
    ee.voisins = ew;

    this.sommets = [
      cn,
      cs,
      cw,
      ce,
      cc,
      nn,
      ns,
      nw,
      ne,
      sn,
      ss,
      sw,
      se,
      wn,
      ws,
      ww,
      we,
      en,
      es,
      ew,
      ee,
    ];
    if (thief) {
      this._thief = thief;
      this._personnes = [thief, ...police];
      this._police = police;
    } else {
      let thief = new Person("voleur", cc, "V");
      let police1 = new Person("Police1", cn, "P");
      let police2 = new Person("Police2", cw, "P");
      let police3 = new Person("Police3", cs, "P");
      this._personnes = [thief, police1, police2, police3];
      this._police = [police1, police2, police3];
      this._thief = thief;
    }
  }

  get personnes() {
    return this._personnes;
  }

  set personnes(value) {
    this._personnes = value;
  }

  get sommets() {
    return this._sommets;
  }

  set sommets(value) {
    this._sommets = value;
  }

  /*personne voleur*/
  lose(personne, personnesOther) {
    let sommet_possible = personne.place.voisins;
    let bool = false;
    let nbr = 0;
    if (personne.type === "V") {
      sommet_possible.forEach(function (sommet) {
        if (!personne.can_moov(sommet, personnesOther)) {
          nbr++;
        }
      });
    }
    if (nbr === sommet_possible.length) {
      bool = true;
    }
    return bool;
  }

  loseGame(game) {
    let sommet_possible = game.thief.place.voisins;
    let bool = false;
    let nbr = 0;
    sommet_possible.forEach(function (sommet) {
      if (!game.thief.can_moov(sommet, game.personnes)) {
        nbr++;
      }
    });
    if (nbr === sommet_possible.length) {
      bool = true;
    }
    return bool;
  }

  /*personne voleur*/
  winGame(personne) {}

  get_voleur() {
    for (const personne of this.personnes) {
      if (personne.type === "V") {
        return personne;
      }
    }
    console.error("aucun voleur sur la plateforme de jeu");
    return null;
  }

  getCops() {
    const tabPolice = [];
    for (const personne of this.personnes) {
      if (personne.type === "P") {
        tabPolice.push(personne); // Ajouter la personne à tabPolice
      }
    }
    if (tabPolice.length === 0) {
      console.error("aucun policier sur la plateforme de jeu");
    }
    return tabPolice.length > 0 ? tabPolice : null; // Retourner le tableau si au moins un policier est trouvé, sinon null
  }

  getcopsByPlace(place) {
    let bool = false;
    for (const personne of this.getCops()) {
      if (personne.place.id === place.id) {
        bool = true;
      }
    }
    return bool;
  }

  initial_paint() {
    this.personnes.forEach(function (personne) {
      const classeAncienne = document.getElementsByClassName(
        personne.place.id
      )[0];
      if (classeAncienne) {
        if (personne.type === "V") {
          classeAncienne.style.backgroundColor = "red";
        } else {
          classeAncienne.style.backgroundColor = "blue";
        }
      } else {
        console.error("Element not found with ID:", personne.place.id);
      }
    });
  }
}
