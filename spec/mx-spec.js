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

describe('mx.multiply', function() {

	it('should throw an exception if instantiated without values', function() {
		var test1 = function() {
			return mx.multiply();
		};

		expect(test1).toThrow();
	});

	it('should optimize away 0 multiplications', function() {
		expect(mx.multiply(mx.constant(0), mx.scalar('y')).className()).toBe('mx.constant');
		expect(mx.multiply(mx.constant(0), mx.scalar('y')).value()).toBe(0);
	});

	it('should optimize away 1 multiplications', function() {
		expect(mx.multiply(mx.constant(1), mx.scalar('y')).className()).toBe('mx.scalar');
	});

	it('should optimize away 1 multiplications', function() {
		expect(mx.multiply(mx.scalar('y'), mx.constant(1)).className()).toBe('mx.scalar');
	});

	it('should return mx.multiply as classname when multiplying scalars', function() {
		expect(mx.multiply(mx.scalar('x'), mx.scalar('y')).className()).toBe('mx.multiply');
	});


	it('should differentiate correctly', function() {
		var x = mx.scalar('x');
		var y = mx.scalar('y');

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
		expect(mx.add(mx.constant(0), mx.scalar('y')).className()).toBe('mx.scalar');
		expect(mx.add(mx.constant(0), mx.scalar('y')).name()).toBe('y');
	});


	it('should return mx.add as classname when adding scalars', function() {
		expect(mx.add(mx.scalar('x'), mx.scalar('y')).className()).toBe('mx.add');
	});

	it('should differentiate correctly', function() {
		var x = mx.scalar('x');
		var y = mx.scalar('y');

		var xplusy = mx.add(x,y);

		var d_dx_xplusy = xplusy.differentiate(x);
		var d_dy_xplusy = xplusy.differentiate(y);
		
		expect(d_dx_xplusy.value()).toBe(1);
		expect(d_dy_xplusy.value()).toBe(1);
	});

	it('should differentiate correctly', function() {
		var x = mx.scalar('x');

		var xplusx = mx.add(x,x);

		var d_dx_xplusx= xplusx.differentiate(x);

		expect(d_dx_xplusx.value()).toBe(2);
	});
});



describe('simple derivatives', function() {

	it('should work for 5*x+3', function() {
		var x = mx.scalar('x');
		var five = mx.constant(5);
		var three = mx.constant(3);

		var fivexplus3 = mx.add(mx.multiply(five,x), three);
		
		expect(fivexplus3.differentiate(x).value()).toBe(5);
	});

	it('should work for 5*x+3*x', function() {
		var x = mx.scalar('x');
		var five = mx.constant(5);
		var three = mx.constant(3);

		var fivexplus3 = mx.add(mx.multiply(five,x), mx.multiply(three,x));
		
		expect(fivexplus3.differentiate(x).value()).toBe(8);
	});

	it('should work for x+x+x+x', function() {
		var x = mx.scalar('x');
		var fourx = mx.add(x,mx.add(x,mx.add(x,x)));
		expect(fourx.differentiate(x).value()).toBe(4);
	});

	it('should work for x*x', function() {
		var x = mx.scalar('x');
		var xtimesx = mx.multiply(x,x);
		expect(xtimesx.differentiate(x)).toBe(mx.add(x,x));
	});

});
