
# ModuleJS Translation

## The Wrapper

Simple module wrapper:

```javascript
function (imports, exports) {
	// Module code here.
}
```

While `imports` is a function like this:
```javascript
function imports(id, exports) {
	// If exports is undefined then
	//     If the requested module is not initialized then
	//         Initialize the module exports object
	//         Call the module wrapper	
	//         For each identifier in requested module
	//             Bind function to window
	//     Return the module exports
	// Else
	//     For each identifier in requested module
	//         Assign the value to exports except 'default'
}
```

And `exports` is just a plain object.

## Translation

### Importing

#### No-Side Effects Import

```javascript
import 'foo.js';
// is translated to:
imports('foo.js');
```

#### Default Import
```javascript
import foo from 'foo.js';
// is translated to:
var foo = imports('foo.js').default;
```

#### Named Import
```javascript
import { foo as bar } from 'baz.js';
// is translated to:
var bar = imports('baz.js').foo;
```

#### Entire Module Import
```javascript
import * as foo from 'foo.js';
// is translated to:
var foo = imports('baz.js');
```

### Exporting

#### Default Export
```javascript
export default 'foo';
// is translated to:
exports.default = 'foo';
```

#### Named Export
```javascript
export function foo() {
}
// is translated to:
function foo() {
}
...
exports.foo = foo;
```

```javascript
export var bar = 'bar';
// is translated to:
var bar = 'bar';
...
exports.bar = bar;
```

```javascript
export { foo as bar }
// is translated to:
...
exports.bar = foo;
```

### Re-Exporting

#### Named Re-Export

```javascript
export { foo as bar } from 'baz.js';
// is translated to:
...
exports.bar = imports('baz.js').foo;
```

#### Entire Module Re-Export (except `default`)

```javascript
export * from 'foo.js';
// is translated to:
...
imports('foo.js', exports);
```
