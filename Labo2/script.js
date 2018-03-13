
class Plot{
  constructor(divId){
    this.divId = divId;
    this.function = document.getElementById('eq').value;
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
    let graph = [{
      fn: this.function,
      sampler: 'builtIn',  // this will make function-plot use the evaluator of math.js
      graphType: 'polyline'
    }];

    console.log("data to log: ",this.algorithme.getData());
    let data = graph.concat(this.algorithme.draw());
    console.log(data);
    functionPlot({
      target: '#'+this.divId,
      data: data
    });
  }

  getValue(x){
    var scope = {
        x: x
    };
    return math.eval(this.function, scope);
  }

  getX1(){
    //TODO add parametrized starting point
    return -10;
  }

  getX2(){
    //TODO add parametrized second point -> for Dichotomie only
    return 4;
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
    if(Dichotomie._sameSign(this.x1, this.x2)){
      console.log("Erreur, bornes du même signes");
    }
  }

  nextStep(){
    this.step++;
    if(this.step > this.data.length && !this.zeroFounded){
      //Calcul de la prochaine étape et ajout de celle-ci dans le tableau data
      if(Dichotomie._sameSign(this.plot.getValue(this.x1), this.plot.getValue(this.x2))){
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
    console.log(data);
    return [{
        points: data,
        attr:{'stroke-width': 3},
        fnType: 'points',
        color: 'red',
        graphType: 'scatter'
    }];

  }

  static _sameSign(x1, x2){
    return (x1>0) === (x2>0);
  }
}

class Tangente extends Algorithme{
  constructor(plot){
    super(plot);
  }

  nextStep(){
    //Pourra être utile: math.derivative('x^2', 'x').eval({x: 4});
  }
}

class PointFixe extends Algorithme{
  constructor(plot){
    super(plot);
  }

  nextStep(){

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

let plot = new Plot('canvas',);
let dichotomie = new Dichotomie(plot);
plot.addAlgorithme(dichotomie);

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
