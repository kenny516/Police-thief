class Person {
    constructor(name, place, type) {
        this.name = name
        this.place = place
        this.type = type
    }

    get name() {
        return this._name
    }

    get place() {
        return this._place
    }

    get type() {
        return this._type
    }


    set name(value) {
        if (typeof value == "string")
            this._name = value
        else
            console.error("incompatible type string name"+value);
    }

    set place(value) {
        if (value instanceof Sommet) {
            this._place = value
        } else {
            console.error("incompatible type sommet /place");
        }

    }

    set type(value) {
        if (typeof value === "string") {
            this._type = value
        } else {
            console.error("incompatible tpye of string type");
        }
    }

    can_moov(other, personnes) {
        if (this.place.voisins.includes(other)) {
            let canMove = true;
            for (const personne of personnes) {
                if (other === personne.place) {
                    return false;
                }
            }
            return  true;
        } else {
            return false;
        }
    }

    deplacer(other, personnes) {
        if (this.can_moov(other, personnes)) {
            this.place = other
            return true;
        } else {
            console.error("can't moov here ".other.id);
            return false;
        }
    }

}


