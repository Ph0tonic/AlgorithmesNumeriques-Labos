/**
 *  Author: Bastien Wermeille
 *  Date: Février-Mars 2018
 *  Goal: Representation of a floating with only int and boolean
 */

class logicOp{
  static xor(a,b,c){
    /* bin = (a^b)^c = a&b&c || a&!c&!c || !a&b&!c || !a&!b&c */
    return a&&b&&c || a&&(!b)&&(!c) || (!a)&&b&&(!c) || (!a)&&(!b)&&c;
  }
  static hold(a, b, c){
    /* hold = a&&b || a&&c || b&&c */
    return a&&b || a&&c || b&&c;
  }
}

class FloatingType{
  constructor(value) {
    //Size for field exponent
    this.e = 8;
    //Size field mantissa
    this.m = 23;

    if(value){
      this._init(value);
    }else {
      this.sign = false;
      this.exponent = [];
      this.exponent.length = this.e;
      this.mantissa = [];
      this.mantissa.length = this.m;
    }
  }

  clone() {
    let float = new FloatingType();
    float.sign = this.sign;
    float.exponent = this.exponent.slice(0); // Copie profonde du tableau
    float.e = this.e;
    float.mantissa = this.mantissa.slice(0);
    float.m = this.m;
    return float;
  }

  _wholeToBinary(whole){
    //Convert an int as an integer part in binary
    let binary = [];
    while(whole != 0){
      binary.unshift(!!(whole%2)); //!! pour que les valeurs soient des booléens et non pas un 0 ou un 1
      whole-=whole%2;
      whole/=2;
    }
    return binary;
  }

  _decimalToBinary(decimal){
    //Convert an int as an decimal part in binary
    let length = decimal.length | decimal.toString().length; // /!\ compter avant le parse afin de ne pas supprimer les 0 éventuelles zéro se trouvant au début de la chaine: 12.002 -> 002
    decimal = parseInt(decimal);
    let binary = [];
    let limit = Math.pow(10,length);
    let count = 0;
    while(decimal != 0 && count < this.m){
      decimal *= 2;
      binary.push(!!(decimal >= limit)); //!! pour que les valeurs soient des booléens et non pas un 0 ou un 1
      if(decimal >= limit){
        decimal-=limit;
      }
      count++;
    }

    return binary;
  }

  _exponentToBinary(exponent){
    //Convert an exponent in Binary

    //TODO Adapt for subnormal number
    //TODO Check for underflow and overflow
    exponent += this._dOffset();

    let binary = [];
    for(let i=0;i<this.e;i++){
      binary.unshift(!!(exponent%2)); //!! pour que les valeurs soient des booléens et non pas un 0 ou un 1
      exponent-=exponent%2;
      exponent/=2;
    }
    return binary;
  }

  //Underscore is standard to say "Should not be accessed from outside"
  _init(value){

    /** Steps to folow:
      1. Negative signe
      2. Convert whole number to binary
      3. Convert fraction section to binary
      4. join together
      5. how many space to move
      6. add n to exponent
      7. Exponent to binary
    */

    //TODO Vérification de value
    //Step 1 - signe
    this.sign = (value.charAt(0) === '-');

    //Step 2 - Convert whole number to binary
    if(this.sign){
      value = value.substring(1);
    }
    let parts = value.split('.');

    //Step 3 - Whole number to Binary
    let whole = this._wholeToBinary(parseInt(parts[0]));

    //Step 4 - Fraction section to binary
    let decimal = this._decimalToBinary(parts[1]|0);

    //Step 4 - Join together
    let wholeSize = whole.length;
    let binaryMantissa = whole.concat(decimal);

    //Step 5 - How many space to move
    let exponent = 0;
    if(wholeSize>1){
      //Calcul du décalage à droite
      exponent += (wholeSize-1);
    }else if (wholeSize<1) {
      //Décalage à gauche
      let shift = binaryMantissa.indexOf(true);
      exponent -= (shift+1);
      for(let i=0;i<shift;i++){
        binaryMantissa.shift();
      }
    }
    binaryMantissa.shift(); //Suppression de la valeur 1 caché
    binaryMantissa.length = this.m;

    //Step 6+7 - Exponent to Binary
    let binaryExponent = this._exponentToBinary(exponent);

    this.exponent = binaryExponent;
    this.mantissa = binaryMantissa;
  }

  add(value){
    //Return a new FloatingType after addition
    /*
      1. Rewrite the smaller number such that its exponent matches with the exponent of the larger number.
      2. Add the mantissas
      3. Put the result in Normalised Form
      4. check for overflow/underflow of the exponent after normalisation
    */

    //Step 0 - Clone des valeurs
    let f1 = this.clone();
    let f2 = value.clone();

    //Step 0.5 -> put smaller one in f1
    let e1 = this._exponentDecimal(f1.exponent);
    let e2 = this._exponentDecimal(f2.exponent);
    let diff = Math.abs(e1-e2);
    if(e1 > e2){
      //Echange des deux valeurs
      let temp = f2;
      f2 = f1;
      f1 = temp

      temp = e2;
      e2 = e1;
      e1 = temp
    }
    //TODO Vérification du plus grand nombre si les exposants sont identiques et échange

    //We base our new number on the greatest(exponent) number
    let f = f2.clone();
    let exp = e2;

    //Step 1 - Rewrite smaller one -> e1
    f1.mantissa.unshift(true); // Affichage du bit caché
    f2.mantissa.unshift(true); // Affichage du bit caché
    if(diff>0){
      for(let i=0;i<diff;i++){
        f1.mantissa.unshift(false);
      }
    }

    //Step 2 - Addition of mantissa
    if(f1.sign === f2.sign){
      //Addition standard for signs
      let length = f1.mantissa.length; // Use f1.length because it's the smallest and then the longer number
      let hold = false;
      let binary = [];
      binary.length = length;
      for(let i=length-1;i>=0;i--){
        binary[i] = logicOp.xor(f1.mantissa[i],f2.mantissa[i],hold);
        hold = logicOp.hold(f1.mantissa[i],f2.mantissa[i],hold);
      }

      if(hold){
        //Add hold and increase the exponent
        exp++;
        binary.unshift(true);
      }

      //Hide the hidden bit
      binary.shift();
      f.mantissa = binary.slice(0);
      f.mantissa.length = f.m;

      f.exponent = f._exponentToBinary(exp);

    }else{
      //TODO addition of a negativ number

      //Sign equal to the greatest exponent number
      f.sign = f2.sign;

      //Mantissa substraction
      let length = f1.mantissa.length; // Use f1.length because it's the smallest and then the longer number
      let binary = [];
      binary.length = length;
      for(let i=length-1;i>=0;i--){
        binary[i] = f1.mantissa[i] != f2.mantissa[i];
        if(f1.mantissa[i] != f2.mantissa[i]){
          //Update f1
          let j = i-1;
          while(j>0 && f1.mantissa[j+1]==false){
            f1.mantissa[j] = !f1.mantissa[j];
            j--;
          }
        }
      }
      f.binary = binary;
    }

    //Step 3 - Normalise result


    //Step 4 - Check overflow and underflow


    return f;
  }

  sub(value){
    //Return a new FloatingType after substraction
    f1 = value.clone();
    f1.sign = !f1.sign;
    return this.add(f1);
  }

  mult(n){
    //TODO update for n beeing an FloatingType Value and not an int --> For PI bonus
    //Return a new FloatingType after multiplication by an int value
    let result = new FloatingType('0');
    if(n>0) {
      for(let i=0;i<n;i++){
        result = result.add(this);
      }
      return result;
    }else if (n<0) {
      for(let i=0;i<n;i++){
        result = result.sub(this);
      }
    }
  }

  divBy(n){
    //Return a new FloatingType after division by an int
    return this.mult(FloatingType.oneBy(n));
  }

  static oneBy(n){
    //TODO 1/n -> creation of a new value, somme de fractions 1/2^n avec n appartenant à R
    let float = new FloatingType();
    if(n<0){
      n = -n;
      float.sign = true;
    }
    let i = 0;
    while(n>0 && i<float.m){

    }

    return float;
  }

  toString(){
    //Code here with this to access Object property
    let exp = this._exponentDecimal();
    let mant = this._mantissaDecimal();
    console.log(exp);

    //Affichage simplifiée
    let result = (this.sign?'-':'+');
    result += mant;
    result += "*2^"+exp+"\n";


    let calculated = mant;
    let pointPosition = 1;
    if(exp>=0){
      //Exponentielle positive
      //TODO update when calculated is in exponent mode;
      pointPosition -= calculated.toString().length;
      calculated *= Math.pow(2,exp);
      pointPosition += calculated.toString().length;
    }else{
      //exponentielle négative
      exp = -exp; // passage en mode positif
      calculated *= Math.pow(5,exp);
      pointPosition -= exp;
    }

    calculated = calculated.toString();

    //Suppression de la notation exponentielle
    let temp = calculated.split('.');
    calculated = ""+temp[0];
    if(temp[1]){
      calculated += ""+temp[1].split('e')[0];
    }
    console.log(pointPosition);
    if(pointPosition<0){
      calculated = Array(-pointPosition+1).join("0") + calculated;
      pointPosition = 1;
    }
    calculated = calculated.slice(0, pointPosition) + '.' + calculated.slice(pointPosition);

    result += " -> "+calculated;
    return result;
  }
  _mantissaDecimal(){
    let length=this.mantissa.length;
    let stepAddition = 5;
    let result = 1; // valeur caché, compensation

    // Limitation du travail
    while(this.mantissa[length-1] != true && length >= 1){
      length--;
    }

    for(let i=0;i<length;i++){
      result *= 10;
      if(this.mantissa[i]){
        result += stepAddition;
      }
      stepAddition *= 5;
    }

    return result;
  }

  _exponentDecimal(){
    let tot = 0;
    let size = this.exponent.length;
    for(let i=0;i<size;i++){
      let n = this.exponent[i] ? 1 : 0;
      tot = tot*2+n;
    }
    tot -= this._dOffset();
    return tot;
  }

  _dOffset(){
    return Math.pow(2,this.e-1)-1;
  }
}

let inputNumber = new FloatingType('18.3333');

function dynamic(idInput,idResult){
  let float = new FloatingType(document.getElementById(idInput).value);
  document.getElementById(idResult).innerHTML = float.toString();
  console.log(float.toString());
}

function pi(){
  //    Somme de o à l'infini de ((4/(8n+1)-2/(8n+4)-1/(8n+5)-1/(8n+6))*(1/16)^n)
  // -> Somme de o à l'infini de ((4/(8n+1)-1/(4n+2)-1/(8n+5)-1/(8n+6))*(1/16)^n)
  let infiniTest = 12;
  let pi = 0;

  let one = new FloatingType('1');
  let two = new FloatingType('2');
  let four = new FloatingType('4');
  let oneSixteen = new FloatingType('0.0625');

  for(let i=0;i<12;i++){
    pi.add((four.divBy(new FloatingType(8*n+1)).sub(FloatingType.oneBy(4*n+2)).sub(FloatingType.oneBy(8*n+6))).mult(oneSixteen));
    oneSixteen = oneSixteen.mult(oneSixteen);
  }
}
