function cosTaylor(theta, iterNum=500) {
    let periode = Math.PI*2;

    while(theta>periode/2){ //Remet l'angle donnée dans la première période
      theta -= periode;
    }while(theta<-periode/2){
      theta += periode;
    }

    let thetaCarre = theta*theta;
    let cos = 1;
    let signe = -1;
    let powByFactorial = 1;

    //cos(theta)=(-1)^n/(2n)! * theta^(2n)
    for(let i=1;i<iterNum;++i)
    {
        powByFactorial *= thetaCarre/((2*i)*(2*i-1));

        cos += signe*powByFactorial;
        signe *= -1
        if(powByFactorial == 0)
            break;
    }
    return cos;
}

/** Approximates sinus
*/
function sinTaylor(theta, iterNum=500) {
    let periode = Math.PI*2;

    while(theta>periode/2){ //Remet l'angle donnée dans la première période
      theta -= periode;
    }while(theta<-periode/2){
      theta += periode;
    }

    var thetaCarre = -theta*theta;
    var sin = 1;
    var n = 0;
    var term = 1;

    //sin(theta)=(-1)^n/(2n+1)! * theta^(2n+1)
    for (let i = 1; i <= 2*iterNum; i++) {
        n = n + 2;
        term = term * thetaCarre / ( n*(n+1) );
        sin = sin + term
    }
    sin = theta*sin;

    return sin;
}

function derivativePrime(f, theta, n, h)
{
    let numerator = 8*(f(theta+h/2, n)-f(theta-h/2,n)) - f(theta + h, n) + f(theta - h, n);
    let denominator = 6*h;
    return numerator / denominator;
}

function derivativeSecond(f, theta, n, h)
{
    let numerator = f(theta + h, n) + f(theta - h, n) - 2*f(theta, n);
    let denominator = h*h;
    return numerator / denominator;
}

function getPoints(f, start, stop, nbSample, nbTermsTaylor, derivative = null, h = -1)
{
    if(stop <= start || nbSample < 1)
        return false;

    let range = stop - start;
    let step = range / nbSample;

    let points = []

    for(let x = start; x < stop+step; x+=step)
    {
        if(derivative == null)
            y = f(x, nbTermsTaylor);
        else
            y = derivative(f, x, nbTermsTaylor, h);

        point = [x, y];
        points.push(point);
    }
    return points;
}

function showGraph(graph, tabPoints, zoom, disableZoom=false,xLabel="",yLabel="")
{
    dataPoints = [];

    for(let i = 0; i < tabPoints.length; i++)
    {
        d = {
            points: tabPoints[i],
            fnType: 'points',
            graphType: 'polyline'
            };
        dataPoints.push(d);
    }

    let e = document.getElementById(graph);

    let p = functionPlot({
        target: '#' + graph,
        width: e.offsetWidth,
        height: e.offsetHeight,
        xAxis :{label:'x'+xLabel},
        yAxis :{label:'y'+yLabel},
        grid : true,
        data: dataPoints,
        plugins: [
          functionPlot.plugins.zoomBox() // Ajout de la fonctionnalité de zoom par shift + sélection
        ],
        disableZoom : disableZoom
    });

    p.programmaticZoom(zoom[0], zoom[1]);
    return p;
}

function clone2DArray(from)
{
    to = [];
    for (var i = 0; i < from.length; i++)
    {
        to.push(from[i].slice(0));
    }
    return to;
}


function use(nbTermsTaylor, nbSamplePerPeriod, h, nbPeriods)
{
    let period = nbPeriods*2*Math.PI;
    let nbSample = nbPeriods*nbSamplePerPeriod;

    let pointsCos = getPoints(cosTaylor, -period/2, period/2, nbSample, nbTermsTaylor);
    let pointsMSin = getPoints(cosTaylor, -period/2, period/2, nbSample, nbTermsTaylor, derivativePrime, h);
    let pointsMCos = getPoints(cosTaylor, -period/2, period/2, nbSample, nbTermsTaylor, derivativeSecond, h);

    let zoom = [];
    let minx = pointsCos[0][0];
    let maxx = pointsCos[pointsCos.length-1][0];
    let miny = -maxx;
    let maxy = maxx;
    zoom.push([minx, maxx]);
    zoom.push([miny, maxy]);

    showGraph('graph', [pointsCos, pointsMSin, pointsMCos], zoom);
}

/** Called when any setting changed, i.e. slider moved
*/
function settingsChanged()
{
    let nbTermsTaylor = document.getElementById("nbTermsTaylor").value;
    let nbSamplePerPeriod = document.getElementById("nbSamplePerPeriod").value;
    let h = document.getElementById("h").value;
    let nbPeriods = document.getElementById("nbPeriods").value;

    updateDisplay(nbTermsTaylor, nbSamplePerPeriod, h, nbPeriods);
    use(nbTermsTaylor, nbSamplePerPeriod, 10**h, nbPeriods);
}

/** Updates the numbers after labels corresponding to the slider value
*/
function updateDisplay(nbTermsTaylor, nbSamplePerPeriod, h, nbPeriods)
{
    document.getElementById("nbTermsTaylor-value").innerHTML = nbTermsTaylor;
    document.getElementById("nbSamplePerPeriod-value").innerHTML = nbSamplePerPeriod;
    document.getElementById("h-value").innerHTML = "10^"+h;
    document.getElementById("nbPeriods-value").innerHTML = nbPeriods;
}

function calc(angle){
  let radius = parseInt($('#diameterLac').val())/2;
  let navigationSpeed = parseInt($('#navigationSpeed').val());
  let towingSpeed = parseInt($('#towingSpeed').val());

  let dockingPoint = polarToCartesian(radius, radius, radius, 90-2*angle);
  let navigationLength = Math.sqrt(Math.pow(dockingPoint.x,2)+Math.pow(radius-dockingPoint.y,2));
  let towingLength = Math.PI*radius*angle/90;

  let time = navigationLength/navigationSpeed + towingLength/towingSpeed;
  return Math.round(time*100)/100;
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  let angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;

  return {
    x: centerX + (radius * cosTaylor(angleInRadians)),
    y: centerY + (radius * sinTaylor(angleInRadians))
  };
}

class BoatManager{

  constructor(){
    this.offsetX = 5;
    this.offsetY = 5;
    this.centerX = 205;
    this.centerY = 205;
    this.radius = 200;

    let self = this;
    $('#angle-boat').on('change input',function(){
      $('#AngleStart').text($(this).val());
      self.angleUpdate();
    }).trigger('change');

    $('#diameterLac').on('change',function(){
      self.dataUpdate();
    }).trigger('change');

    $('#navigationSpeed').on('change',function(){
      self.dataUpdate();
    });

    $('#towingSpeed').on('change',function(){
      self.dataUpdate();
    });
  }

  dataUpdate(){
    let period = 90;
    let nbSample = 100;

    let data = getPoints(calc, 0, period, nbSample, NaN);

    let minx = data[0][0];
    let maxx = data[data.length-1][0];
    let miny = data[0][1];
    let maxy = data[data.length-1][1];
    let range = Math.abs(maxy-miny);
    let zoom = [[minx-5,maxx+5],[Math.min(maxy,miny)-range,Math.max(maxy,miny)+range]];


    $('#best-angle').text(miny<maxy?"0":"90");
    $('#best-time').text(Math.min(miny,maxy));
    $('#conclusion-bonus').text(miny<maxy?"Navigation":"Remorquage")

    this.z = showGraph('graph-boat', [data], zoom,true, " angle[°]", " Temps[s]");
    $(document).ready(function(){
      this.z.programmaticZoom(zoom[0], zoom[1]);
    }.bind(this));
  }

  // Adapted from https://stackoverflow.com/questions/5736398/how-to-calculate-the-svg-path-for-an-arc-of-a-circle
  angleUpdate(){
    let angle = parseInt($('#angle-boat').val());
    if(angle<=90 && angle>=0){

      let time = calc(angle);
      $('#time-std').text(time);

      let start = polarToCartesian(this.centerX, this.centerY, this.radius+1, 90);
      let end = polarToCartesian(this.centerX, this.centerY, this.radius+1, 90-2*angle);

      let d = [
          "M", start.x, start.y,
          "A", this.radius+1, this.radius+1, 0, 0, 0, end.x, end.y
      ].join(" ");

      $("#arc1").attr("d", d);
      $('#line-boat').attr('x2',end.x);
      $('#line-boat').attr('y2',end.y);
    }
  }
}

//It's becoming to be less understandable with all these parameters for functions
//We should maybe create a class in the case that we add new features...
$(document).ready(function(){
  z = new BoatManager();
  settingsChanged();
})
