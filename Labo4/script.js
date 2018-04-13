
function cosTaylor(theta, n)
{
    let thetaCarre = theta*theta/1;
    let res = 1;
    let signe = -1;
    let powByFactorial = 1;

    //cos(theta)=(-1)^n/(2n)! * theta^(2n)
    for(let i=1;i<n;++i)
    {
        powByFactorial *= thetaCarre/((2*i)*(2*i-1));

        if(powByFactorial == 0)
            break;

        res += signe*powByFactorial;
        signe *= -1
    }
    return res;
}

function derivativePrime(f, theta, n, h)
{
    let numerator = f(theta + h, n) - f(theta - h, n);
    let denominator = 2*h;
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

    for(let x = start; x < stop; x+=step)
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

function showGraph(graph, tabPoints)
{
    dataPoints = [];
    for(let i = 0; i < tabPoints.length;i++)
    {
        d = {
            points: tabPoints[i],
            fnType: 'points',
            graphType: 'polyline'
        };
        dataPoints.push(d);
    }

    functionPlot({
        target: '#' + graph,
        xAxis :{label:'x'},
        yAxis :{label:'y'},
        grid :true,
        data:dataPoints
    })
}

function createPeriods(points, nbPeriods, period)
{
    let newpoints = clone2DArray(points);

    for(let i = 1; i < nbPeriods; i++)
    {
        for(let j = 0; j < points.length; j++)
        {
            point = points[j];
            x = point[0];
            y = point[1];

            newpoint = [x + i*period, y];

            newpoints.push(newpoint);
        }
    }

    return newpoints;
}

function use(nbTermsTaylor, nbSamplePerPeriod, h, nbPeriods)
{
    let period = nbPeriods*2*Math.PI;
    let nbSample = nbPeriods*nbSamplePerPeriod;


    let pointsCos = getPoints(cosTaylor, -period/2, period/2, nbSample, nbTermsTaylor);
    let pointsMSin = getPoints(cosTaylor, -period/2, period/2, nbSample, nbTermsTaylor, derivativePrime, h);
    let pointsMCos = getPoints(cosTaylor, -period/2, period/2, nbSample, nbTermsTaylor, derivativeSecond, h);

    showGraph('graph', [pointsCos, pointsMSin, pointsMCos]);
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

function settingsChanged()
{
    let nbTermsTaylor = document.getElementById("nbTermsTaylor").value;
    let nbSamplePerPeriod = document.getElementById("nbSamplePerPeriod").value;
    let h = document.getElementById("h").value;
    let nbPeriods = document.getElementById("nbPeriods").value;

    updateDisplay(nbTermsTaylor, nbSamplePerPeriod, h, nbPeriods);
    use(nbTermsTaylor, nbSamplePerPeriod, 10**h, nbPeriods);
}

function updateDisplay(nbTermsTaylor, nbSamplePerPeriod, h, nbPeriods)
{
    document.getElementById("nbTermsTaylor-value").innerHTML = nbTermsTaylor;
    document.getElementById("nbSamplePerPeriod-value").innerHTML = nbSamplePerPeriod;
    document.getElementById("h-value").innerHTML = "10^"+h;
    document.getElementById("nbPeriods-value").innerHTML = nbPeriods;
}

settingsChanged();
