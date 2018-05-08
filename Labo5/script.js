let ourPiApprox = "";
let realPiApprox = "3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679"; //3. + 100 digits
//source : http://www-groups.dcs.st-and.ac.uk/history/HistTopics/1000_places.html
let methods = [methodeDesRectangles, methodePointDuMilieu, /*methodeDesRectanglesIntervalesAleatoires,*/ methodeDesTrapezes, methodeDuPointMedian, methodeDeSimpson, methodeQuadratureDeGauss];
let param;

function f(x) {
	return (1 / (1 + Math.pow(x, 2)));
}

function methodeDesRectangles(f, a, b, dx) {
	let sum = 0;
	while (a <= b) {
		sum += f(a);
		a += dx;
	}
	sum *= dx;
	return sum;
}

function methodePointDuMilieu(f, a, b, dx) {
	let sum = 0;
	let halfdx = dx / 2;
	while (a <= b) {
		sum += f(a - halfdx);
		a += dx;
	}
	sum *= dx;
	return sum;
}

function methodeDesTrapezes(f, a, b, dx) {
	return 0;
}

function methodeDuPointMedian(f, a, b, dx) {
	return 0;
}

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

function methodeQuadratureDeGauss(f, a, b, dx) {
	return 0;
}

function calcOurPiApprox() {
	updateDisplay(["", "", "", "", "", ""]);
	let method = methods[getMethodId()];

	//Timed part
	timerStart();
	let pivalue = 4 * method(f, 0, 1, param);
	let calcTime = timerStop();

	ourPiApprox = "" + pivalue;
	let compared = compareString(ourPiApprox, realPiApprox);
	updateDisplay([compared[0], compared[1], (ourPiApprox.length - 1), compared[2] - 1, compared[3] - 1, calcTime]);
}

function getMethodId() {
	return parseInt(document.getElementById("method").value);
}

function changeSelect() {
	let slider = document.getElementById("param");
	let method = getMethodId();
	if (method <= 3) {
		slider.max = 8;
	} else {
		slider.max = 20;
	}
	slider.value = 4;
	changeParam();
}

function changeParam() {
	let val = document.getElementById("param").value;
	let method = getMethodId();
	if (method <= 3) {
		document.getElementById("param-value").innerHTML = "h = 10^-" + val;
		param = Math.pow(10, -val);
	} else {
		param = val * 25;
		document.getElementById("param-value").innerHTML = "n = " + param;
	}
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

changeParam();
calcOurPiApprox();
