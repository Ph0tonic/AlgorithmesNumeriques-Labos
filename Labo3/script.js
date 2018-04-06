
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

  indiceMaxColumn(iColumn,iRowStart=0){ //Find the greatest element in the column starting at iRowStart abd return the indice of this line
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

    let start;
    let stop;

    //Start counter
    try{
      start = performance.now();

      this.gaussTransform(matrix); //Gauss transformation to upper diagonal matrix
      this.resolveX(matrix,this.x); //Resolve upper diagonal matrix with substitution method

      //Stop counter
      stop = performance.now();

      //Display time needed
      document.getElementById("chronotime").innerHTML = (stop - start) + "ms";

    }catch(error){
      this.x = undefined;
    }

    //Display x
    this.displayX();
  }

  gaussTransform(matrix){
    //Cache variable to improve speed
    let data = matrix.data;

    let m = matrix.size;
    if(m===0){
      return;
    }
    let n = data[0].length;


    let h = 0; /* initialization of the pivot row */
    let k = 0; /* initialization of the pivot column */

    /*
        Search for the greatest value, reason:
        - "In any case, choosing the largest possible absolute value of the pivot improves the numerical stability of the algorithm, when floating point is used for representing numbers."
        Sources : Wikipedia -> https://en.wikipedia.org/wiki/Gaussian_elimination#Pseudocode
    */

    let iMax = 0;
    let f = 0;
    while(h < m) { //  && k < n){
      /* Find the k-th pivot: */
      iMax = matrix.indiceMaxColumn(k,h); // k -> column && h -> line start searching
      if(data[iMax][k] == 0) {
        /* No pivot in this column, pass to next column */
        ++k;
        console.log("No constant solutions");
        throw new Error("Résultat non-constant");
      } else {
        if(h != iMax){
          matrix.swapRows(h, iMax); // h -> current row && iMax -> ligne max
        }

        /* Do for all rows below pivot: */
        for(let i=h+1; i<m; ++i){
          //Calcul the factor
          f = data[i][k] / data[h][k];

          /* Fill with zeros the lower part of pivot column: */
          data[i][k] = 0;

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
    let data = matrix.data;
    for (let i=n-1; i >= 0; --i) {
        this.x[i] = data[i][n]/data[i][i];
        for (let k=i-1; k >= 0; --k) {
            data[k][n] -= data[k][i] * this.x[i];
        }
    }
  }

  displayX(){
    let result = document.getElementById('result');
    let htmlResult = "";

    if(this.x != undefined){
      if(this.x.length > 0){
        for(let i=0;i<this.x.length;i++){
          htmlResult += "x<sub>"+(i+1)+"</sub> = "+this.x[i]+"<br>";
        }
      }else{
        htmlResult = '<div class="alert alert-warning">Matrice de taille null!</div>';
      }
    }else{
      htmlResult = '<div class="alert alert-danger">Aucune solution constante trouvée!</div>';
    }
    result.innerHTML = htmlResult;
  }
}

let matrix = new Matrix();

function loadClickedFile(e) {
    e = e || window.event;
    let file = e.target || e.srcElement;
    file = './data/'+file.innerHTML;
    let xmlhttp = new XMLHttpRequest();

    xmlhttp.overrideMimeType('text/json');
    xmlhttp.onreadystatechange = function(){
      if(this.readyState == 4 && this.status == 200)
      {
        holder.value = this.responseText;
        matrix = new Matrix(this.responseText);
      }
    };
    xmlhttp.open("GET", file, true);
    xmlhttp.send(undefined);
}

document.onreadystatechange = () => {
  if (document.readyState === 'interactive') {
    // document ready

    //To avoid error with chrome and loading file with xmlhttprequest
    let isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    if(!isChrome){
      let ul = document.getElementById('files');
      ul.onclick = function(event) {
          loadClickedFile(event);
      };
    }

    // modified from http://html5demos.com/file-api
    let holder = document.getElementById('holder');
    let s = new Solver();

    document.getElementById('solve').onclick = function(){
        matrix = new Matrix(holder.value);
        s.solve(matrix);
    };

    holder.ondragover = function() {
        this.className = 'hover';
        return false;
    };
    holder.ondragend = function() {
        this.className = '';
        return false;
    };
    holder.ondrop = function(e) {
        e.preventDefault();

        let file = e.dataTransfer.files[0]; //Open the first file
        let reader = new FileReader();
        reader.onload = function(event) {
            holder.value = event.target.result;
            matrix = new Matrix(event.target.result);
        };

        reader.readAsText(file);
        return false;
    };
  }
};
