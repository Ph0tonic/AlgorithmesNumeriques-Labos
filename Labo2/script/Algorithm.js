class Algorithm{
  //Constructeur
  constructor(plot, resultArea){
    //Empêche l'instanciation d'un objet de la classe Algorithm
    if (this.constructor === Algorithm) {
      throw new Error("Can't instantiate abstract class!");
    }
    this.plot = plot;
    this.resultArea = resultArea;
    this.data = [];
    this.step = 0;
  }

  //Reset de l'algorithmes
  reset(){
    this.resultArea.html('');
    this.data = [];
    this.step = 0;
    this.x = plot.getX1();
    this.x1 = plot.getX1();
    this.x2 = plot.getX2();
    this.zeroFounded = false;
  }

  //Retourne le tableau de données correspdant à l'étape en cours
  getData(){
    return this.data.slice(0,this.step);
  }

  //Affichage des données, possibilité de passer un tableau avec les valeurs [x,f(x)], rien ou de l'html.
  _displayResult(content){
    if(!Array.isArray(content)){
      this.resultArea.html(content);
    }else if(content.length === 0){
      this.resultArea.html('<p>Faites défiler les étapes pour afficher les valeurs de x.</p>');
    }else{
      let tableResults = `<table class="table table-hover"><thead><tr><th>Itération</th><th>x</th><th>f(x)</th></tr></thead><tbody>`;
      let i=0;
      tableResults = tableResults.concat(content.map((d)=>{return '<tr><td><math xmlns="http://www.w3.org/1998/Math/MathML"><msub><mi>x</mi><mn>'+(i++)+'</mn></msub></math></td><td>'+d.join('</td><td>')+'</td></tr>'}).join(''));
      tableResults = tableResults.concat(`</tbody></table>`);
      this.resultArea.html(tableResults);
    }
  }

  //On reviens une étape en avant
  previousStep(){
    if(this.step > 0){
      this.step--;
    }
    return this.step;
  }

	/**
	 * Epsilon = 1e-6
	 */
	static isEqualsDefaultEpsilon(a, b)
	{
    return Algorithm.isEquals(a, b, 1e-10);
	}

  //Test si deux valeurs sont égales
  static isEquals(a, b, epsilon)
	{
    if (a != 0 && b != 0)
    {
      return Math.abs((a - b) / a) <= epsilon;
    }
    else
    {
      return Math.abs(a - b) <= epsilon;
    }
	}

  //Possibilité d'override cette fonction afin d'ajouter une légende supplémentaire
  legend(){
    return '';
    //Should return an Array of functions to draw
  }

  /* Methodes à implémenter pour pouvoir hériter de cette classe */
  //Permet de trouver les zéros d'une fonction
  solve(){
    throw new Error("Not implemented");
    //Should return an array of zeroes point
  }

  //Calcul de la prochaine étape
  nextStep(){
    throw new Error("Not implemented");
    //Should return the new step value
  }

  //Retourne des objets graphe afin de visualiser le résultat
  draw(){
    throw new Error("Not implemented");
    //Should return an Array of functions to draw
  }
}
