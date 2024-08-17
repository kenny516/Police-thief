class Sommet {
  constructor(id) {
    // this.id = id
    this._voisins = [];
    this.id = id;
  }

  get id() {
    return this._id;
  }

  get voisins() {
    return this._voisins;
  }

  set voisins(value) {
    if (value instanceof Sommet) {
      this._voisins.push(value);
    } else {
      console.error("incompatible type of Sommet");
    }
  }

  set id(value) {
    if (typeof value === "string") this._id = value;
    else console.error("incompatible type str in id");
  }

  verifieDeplacement(sommet_moov) {
    let voisins = this._voisins;
    return voisins.includes(sommet_moov);
  }

  static get_sommet_by_id(indice, sommets) {
    for (const sommet of sommets) {
      if (sommet.id === indice) {
        return sommet;
      }
    }
    console.error("id introuvable " + indice + " not found");
    return null;
  }

  static reconstruireChemin(predecesseurs, sommetArrivee) {
    const chemin = [];
    let sommet = sommetArrivee;

    // On remonte le chemin depuis le sommet d'arrivée jusqu'au sommet de départ
    while (sommet !== null) {
      chemin.unshift(sommet);
      sommet = predecesseurs.get(sommet);
    }
    return chemin;
  }

  static trouverChemin(game, sommetDepart, sommetArrivee) {
    const fileAttente = [[sommetDepart]]; // File de chemins à explorer
    const dejaVisites = new Set();
    let cheminsTrouves = [
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1,
    ]; // stocker tous les chemins

    // Parcours en largeur
    while (fileAttente.length > 0) {
      const cheminCourant = fileAttente.shift(); // Prendre le premier chemin dans la file
      const sommetCourant = cheminCourant[cheminCourant.length - 1]; // Dernier sommet du chemin
      if (sommetCourant.id === sommetArrivee.id) {
        // return cheminCourant;
        if (cheminsTrouves.length > cheminCourant.length) {
          cheminsTrouves = cheminCourant;
        }
        continue; // Continuer avec le prochain chemin dans la file
      }

      dejaVisites.add(sommetCourant);

      // Explorer les voisins du sommet courant
      for (const voisin of sommetCourant.voisins) {
        if (!dejaVisites.has(voisin) && !game.getcopsByPlace(voisin)) {
          // Créer un nouveau chemin en ajoutant le voisin au chemin courant
          const nouveauChemin = [...cheminCourant, voisin];
          fileAttente.push(nouveauChemin);
        }
      }
    }
    return cheminsTrouves;
  }

  static tacticPolicier(game, dificulty) {
    const df = dificulty + 0;
    const mimax = Sommet.minimax(game, dificulty, df, true);
    game.getCops()[mimax[1]].deplacer(mimax[0], game.personnes);
    console.log("chemin trouver =");
    console.log(mimax);
    return game.getCops(mimax[1]);
  }

  comparChemin(tableau) {
    let id = 0;
    let tailleMax = 0;
    0;
    for (let i = 0; i < tableau.length; i++) {
      if (tailleMax < tableau[i].length) {
        id = i.valueOf();
        tailleMax = tableau[i].length;
      }
    }
    return id;
  }

  static evaluateGame(gameState) {
    const voleur = gameState.get_voleur();
    const voleurCentre = Sommet.trouverChemin(
      gameState,
      voleur.place,
      gameState.sommets[4]
    );

    const policiers = gameState.getCops();
    var point = 0;
    for (const pointPol of policiers) {
      const cheminPolVol = Sommet.trouverChemin(
        gameState,
        pointPol.place,
        voleur.place
      );
      point = point - (cheminPolVol.length > 0 ? cheminPolVol.length : 0);
    }
    point = point + (voleurCentre.length > 0 ? voleurCentre.length : 0);
    return point;
  }
  static minimax(
    gameState,
    depth,
    df,
    maximizingPlayer,
    alpha = -Infinity,
    beta = Infinity
  ) {
    if (
      depth === 0 ||
      gameState.winGame(gameState.thief) ||
      gameState.loseGame(gameState)
    ) {
      return Sommet.evaluateGame(gameState);
    }

    if (maximizingPlayer) {
      let maxEval = -Infinity;
      let bestMoveAndPolice = [null, null];

      for (let i = 0; i < gameState.getCops().length; i++) {
        const police = gameState.getCops()[i];

        for (const neighbor of police.place.voisins) {
          if (
            !gameState.getcopsByPlace(neighbor) &&
            police.can_moov(neighbor, gameState.personnes)
          ) {
            const Pnew = new Person(police.name, neighbor, police.type);
            const newPoliceState = gameState
              .getCops()
              .map((p, index) => (index === i ? Pnew : p));
            const newState = new Game(gameState.thief, newPoliceState);
            const evaluate = Sommet.minimax(
              newState,
              depth - 1,
              df,
              false,
              alpha,
              beta
            );
            if (evaluate > maxEval) {
              maxEval = evaluate;
              bestMoveAndPolice = [neighbor, i];
            }
            alpha = Math.max(alpha, evaluate);
            if (beta <= alpha) {
              break; // Beta cut-off
            }
          }
        }
      }

      return depth === df ? bestMoveAndPolice.slice() : maxEval;
    } else {
      let minEval = Infinity;

      for (const neighbor of gameState.thief.place.voisins) {
        if (gameState.thief.can_moov(neighbor, gameState.personnes)) {
          const newThiefState = new Person(
            gameState.thief.name,
            neighbor,
            gameState.thief.type
          );
          const newState = new Game(newThiefState, gameState.getCops());
          const evaluate = Sommet.minimax(
            newState,
            depth - 1,
            df,
            true,
            alpha,
            beta
          );
          minEval = Math.min(minEval, evaluate);
          beta = Math.min(beta, evaluate);
          if (beta <= alpha) {
            break; // Alpha cut-off
          }
        }
      }
      return minEval;
    }
  }
}
