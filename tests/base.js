describe("mx.symbol", function() {
	it("should return mx.symbol as classname", function() {
		expect(mx.symbol.className()).toBe("mx.symbol");
	});

	it("should return null as value", function() {
		expect(mx.symbol.value()).toBe(null);
	});

	it("should not be differentiable", function() {
		expect(mx.symbol.differentiate(null)).toThrow();
	});
});

describe("mx.constant", function() {
	it("should return the proper value", function() {
		expect(mx.constant(5).value()).toBe(5);
	});

	it("should return 0 as derivative", function() {
		expect(mx.constant(5).differentiate(null).value()).toBe(0);
	});
});


describe("mx.constant", function() {
	it("should return the proper value", function() {
		expect(mx.constant(5).value()).toBe(5);
	});

	it("should return 0 as derivative", function() {
		expect(mx.constant(5).differentiate(null).value()).toBe(0);
	});
});