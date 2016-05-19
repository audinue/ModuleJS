
# ModuleJS

Static module system for the browsers.

- Cleaner ES2015 syntax.
- No build step required.
- It is just the module system, nothing more.

## Example

```JavaScript
// bar.js
export default 'bar'; // A default export.
```

```JavaScript
// foo.js
import bar from 'bar.js'; // A default import.
export function foo() {   // A named export.
	alert(bar);
}
```

```HTML
<!-- index.html -->
<script src="module.js">
import { foo } from 'foo.js'; // A named import.
foo();
</script>
```

## Usage

### Contained

```HTML
<script src="module.js">
import foo from 'foo.js';
</script>
```

### Inline
```HTML
<script src="module.js"></script>

<script type="module">
import foo from 'foo.js';
</script>
```

### Data Main
```HTML
<script src="module.js" data-main="foo.js"></script>
```

## Supported Syntax

### Importing

#### No-Side Effects Import

```JavaScript
import 'foo.js';
```

#### Default Import

```JavaScript
import foo from 'foo.js';
```

#### Named Import

```JavaScript
import { foo, bar as baz } from 'qux.js';
```

#### Entire Module Import

```JavaScript
import * as foo from 'foo.js';
```

### Exporting

#### Default Export

```JavaScript
export default 'foo';
```

#### Named Export

```JavaScript
export function foo() {}
export var bar = 'bar';
function baz() {
	console.log('baz');
}
export { baz as qux }
```

NOTE: Multiple variables initialization (`export var foo = 1, bar = 2, ...;`) is *not* supported.

### Re-Exporting

#### Named Re-Export

```JavaScript
export { foo as bar } from 'baz.js';
```

#### Entire Module Re-Export (re-export all members except `default`)

```JavaScript
export * from 'foo.js';
```

## Download

No dependencies required.

[module.js](https://github.com/audinue/ModuleJS/releases/download/1.1.0/module.js) (6.12KB)

[module.min.js](https://github.com/audinue/ModuleJS/releases/download/1.1.0/module.min.js) (3.11KB)

## Implementation

See [TRANSLATION.md](https://github.com/audinue/ModuleJS/blob/master/TRANSLATION.md)
