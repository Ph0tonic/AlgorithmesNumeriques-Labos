/**
 *  Author: Bastien Wermeille, Damian Petroff & Raphael Margueron
 *  Date: Février-Mars 2018
 *  Goal: Representation of a floating value with only int and boolean
 */

class logicOp{
  static xor(a,b,c){ // Utilisation de !=true à cause du système à trois état avec undefined!!!
    /* bin = (a^b)^c = a&b&c || a&!b&!c || !a&b&!c || !a&!b&c */
    return a&&b&&c || a&&b!=true&&c!=true || a!=true&&b&&c!=true || a!=true&&b!=true&&c;
  }
  static hold(a, b, c){
    /* hold = a&&b || a&&c || b&&c */
    return a&&b || a&&c || b&&c;
  }
  static gte(arrayA,arrayB){ // Graeter or equal, Les deux tableaux doivent être de la même taille
    let length = arrayA.length;
    let i=0;
    for(let i=0;i<length;++i){
      if(arrayA[i] === true && arrayB[i] != true){
        return true;
      }else if(arrayA[i]!=true && arrayB[i] === true ){
        return false;
      }
    }
    return true;
  }
  static isSubstractable(a,b){ //a: Vérifie si a>b, a et b pas forcément de la même taille
    // a-b > 0
    logicOp.minimise(a);
    logicOp.minimise(b);

    if(a.length<b.length){
      return false;
    }else if(a.length==b.length){
      for(let i=0;i<a.length;++i){
        if(a[i]==true && b[i]!=true){
          return true
        }else if(a[i]!=true && b[i]==true){
          return false
        }
      }
    }
    return true;
  }
  static minimise(a){ // Supprime les 0 non significatifs (à gauche)
    let n=0;
    while(a[0] != true && a.length > 0){
        a.shift();
        n++;
    }
    return n;
  }
}


/*
 *  Underscore is standard to say "Should not be accessed from outside"
 */
class FloatingType{
  constructor(value) {
    //Size for field exponent
    this.e = 11;
    //Size field mantissa
    //this.m = 23;
    this.m = 52;

    if(value){
      if(Number.isInteger(value)){
        value = value.toString();
      }
      this._init(value);
    }else {
      this.sign = false;
      this.exponent = [];
      this.exponent.length = this.e;
      this.mantissa = [];
      this.mantissa.length = this.m;
    }
    this._cleanMantissa();
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

  _cleanMantissa(){
    for(let i=0;i<this.m;++i){
      if(this.mantissa[i]!=true)
        this.mantissa[i]=false;
    }
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
    //Converts the decimal place of a number in binary
    if(decimal == undefined){
      decimal = 0;
    }

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
    for(let i=0; i<this.e; ++i){
      binary.unshift(!!(exponent%2)); //!! pour que les valeurs soient des booléens et non pas un 0 ou un 1
      exponent-=exponent%2;
      exponent/=2;
    }
    return binary;
  }

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

    //TODO Check 0 or NaN

    //Step 1 - signe
    this.sign = (value.charAt(0) === '-');
    if(this.sign){
      value = value.substring(1);
    }

    //Step 2 - Whole number to Binary
    let parts = value.split('.');
    let whole = this._wholeToBinary(parseInt(parts[0]));

    //Step 3 - Fraction section to binary
    let decimal = this._decimalToBinary(parts[1]);

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
    this.exponent = this._exponentToBinary(exponent);
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
    let e1 = f1._exponentDecimal(f1.exponent);
    let e2 = f2._exponentDecimal(f2.exponent);
    let diff = Math.abs(e1-e2);

    let swap = false;
    if(e1 > e2){
      swap = true;
    }else if(e1 === e2){
      //Detect if swap neccessairy when they have the same exponent
      swap = logicOp.gte(f1.mantissa,f2.mantissa);
    }

    if(swap){
      //Echange des deux valeurs
      f2 = [f1, f1 = f2][0];
      e2 = [e1, e1 = e2][0];
    }

    //We base our new number on the greatest(exponent) number
    let f = f2.clone();
    let exp = e2;

    //Step 1 - Rewrite smaller one -> e1
    f1.mantissa.unshift(true); // Affichage du bit caché
    f2.mantissa.unshift(true); // Affichage du bit caché
    if(diff>0){
      for(let i=0;i<diff;++i){
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
      for(let i=length-1;i>=0;--i){
        binary[i] = logicOp.xor(f1.mantissa[i],f2.mantissa[i],hold);
        hold = logicOp.hold(f1.mantissa[i],f2.mantissa[i],hold);
      }

      //Step 3 - Normalise result
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
      //Sign equal to the greatest exponent number
      f.sign = f2.sign;

      //Mantissa substraction
      let length = f1.mantissa.length; // Use f1.length because it's the smallest and then the longer number
      let binary = [];
      binary.length = length;

      //Substraction
      for(let i=length-1;i>=0;--i){
        binary[i] = (f1.mantissa[i] != true && f2.mantissa[i] === true || f2.mantissa[i] != true && f1.mantissa[i]===true);
        if(f2.mantissa[i] != true && f1.mantissa[i] === true){
          //Update f2
          let j = i;
          while(j>0 && f2.mantissa[j]!=true){
            f2.mantissa[j] = !(f2.mantissa[j] === true);
            --j;
          }
          f2.mantissa[j] = !(f2.mantissa[j] === true);
        }
      }

      //Step 3 - Normalise result
      exp -= logicOp.minimise(binary);
      binary.shift() // Hide hidden bit
      f.mantissa = binary;
      f.mantissa.length = f.m;

      f.exponent = f._exponentToBinary(exp);
    }

    //Step 4 - Check overflow and underflow
    //TODO

    f._cleanMantissa();
    return f;
  }

  sub(value){
    //Return a new FloatingType after substraction
    let f1 = value.clone();
    f1.sign = !f1.sign;
    return this.add(f1);
  }

  mult(n){
    if(Number.isInteger(n)){
      n = new FloatingType(n);
    }

    let f1 = n.clone();
    let f2 = this.clone();
    f1.mantissa.unshift(true);
    f2.mantissa.unshift(true);
    let result = f1.clone();

    //Step 1 - addition of the exponent
    let exp = f1._exponentDecimal() + f2._exponentDecimal();

    //Step 2 - multiplication of the mantissa
    let binary = result.mantissa.slice(0);

    //f1*f2
//      1.000 = f1
//   ×  1.110 = f2
//   -----------
//          0000
//         1000
//        1000
//   +   1000
//   -----------
//       1110000  ===> 1.110000

    //Info about i, j and k
    // i : indice for looping over the multiplicator
    // j : indice for looping over the multiplied number
    // k : indice to compensate an hold, added at the front of the number

    let k = 0; //Compensation lorsque l'on ajoute un bit supplémentaire à binary

    for(let i=1;i<f2.mantissa.length;++i){
      let hold = false;
      if(f2.mantissa[i]){
        let j = 0;
        for(j=f1.mantissa.length-1;j>=0;--j){
          let newHold = logicOp.hold(f1.mantissa[j],binary[i+j+k],hold);
          binary[i+j+k] = logicOp.xor(f1.mantissa[j],binary[i+j+k],hold);
          hold = newHold;
        }
        //Ajout d'une éventuelle retenue
        while(hold){
          if(i+j+k>=0){
            let newHold = logicOp.hold(binary[i+j+k],hold,false);
            binary[i+j+k] = logicOp.xor(binary[i+j+k],hold,false);
            hold = newHold;
          }else{
            binary.unshift(true);
            hold = false;
            ++k;
            ++exp;
          }
          --j;
        }
      }
    }

    //Step 3 - Normalise mantissa
    exp -= logicOp.minimise(binary);
    binary.shift();
    result.mantissa = binary;
    result.exponent = result._exponentToBinary(exp);

    //Step 4 - Round result
    result.mantissa.length = result.m;

    //Step 5 - Adjust sign
    result.sign = logicOp.xor(f1.sign,f2.sign,false);

    return result;
  }

  divBy(n){
    //Return a new FloatingType after division by an int
    if(Number.isInteger(n)){
      n = new FloatingType(n);
    }

    let f1 = this.clone();
    let f2 = n.clone();
    f1.mantissa.unshift(true);
    f2.mantissa.unshift(true);
    let result = f1.clone();

    //if(f2.isZero() || f2.isNaN() || f2.isInfinity()){
      //TODO UPDATE Those particulary cases
      //return
    //}

    //Step 1 - substraction of the exponent
    let exp = f1._exponentDecimal() - f2._exponentDecimal();

    //Step 2 - division of the mantissa
  //  f1/f2
  //      1.000 = f1
  //   /  1.110 = f2
  //   -----------
  //   1000   |   1101
  //   ----       0.1000111011
  //   10000
  //  - 1101
  //    0011
  //    -----
  //     0110
  //     ----
  //      1100
  //      ----
  //      11000
  //      -1101
  //       10110
  //       -1101
  //        10010
  //        -1101
  //         01010
  //          ----
  //          10100
  //          -1101
  //           01110
  //           -1101
  //            0001
  // ...

    let dividend = f1.mantissa.slice(0);
    let divisor = f2.mantissa.slice(0);
    let binary = [];

    //Minimize divisor
    logicOp.minimise(divisor);
    while(divisor[divisor.length-1]!=true && divisor.length>0){
      divisor.pop();
    }

    let temp = dividend.slice(0,divisor.length);
    dividend = dividend.slice(divisor.length);
    while(dividend[dividend.length-1]!=true && dividend.length>0){
      dividend.pop();
    }

    let end = false;
    let nbOp = 0;
    while(!end && nbOp <= result.mantissa.length+2){ //Ajout de marge
      if(logicOp.isSubstractable(temp,divisor)){
        //Substraction
        binary.push(true);

        //temp - divisor
        for(let i=divisor.length-1;i>=0;--i){
          let k = temp.length-divisor.length;
          let take = divisor[i] === true && temp[i+k] != true;
          temp[i+k] = (temp[i+k] != true && divisor[i] === true || divisor[i] != true && temp[i+k]===true);
          if(take){
            let j = i-1;
            while(j+k>0 && temp[j+k]!=true){
              temp[j+k] = !(temp[j+k] === true);
              j--;
            }
            temp[j+k] = !(temp[j+k] === true);
          }
          //console.log("temp : "+temp);
        }

        //Remove the first element in all cases
        logicOp.minimise(temp);

        if(temp.length == 0 && dividend.length == 0){
          end = true;
        }
      }else{
        binary.push(false);
      }

      //Add value
      if(dividend.length>0){
        temp.push(dividend.shift());
      } else {
        temp.push(false);
      }

      nbOp++;
    }

    //Step 3 - Normalise mantissa
    exp -= logicOp.minimise(binary);
    binary.shift();
    result.mantissa = binary;
    result.exponent = result._exponentToBinary(exp);

    //Step 4 - Round result
    result.mantissa.length = result.m;

    //Step 5 - Adjust sign
    result.sign = logicOp.xor(f1.sign,f2.sign,false);

    return result;
  }

  static oneBy(n){
    let float = new FloatingType(1);
    return float.divBy(n);
  }
  toStr(){
    //TODO Supprimer - Fonction avec utilisation d'un type float pour tests
    //TODO ajout du signe
    let exp = this._exponentDecimal();
    let length=this.mantissa.length;
    let result = 1; // valeur caché, compensation

    // Limitation du travail
    while(this.mantissa[length-1] != true && length >= 1){
      length--;
    }

    for(let i=0;i<length;++i){
      if(this.mantissa[i]){
        result += 1/Math.pow(2,i+1);
      }
    }

    result *= Math.pow(2,exp);
    return result;

  }
  toString(){
    //Code here with this to access Object property
    let exp = this._exponentDecimal();
    let mant = this._mantissaDecimal();

    //Affichage simplifiée
    let signe  = (this.sign?'-':'+');

    let result = signe;
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

    if(pointPosition<0){
      calculated = Array(-pointPosition+1).join("0") + calculated;
      pointPosition = 1;
    }
    calculated = calculated.slice(0, pointPosition) + '.' + calculated.slice(pointPosition);

    result += " -> ";
    result += signe;
    result += calculated;
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
    let size = this.e;
    for(let i=0;i<size;++i){
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

function dynamic(idInput,idResult){
  let float = new FloatingType(document.getElementById(idInput).value);
  document.getElementById(idResult).innerHTML = float.toString();
}

function pi(){
  //    Somme de o à l'infini de ((4/(8n+1)-2/(8n+4)-1/(8n+5)-1/(8n+6))*(1/16)^n)
  // -> Somme de o à l'infini de ((4/(8n+1)-1/(4n+2)-1/(8n+5)-1/(8n+6))*(1/16)^n)
  let infiniTest = 200;
  let pi = new FloatingType(0);

  let two = new FloatingType(2);
  let four = new FloatingType(4);
  let oneSixteen = new FloatingType(1);

  for(let n=0;n<infiniTest;++n){
    pi = pi.add(four.divBy(new FloatingType(8*n+1)).sub(FloatingType.oneBy(4*n+2)).sub(FloatingType.oneBy(8*n+5)).sub(FloatingType.oneBy(8*n+6)).mult(oneSixteen));
    oneSixteen = oneSixteen.mult(FloatingType.oneBy(16));
    console.log(pi.toStr())
  }
  return pi;
}

function printBody()
{
  let estimatedPi = pi();
  document.getElementById("pi").innerHTML = estimatedPi.toStr();
}

//TODO Supprimer, valeurs pour tests
let b = new FloatingType('-1.125');
let a = new FloatingType('11');
let c = new FloatingType('1.875')

let d = new FloatingType('91.34375');
let e = new FloatingType('0.14453125')
