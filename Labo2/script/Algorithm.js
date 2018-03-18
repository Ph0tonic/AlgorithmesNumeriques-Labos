class Algorithm{
  constructor(plot, resultArea){
    if (this.constructor === Algorithm) {
      throw new Error("Can't instantiate abstract class!");
    }
    this.plot = plot;
    this.resultArea = resultArea;
    this.data = [];
    this.step = 0;
  }

  reset(){
    this.resultArea.html('');
    this.data = [];
    this.step = 0;
    this.x = plot.getX1();
    this.x1 = plot.getX1();
    this.x2 = plot.getX2();
  }

  getData(){
    return this.data.slice(0,this.step);
  }

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

  legend(){
    return '';
    //Should return an Array of functions to draw
  }

  //Methode to implement
  solve(){
    throw new Error("Not implemented");
  }

  nextStep(){
    throw new Error("Not implemented");
    //Should return the new step value
  }

  draw(){
    throw new Error("Not implemented");
    //Should return an Array of functions to draw
  }
}
