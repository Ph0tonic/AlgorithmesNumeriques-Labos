class Plot{
  constructor(divId){
    this.divId = divId;
    this.function = document.getElementById('eq').value;
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

  _reset(){
    this.algorithm.reset();
    this.step = 0;
    $('#result').html('');
  }

  redraw(){
    this._reset();
    this.draw();
  }

  draw(){
    if(this.function != document.getElementById('eq').value){
      this._reset();
      this.algorithm.reset();
    }

    this.function = document.getElementById('eq').value;
    this.options.data = this.options.data.slice(0,1);
    this.options.data[0].fn = this.function;
    let functions = this.algorithm.draw();
    this.options.data = this.options.data.concat(functions);

    $('g .content').html('');
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

  getX1(){
    return parseFloat($('#x1').val());
  }

  getX2(){
    return parseFloat($('#x2').val());
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
