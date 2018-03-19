
//Création de l'objet plot
let plot = new Plot('canvas',$('#eq').val(),[parseFloat($('#x1').val()),parseFloat($('#x2').val())]);

//Calcul des zéros selon la fonction saisie
function updateZeroes(){
    let bounderies = [-100,100];
    let solutions = FixedPoint.solve(bounderies,$('#eq').val());
    let text = '<math xmlns="http://www.w3.org/1998/Math/MathML"><mi>x</mi><mo>&#x2208;</mo><mfenced open="{" close="}"><mtable><mtr><mtd><mi>';
    text += solutions.join('</mi></mtd></mtr><mtr><mtd><mi>');
    text += '</mi></mtd></mtr></mtable></mfenced></math>';
    $('#zeros').html(text);
}

$(document).ready(function(){
  //Connexions des différents boutons
  $('#form').on('submit', function (event) {
    event.preventDefault();
    plot.setFunction($('#eq').val());

    updateZeroes();
  });

  //Bouton suivant
  $('#next').on('click', function () {
    $('#nbIteration').text(plot.nextStep());
  });

  //Bouton précédent
  $('#previous').on('click', function () {
    $('#nbIteration').text(plot.previousStep());
  });

  //Borne 1
  $('#x1Group').on('input', function(){
    plot.setX(parseFloat($('#x1').val()),1);
    $('#nbIteration').text('0');
  })

  //Borne 2
  $('#x2Group').on('input', function(){
    if($('input[name=methodOption]:checked', '#method').val() == 'dichotomy'){
      plot.setX(parseFloat($('#x2').val()),2);
      $('#nbIteration').text('0');
    }
  })

  //Choix de la Méthode
  $('#method input').on('change', function() {
    let resultArea = $('#result');
    let method = null;
     switch($('input[name=methodOption]:checked', '#method').val()){
       case 'dichotomy':
         method = new Dichotomy(plot, resultArea);
         $('#x2Group').show();
         break;
       case 'tangent':
         method = new Tangent(plot, resultArea);
         $('#x2Group').hide();
         break;
       case 'fixedPoint':
         method = new FixedPoint(plot, resultArea);
         $('#x2Group').hide();
         break;
     }
     plot.setAlgorithm(method);
     plot.draw();
     $('#nbIteration').text('0');
  });

  //Provoque le déclenchement de l'affichage du graphe
  $('#method input').trigger('change');
  updateZeroes();
})
