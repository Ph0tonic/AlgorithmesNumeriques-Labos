
function taylorCos(theta){
  let n = 300;
  let thetaCarre = theta*theta/1;
  let res = 1;
  let signe = -1;
  let puissanceByFactoriel = 1;


  //cos(theta)=(-1)^n/(2n)! * theta^(2n)
  for(let i=1;i<n;++i){
    console.log(res);
    puissanceByFactoriel *= thetaCarre/((2*i)*(2*i-1));
    if(puissanceByFactoriel != 0){
      res += signe*puissanceByFactoriel;
      signe *= -1
    }else{
      //End of the loop
      i=n;
    }
  }
  return res;
}


function prime
