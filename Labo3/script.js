
class Matrix {

  constructor(data){
    this.data = [];
    this.size = 0;

    if(data === undefined){
      //matrice vide
    }else{
      this._load(data);
    }
  }

  _load(d){
    console.log(d);
    d = JSON.parse(d);

    this.size = d.n[0]; //Get the size of the matrix

    // Create a 2D matrix
    let A = d.A.splice(0); //Get A matrice
    let B = d.B.splice(0); //Get B vector

    // Hyp : A.length == B.length*n
    while(A.length) {
      this.data.push(A.splice(0,this.size).concat(B.splice(0,1))); //Transform in 2D arrays
    }
  }

  swapRows(i,j){
    this.data[j] = [this.data[i], this.data[i] = this.data[j]][0]; // Swap 2 rows
  }

  indiceMaxColumn(iColumn,iRowStart=0){
    let n=this.size;
    let iMax=iRowStart;
    let max = Math.abs(this.data[iRowStart][iColumn]);
    let tempMax = 0;

    for(let i=iRowStart+1;i<n;++i){
      tempMax = Math.abs(this.data[i][iColumn]);
      if(max < tempMax){
        max = tempMax,
        iMax = i;
      }
    }
    return iMax;
  }

  //Substract factor*iRowRef to iRowSub
  substractLineFactor(iRowRef, iRowSub, factor, iColumnStart=0){
    for(let i=iColumnStart; i<this.size+1; ++i) {
      this.data[iRowSub][i] -= this.data[iRowRef][i] * factor;
    }
  }

}

class Solver {

  constructor(){
    this.x = [];
  }

  solve(matrix){ // A.X=B
    //Récupération des données
    this.x = [];
    this.x.length = matrix.size;

    this._startTimer();

    this.gaussTransform(matrix);
    this.resolveX(matrix,this.x);

    this._stopTimer();

    //Affichage des résultats
  }

  gaussTransform(matrix){
    let m = matrix.size;
    if(m===0){
      return;
    }
    let n = matrix.data[0].length;


    let h = 0; /* initialization of the pivot row */
    let k = 0; /* initialization of the pivot column */

    /*Recherche de la plus grande valeur, raison:
        "In any case, choosing the largest possible absolute value of the pivot improves the numerical stability of the algorithm, when floating point is used for representing numbers."
        Sources : Wikipedia -> https://en.wikipedia.org/wiki/Gaussian_elimination#Pseudocode
    */

    let iMax = 0;
    let f = 0;
    while(h < m) { //  && k < n){
      /* Find the k-th pivot: */
      iMax = matrix.indiceMaxColumn(k,h); // k -> column && h -> line start searching
      if(matrix.data[iMax][k] == 0) {
        /* No pivot in this column, pass to next column */
        ++k;
      } else {
        if(h != iMax){
          matrix.swapRows(h, iMax); // h -> current row && iMax -> ligne max
        }

        /* Do for all rows below pivot: */
        for(let i=h+1; i<m; ++i){
          //Calcul the factor
          f = matrix.data[i][k] / matrix.data[h][k];

          /* Fill with zeros the lower part of pivot column: */
          matrix.data[i][k] = 0;

          /* Do for all remaining elements in current row: */
          matrix.substractLineFactor(h, i, f, k+1);
        }

        /* Increase pivot row and column */
        ++h,
        ++k;
      }
    }
  }

  resolveX(matrix){
    let n = matrix.size;
    for (let i=n-1; i >= 0; --i) {
        this.x[i] = matrix.data[i][n]/matrix.data[i][i];
        for (let k=i-1; k > -1; k--) {
            matrix.data[k][n] -= matrix.data[k][i] * this.x[i];
        }
    }
  }

  _startTimer(){
    this.start = new Date();
  }

  _stopTimer(){
    this.stop = new Date();
    document.getElementById("chronotime").innerHTML = (this.stop - this.start) + "ms";
  }

}

// modified from http://html5demos.com/file-api
let holder = document.getElementById('holder');
let matrix = new Matrix();
let s = new Solver();

holder.ondragover = function() {
    this.className = 'hover';
    return false;
};
holder.ondragend = function() {
    this.className = '';
    return false;
};
holder.ondrop = function(e) {
    this.className = '';
    e.preventDefault();

    let file = e.dataTransfer.files[0]; //Open the first file
    let reader = new FileReader();
    reader.onload = function(event) {
        matrix = new Matrix(event.target.result);
        holder.innerHTML = "LOADED !!!";
    };
    console.log(file);
    reader.readAsText(file);

    return false;
};
