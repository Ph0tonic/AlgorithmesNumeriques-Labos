
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

function getPointsTaylorCos(start, stop, count, n)
{
    if(stop <= start || count < 1)
        return false;

    let range = stop - start;
    let step = range / (count - 1);

    let points = []

    for(let x = start; x <= stop; x+=step)
    {
        y = taylorCos(x, n);
        point = [x, y];
        points.push(point);
    }

    return points;
}

function showGraph(graph, points, points2)
{
    functionPlot({
        target: '#' + graph,
        data: [
        {
            points: points,
            points2: points2,
            fnType: 'points',
            graphType: 'polyline'
        }
        ]
    })
}

function createPeriods(points, nbPeriods, period)
{
    newpoints = points.slice(0);

    for(let i = 1; i <= nbPeriods; i++)
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

function use()
{
    period = 2*Math.PI;
    nbPeriods = 10;
    nbTermsTaylor = 500;
    nbSteps = 20;

    points = getPointsTaylorCos(-period/2, period/2, nbSteps, nbTermsTaylor);
    console.log(points);
    points = createPeriods(points, nbPeriods, period);
    console.log(points);
    showGraph('cos', points, points);
}

use();
