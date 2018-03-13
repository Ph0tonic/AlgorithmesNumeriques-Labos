
class Plot{
  constructor(divId){

  }

  addLine(data){

  }
}


class Algorithme{

}

function draw() {
  try {
    functionPlot({
      target: '#canvas',
      data: [{
        fn: document.getElementById('eq').value,
        sampler: 'builtIn',  // this will make function-plot use the evaluator of math.js
        graphType: 'polyline'
      },{
        points: [
          [1, 1],
          [2, 1],
          [2, 2],
          [1, 2],
          [1, 1]
        ],
        fnType: 'points',
        graphType: 'polyline'
      }]
    });
  }
  catch (err) {
    console.log(err);
    alert(err);
  }
}

$(document).ready(function(){
    document.getElementById('form').onsubmit = function (event) {
      event.preventDefault();
      draw();
    };

    draw();

})
