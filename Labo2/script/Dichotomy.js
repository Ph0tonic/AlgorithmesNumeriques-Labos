class Dichotomy extends Algorithm{
  constructor(plot, resultArea){
    super(plot, resultArea);
    this.x1 = this.plot.getX1();
    this.x2 = this.plot.getX2();
    this.zeroFounded = false;
    if(this._evaluateBorneSigneEqual()){
      this._displayResult('<div class="alert alert-danger" role="alert">Erreur, valeurs de la fonction aux bornes du même signes!</div>')
      console.log("Erreur, bornes du même signes");
    }
  }

  nextStep(){
    ++this.step;
    if(this.step > this.data.length && !this.zeroFounded){
      //Calcul de la prochaine étape et ajout de celle-ci dans le tableau data
      if(this._evaluateBorneSigneEqual()){
        this._displayResult('<div class="alert alert-danger" role="alert">Erreur, valeurs de la fonction aux bornes du même signes!</div>')
        console.log("Erreur, bornes du même signes");
      }else{
        let middle = (this.x1 + this.x2)/2;
        let value = this.plot.getValue(middle);
        if(Dichotomy._sameSign(this.plot.getValue(this.x1), value)){
          this.x1 = middle;
        }else{
          this.x2 = middle;
        }

        this.data.push([middle, value]);

        if(Algorithm.isEqualsDefaultEpsilon(value),0){
          this.zeroFounded = true;
          console.log("Founded!!!");
        }
      }
    }else if(this.zeroFounded){
      --this.step;
    }
    return this.step;
  }

  draw(){
    let data = this.getData();
    if(data.length > 0){
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

  solve(borne1, borne2){
    let x1 = Math.min(borne1,borne2);
    let x2 = Math.max(borne1,borne2);
    for(let i=x1;i<x2;i++){
      try{
        //TODO
      }catch(e){
        //No solution foundable for this sector
      }
    }
  }

  _evaluateBorneSigneEqual(){
    return Dichotomy._sameSign(this.plot.getValue(this.x1), this.plot.getValue(this.x2));
  }

  static _sameSign(x1, x2){
    return (x1>0) === (x2>0);
  }
}
