
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
	that.value = function() {
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
	that.value = function() {
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

	return that;
};

mx.multiply = function(symbol1, symbol2) {

	// basic optimizations:
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

	that.value = function() {
		if (symbol1.value() === null || symbol2.value() === null) return null;
		return symbol1.value() * symbol2.value();
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

	that.value = function() {
		if (symbol1.value() === null || symbol2.value() === null) return null;
		return symbol1.value() + symbol2.value();
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
	that.value = function() {
		if (g.value() === null || h.value() === null) return null;
		return g.value() / h.value();
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
};



mx.subtract = function(symbol1, symbol2) {
	return mx.add(mx.multiply(mx.constant(-1), symbol2), symbol1);
};

mx.expression = function() {
	var that = mx.symbol();

	that.__class = "mx.expression";

	that.evaluate = function(valueMap) {
		return null;
	};

	return that;
};

/**

mx.pow = function(symbolBase, symbolPower) {
	// TODO
};

mx.log = function(symbol) {
	// TODO
};

mx.sin = function(symbol) {
	
};

mx.cos = function(symbol) {
	// TODO
};

mx.exp = function() {
	// TODO
};

mx.tan = function(symbol) {
	return mx.divide(mx.sin(symbol), mx.cos(symbol));
};

// TODO PART 2:

mx.matrix = function() {
	// TODO
};

mx.transpose = function() {

};
**/