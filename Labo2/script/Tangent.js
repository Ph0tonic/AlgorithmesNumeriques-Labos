class Tangent extends Algorithm{
  constructor(plot, resultArea){
    super(plot, resultArea);
    this.x = this.plot.getX1();
    this.zeroFounded = false;
    try {
      this._derivative(this.x);
    }catch(err){
      console.log("Erreur, dérivée de la fonction = 0");
      this._displayResult('<div class="alert alert-danger" role="alert">Erreur, dérivé de la fonction = 0!</div>');
    }
  }

  nextStep(){
    this.step++;
    if(this.step > this.data.length && !this.zeroFounded){
      //Calcul de la prochaine étape et ajout de celle-ci dans le tableau data
      try {
        //Calcul du nouveau x -> ax+b=0 avec a=derivative et b=y(x)
        let a = this._derivative(this.x);
        let y = this.plot.getValue(this.x);
        let b = y - a*this.x;
        let x = -b/a;
        let func = a+' * x + '+ b;

        this.data.push([func,this.x,y]);
        this.x = x;

        //TODO update to test with Epsilon
        if(Algorithm.isEqualsDefaultEpsilon(this.plot.getValue(this.x),0)){
          this.zeroFounded = true;
          console.log("Founded!!!");
        }
      }catch(err){
        console.log("Erreur, dérivée de la fonction = 0");
        this._displayResult('<div class="alert alert-danger" role="alert">Erreur, dérivé de la fonction = 0!</div>');
      }
    }
    return this.step;
  }

  draw(){
    let data = this.getData();
    let graph = [];
    let color = 'grey';

    this._displayResult(data.map((d)=>{return [d[1],d[2]]})); // Map pour retourner que les indice 1=x et 2=f(x) du tableau

    data.forEach(function(element, index) {
      if(data.length <= index+1){
        color = 'red';
      }
      console.log(element);
      graph.push({
        fn: element[0],
        sampler: 'builtIn',  // this will make function-plot use the evaluator of math.js
        graphType: 'polyline',
        color: color
      },{
        vector: [0, element[2]],
        offset: [element[1], 0],
        graphType: 'polyline',
        fnType: 'vector',
        color: color
      });
    });
    return graph;
  }

  solve(){
    //TODO
  }

  _derivative(x){
    let value = math.derivative(this.plot.getFunction(), 'x').eval({x: x});
    if(value===0){
      throw new Error("Derivative = 0");
    }
    return value;
  }
}
