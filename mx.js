
var mx;

try {
	mx = exports;
} catch(err) {
	mx = {};
}


// GOAL 1: get it working on simple non matrix expressions
// GOAL 2: get it working on matrix expressions

mx.symbol = function() {
	var that = {};

	that.__class = "mx.symbol";

	/**
	 * Returns the class name of this symbol
	 * @return {String} name of the symbol class
	 */
	that.className = function() {
		return that.__class;
	};

	/**
	 * Returns the current value of the symbol
	 * or null if this is ill defined
	 * @return {Number} value
	 */
	that.value = function(valueMap) {
		return null;
	};

	/**
	 * Returns this symbol differentiated by the argument symbol
	 * @param  {mx.symbol} by Symbol to take derivative with respect to
	 * @return {mx.symbol}    The differentiated value or null if error
	 */
	that.differentiate = function(by) {
		throw "Cannot call differentiate on " + that.className();
	};


	/**
	 * Returns the name of the symbol or throws an exception if ill defined;
	 * @return {String} the name of this symbol
	 */
	that.name = function() {
		return null;
	};

	/**
	 * Returns the string representation of the symbol
	 * @return {String} string representation of the symbol
	 */
	that.toString = function() {
		return null;
	};

	/**
	 * Returns all of the symbols that are child elems
	 * @return {Array<mx.symbol>} All child symbols of this symbol
	 */
	that.getSymbols = function() {
		return [];
	};

	// Syntactic sugar methods
	that.times = function(s) {
		if (!s.className) s = $$(s);
		return mx.multiply(that,s);
	};

	that.plus = function(s) {
		if (!s.className) s = $$(s);
		return mx.add(that,s);
	};

	that.pow = function(s) {
		if (!s.className) s = $$(s);
		return mx.pow(that, s);
	};

	that.dividedBy = function(s) {
		if (!s.className) s = $$(s);
		return mx.divide(that, s);
	};


	that.minus = function(s) {
		if (!s.className) s = $$(s);
		return mx.subtract(that, s);
	};

	that.derivative = function(s) {
		if (!s.className) s = $$(s);
		return that.differentiate(s);
	};

	return that;
};

mx.constant = function(value) {
	var that = mx.symbol();

	if (isNaN(value)) throw "Need to specify value for constant";

	that.__class = "mx.constant";

	/**
	 * Returns the current value of the symbol
	 * @return {Number} value
	 */
	that.value = function(valueMap) {
		return value;
	};

	/**
	 * Returns this symbol differentiated by the argument symbol
	 * @param  {mx.symbol} by Symbol to take derivative with respect to
	 * @return {mx.symbol}    The differentiated value or null if error
	 */
	that.differentiate = function(by) {
		// TODO: if wrt to matrix, need to match dimensions!
		return mx.constant(0);
	};

	/**
	 * Returns the string representation of the symbol
	 * @return {String} string representation of the symbol
	 */
	that.toString = function() {
		return '' + value;
	};

	return that;
};


mx.scalar = function(name) {
	var that = mx.symbol();

	if (!name) throw "Need to specify a name for symbol";

	name = ''+name;

	that.__class = "mx.scalar";

	/**
	 * Returns the name of the symbol or null if undefined;
	 * @return {String} the name of this symbol
	 */
	that.name = function() {
		return name;
	};

	/**
	 * Returns the value of the scalar or null if ill defined
	 * @param  {Object} valueMap Map from variable names to values
	 * @return {Number}          the value
	 */
	that.value = function(valueMap) {
		if (!valueMap || valueMap[name] === undefined) return null;
		return valueMap[name];
	};

	/**
	 * Returns this symbol differentiated by the argument symbol
	 * @param  {mx.symbol} by Symbol to take derivative with respect to
	 * @return {mx.symbol}    The differentiated value or null if error
	 */
	that.differentiate = function(by) {
		
		if (by.name() === that.name()) {
			return mx.constant(1);
		} else {
			return mx.constant(0);
		}
	};

	/**
	 * Returns the string representation of the symbol
	 * @return {String} string representation of the symbol
	 */
	that.toString = function() {
		return name;
	};

	/**
	 * Returns all of the symbols that are child elems
	 * @return {Array<mx.symbol>} All child symbols of this symbol
	 */
	that.getSymbols = function() {
		return [that];
	};

	return that;
};

mx.multiply = function(symbol1, symbol2) {

	// basic optimizations for multiplying by identity constants:
	if (symbol1.value() === 0 || symbol2.value() === 0) {
		return mx.constant(0);
	}

	if(symbol1.value() === 1) {
		return symbol2;
	}

	if(symbol2.value() === 1) {
		return symbol1;
	}
	
	if(symbol2.value() !== null && symbol1.value() !== null) {
		return mx.constant(symbol2.value() * symbol.value());
	}

	if(!symbol1 || !symbol2) {
		throw "Need 2 value values to multiply";
	}

	var that = mx.symbol();

	that.__class = "mx.multiply";

	that.value = function(valueMap) {
		if (symbol1.value(valueMap) === null || symbol2.value(valueMap) === null) return null;
		return symbol1.value(valueMap) * symbol2.value(valueMap);
	};
	
	that.differentiate = function(by) {
		return mx.add(mx.multiply(symbol1.differentiate(by), symbol2), mx.multiply(symbol2.differentiate(by), symbol1));
	};

	/**
	 * Returns the string representation of the symbol
	 * @return {String} string representation of the symbol
	 */
	that.toString = function() {
		return "(" + symbol1.toString() + ") * (" + symbol2.toString() + ")";
	};

	/**
	 * Returns all of the symbols that are child elems
	 * @return {Array<mx.symbol>} All child symbols of this symbol
	 */
	that.getSymbols = function() {
		return mx.__.extractSymbols(symbol1, symbol2);
	};


	return that;
};

mx.add = function(symbol1, symbol2) {
	// basic optimizations
	if (symbol1.value() === 0) {
		return symbol2;
	}

	if (symbol2.value() === 0) {
		return symbol1;
	}


	if(symbol2.value() !== null && symbol1.value() !== null) {
		return mx.constant(symbol2.value() + symbol1.value());
	}

	if(!symbol1 || !symbol2) {
		throw "Need 2 value values to add";
	}
	var that = mx.symbol();

	that.__class = "mx.add";

	that.value = function(valueMap) {
		if (symbol1.value(valueMap) === null || symbol2.value(valueMap) === null) return null;
		return symbol1.value(valueMap) + symbol2.value(valueMap);
	};
	
	that.differentiate = function(by) {
		return mx.add(symbol1.differentiate(by), symbol2.differentiate(by));
	};

	/**
	 * Returns the string representation of the symbol
	 * @return {String} string representation of the symbol
	 */
	that.toString = function() {
		return "(" + symbol1.toString() + ") + (" + symbol2.toString() + ")";
	};

	/**
	 * Returns all of the symbols that are child elems
	 * @return {Array<mx.symbol>} All child symbols of this symbol
	 */
	that.getSymbols = function() {
		return mx.__.extractSymbols(symbol1, symbol2);
	};

	return that;
};


mx.divide = function(g, h) {
	
	if (h.value() === 0) {
		throw "Cannot divide by 0";
	}

	if (h.value() === 1) {
		return g;
	}

	if (g.value() !== null && h.value() !== null) {
		return mx.constant(g.value() / h.value());
	}

	that.__class = "mx.divide";
	
	/**
	 * Returns the value of the division
	 * @return {Number} The value of the division
	 */
	that.value = function(valueMap) {
		if (g.value(valueMap) === null || h.value(valueMap) === null) return null;
		return g.value(valueMap) / h.value(valueMap);
	};

	/**
	 * Differentiates g,h using the quotient rule
	 * @param  {mx.symbol} by the symbol to take the derivative with respect to
	 * @return {mx.symbol}    differentiated expression
	 */
	that.differentiate = function(by) {
		return mx.divide(mx.subtract(mx.multiply(g.differentiate(by), h), mx.multiply(h.differentiate(by), g)),mx.multiply(h,h));
	};

	/**
	 * Returns the string representation of the symbol
	 * @return {String} string representation of the symbol
	 */
	that.toString = function() {
		return "(" + symbol1.toString() + ") / (" + symbol2.toString() + ")";
	};

	/**
	 * Returns all of the symbols that are child elems
	 * @return {Array<mx.symbol>} All child symbols of this symbol
	 */
	that.getSymbols = function() {
		return mx.__.extractSymbols(h, g);
	};
};



mx.subtract = function(symbol1, symbol2) {
	return mx.add(mx.multiply(mx.constant(-1), symbol2), symbol1);
};



mx.sin = function(symbol) {
	var that = mx.symbol();

	that.__class = "mx.sin";

	/**
	 * Differentiates 
	 * @param  {mx.symbol} by the symbol to take the derivative with respect to
	 * @return {mx.symbol}    differentiated expression
	 */
	that.differentiate = function(by) {
		return mx.multiply(mx.cos(by), symbol.differentiate(by));
	};

	/**
	 * Returns the value of the division
	 * @return {Number} The value of the division
	 */
	that.value = function(valueMap) {
		if (symbol.value(valueMap) === null) return null;
		return Math.sin(symbol.value(valueMap));
	};

	/**
	 * Returns the string representation of the symbol
	 * @return {String} string representation of the symbol
	 */
	that.toString = function() {
		return "sin(" + symbol.toString() + ")";
	};

	/**
	 * Returns all of the symbols that are child elems
	 * @return {Array<mx.symbol>} All child symbols of this symbol
	 */
	that.getSymbols = function() {
		return symbol.getSymbols();
	};

	return that;
};


mx.cos = function(symbol) {
	var that = mx.symbol();

	that.__class = "mx.cos";

	/**
	 * Differentiates 
	 * @param  {mx.symbol} by the symbol to take the derivative with respect to
	 * @return {mx.symbol}    differentiated expression
	 */
	that.differentiate = function(by) {
		return mx.multiply(mx.multiply(mx.constant(-1), mx.sin(by)), symbol.differentiate(by));
	};

	/**
	 * Returns the value of the division
	 * @return {Number} The value of the division
	 */
	that.value = function(valueMap) {
		if (symbol.value(valueMap) === null) return null;
		return Math.cos(symbol.value(valueMap));
	};

	/**
	 * Returns the string representation of the symbol
	 * @return {String} string representation of the symbol
	 */
	that.toString = function() {
		return "cos(" + symbol.toString() + ")";
	};

	/**
	 * Returns all of the symbols that are child elems
	 * @return {Array<mx.symbol>} All child symbols of this symbol
	 */
	that.getSymbols = function() {
		return symbol.getSymbols();
	};

	return that;
};

mx.tan = function(symbol) {
	return mx.divide(mx.sin(symbol), mx.cos(symbol));
};

mx.pow = function(symbolBase, symbolPower) {
	var that = mx.symbol();

	if (symbolPower.value() === null) {
		throw "Pow exponent must be a real number" + symbolPower.toString();
	}

	if (symbolPower.value() === 1) {
		return symbolBase;
	}

	that.__class = "mx.pow";

	/**
	 * Differentiates 
	 * @param  {mx.symbol} by the symbol to take the derivative with respect to
	 * @return {mx.symbol}    differentiated expression
	 */
	that.differentiate = function(by) {
		return mx.multiply (symbolBase.differentiate(by), mx.multiply(mx.constant(symbolPower.value()), mx.pow(symbolBase, mx.constant(symbolPower.value() - 1))));
	};

	/**
	 * Returns the value of taking the power
	 * @return {Number} The value of pow function
	 */
	that.value = function(valueMap) {
		if (symbolBase.value(valueMap) === null || symbolPower.value(valueMap) === null) return null;
		return Math.pow(symbolBase.value(valueMap), symbolPower.value(valueMap));
	};

	/**
	 * Returns the string representation of the symbol
	 * @return {String} string representation of the symbol
	 */
	that.toString = function() {
		return "(" + symbolBase.toString() + ")^"+symbolPower.value();
	};

	/**
	 * Returns all of the symbols that are child elems
	 * @return {Array<mx.symbol>} All child symbols of this symbol
	 */
	that.getSymbols = function() {
		return symbolBase.getSymbols();
	};

	return that;
};



mx.ln = function(symbol) {
	var that = mx.symbol();

	if (symbol.value() === 1) {
		return mx.constant(0);
	}

	that.__class = "mx.ln";

	/**
	 * Differentiates 
	 * @param  {mx.symbol} by the symbol to take the derivative with respect to
	 * @return {mx.symbol}    differentiated expression
	 */
	that.differentiate = function(by) {
		return mx.multiply(mx.divide(symbol.differentiate(by), symbol));
	};

	/**
	 * Returns the value of taking the power
	 * @return {Number} The value of pow function
	 */
	that.value = function(valueMap) {
		if (symbol.value(valueMap) === null) return null;
		return Math.log(symbol.value(valueMap));
	};

	/**
	 * Returns the string representation of the symbol
	 * @return {String} string representation of the symbol
	 */
	that.toString = function() {
		return "ln(" + symbol.toString() + ")";
	};

	/**
	 * Returns all of the symbols that are child elems
	 * @return {Array<mx.symbol>} All child symbols of this symbol
	 */
	that.getSymbols = function() {
		return symbol.getSymbols();
	};

	return that;
};




mx.exp = function(symbol) {
	var that = mx.symbol();

	if (symbol.value() === 0) {
		return mx.constant(1);
	}

	that.__class = "mx.exp";

	/**
	 * Differentiates 
	 * @param  {mx.symbol} by the symbol to take the derivative with respect to
	 * @return {mx.symbol}    differentiated expression
	 */
	that.differentiate = function(by) {
		return mx.multiply(symbol.differentiate(by), mx.exp(symbol));
	};

	/**
	 * Returns the value of taking the power
	 * @return {Number} The value of pow function
	 */
	that.value = function(valueMap) {
		if (symbol.value(valueMap) === null) return null;
		return Math.exp(symbol.value(valueMap));
	};

	/**
	 * Returns the string representation of the symbol
	 * @return {String} string representation of the symbol
	 */
	that.toString = function() {
		return "exp(" + symbol.toString() + ")";
	};

	/**
	 * Returns all of the symbols that are child elems
	 * @return {Array<mx.symbol>} All child symbols of this symbol
	 */
	that.getSymbols = function() {
		return symbol.getSymbols();
	};

	return that;
};

/**
 * Checks if the two symbols are equivalent by evaluating them
 * at many points and checking the result
 * @param  {mx.symbol} symbol1 first symbol
 * @param  {mx.symbol} symbol2 second symbol
 * @return {Boolean}         Whether or not the two symbols are equivalent
 */

mx.equal = function(symbol1, symbol2, eps, numSamplePoints, rangeMin, rangeMax) {
	if (!eps) eps = mx.__.EPSILON;
	if (!numSamplePoints) numSamplePoints = mx.__.EQUALITY_CHECK_SAMPLES;

	if (!rangeMin || !rangeMax){
		rangeMin = -mx.__.EQUALITY_CHECK_RANGE;
		rangeMax = mx.__.EQUALITY_CHECK_RANGE;
	}

	var variables = mx.__.extractSymbols(symbol1, symbol2);
	var variableNames = [];
	for (var i = 0; i < variables.length; i++) {
		variableNames.push(variables[i].name());
	}

	for (i = 0; i < numSamplePoints; i++) {
		var values = {};
		// initialize random parameters to the function
		for (var j = 0; j < variableNames.length; j++) {
			var r = Math.random();
			values[variableNames[j]] = (rangeMax - rangeMin) * r + rangeMin;
		}
		// evaluate each symbol and check that they are within epsilon:
		if (Math.abs(symbol1.value(values) - symbol2.value(values)) > eps) {
			return false;
		}
	}
	return true;
};

// Private functions
mx.__ = {};
mx.__.EPSILON = 0.000001;
mx.__.EQUALITY_CHECK_SAMPLES = 100;
mx.__.EQUALITY_CHECK_RANGE = 999999;

mx.__.extractSymbols = function(symbol1, symbol2) {
	var seen = {};

	var list1 = symbol1.getSymbols();
	
	for (var i = 0; i < list1.length; i++) {
		seen[list1[i].name()] = true;
	}

	if (!symbol2) return list1;

	var list2 = symbol2.getSymbols();

	for (var j = 0; j < list2.length; j++) {
		if (!seen[list2[j].name()]) {
			list1.push(list2[j]);
		}
	}
	return list1;
};

// setup mx helper function:
window.$$ = function (d) {
	if (isNaN(d)) return mx.scalar(d);
	return mx.constant(d);
};
