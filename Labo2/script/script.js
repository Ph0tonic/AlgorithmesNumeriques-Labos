
let plot = new Plot('canvas',$('#eq').val(),[parseFloat($('#x1').val()),parseFloat($('#x2').val())]);

$(document).ready(function(){
  $('#form').on('submit', function (event) {
    event.preventDefault();
    plot.setFunction($('#eq').val());
  });

  $('#next').on('click', function () {
    $('#nbIteration').text(plot.nextStep());
  });

  $('#previous').on('click', function () {
    $('#nbIteration').text(plot.previousStep());
  });

  $('#x1Group').on('input', function(){
    plot.setX(parseFloat($('#x1').val()),1);
    $('#nbIteration').text('0');
  })

  $('#x2Group').on('input', function(){
    if($('input[name=methodOption]:checked', '#method').val() == 'dichotomy'){
      plot.setX(parseFloat($('#x2').val()),2);
      $('#nbIteration').text('0');
    }
  })

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

  let bounderies = [-100,100];
  let solutions = FixedPoint.solve(bounderies,$('#eq').val());
  $('#zeros').text('{'+solutions.join(';')+'}');
})
