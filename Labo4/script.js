
function taylorCos(theta, n)
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

function getPointsTaylorCos(start, stop, nbSample, nbTermsTaylor)
{
    if(stop <= start || nbSample < 1)
        return false;

    let range = stop - start;
    let step = range / nbSample;

    let points = []

    for(let x = start; x < stop; x+=step)
    {
        y = taylorCos(x, nbTermsTaylor);
        point = [x, y];
        points.push(point);
    }

    return points;
}

function showGraph(graph, points, points2, points3)
{
    functionPlot({
        target: '#' + graph,
        xAxis :{label:'x'},
        yAxis :{label:'y'},
        grid :true,
        data: [
            {
                points: points,
                fnType: 'points',
                graphType: 'polyline'
            },
            {
                points: points2,
                fnType: 'points',
                graphType: 'polyline'
            },
            {
                points: points3,
                fnType: 'points',
                graphType: 'polyline'
            }
        ]
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

function shiftBy(points, value)
{
    let newpoints = clone2DArray(points);

    for(let i = 0; i < newpoints.length; i++)
    {
        newpoints[i][0] += value;
    }

    return newpoints;
}

function use(nbTermsTaylor, nbSample, nbPeriods)
{
    let period = 2*Math.PI;

    let pointsCos = getPointsTaylorCos(-period/2, period/2, nbSample, nbTermsTaylor);
    let pointsMSin = shiftBy(pointsCos, -period/4);
    let pointsMCos = shiftBy(pointsMSin, -period/4);

    pointsCos = createPeriods(pointsCos, nbPeriods, period);
    pointsMSin = createPeriods(pointsMSin, nbPeriods, period);
    pointsMCos = createPeriods(pointsMCos, nbPeriods, period);

    showGraph('cos', pointsCos, pointsMSin, pointsMCos);
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
    let nbSample = document.getElementById("nbSample").value;
    let nbPeriods = document.getElementById("nbPeriods").value;

    updateDisplay(nbTermsTaylor, nbSample, nbPeriods);
    use(nbTermsTaylor, nbSample, nbPeriods);
}

function updateDisplay(nbTermsTaylor, nbSample, nbPeriods)
{
    document.getElementById("nbTermsTaylor-value").innerHTML = nbTermsTaylor;
    document.getElementById("nbSample-value").innerHTML = nbSample;
    document.getElementById("nbPeriods-value").innerHTML = nbPeriods;
}

settingsChanged();
