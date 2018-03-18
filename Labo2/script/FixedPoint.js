class FixedPoint extends Algorithm{
  constructor(plot, resultArea){
    super(plot, resultArea);
    this.lambda = 1;
    this.gOfX = this.lambda+"*"+plot.getFunction()+"+ x";
    this.x = plot.getX1();
    this.step = 0;
    this.verif = false;
  }

  nextStep(){
    let savedX = this.x;
    this.step++;
    for(let i=0;i<Math.max(this.step,4);i++){ //Calcul of the four first elements
      if(this.step < 5 || this.step > this.data.length && !this.zeroFounded){
        //Calcul de la prochaine étape et ajout de celle-ci dans le tableau data
        let xi = this._evalG(this.x);
        this.data.push([this.x,xi]);
        this.x = xi;
      }
    }

    if(this.verif === false && Math.abs(this.data[1][0]-this.data[1][1])<Math.abs(this.data[3][0]-this.data[3][1])){
      this.step = 0;
      this.lambda *= -1;
      this.data = [];
      this.gOfX = this.lambda+"*"+plot.getFunction()+" + x";
      this.x = savedX;
      this.verif = true;
      this.nextStep();
      this.verif = false;
    }

    if(Algorithm.isEqualsDefaultEpsilon(savedX, this.x)){
      this.zeroFounded = true;
      console.log("Founded!!! "+this.step);
    }
    return this.step;
  }

  static solve(bounderies, fn){
    //bounderies = [2,2];
    let x1 = Math.min(bounderies[0],bounderies[1]);
    let x2 = Math.max(bounderies[0],bounderies[1]);
    let result = new Set();

    let lambda = 1;
    let gOfX = lambda+"*"+fn+" + x";
    const nbIterationMax = 20;

    for(let i=x1;i<=x2;i++){
      let founded = false;
      let dist=0;
      let iterationLimit = nbIterationMax;
      let x = i;
      while(x>=-100 && x<=100 && iterationLimit > 0){

        //Calcul de la prochaine étape et ajout de celle-ci dans le tableau data
        let xi = math.eval(gOfX, {'x':x});
        if(iterationLimit<nbIterationMax && dist<Math.abs(x-xi) && lambda != -1){
          iterationLimit = nbIterationMax;
          lambda *= -1;
          gOfX = lambda+"*"+fn+" - x";
          x = i;
        }
        dist = Math.abs(x-xi);

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
    return Array.from(result);
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
