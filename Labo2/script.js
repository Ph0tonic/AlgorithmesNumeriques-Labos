
class Plot{
  constructor(divId){
    this.divId = divId;
    this.function = document.getElementById('eq').value;
    this.options = {
      target: '#'+this.divId,
      width: 800,
      height: 500,
      data: []
    };
  }

  addAlgorithme(algorithme){
    this.algorithme = algorithme;
  }

  reset(){

  }

  draw(){
    if(this.function != document.getElementById('eq').value){
      this.reset();
      this.algorithme.reset();
    }

    this.function = document.getElementById('eq').value;
    this.options.data[0] = {
      fn: this.function,
      sampler: 'builtIn',  // this will make function-plot use the evaluator of math.js
      graphType: 'polyline'
    };

    let functions = this.algorithme.draw();
    for(let i=1;i<Math.max(this.options.data.length,functions.length+1);i++){
        if(functions.length>i-1){
          this.options.data[i] = functions[i-1];
        }else if(this.options.data[i].fnType === 'points'){   // Workaround because of some problem in librairie when number of functions has changed when updating
          this.options.data[i].points = [];
        }else if(this.options.data[i].fnType === 'vector'){
          this.options.data[i].vector = [];
        }else{
          this.options.data[i].fn = "";
        }
    }
    functionPlot(this.options);
  }

  getFunction(){
    return this.function;
  }

  getValue(x){
    var scope = {
        x: x
    };
    return math.eval(this.function, scope);
  }

  getX1(){
    //TODO add parametrized starting point
    return -7;
  }

  getX2(){
    //TODO add parametrized second point -> for Dichotomie only
    return -1;
  }

  addLine(data){

  }

  //Methode to implement
  nextStep(){
    this.algorithme.nextStep();
    this.draw();
  }

  previousStep(){
    this.algorithme.previousStep();
    this.draw();
  }
}

class Algorithme{
  constructor(plot){
    if (this.constructor === Algorithme) {
      throw new Error("Can't instantiate abstract class!");
    }
    this.plot = plot;
    this.data = [];
    this.step = 0;
  }

  reset(){
    this.data = [];
    this.step = 0;
  }

  getData(){
    return this.data.slice(0,this.step);
  }

  //Methode to implement
  nextStep(){
    throw new Error("Not implemented");
  }

  draw(){
    throw new Error("Not implemented");
  }

  previousStep(){
    if(this.step > 0){
      this.step--;
    }
  }
}

class Dichotomie extends Algorithme{
  constructor(plot){
    super(plot);
    this.x1 = this.plot.getX1();
    this.x2 = this.plot.getX2();
    this.zeroFounded = false;
    if(this._evaluateBorneSigneEqual()){
      console.log("Erreur, bornes du même signes");
    }
  }

  nextStep(){
    this.step++;
    if(this.step > this.data.length && !this.zeroFounded){
      //Calcul de la prochaine étape et ajout de celle-ci dans le tableau data
      if(this._evaluateBorneSigneEqual()){
        console.log("Erreur, bornes du même signes");
      }else{
        let middle = (this.x1 + this.x2)/2;
        let value = this.plot.getValue(middle);
        if(Dichotomie._sameSign(this.plot.getValue(this.x1), value)){
          this.x1 = middle;
        }else{
          this.x2 = middle;
        }

        this.data.push([middle, value]);

        //TODO update to test with Epsilon
        if(value == 0){
          this.zeroFounded = true;
        }
      }
    }
  }

  draw(){
    let data = this.getData();
    if(data.length==1){
      //Requirement of function-plot, mimimum 2 couple of values
      data.push(data[0]);
    }
    return [{
        points: data,
        attr:{'stroke-width': 3},
        fnType: 'points',
        color: 'red',
        graphType: 'scatter'
    }];
  }

  _evaluateBorneSigneEqual(){
    return Dichotomie._sameSign(this.plot.getValue(this.x1), this.plot.getValue(this.x2));
  }

  static _sameSign(x1, x2){
    return (x1>0) === (x2>0);
  }
}

class Tangente extends Algorithme{
  constructor(plot){
    super(plot);
    this.x1 = this.plot.getX1();
    this.zeroFounded = false;
    try {
      this._derivative(this.x1);
    }catch(err){
      console.log("Erreur, dérivée de la fonction == 0");
    }
  }

  nextStep(){
    this.step++;
    if(this.step > this.data.length && !this.zeroFounded){
      //Calcul de la prochaine étape et ajout de celle-ci dans le tableau data
      try {
        //Calcul du nouveau x -> ax+b=0 avec a=derivative et b=y(x)
        let a = this._derivative(this.x1);
        let y = this.plot.getValue(this.x1);
        let b = y - a*this.x1;
        let x = -b/a;
        let func = a+' * x + '+ b;

        this.data.push([func,this.x1,y]);
        this.x1 = x;

        //TODO update to test with Epsilon
        if(this.plot.getValue(this.x1) == 0){
          this.zeroFounded = true;
        }
      }catch(err){
        console.log("Erreur, dérivée de la fonction = 0");
      }
    }
  }

  draw(){
    let data = this.getData();
    let graph = [];
    data.forEach(function(element) {
      graph.push({
        fn: element[0],
        sampler: 'builtIn',  // this will make function-plot use the evaluator of math.js
        graphType: 'polyline',
        color: 'red'
      },{
        vector: [0, element[2]],
        offset: [element[1], 0],
        graphType: 'polyline',
        fnType: 'vector'
      });
    });
    return graph;
  }

  _derivative(x){
    let value = math.derivative(this.plot.getFunction(), 'x').eval({x: x});
    if(value===0){
      throw new Error("Derivative = 0");
    }
    return value;
  }

}

class PointFixe extends Algorithme{
  constructor(plot){
    super(plot);
  }

  nextStep(){
    //TODO
  }

  draw(){
    //TODO
  }
}

/*function draw() {
  /*try {
    functionPlot({
      target: '#canvas',
      data: [{
        fn: document.getElementById('eq').value,
        sampler: 'builtIn',  // this will make function-plot use the evaluator of math.js
        graphType: 'polyline'
      },{
        points: [
          [1, 1],
          [2, 1],
          [2, 2],
          [1, 2],
          [1, 1]
        ],
        fnType: 'points',
        graphType: 'polyline' //scatter -> pour des points
      },{
        vector: [2, 1],
        offset: [1, 2],
        graphType: 'polyline',
        fnType: 'vector'
      }]
    });
  }
  catch (err) {
    console.log(err);
    alert(err);
  }
}*/

let plot = new Plot('canvas');
//let methode = new Dichotomie(plot);
let methode = new Tangente(plot);
plot.addAlgorithme(methode);

$(document).ready(function(){
  $('#form').on('submit', function (event) {
    event.preventDefault();
    plot.draw();
  });

  $('#next').on('click', function () {
    plot.nextStep();
  });

  $('#previous').on('click', function () {
    plot.previousStep();
  });

  plot.draw();
})
