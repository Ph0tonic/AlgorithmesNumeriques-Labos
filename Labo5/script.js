//pi/4 = _0^1∫ 1/(1+x^2) dx
let ourPiApprox = 0;
let realPiApprox = "3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679"; //3. + 100 digits
//source : http://www-groups.dcs.st-and.ac.uk/history/HistTopics/1000_places.html

function thefunction(x) {
	return (1 / (1 + Math.pow(x, 2)));
}

function riemannSum(f, a, b, dx) {
	let sum = 0;
	while (a < b) {
		let y = f(a);
		sum += y * dx;
		a += dx;
	}
	return sum;
}

function calcOurPiApprox() {
	let technique = riemannSum;
	timerStart();
	let pivalue = 4 * technique(thefunction, 0, 1, 0.0000001);
	let calcTime = timerStop();


	ourPiApprox = "" + pivalue;
	let compared = compareString(ourPiApprox, realPiApprox);
	updateDisplay([compared[0], compared[1], (ourPiApprox.length - 2), compared[2] - 2, compared[3] - 2, calcTime]);
}

function updateDisplay(tab) {
	document.getElementById("ourPiApprox").innerHTML = tab[0];
	document.getElementById("realPiApprox").innerHTML = tab[1];
	document.getElementById("nbDigits").innerHTML = tab[2];
	document.getElementById("nbCorrectDigits").innerHTML = tab[3];
	document.getElementById("nbCorrectDigitsTotal").innerHTML = tab[4];
	document.getElementById("calcTime").innerHTML = tab[5];
}

function compareString(a, b) {
	let minLength = min(a.length, b.length);
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
	return newAB;
}

function min(a, b) {
	if (a < b)
		return a;
	else
		return b;
}

let timeStart = 0;

function timerStart() {
	ts = Date.now();
}

function timerStop() {
	return Date.now() - ts;
}


calcOurPiApprox();
