var mx = require("../mx.js");
global.$$ = mx.$$;

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
		expect(mx.equal(mx.tan($$('x')).derivative('x'), $$(2).dividedBy(mx.cos($$(2).times('x')).plus(1)), 0.000001)).toBe(true);
	});

});
	

describe('mx.pow', function() {
	
	it('should return 1 if the power is 0', function() {

	});

	it('should return the same expression if power is 1', function() {

	});


	it('should return a number if base is constant', function() {

	});

	it('should fail if the exponent is not a number', function() {

	});

	it('should give the correct derivative for x^3', function() {

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
	
	it('should return 1 if the power is 0', function() {

	});

	it('should return the same expression if power is 1', function() {

	});


	it('should return a number if base is constant', function() {

	});

	it('should fail if the exponent is not a number', function() {

	});

	it('should give the correct derivative for x^3', function() {

	});
});


// TODO: mx.__.estimateDerivative 

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
		expect(mx.cos($$(2).times('x')).derivative('x').value({'x' : Math.PI/2})).toEqual(-2);
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

});
