var mx = require("../mx.js");

describe('mx.nn.softmax', function() {

	it('should return the right values', function() {
		var vec = mx.matrix(2,1);
        var mat = mx.nn.softmax(mx.matrix(1,2).named('x')).value({'x_0_0' : 3, 'x_0_1' : 5});

        expect(mat.get(0,0)).toBe(3/8);
        expect(mat.get(0,1)).toBe(5/8);
	});

});
