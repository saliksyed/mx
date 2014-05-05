describe('mx.symbol', function() {
	it('should return mx.symbol as classname', function() {
		expect(mx.symbol().className()).toBe('mx.symbol');
	});

	it('should return null as value', function() {
		expect(mx.symbol().value()).toBe(null);
	});

	it('should not be differentiable', function() {
		expect(mx.symbol().differentiate(null)).toThrow();
	});
});

describe('mx.constant', function() {

	it('should throw an exception if instantiated with a bad value', function() {
		expect(mx.constant()).toThrow();
		expect(mx.constant('hello')).toThrow();
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
		expect(mx.scalar()).toThrow();
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