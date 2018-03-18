class Plot{
  constructor(divId, fn, x){
    this.divId = divId;
    this.function = fn;
    this.x = x;
    this.options = {
      target: '#'+this.divId,
      width: 800,
      height: 500,
      data: [{
        fn: '',
        sampler: 'builtIn',  // this will make function-plot use the evaluator of math.js
        graphType: 'polyline',
        title: 'f(x)'
      }],
      plugins: [
        functionPlot.plugins.zoomBox()
      ]
    };
    this.instance = functionPlot(this.options);
  }

  setAlgorithm(algorithm){
    this.algorithm = algorithm;
    this._reset();
  }

  setFunction(fn){
    this.function = fn;
    this.redraw();
  }

  _reset(){
    this.algorithm.reset();
    this.step = 0;
  }

  redraw(){
    this._reset();
    this.draw();
  }

  draw(){
    this.options.data = this.options.data.slice(0,1);
    this.options.data[0].fn = this.function;
    let functions = this.algorithm.draw();
    this.options.data = this.options.data.concat(functions);

    $('#'+this.divId+' g .content').html('');
    this.instance.draw();
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

  setX(x,indice){
    this.x[indice-1] = x;
    this.redraw();
  }

  getX1(){
    return this.x[0];
  }

  getX2(){
    return this.x[1];
  }

  nextStep(){
    let step = this.algorithm.nextStep();
    this.draw();
    return step;
  }

  previousStep(){
    let step = this.algorithm.previousStep();
    this.draw();
    return step;
  }
}
