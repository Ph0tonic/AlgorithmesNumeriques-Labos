/**
 *  f -> function to evaluate
 *  a -> borne inf
 *  b -> borne sup
 *  n -> nombre d'itérations
 */
function simpson(f, a, b, n)
{
  //Méthode de Simpson:
  //  a
  // ∫  f(x) = h/3(f(a) + 4 ∑ f(xi)  + 2 ∑ f(xi) + f(b)) + erreur
  //  b                     i impaire    i paire

  let evenSum = 0;
  let oddSum = 0;

  let t0 = null;
  let t1 = null;

  t0 = performance.now();
  let h = (b - a) / n; // calcul du pas
  // Somme de 1 à n
  for (i = 1; i < n; ++i)
  {
    //valeur du x
    let x = a + i * h;
    if ((i % 2) == 0) {
      evenSum += f(x);
    } else {
      oddSum += f(x);
    }
  }
  let result = h / 3 * (f(a) + 4 * oddSum + 2 * evenSum + f(b));
  t1 = performance.now();
  let timeElapsed = t1 - t0;

  return {
    'res' : result.toFixed(17),
    'time' : timeElapsed.toFixed(5)
  }
}


function runPi(){
  let result = simpson(function(x){
    return 4 / (1 + (Math.pow(x, 2)));
  }, 0, 1, 500);

  //affichage du résultat
  document.getElementById('res').innerHTML = result.res;
  document.getElementById('time').innerHTML = result.time;
}
