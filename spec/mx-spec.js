var mx = require("../mx.js");


describe('mx.symbol', function() {
	it('should return mx.symbol as classname', function() {
		expect(mx.symbol().className()).toBe('mx.symbol');
	});

	it('should return null as value', function() {
		expect(mx.symbol().value()).toBe(null);
	});

	it('should not be differentiable', function() {
		var diff = function() {
			return mx.symbol().differentiate(null);
		};
		expect(diff).toThrow();
	});
});

describe('mx.constant', function() {

	it('should throw an exception if instantiated with a bad value', function() {
		var test1 = function() {
			mx.constant();
		};

		var test2 = function() {
			mx.constant('hello');
		};
		expect(test1).toThrow();
		expect(test2).toThrow();
	});

	it('should return mx.constant as classname', function() {
		expect(mx.constant(0).className()).toBe('mx.constant');
	});

	it('should return the proper value', function() {
		expect(mx.constant(5).value()).toBe(5);
	});

	it('should return 0 as derivative', function() {
		expect(mx.constant(5).differentiate(null).value()).toBe(0);
	});
});


describe('mx.scalar', function() {

	it('should throw an exception if instantiated with a bad value', function() {
		var test1 = function() {
			return mx.scalar();
		};

		expect(test1).toThrow();
	});

	it('should return mx.scalar as classname', function() {
		expect(mx.scalar('x').className()).toBe('mx.scalar');
	});

	it('should return the proper name', function() {
		expect(mx.scalar('x').name()).toBe('x');
	});

	it('should return the proper derivative', function() {
		var x = mx.scalar('x');
		var y = mx.scalar('y');

		var d_dy_x = x.differentiate(y);

		var d_dy_y = y.differentiate(y);

		expect(d_dy_x.value()).toBe(0);
		expect(d_dy_y.value()).toBe(1);
	});
});



describe('mx.matrix', function() {
	it('should return mx.matrix as classname', function() {
		expect(mx.matrix(1,1).className()).toBe('mx.matrix');
	});

	it('require valid dimensions', function() {
		var test = function() {
			return mx.matrix();
		};
		expect(test).toThrow();
	});

	it('should return enable you to set and get a value', function() {
		var mat = mx.matrix(1,1);
		mat.set(0, 0, $$(5));
		expect(mat.get(0, 0).value()).toBe(5);
	});

	// DOT products:
	
	it('should compute the right dot product', function() {
		var mat = mx.matrix(3,1);
		mat.set(0, 0, $$(1));
		mat.set(1, 0, $$(2));
		mat.set(2, 0, $$(3));
		expect(mat.dot(mat).value()).toBe(14);
	});

	it('should not enable dot products on non vectors', function() {
		var mat = mx.matrix(3,3);
		var test = function() {
			return mat.dot(mat);
		};

		expect(test).toThrow();
	});

	it('should compute the right dot product for symbols', function() {
		var mat = mx.matrix(3,1);
		mat.set(0, 0, $$('x'));
		mat.set(1, 0, $$('x').times(2));
		mat.set(2, 0, $$('x').times(3));
		expect(mat.dot(mat).value({'x' : 1})).toBe(14);
		expect(mat.dot(mat).value({'x' : 2})).toBe(56);
	});

	// isVector
	it('should be able to determine if it is a vector', function() {
		expect(mx.matrix(3,1).isVector()).toBe(true);
		expect(mx.matrix(1,3).isVector()).toBe(true);
		expect(mx.matrix(3,3).isVector()).toBe(false);
	});

	// fill
	it('should be able to fill a matrix with numbers', function() {
		var mat = mx.matrix(2,2).fill(3);
		expect(mat.get(0,0).value()).toBe(3);
		expect(mat.get(0,1).value()).toBe(3);
		expect(mat.get(1,0).value()).toBe(3);
		expect(mat.get(1,1).value()).toBe(3);
	});

	// multiply
	it('should be able to transform a vector by a matrix:', function() {
		var vec = mx.matrix(2,1).fill(1);
		var mat = mx.matrix(2,2).fill(1);
		
		var transformed = mat.multiply(vec);
		expect(transformed.get(0,0).value()).toBe(2);
		expect(transformed.get(1,0).value()).toBe(2);
	});

	it('should be able to transform a matrix by a matrix:', function() {
		var vec = mx.matrix(2,2).fill(1);
		var mat = mx.matrix(2,2).fill(1);
		
		var transformed = mat.multiply(vec);
		expect(transformed.get(0,0).value()).toBe(2);
		expect(transformed.get(1,0).value()).toBe(2);
		expect(transformed.get(1,1).value()).toBe(2);
		expect(transformed.get(0,1).value()).toBe(2);
	});

	it('Identity transforms should work', function() {
		var vec = mx.matrix(3,1).fill(1);
		var mat = mx.matrix(3,3).fill(0);

		mat.set(0,0,$$(1));
		mat.set(1,1,$$(1));
		mat.set(2,2,$$(1));
		
		var transformed = mat.multiply(vec);
		expect(transformed.get(0,0).value()).toBe(1);
		expect(transformed.get(1,0).value()).toBe(1);
		expect(transformed.get(2,0).value()).toBe(1);
	});

	it('scalar multiplications should work', function() {
		var vec = mx.matrix(3,3).fill(1);
		var transformed = vec.multiply($$(2));
		expect(transformed.get(0,0).value()).toBe(2);
		expect(transformed.get(1,1).value()).toBe(2);
		expect(transformed.get(2,1).value()).toBe(2);
	});

	// transpose
});


describe('$$', function() {
	it('should correctly coerce a string input to a mx.scalar', function() {
		expect($$('x').className()).toBe('mx.scalar');
	});

	it('should correctly coerce a number input to a mx.constant', function() {
		expect($$(5).className()).toBe('mx.constant');
	});

	it('should not change a mx.symbol instance', function() {
		var x = $$('x');
		expect($$(x)).toEqual(x);
	});
});

describe('mx.multiply', function() {

	it('should throw an exception if instantiated without values', function() {
		var test1 = function() {
			return mx.multiply();
		};

		expect(test1).toThrow();
	});

	it('should optimize away 0 multiplications', function() {
		expect(mx.multiply($$(0), $$('y')).className()).toBe('mx.constant');
		expect(mx.multiply($$(0), $$('y')).value()).toBe(0);
	});

	it('should optimize away 1 multiplications', function() {
		expect(mx.multiply($$(1), $$('y')).className()).toBe('mx.scalar');
	});

	it('should optimize away 1 multiplications', function() {
		expect(mx.multiply($$('y'), $$(1)).className()).toBe('mx.scalar');
	});

	it('should return mx.multiply as classname when multiplying scalars', function() {
		expect(mx.multiply($$('x'), $$('y')).className()).toBe('mx.multiply');
	});

	it('should differentiate correctly', function() {
		var x = $$('x');
		var y = $$('y');

		var xtimesy = mx.multiply(x,y);

		var d_dx_xy = xtimesy.differentiate(x);

		var d_dy_xy = xtimesy.differentiate(y);

		expect(d_dx_xy.name()).toBe('y');
		expect(d_dy_xy.name()).toBe('x');
	});

	it('should return the right sub symbols', function() {
		var x = $$('x');
		var y = $$('y');
		var xtimesy = mx.multiply(x,y);
		expect(xtimesy.getSymbols()[0].name()).toBe('x');
		expect(xtimesy.getSymbols()[1].name()).toBe('y');
	});
});



describe('mx.add', function() {

	it('should throw an exception if instantiated without values', function() {
		var test1 = function() {
			return mx.add();
		};
		
		expect(test1).toThrow();
	});

	it('should optimize away 0 additions', function() {
		expect(mx.add($$(0), $$('y')).className()).toBe('mx.scalar');
		expect(mx.add($$(0), $$('y')).name()).toBe('y');
	});

	it('should work for basic addition', function() {
		expect(mx.add($$(5),$$(10)).value()).toEqual(15);
		expect(mx.add($$(3),$$(10)).value()).toEqual(13);
	});

	it('should return mx.add as classname when adding scalars', function() {
		expect(mx.add($$('x'), $$('y')).className()).toBe('mx.add');
	});

	it('should differentiate correctly', function() {
		var x = $$('x');
		var y = $$('y');

		var xplusy = x.plus(y);

		var d_dx_xplusy = xplusy.derivative(x);
		var d_dy_xplusy = xplusy.derivative(y);
		
		expect(d_dx_xplusy.value()).toBe(1);
		expect(d_dy_xplusy.value()).toBe(1);
	});

	it('should differentiate correctly', function() {
		var x = $$('x');

		var xplusx = mx.add(x,x);

		var d_dx_xplusx= xplusx.differentiate(x);

		expect(d_dx_xplusx.value()).toBe(2);
	});
});

describe('apply', function() {
	it('should correctly replace a symbol', function() {
		var exp = $$('a').plus(5).times('a');
		var replaced = exp.apply({'a': $$('x').plus('y')});
		expect(replaced.value({'x' : 1})).toBe(null);
		expect(replaced.value({'y' : 1})).toBe(null);
		expect(replaced.value({'x' : 1, 'y' : 1})).toBe(14);
	});
});


describe('mx.subtract', function() {

	it('should throw an exception if instantiated without values', function() {
		var test1 = function() {
			return mx.subtract();
		};
		expect(test1).toThrow();
	});

	it('should optimize away 0 subtractions', function() {
		expect(mx.subtract($$('y'), $$(0)).className()).toBe('mx.scalar');
		expect(mx.subtract($$('y'), $$(0)).name()).toBe('y');
	});


	it('should return mx.add as classname when subtracting scalars', function() {
		expect(mx.subtract($$('x'), $$('y')).className()).toBe('mx.add');
	});

	it('should differentiate correctly', function() {
		var x = $$('x');
		var y = $$('y');

		var xplusy = x.minus(y);

		var d_dx_xplusy = xplusy.derivative(x);
		var d_dy_xplusy = xplusy.derivative(y);
		
		expect(d_dx_xplusy.value()).toBe(1);
		expect(d_dy_xplusy.value()).toBe(-1);
	});

	it('should differentiate correctly', function() {
		var x = $$('x');

		var xplusx = mx.subtract(x.times($$(3)),x);

		var d_dx_xplusx= xplusx.differentiate(x);

		expect(d_dx_xplusx.value()).toBe(2);
	});
});


describe('mx.tan', function() {

	it('should throw an error for pi/2', function() {
		var test1 = function() {
			return mx.tan($$(Math.PI/2.0));
		};

		expect(test1).toThrow();
	});

	it('should give the right value for 0', function() {
		expect(mx.tan($$(0)).value()).toBe(0);
	});

	it('should have the right derivative', function() {
		expect(mx.equal(mx.tan($$('x')).derivative('x'), $$(2).dividedBy(mx.cos($$(2).times('x')).plus(1)), 0.01)).toBe(true);
	});

});
	

describe('mx.pow', function() {
	
	it('should return 1 if the power is 0', function() {
		expect(mx.pow($$('x'),$$(0)).value()).toBe(1);
	});

	it('should return the same expression if power is 1', function() {
		expect(mx.pow($$('x'),$$(1)).value({'x' : 88})).toBe(88);
	});

	it('should return the right answer for a floating point', function() {
		expect(mx.pow($$('x'),$$(3)).value({'x' : 10.1})).toBe(1030.301);
	});

	it('should return a number if base is constant', function() {
		expect(mx.pow($$(3),$$(3)).value()).toBe(27);
		expect(mx.pow($$(3),$$(3)).className()).toBe('mx.constant');
	});

	it('should fail if the exponent is not a number', function() {
		var test = function() {
			return mx.pow($$(3), $$('x'));
		};

		expect(test).toThrow();
	});

	it('should give the correct derivative for x^3', function() {
		expect(mx.equal($$(3).times($$('x').pow(2)), $$('x').pow(3).derivative('x'))).toBe(true);
	});
});

describe('mx.ln', function() {
	
	it('should return the correct value', function() {
		expect(mx.ln($$(1)).value()).toBe(0);
	});

	it('should fail on small or negative values', function() {
		var test1 = function() {
			mx.ln($$(0));
		};

		var test2 = function() {
			mx.ln($$(-5));
		};
		expect(test1).toThrow();
		expect(test2).toThrow();
	});

	it('should give the correct derivative for x^3', function() {
		expect(mx.equal(mx.ln($$('x').pow(3)).derivative('x'), $$(3).dividedBy('x'))).toBe(true);
	});
});

describe('mx.exp', function() {
	
	it('should return a number if base is constant', function() {
		expect(mx.exp($$(3)).className()).toBe('mx.constant');
		expect(mx.exp($$(3))).toBeCloseTo(Math.exp(3));
	});


	it('should give the correct derivative for x^3', function() {
		var d = $$(3).times(mx.exp($$('x').pow(3))).times($$('x').pow(2));
		expect(mx.equal(mx.exp($$('x').pow(3)).derivative('x'), d)).toBe(true);
	});
});


describe('mx.__.estimateDerivative', function() {

	it('should work for x^3 when x = 0', function() {
		var estimated = mx.__.estimateDerivative($$('x').pow(3), $$('x'), {'x' : 0}, 0.0001);
		var actual = 0;
		expect(estimated).toBeCloseTo(actual);
	});
	
	it('should work for x^3 when x = 10', function() {
		var estimated = mx.__.estimateDerivative($$('x').pow(3), $$('x'), {'x' : 10}, 0.1);
		var actual = 300;
		expect(estimated).toBeCloseTo(actual,1);
	});

	it('should work for a constant', function() {
		var estimated = mx.__.estimateDerivative($$(5), $$('x'), {}, 0.0001);
		var actual = 0;
		expect(estimated).toBeCloseTo(actual, 2);
	});

});

describe('mx.sin', function() {
	it('should simplify correctly constants', function() {
		expect(mx.sin($$(0)).value()).toEqual(0);
		expect(mx.sin($$(Math.PI/2)).value()).toEqual(1);
	});

	it('should compute the correct derivative for sin(2x)', function() {
		expect(mx.sin($$(2).times('x')).derivative('x').value({'x' : 0})).toEqual(2);
	});
});

describe('mx.cos', function() {
	it('should simplify correctly constants', function() {
		expect(Math.abs(mx.cos($$(Math.PI/2)).value()) < mx.__.EPSILON).toBe(true);
		expect(mx.cos($$(0)).value()).toEqual(1);
	});

	it('should compute the correct derivative for cos(2x)', function() {
		expect(mx.cos($$(2).times('x')).derivative('x').value({'x' : Math.PI/2})).toBeCloseTo(0, 3);
	});
});

describe('equal', function() {
	it('should compute equal correctly', function() {
		expect(mx.equal($$('x').times(2), $$('x').plus('x'))).toBe(true);
		expect(mx.equal($$('x').times(3), $$('x').plus('x').plus('x'))).toBe(true);
		expect(mx.equal($$('x').pow(3), $$('x').times('x').times('x'))).toBe(true);
		// TODO: Add more functions for robustness!
	});
});

describe('simple derivatives', function() {

	it('should work for 5*x+3', function() {
		var x = $$('x');
		var five = $$(5);
		var three = $$(3);

		var fivexplus3 = five.times(x).plus(three);
		
		expect(fivexplus3.differentiate(x).value()).toBe(5);
	});

	it('should work for 5*x+3*x', function() {
		var x = $$('x');
		var five = $$(5);
		var three = $$(3);
		var fivexplus3 = five.times(x).plus(three.times(x));
		expect(fivexplus3.differentiate(x).value()).toBe(8);
	});

	it('should work for x+x+x+x', function() {
		var x = $$('x');
		var fourx = x.plus(x).plus(x).plus(x);
		expect(fourx.differentiate(x).value()).toBe(4);
	});

	it('should work for x*x', function() {
		var x = $$('x');
		var xtimesx = x.times(x);
		expect(xtimesx.differentiate(x).toString()).toBe(mx.add(x,x).toString());
	});

	it('should work for sin(cos(x))', function() {
		var exp = mx.sin(mx.cos($$('x')));
		var derivative = exp.derivative('x');

		var estimator = function (valueMap) {
			return mx.__.estimateDerivative(exp, $$('x'), valueMap, 0.00001);
		};
		expect(mx.equal(derivative, $$(estimator), 0.001)).toBe(true);
	});

	it('should work for 1/sin(cos(x))', function() {
		var exp = mx.pow(mx.sin(mx.cos($$('x'))), -1);
		var derivative = exp.derivative('x');

		var estimator = function (valueMap) {
			return mx.__.estimateDerivative(exp, $$('x'), valueMap, 0.00001);
		};
		expect(mx.equal(derivative, $$(estimator), 0.001)).toBe(true);
	});

	it('should work for (sin(cos(x)))^2', function() {
		var exp = mx.pow(mx.sin(mx.cos($$('x'))), 2);
		var derivative = exp.derivative('x');

		var estimator = function (valueMap) {
			return mx.__.estimateDerivative(exp, $$('x'), valueMap, 0.00001);
		};
		expect(mx.equal(derivative, $$(estimator), 0.001)).toBe(true);
	});

	it('should work for x^-2', function() {
		var exp = mx.pow('x',-2);
		var derivative = exp.derivative('x');

		var estimator = function (valueMap) {
			return mx.__.estimateDerivative(exp, $$('x'), valueMap, 0.00001);
		};
		expect(mx.equal(derivative, $$(estimator), 0.1)).toBe(true);
	});

	it('should work for tan(cos(x))^-3', function() {
		var exp = mx.pow(mx.tan(mx.cos('x')),-3);
		var derivative = exp.derivative('x');

		var estimator = function (valueMap) {
			return mx.__.estimateDerivative(exp, $$('x'), valueMap, 0.00001);
		};
		expect(mx.equal(derivative, $$(estimator), 0.1)).toBe(true);
	});

});
