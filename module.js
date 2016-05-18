/**
 * ModuleJS - https://github.com/audinue/ModuleJS
 * @author Audi Nugraha <audinue@gmail.com>
 * @license MIT
 * @preserve
 */
(function(document) {

	var IMPORTS = 'imports';
	var EXPORTS = 'exports';

	function normalize(path) {
		var a = document.createElement('a');
		a.href = path;
		return a.href;
	}

	function Module() {

		var module    = this;
		var isLoaded  = false;
		var callbacks = [];

		module.exports = {};

		module.addCallback = function(callback) {
			if(isLoaded) {
				callback();
			} else {
				callbacks.push(callback);
			}
			return module;
		};

		module.loadString = function(id, string) {
			var children  = [];
			var directory = id.replace(/[^\/]+$/, '');
			string = string
				.replace(
					/import\s+['"]([^'"]+)['"]/ig,
					function(all, source) {
						return IMPORTS + '("' + source + '")';
					}
				)
				.replace(
					/import\s+([a-z_$][a-z0-9_$]*)\s+from\s+['"]([^'"]+)['"]/ig,
					function(all, name, source) {
						return 'var ' + name + ' = ' + IMPORTS + '("' + source + '").default';
					}
				)
				.replace(
					/import\s+\{([^\}]+)\}\s+from\s+['"]([^'"]+)['"]/g,
					function(all, names, source) {
						return names.split(/,/).map(function(name) {
							return name.replace(
								/\s*([a-z_$][a-z0-9_$]*)(?:\s+as\s+([a-z_$][a-z0-9_$]*))?/ig,
								function(all, name, alias) {
									return 'var ' + (alias || name) + ' = ' + IMPORTS + '("' + source + '").' + name;
								}
							);
						}).join('');
					}
				)
				.replace(
					/export\s+default\s+/ig,
					function() {
						return EXPORTS + '.default = ';
					}
				)
				.replace(
					/export\s+(?!default)(var|function)\s+([a-z_$][a-z0-9_$]*)/ig,
					function(all, type, name) {
						return EXPORTS + '.' + name + (type == 'function' ? ' = function' : '');
					}
				)
				.replace(new RegExp(IMPORTS + '\\("([^"]+)"\\)', 'g'), function(all, child) {
					child = normalize(directory + child);
					children.push(child);
					return IMPORTS + '("' + child + '")';
				})
				+ '\n//# sourceURL=' + id;
			var loaded = function() {
				isLoaded = true;
				new Function(IMPORTS, EXPORTS, string)(imports, module.exports);
				var callback;
				while(callback = callbacks.shift()) {
					callback();
				}
			};
			var required = children.length;
			if(!required) {
				setTimeout(loaded);
			} else {
				for(var child; child = children.shift(); ) {
					loadFile(child, function() {
						if(!--required) {
							loaded();
						}
					});
				}
			}
		};

		module.loadFile = function(id) {
			var xhr = new XMLHttpRequest();
			xhr.onload = function() {
				if(xhr.status == 200) {
					module.loadString(id, xhr.responseText);
				}
			};
			xhr.overrideMimeType('text/plain');
			xhr.open('GET', id, true);
			xhr.send();
			return module;
		};
	}

	var modules = [];

	function imports(id) {
		return modules[id].exports;
	}

	function loadString(id, string, callback) {
		id = normalize(id);
		if(id in modules) {
			throw new Error();
		}
		modules[id] = new Module()
			.addCallback(callback)
			.loadString(id, string);
	}

	function loadFile(id, callback) {
		id = normalize(id);
		if(id in modules) {
			modules[id].addCallback(callback);
		} else {
			modules[id] = new Module()
				.addCallback(callback)
				.loadFile(id);
		}
	}

	var script = document.currentScript;

	function noop() {
		;
	}

	var DATA_MAIN = 'data-main';

	if(script.hasAttribute(DATA_MAIN)) {
		loadFile(script.getAttribute(DATA_MAIN), noop);
	}

	if(script.textContent) {
		loadString(location.href + '-contained', script.textContent, noop);
	}

	var DOM_CONTENT_LOADED = 'DOMContentLoaded';

	function domContentLoaded() {
		document.removeEventListener(DOM_CONTENT_LOADED, domContentLoaded, false);
		var scripts = document.querySelectorAll('script[type=module]');
		for(var i = 0, length = scripts.length; i < length; i++) {
			loadString(location.href + '-inline-' + (i + 1), scripts[i].textContent, noop);
		}
	}

	document.addEventListener(DOM_CONTENT_LOADED, domContentLoaded, false);

}(document));

