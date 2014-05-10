## Math-X : A symbolic math library in Javascript

### Introduction

Math-X ('mx') is a javascript library that makes it easy to write down
simple symbolic expressions and compute derivatives over them. 

### Examples
Differentiate x*y with respect to x
```javascript
var d_dx_xy = $$('x').times('y').derivative('x');
console.log(d_dx_xy.toString());
```
```javascript
"y"
```

Differentiate sin(cos(x))
```javascript
var d = mx.sin(mx.cos('x')).derivative('x');
console.log(d.toString());
```
```javascript
"(cos(cos(x))) * ((-1) * (sin(x)))"
```

#### Cheat Sheet
* `$$(5)` : 5
* `$$('x')` : x
* `$$('x').add(5)` : x+5
* `$$('x').minus(5)` : x-5
* `$$('x').times(5)` : x*5
* `$$('x').dividedBy(5)` : x/5
* `$$('x').pow(5)` : x^5
* `$$('x').derivative('x')` : d/dx x
* `$$('y').minus(4).times($$('x').plus(5))` : (y-4) * (x+5)
* `mx.exp('x')` : e^x
* `mx.ln('x')` : ln(x)
* `mx.cos('x')` : cos(x)
* `mx.sin('x')` : sin(x)
* `mx.tan('x')` : tan(x)

### Background & Philosophy
I started Math-X out of frustrations from doing complex derivatives by hand when
attempting to implement machine learning code. 

Math-X functions are written with the goal of clarity rather than efficiency.
This is because the primary purpose of the library is analytical rather than computational (if you
are looking for a library to do fast vector math and operations then this is the wrong tool).

Math-X is aimed at computing symbolic expressions for derivatives and integrals over high dimensional vectors and matrices.
Once the correct mathematical expressions have been formulated within Math-X they should be used as a starting point to generate performance optimized code for actual evaluation.

The long-term vision for MX is to pair the  simple in-browser symbolic differentiation and integration tools with a GPU backed execution engine to enable fast implementations of mathematical code on the web.

Currently the initial library only supports scalar expressions but the next release
should add support for vector and matrix based operations and support for symbolic integration.

### Running Tests
You need jasmine and jasmine-node to run tests. From the mx directory run the following:
jasmine-node spec
