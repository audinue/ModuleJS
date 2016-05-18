
# ModuleJS

Static module system for the browsers.

- Cleaner *subset* of ES6 syntax.
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

### No-Side Effects Import

For consistency.

```JavaScript
import 'foo.js';
```

### Default Import

```JavaScript
import foo from 'foo.js';
```

### Named Import

```JavaScript
import { foo, bar as baz } from 'qux.js';
```

### Default Export

```JavaScript
export default 'foo';
```

### Named Export

```JavaScript
export function foo() {}
export var bar = 'bar';
```

NOTE: Multiple variables initialization is *not* supported.

## Download

No dependencies required.

[module.js](https://github.com/audinue/ModuleJS/releases/download/1.0.0/module.js) (4.11KB)

[module.min.js](https://github.com/audinue/ModuleJS/releases/download/1.0.0/module.min.js) (2.10KB)
