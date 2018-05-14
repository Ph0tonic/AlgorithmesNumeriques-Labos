let ourPiApprox = "";
let realPiApprox = "3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679"; //3. + 100 digits

function methodeDeSimpson(f, a, b, n) {
    //Méthode de Simpson:
    //  a
    // ∫  f(x) = h/3(f(a) + 4 ∑ f(xi)  + 2 ∑ f(xi) + f(b)) + erreur
    //  b                     i impaire    i paire
    let evenSum = 0;
    let oddSum = 0;

    let h = (b - a) / n; // calcul du pas
    // Somme de 1 à n
    for (i = 1; i < n; ++i) {
        //valeur du x
        let x = a + i * h;
        if ((i % 2) == 0) {
            evenSum += f(x);
        } else {
            oddSum += f(x);
        }
    }
    let result = h / 3 * (f(a) + 4 * oddSum + 2 * evenSum + f(b));
    return result;
}

function calcOurPiApprox() {
    updateDisplay(["", "", "", "", "", "", ""]);
    let method = methodeDeSimpson;

    //Timed part
    let start = performance.now();
    let f = (x) => { //Function lambda permettant de calculer pi
        return (1 / (1 + x * x));
    };

    let pivalue = 4 * method(f, 0, 1, 500); // n fixé à 500 après essaies
    let end = performance.now();
    let calcTime = end - start;
    ourPiApprox = "" + pivalue.toFixed(17);
    let compared = compareString(ourPiApprox, realPiApprox);
    let compared2 = compareString("" + Math.PI.toFixed(17), realPiApprox);
    updateDisplay([compared[0], compared[1], compared2[0], (ourPiApprox.length - 1), compared[2], compared[3], calcTime]);
}

function updateDisplay(tab) {
    document.getElementById("ourPiApprox").innerHTML = tab[0];
    document.getElementById("realPiApprox").innerHTML = tab[1];
    document.getElementById("mathPiApprox").innerHTML = tab[2];
    document.getElementById("nbDigits").innerHTML = tab[3];
    document.getElementById("nbCorrectDigits").innerHTML = tab[4];
    document.getElementById("nbCorrectDigitsTotal").innerHTML = tab[5];
    document.getElementById("calcTime").innerHTML = tab[6];
}

function compareString(a, b) {
    let minLength = Math.min(a.length, b.length);
    let newAB = ["", "", -1, 0]; //A decorated, B decorated, limite, sum
    for (let i = 0; i < minLength; i++) {
        let decoratorBegin;
        let decoratorEnd = "</font>";
        if (a[i] != b[i]) {
            decoratorBegin = "<font color='red'>";
            if (newAB[2] == -1)
                newAB[2] = i;
        } else {
            decoratorBegin = "<font color='green'>";
            newAB[3]++;
        }
        newAB[0] += decoratorBegin + a[i] + decoratorEnd;
        newAB[1] += decoratorBegin + b[i] + decoratorEnd;
    }
    //Removing the count of the dot;
    newAB[2]--;
    newAB[3]--;
    return newAB;
}

calcOurPiApprox();






//Following code come from https://developer.vimeo.com/apis/oembed
//URL of the video
let videoUrl = 'https://vimeo.com/channels/pmg/183741782';
let endpoint = 'http://www.vimeo.com/api/oembed.json';
let callback = 'embedVideo';
let url = endpoint + '?url=' + encodeURIComponent(videoUrl) + '&callback=' + callback + '&width=640';

function embedVideo(video) {
    document.getElementById('embed').innerHTML = unescape(video.html);
}
//Loads data from Vimeo
function init() {
    var js = document.createElement('script');
    js.setAttribute('type', 'text/javascript');
    js.setAttribute('src', url);
    document.getElementsByTagName('head').item(0).appendChild(js);
}
window.onload = init;
