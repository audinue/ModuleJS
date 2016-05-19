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
			var imported = [];
			string = string
				.replace(
					/import\s+['"]([^'"]+)['"](\s*;)?/ig,
					function(all, source) {
						imported.push(IMPORTS + '("' + source + '");\n');
						return '';
					}
				)
				.replace(
					/import\s+\*\s+as\s+([a-z_$][a-z0-9_$]*)\s+from\s+['"]([^'"]+)['"](\s*;)?/ig,
					function(all, name, source) {
						imported.push('var ' + name + ' = ' + IMPORTS + '("' + source + '");\n');
						return '';
					}
				)
				.replace(
					/import\s+([a-z_$][a-z0-9_$]*)\s+from\s+['"]([^'"]+)['"](\s*;)?/ig,
					function(all, name, source) {
						imported.push('var ' + name + ' = ' + IMPORTS + '("' + source + '").default;\n');
						return '';
					}
				)
				.replace(
					/import\s+\{([^\}]+)\}\s+from\s+['"]([^'"]+)['"](\s*;)?/g,
					function(all, names, source) {
						names.split(/,/).map(function(name) {
							return name.replace(
								/\s*([a-z_$][a-z0-9_$]*)(?:\s+as\s+([a-z_$][a-z0-9_$]*))?/ig,
								function(all, name, alias) {
									imported.push('var ' + (alias || name) + ' = ' + IMPORTS + '("' + source + '").' + name + ';\n');
								}
							);
						});
						return '';
					}
				);
			var exported = [];
			string = string
				.replace(
					/export\s+default\s+/ig,
					function() {
						return EXPORTS + '.default = ';
					}
				)
				.replace(
					/export\s+((?:var|function)\s+([a-z_$][a-z0-9_$]*))/ig,
					function(all, rest, name) {
						exported.push(EXPORTS + '.' + name + ' = ' + name + ';\n');
						return rest;
					}
				)
				.replace(
					/export\s+\{([^\}]+)\}\s+from\s+['"]([^'"]+)['"](\s*;)?/g,
					function(all, names, source) {
						names.split(/,/).forEach(function(name) {
							name.replace(
								/\s*([a-z_$][a-z0-9_$]*)(?:\s+as\s+([a-z_$][a-z0-9_$]*))?/ig,
								function(all, name, alias) {
									exported.push(EXPORTS + '.' + (alias || name) + ' = ' + IMPORTS + '("' + source + '").' + name + ';\n');
								}
							);
						});
						return '';
					}
				)
				.replace(
					/export\s+\{([^\}]+)\}(\s*;)?/g,
					function(all, names) {
						names.split(/,/).forEach(function(name) {
							name.replace(
								/\s*([a-z_$][a-z0-9_$]*)(?:\s+as\s+([a-z_$][a-z0-9_$]*))?/ig,
								function(all, name, alias) {
									exported.push(EXPORTS + '.' + (alias || name) + ' = ' + name + ';\n');
								}
							);
						});
						return '';
					}
				)
				.replace(
					/export\s+\*\s+from\s+['"]([^'"]+)['"](\s*;)?/ig,
					function(all, source) {
						exported.push(IMPORTS + '("' + source + '", ' + EXPORTS + ');\n');
						return '';
					}
				);
			var statement;
			while(statement = imported.pop()) {
				string = statement + string;
			}
			while(statement = exported.shift()) {
				string = string + statement;
			}
			var children  = [];
			var directory = id.replace(/[^\/]+$/, '');
			string = string
				.replace(new RegExp(IMPORTS + '\\("([^"]+)"', 'g'), function(all, child) {
					child = normalize(directory + child);
					children.push(child);
					return IMPORTS + '("' + child + '"';
				})
				+ '\n//# sourceURL=' + id;
			var loaded = function() {
				isLoaded = true;
				new Function(IMPORTS, EXPORTS, string)(imports, module.exports);
				for(var i in module.exports) {
					if(typeof module.exports[i] == 'function') {
						module.exports[i].bind(window);
					}
				}
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

	function imports(id, exports) {
		if(exports === undefined) {
			return modules[id].exports;
		}
		var imported = imports(id);
		for(var member in imported) {
			if(member == 'default') {
				continue;
			}
			exports[member] = imported[member];
		}
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
		loadString(location.href + ' (contained)', script.textContent, noop);
	}

	var DOM_CONTENT_LOADED = 'DOMContentLoaded';

	function domContentLoaded() {
		document.removeEventListener(DOM_CONTENT_LOADED, domContentLoaded, false);
		var scripts = document.querySelectorAll('script[type=module]');
		for(var i = 0, length = scripts.length; i < length; i++) {
			loadString(location.href + ' (inline-' + (i + 1) + ')', scripts[i].textContent, noop);
		}
	}

	document.addEventListener(DOM_CONTENT_LOADED, domContentLoaded, false);

}(document));
