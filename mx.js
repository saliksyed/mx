/*jshint multistr: true */
var mx;
var root;
try {
	// try to set mx to exports if running as node module
	mx = exports;
	root = global;
} catch(err) {
	mx = {};
	root = window;
}


// Private functions
mx.__ = {};
mx.__.EPSILON = 1e-10;
mx.__.EQUALITY_CHECK_SAMPLES = 100;
mx.__.EQUALITY_CHECK_RANGE = 999999;


mx.symbol = function() {
	var that = {};

	that.__class = "mx.symbol";

	that.args = {};

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
	that.getSymbols = function(seen) {
		if (!seen) seen = {};
		var ret = [];
		var properties = Object.keys(that.args);
		for (var i = 0; i < properties.length; i++) {
			var list = that.args[properties[i]].getSymbols();
			for (var j = 0; j < list.length; j++) {
				if (seen[list[j].name()] === undefined) {
					seen[list[j].name()] = true;
					ret.push(list[j]);
					ret = ret.concat(list[j].getSymbols(seen));
				}
			}
		}
		return ret;
	};

	that.copy = function() {
		return JSON.parse(JSON.stringify(that));
	};
	
	/**
	 * Replaces one variable for another. Mapping is a map, for example:
	 *  {'x1' : $$('y'), 'x2' : $$('y')} would specify that 'x1' and 'x2' are to be replaced with 'y'
	 *  An optional mappingValues array will override values. This might be useful for example if replacing
	 * contents of  one vector to another vector where the keys are the same but values are different.
	 * @param  {Object} mapping       An object with keys corresponding to variables to replace
	 * @param  {Object} mappingValues A corresponding object with new values (default will equate to mapping)
	 * @return {mx.symbol}             The new symbol with variables replaced.
	 */
	that.replace = function(mapping, mappingValues) {
		if (!mappingValues) mappingValues = mapping;
		var ret = that; // TODO: should return a deep copy!!!!
		var properties = Object.keys(ret.args);
		var symbolNames = Object.keys(mapping);
		for (var i = 0; i < properties.length; i++) {
			for (var j = 0; j < symbolNames.length; j++) {
				var name = symbolNames[j];
				value = mappingValues[name];
				if (ret.args[properties[i]].className() === 'mx.scalar' && ret.args[properties[i]].name() === name) {
					ret.args[properties[i]] = value;
				} else {
					ret.args[properties[i]].replace(mapping, mappingValues);
				}
			}
		}
		return ret;
	};

	that.apply = function(applyFn) {
		var ret = that; // TODO: deep copy
		return applyFn(ret);
	};

	// Syntactic sugar methods
	that.times = function(s) {
		return that.apply(function(d){
			return mx.multiply(d, $$(s));
		});
	};

	that.plus = function(s) {
		return that.apply(function(d){
			return mx.add(d, $$(s));
		});
	};

	that.pow = function(s) {
		return that.apply(function(d){
			return mx.pow(d, $$(s));
		});
	};

	that.dividedBy = function(s) {
		return that.apply(function(d){
			return mx.divide(d, $$(s));
		});
	};


	that.minus = function(s) {
		return that.apply(function(d){
			return mx.subtract(d, $$(s));
		});
	};

	that.derivative = function(s) {
		return that.apply(function(d){
			return d.differentiate($$(s));
		});
	};

	return that;
};

mx.constant = function(value) {
	var that = mx.symbol();

	if (isNaN(value)) throw "Need to specify value for constant : " + value;

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

mx.op = function(fn) {
	var that = mx.symbol();

	/**
	 * Calls the supplied function with valueMap as arg and returns the value
	 * @param  {Object} valueMap variables names along with values
	 * @return {Number}          value of the eval'd function
	 */
	that.value = function(valueMap) {
		try {
			return fn(valueMap);
		} catch(err) {
			return null;
		}
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
		if (!by.name()) {
			throw "Error: Cannot differentiate by " + by.toString();
		}
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
	that.getSymbols = function(seen) {
		seen = seen || {};
		if (seen[that.name()] !== undefined) return [];
		return [that];
	};

	return that;
};



mx.matrix = function(numCols, numRows) {
	var that = mx.symbol();
	
	if(isNaN(numRows)) numRows = 1; // default to a row vector
	
	if (isNaN(numCols)) throw 'Invalid input dimensions';

	that.__class = 'mx.matrix';

	that.args.values = {};
	that.numCols = numCols;
	that.numRows = numRows;

	var checkBounds = function(col, row){
		if (row >= that.numRows) throw 'Index out of bounds';
		if (col >= that.numCols) throw 'Index out of bounds';
	};

	that.isVector = function() {
		return that.numCols === 1 || that.numRows ===1;
	};

	that.dims = function(dim) {
		if (dim === 0) return that.numCols;
		if (dim === 1) return that.numRows;
		return [that.numCols, that.numRows];
	};

	that.setRow = function(rowIdx, rowValues) {
		if (rowValues.numCols !== that.numCols || rowValues.numRows !== 1) throw 'Invalid row vector';
		for (var i = 0; i < that.numCols; i++) {
			that.set(i, rowIdx, rowValues.get(i, 0));
		}
		return that;
	};

	that.setCol = function(col, vec) {
		if (vec.numRows !== that.numRows || vec.numCols !== 1) throw 'Invalid column vector';
		for (var i = 0; i < that.numRows; i++) {
			that.set(col, i, vec.get(0, i));
		}
		return that;
	};

	that.set = function(col, row, val) {
		checkBounds(col, row);
		that.args.values[col + '-' + row] = $$(val);
		return that;
	};

	that.get = function(col, row) {
		checkBounds(col, row);
		// TODO: create deep copy!
		if (!that.args.values[col + '-' + row]) return $$(0);
		return that.args.values[col + '-' + row];
	};

	that.map = function(mapperFn) {
		for (var i = 0; i < that.numCols; i++) {
			for(var j = 0; j <that.numRows; j++) {
				mapperFn(that.get(i,j), i, j);
			}
		}
		return that;
	};

	that.apply = function(applyFn) {
		var ret = mx.matrix(that.numCols, that.numRows);
		that.map(function(d, i, j) {
			ret.set(i, j, applyFn(d));
		});
		return ret;
	};

	that.transpose = function() {
		var newmat = mx.matrix(that.numRows,that.numCols);
		var i;
		if (that.numRows === 1) {
			for (i = 0; i < that.numCols; i++) {
				newmat.set(0, i, that.get(i, 0));
			}
		} else if(that.numCols === 1) {
			for (i = 0; i < that.numRows; i++) {
				newmat.set(i, 0, that.get(0, i));
			}
		} else {
			for (i = 0; i < that.numRows; i++) {
				newmat.setCol(i, that.row(i).transpose());
			}
		}
		return newmat;
	};


	that.row = function(row) {
		checkBounds(0, row);
		var ret = mx.matrix(that.numCols, 1);
		for (var i = 0; i < that.numCols; i++) {
			ret.set(i, 0, that.get(i, row));
		}
		return ret;
	};

	that.column = function(col) {
		var ret = mx.matrix(1,that.numRows);
		checkBounds(col, 0);
		for (var i = 0; i < that.numRows; i++) {
			ret.set(0, i, that.get(col, i));
		}

		return ret;
	};

	that.fill = function(val) {
		var ret = mx.matrix(that.numCols, that.numRows);
		that.map(function(d, i, j) {
			ret.set(i, j, $$(val));
		});
		return ret;
	};

	that.value = function(valueMap) {
		var ret = mx.matrix(that.numCols, that.numRows);
		that.map(function(d, i, j) {
			ret.set(i, j, d.value(valueMap));
		});
		return ret;
	};

	that.named = function(name) {
		var ret = mx.matrix(that.numCols, that.numRows);
		that.map(function(d, i, j) {
			ret.set(i, j, $$(name+'_'+i+'_'+j));
		});
		return ret;
	};

	that.dot = function(mat2) {
		if (!that.isVector() || !mat2.isVector()) throw 'Can only run dot product on vector';

		if (that.numCols !== mat2.numCols) {
			mat2 = mat2.transpose();
		}

		var i;
		var ret = mx.constant(0);

		if (that.numCols === 1) {
			for (i = 0; i < that.numRows; i ++) {
				ret = ret.plus(that.get(0, i).times(mat2.get(0,i)));
			}
		} else {
			for (i = 0; i < that.numCols; i ++) {
				ret = ret.plus(that.get(i, 0).times(mat2.get(i, 0)));
			}
		}
		return ret;
	};

	that.multiply = function(mat2) {
		var newmat, i;
		if (mat2.className() === 'mx.scalar' || mat2.className() ==='mx.constant') {
			// just multiply all elements by mat2:
			newmat = mx.matrix(that.numCols, that.numRows);
			that.map(function(d,i,j) {
				if (!d) return;
				newmat.set(i,j, d.times(mat2));
			});
			return newmat;
		}

		if (mat2.isVector()){
			// transform vector by matrix
			if (mat2.numRows !== that.numCols) throw 'Cannot transform vector of dimension ' + mat2.numCols + ' by matrix of dimension (' + that.numCols + ','+that.numRows+')';

			newmat = mx.matrix(1, that.numRows);
			for (i = 0; i < that.numRows; i++) {
				newmat.set(0, i, that.row(i).dot(mat2.transpose()));
			}
			return newmat;
		}

		if (mat2.numRows !== that.numCols || mat2.numCols !== that.numRows) throw 'Invalid matrix multiplication';
		// do matrix multiply:
		newmat = mx.matrix(mat2.numCols, that.numRows);
		for (i = 0; i < mat2.numCols; i ++){
			var newCol = that.multiply(mat2.column(i));
			newmat.setCol(i, newCol);
		}
		return newmat;
	};

	that.toString = function() {
		var ret = "[\n";

		for (var i = 0 ; i < that.numRows; i++) {
			ret +="\t";
			for (var j = 0; j < that.numCols; j++) {
				ret+=that.get(j, i).toString() +",";
			}
			ret += "\n";
		}
		ret +="]";
		return ret;
	};

	return that;
};


mx.multiply = function(symbol1, symbol2) {

	symbol1 = $$(symbol1);
	symbol2 = $$(symbol2);

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
		return mx.constant(symbol2.value() * symbol1.value());
	}

	if(!symbol1 || !symbol2) {
		throw "Need 2 value values to multiply";
	}

	var that = mx.symbol();
	
	that.args = {a : symbol1, b : symbol2};

	that.__class = "mx.multiply";

	that.value = function(valueMap) {
		if (that.args.a.value(valueMap) === null || that.args.b.value(valueMap) === null) return null;
		return that.args.a.value(valueMap) * that.args.b.value(valueMap);
	};
	
	that.differentiate = function(by) {
		return mx.add(mx.multiply(that.args.a.differentiate(by), that.args.b), mx.multiply(that.args.b.differentiate(by), that.args.a));
	};

	/**
	 * Returns the string representation of the symbol
	 * @return {String} string representation of the symbol
	 */
	that.toString = function() {
		return "(" + that.args.a.toString() + ") * (" + that.args.b.toString() + ")";
	};

	return that;
};

mx.add = function(symbol1, symbol2) {

	symbol1 = $$(symbol1);
	symbol2 = $$(symbol2);

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
	
	that.args.a = symbol1;
	that.args.b = symbol2;

	that.value = function(valueMap) {
		if (that.args.a.value(valueMap) === null || that.args.b.value(valueMap) === null) return null;
		return that.args.a.value(valueMap) + that.args.b.value(valueMap);
	};
	
	that.differentiate = function(by) {
		return mx.add(that.args.a.differentiate(by), that.args.b.differentiate(by));
	};

	/**
	 * Returns the string representation of the symbol
	 * @return {String} string representation of the symbol
	 */
	that.toString = function() {
		return "(" + that.args.a.toString() + ") + (" + that.args.b.toString() + ")";
	};

	return that;
};


mx.divide = function(symbol1, symbol2) {

	symbol1 = $$(symbol1);
	symbol2 = $$(symbol2);

	if (symbol2.value() !== null && Math.abs(symbol2.value()) < mx.__.EPSILON) {
		throw "Cannot divide by 0";
	}

	if (symbol2.value() === 1) {
		return symbol1;
	}

	if (symbol1.value() !== null && symbol2.value() !== null) {
		return mx.constant(symbol1.value() / symbol2.value());
	}
	
	var that = mx.symbol();

	that.__class = "mx.divide";
	
	that.args.a = symbol1;
	that.args.b = symbol2;

	/**
	 * Returns the value of the division
	 * @return {Number} The value of the division
	 */
	that.value = function(valueMap) {
		if (that.args.a.value(valueMap) === null || that.args.b.value(valueMap) === null) return null;
		return that.args.a.value(valueMap) / that.args.b.value(valueMap);
	};

	/**
	 * Differentiates g,h using the quotient rule
	 * @param  {mx.symbol} by the symbol to take the derivative with respect to
	 * @return {mx.symbol}    differentiated expression
	 */
	that.differentiate = function(by) {
		return mx.divide(mx.subtract(mx.multiply(that.args.a.differentiate(by), that.args.b), mx.multiply(symbol2.differentiate(by), that.args.a)),mx.multiply(that.args.b,that.args.b));
	};

	/**
	 * Returns the string representation of the symbol
	 * @return {String} string representation of the symbol
	 */
	that.toString = function() {
		return "(" + that.args.a.toString() + ") / (" + that.args.b.toString() + ")";
	};

	return that;
};



mx.subtract = function(symbol1, symbol2) {
	return mx.add(mx.multiply(mx.constant(-1), symbol2), symbol1);
};



mx.sin = function(symbol) {

	symbol = $$(symbol);

	// simplify if evaluatable
	if (symbol.value() !== null) {
		return $$(Math.sin(symbol.value()));
	}

	var that = mx.symbol(symbol);

	that.__class = "mx.sin";

	that.args.symbol = symbol;

	/**
	 * Differentiates 
	 * @param  {mx.symbol} by the symbol to take the derivative with respect to
	 * @return {mx.symbol}    differentiated expression
	 */
	that.differentiate = function(by) {
		return mx.multiply(mx.cos(that.args.symbol), that.args.symbol.differentiate(by));
	};

	/**
	 * Returns the value of the division
	 * @return {Number} The value of the division
	 */
	that.value = function(valueMap) {
		if (that.args.symbol.value(valueMap) === null) return null;
		return Math.sin(that.args.symbol.value(valueMap));
	};

	/**
	 * Returns the string representation of the symbol
	 * @return {String} string representation of the symbol
	 */
	that.toString = function() {
		return "sin(" + that.args.symbol.toString() + ")";
	};

	return that;
};


mx.cos = function(symbol) {

	symbol = $$(symbol);

	// simplify if evaluatable
	if (symbol.value() !== null) {
		return $$(Math.cos(symbol.value()));
	}

	var that = mx.symbol(symbol);

	that.args.symbol = symbol;

	that.__class = "mx.cos";

	/**
	 * Differentiates 
	 * @param  {mx.symbol} by the symbol to take the derivative with respect to
	 * @return {mx.symbol}    differentiated expression
	 */
	that.differentiate = function(by) {
		return mx.multiply(mx.multiply(mx.constant(-1), mx.sin(that.args.symbol)), that.args.symbol.differentiate(by));
	};

	/**
	 * Returns the value of the division
	 * @return {Number} The value of the division
	 */
	that.value = function(valueMap) {
		if (that.args.symbol.value(valueMap) === null) return null;
		return Math.cos(that.args.symbol.value(valueMap));
	};

	/**
	 * Returns the string representation of the symbol
	 * @return {String} string representation of the symbol
	 */
	that.toString = function() {
		return "cos(" + that.args.symbol.toString() + ")";
	};

	return that;
};

mx.tan = function(symbol) {
	return mx.divide(mx.sin(symbol), mx.cos(symbol));
};

mx.pow = function(symbolBase, symbolPower) {
	var that = mx.symbol(symbolBase);

	symbolPower = $$(symbolPower);
	symbolBase = $$(symbolBase);

	if (symbolPower.value() === null) {
		throw "Pow exponent must be a real number" + symbolPower.toString();
	}

	if (symbolPower.value() === 1) {
		return symbolBase;
	}

	if (symbolPower.value() !== null && symbolPower.value() === 0) {
		return $$(1);
	}

	if (symbolBase.value() !== null) {
		return mx.constant(Math.pow(symbolBase.value(), symbolPower.value()));
	}

	that.__class = "mx.pow";

	that.args.base = symbolBase;
	that.args.power = symbolPower;
	/**
	 * Differentiates 
	 * @param  {mx.symbol} by the symbol to take the derivative with respect to
	 * @return {mx.symbol}    differentiated expression
	 */
	that.differentiate = function(by) {
		return mx.multiply (that.args.base.differentiate(by), mx.multiply(mx.constant(that.args.power.value()), mx.pow(that.args.base, mx.constant(that.args.power.value() - 1))));
	};

	/**
	 * Returns the value of taking the power
	 * @return {Number} The value of pow function
	 */
	that.value = function(valueMap) {
		if (that.args.base.value(valueMap) === null || that.args.power.value(valueMap) === null) return null;
		return Math.pow(that.args.base.value(valueMap), that.args.power.value(valueMap));
	};

	/**
	 * Returns the string representation of the symbol
	 * @return {String} string representation of the symbol
	 */
	that.toString = function() {
		return "(" + that.args.base.toString() + ")^"+that.args.power.value();
	};

	return that;
};

mx.ln = function(symbol) {
	var that = mx.symbol();

	symbol = $$(symbol);

	if (symbol.value() !== null) {
		if (symbol.value() < mx.__.EPSILON)
			throw "Invalid input value for ln";
		return mx.constant(Math.log(symbol.value()));
	}

	if (symbol.className() === "mx.exp") {
		return symbol.exponent();
	}

	that.__class = "mx.ln";

	that.args.base = symbol;
	
	/**
	 * Differentiates 
	 * @param  {mx.symbol} by the symbol to take the derivative with respect to
	 * @return {mx.symbol}    differentiated expression
	 */
	that.differentiate = function(by) {
		return mx.divide(symbol.differentiate(by), symbol);
	};

	/**
	 * Returns the value of taking the power
	 * @return {Number} The value of pow function
	 */
	that.value = function(valueMap) {
		if (that.args.base.value(valueMap) === null) return null;
		return Math.log(that.args.base.value(valueMap));
	};

	/**
	 * Returns the string representation of the symbol
	 * @return {String} string representation of the symbol
	 */
	that.toString = function() {
		return "ln(" + that.args.base.toString() + ")";
	};

	/**
	 * Returns the base symbol
	 * @return {mx.symbol} base
	 */
	that.base = function() {
		return that.args.base;
	};

	return that;
};

mx.exp = function(symbol) {
	var that = mx.symbol();

	symbol = $$(symbol);

	if (symbol.value() !== null) {
		return mx.constant(Math.exp(symbol.value()));
	}
	if (symbol.className() === "mx.ln") {
		return symbol.base();
	}

	that.__class = "mx.exp";

	that.args.exponent = symbol;

	/**
	 * Differentiates 
	 * @param  {mx.symbol} by the symbol to take the derivative with respect to
	 * @return {mx.symbol}    differentiated expression
	 */
	that.differentiate = function(by) {
		return mx.multiply(that.args.exponent.differentiate(by), mx.exp(that.args.exponent));
	};

	/**
	 * Returns the value of taking the power
	 * @return {Number} The value of pow function
	 */
	that.value = function(valueMap) {
		if (that.args.exponent.value(valueMap) === null) return null;
		return Math.exp(that.args.exponent.value(valueMap));
	};

	/**
	 * Returns the string representation of the symbol
	 * @return {String} string representation of the symbol
	 */
	that.toString = function() {
		return "exp(" + that.args.exponent.toString() + ")";
	};

	/**
	 * Returns the exponent symbol
	 * @return {mx.symbol} exponent
	 */
	that.exponent = function() {
		return that.args.exponent;
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

	symbol1 = $$(symbol1);
	symbol2 = $$(symbol2);

	if (!numSamplePoints) numSamplePoints = mx.__.EQUALITY_CHECK_SAMPLES;

	if (!rangeMin || !rangeMax){
		rangeMin = -mx.__.EQUALITY_CHECK_RANGE;
		rangeMax = mx.__.EQUALITY_CHECK_RANGE;
	}

	var variables = symbol1.getSymbols().concat(symbol2.getSymbols());
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
		if (Math.abs(1 - (symbol1.value(values) / symbol2.value(values))) > eps) {
			return false;
		}
	}
	return true;
};

/**
 * Uses finite difference to approximate derivatives
 * Note that the valueMap should contain values for all
 * variables that will not be cancelled out once the expression
 * has been evaluated.
 * @param  {mx.symbol} symbol symbol to evaluate
 * @param  {mx.symbol} by symbol to take derivative with respect to. Note that 
 * @param  {Number} eps    delta for finite difference approximation (optional)
 * @return {Number}        the evaluated derivative at that point or null if not fully determined
 */
mx.__.estimateDerivative = function(symbol, by, valueMap, eps) {
	if (!eps) eps = mx.__.EPSILON;

	symbol = $$(symbol);

	var symbols = by.getSymbols();

	// evaluate f(x1+h...xn+h)
	for (var i = 0; i < symbols.length; i++) {
		if (!valueMap[symbols[i]]) continue;
		valueMap[symbols[i]] += eps;
	}

	var val = symbol.value(valueMap);
	if (val === null) return null;

	// evaluate f(x1-h...xn-h)
	for (i = 0; i < symbols.length; i++) {
		if (!valueMap[symbols[i]]) continue;
		valueMap[symbols[i]] -= 2*eps;
	}

	var val2 = symbol.value(valueMap);
	return (val - val2) / (2.0*eps);
};

// setup mx helper function:
mx.$$ = function (d) {
	if (typeof(d) === 'function') return mx.op(d);
	if (d.__class) return d;
	if (isNaN(d)) return mx.scalar(d);
	return mx.constant(d);
};

mx.nice = function() {
	try {
		root.cos = mx.cos;
		root.exp = mx.exp;
		root.sin = mx.sin;
		root.tan = mx.tan;
		root.pow = mx.pow;
		root.ln = mx.ln;
	} catch (err) {}

	// Syntactic sugar methods
	Number.prototype.times = function(s) {
		return mx.multiply($$(this), $$(s));
	};

	Number.prototype.plus = function(s) {
		return mx.add($$(this), $$(s));
	};

	Number.prototype.pow = function(s) {
		return mx.pow($$(this), $$(s));
	};

	Number.prototype.dividedBy = function(s) {
		return mx.divide($$(this), $$(s));
	};


	Number.prototype.minus = function(s) {
		return mx.subtract($$(this), $$(s));
	};

	Number.prototype.derivative = function(s) {
		return $$(this).differentiate($$(s));
	};

	String.prototype.times = function(s) {
		return mx.multiply($$(this), $$(s));
	};

	String.prototype.plus = function(s) {
		return mx.add($$(this), $$(s));
	};

	String.prototype.pow = function(s) {
		return mx.pow($$(this), $$(s));
	};

	String.prototype.dividedBy = function(s) {
		return mx.divide($$(this), $$(s));
	};


	String.prototype.minus = function(s) {
		return mx.subtract($$(this), $$(s));
	};

	String.prototype.derivative = function(s) {
		return $$(this).differentiate($$(s));
	};

};

root.$$ = mx.$$;
