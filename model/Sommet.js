class Sommet {
  constructor(id) {
    this._id = id;
    this._voisins = [];
  }

  get id() {
    return this._id;
  }

  set id(value) {
    if (typeof value === "string") {
      this._id = value;
    } else {
      console.error("ID must be a string");
    }
  }

  get voisins() {
    return this._voisins;
  }

  set voisins(value) {
    if (value instanceof Sommet) {
      this._voisins.push(value);
    } else {
      console.error("Value must be an instance of Sommet");
    }
  }

  verifieDeplacement(sommet_moov) {
    return this._voisins.includes(sommet_moov);
  }

  static get_sommet_by_id(indice, sommets) {
    const sommet = sommets.find((sommet) => sommet.id === indice);
    if (!sommet) {
      console.error(`ID ${indice} not found`);
    }
    return sommet;
  }

  static reconstruireChemin(predecesseurs, sommetArrivee) {
    const chemin = [];
    let sommet = sommetArrivee;

    while (sommet !== null) {
      chemin.unshift(sommet);
      sommet = predecesseurs.get(sommet);
    }

    return chemin;
  }

  static trouverChemin(game, sommetDepart, sommetArrivee) {
    const fileAttente = [[sommetDepart]];
    const dejaVisites = new Set();
    let cheminOptimal = null;

    while (fileAttente.length > 0) {
      const cheminCourant = fileAttente.shift();
      const sommetCourant = cheminCourant[cheminCourant.length - 1];

      if (sommetCourant.id === sommetArrivee.id) {
        if (!cheminOptimal || cheminCourant.length < cheminOptimal.length) {
          cheminOptimal = cheminCourant;
        }
        continue;
      }

      dejaVisites.add(sommetCourant);

      for (const voisin of sommetCourant.voisins) {
        if (!dejaVisites.has(voisin) && !game.getcopsByPlace(voisin)) {
          const nouveauChemin = [...cheminCourant, voisin];
          fileAttente.push(nouveauChemin);
        }
      }
    }

    return cheminOptimal || [];
  }

  static tacticPolicier(game, difficulty) {
    const depth = difficulty;
    const bestMove = Sommet.minimax(game, difficulty, depth, true);
    const bestMoveSommet = bestMove[0];
    const policeIndex = bestMove[1];

    game.getCops()[policeIndex].deplacer(bestMoveSommet, game.personnes);

    console.log("Best move found:", bestMove);

    return game.getCops(policeIndex);
  }

  comparChemin(tableaux) {
    let maxLength = 0;
    let maxIndex = 0;

    for (let i = 0; i < tableaux.length; i++) {
      if (tableaux[i].length > maxLength) {
        maxLength = tableaux[i].length;
        maxIndex = i;
      }
    }

    return maxIndex;
  }

  static evaluateGame(gameState) {
    const voleur = gameState.get_voleur();
    const voleurCentre = Sommet.trouverChemin(
      gameState,
      voleur.place,
      gameState.sommets[4]
    );

    const policiers = gameState.getCops();
    let score = 0;

    for (const police of policiers) {
      const cheminPolVol = Sommet.trouverChemin(
        gameState,
        police.place,
        voleur.place
      );
      score -= cheminPolVol.length > 0 ? cheminPolVol.length : 0;

      const policeCentre = Sommet.trouverChemin(
        gameState,
        police.place,
        gameState.sommets[4]
      );
      score += policeCentre.length > 0 ? policeCentre.length : 0;
    }

    score += voleurCentre.length > 0 ? voleurCentre.length : 0;

    const escapeRoutes = voleur.place.voisins.filter((neighbor) =>
      voleur.can_moov(neighbor, gameState.personnes)
    ).length;
    score -= escapeRoutes * 5;

    return score;
  }

  static minimax(
    gameState,
    depth,
    maxDepth,
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
            const newPoliceState = gameState
              .getCops()
              .map((p, index) =>
                index === i ? new Person(police.name, neighbor, police.type) : p
              );
            const newState = new Game(gameState.thief, newPoliceState);
            const evale = Sommet.minimax(
              newState,
              depth - 1,
              maxDepth,
              false,
              alpha,
              beta
            );

            if (evale > maxEval) {
              maxEval = evale;
              bestMoveAndPolice = [neighbor, i];
            }

            alpha = Math.max(alpha, evale);
            if (beta <= alpha) break; // Beta cut-off
          }
        }
      }

      return depth === maxDepth ? bestMoveAndPolice.slice() : maxEval;
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
          const evale = Sommet.minimax(
            newState,
            depth - 1,
            maxDepth,
            true,
            alpha,
            beta
          );

          minEval = Math.min(minEval, evale);
          beta = Math.min(beta, evale);
          if (beta <= alpha) break; // Alpha cut-off
        }
      }

      return minEval;
    }
  }
}
