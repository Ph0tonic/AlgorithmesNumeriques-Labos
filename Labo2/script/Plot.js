class Plot{
  //Constructeur
  constructor(divId, fn, x){
    this.divId = divId;
    this.function = fn;
    this.x = x;
    //Données du graphe de base
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
        functionPlot.plugins.zoomBox() // Ajout de la fonctionnalité de zoom par shift + sélection
      ]
    };
    this.instance = functionPlot(this.options);

    //Modification de la position du label en haut à droite qui était en partie caché
    $('#'+this.divId+' .top-right-legend').attr('y',15);
  }

  //Modification de l'algorithme utilisé
  setAlgorithm(algorithm){
    this.algorithm = algorithm;
    this._reset();
  }

  //Modification de la fonction utilisée
  setFunction(fn){
    this.function = fn;
    this.redraw();
  }

  //Reset du plot
  _reset(){
    this.algorithm.reset();
    this.step = 0;
  }

  //Réaffichage du graph avec reset
  redraw(){
    this._reset();
    this.draw();
  }

  //Affichage du graph
  draw(){
    this.options.data = this.options.data.slice(0,1);
    this.options.data[0].fn = this.function;
    let functions = this.algorithm.draw();
    this.options.data = this.options.data.concat(functions);

    //Ligne permetant de contourner les limitations de la bibliothèque qui ne gère pas bien la suppression de contenu et laissait des éléments dans le canvas alors qu'ils n'étaient plus à dessiner.
    $('#'+this.divId+' g .content').html('');
    this.instance.draw();

    $('#'+this.divId+' g .tip').html('<line x1="5" y1="11" x2="15" y2="11" style="stroke:#4682b4;"></line><text x="20" y="15" font-family="sans-serif" font-size="14px" fill="#4682b4" x="f(x)">f(x)</text>'+this.algorithm.legend());
  }

  //Retourne la fonction
  getFunction(){
    return this.function;
  }

  //Retourne la valeur de f(x) au point donnée
  getValue(x){
    var scope = {
        x: x
    };
    return math.eval(this.function, scope);
  }

  //Saisie d'une borne
  setX(x,indice){
    this.x[indice-1] = x;
    this.redraw();
  }

  //Retourne la première borne
  getX1(){
    return this.x[0];
  }

  //Retourne la deuxième borne
  getX2(){
    return this.x[1];
  }

  //Affichage de la prochaine étape
  nextStep(){
    let step = this.algorithm.nextStep();
    this.draw();
    return step;
  }

  //Retour en arrière d'une étape
  previousStep(){
    let step = this.algorithm.previousStep();
    this.draw();
    return step;
  }
}
