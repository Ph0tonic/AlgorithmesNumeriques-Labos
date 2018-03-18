class FixedPoint extends Algorithm{
  constructor(plot, resultArea){
    super(plot, resultArea);
    this.lambda = 1;
    this.gOfX = this.lambda+"*("+plot.getFunction()+")+ x";
    this.x = plot.getX1();
    this.step = 0;
    this.verif = false;
    this.dist = [];
    this.convergence = 0;
  }

  nextStep(){
    let savedX = this.x;
    this.step++;
    let newConvergence = this.convergence;
    for(let i=this.data.length;i<Math.max(this.step,3);i++){ //Calcul of the four first elements
      console.log(i);
      savedX = this.x;
      this.convergence = newConvergence;
      if(this.step < 3 || this.step > this.data.length && !this.zeroFounded){
        //Calcul de la prochaine étape et ajout de celle-ci dans le tableau data
        let xi = this._evalG(this.x);

        if(Number.isNaN(xi) || Math.abs(xi) === Infinity){
          this._displayResult("Aucune solution pour cette valeur de x");
          return --this.step;
        }

        this.data.push([this.x,xi]);
        this.dist.push(Math.abs(this.x-xi));
        this.x = xi;
      }
      newConvergence = (this.convergence*(this.dist.length-1) + this.dist[this.dist.length-1])/this.dist.length;
      console.log("dd"+newConvergence);
      console.log(this.dist[this.dist.length-1])
    }

    console.log(this.convergence +" divergence "+ newConvergence)

    //Diverge
    if(this.verif === false && this.convergence < newConvergence){
      console.log("--Diverge avec premier fonction")
      this.step = 0;
      this.lambda *= -1;
      this.data = [];
      this.dist = [];
      this.convergence = 0;console.log(this.gOfX);
      this.gOfX = this.lambda+"*("+plot.getFunction()+") + x";
      this.convergence = 0;console.log(this.gOfX);
      this.x = savedX;
      this.verif = true;
      this.nextStep();
      this.verif = false;
    }else{
      this.convergence = newConvergence;

      console.log(savedX, this.x);
      if(Algorithm.isEqualsDefaultEpsilon(savedX, this.x)){
        this.zeroFounded = true;
        console.log("Founded!!! "+this.step);
      }
    }

    return this.step;
  }

  //Recherche les solutions à la fonction passé en paramètre dans les bornes données
  static solve(bounderies, fn){
    let x1 = Math.min(bounderies[0],bounderies[1]);
    let x2 = Math.max(bounderies[0],bounderies[1]);
    let result = new Set();
    const nbIterationMax = 100;

    for(let i=x1;i<=x2;i++){
      let founded = false;
      let dist=[];
      let convergence = 0;
      let lambda = 1;
      let gOfX = lambda+"*("+fn+") + x";
      let iterationLimit = nbIterationMax;
      let x = i;
      try{
        while(x>=x1 && x<=x2 && iterationLimit > 0){

          //Calcul de la prochaine étape et ajout de celle-ci dans le tableau data
          let xi = math.eval(gOfX, {'x':x});
          if(Number.isNaN(xi) || Math.abs(xi) === Infinity){
            throw new Error("Aucune solution pour cette valeur de x");
          }

          dist.push(math.abs(x-xi));

          //Etude de convergence, le 3 est là afin d'avoir une marge de manoeuvre de control de la convergence
          let newConvergence = (convergence*(dist.length-1) + dist[dist.length-1])/dist.length;

          //Divergence dans graph 1
          if(iterationLimit+2<nbIterationMax && convergence<newConvergence && lambda != -1){
            iterationLimit = nbIterationMax;
            lambda *= -1;
            dist = [];
            convergence = 0;
            gOfX = lambda+"*("+fn+") + x";
            x = i;
          }else if(iterationLimit+2<nbIterationMax && lambda == -1 && convergence<newConvergence){
            //Diverge dans graphe n° 2
            throw new Error("Divergence avec le second");
          }else{
            convergence = newConvergence;

            if(Algorithm.isEqualsDefaultEpsilon(x, xi)){
              iterationLimit = 0;
              if(!result.has(parseFloat(x.toFixed(4)))){
                result.add(parseFloat(x.toFixed(4)));
              }
            }

            x = xi;
            --iterationLimit;
          }
        }
      }catch(e){
        //Do nothing
        //console.log(e)
      }
    }
    return Array.from(result); //De set à array
  }

  _evalG(x){
    return math.eval(this.gOfX, {'x':x});
  }

  draw(){
    let data = this.getData();
    this._displayResult(data.map((d)=>{return [d[0],d[1]-d[0]]}));

    let functions = [{
      fn: 'x',
      sampler: 'builtIn',
      graphType: 'polyline',
      title: 'x'
    },{
      fn: this.gOfX,
      sampler: 'builtIn',
      graphType: 'polyline',
      title: 'g(x)'
    }];

    let vectors = [];
    for(let i=0;i<data.length;i++){
      let offset = 0;
      if(i>0){
        offset = data[i][0];
        //Ajout 'une ligne supplémentaire'
        functions.push({
          vector: [data[i][0]-data[i-1][0], 0],
          offset: [data[i-1][0], data[i][0]],
          graphType: 'polyline',
          fnType: 'vector',
          color: 'red'
        });
      }
      functions.push({
        vector: [0, data[i][1]-offset],
        offset: [data[i][0], offset],
        graphType: 'polyline',
        fnType: 'vector',
        color: 'red'
      });
    }
    return functions;
  }
}
