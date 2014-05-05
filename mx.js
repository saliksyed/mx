
var mx = exports || {};

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

	return that;
};

mx.multiply = function(symbol1, symbol2) {
	if (symbol1.value() === 0 || symbol2.value() === 0) {
		return mx.constant(0);
	}

	if(symbol1.value() === 1) {
		return symbol2;
	}

	if(symbol2.value() === 1) {
		return symbol1;
	}

	if(!symbol1 || !symbol2) {
		throw "Need 2 value values to multiply";
	}

	var that = mx.symbol();

	that.__class = "mx.multiply";

	that.value = function() {
		return symbol1.value() * symbol2.value();
	};
	
	that.differentiate = function(by) {
		return mx.add(mx.multiply(symbol1.differentiate(by), symbol2), mx.multiply(symbol2.differentiate(by), symbol1));
	};
	return that;
};

mx.add = function(symbol1, symbol2) {

	if (symbol1.value() === 0) {
		return symbol2;
	}

	if (symbol2.value() === 0) {
		return symbol1;
	}

	var that = mx.symbol();

	that.__class = "mx.add";

	that.value = function() {
		return symbol1.value() + symbol2.value();
	};
	
	that.differentiate = function(by) {
		return mx.add(mx.multiply(symbol1.differentiate(by), symbol2), mx.multiply(symbol2.differentiate(by), symbol1));
	};

	return that;
};


mx.divide = function(g, h) {
	
	that.__class = "mx.divide";
	
	that.value = function() {
		return symbol1.value() / symbol2.value();
	};

	that.differentiate = function(by) {
		return mx.divide(mx.subtract(mx.multiply(g.differentiate(by), h), mx.multiply(h.differentiate(by), g)),mx.multiply(h,h));
	};
};



mx.subtract = function(symbol1, symbol2) {
	return mx.add(mx.multiply(mx.constant(-1), symbol2), symbol1);
};

mx.expression = function() {
	var that = mx.symbol();

	that.__class = "mx.expression";

	that.evaluate = function(variables, values) {
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