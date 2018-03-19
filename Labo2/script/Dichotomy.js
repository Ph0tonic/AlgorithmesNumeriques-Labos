class Dichotomy extends Algorithm{
  //Constructeur
  constructor(plot, resultArea){
    super(plot, resultArea);
    this.x1 = this.plot.getX1();
    this.x2 = this.plot.getX2();
    this.zeroFounded = false;

    //Détection de la valeurs de f(x) aux deux bornes
    if(this._evaluateBorneSigneEqual()){
      this._displayResult('<div class="alert alert-danger" role="alert">Erreur, valeurs de la fonction aux bornes du même signes!</div>')
      console.log("Erreur, bornes du même signes");
    }
  }

//Calcul de la prochaine pour l'affichage
  nextStep(){
    ++this.step;
    //Calcul de la prochaine étape et ajout de celle-ci dans le tableau data
    if(this.step > this.data.length && !this.zeroFounded){
      if(this._evaluateBorneSigneEqual()){
        this._displayResult('<div class="alert alert-danger" role="alert">Erreur, valeurs de la fonction aux bornes du même signes!</div>')
        console.log("Erreur, bornes du même signes");
      }else{
        //calcul de la nouvelle borne
        let middle = (this.x1 + this.x2)/2;
        let value = this.plot.getValue(middle);
        if(Dichotomy._sameSign(this.plot.getValue(this.x1), value)){
          this.x1 = middle;
        }else{
          this.x2 = middle;
        }

        this.data.push([middle, value]);
        //Vérification de la valeur trouvée et de 0
        if(Algorithm.isEqualsDefaultEpsilon(value,0)){
          this.zeroFounded = true;
          console.log("Founded!!!");
        }
      }
      //Arrêt du procédé dans le cas ou l'on a trouvé 0
    }else if(this.zeroFounded){
      --this.step;
    }
    return this.step;
  }

  //Retourne graphe contenant des points pour représenter la recherche
  draw(){
    let data = this.getData();
    if(data.length > 0){
      //Affichage des valeurs de x
      this._displayResult(data);
    }
    return [{
        points: data,
        attr:{'stroke-width': 3},
        fnType: 'points',
        color: 'red',
        graphType: 'scatter'
    }];
  }

  //Evalue l'état des bornes, si elles sonr du même signe
  _evaluateBorneSigneEqual(){
    return Dichotomy._sameSign(this.plot.getValue(this.x1), this.plot.getValue(this.x2));
  }

  //Test si deux valeurs ont le même signe
  static _sameSign(x1, x2){
    return (x1>0) === (x2>0);
  }
}
