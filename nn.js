
mx.nn = {};

mx.nn.softmax = function(vec) {
	var that = mx.matrix(vec.dim(0), vec.dim(1));
	
	that.value = function(valueMap) {
		var total = 0;

		vec.map(function(d, i, j) {
			total += d.value(valueMap);
		});

		return vec.apply(function(d, i, j) {
			return d.value(valueMap) / total;
		});
	};
};

mx.nn.argmax = function(vec) {
	var that = mx.symbol();

	that.value = function(valueMap) {
		var evaluated = vec.apply(function(d, i, j) {
			return d.value(valueMap) / total;
		});

		var variables = Object.keys(evaluated.args);
		
		var max;
		var argmax;
		for (var i = 0; i < variables.length; i++) {
			if (max === undefined || evaluated.args[variables[i]] > max ) {
				argmax = variables[i];
			}
		}
		return argmax;
	};

	return that;
};