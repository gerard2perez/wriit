(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*global document,$,Many,MultiAttr,MultiClass*/
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _tags = require('./tags');

function makeChildSiblings(node) {
	var parent = node.parentNode;
	while (node.childNodes.length > 0) {
		parent.insertBefore(node.childNodes[0], node);
	}
}

var _default = (function () {
	function _default(editor) {
		_classCallCheck(this, _default);

		this.Editor = editor;
		this.Tag = {};
		this.BeforeFormat = undefined;
		this.AfterFormat = undefined;
		this.TearDown = undefined;
		this.Setup = undefined;
	}

	_createClass(_default, [{
		key: 'IMany',
		value: function IMany(textarea) {
			var selection = this.Selection;
			var visual = this.Visual;
			var node = visual.commonAncestorContainer;
			if (node.nodeType !== 1) {
				node = node.parentNode;
			}
			if (selection.isSorrounded) {
				for (var t in this.Tag.Parent.children) {
					var tag = this.Tag.Parent.children[t];
					this.Editor.button(tag.Id).classList.remove('active');
				}
				while (node.tagName.toLowerCase() !== this.Tag.TagName.toLowerCase()) {
					node = node.parentNode;
				}
				if (this.Tag.isCompatible(node)) {
					for (var attr in this.Tag.Attr) {
						this.Tag.UpdateAttributes(node);
						//node.setAttribute(attr, this.Tag.Attr[attr]);
					}
					this.Editor.button(this.Tag.Id).classList.add('active');
				}
			} else if (!(this.Tag.Parent instanceof MultiClass)) {
				var newel = this.Tag['new']();
				newel.appendChild(visual.extractContents());
				visual.insertNode(newel);
				textarea.normalize();
			}
			document.getSelection().removeAllRanges();
			document.getSelection().addRange(visual);
		}
	}, {
		key: 'ISingle',
		value: function ISingle(textarea) {
			var _this = this;

			var selection = this.Selection;
			var visual = this.Visual;
			if (visual.collapsed && selection.isSorrounded) {
				var oldnode = visual.startContainer.parentNode;
				while (!this.Tag.isInstance(oldnode)) {
					oldnode = oldnode.parentNode;
				}
				makeChildSiblings(oldnode);
				oldnode.remove();
			} else {
				(function () {
					var newel = _this.Tag['new']();
					newel.appendChild(visual.extractContents());
					visual.insertNode(newel);
					if (_this.Tag.isInstance(newel.nextSibling)) {
						var sibling = newel.nextSibling;
						Array.prototype.forEach.call(sibling.childNodes, function (innerchild) {
							newel.appendChild(innerchild);
						});
						sibling.remove();
					}
					if (_this.Tag.isInstance(newel.previousSibling)) {
						var sibling = newel.previousSibling;
						Array.prototype.forEach.call(sibling.childNodes, function (innerchild) {
							newel.insertBefore(innerchild, newel.firstChild);
						});
						sibling.remove();
					}
					if (selection.isContained + selection.isOpened + selection.isClosed) {
						var cleannode = visual.extractContents().firstChild;
						var inner = cleannode.querySelectorAll(_this.Tag.TagName);
						for (var i = 0; i < inner.length; i++) {
							makeChildSiblings(inner[i]);
							inner[i].remove();
						}
						visual.insertNode(newel);
					}
				})();
			}
			textarea.parentNode.querySelectorAll("[data-wriit-commandId=" + this.Tag.Id + "]")[0].classList.toggle('active');
			textarea.normalize();
			document.getSelection().removeAllRanges();
			document.getSelection().addRange(visual);
		}
	}, {
		key: 'Insert',
		value: function Insert(e, textarea) {
			if (this.Tag instanceof _tags.Single) {
				this.ISingle.apply(this, [textarea]);
			} else if (this.Tag instanceof Many) {
				this.IMany.apply(this, [textarea]);
			}
		}
	}, {
		key: 'Callback',
		value: function Callback(tag, fn) {
			var apply = function apply(tag) {
				var button = this.Editor.buttons[tag.Id];
				var mod = this;
				button.addEventListener('click', function (e, routedevent) {
					mod.Tag = tag;
					this.event = routedevent || e;
					if (this.BeforeFormat !== undefined) {
						mod.BeforeFormat.apply(mod, [routedevent || e]);
					}
					var res = fn.apply(mod, [routedevent || e, mod.Editor.textarea.get(0)]);
					if (this.AfterFormat !== undefined) {
						this.AfterFormat.apply(mod, [routedevent || e]);
					}
					return res;
				});
				if (!!tag.Shortcut) {
					this.Editor.textarea.keys.bind(tag.Shortcut, function (e) {
						$(button).trigger('click', e);
						return false;
					});
				}
			};
			if (tag instanceof _tags.Single) {
				apply.apply(this, [tag]);
			} else if (tag instanceof MultiClass) {
				for (var i in tag.children) {
					apply.apply(this, [tag.children[i]]);
				}
			} else if (tag instanceof MultiAttr) {
				for (var i in tag.children) {
					apply.apply(this, [tag.children[i]]);
				}
			}
		}
	}, {
		key: 'Selection',
		get: function get() {
			return this.Tag.SuperId !== undefined ? this.Editor.Modules[this.Tag.SuperId] : this.Editor.Modules[this.Tag.Id];
		}
	}, {
		key: 'Visual',
		get: function get() {
			return this.Editor.html.getSelection(0).visual;
		}
	}]);

	return _default;
})();

exports['default'] = _default;
module.exports = exports['default'];

},{"./tags":13}],2:[function(require,module,exports){
/*global $,jQuery*/
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
function taglength(node, full) {
	"use strict";
	var otext = node.wholeText !== undefined ? node.wholeText : node.outerHTML;
	var itext = node.innerHTML !== undefined ? node.innerHTML : node.innerText;
	var l = otext.indexOf(itext);
	if (otext.indexOf(itext) !== otext.lastIndexOf(itext)) {
		l = otext.indexOf(itext, itext.length);
	}
	return full ? otext.length : l === -1 ? otext.length : l;
}

function dedeep(parent, common, node, offset) {
	"use strict";
	var text = node.wholeText !== undefined ? node.wholeText : node.outerHTML;
	var end = -text.substring(offset, text.length).length;
	do {
		var prevnode = node.previousSibling;
		var all = false;
		do {
			end += taglength(node, all);
			prevnode = node.previousSibling;
			all = prevnode ? prevnode.nodeType == 1 : false;
			if (prevnode) {
				node = prevnode;
			}
		} while (prevnode !== null);
		if (node.parentNode != parent) {
			node = node.parentNode;
		} else {
			end -= taglength(node);
		}
	} while (node.parentNode != parent && node != parent);
	end += taglength(node);
	node = node.previousSibling;
	while (node) {
		var otext = node.wholeText !== undefined ? node.wholeText : node.outerHTML;
		end += otext.length;
		node = node.previousSibling;
	}
	return end;
}

function textarea(parent, opts) {
	"use strict";
	var carea = $('<div class="itextarea-cords"/>');
	if (opts.coord) {
		carea.insertAfter(parent);
	}
	$(parent).bind('keyup mouseup', function (ev) {
		var ini = window.performance.now();
		var ranges = [];
		var selection = window.getSelection();
		for (var i = 0; i < selection.rangeCount; i++) {
			var range = selection.getRangeAt(i);
			ranges.push({
				start: dedeep(parent, range.commonAncestorContainer, range.startContainer, range.startOffset),
				end: dedeep(parent, range.commonAncestorContainer, range.endContainer, range.endOffset),
				rang: range
			});
		}
		$(parent).data('rang', ranges);
		var end = window.performance.now();
		if (opts.performace) {
			console.log("iTextArea analysis:", end - ini, 'ms');
		}
		if (opts.coord) {
			carea.html(ranges[0].start + "," + ranges[0].end);
		}
		if (opts.debug) {
			carea.append('<textarea style="width:600px;display:block;">' + parent.innerHTML.substring(0, ranges[0].start) + '</textarea>');
			carea.append('<textarea style="width:600px;display:block;">' + parent.innerHTML.substring(ranges[0].start, ranges[0].end) + '</textarea>');
			carea.append('<textarea style="width:600px;display:block;">' + parent.innerHTML.substring(ranges[0].end, $(parent).html().length) + '</textarea>');
		}
	});
}

exports["default"] = (function ($) {
	$.fn.toTextArea = function (cfg) {
		cfg = $.extend({}, {
			coord: false,
			performace: false,
			debug: false
		}, cfg);
		$(this).attr('contenteditable', true);
		$(this).each(function () {
			new textarea(this, cfg);
			return $(this);
		});
	};
	$.fn.getSelection = function (n) {
		if ($(this).data('rang')) {
			return $(this).data('rang')[n];
		}
	};
	Object.defineProperty($.fn, "selection", {
		get: function get() {
			return $(this).data('rang')[0];
		}
	});
})(jQuery);

module.exports = exports["default"];

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});
var keys = {
	"8": "CARRY",
	"13": "ENTER",
	"16": "SHIFT",
	"17": "CTRL",
	"18": "ALT",
	"27": "ESC",
	"37": "LEFT",
	"38": "UP",
	"39": "RIGTH",
	"40": "DOWN",
	"91": "CMD"
};
for (var i = 112; i < 112 + 12; i++) {
	keys[i.toString()] = "F" + (i - 111);
}
var routekey = {
	"CTRL": "CMD",
	"CMD": "CTRL"
};
var KeyHandler = function KeyHandler(el, settings) {
	el.data('events', {});
	el.bind("keydown", function (e, routedevent) {
		e = routedevent || e;
		var currkeys = el.data('keys') || {};
		var currkey = keys[e.which.toString()] || String.fromCharCode(e.which) || e.which || false;
		currkeys[currkey] = currkey;
		el.data('keys', currkeys);
		var trigger = [];
		for (var i in currkeys) {
			trigger.push(currkeys[i]);
		}
		trigger = trigger.join('+');
		trigger = el.data('events')[trigger];
		if (!!trigger) {
			e.preventDefault();
			if (!trigger(e)) {
				e.stopImmediatePropagation();
				e.stopPropagation();
				return false;
			}
			return true;
		}
	}).bind("keyup", function (e, routedevent) {
		if (!e.which) {
			el.data('keys', {});
		} else {
			e = routedevent || e;
			var currkeys = el.data('keys') || [];
			var currkey = keys[e.which.toString()] || String.fromCharCode(e.which) || e.which || false;
			delete currkeys[currkey];
			el.data('keys', currkeys);
			switch (currkey) {
				case "CTRL":case "CMD":
					el.data('keys', []);
					break;
			}
		}
	}).bind('blur', function (e) {
		el.data('keys', {});
	});
	return el;
};

exports["default"] = (function ($) {
	$.fn.KeyHandler = function (settings) {
		var config = {
			ESC: false,
			ENTER: false
		};
		config = $.extend({}, config, settings);
		$(this).each(function () {
			return new KeyHandler($(this), settings);
		});
	};
	Object.defineProperty($.fn, "keypressed", {
		get: function get() {
			return $(this).data('keys');
		}
	});
	Object.defineProperty($.fn, "keys", {
		get: function get() {
			var that = this;
			return {
				bind: function bind(keysequence, fn) {
					keysequence = keysequence.toUpperCase();
					that.data('events')[keysequence] = fn;
					var cmds = keysequence.split('+');
					for (var i in cmds) {
						if (!!routekey[cmds[i]]) {
							cmds[i] = routekey[cmds[i]];
							that.data('events')[cmds.join('+')] = fn;
						}
					}
				}
			};
		}
	});
})(jQuery);

module.exports = exports["default"];

},{}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _tags = require('../tags');

exports["default"] = {
	Setup: function Setup(toolbar) {
		var bold = new _tags.Single("bold", "strong", {
			tooltip: "Bold",
			iconclass: "fa fa-bold",
			shortcut: "CMD+SHIFT+B"
		});
		toolbar.AddButton(bold);
		this.Callback(bold, this.Insert);
	}
};
module.exports = exports["default"];

},{"../tags":13}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _tags = require('../tags');

exports['default'] = {
	Setup: function Setup(toolbar) {
		var tag = new _tags.StyleTag('forecolor');
		var prop = tag.newProperty("color");
		tag.Add(prop.KeyValue('#FF0000', 'red'));
		var fmulti = new _tags.StyleAttr('forecolor', "span", c);
		fmulti.Add('red', c.apply('#00FF00'), {
			displayclass: "fa fa-font"
		}, true);
		toolbar.AddButton(fmulti);
		this.Callback(fmulti, this.Insert);
	}
};
module.exports = exports['default'];

},{"../tags":13}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequire(obj) { return obj && obj.__esModule ? obj['default'] : obj; }

var _forecolor = require('./forecolor');

exports.forecolor = _interopRequire(_forecolor);

var _bold = require('./bold');

exports.bold = _interopRequire(_bold);

},{"./bold":4,"./forecolor":5}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _default = (function () {
	function _default(gen, property) {
		_classCallCheck(this, _default);

		this.gen = gen;
		this.property = property;
	}

	_createClass(_default, [{
		key: "KeyValue",
		value: function KeyValue(value, label) {
			return new this.gen(this.property, value);
		}
	}]);

	return _default;
})();

exports["default"] = _default;
module.exports = exports["default"];

},{}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _default = (function () {
	function _default(id, tag, attributes, highlight) {
		_classCallCheck(this, _default);

		this.Id = id;
		this.highlight = true;
		this.TagName = tag;
		this.Attributes = [];
		this.Shortcut = attributes.shortcut || null;
		this.ToolTip = attributes.tooltip || null;
		this.IconClass = attributes.iconclass || null;
	}

	_createClass(_default, [{
		key: "isCompatible",
		value: function isCompatible(htmlnode) {
			if (htmlnode.nodeType !== 1 || htmlnode.tagName.toLowerCase() !== this.TagName.toLowerCase()) {
				return false;
			}
			return true;
		}
	}, {
		key: "isInstance",
		value: function isInstance(htmlnode) {
			if (!this.isCompatible(htmlnode)) {
				return false;
			}
			for (var attr in this.Attr) {
				var atribute = this.Attr[attr];
				if (atribute instanceof StyleAttr) {
					if (htmlnode.style[atribute.attr] === "") {
						return false;
					}
				} else if (atribute instanceof GeneralAttr) {
					if (htmlnode.attributes[attr].value !== this.Attr[attr]) return false;
				} else if (atribute instanceof ClassAttr) {
					if (htmlnode.classList) {
						return false;
					}
				}
			}
			return true;
		}
	}, {
		key: "new",
		value: function _new() {
			var el = document.createElement(this.TagName);
			//this.UpdateAttributes(el);
			return el;
		}
	}]);

	return _default;
})();

exports["default"] = _default;
module.exports = exports["default"];

},{}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _default = function _default(attr, value) {
	_classCallCheck(this, _default);

	this.attr = attr;
	this.value = value;
};

exports["default"] = _default;
module.exports = exports["default"];

},{}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _Base2 = require('./Base');

var _Base3 = _interopRequireDefault(_Base2);

var Single = (function (_Base) {
	_inherits(Single, _Base);

	function Single(id, tag, options) {
		_classCallCheck(this, Single);

		_get(Object.getPrototypeOf(Single.prototype), 'constructor', this).call(this, id, tag, options, false);
	}

	return Single;
})(_Base3['default']);

exports['default'] = Single;
module.exports = exports['default'];

},{"./Base":8}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _BaseAttribute2 = require('./BaseAttribute');

var _BaseAttribute3 = _interopRequireDefault(_BaseAttribute2);

var StyleAttr = (function (_BaseAttribute) {
	_inherits(StyleAttr, _BaseAttribute);

	function StyleAttr(attr, value) {
		_classCallCheck(this, StyleAttr);

		_get(Object.getPrototypeOf(StyleAttr.prototype), 'constructor', this).call(this, attr, value);
	}

	return StyleAttr;
})(_BaseAttribute3['default']);

exports['default'] = StyleAttr;
module.exports = exports['default'];

},{"./BaseAttribute":9}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _Base2 = require('./Base');

var _Base3 = _interopRequireDefault(_Base2);

var _AttributeGenerator = require('./AttributeGenerator');

var _AttributeGenerator2 = _interopRequireDefault(_AttributeGenerator);

var StyleTag = (function (_Base) {
	_inherits(StyleTag, _Base);

	function StyleTag() {
		_classCallCheck(this, StyleTag);

		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		_get(Object.getPrototypeOf(StyleTag.prototype), 'constructor', this).apply(this, args);
	}

	_createClass(StyleTag, [{
		key: 'newProperty',
		value: function newProperty(property) {
			return new _AttributeGenerator2['default'](StyleAttr, property);
		}
	}, {
		key: 'Add',
		value: function Add(attribute) {
			this.Attributes[attribute.attr] = attribute;
		}
	}]);

	return StyleTag;
})(_Base3['default']);

exports['default'] = StyleTag;
module.exports = exports['default'];

},{"./AttributeGenerator":7,"./Base":8}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequire(obj) { return obj && obj.__esModule ? obj['default'] : obj; }

var _Single = require('./Single');

exports.Single = _interopRequire(_Single);

var _StyleTag = require('./StyleTag');

exports.StyleTag = _interopRequire(_StyleTag);

var _StyleAttr = require('./StyleAttr');

exports.StyleAttr = _interopRequire(_StyleAttr);

},{"./Single":10,"./StyleAttr":11,"./StyleTag":12}],14:[function(require,module,exports){
/*global document,window,$,console,setInterval,Basic,Many,Single,MultiAttr,MultiClass,WriitStyle,regexp,StyleTag*/
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _wriitTags = require('./wriit-tags');

function makeChildSiblings(node) {
	var parent = node.parentNode;
	while (node.childNodes.length > 0) {
		parent.insertBefore(node.childNodes[0], node);
	}
}
var Module = function Module(that) {
	var mod = this;
	this.Tag = null;
	this.visual = null;
	this.Editor = that;
	Object.defineProperty(this, "Selection", {
		get: function get() {
			return mod.Tag.SuperId !== undefined ? that.Modules[mod.Tag.SuperId] : that.Modules[mod.Tag.Id];
		}
	});
	Object.defineProperty(this, "Visual", {
		get: function get() {
			return that.html.getSelection(0).visual;
		}
	});
};
Module.prototype = {
	Editor: undefined,
	TearDown: undefined,
	IMany: function IMany(textarea) {
		var selection = this.Selection;
		var visual = this.Visual;
		var node = visual.commonAncestorContainer;
		if (node.nodeType !== 1) {
			node = node.parentNode;
		}
		if (selection.isSorrounded) {
			for (var t in this.Tag.Parent.children) {
				var tag = this.Tag.Parent.children[t];
				this.Editor.button(tag.Id).classList.remove('active');
			}
			while (node.tagName.toLowerCase() !== this.Tag.TagName.toLowerCase()) {
				node = node.parentNode;
			}
			if (this.Tag.isCompatible(node)) {
				for (var attr in this.Tag.Attr) {
					this.Tag.UpdateAttributes(node);
					//node.setAttribute(attr, this.Tag.Attr[attr]);
				}
				this.Editor.button(this.Tag.Id).classList.add('active');
			}
		} else if (!(this.Tag.Parent instanceof MultiClass)) {
			var newel = this.Tag["new"]();
			newel.appendChild(visual.extractContents());
			visual.insertNode(newel);
			textarea.normalize();
		}
		document.getSelection().removeAllRanges();
		document.getSelection().addRange(visual);
	},
	ISingle: function ISingle(textarea) {
		var _this = this;

		var selection = this.Selection;
		var visual = this.Visual;
		if (visual.collapsed && selection.isSorrounded) {
			var oldnode = visual.startContainer.parentNode;
			while (!this.Tag.isInstance(oldnode)) {
				oldnode = oldnode.parentNode;
			}
			makeChildSiblings(oldnode);
			oldnode.remove();
		} else {
			(function () {
				var newel = _this.Tag["new"]();
				newel.appendChild(visual.extractContents());
				visual.insertNode(newel);
				if (_this.Tag.isInstance(newel.nextSibling)) {
					var sibling = newel.nextSibling;
					Array.prototype.forEach.call(sibling.childNodes, function (innerchild) {
						newel.appendChild(innerchild);
					});
					sibling.remove();
				}
				if (_this.Tag.isInstance(newel.previousSibling)) {
					var sibling = newel.previousSibling;
					Array.prototype.forEach.call(sibling.childNodes, function (innerchild) {
						newel.insertBefore(innerchild, newel.firstChild);
					});
					sibling.remove();
				}
				if (selection.isContained + selection.isOpened + selection.isClosed) {
					var cleannode = visual.extractContents().firstChild;
					var inner = cleannode.querySelectorAll(_this.Tag.TagName);
					for (var i = 0; i < inner.length; i++) {
						makeChildSiblings(inner[i]);
						inner[i].remove();
					}
					visual.insertNode(newel);
				}
			})();
		}
		textarea.parentNode.querySelectorAll("[data-wriit-commandId=" + this.Tag.Id + "]")[0].classList.toggle('active');
		textarea.normalize();
		document.getSelection().removeAllRanges();
		document.getSelection().addRange(visual);
	},
	Insert: function Insert(e, textarea) {
		if (this.Tag instanceof _wriitTags.Single) {
			this.ISingle.apply(this, [textarea]);
		} else if (this.Tag instanceof Many) {
			this.IMany.apply(this, [textarea]);
		}
	},
	Callback: function Callback(tag, fn) {
		var apply = function apply(tag) {
			var button = this.Editor.buttons[tag.Id];
			var mod = this;
			button.addEventListener('click', function (e, routedevent) {
				mod.Tag = tag;
				this.event = routedevent || e;
				if (this.BeforeFormat !== undefined) {
					mod.BeforeFormat.apply(mod, [routedevent || e]);
				}
				var res = fn.apply(mod, [routedevent || e, mod.Editor.textarea.get(0)]);
				if (this.AfterFormat !== undefined) {
					this.AfterFormat.apply(mod, [routedevent || e]);
				}
				return res;
			});
			if (!!tag.Shortcut) {
				this.Editor.textarea.keys.bind(tag.Shortcut, function (e) {
					$(button).trigger('click', e);
					return false;
				});
			}
		};
		if (tag instanceof _wriitTags.Single) {
			apply.apply(this, [tag]);
		} else if (tag instanceof MultiClass) {
			for (var i in tag.children) {
				apply.apply(this, [tag.children[i]]);
			}
		} else if (tag instanceof MultiAttr) {
			for (var i in tag.children) {
				apply.apply(this, [tag.children[i]]);
			}
		}
	},
	BeforeFormat: undefined,
	AfterFormat: undefined,
	Setup: undefined
};
Object.defineProperty(Module, 'IMany', {
	writable: false,
	enumerable: false
});
Object.defineProperty(Module, 'Insert', {
	writable: false,
	enumerable: false
});
Object.defineProperty(Module, 'ISingle', {
	writable: false,
	enumerable: false
});
exports["default"] = Module;
module.exports = exports["default"];

},{"./wriit-tags":15}],15:[function(require,module,exports){
/*global document*/
/* jshint -W097 */
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.StyleAttr = StyleAttr;
exports.GeneralAttr = GeneralAttr;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function BaseAttr(attr, value) {
	this.attr = attr;
	this.value = value;
}

var ClassAttr = function ClassAttr() {
	_classCallCheck(this, ClassAttr);
};

exports.ClassAttr = ClassAttr;

function StyleAttr(attr, value) {
	BaseAttr.call(this, attr, value);
}

function GeneralAttr(attr, value) {
	BaseAttr.call(this, attr, value);
}

StyleAttr.prototype = Object.create(BaseAttr.prototype);
GeneralAttr.prototype = Object.create(BaseAttr.prototype);

function BaseTag(id, tag, attributes, blow) {
	this.Mime = blow === true;
	attributes = attributes || {};
	this.Id = id;
	this.SuperId = null;
	this.Parent = null;
	this.TagName = tag;
	this.Shortcut = attributes.shortcut || null;
	delete attributes.shortcut;
	this.ToolTip = attributes.tooltip || null;
	delete attributes.tooltip;
	this.DisplayClass = attributes.displayclass || null;
	delete attributes.displayclass;
	this.Attr = attributes;
}
BaseTag.prototype.AttrMatch = function (attr, value) {
	return this.Attr[attr] === value;
};

BaseTag.prototype.isInstance = function (htmlnode) {
	if (htmlnode.nodeType !== 1) {
		return false;
	}
	if (htmlnode.tagName.toLowerCase() !== this.TagName.toLowerCase()) {
		return false;
	}
	for (var attr in this.Attr) {
		var atribute = this.Attr[attr];
		if (atribute instanceof StyleAttr) {
			if (htmlnode.style[atribute.attr] === "") {
				return false;
			}
		} else if (atribute instanceof GeneralAttr) {
			if (htmlnode.attributes[attr].value !== this.Attr[attr]) return false;
		}
	}
	return true;
};
BaseTag.prototype["new"] = function () {
	var el = document.createElement(this.TagName);
	this.UpdateAttributes(el);
	return el;
};
BaseTag.prototype.UpdateAttributes = function (node) {
	for (var attr in this.Attr) {
		var atribute = this.Attr[attr];
		if (atribute instanceof StyleAttr) {
			node.style[atribute.attr] = atribute.value;
		} else if (atribute instanceof GeneralAttr) {
			node.setAttribute(attr, this.Attr[attr]);
		}
	}
};
BaseTag.prototype.AttrMatch = function (attr, value) {
	return this.Attr[attr] === value;
};
BaseTag.prototype.isCompatible = function (htmlnode) {
	if (htmlnode.nodeType !== 1 || htmlnode.tagName.toLowerCase() !== this.TagName.toLowerCase()) {
		return false;
	}
	return true;
};

/*export function StyleTag(id) {
	BaseTag.call(this, id,"span",null,true);
}*/

var AttrGenerator = (function () {
	function AttrGenerator(gen, property) {
		_classCallCheck(this, AttrGenerator);

		this.gen = gen;
		this.property = property;
	}

	/*
 function WriitAttr(attr) {
 	this.attr = attr;
 }
 function ApplyAttr(value) {
 	this.value = value;
 	return this;
 }
 function WriitStyle(attr) {
 	this.attr = attr;
 }
 
 WriitAttr.prototype.apply = function (value) {
 	return new GeneralAttr(this.attr, value);
 };
 WriitStyle.prototype.apply = function (value) {
 	return new StyleAttr(this.attr, value);
 };
 Object.freeze(WriitAttr);
 Object.freeze(WriitStyle);
 
 
 
 
 function Basic(id, tag, attributes,blow) {
 	this.Mime = blow === true;
 	attributes = attributes || {};
 	this.Id = id;
 	this.SuperId = null;
 	this.Parent = null;
 	this.TagName = tag;
 	this.Shortcut = attributes.shortcut || null;
 	delete attributes["shortcut"];
 	this.ToolTip = attributes.tooltip || null;
 	delete attributes["tooltip"];
 	this.DisplayClass = attributes.displayclass || null;
 	delete attributes["displayclass"];
 	this.Attr = attributes;
 	this.AttrMatch = function (attr, value) {
 		return this.Attr[attr] === value;
 	}
 	this.isInstance = function (htmlnode) {
 		if (htmlnode.nodeType != 1) {
 			return false;
 		}
 		if (htmlnode.tagName.toLowerCase() != this.TagName.toLowerCase()) {
 			return false;
 		}
 		for (let attr in this.Attr) {
 			let atribute = this.Attr[attr];
 			if (atribute instanceof StyleAttr) {
 				if(htmlnode.style[atribute.attr]==""){return false;}
 			} else if (atribute instanceof GeneralAttr) {
 				if (htmlnode.attributes[prop].value != this.Attr[prop]) return false;
 			}
 		}
 		return true;
 	}
 	this.new = function () {
 		let el = document.createElement(this.TagName);
 		this.UpdateAttributes(el);
 		return el;
 	}
 	this.UpdateAttributes = function (node) {
 		for (let attr in this.Attr) {
 			let atribute = this.Attr[attr];
 			if (atribute instanceof StyleAttr) {
 				node.style[atribute.attr]=atribute.value;
 			} else if (atribute instanceof GeneralAttr) {
 				node.setAttribute(attr, this.Attr[attr]);
 			}
 		}
 	}
 }
 
 function Many(id, tag, attributes, blow) {
 	this.isCompatible = function (node) {
 		if (node.nodeType != 1) {
 			return false;
 		}
 		if (node.tagName.toLowerCase() != this.TagName.toLowerCase()) {
 			return false;
 		}
 		return true;
 	};
 	Basic.call(this, id, tag, attributes,blow);
 	//	Object.freeze(this);
 }
 function MultiAttr(id, tag) {
 	this.Id = id;
 	this.TagName = tag;
 	this.children = {};
 	this.FindByClass = function (classname) {
 		for (let child in this.children) {
 			if (this.children[child].AttrMatch("class", classname)) {
 				return this.children[child];
 			}
 		}
 	}
 	this.Add = function (subid, value, attributes,mime) {
 		attributes = attributes || {};
 		attributes[value.attr] = value;
 		this.children[subid] = new Many(this.Id + "_" + subid, this.TagName, attributes, mime);
 		this.children[subid].SuperId = this.Id;
 		this.children[subid].Parent = this;
 		Object.freeze(this.children[subid]);
 	}
 	this.Remove = function (clasname) {
 		delete this.children[subid];
 	};
 }
 function MultiClass(id, tag) {
 	this.Id = id;
 	this.TagName = tag;
 	this.children = {};
 	this.FindByClass = function (classname) {
 		for (let child in this.children) {
 			if (this.children[child].AttrMatch("class", classname)) {
 				return this.children[child];
 			}
 		}
 	}
 	this.Add = function (subid, classname, attributes) {
 		attributes = attributes || {};
 		attributes.class = classname;
 		this.children[subid] = new Many(this.Id + "_" + subid, this.TagName, attributes, "class");
 		this.children[subid].SuperId = this.Id;
 		this.children[subid].Parent = this;
 		Object.freeze(this.children[subid]);
 	}
 	this.Remove = function (clasname) {
 		delete this.children[subid];
 	}
 }
 
 
 //==============Experimental
 function MultiStyle(id, tag) {
 	this.Id = id;
 	this.TagName = tag;
 	this.children = {};
 	this.FindByClass = function (classname) {
 		for (let child in this.children) {
 			if (this.children[child].AttrMatch("class", classname)) {
 				return this.children[child];
 			}
 		}
 	}
 	this.Add = function (subid, value, attributes,mime) {
 		attributes = attributes || {};
 		attributes[value.attr] = value;
 		this.children[subid] = new Many(this.Id + "_" + subid, this.TagName, attributes, mime);
 		this.children[subid].SuperId = this.Id;
 		this.children[subid].Parent = this;
 		Object.freeze(this.children[subid]);
 	}
 	this.Remove = function (subid) {
 		delete this.children[subid];
 	};
 }
 
 Single.prototype = Object.create(Basic.prototype);
 Many.prototype = Object.create(Basic.prototype);
 Object.freeze(Single);
 Object.freeze(Many);
 */

	_createClass(AttrGenerator, [{
		key: "KeyValue",
		value: function KeyValue(value, label) {
			return new this.gen(this.property, value);
		}
	}]);

	return AttrGenerator;
})();

},{}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _wriitTags = require('./wriit-tags');

exports['default'] = function (that) {
	var add = function add(button) {
		var newB = document.createElement('button');
		newB.setAttribute("data-wriit-commandId", button.Id);
		newB.setAttribute("class", button.IconClass);

		if (button.ToolTip !== null) {
			var span = document.createElement('span');
			span.innerHTML = button.ToolTip;
			newB.appendChild(span);
		}

		that.buttons[button.Id] = newB;
		that.tags[button.Id] = button;
		that.menu.append(newB);
		return button.Id;
	};
	this.AddButton = function (tag) {
		if (tag instanceof _wriitTags.Single) {
			add(tag);
			/*} else if (button instanceof MultiClass) {
   	for (let prop in button.children) {
   		add(button.children[prop]);
   	}
   } else if (button instanceof MultiAttr) {
   	for (let prop in button.children) {
   		add(button.children[prop]);
   	}
   }*/
		} else if (tag instanceof _wriitTags.StyleTag) {}
		//return button;
	};
	Object.defineProperty(this, 'AddButton', {
		writable: false,
		enumerable: true,
		configurable: true
	});
};

module.exports = exports['default'];

},{"./wriit-tags":15}],17:[function(require,module,exports){
/*global document,window,$,console,setInterval,Basic,Many,MultiClass,WriitStyle,regexp*/
'use strict';

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _Module = require('./Module');

var _Module2 = _interopRequireDefault(_Module);

var _tags = require('./tags');

var _wriitToolbar = require('./wriit-toolbar');

var _wriitToolbar2 = _interopRequireDefault(_wriitToolbar);

var _iTextArea = require('./iTextArea');

var _iTextArea2 = _interopRequireDefault(_iTextArea);

var _keyhandler = require('./keyhandler');

var _keyhandler2 = _interopRequireDefault(_keyhandler);

var _modules = require('./modules');

var modules = _interopRequireWildcard(_modules);

var GPEGui = {
	engine: {
		micro: 1,
		mini: 2,
		normal: 3,
		extended: 4
	},
	visual: {
		onselection: 1,
		always: 2,
		alternate: 3
	}
};
var GPETags = {
	command: 0,
	span: 1,
	id: 2,
	tag: 3,
	paragraph: 10,
	multiSpan: 11,
	multiClass: 12,
	multiName: 13,
	onlyInsert: 21,
	multiOnlyInsert: 31,
	list: 51
};
//1-10 Apertura y Cierre
//11-20 Apertura y Cierre, Múltiples Valores
//21-30 Apertura
//31-40 Apertura, Múltiples Valores
//51-xxx Todas las demás(Definir Independientemente)
function MatchNT(text, tag) {
	var x = text.match(tag);
	return x ? x.length : 0;
}
function findNT(txt, tag) {
	var so = regexp("[__Tag__]");
	var x = txt.replace(regexp(tag, "g"), "[__Tag__]");
	x = x.match(so);
	return x ? x.length : 0;
}

function str_replace(search, replace, subject) {
	var s = subject;
	var ra = r instanceof Array,
	    sa = s instanceof Array,
	    f = [].concat(search),
	    r = [].concat(replace),
	    i = (s = [].concat(s)).length,
	    j = 0;

	while ((j = 0, i--)) {
		if (s[i]) {
			while ((s[i] = (s[i] + '').split(f[j]).join(ra ? r[j] || "" : r[0]), ++j in f)) {}
		}
	}
	return sa ? s : s[0];
}

var totalGPET = 0;
var _i = '<li id="i" name="em" value="3"></li>';
var _u = '<li id="u" value="1" extra=\'style:text-decoration:underline\'></li>';
var _t = '<li id="t" value="1" extra=\'style:text-decoration:line-through\'></li>';
var _o = '<li id="o" value="1" extra=\'style:text-decoration:overline\'></li>';
var _sub = '<li id="sub" value="2"></li>';
var _sup = '<li id="sup" value="2"></li>';
var _ul = '<li id="ul" value="51"></li>';
var _ol = '<li id="ol" value="51"></li>';
var _size = '<li id="fontsize" value="11" extra=\'style:font-size\'></li>';
var _color = '<li id="color" value="11" extra=\'style:color\' class="cboton"></li>';
var _highlight = '<li id="highlight" value="11" extra=\'style:background-color\' class="cboton" sCI="background-color"></li>';
var _shadow = '<li id="textshadow" value="11" extra=\'style:text-shadow:(.*?) 1px 1px 1px\' class="cboton" sCI="text-shadow"></li>';
var _l = '<li id="L" extra="style:text-align:left" value="10"></li>';
var _c = '<li id="C" extra="style:text-align:center" value="10"></li>';
var _r = '<li id="R" extra="style:text-align:right" value="10"></li>';
var _j = '<li id="J" extra="style:text-align:justify" value="10"></li>';
var _cite = '<li id="cite" value="2"></li>';
var _quote = '<li id="quote" name="q" value="3"></li>';
var _e = '<li id="b" name="strong" value="3"></li>';
var _emotic = '<li id="emotic" name="span" value="31" extra=\'src\'></li>';
var _hl = '<li id="hr" name="hr" value="21"></li>';
var _unformat = '<li id="unformart" value="0"></li>';

var template = '<section class="wriit-box"><menu></menu><div data-wriit-role="text-area"></div><div class="tagi"></div></section>';
var installedplugins = [];

function getTag(node, tags) {
	for (var prop in tags) {
		var tag = tags[prop];
		if (tag.isInstance(node)) {
			return tag;
		}
	}
	return null;
}
function findAllTags(node, container, tags) {
	for (var nname in node.children) {
		var newnode = node.children[nname];
		if (newnode.nodeType === 1) {
			var tag = getTag(newnode, tags);
			if (tag !== null) {
				container[tag.Id] = tag;
			}
			findAllTags(newnode, container, tags);
		} else {
			return true;
		}
	}
}
function NodeAnalysis(tags, maincontainer) {
	var left = {};
	var middle = {};
	var right = {};
	var contain = {};
	var leftNode = this.startContainer.parentNode;
	var rightNode = this.endContainer.parentNode;
	var common = null;
	if (leftNode === rightNode) {
		common = leftNode;
		var insider = this.cloneContents();
		findAllTags(insider, middle, tags);
	} else {
		while (leftNode !== this.commonAncestorContainer) {
			var tag = getTag(leftNode, tags);
			if (tag !== null) {
				left[tag.Id] = tag;
			}
			leftNode = leftNode.parentNode;
		}
		while (rightNode !== this.commonAncestorContainer) {
			var tag = getTag(rightNode, tags);
			if (tag !== null) {
				right[tag.Id] = tag;
			}
			rightNode = rightNode.parentNode;
		}
		common = this.commonAncestorContainer;
	}
	while (common !== maincontainer) {
		var tag = getTag(common, tags);
		if (tag !== null) {
			contain[tag.Id] = tag;
		}
		common = common.parentNode;
	}
	var plugs = {};
	for (var prop in tags) {
		var tag = tags[prop];
		var button = maincontainer.parentNode.querySelectorAll("[data-wriit-commandId=" + tag.Id + "]")[0];
		var glow = false;
		if (tag instanceof _tags.Single) {
			plugs[tag.Id] = {
				isSorrounded: contain[tag.Id] !== undefined,
				isContained: middle[tag.Id] !== undefined,
				isOpened: right[tag.Id] !== undefined,
				isClosed: left[tag.Id] !== undefined,
				deep: 0
			};
			if (plugs[tag.Id].isSorrounded) {
				button.classList.add('active');
				glow = true;
			} else {
				button.classList.remove('active');
			}
		} else if (tag instanceof Many) {
			plugs[tag.SuperId] = {
				isSorrounded: plugs[tag.SuperId] !== null ? plugs[tag.SuperId].isSorrounded || contain[tag.Id] !== null : contain[tag.Id],
				isContained: plugs[tag.SuperId] !== null ? plugs[tag.SuperId].isContained || middle[tag.Id] !== null : middle[tag.Id],
				isOpened: plugs[tag.SuperId] !== null ? plugs[tag.SuperId].isOpened || right[tag.Id] !== null : right[tag.Id] !== null,
				isClosed: plugs[tag.SuperId] !== null ? plugs[tag.SuperId].isClosed || left[tag.Id] !== null : left[tag.Id] !== null,
				deep: 0
			};
			if (contain[tag.Id] !== null) {
				glow = true;
				button.classList.add('active');
			} else {
				button.classList.remove('active');
			}
		}
		var doo = tag.Mime;
		if (glow && doo) {
			button.style["box-shadow"] = "inset #00ff00 1px 1px 50px";
		} else {
			button.style["box-shadow"] = "";
		}
	}
	return plugs;
}
function addtotagi(e) {
	$(this).parent().find('.tagi').html('');
	var x = $(document.getSelection().anchorNode.parentNode);
	var i = 0;
	while (x.get(0) !== this) {
		var li = $('<span>' + x.get(0).localName + '</span>');
		$(this).parent().find('.tagi').prepend(li);
		x = x.parent();
	}
}
function Wriit(parent, cfg) {
	var _this = this;

	var privateData = new WeakMap();
	var props = {
		dataindex: [Object.create(null)],
		data: Object.create(null)
	};
	var indexes = [Object.create(null)];
	var compiled = $(template);
	this.textarea = compiled.find("[data-wriit-role=text-area]");
	this.textarea.html(parent.html());
	parent.replaceWith(compiled);
	this.menu = compiled.find('menu:eq(0)');
	this.cfg = $.extend({}, cfg, {
		Modules: installedplugins
	});
	var that = this;
	var prototype = Object.getPrototypeOf(that);
	this.html = Object.defineProperties({
		getSelection: function getSelection(n) {
			n = n || 0;
			var html = that.textarea.html();
			var coord = that.textarea.getSelection(n);
			var range = coord.rang;
			return Object.defineProperties({}, {
				start: {
					get: function get() {
						return coord.start;
					},
					configurable: true,
					enumerable: true
				},
				end: {
					get: function get() {
						return coord.end;
					},
					configurable: true,
					enumerable: true
				},
				pre: {
					get: function get() {
						return html.substring(0, coord.start);
					},
					configurable: true,
					enumerable: true
				},
				sel: {
					get: function get() {
						return html.substring(coord.start, coord.end);
					},
					configurable: true,
					enumerable: true
				},
				post: {
					get: function get() {
						return html.substring(coord.end, html.lentgh);
					},
					configurable: true,
					enumerable: true
				},
				text: {
					get: function get() {
						return html;
					},
					set: function set(v) {
						that.textarea.html(v);
					},
					configurable: true,
					enumerable: true
				},
				visual: {
					get: function get() {
						return range;
					},
					configurable: true,
					enumerable: true
				}
			});
		}
	}, {
		selection: {
			get: function get() {
				return this.getSelection(0).coord;
			},
			configurable: true,
			enumerable: true
		}
	});
	this.selection = function (tagid) {
		return this.Modules[tagid].selection;
	};
	this.textarea.KeyHandler();{
		(function () {
			var block = false;
			var initialValue = _this.textarea.html().trim();
			var storeInfo = function storeInfo(force) {
				var index = privateData.get(compiled.get(0)) || [];
				if (indexes.length === 51) {}
				var prop = index[index.length - 1];
				var textvalue = that.textarea.html().trim();
				var data = privateData.get(prop);

				if (data === undefined && textvalue !== initialValue) {
					prop = Object.create(null);
					privateData.set(prop, initialValue);
					index.push(prop);
					privateData.set(compiled.get(0), index);
					that.buttons.undo.attr('disabled', false);
					return true;
				} else if (data && Math.abs(textvalue.length - data.length) > 15 || force && textvalue !== data) {
					console.log("Store", textvalue);
					prop = Object.create(null);
					privateData.set(prop, textvalue);
					index.push(prop);
					privateData.set(compiled.get(0), index);
					that.buttons.undo.attr('disabled', false);
					return true;
				}
				return data !== undefined && (data && data !== textvalue);
			};

			var clearInfo = function clearInfo() {
				privateData.set(that.textarea.get(0), []);
				that.buttons.redo.attr('disabled', true);
			};
			compiled.bind('savecontent', function (e) {
				while (block);
				block = true;
				try {
					if (storeInfo()) {
						clearInfo();
					} else {
						that.buttons.undo.attr('disabled', true);
					}
				} catch (ex) {
					console.log(ex);
				}
				block = false;
			});

			var ctrlz = function ctrlz() {
				while (block);
				block = true;
				var stored = storeInfo(true);
				var undos = privateData.get(compiled.get(0));
				var redos = privateData.get(that.textarea.get(0)) || [];

				if (undos.length > 1) {
					if (stored) {
						redos.push(undos.pop());
					}
					var prop = privateData.get(undos[undos.length - 1]);
					privateData.set(that.textarea.get(0), redos);

					that.textarea.html(prop);
					privateData.set(compiled.get(0), undos);
					var sel = window.getSelection();
					sel.removeAllRanges();
					var node = that.textarea.get(0);
					while (node.lastChild) {
						node = node.lastChild;
					}
					that.html.getSelection(0).visual.setStartBefore(node);
					that.html.getSelection(0).visual.setEndBefore(node);
					sel.addRange(that.html.getSelection(0).visual);

					that.buttons.redo.attr('disabled', false);
				}
				block = false;
				//		$(this).trigger('keyup', e);
				return false;
			};
			_this.textarea.keys.bind("CMD+Z", ctrlz);
			prototype.undo = {
				Setup: function Setup(toolbar) {
					this.Callback(toolbar.AddButton(new _tags.Single("undo", "_undo", {
						tooltip: "Undo",
						displayclass: "fa fa-undo"
					})), ctrlz);
				}
			};
			prototype.redo = {
				Setup: function Setup(toolbar) {
					this.Callback(toolbar.AddButton(new _tags.Single("redo", "_redo", {
						tooltip: "Repeat",
						displayclass: "fa fa-repeat"
					})), ctrlz);
					that.buttons.redo.setAttribute('disabled', true);
				}
			};
		})();
	}
	this.textarea.toTextArea({
		coord: false,
		debug: false
	});

	this.Modules = {};
	this.buttons = {};
	this.tags = {};
	this.metadata = {};
	this.textarea.bind('keyup mouseup', addtotagi);
	this.textarea.bind('keyup mouseup', function () {
		that.Modules = NodeAnalysis.apply(that.textarea.getSelection(0).rang, [that.tags, that.textarea.get(0)]);
	});
	setInterval(function () {
		compiled.trigger('savecontent');
	}, 1000);
	var toolbar = new _wriitToolbar2['default'](this);
	Object.freeze(toolbar);
	this.cfg.Modules.forEach(function (plugin) {
		if (prototype[plugin].Setup !== null) {
			prototype[plugin] = $.extend(new _Module2['default'](that), prototype[plugin]);
			prototype[plugin].Setup(toolbar);
		}
	});
	this.button = function (id) {
		return that.buttons[id];
	};
}

for (var mod in modules) {
	installedplugins.push(mod);
	Wriit.prototype[mod] = modules[mod];
}
/*Wriit.prototype.pasteEvent = {
	Setup: function () {
		var that = this;
		var clipboard = $('<textarea style="display:none;">');
		clipboard.insertAfter($(this.textarea));
		$(this.textarea).bind("paste", false, function (e) {
			var paste = "";
			var o = e;
			e = e.originalEvent;
			if (/text\/html/.test(e.clipboardData.types)) {
				paste = e.clipboardData.getData('text/html');
				paste = paste.replace("<meta charset='utf-8'>", function (str) {
					return '';
				});
				paste = paste.replace(/<span class="Apple-converted-space">.<\/span>/g, function (str) {
					return ' ';
				});
				paste = paste.replace(/<span[^>]*>([^<]*)<\/span>/g, function (str, ct) {
					return ct;
				});
				paste = paste.replace(/ style=".[^>]*"/g, function (str, ct) {
					return '';
				});
				e.clipboardData.clearData();
				e.clipboardData.items = [];
				clipboard.html(paste);
				paste = $('<section>' + paste + '</section>').get(0);
				//				e.clipboardData.setData('text/html',paste);
			} else if (/text\/plain/.test(e.clipboardData.types)) {
				paste = e.clipboardData.getData('text/plain');
			}
			var end = paste.childNodes[that.nodeAPI.childCountorLengtg(paste) - 1];
			while (paste.childNodes.length > 0) {
				e.target.parentNode.insertBefore(paste.childNodes[0], e.target);
			}
			that.html.getSelection(0).visual.setStart(end, that.nodeAPI.childCountorLengtg(end));
			that.html.getSelection(0).visual.setEnd(end, that.nodeAPI.childCountorLengtg(end));
			that.restore();
			return false;
		});
	},
};
Wriit.prototype.bold = {
	Setup: function (toolbar) {
		let bold = new Single("bold", "strong", {
			tooltip: "Bold",
			iconclass: "fa fa-bold",
			shortcut: "CMD+SHIFT+B"
		});
		toolbar.AddButton(bold);
		this.Callback(bold, this.Insert);
	},
};
Wriit.prototype.subindex = {
	Setup: function (toolbar) {
		let bt = new Single("subindex", "sub", {
			tooltip: "SubIndex",
			displayclass: "fa fa-subscript"
		});
		toolbar.AddButton(bt);
		this.Callback(bt, this.Insert);
	}
};
Wriit.prototype.pown = {
	Setup: function (toolbar) {
		this.Callback(toolbar.AddButton(new Single("pown", "sup", {
			tooltip: "Super Index",
			displayclass: "fa fa-superscript"
		})), this.Insert);
	}
};
Wriit.prototype.italic = {
	Setup: function (toolbar) {
		this.Callback(toolbar.AddButton(new Single("italic", "em", {
			tooltip: "Italic",
			displayclass: "fa fa-italic"
		})), this.Insert);
	}
};
Wriit.prototype.underline = {
	Setup: function (toolbar) {
		this.Callback(toolbar.AddButton(new Single("underline", "u", {
			tooltip: "Underline",
			displayclass: "fa fa-underline",
			shortcut: "ALT+SHIFT+U"
		})), this.Insert);
	}
};
Wriit.prototype.strikethrough = {
	Setup: function (toolbar) {
		this.Callback(toolbar.AddButton(new Single("strikethrough", "del", {
			tooltip: "Strike Through",
			displayclass: "fa fa-strikethrough",
			shortcut: "ALT+SHIFT+S"
		})), this.Insert);
	}
};
/*Wriit.prototype.paragraph = {
	Setup: function (toolbar) {
		let fmulti = new MultiClass('paragraph', "p");
		fmulti.Add('left', 'text-left', {
			tooltip: "Align Left",
			displayclass: "fa fa-align-left",
			shortcut: "CMD+SHIFT+L"
		});
		fmulti.Add('center', 'text-center', {
			tooltip: "Align Center",
			displayclass: "fa fa-align-center",
			shortcut: "CMD+SHIFT+C"
		});
		fmulti.Add('right', 'text-right', {
			tooltip: "Align Right",
			displayclass: "fa fa-align-right",
			shortcut: "CMD+SHIFT+R"
		});
		fmulti.Add('justify', 'text-justify', {
			tooltip: "Justify",
			displayclass: "fa fa-align-justify",
			shortcut: "CMD+SHIFT+J"
		});
		toolbar.AddButton(fmulti);
		this.Callback(fmulti, this.Insert);
	}
};* /
Wriit.prototype.forecolor = {
	Setup: function (toolbar) {
		let tag = new StyleTag('forecolor');
		let prop = tag.newProperty("color");
		tag.Add(prop.KeyValue('#FF0000','red') );
		
		let fmulti = new StyleAttr('forecolor', "span", c);
		fmulti.Add('red', c.apply('#00FF00'), {
			displayclass: "fa fa-font"
		},true);
		toolbar.AddButton(fmulti);
		this.Callback(fmulti, this.Insert);
	}
};
*/
$.fn.wriit = function (cfg) {
	$(this).each(function () {
		return new Wriit($(this), cfg);
	});
};

},{"./Module":1,"./iTextArea":2,"./keyhandler":3,"./modules":6,"./tags":13,"./wriit-toolbar":16}]},{},[1,2,3,14,15,16,17,4,5,6,7,8,9,10,11,12,13])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvZ2VyYXJkMnAvZGV2ZWxvcG1lbnQvYmFja2VuZC93cmlpdC9zcmMvTW9kdWxlLmpzIiwiL1VzZXJzL2dlcmFyZDJwL2RldmVsb3BtZW50L2JhY2tlbmQvd3JpaXQvc3JjL2lUZXh0QXJlYS5qcyIsIi9Vc2Vycy9nZXJhcmQycC9kZXZlbG9wbWVudC9iYWNrZW5kL3dyaWl0L3NyYy9rZXloYW5kbGVyLmpzIiwiL1VzZXJzL2dlcmFyZDJwL2RldmVsb3BtZW50L2JhY2tlbmQvd3JpaXQvc3JjL21vZHVsZXMvYm9sZC5qcyIsIi9Vc2Vycy9nZXJhcmQycC9kZXZlbG9wbWVudC9iYWNrZW5kL3dyaWl0L3NyYy9tb2R1bGVzL2ZvcmVjb2xvci5qcyIsIi9Vc2Vycy9nZXJhcmQycC9kZXZlbG9wbWVudC9iYWNrZW5kL3dyaWl0L3NyYy9tb2R1bGVzL2luZGV4LmpzIiwiL1VzZXJzL2dlcmFyZDJwL2RldmVsb3BtZW50L2JhY2tlbmQvd3JpaXQvc3JjL3RhZ3MvQXR0cmlidXRlR2VuZXJhdG9yLmpzIiwiL1VzZXJzL2dlcmFyZDJwL2RldmVsb3BtZW50L2JhY2tlbmQvd3JpaXQvc3JjL3RhZ3MvQmFzZS5qcyIsIi9Vc2Vycy9nZXJhcmQycC9kZXZlbG9wbWVudC9iYWNrZW5kL3dyaWl0L3NyYy90YWdzL0Jhc2VBdHRyaWJ1dGUuanMiLCIvVXNlcnMvZ2VyYXJkMnAvZGV2ZWxvcG1lbnQvYmFja2VuZC93cmlpdC9zcmMvdGFncy9TaW5nbGUuanMiLCIvVXNlcnMvZ2VyYXJkMnAvZGV2ZWxvcG1lbnQvYmFja2VuZC93cmlpdC9zcmMvdGFncy9TdHlsZUF0dHIuanMiLCIvVXNlcnMvZ2VyYXJkMnAvZGV2ZWxvcG1lbnQvYmFja2VuZC93cmlpdC9zcmMvdGFncy9TdHlsZVRhZy5qcyIsIi9Vc2Vycy9nZXJhcmQycC9kZXZlbG9wbWVudC9iYWNrZW5kL3dyaWl0L3NyYy90YWdzL2luZGV4LmpzIiwiL1VzZXJzL2dlcmFyZDJwL2RldmVsb3BtZW50L2JhY2tlbmQvd3JpaXQvc3JjL3dyaWl0LW1vZHVsZXMuanMiLCIvVXNlcnMvZ2VyYXJkMnAvZGV2ZWxvcG1lbnQvYmFja2VuZC93cmlpdC9zcmMvd3JpaXQtdGFncy5qcyIsIi9Vc2Vycy9nZXJhcmQycC9kZXZlbG9wbWVudC9iYWNrZW5kL3dyaWl0L3NyYy93cmlpdC10b29sYmFyLmpzIiwiL1VzZXJzL2dlcmFyZDJwL2RldmVsb3BtZW50L2JhY2tlbmQvd3JpaXQvc3JjL3dyaWl0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7b0JDQytCLFFBQVE7O0FBRXZDLFNBQVMsaUJBQWlCLENBQUMsSUFBSSxFQUFFO0FBQ2hDLEtBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7QUFDN0IsUUFBTyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7QUFDbEMsUUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0VBQzlDO0NBQ0Q7OztBQUVXLG1CQUFDLE1BQU0sRUFBRTs7O0FBQ25CLE1BQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQ3JCLE1BQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO0FBQ2QsTUFBSSxDQUFDLFlBQVksR0FBQyxTQUFTLENBQUM7QUFDNUIsTUFBSSxDQUFDLFdBQVcsR0FBQyxTQUFTLENBQUM7QUFDM0IsTUFBSSxDQUFDLFFBQVEsR0FBQyxTQUFTLENBQUM7QUFDeEIsTUFBSSxDQUFDLEtBQUssR0FBQyxTQUFTLENBQUM7RUFDckI7Ozs7U0FPSyxlQUFDLFFBQVEsRUFBRTtBQUNoQixPQUFJLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO0FBQy9CLE9BQUksTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7QUFDekIs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R0FBRyxFQUFFO0FBQzNCLEVBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWTtBQUN4QixTQUFPLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztFQUMvQixDQUFDLENBQUM7Q0FDSCxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qZ2xvYmFsIGRvY3VtZW50LCQsTWFueSxNdWx0aUF0dHIsTXVsdGlDbGFzcyovXG5pbXBvcnQge1NpbmdsZSwgU3R5bGVUYWd9IGZyb20gJy4vdGFncyc7XG5cbmZ1bmN0aW9uIG1ha2VDaGlsZFNpYmxpbmdzKG5vZGUpIHtcblx0dmFyIHBhcmVudCA9IG5vZGUucGFyZW50Tm9kZTtcblx0d2hpbGUgKG5vZGUuY2hpbGROb2Rlcy5sZW5ndGggPiAwKSB7XG5cdFx0cGFyZW50Lmluc2VydEJlZm9yZShub2RlLmNoaWxkTm9kZXNbMF0sIG5vZGUpO1xuXHR9XG59XG5leHBvcnQgZGVmYXVsdCBjbGFzcyB7XG5cdGNvbnN0cnVjdG9yKGVkaXRvcikge1xuXHRcdHRoaXMuRWRpdG9yID0gZWRpdG9yO1xuXHRcdHRoaXMuVGFnID0ge307XG5cdFx0dGhpcy5CZWZvcmVGb3JtYXQ9dW5kZWZpbmVkO1xuXHRcdHRoaXMuQWZ0ZXJGb3JtYXQ9dW5kZWZpbmVkO1xuXHRcdHRoaXMuVGVhckRvd249dW5kZWZpbmVkO1xuXHRcdHRoaXMuU2V0dXA9dW5kZWZpbmVkO1xuXHR9XG5cdGdldCBTZWxlY3Rpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMuVGFnLlN1cGVySWQgIT09IHVuZGVmaW5lZCA/IHRoaXMuRWRpdG9yLk1vZHVsZXNbdGhpcy5UYWcuU3VwZXJJZF0gOiB0aGlzLkVkaXRvci5Nb2R1bGVzW3RoaXMuVGFnLklkXTtcblx0fVxuXHRnZXQgVmlzdWFsKCl7XG5cdFx0cmV0dXJuIHRoaXMuRWRpdG9yLmh0bWwuZ2V0U2VsZWN0aW9uKDApLnZpc3VhbDtcblx0fVxuXHRJTWFueSAodGV4dGFyZWEpIHtcblx0XHRsZXQgc2VsZWN0aW9uID0gdGhpcy5TZWxlY3Rpb247XG5cdFx0bGV0IHZpc3VhbCA9IHRoaXMuVmlzdWFsO1xuXHRcdGxldCBub2RlID0gdmlzdWFsLmNvbW1vbkFuY2VzdG9yQ29udGFpbmVyO1xuXHRcdGlmIChub2RlLm5vZGVUeXBlICE9PSAxKSB7XG5cdFx0XHRub2RlID0gbm9kZS5wYXJlbnROb2RlO1xuXHRcdH1cblx0XHRpZiAoc2VsZWN0aW9uLmlzU29ycm91bmRlZCkge1xuXHRcdFx0Zm9yIChsZXQgdCBpbiB0aGlzLlRhZy5QYXJlbnQuY2hpbGRyZW4pIHtcblx0XHRcdFx0bGV0IHRhZyA9IHRoaXMuVGFnLlBhcmVudC5jaGlsZHJlblt0XTtcblx0XHRcdFx0dGhpcy5FZGl0b3IuYnV0dG9uKHRhZy5JZCkuY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG5cdFx0XHR9XG5cdFx0XHR3aGlsZSAobm9kZS50YWdOYW1lLnRvTG93ZXJDYXNlKCkgIT09IHRoaXMuVGFnLlRhZ05hbWUudG9Mb3dlckNhc2UoKSkge1xuXHRcdFx0XHRub2RlID0gbm9kZS5wYXJlbnROb2RlO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHRoaXMuVGFnLmlzQ29tcGF0aWJsZShub2RlKSkge1xuXHRcdFx0XHRmb3IgKGxldCBhdHRyIGluIHRoaXMuVGFnLkF0dHIpIHtcblx0XHRcdFx0XHR0aGlzLlRhZy5VcGRhdGVBdHRyaWJ1dGVzKG5vZGUpO1xuXHRcdFx0XHRcdC8vbm9kZS5zZXRBdHRyaWJ1dGUoYXR0ciwgdGhpcy5UYWcuQXR0clthdHRyXSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5FZGl0b3IuYnV0dG9uKHRoaXMuVGFnLklkKS5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKCEodGhpcy5UYWcuUGFyZW50IGluc3RhbmNlb2YgTXVsdGlDbGFzcykpIHtcblx0XHRcdGxldCBuZXdlbCA9IHRoaXMuVGFnLm5ldygpO1xuXHRcdFx0bmV3ZWwuYXBwZW5kQ2hpbGQodmlzdWFsLmV4dHJhY3RDb250ZW50cygpKTtcblx0XHRcdHZpc3VhbC5pbnNlcnROb2RlKG5ld2VsKTtcblx0XHRcdHRleHRhcmVhLm5vcm1hbGl6ZSgpO1xuXHRcdH1cblx0XHRkb2N1bWVudC5nZXRTZWxlY3Rpb24oKS5yZW1vdmVBbGxSYW5nZXMoKTtcblx0XHRkb2N1bWVudC5nZXRTZWxlY3Rpb24oKS5hZGRSYW5nZSh2aXN1YWwpO1xuXHR9XG5cdElTaW5nbGUodGV4dGFyZWEpIHtcblx0XHRsZXQgc2VsZWN0aW9uID0gdGhpcy5TZWxlY3Rpb247XG5cdFx0bGV0IHZpc3VhbCA9IHRoaXMuVmlzdWFsO1xuXHRcdGlmICh2aXN1YWwuY29sbGFwc2VkICYmIHNlbGVjdGlvbi5pc1NvcnJvdW5kZWQpIHtcblx0XHRcdGxldCBvbGRub2RlID0gdmlzdWFsLnN0YXJ0Q29udGFpbmVyLnBhcmVudE5vZGU7XG5cdFx0XHR3aGlsZSAoIXRoaXMuVGFnLmlzSW5zdGFuY2Uob2xkbm9kZSkpIHtcblx0XHRcdFx0b2xkbm9kZSA9IG9sZG5vZGUucGFyZW50Tm9kZTtcblx0XHRcdH1cblx0XHRcdG1ha2VDaGlsZFNpYmxpbmdzKG9sZG5vZGUpO1xuXHRcdFx0b2xkbm9kZS5yZW1vdmUoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bGV0IG5ld2VsID0gdGhpcy5UYWcubmV3KCk7XG5cdFx0XHRuZXdlbC5hcHBlbmRDaGlsZCh2aXN1YWwuZXh0cmFjdENvbnRlbnRzKCkpO1xuXHRcdFx0dmlzdWFsLmluc2VydE5vZGUobmV3ZWwpO1xuXHRcdFx0aWYgKHRoaXMuVGFnLmlzSW5zdGFuY2UobmV3ZWwubmV4dFNpYmxpbmcpKSB7XG5cdFx0XHRcdGxldCBzaWJsaW5nID0gbmV3ZWwubmV4dFNpYmxpbmc7XG5cdFx0XHRcdEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwoc2libGluZy5jaGlsZE5vZGVzLCBmdW5jdGlvbiAoaW5uZXJjaGlsZCkge1xuXHRcdFx0XHRcdG5ld2VsLmFwcGVuZENoaWxkKGlubmVyY2hpbGQpO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0c2libGluZy5yZW1vdmUoKTtcblx0XHRcdH1cblx0XHRcdGlmICh0aGlzLlRhZy5pc0luc3RhbmNlKG5ld2VsLnByZXZpb3VzU2libGluZykpIHtcblx0XHRcdFx0bGV0IHNpYmxpbmcgPSBuZXdlbC5wcmV2aW91c1NpYmxpbmc7XG5cdFx0XHRcdEFycmF5LnByb3RvdHlwZS5mb3JFYWNoLmNhbGwoc2libGluZy5jaGlsZE5vZGVzLCBmdW5jdGlvbiAoaW5uZXJjaGlsZCkge1xuXHRcdFx0XHRcdG5ld2VsLmluc2VydEJlZm9yZShpbm5lcmNoaWxkLCBuZXdlbC5maXJzdENoaWxkKTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdHNpYmxpbmcucmVtb3ZlKCk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoc2VsZWN0aW9uLmlzQ29udGFpbmVkICsgc2VsZWN0aW9uLmlzT3BlbmVkICsgc2VsZWN0aW9uLmlzQ2xvc2VkKSB7XG5cdFx0XHRcdGxldCBjbGVhbm5vZGUgPSB2aXN1YWwuZXh0cmFjdENvbnRlbnRzKCkuZmlyc3RDaGlsZDtcblx0XHRcdFx0bGV0IGlubmVyID0gY2xlYW5ub2RlLnF1ZXJ5U2VsZWN0b3JBbGwodGhpcy5UYWcuVGFnTmFtZSk7XG5cdFx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgaW5uZXIubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRtYWtlQ2hpbGRTaWJsaW5ncyhpbm5lcltpXSk7XG5cdFx0XHRcdFx0aW5uZXJbaV0ucmVtb3ZlKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0dmlzdWFsLmluc2VydE5vZGUobmV3ZWwpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHR0ZXh0YXJlYS5wYXJlbnROb2RlLnF1ZXJ5U2VsZWN0b3JBbGwoXCJbZGF0YS13cmlpdC1jb21tYW5kSWQ9XCIgKyB0aGlzLlRhZy5JZCArIFwiXVwiKVswXS5jbGFzc0xpc3QudG9nZ2xlKCdhY3RpdmUnKTtcblx0XHR0ZXh0YXJlYS5ub3JtYWxpemUoKTtcblx0XHRkb2N1bWVudC5nZXRTZWxlY3Rpb24oKS5yZW1vdmVBbGxSYW5nZXMoKTtcblx0XHRkb2N1bWVudC5nZXRTZWxlY3Rpb24oKS5hZGRSYW5nZSh2aXN1YWwpO1xuXHR9XG5cdEluc2VydChlLCB0ZXh0YXJlYSkge1xuXHRcdGlmICh0aGlzLlRhZyBpbnN0YW5jZW9mIFNpbmdsZSkge1xuXHRcdFx0dGhpcy5JU2luZ2xlLmFwcGx5KHRoaXMsIFt0ZXh0YXJlYV0pO1xuXHRcdH0gZWxzZSBpZiAodGhpcy5UYWcgaW5zdGFuY2VvZiBNYW55KSB7XG5cdFx0XHR0aGlzLklNYW55LmFwcGx5KHRoaXMsIFt0ZXh0YXJlYV0pO1xuXHRcdH1cblx0fVxuXHRDYWxsYmFjayh0YWcsIGZuKSB7XG5cdFx0bGV0IGFwcGx5ID0gZnVuY3Rpb24gKHRhZykge1xuXHRcdFx0bGV0IGJ1dHRvbiA9IHRoaXMuRWRpdG9yLmJ1dHRvbnNbdGFnLklkXTtcblx0XHRcdGxldCBtb2QgPSB0aGlzO1xuXHRcdFx0YnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24gKGUsIHJvdXRlZGV2ZW50KSB7XG5cdFx0XHRcdG1vZC5UYWcgPSB0YWc7XG5cdFx0XHRcdHRoaXMuZXZlbnQgPSByb3V0ZWRldmVudCB8fCBlO1xuXHRcdFx0XHRpZiAodGhpcy5CZWZvcmVGb3JtYXQgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdG1vZC5CZWZvcmVGb3JtYXQuYXBwbHkobW9kLCBbcm91dGVkZXZlbnQgfHwgZV0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGxldCByZXMgPSBmbi5hcHBseShtb2QsIFtyb3V0ZWRldmVudCB8fCBlLCBtb2QuRWRpdG9yLnRleHRhcmVhLmdldCgwKV0pO1xuXHRcdFx0XHRpZiAodGhpcy5BZnRlckZvcm1hdCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0dGhpcy5BZnRlckZvcm1hdC5hcHBseShtb2QsIFtyb3V0ZWRldmVudCB8fCBlXSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIHJlcztcblx0XHRcdH0pO1xuXHRcdFx0aWYgKCEhdGFnLlNob3J0Y3V0KSB7XG5cdFx0XHRcdHRoaXMuRWRpdG9yLnRleHRhcmVhLmtleXMuYmluZCh0YWcuU2hvcnRjdXQsIGZ1bmN0aW9uIChlKSB7XG5cdFx0XHRcdFx0JChidXR0b24pLnRyaWdnZXIoJ2NsaWNrJywgZSk7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9O1xuXHRcdGlmICh0YWcgaW5zdGFuY2VvZiBTaW5nbGUpIHtcblx0XHRcdGFwcGx5LmFwcGx5KHRoaXMsIFt0YWddKTtcblx0XHR9IGVsc2UgaWYgKHRhZyBpbnN0YW5jZW9mIE11bHRpQ2xhc3MpIHtcblx0XHRcdGZvciAobGV0IGkgaW4gdGFnLmNoaWxkcmVuKSB7XG5cdFx0XHRcdGFwcGx5LmFwcGx5KHRoaXMsIFt0YWcuY2hpbGRyZW5baV1dKTtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKHRhZyBpbnN0YW5jZW9mIE11bHRpQXR0cikge1xuXHRcdFx0Zm9yIChsZXQgaSBpbiB0YWcuY2hpbGRyZW4pIHtcblx0XHRcdFx0YXBwbHkuYXBwbHkodGhpcywgW3RhZy5jaGlsZHJlbltpXV0pO1xuXHRcdFx0fVxuXHRcdH1cblxuXHR9XG59IiwiLypnbG9iYWwgJCxqUXVlcnkqL1xuZnVuY3Rpb24gdGFnbGVuZ3RoKG5vZGUsIGZ1bGwpIHtcblx0XCJ1c2Ugc3RyaWN0XCI7XG5cdGxldCBvdGV4dCA9IG5vZGUud2hvbGVUZXh0ICE9PSB1bmRlZmluZWQgPyBub2RlLndob2xlVGV4dCA6IG5vZGUub3V0ZXJIVE1MO1xuXHRsZXQgaXRleHQgPSBub2RlLmlubmVySFRNTCAhPT0gdW5kZWZpbmVkID8gbm9kZS5pbm5lckhUTUwgOiBub2RlLmlubmVyVGV4dDtcblx0bGV0IGwgPSBvdGV4dC5pbmRleE9mKGl0ZXh0KTtcblx0aWYgKG90ZXh0LmluZGV4T2YoaXRleHQpICE9PSBvdGV4dC5sYXN0SW5kZXhPZihpdGV4dCkpIHtcblx0XHRsID0gb3RleHQuaW5kZXhPZihpdGV4dCwgaXRleHQubGVuZ3RoKTtcblx0fVxuXHRyZXR1cm4gZnVsbCA/IG90ZXh0Lmxlbmd0aCA6IChsID09PSAtMSA/IG90ZXh0Lmxlbmd0aCA6IGwpO1xufVxuXG5mdW5jdGlvbiBkZWRlZXAocGFyZW50LCBjb21tb24sIG5vZGUsIG9mZnNldCkge1xuXHRcInVzZSBzdHJpY3RcIjtcblx0bGV0IHRleHQgPSBub2RlLndob2xlVGV4dCAhPT0gdW5kZWZpbmVkID8gbm9kZS53aG9sZVRleHQgOiBub2RlLm91dGVySFRNTDtcblx0bGV0IGVuZCA9IC10ZXh0LnN1YnN0cmluZyhvZmZzZXQsIHRleHQubGVuZ3RoKS5sZW5ndGg7XG5cdGRvIHtcblx0XHRsZXQgcHJldm5vZGUgPSBub2RlLnByZXZpb3VzU2libGluZztcblx0XHRsZXQgYWxsID0gZmFsc2U7XG5cdFx0ZG8ge1xuXHRcdFx0ZW5kICs9IHRhZ2xlbmd0aChub2RlLCBhbGwpO1xuXHRcdFx0cHJldm5vZGUgPSBub2RlLnByZXZpb3VzU2libGluZztcblx0XHRcdGFsbCA9IHByZXZub2RlID8gcHJldm5vZGUubm9kZVR5cGUgPT0gMSA6IGZhbHNlO1xuXHRcdFx0aWYgKHByZXZub2RlKSB7XG5cdFx0XHRcdG5vZGUgPSBwcmV2bm9kZTtcblx0XHRcdH1cblx0XHR9IHdoaWxlIChwcmV2bm9kZSAhPT0gbnVsbCk7XG5cdFx0aWYgKG5vZGUucGFyZW50Tm9kZSAhPSBwYXJlbnQpIHtcblx0XHRcdG5vZGUgPSBub2RlLnBhcmVudE5vZGU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGVuZCAtPSB0YWdsZW5ndGgobm9kZSk7XG5cdFx0fVxuXHR9IHdoaWxlIChub2RlLnBhcmVudE5vZGUgIT0gcGFyZW50ICYmIG5vZGUgIT0gcGFyZW50KTtcblx0ZW5kICs9IHRhZ2xlbmd0aChub2RlKTtcblx0bm9kZSA9IG5vZGUucHJldmlvdXNTaWJsaW5nO1xuXHR3aGlsZSAobm9kZSkge1xuXHRcdGxldCBvdGV4dCA9IG5vZGUud2hvbGVUZXh0ICE9PSB1bmRlZmluZWQgPyBub2RlLndob2xlVGV4dCA6IG5vZGUub3V0ZXJIVE1MO1xuXHRcdGVuZCArPSBvdGV4dC5sZW5ndGg7XG5cdFx0bm9kZSA9IG5vZGUucHJldmlvdXNTaWJsaW5nO1xuXHR9XG5cdHJldHVybiBlbmQ7XG59XG5cbmZ1bmN0aW9uIHRleHRhcmVhKHBhcmVudCwgb3B0cykge1xuXHRcInVzZSBzdHJpY3RcIjtcblx0dmFyIGNhcmVhID0gJCgnPGRpdiBjbGFzcz1cIml0ZXh0YXJlYS1jb3Jkc1wiLz4nKTtcblx0aWYgKG9wdHMuY29vcmQpIHtcblx0XHRjYXJlYS5pbnNlcnRBZnRlcihwYXJlbnQpO1xuXHR9XG5cdCQocGFyZW50KS5iaW5kKCdrZXl1cCBtb3VzZXVwJywgZnVuY3Rpb24gKGV2KSB7XG5cdFx0bGV0IGluaSA9IHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKTtcblx0XHR2YXIgcmFuZ2VzID0gW107XG5cdFx0dmFyIHNlbGVjdGlvbiA9IHdpbmRvdy5nZXRTZWxlY3Rpb24oKTtcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHNlbGVjdGlvbi5yYW5nZUNvdW50OyBpKyspIHtcblx0XHRcdGxldCByYW5nZSA9IHNlbGVjdGlvbi5nZXRSYW5nZUF0KGkpO1xuXHRcdFx0cmFuZ2VzLnB1c2goe1xuXHRcdFx0XHRzdGFydDogZGVkZWVwKHBhcmVudCwgcmFuZ2UuY29tbW9uQW5jZXN0b3JDb250YWluZXIsIHJhbmdlLnN0YXJ0Q29udGFpbmVyLCByYW5nZS5zdGFydE9mZnNldCksXG5cdFx0XHRcdGVuZDogZGVkZWVwKHBhcmVudCwgcmFuZ2UuY29tbW9uQW5jZXN0b3JDb250YWluZXIsIHJhbmdlLmVuZENvbnRhaW5lciwgcmFuZ2UuZW5kT2Zmc2V0KSxcblx0XHRcdFx0cmFuZzogcmFuZ2Vcblx0XHRcdH0pO1xuXHRcdH1cblx0XHQkKHBhcmVudCkuZGF0YSgncmFuZycsIHJhbmdlcyk7XG5cdFx0bGV0IGVuZCA9IHdpbmRvdy5wZXJmb3JtYW5jZS5ub3coKTtcblx0XHRpZiAob3B0cy5wZXJmb3JtYWNlKSB7XG5cdFx0XHRjb25zb2xlLmxvZyhcImlUZXh0QXJlYSBhbmFseXNpczpcIiwgZW5kIC0gaW5pLCAnbXMnKTtcblx0XHR9XG5cdFx0aWYgKG9wdHMuY29vcmQpIHtcblx0XHRcdGNhcmVhLmh0bWwocmFuZ2VzWzBdLnN0YXJ0ICsgXCIsXCIgKyByYW5nZXNbMF0uZW5kKTtcblx0XHR9XG5cdFx0aWYgKG9wdHMuZGVidWcpIHtcblx0XHRcdGNhcmVhLmFwcGVuZCgnPHRleHRhcmVhIHN0eWxlPVwid2lkdGg6NjAwcHg7ZGlzcGxheTpibG9jaztcIj4nICsgcGFyZW50LmlubmVySFRNTC5zdWJzdHJpbmcoMCwgcmFuZ2VzWzBdLnN0YXJ0KSArICc8L3RleHRhcmVhPicpO1xuXHRcdFx0Y2FyZWEuYXBwZW5kKCc8dGV4dGFyZWEgc3R5bGU9XCJ3aWR0aDo2MDBweDtkaXNwbGF5OmJsb2NrO1wiPicgKyBwYXJlbnQuaW5uZXJIVE1MLnN1YnN0cmluZyhyYW5nZXNbMF0uc3RhcnQsIHJhbmdlc1swXS5lbmQpICsgJzwvdGV4dGFyZWE+Jyk7XG5cdFx0XHRjYXJlYS5hcHBlbmQoJzx0ZXh0YXJlYSBzdHlsZT1cIndpZHRoOjYwMHB4O2Rpc3BsYXk6YmxvY2s7XCI+JyArIHBhcmVudC5pbm5lckhUTUwuc3Vic3RyaW5nKHJhbmdlc1swXS5lbmQsICQocGFyZW50KS5odG1sKCkubGVuZ3RoKSArICc8L3RleHRhcmVhPicpO1xuXHRcdH1cblx0fSk7XG59XG5leHBvcnQgZGVmYXVsdCAoZnVuY3Rpb24gKCQpIHtcblx0JC5mbi50b1RleHRBcmVhID0gZnVuY3Rpb24gKGNmZykge1xuXHRcdGNmZyA9ICQuZXh0ZW5kKHt9LCB7XG5cdFx0XHRjb29yZDogZmFsc2UsXG5cdFx0XHRwZXJmb3JtYWNlOiBmYWxzZSxcblx0XHRcdGRlYnVnOiBmYWxzZVxuXHRcdH0sIGNmZyk7XG5cdFx0JCh0aGlzKS5hdHRyKCdjb250ZW50ZWRpdGFibGUnLCB0cnVlKTtcblx0XHQkKHRoaXMpLmVhY2goZnVuY3Rpb24gKCkge1xuXHRcdFx0bmV3IHRleHRhcmVhKHRoaXMsIGNmZyk7XG5cdFx0XHRyZXR1cm4gJCh0aGlzKTtcblx0XHR9KTtcblx0fTtcblx0JC5mbi5nZXRTZWxlY3Rpb24gPSBmdW5jdGlvbiAobikge1xuXHRcdGlmICgkKHRoaXMpLmRhdGEoJ3JhbmcnKSkge1xuXHRcdFx0cmV0dXJuICQodGhpcykuZGF0YSgncmFuZycpW25dO1xuXHRcdH1cblx0fTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KCQuZm4sIFwic2VsZWN0aW9uXCIsIHtcblx0XHRnZXQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiAkKHRoaXMpLmRhdGEoJ3JhbmcnKVswXTtcblx0XHR9XG5cdH0pO1xufSkoalF1ZXJ5KTsiLCJsZXQga2V5cyA9IHtcblx0XCI4XCI6IFwiQ0FSUllcIixcblx0XCIxM1wiOiBcIkVOVEVSXCIsXG5cdFwiMTZcIjogXCJTSElGVFwiLFxuXHRcIjE3XCI6IFwiQ1RSTFwiLFxuXHRcIjE4XCI6IFwiQUxUXCIsXG5cdFwiMjdcIjogXCJFU0NcIixcblx0XCIzN1wiOiBcIkxFRlRcIixcblx0XCIzOFwiOiBcIlVQXCIsXG5cdFwiMzlcIjogXCJSSUdUSFwiLFxuXHRcIjQwXCI6IFwiRE9XTlwiLFxuXHRcIjkxXCI6IFwiQ01EXCJcbn07XG5mb3IgKGxldCBpID0gMTEyOyBpIDwgKDExMiArIDEyKTsgaSsrKSB7XG5cdGtleXNbaS50b1N0cmluZygpXSA9IFwiRlwiICsgKGkgLSAxMTEpO1xufVxubGV0IHJvdXRla2V5ID0ge1xuXHRcIkNUUkxcIjogXCJDTURcIixcblx0XCJDTURcIjogXCJDVFJMXCJcbn07XG5sZXQgS2V5SGFuZGxlciA9IGZ1bmN0aW9uIChlbCwgc2V0dGluZ3MpIHtcblx0ZWwuZGF0YSgnZXZlbnRzJywge30pO1xuXHRlbC5iaW5kKFwia2V5ZG93blwiLCBmdW5jdGlvbiAoZSwgcm91dGVkZXZlbnQpIHtcblx0XHRlID0gcm91dGVkZXZlbnQgfHwgZTtcblx0XHRsZXQgY3VycmtleXMgPSBlbC5kYXRhKCdrZXlzJykgfHwge307XG5cdFx0bGV0IGN1cnJrZXkgPSBrZXlzW2Uud2hpY2gudG9TdHJpbmcoKV0gfHwgU3RyaW5nLmZyb21DaGFyQ29kZShlLndoaWNoKSB8fCBlLndoaWNoIHx8IGZhbHNlO1xuXHRcdGN1cnJrZXlzW2N1cnJrZXldID0gY3VycmtleTtcblx0XHRlbC5kYXRhKCdrZXlzJywgY3VycmtleXMpO1xuXHRcdGxldCB0cmlnZ2VyID0gW107XG5cdFx0Zm9yIChsZXQgaSBpbiBjdXJya2V5cykge1xuXHRcdFx0dHJpZ2dlci5wdXNoKGN1cnJrZXlzW2ldKTtcblx0XHR9XG5cdFx0dHJpZ2dlciA9IHRyaWdnZXIuam9pbignKycpO1xuXHRcdHRyaWdnZXIgPSBlbC5kYXRhKCdldmVudHMnKVt0cmlnZ2VyXTtcblx0XHRpZiAoISF0cmlnZ2VyKSB7XG5cdFx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0XHRpZiAoIXRyaWdnZXIoZSkpIHtcblx0XHRcdFx0ZS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKTtcblx0XHRcdFx0ZS5zdG9wUHJvcGFnYXRpb24oKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHR9KS5iaW5kKFwia2V5dXBcIiwgZnVuY3Rpb24gKGUsIHJvdXRlZGV2ZW50KSB7XG5cdFx0aWYgKCFlLndoaWNoKSB7XG5cdFx0XHRlbC5kYXRhKCdrZXlzJywge30pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRlID0gcm91dGVkZXZlbnQgfHwgZTtcblx0XHRcdGxldCBjdXJya2V5cyA9IGVsLmRhdGEoJ2tleXMnKSB8fCBbXTtcblx0XHRcdGxldCBjdXJya2V5ID0ga2V5c1tlLndoaWNoLnRvU3RyaW5nKCldIHx8IFN0cmluZy5mcm9tQ2hhckNvZGUoZS53aGljaCkgfHwgZS53aGljaCB8fCBmYWxzZTtcblx0XHRcdGRlbGV0ZSBjdXJya2V5c1tjdXJya2V5XTtcblx0XHRcdGVsLmRhdGEoJ2tleXMnLCBjdXJya2V5cyk7XG5cdFx0XHRzd2l0Y2goY3VycmtleSl7XG5cdFx0XHRcdGNhc2UgXCJDVFJMXCI6Y2FzZSBcIkNNRFwiOlxuXHRcdFx0XHRcdGVsLmRhdGEoJ2tleXMnLCBbXSk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cblx0XHR9XG5cdH0pLmJpbmQoJ2JsdXInLCBmdW5jdGlvbiAoZSkge1xuXHRcdGVsLmRhdGEoJ2tleXMnLCB7fSk7XG5cdH0pO1xuXHRyZXR1cm4gZWw7XG59O1xuZXhwb3J0IGRlZmF1bHQgKGZ1bmN0aW9uICgkKSB7XG5cdCQuZm4uS2V5SGFuZGxlciA9IGZ1bmN0aW9uIChzZXR0aW5ncykge1xuXHRcdGxldCBjb25maWcgPSB7XG5cdFx0XHRFU0M6IGZhbHNlLFxuXHRcdFx0RU5URVI6IGZhbHNlXG5cdFx0fTtcblx0XHRjb25maWcgPSAkLmV4dGVuZCh7fSwgY29uZmlnLCBzZXR0aW5ncyk7XG5cdFx0JCh0aGlzKS5lYWNoKGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiBuZXcgS2V5SGFuZGxlcigkKHRoaXMpLCBzZXR0aW5ncyk7XG5cdFx0fSk7XG5cdH07XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSgkLmZuLCBcImtleXByZXNzZWRcIiwge1xuXHRcdGdldDogZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuICQodGhpcykuZGF0YSgna2V5cycpO1xuXHRcdH1cblx0fSk7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSgkLmZuLCBcImtleXNcIiwge1xuXHRcdGdldDogZnVuY3Rpb24gKCkge1xuXHRcdFx0bGV0IHRoYXQgPSB0aGlzO1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0YmluZDogZnVuY3Rpb24gKGtleXNlcXVlbmNlLCBmbikge1xuXHRcdFx0XHRcdGtleXNlcXVlbmNlID0ga2V5c2VxdWVuY2UudG9VcHBlckNhc2UoKTtcblx0XHRcdFx0XHR0aGF0LmRhdGEoJ2V2ZW50cycpW2tleXNlcXVlbmNlXSA9IGZuO1xuXHRcdFx0XHRcdHZhciBjbWRzID0ga2V5c2VxdWVuY2Uuc3BsaXQoJysnKTtcblx0XHRcdFx0XHRmb3IgKGxldCBpIGluIGNtZHMpIHtcblx0XHRcdFx0XHRcdGlmICghIXJvdXRla2V5W2NtZHNbaV1dKSB7XG5cdFx0XHRcdFx0XHRcdGNtZHNbaV0gPSByb3V0ZWtleVtjbWRzW2ldXTtcblx0XHRcdFx0XHRcdFx0dGhhdC5kYXRhKCdldmVudHMnKVtjbWRzLmpvaW4oJysnKV0gPSBmbjtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0fVxuXHR9KTtcbn0pKGpRdWVyeSk7IiwiaW1wb3J0IHtTaW5nbGV9IGZyb20gJy4uL3RhZ3MnO1xuZXhwb3J0IGRlZmF1bHQge1xuXHRTZXR1cDogZnVuY3Rpb24gKHRvb2xiYXIpIHtcblx0XHRsZXQgYm9sZCA9IG5ldyBTaW5nbGUoXCJib2xkXCIsIFwic3Ryb25nXCIsIHtcblx0XHRcdHRvb2x0aXA6IFwiQm9sZFwiLFxuXHRcdFx0aWNvbmNsYXNzOiBcImZhIGZhLWJvbGRcIixcblx0XHRcdHNob3J0Y3V0OiBcIkNNRCtTSElGVCtCXCJcblx0XHR9KTtcblx0XHR0b29sYmFyLkFkZEJ1dHRvbihib2xkKTtcblx0XHR0aGlzLkNhbGxiYWNrKGJvbGQsIHRoaXMuSW5zZXJ0KTtcblx0fVxufTsiLCJpbXBvcnQge1N0eWxlVGFnLFN0eWxlQXR0cn0gZnJvbSAnLi4vdGFncyc7XG5cbmV4cG9ydCBkZWZhdWx0IHtcblx0U2V0dXA6IGZ1bmN0aW9uICh0b29sYmFyKSB7XG5cdFx0bGV0IHRhZyA9IG5ldyBTdHlsZVRhZygnZm9yZWNvbG9yJyk7XG5cdFx0bGV0IHByb3AgPSB0YWcubmV3UHJvcGVydHkoXCJjb2xvclwiKTtcblx0XHR0YWcuQWRkKHByb3AuS2V5VmFsdWUoJyNGRjAwMDAnLCAncmVkJykpO1xuXHRcdGxldCBmbXVsdGkgPSBuZXcgU3R5bGVBdHRyKCdmb3JlY29sb3InLCBcInNwYW5cIiwgYyk7XG5cdFx0Zm11bHRpLkFkZCgncmVkJywgYy5hcHBseSgnIzAwRkYwMCcpLCB7XG5cdFx0XHRkaXNwbGF5Y2xhc3M6IFwiZmEgZmEtZm9udFwiXG5cdFx0fSwgdHJ1ZSk7XG5cdFx0dG9vbGJhci5BZGRCdXR0b24oZm11bHRpKTtcblx0XHR0aGlzLkNhbGxiYWNrKGZtdWx0aSwgdGhpcy5JbnNlcnQpO1xuXHR9XG59OyIsImV4cG9ydCB7ZGVmYXVsdCBhcyBmb3JlY29sb3J9IGZyb20gJy4vZm9yZWNvbG9yJztcbmV4cG9ydCB7ZGVmYXVsdCBhcyBib2xkfSBmcm9tICcuL2JvbGQnOyIsImV4cG9ydCBkZWZhdWx0IGNsYXNze1xuXHRjb25zdHJ1Y3RvcihnZW4sIHByb3BlcnR5KSB7XG5cdFx0dGhpcy5nZW4gPSBnZW47XG5cdFx0dGhpcy5wcm9wZXJ0eSA9IHByb3BlcnR5O1xuXHR9XG5cdEtleVZhbHVlKHZhbHVlLCBsYWJlbCkge1xuXHRcdHJldHVybiBuZXcgdGhpcy5nZW4odGhpcy5wcm9wZXJ0eSwgdmFsdWUpO1xuXHR9XG59IiwiZXhwb3J0IGRlZmF1bHQgY2xhc3Mge1xuXHRjb25zdHJ1Y3RvcihpZCwgdGFnLCBhdHRyaWJ1dGVzLCBoaWdobGlnaHQpIHtcblx0XHR0aGlzLklkID0gaWQ7XG5cdFx0dGhpcy5oaWdobGlnaHQgPSB0cnVlO1xuXHRcdHRoaXMuVGFnTmFtZSA9IHRhZztcblx0XHR0aGlzLkF0dHJpYnV0ZXMgPSBbXTtcblx0XHR0aGlzLlNob3J0Y3V0ID0gYXR0cmlidXRlcy5zaG9ydGN1dCB8fCBudWxsO1xuXHRcdHRoaXMuVG9vbFRpcCA9IGF0dHJpYnV0ZXMudG9vbHRpcCB8fCBudWxsO1xuXHRcdHRoaXMuSWNvbkNsYXNzID0gYXR0cmlidXRlcy5pY29uY2xhc3MgfHwgbnVsbDtcblx0fVxuXHRpc0NvbXBhdGlibGUoaHRtbG5vZGUpIHtcblx0XHRpZiAoaHRtbG5vZGUubm9kZVR5cGUgIT09IDEgfHwgaHRtbG5vZGUudGFnTmFtZS50b0xvd2VyQ2FzZSgpICE9PSB0aGlzLlRhZ05hbWUudG9Mb3dlckNhc2UoKSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXHRpc0luc3RhbmNlKGh0bWxub2RlKSB7XG5cdFx0aWYgKCF0aGlzLmlzQ29tcGF0aWJsZShodG1sbm9kZSkpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0Zm9yIChsZXQgYXR0ciBpbiB0aGlzLkF0dHIpIHtcblx0XHRcdGxldCBhdHJpYnV0ZSA9IHRoaXMuQXR0clthdHRyXTtcblx0XHRcdGlmIChhdHJpYnV0ZSBpbnN0YW5jZW9mIFN0eWxlQXR0cikge1xuXHRcdFx0XHRpZiAoaHRtbG5vZGUuc3R5bGVbYXRyaWJ1dGUuYXR0cl0gPT09IFwiXCIpIHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAoYXRyaWJ1dGUgaW5zdGFuY2VvZiBHZW5lcmFsQXR0cikge1xuXHRcdFx0XHRpZiAoaHRtbG5vZGUuYXR0cmlidXRlc1thdHRyXS52YWx1ZSAhPT0gdGhpcy5BdHRyW2F0dHJdKSByZXR1cm4gZmFsc2U7XG5cdFx0XHR9IGVsc2UgaWYgKGF0cmlidXRlIGluc3RhbmNlb2YgQ2xhc3NBdHRyKSB7XG5cdFx0XHRcdGlmIChodG1sbm9kZS5jbGFzc0xpc3QpIHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblx0bmV3KCkge1xuXHRcdGxldCBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGhpcy5UYWdOYW1lKTtcblx0XHQvL3RoaXMuVXBkYXRlQXR0cmlidXRlcyhlbCk7XG5cdFx0cmV0dXJuIGVsO1xuXHR9XG59IiwiZXhwb3J0IGRlZmF1bHQgY2xhc3N7XG5cdGNvbnN0cnVjdG9yKGF0dHIsIHZhbHVlKXtcblx0XHR0aGlzLmF0dHIgPSBhdHRyO1xuXHR0aGlzLnZhbHVlID0gdmFsdWU7XG5cdH1cbn0iLCJpbXBvcnQgQmFzZSBmcm9tICcuL0Jhc2UnO1xuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2luZ2xlIGV4dGVuZHMgQmFzZSB7XG5cdGNvbnN0cnVjdG9yKGlkLCB0YWcsIG9wdGlvbnMpIHtcblx0XHRzdXBlcihpZCwgdGFnLCBvcHRpb25zLCBmYWxzZSk7XG5cdH1cbn0iLCJpbXBvcnQgQmFzZUF0dHJpYnV0ZSBmcm9tICcuL0Jhc2VBdHRyaWJ1dGUnO1xuXG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0eWxlQXR0ciBleHRlbmRzIEJhc2VBdHRyaWJ1dGUge1xuXHRjb25zdHJ1Y3RvcihhdHRyLHZhbHVlKXtcblx0XHRzdXBlcihhdHRyLHZhbHVlKTtcblx0fVxufSIsImltcG9ydCBCYXNlIGZyb20gJy4vQmFzZSc7XG5pbXBvcnQgQXR0cmlidXRlR2VuZXJhdG9yIGZyb20gJy4vQXR0cmlidXRlR2VuZXJhdG9yJztcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU3R5bGVUYWcgZXh0ZW5kcyBCYXNlIHtcblx0Y29uc3RydWN0b3IoLi4uYXJncykge1xuXHRcdHN1cGVyKC4uLmFyZ3MpO1xuXHR9XG5cdG5ld1Byb3BlcnR5KHByb3BlcnR5KSB7XG5cdFx0cmV0dXJuIG5ldyBBdHRyaWJ1dGVHZW5lcmF0b3IoU3R5bGVBdHRyLCBwcm9wZXJ0eSk7XG5cdH1cblx0QWRkKGF0dHJpYnV0ZSkge1xuXHRcdHRoaXMuQXR0cmlidXRlc1thdHRyaWJ1dGUuYXR0cl0gPSBhdHRyaWJ1dGU7XG5cdH1cbn0iLCJleHBvcnQge2RlZmF1bHQgYXMgU2luZ2xlfSBmcm9tICcuL1NpbmdsZSc7XG5leHBvcnQge2RlZmF1bHQgYXMgU3R5bGVUYWd9IGZyb20gJy4vU3R5bGVUYWcnO1xuZXhwb3J0IHtkZWZhdWx0IGFzIFN0eWxlQXR0cn0gZnJvbSAnLi9TdHlsZUF0dHInOyIsIi8qZ2xvYmFsIGRvY3VtZW50LHdpbmRvdywkLGNvbnNvbGUsc2V0SW50ZXJ2YWwsQmFzaWMsTWFueSxTaW5nbGUsTXVsdGlBdHRyLE11bHRpQ2xhc3MsV3JpaXRTdHlsZSxyZWdleHAsU3R5bGVUYWcqL1xuaW1wb3J0IHtTaW5nbGUsU3R5bGVUYWd9IGZyb20gJy4vd3JpaXQtdGFncyc7XG5mdW5jdGlvbiBtYWtlQ2hpbGRTaWJsaW5ncyhub2RlKSB7XG5cdHZhciBwYXJlbnQgPSBub2RlLnBhcmVudE5vZGU7XG5cdHdoaWxlIChub2RlLmNoaWxkTm9kZXMubGVuZ3RoID4gMCkge1xuXHRcdHBhcmVudC5pbnNlcnRCZWZvcmUobm9kZS5jaGlsZE5vZGVzWzBdLCBub2RlKTtcblx0fVxufVxubGV0IE1vZHVsZSA9IGZ1bmN0aW9uICh0aGF0KSB7XG5cdGxldCBtb2QgPSB0aGlzO1xuXHR0aGlzLlRhZz1udWxsO1xuXHR0aGlzLnZpc3VhbD1udWxsO1xuXHR0aGlzLkVkaXRvciA9IHRoYXQ7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBcIlNlbGVjdGlvblwiLCB7XG5cdFx0Z2V0OiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gbW9kLlRhZy5TdXBlcklkICE9PSB1bmRlZmluZWQgPyB0aGF0Lk1vZHVsZXNbbW9kLlRhZy5TdXBlcklkXSA6IHRoYXQuTW9kdWxlc1ttb2QuVGFnLklkXTtcblx0XHR9LFxuXHR9KTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIFwiVmlzdWFsXCIsIHtcblx0XHRnZXQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiB0aGF0Lmh0bWwuZ2V0U2VsZWN0aW9uKDApLnZpc3VhbDtcblx0XHR9LFxuXHR9KTtcbn07XG5Nb2R1bGUucHJvdG90eXBlID0ge1xuXHRFZGl0b3I6IHVuZGVmaW5lZCxcblx0VGVhckRvd246IHVuZGVmaW5lZCxcblx0SU1hbnk6IGZ1bmN0aW9uICh0ZXh0YXJlYSkge1xuXHRcdGxldCBzZWxlY3Rpb24gPSB0aGlzLlNlbGVjdGlvbjtcblx0XHRsZXQgdmlzdWFsID0gdGhpcy5WaXN1YWw7XG5cdFx0bGV0IG5vZGUgPSB2aXN1YWwuY29tbW9uQW5jZXN0b3JDb250YWluZXI7XG5cdFx0aWYgKG5vZGUubm9kZVR5cGUgIT09IDEpIHtcblx0XHRcdG5vZGUgPSBub2RlLnBhcmVudE5vZGU7XG5cdFx0fVxuXHRcdGlmIChzZWxlY3Rpb24uaXNTb3Jyb3VuZGVkKSB7XG5cdFx0XHRmb3IgKGxldCB0IGluIHRoaXMuVGFnLlBhcmVudC5jaGlsZHJlbikge1xuXHRcdFx0XHRsZXQgdGFnID0gdGhpcy5UYWcuUGFyZW50LmNoaWxkcmVuW3RdO1xuXHRcdFx0XHR0aGlzLkVkaXRvci5idXR0b24odGFnLklkKS5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcblx0XHRcdH1cblx0XHRcdHdoaWxlIChub2RlLnRhZ05hbWUudG9Mb3dlckNhc2UoKSAhPT0gdGhpcy5UYWcuVGFnTmFtZS50b0xvd2VyQ2FzZSgpKSB7XG5cdFx0XHRcdG5vZGUgPSBub2RlLnBhcmVudE5vZGU7XG5cdFx0XHR9XG5cdFx0XHRpZiAodGhpcy5UYWcuaXNDb21wYXRpYmxlKG5vZGUpKSB7XG5cdFx0XHRcdGZvciAobGV0IGF0dHIgaW4gdGhpcy5UYWcuQXR0cikge1xuXHRcdFx0XHRcdHRoaXMuVGFnLlVwZGF0ZUF0dHJpYnV0ZXMobm9kZSk7XG5cdFx0XHRcdFx0Ly9ub2RlLnNldEF0dHJpYnV0ZShhdHRyLCB0aGlzLlRhZy5BdHRyW2F0dHJdKTtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLkVkaXRvci5idXR0b24odGhpcy5UYWcuSWQpLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoISh0aGlzLlRhZy5QYXJlbnQgaW5zdGFuY2VvZiBNdWx0aUNsYXNzKSkge1xuXHRcdFx0bGV0IG5ld2VsID0gdGhpcy5UYWcubmV3KCk7XG5cdFx0XHRuZXdlbC5hcHBlbmRDaGlsZCh2aXN1YWwuZXh0cmFjdENvbnRlbnRzKCkpO1xuXHRcdFx0dmlzdWFsLmluc2VydE5vZGUobmV3ZWwpO1xuXHRcdFx0dGV4dGFyZWEubm9ybWFsaXplKCk7XG5cdFx0fVxuXHRcdGRvY3VtZW50LmdldFNlbGVjdGlvbigpLnJlbW92ZUFsbFJhbmdlcygpO1xuXHRcdGRvY3VtZW50LmdldFNlbGVjdGlvbigpLmFkZFJhbmdlKHZpc3VhbCk7XG5cdH0sXG5cdElTaW5nbGU6IGZ1bmN0aW9uICh0ZXh0YXJlYSkge1xuXHRcdGxldCBzZWxlY3Rpb24gPSB0aGlzLlNlbGVjdGlvbjtcblx0XHRsZXQgdmlzdWFsID0gdGhpcy5WaXN1YWw7XG5cdFx0aWYgKHZpc3VhbC5jb2xsYXBzZWQgJiYgc2VsZWN0aW9uLmlzU29ycm91bmRlZCkge1xuXHRcdFx0bGV0IG9sZG5vZGUgPSB2aXN1YWwuc3RhcnRDb250YWluZXIucGFyZW50Tm9kZTtcblx0XHRcdHdoaWxlICghdGhpcy5UYWcuaXNJbnN0YW5jZShvbGRub2RlKSkge1xuXHRcdFx0XHRvbGRub2RlID0gb2xkbm9kZS5wYXJlbnROb2RlO1xuXHRcdFx0fVxuXHRcdFx0bWFrZUNoaWxkU2libGluZ3Mob2xkbm9kZSk7XG5cdFx0XHRvbGRub2RlLnJlbW92ZSgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRsZXQgbmV3ZWwgPSB0aGlzLlRhZy5uZXcoKTtcblx0XHRcdG5ld2VsLmFwcGVuZENoaWxkKHZpc3VhbC5leHRyYWN0Q29udGVudHMoKSk7XG5cdFx0XHR2aXN1YWwuaW5zZXJ0Tm9kZShuZXdlbCk7XG5cdFx0XHRpZiAodGhpcy5UYWcuaXNJbnN0YW5jZShuZXdlbC5uZXh0U2libGluZykpIHtcblx0XHRcdFx0bGV0IHNpYmxpbmcgPSBuZXdlbC5uZXh0U2libGluZztcblx0XHRcdFx0QXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbChzaWJsaW5nLmNoaWxkTm9kZXMsIGZ1bmN0aW9uIChpbm5lcmNoaWxkKSB7XG5cdFx0XHRcdFx0bmV3ZWwuYXBwZW5kQ2hpbGQoaW5uZXJjaGlsZCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRzaWJsaW5nLnJlbW92ZSgpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHRoaXMuVGFnLmlzSW5zdGFuY2UobmV3ZWwucHJldmlvdXNTaWJsaW5nKSkge1xuXHRcdFx0XHRsZXQgc2libGluZyA9IG5ld2VsLnByZXZpb3VzU2libGluZztcblx0XHRcdFx0QXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbChzaWJsaW5nLmNoaWxkTm9kZXMsIGZ1bmN0aW9uIChpbm5lcmNoaWxkKSB7XG5cdFx0XHRcdFx0bmV3ZWwuaW5zZXJ0QmVmb3JlKGlubmVyY2hpbGQsIG5ld2VsLmZpcnN0Q2hpbGQpO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0c2libGluZy5yZW1vdmUoKTtcblx0XHRcdH1cblx0XHRcdGlmIChzZWxlY3Rpb24uaXNDb250YWluZWQgKyBzZWxlY3Rpb24uaXNPcGVuZWQgKyBzZWxlY3Rpb24uaXNDbG9zZWQpIHtcblx0XHRcdFx0bGV0IGNsZWFubm9kZSA9IHZpc3VhbC5leHRyYWN0Q29udGVudHMoKS5maXJzdENoaWxkO1xuXHRcdFx0XHRsZXQgaW5uZXIgPSBjbGVhbm5vZGUucXVlcnlTZWxlY3RvckFsbCh0aGlzLlRhZy5UYWdOYW1lKTtcblx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBpbm5lci5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdG1ha2VDaGlsZFNpYmxpbmdzKGlubmVyW2ldKTtcblx0XHRcdFx0XHRpbm5lcltpXS5yZW1vdmUoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHR2aXN1YWwuaW5zZXJ0Tm9kZShuZXdlbCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHRleHRhcmVhLnBhcmVudE5vZGUucXVlcnlTZWxlY3RvckFsbChcIltkYXRhLXdyaWl0LWNvbW1hbmRJZD1cIiArIHRoaXMuVGFnLklkICsgXCJdXCIpWzBdLmNsYXNzTGlzdC50b2dnbGUoJ2FjdGl2ZScpO1xuXHRcdHRleHRhcmVhLm5vcm1hbGl6ZSgpO1xuXHRcdGRvY3VtZW50LmdldFNlbGVjdGlvbigpLnJlbW92ZUFsbFJhbmdlcygpO1xuXHRcdGRvY3VtZW50LmdldFNlbGVjdGlvbigpLmFkZFJhbmdlKHZpc3VhbCk7XG5cdH0sXG5cdEluc2VydDogZnVuY3Rpb24gKGUsIHRleHRhcmVhKSB7XG5cdFx0aWYgKHRoaXMuVGFnIGluc3RhbmNlb2YgU2luZ2xlKSB7XG5cdFx0XHR0aGlzLklTaW5nbGUuYXBwbHkodGhpcywgW3RleHRhcmVhXSk7XG5cdFx0fSBlbHNlIGlmICh0aGlzLlRhZyBpbnN0YW5jZW9mIE1hbnkpIHtcblx0XHRcdHRoaXMuSU1hbnkuYXBwbHkodGhpcywgW3RleHRhcmVhXSk7XG5cdFx0fVxuXHR9LFxuXHRDYWxsYmFjazogZnVuY3Rpb24gKHRhZywgZm4pIHtcblx0XHRsZXQgYXBwbHkgPSBmdW5jdGlvbiAodGFnKSB7XG5cdFx0XHRsZXQgYnV0dG9uID0gdGhpcy5FZGl0b3IuYnV0dG9uc1t0YWcuSWRdO1xuXHRcdFx0bGV0IG1vZCA9IHRoaXM7XG5cdFx0XHRidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoZSwgcm91dGVkZXZlbnQpIHtcblx0XHRcdFx0bW9kLlRhZyA9IHRhZztcblx0XHRcdFx0dGhpcy5ldmVudCA9IHJvdXRlZGV2ZW50IHx8IGU7XG5cdFx0XHRcdGlmICh0aGlzLkJlZm9yZUZvcm1hdCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0bW9kLkJlZm9yZUZvcm1hdC5hcHBseShtb2QsIFtyb3V0ZWRldmVudCB8fCBlXSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0bGV0IHJlcyA9IGZuLmFwcGx5KG1vZCwgW3JvdXRlZGV2ZW50IHx8IGUsIG1vZC5FZGl0b3IudGV4dGFyZWEuZ2V0KDApXSk7XG5cdFx0XHRcdGlmICh0aGlzLkFmdGVyRm9ybWF0ICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHR0aGlzLkFmdGVyRm9ybWF0LmFwcGx5KG1vZCwgW3JvdXRlZGV2ZW50IHx8IGVdKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gcmVzO1xuXHRcdFx0fSk7XG5cdFx0XHRpZiAoISF0YWcuU2hvcnRjdXQpIHtcblx0XHRcdFx0dGhpcy5FZGl0b3IudGV4dGFyZWEua2V5cy5iaW5kKHRhZy5TaG9ydGN1dCwgZnVuY3Rpb24gKGUpIHtcblx0XHRcdFx0XHQkKGJ1dHRvbikudHJpZ2dlcignY2xpY2snLCBlKTtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0aWYgKHRhZyBpbnN0YW5jZW9mIFNpbmdsZSkge1xuXHRcdFx0YXBwbHkuYXBwbHkodGhpcywgW3RhZ10pO1xuXHRcdH0gZWxzZSBpZiAodGFnIGluc3RhbmNlb2YgTXVsdGlDbGFzcykge1xuXHRcdFx0Zm9yIChsZXQgaSBpbiB0YWcuY2hpbGRyZW4pIHtcblx0XHRcdFx0YXBwbHkuYXBwbHkodGhpcywgW3RhZy5jaGlsZHJlbltpXV0pO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAodGFnIGluc3RhbmNlb2YgTXVsdGlBdHRyKSB7XG5cdFx0XHRmb3IgKGxldCBpIGluIHRhZy5jaGlsZHJlbikge1xuXHRcdFx0XHRhcHBseS5hcHBseSh0aGlzLCBbdGFnLmNoaWxkcmVuW2ldXSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdH0sXG5cdEJlZm9yZUZvcm1hdDogdW5kZWZpbmVkLFxuXHRBZnRlckZvcm1hdDogdW5kZWZpbmVkLFxuXHRTZXR1cDogdW5kZWZpbmVkXG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1vZHVsZSwgJ0lNYW55Jywge1xuXHR3cml0YWJsZTogZmFsc2UsXG5cdGVudW1lcmFibGU6IGZhbHNlXG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNb2R1bGUsICdJbnNlcnQnLCB7XG5cdHdyaXRhYmxlOiBmYWxzZSxcblx0ZW51bWVyYWJsZTogZmFsc2Vcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1vZHVsZSwgJ0lTaW5nbGUnLCB7XG5cdHdyaXRhYmxlOiBmYWxzZSxcblx0ZW51bWVyYWJsZTogZmFsc2Vcbn0pO1xuZXhwb3J0IGRlZmF1bHQgTW9kdWxlOyIsIi8qZ2xvYmFsIGRvY3VtZW50Ki9cbi8qIGpzaGludCAtVzA5NyAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbmZ1bmN0aW9uIEJhc2VBdHRyKGF0dHIsIHZhbHVlKSB7XG5cdHRoaXMuYXR0ciA9IGF0dHI7XG5cdHRoaXMudmFsdWUgPSB2YWx1ZTtcbn1cblxuZXhwb3J0IGNsYXNzIENsYXNzQXR0ciB7XG5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFN0eWxlQXR0cihhdHRyLCB2YWx1ZSkge1xuXHRCYXNlQXR0ci5jYWxsKHRoaXMsIGF0dHIsIHZhbHVlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEdlbmVyYWxBdHRyKGF0dHIsIHZhbHVlKSB7XG5cdEJhc2VBdHRyLmNhbGwodGhpcywgYXR0ciwgdmFsdWUpO1xufVxuU3R5bGVBdHRyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFzZUF0dHIucHJvdG90eXBlKTtcbkdlbmVyYWxBdHRyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFzZUF0dHIucHJvdG90eXBlKTtcblxuZnVuY3Rpb24gQmFzZVRhZyhpZCwgdGFnLCBhdHRyaWJ1dGVzLCBibG93KSB7XG5cdHRoaXMuTWltZSA9IGJsb3cgPT09IHRydWU7XG5cdGF0dHJpYnV0ZXMgPSBhdHRyaWJ1dGVzIHx8IHt9O1xuXHR0aGlzLklkID0gaWQ7XG5cdHRoaXMuU3VwZXJJZCA9IG51bGw7XG5cdHRoaXMuUGFyZW50ID0gbnVsbDtcblx0dGhpcy5UYWdOYW1lID0gdGFnO1xuXHR0aGlzLlNob3J0Y3V0ID0gYXR0cmlidXRlcy5zaG9ydGN1dCB8fCBudWxsO1xuXHRkZWxldGUgYXR0cmlidXRlcy5zaG9ydGN1dDtcblx0dGhpcy5Ub29sVGlwID0gYXR0cmlidXRlcy50b29sdGlwIHx8IG51bGw7XG5cdGRlbGV0ZSBhdHRyaWJ1dGVzLnRvb2x0aXA7XG5cdHRoaXMuRGlzcGxheUNsYXNzID0gYXR0cmlidXRlcy5kaXNwbGF5Y2xhc3MgfHwgbnVsbDtcblx0ZGVsZXRlIGF0dHJpYnV0ZXMuZGlzcGxheWNsYXNzO1xuXHR0aGlzLkF0dHIgPSBhdHRyaWJ1dGVzO1xuXG59XG5CYXNlVGFnLnByb3RvdHlwZS5BdHRyTWF0Y2ggPSBmdW5jdGlvbiAoYXR0ciwgdmFsdWUpIHtcblx0cmV0dXJuIHRoaXMuQXR0clthdHRyXSA9PT0gdmFsdWU7XG59O1xuXG5CYXNlVGFnLnByb3RvdHlwZS5pc0luc3RhbmNlID0gZnVuY3Rpb24gKGh0bWxub2RlKSB7XG5cdGlmIChodG1sbm9kZS5ub2RlVHlwZSAhPT0gMSkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXHRpZiAoaHRtbG5vZGUudGFnTmFtZS50b0xvd2VyQ2FzZSgpICE9PSB0aGlzLlRhZ05hbWUudG9Mb3dlckNhc2UoKSkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXHRmb3IgKGxldCBhdHRyIGluIHRoaXMuQXR0cikge1xuXHRcdGxldCBhdHJpYnV0ZSA9IHRoaXMuQXR0clthdHRyXTtcblx0XHRpZiAoYXRyaWJ1dGUgaW5zdGFuY2VvZiBTdHlsZUF0dHIpIHtcblx0XHRcdGlmIChodG1sbm9kZS5zdHlsZVthdHJpYnV0ZS5hdHRyXSA9PT0gXCJcIikge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmIChhdHJpYnV0ZSBpbnN0YW5jZW9mIEdlbmVyYWxBdHRyKSB7XG5cdFx0XHRpZiAoaHRtbG5vZGUuYXR0cmlidXRlc1thdHRyXS52YWx1ZSAhPT0gdGhpcy5BdHRyW2F0dHJdKSByZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHR9XG5cdHJldHVybiB0cnVlO1xufTtcbkJhc2VUYWcucHJvdG90eXBlLm5ldyA9IGZ1bmN0aW9uICgpIHtcblx0bGV0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0aGlzLlRhZ05hbWUpO1xuXHR0aGlzLlVwZGF0ZUF0dHJpYnV0ZXMoZWwpO1xuXHRyZXR1cm4gZWw7XG59O1xuQmFzZVRhZy5wcm90b3R5cGUuVXBkYXRlQXR0cmlidXRlcyA9IGZ1bmN0aW9uIChub2RlKSB7XG5cdGZvciAobGV0IGF0dHIgaW4gdGhpcy5BdHRyKSB7XG5cdFx0bGV0IGF0cmlidXRlID0gdGhpcy5BdHRyW2F0dHJdO1xuXHRcdGlmIChhdHJpYnV0ZSBpbnN0YW5jZW9mIFN0eWxlQXR0cikge1xuXHRcdFx0bm9kZS5zdHlsZVthdHJpYnV0ZS5hdHRyXSA9IGF0cmlidXRlLnZhbHVlO1xuXHRcdH0gZWxzZSBpZiAoYXRyaWJ1dGUgaW5zdGFuY2VvZiBHZW5lcmFsQXR0cikge1xuXHRcdFx0bm9kZS5zZXRBdHRyaWJ1dGUoYXR0ciwgdGhpcy5BdHRyW2F0dHJdKTtcblx0XHR9XG5cdH1cbn07XG5CYXNlVGFnLnByb3RvdHlwZS5BdHRyTWF0Y2ggPSBmdW5jdGlvbiAoYXR0ciwgdmFsdWUpIHtcblx0cmV0dXJuIHRoaXMuQXR0clthdHRyXSA9PT0gdmFsdWU7XG59O1xuQmFzZVRhZy5wcm90b3R5cGUuaXNDb21wYXRpYmxlID0gZnVuY3Rpb24gKGh0bWxub2RlKSB7XG5cdGlmIChodG1sbm9kZS5ub2RlVHlwZSAhPT0gMSB8fCBodG1sbm9kZS50YWdOYW1lLnRvTG93ZXJDYXNlKCkgIT09IHRoaXMuVGFnTmFtZS50b0xvd2VyQ2FzZSgpKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cdHJldHVybiB0cnVlO1xufTtcblxuLypleHBvcnQgZnVuY3Rpb24gU3R5bGVUYWcoaWQpIHtcblx0QmFzZVRhZy5jYWxsKHRoaXMsIGlkLFwic3BhblwiLG51bGwsdHJ1ZSk7XG59Ki9cbmNsYXNzIEF0dHJHZW5lcmF0b3Ige1xuXHRjb25zdHJ1Y3RvcihnZW4sIHByb3BlcnR5KSB7XG5cdFx0dGhpcy5nZW4gPSBnZW47XG5cdFx0dGhpcy5wcm9wZXJ0eSA9IHByb3BlcnR5O1xuXHR9XG5cdEtleVZhbHVlKHZhbHVlLCBsYWJlbCkge1xuXHRcdHJldHVybiBuZXcgdGhpcy5nZW4odGhpcy5wcm9wZXJ0eSwgdmFsdWUpO1xuXHR9XG59XG4vKlxuZnVuY3Rpb24gV3JpaXRBdHRyKGF0dHIpIHtcblx0dGhpcy5hdHRyID0gYXR0cjtcbn1cbmZ1bmN0aW9uIEFwcGx5QXR0cih2YWx1ZSkge1xuXHR0aGlzLnZhbHVlID0gdmFsdWU7XG5cdHJldHVybiB0aGlzO1xufVxuZnVuY3Rpb24gV3JpaXRTdHlsZShhdHRyKSB7XG5cdHRoaXMuYXR0ciA9IGF0dHI7XG59XG5cbldyaWl0QXR0ci5wcm90b3R5cGUuYXBwbHkgPSBmdW5jdGlvbiAodmFsdWUpIHtcblx0cmV0dXJuIG5ldyBHZW5lcmFsQXR0cih0aGlzLmF0dHIsIHZhbHVlKTtcbn07XG5XcmlpdFN0eWxlLnByb3RvdHlwZS5hcHBseSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuXHRyZXR1cm4gbmV3IFN0eWxlQXR0cih0aGlzLmF0dHIsIHZhbHVlKTtcbn07XG5PYmplY3QuZnJlZXplKFdyaWl0QXR0cik7XG5PYmplY3QuZnJlZXplKFdyaWl0U3R5bGUpO1xuXG5cblxuXG5mdW5jdGlvbiBCYXNpYyhpZCwgdGFnLCBhdHRyaWJ1dGVzLGJsb3cpIHtcblx0dGhpcy5NaW1lID0gYmxvdyA9PT0gdHJ1ZTtcblx0YXR0cmlidXRlcyA9IGF0dHJpYnV0ZXMgfHwge307XG5cdHRoaXMuSWQgPSBpZDtcblx0dGhpcy5TdXBlcklkID0gbnVsbDtcblx0dGhpcy5QYXJlbnQgPSBudWxsO1xuXHR0aGlzLlRhZ05hbWUgPSB0YWc7XG5cdHRoaXMuU2hvcnRjdXQgPSBhdHRyaWJ1dGVzLnNob3J0Y3V0IHx8IG51bGw7XG5cdGRlbGV0ZSBhdHRyaWJ1dGVzW1wic2hvcnRjdXRcIl07XG5cdHRoaXMuVG9vbFRpcCA9IGF0dHJpYnV0ZXMudG9vbHRpcCB8fCBudWxsO1xuXHRkZWxldGUgYXR0cmlidXRlc1tcInRvb2x0aXBcIl07XG5cdHRoaXMuRGlzcGxheUNsYXNzID0gYXR0cmlidXRlcy5kaXNwbGF5Y2xhc3MgfHwgbnVsbDtcblx0ZGVsZXRlIGF0dHJpYnV0ZXNbXCJkaXNwbGF5Y2xhc3NcIl07XG5cdHRoaXMuQXR0ciA9IGF0dHJpYnV0ZXM7XG5cdHRoaXMuQXR0ck1hdGNoID0gZnVuY3Rpb24gKGF0dHIsIHZhbHVlKSB7XG5cdFx0cmV0dXJuIHRoaXMuQXR0clthdHRyXSA9PT0gdmFsdWU7XG5cdH1cblx0dGhpcy5pc0luc3RhbmNlID0gZnVuY3Rpb24gKGh0bWxub2RlKSB7XG5cdFx0aWYgKGh0bWxub2RlLm5vZGVUeXBlICE9IDEpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0aWYgKGh0bWxub2RlLnRhZ05hbWUudG9Mb3dlckNhc2UoKSAhPSB0aGlzLlRhZ05hbWUudG9Mb3dlckNhc2UoKSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRmb3IgKGxldCBhdHRyIGluIHRoaXMuQXR0cikge1xuXHRcdFx0bGV0IGF0cmlidXRlID0gdGhpcy5BdHRyW2F0dHJdO1xuXHRcdFx0aWYgKGF0cmlidXRlIGluc3RhbmNlb2YgU3R5bGVBdHRyKSB7XG5cdFx0XHRcdGlmKGh0bWxub2RlLnN0eWxlW2F0cmlidXRlLmF0dHJdPT1cIlwiKXtyZXR1cm4gZmFsc2U7fVxuXHRcdFx0fSBlbHNlIGlmIChhdHJpYnV0ZSBpbnN0YW5jZW9mIEdlbmVyYWxBdHRyKSB7XG5cdFx0XHRcdGlmIChodG1sbm9kZS5hdHRyaWJ1dGVzW3Byb3BdLnZhbHVlICE9IHRoaXMuQXR0cltwcm9wXSkgcmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXHR0aGlzLm5ldyA9IGZ1bmN0aW9uICgpIHtcblx0XHRsZXQgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRoaXMuVGFnTmFtZSk7XG5cdFx0dGhpcy5VcGRhdGVBdHRyaWJ1dGVzKGVsKTtcblx0XHRyZXR1cm4gZWw7XG5cdH1cblx0dGhpcy5VcGRhdGVBdHRyaWJ1dGVzID0gZnVuY3Rpb24gKG5vZGUpIHtcblx0XHRmb3IgKGxldCBhdHRyIGluIHRoaXMuQXR0cikge1xuXHRcdFx0bGV0IGF0cmlidXRlID0gdGhpcy5BdHRyW2F0dHJdO1xuXHRcdFx0aWYgKGF0cmlidXRlIGluc3RhbmNlb2YgU3R5bGVBdHRyKSB7XG5cdFx0XHRcdG5vZGUuc3R5bGVbYXRyaWJ1dGUuYXR0cl09YXRyaWJ1dGUudmFsdWU7XG5cdFx0XHR9IGVsc2UgaWYgKGF0cmlidXRlIGluc3RhbmNlb2YgR2VuZXJhbEF0dHIpIHtcblx0XHRcdFx0bm9kZS5zZXRBdHRyaWJ1dGUoYXR0ciwgdGhpcy5BdHRyW2F0dHJdKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gTWFueShpZCwgdGFnLCBhdHRyaWJ1dGVzLCBibG93KSB7XG5cdHRoaXMuaXNDb21wYXRpYmxlID0gZnVuY3Rpb24gKG5vZGUpIHtcblx0XHRpZiAobm9kZS5ub2RlVHlwZSAhPSAxKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdGlmIChub2RlLnRhZ05hbWUudG9Mb3dlckNhc2UoKSAhPSB0aGlzLlRhZ05hbWUudG9Mb3dlckNhc2UoKSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fTtcblx0QmFzaWMuY2FsbCh0aGlzLCBpZCwgdGFnLCBhdHRyaWJ1dGVzLGJsb3cpO1xuXHQvL1x0T2JqZWN0LmZyZWV6ZSh0aGlzKTtcbn1cbmZ1bmN0aW9uIE11bHRpQXR0cihpZCwgdGFnKSB7XG5cdHRoaXMuSWQgPSBpZDtcblx0dGhpcy5UYWdOYW1lID0gdGFnO1xuXHR0aGlzLmNoaWxkcmVuID0ge307XG5cdHRoaXMuRmluZEJ5Q2xhc3MgPSBmdW5jdGlvbiAoY2xhc3NuYW1lKSB7XG5cdFx0Zm9yIChsZXQgY2hpbGQgaW4gdGhpcy5jaGlsZHJlbikge1xuXHRcdFx0aWYgKHRoaXMuY2hpbGRyZW5bY2hpbGRdLkF0dHJNYXRjaChcImNsYXNzXCIsIGNsYXNzbmFtZSkpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuY2hpbGRyZW5bY2hpbGRdO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHR0aGlzLkFkZCA9IGZ1bmN0aW9uIChzdWJpZCwgdmFsdWUsIGF0dHJpYnV0ZXMsbWltZSkge1xuXHRcdGF0dHJpYnV0ZXMgPSBhdHRyaWJ1dGVzIHx8IHt9O1xuXHRcdGF0dHJpYnV0ZXNbdmFsdWUuYXR0cl0gPSB2YWx1ZTtcblx0XHR0aGlzLmNoaWxkcmVuW3N1YmlkXSA9IG5ldyBNYW55KHRoaXMuSWQgKyBcIl9cIiArIHN1YmlkLCB0aGlzLlRhZ05hbWUsIGF0dHJpYnV0ZXMsIG1pbWUpO1xuXHRcdHRoaXMuY2hpbGRyZW5bc3ViaWRdLlN1cGVySWQgPSB0aGlzLklkO1xuXHRcdHRoaXMuY2hpbGRyZW5bc3ViaWRdLlBhcmVudCA9IHRoaXM7XG5cdFx0T2JqZWN0LmZyZWV6ZSh0aGlzLmNoaWxkcmVuW3N1YmlkXSk7XG5cdH1cblx0dGhpcy5SZW1vdmUgPSBmdW5jdGlvbiAoY2xhc25hbWUpIHtcblx0XHRkZWxldGUgdGhpcy5jaGlsZHJlbltzdWJpZF07XG5cdH07XG59XG5mdW5jdGlvbiBNdWx0aUNsYXNzKGlkLCB0YWcpIHtcblx0dGhpcy5JZCA9IGlkO1xuXHR0aGlzLlRhZ05hbWUgPSB0YWc7XG5cdHRoaXMuY2hpbGRyZW4gPSB7fTtcblx0dGhpcy5GaW5kQnlDbGFzcyA9IGZ1bmN0aW9uIChjbGFzc25hbWUpIHtcblx0XHRmb3IgKGxldCBjaGlsZCBpbiB0aGlzLmNoaWxkcmVuKSB7XG5cdFx0XHRpZiAodGhpcy5jaGlsZHJlbltjaGlsZF0uQXR0ck1hdGNoKFwiY2xhc3NcIiwgY2xhc3NuYW1lKSkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5jaGlsZHJlbltjaGlsZF07XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHRoaXMuQWRkID0gZnVuY3Rpb24gKHN1YmlkLCBjbGFzc25hbWUsIGF0dHJpYnV0ZXMpIHtcblx0XHRhdHRyaWJ1dGVzID0gYXR0cmlidXRlcyB8fCB7fTtcblx0XHRhdHRyaWJ1dGVzLmNsYXNzID0gY2xhc3NuYW1lO1xuXHRcdHRoaXMuY2hpbGRyZW5bc3ViaWRdID0gbmV3IE1hbnkodGhpcy5JZCArIFwiX1wiICsgc3ViaWQsIHRoaXMuVGFnTmFtZSwgYXR0cmlidXRlcywgXCJjbGFzc1wiKTtcblx0XHR0aGlzLmNoaWxkcmVuW3N1YmlkXS5TdXBlcklkID0gdGhpcy5JZDtcblx0XHR0aGlzLmNoaWxkcmVuW3N1YmlkXS5QYXJlbnQgPSB0aGlzO1xuXHRcdE9iamVjdC5mcmVlemUodGhpcy5jaGlsZHJlbltzdWJpZF0pO1xuXHR9XG5cdHRoaXMuUmVtb3ZlID0gZnVuY3Rpb24gKGNsYXNuYW1lKSB7XG5cdFx0ZGVsZXRlIHRoaXMuY2hpbGRyZW5bc3ViaWRdO1xuXHR9XG59XG5cblxuLy89PT09PT09PT09PT09PUV4cGVyaW1lbnRhbFxuZnVuY3Rpb24gTXVsdGlTdHlsZShpZCwgdGFnKSB7XG5cdHRoaXMuSWQgPSBpZDtcblx0dGhpcy5UYWdOYW1lID0gdGFnO1xuXHR0aGlzLmNoaWxkcmVuID0ge307XG5cdHRoaXMuRmluZEJ5Q2xhc3MgPSBmdW5jdGlvbiAoY2xhc3NuYW1lKSB7XG5cdFx0Zm9yIChsZXQgY2hpbGQgaW4gdGhpcy5jaGlsZHJlbikge1xuXHRcdFx0aWYgKHRoaXMuY2hpbGRyZW5bY2hpbGRdLkF0dHJNYXRjaChcImNsYXNzXCIsIGNsYXNzbmFtZSkpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuY2hpbGRyZW5bY2hpbGRdO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHR0aGlzLkFkZCA9IGZ1bmN0aW9uIChzdWJpZCwgdmFsdWUsIGF0dHJpYnV0ZXMsbWltZSkge1xuXHRcdGF0dHJpYnV0ZXMgPSBhdHRyaWJ1dGVzIHx8IHt9O1xuXHRcdGF0dHJpYnV0ZXNbdmFsdWUuYXR0cl0gPSB2YWx1ZTtcblx0XHR0aGlzLmNoaWxkcmVuW3N1YmlkXSA9IG5ldyBNYW55KHRoaXMuSWQgKyBcIl9cIiArIHN1YmlkLCB0aGlzLlRhZ05hbWUsIGF0dHJpYnV0ZXMsIG1pbWUpO1xuXHRcdHRoaXMuY2hpbGRyZW5bc3ViaWRdLlN1cGVySWQgPSB0aGlzLklkO1xuXHRcdHRoaXMuY2hpbGRyZW5bc3ViaWRdLlBhcmVudCA9IHRoaXM7XG5cdFx0T2JqZWN0LmZyZWV6ZSh0aGlzLmNoaWxkcmVuW3N1YmlkXSk7XG5cdH1cblx0dGhpcy5SZW1vdmUgPSBmdW5jdGlvbiAoc3ViaWQpIHtcblx0XHRkZWxldGUgdGhpcy5jaGlsZHJlbltzdWJpZF07XG5cdH07XG59XG5cblNpbmdsZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEJhc2ljLnByb3RvdHlwZSk7XG5NYW55LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFzaWMucHJvdG90eXBlKTtcbk9iamVjdC5mcmVlemUoU2luZ2xlKTtcbk9iamVjdC5mcmVlemUoTWFueSk7XG4qLyIsImltcG9ydCB7U2luZ2xlLFN0eWxlVGFnfSBmcm9tICcuL3dyaWl0LXRhZ3MnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAodGhhdCkge1xuXHRsZXQgYWRkID0gZnVuY3Rpb24gKGJ1dHRvbikge1xuXHRcdGxldCBuZXdCID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG5cdFx0bmV3Qi5zZXRBdHRyaWJ1dGUoXCJkYXRhLXdyaWl0LWNvbW1hbmRJZFwiLCBidXR0b24uSWQpO1xuXHRcdG5ld0Iuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgYnV0dG9uLkljb25DbGFzcyk7XG5cdFx0XG5cdFx0aWYoIGJ1dHRvbi5Ub29sVGlwICE9PSBudWxsKXtcblx0XHRcdGxldCBzcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuXHRcdFx0c3Bhbi5pbm5lckhUTUwgPSBidXR0b24uVG9vbFRpcDtcblx0XHRcdG5ld0IuYXBwZW5kQ2hpbGQoc3Bhbik7XG5cdFx0fVxuXHRcdFxuXHRcdHRoYXQuYnV0dG9uc1tidXR0b24uSWRdID0gbmV3Qjtcblx0XHR0aGF0LnRhZ3NbYnV0dG9uLklkXSA9IGJ1dHRvbjtcblx0XHR0aGF0Lm1lbnUuYXBwZW5kKG5ld0IpO1xuXHRcdHJldHVybiBidXR0b24uSWQ7XG5cdH07XG5cdHRoaXMuQWRkQnV0dG9uID0gZnVuY3Rpb24gKHRhZykge1xuXHRcdGlmICh0YWcgaW5zdGFuY2VvZiBTaW5nbGUpIHtcblx0XHRcdGFkZCh0YWcpO1xuXHRcdC8qfSBlbHNlIGlmIChidXR0b24gaW5zdGFuY2VvZiBNdWx0aUNsYXNzKSB7XG5cdFx0XHRmb3IgKGxldCBwcm9wIGluIGJ1dHRvbi5jaGlsZHJlbikge1xuXHRcdFx0XHRhZGQoYnV0dG9uLmNoaWxkcmVuW3Byb3BdKTtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKGJ1dHRvbiBpbnN0YW5jZW9mIE11bHRpQXR0cikge1xuXHRcdFx0Zm9yIChsZXQgcHJvcCBpbiBidXR0b24uY2hpbGRyZW4pIHtcblx0XHRcdFx0YWRkKGJ1dHRvbi5jaGlsZHJlbltwcm9wXSk7XG5cdFx0XHR9XG5cdFx0fSovXG5cdFx0fWVsc2UgaWYodGFnIGluc3RhbmNlb2YgU3R5bGVUYWcpe1xuXHRcdFx0XG5cdFx0fVxuXHRcdC8vcmV0dXJuIGJ1dHRvbjtcblx0fTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdBZGRCdXR0b24nLCB7XG5cdFx0d3JpdGFibGU6IGZhbHNlLFxuXHRcdGVudW1lcmFibGU6IHRydWUsXG5cdFx0Y29uZmlndXJhYmxlOiB0cnVlXG5cdH0pO1xufSIsIi8qZ2xvYmFsIGRvY3VtZW50LHdpbmRvdywkLGNvbnNvbGUsc2V0SW50ZXJ2YWwsQmFzaWMsTWFueSxNdWx0aUNsYXNzLFdyaWl0U3R5bGUscmVnZXhwKi9cbmltcG9ydCBNb2R1bGUgZnJvbSAnLi9Nb2R1bGUnO1xuaW1wb3J0IHtTaW5nbGUsU3R5bGVUYWcsU3R5bGVBdHRyfSBmcm9tICcuL3RhZ3MnO1xuaW1wb3J0IFRvb2xiYXIgZnJvbSAnLi93cmlpdC10b29sYmFyJztcbmltcG9ydCBpVGV4dEFyZWEgZnJvbSAnLi9pVGV4dEFyZWEnO1xuaW1wb3J0IEtleUhhbmRsZXIgZnJvbSAnLi9rZXloYW5kbGVyJztcbmltcG9ydCAqIGFzIG1vZHVsZXMgZnJvbSAnLi9tb2R1bGVzJztcblxudmFyIEdQRUd1aSA9IHtcblx0ZW5naW5lOiB7XG5cdFx0bWljcm86IDEsXG5cdFx0bWluaTogMixcblx0XHRub3JtYWw6IDMsXG5cdFx0ZXh0ZW5kZWQ6IDRcblx0fSxcblx0dmlzdWFsOiB7XG5cdFx0b25zZWxlY3Rpb246IDEsXG5cdFx0YWx3YXlzOiAyLFxuXHRcdGFsdGVybmF0ZTogM1xuXHR9XG59O1xudmFyIEdQRVRhZ3MgPSB7XG5cdGNvbW1hbmQ6IDAsXG5cdHNwYW46IDEsXG5cdGlkOiAyLFxuXHR0YWc6IDMsXG5cdHBhcmFncmFwaDogMTAsXG5cdG11bHRpU3BhbjogMTEsXG5cdG11bHRpQ2xhc3M6IDEyLFxuXHRtdWx0aU5hbWU6IDEzLFxuXHRvbmx5SW5zZXJ0OiAyMSxcblx0bXVsdGlPbmx5SW5zZXJ0OiAzMSxcblx0bGlzdDogNTFcbn07XG4vLzEtMTAgQXBlcnR1cmEgeSBDaWVycmVcbi8vMTEtMjAgQXBlcnR1cmEgeSBDaWVycmUsIE3Dumx0aXBsZXMgVmFsb3Jlc1xuLy8yMS0zMCBBcGVydHVyYVxuLy8zMS00MCBBcGVydHVyYSwgTcO6bHRpcGxlcyBWYWxvcmVzXG4vLzUxLXh4eCBUb2RhcyBsYXMgZGVtw6FzKERlZmluaXIgSW5kZXBlbmRpZW50ZW1lbnRlKVxuZnVuY3Rpb24gTWF0Y2hOVCh0ZXh0LCB0YWcpIHtcblx0bGV0IHggPSB0ZXh0Lm1hdGNoKHRhZyk7XG5cdHJldHVybiB4ID8geC5sZW5ndGggOiAwO1xufVxuZnVuY3Rpb24gZmluZE5UKHR4dCwgdGFnKSB7XG5cdHZhciBzbyA9IHJlZ2V4cChcIltfX1RhZ19fXVwiKTtcblx0dmFyIHggPSB0eHQucmVwbGFjZShyZWdleHAodGFnLCBcImdcIiksIFwiW19fVGFnX19dXCIpO1xuXHR4ID0geC5tYXRjaChzbyk7XG5cdHJldHVybiB4ID8geC5sZW5ndGggOiAwO1xufVxuXG5mdW5jdGlvbiBzdHJfcmVwbGFjZShzZWFyY2gsIHJlcGxhY2UsIHN1YmplY3QpIHtcblx0dmFyIHMgPSBzdWJqZWN0O1xuXHR2YXIgcmEgPSByIGluc3RhbmNlb2YgQXJyYXksXG5cdFx0c2EgPSBzIGluc3RhbmNlb2YgQXJyYXksXG5cdFx0ZiA9IFtdLmNvbmNhdChzZWFyY2gpLFxuXHRcdHIgPSBbXS5jb25jYXQocmVwbGFjZSksXG5cdFx0aSA9IChzID0gW10uY29uY2F0KHMpKS5sZW5ndGgsXG5cdFx0aiA9IDA7XG5cblx0d2hpbGUgKGogPSAwLCBpLS0pIHtcblx0XHRpZiAoc1tpXSkge1xuXHRcdFx0d2hpbGUgKHNbaV0gPSAoc1tpXSArICcnKS5zcGxpdChmW2pdKS5qb2luKHJhID8gcltqXSB8fCBcIlwiIDogclswXSksICsraiBpbiBmKSB7fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gc2EgPyBzIDogc1swXTtcbn1cblxudmFyIHRvdGFsR1BFVCA9IDA7XG52YXIgX2kgPSAnPGxpIGlkPVwiaVwiIG5hbWU9XCJlbVwiIHZhbHVlPVwiM1wiPjwvbGk+JztcbnZhciBfdSA9ICc8bGkgaWQ9XCJ1XCIgdmFsdWU9XCIxXCIgZXh0cmE9XFwnc3R5bGU6dGV4dC1kZWNvcmF0aW9uOnVuZGVybGluZVxcJz48L2xpPic7XG52YXIgX3QgPSAnPGxpIGlkPVwidFwiIHZhbHVlPVwiMVwiIGV4dHJhPVxcJ3N0eWxlOnRleHQtZGVjb3JhdGlvbjpsaW5lLXRocm91Z2hcXCc+PC9saT4nO1xudmFyIF9vID0gJzxsaSBpZD1cIm9cIiB2YWx1ZT1cIjFcIiBleHRyYT1cXCdzdHlsZTp0ZXh0LWRlY29yYXRpb246b3ZlcmxpbmVcXCc+PC9saT4nO1xudmFyIF9zdWIgPSAnPGxpIGlkPVwic3ViXCIgdmFsdWU9XCIyXCI+PC9saT4nO1xudmFyIF9zdXAgPSAnPGxpIGlkPVwic3VwXCIgdmFsdWU9XCIyXCI+PC9saT4nO1xudmFyIF91bCA9ICc8bGkgaWQ9XCJ1bFwiIHZhbHVlPVwiNTFcIj48L2xpPic7XG52YXIgX29sID0gJzxsaSBpZD1cIm9sXCIgdmFsdWU9XCI1MVwiPjwvbGk+JztcbnZhciBfc2l6ZSA9ICc8bGkgaWQ9XCJmb250c2l6ZVwiIHZhbHVlPVwiMTFcIiBleHRyYT1cXCdzdHlsZTpmb250LXNpemVcXCc+PC9saT4nO1xudmFyIF9jb2xvciA9ICc8bGkgaWQ9XCJjb2xvclwiIHZhbHVlPVwiMTFcIiBleHRyYT1cXCdzdHlsZTpjb2xvclxcJyBjbGFzcz1cImNib3RvblwiPjwvbGk+JztcbnZhciBfaGlnaGxpZ2h0ID0gJzxsaSBpZD1cImhpZ2hsaWdodFwiIHZhbHVlPVwiMTFcIiBleHRyYT1cXCdzdHlsZTpiYWNrZ3JvdW5kLWNvbG9yXFwnIGNsYXNzPVwiY2JvdG9uXCIgc0NJPVwiYmFja2dyb3VuZC1jb2xvclwiPjwvbGk+JztcbnZhciBfc2hhZG93ID0gJzxsaSBpZD1cInRleHRzaGFkb3dcIiB2YWx1ZT1cIjExXCIgZXh0cmE9XFwnc3R5bGU6dGV4dC1zaGFkb3c6KC4qPykgMXB4IDFweCAxcHhcXCcgY2xhc3M9XCJjYm90b25cIiBzQ0k9XCJ0ZXh0LXNoYWRvd1wiPjwvbGk+JztcbnZhciBfbCA9ICc8bGkgaWQ9XCJMXCIgZXh0cmE9XCJzdHlsZTp0ZXh0LWFsaWduOmxlZnRcIiB2YWx1ZT1cIjEwXCI+PC9saT4nO1xudmFyIF9jID0gJzxsaSBpZD1cIkNcIiBleHRyYT1cInN0eWxlOnRleHQtYWxpZ246Y2VudGVyXCIgdmFsdWU9XCIxMFwiPjwvbGk+JztcbnZhciBfciA9ICc8bGkgaWQ9XCJSXCIgZXh0cmE9XCJzdHlsZTp0ZXh0LWFsaWduOnJpZ2h0XCIgdmFsdWU9XCIxMFwiPjwvbGk+JztcbnZhciBfaiA9ICc8bGkgaWQ9XCJKXCIgZXh0cmE9XCJzdHlsZTp0ZXh0LWFsaWduOmp1c3RpZnlcIiB2YWx1ZT1cIjEwXCI+PC9saT4nO1xudmFyIF9jaXRlID0gJzxsaSBpZD1cImNpdGVcIiB2YWx1ZT1cIjJcIj48L2xpPic7XG52YXIgX3F1b3RlID0gJzxsaSBpZD1cInF1b3RlXCIgbmFtZT1cInFcIiB2YWx1ZT1cIjNcIj48L2xpPic7XG52YXIgX2UgPSAnPGxpIGlkPVwiYlwiIG5hbWU9XCJzdHJvbmdcIiB2YWx1ZT1cIjNcIj48L2xpPic7XG52YXIgX2Vtb3RpYyA9ICc8bGkgaWQ9XCJlbW90aWNcIiBuYW1lPVwic3BhblwiIHZhbHVlPVwiMzFcIiBleHRyYT1cXCdzcmNcXCc+PC9saT4nO1xudmFyIF9obCA9ICc8bGkgaWQ9XCJoclwiIG5hbWU9XCJoclwiIHZhbHVlPVwiMjFcIj48L2xpPic7XG52YXIgX3VuZm9ybWF0ID0gJzxsaSBpZD1cInVuZm9ybWFydFwiIHZhbHVlPVwiMFwiPjwvbGk+JztcblxudmFyIHRlbXBsYXRlID0gJzxzZWN0aW9uIGNsYXNzPVwid3JpaXQtYm94XCI+PG1lbnU+PC9tZW51PjxkaXYgZGF0YS13cmlpdC1yb2xlPVwidGV4dC1hcmVhXCI+PC9kaXY+PGRpdiBjbGFzcz1cInRhZ2lcIj48L2Rpdj48L3NlY3Rpb24+JztcbmxldCBpbnN0YWxsZWRwbHVnaW5zID0gW107XG5cbmZ1bmN0aW9uIGdldFRhZyhub2RlLCB0YWdzKSB7XG5cdGZvciAobGV0IHByb3AgaW4gdGFncykge1xuXHRcdGxldCB0YWcgPSB0YWdzW3Byb3BdO1xuXHRcdGlmICh0YWcuaXNJbnN0YW5jZShub2RlKSkge1xuXHRcdFx0cmV0dXJuIHRhZztcblx0XHR9XG5cdH1cblx0cmV0dXJuIG51bGw7XG59XG5mdW5jdGlvbiBmaW5kQWxsVGFncyhub2RlLCBjb250YWluZXIsIHRhZ3MpIHtcblx0Zm9yIChsZXQgbm5hbWUgaW4gbm9kZS5jaGlsZHJlbikge1xuXHRcdGxldCBuZXdub2RlID0gbm9kZS5jaGlsZHJlbltubmFtZV07XG5cdFx0aWYgKG5ld25vZGUubm9kZVR5cGUgPT09IDEpIHtcblx0XHRcdGxldCB0YWcgPSBnZXRUYWcobmV3bm9kZSwgdGFncyk7XG5cdFx0XHRpZiAodGFnICE9PSBudWxsKSB7XG5cdFx0XHRcdGNvbnRhaW5lclt0YWcuSWRdID0gdGFnO1xuXHRcdFx0fVxuXHRcdFx0ZmluZEFsbFRhZ3MobmV3bm9kZSwgY29udGFpbmVyLCB0YWdzKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHR9XG59XG5mdW5jdGlvbiBOb2RlQW5hbHlzaXModGFncywgbWFpbmNvbnRhaW5lcikge1xuXHRsZXQgbGVmdCA9IHt9O1xuXHRsZXQgbWlkZGxlID0ge307XG5cdGxldCByaWdodCA9IHt9O1xuXHRsZXQgY29udGFpbiA9IHt9O1xuXHRsZXQgbGVmdE5vZGUgPSB0aGlzLnN0YXJ0Q29udGFpbmVyLnBhcmVudE5vZGU7XG5cdGxldCByaWdodE5vZGUgPSB0aGlzLmVuZENvbnRhaW5lci5wYXJlbnROb2RlO1xuXHRsZXQgY29tbW9uID0gbnVsbDtcblx0aWYgKGxlZnROb2RlID09PSByaWdodE5vZGUpIHtcblx0XHRjb21tb24gPSBsZWZ0Tm9kZTtcblx0XHRsZXQgaW5zaWRlciA9IHRoaXMuY2xvbmVDb250ZW50cygpO1xuXHRcdGZpbmRBbGxUYWdzKGluc2lkZXIsIG1pZGRsZSwgdGFncyk7XG5cdH0gZWxzZSB7XG5cdFx0d2hpbGUgKGxlZnROb2RlICE9PSB0aGlzLmNvbW1vbkFuY2VzdG9yQ29udGFpbmVyKSB7XG5cdFx0XHRsZXQgdGFnID0gZ2V0VGFnKGxlZnROb2RlLCB0YWdzKTtcblx0XHRcdGlmICh0YWcgIT09IG51bGwpIHtcblx0XHRcdFx0bGVmdFt0YWcuSWRdID0gdGFnO1xuXHRcdFx0fVxuXHRcdFx0bGVmdE5vZGUgPSBsZWZ0Tm9kZS5wYXJlbnROb2RlO1xuXHRcdH1cblx0XHR3aGlsZSAocmlnaHROb2RlICE9PSB0aGlzLmNvbW1vbkFuY2VzdG9yQ29udGFpbmVyKSB7XG5cdFx0XHRsZXQgdGFnID0gZ2V0VGFnKHJpZ2h0Tm9kZSwgdGFncyk7XG5cdFx0XHRpZiAodGFnICE9PSBudWxsKSB7XG5cdFx0XHRcdHJpZ2h0W3RhZy5JZF0gPSB0YWc7XG5cdFx0XHR9XG5cdFx0XHRyaWdodE5vZGUgPSByaWdodE5vZGUucGFyZW50Tm9kZTtcblx0XHR9XG5cdFx0Y29tbW9uID0gdGhpcy5jb21tb25BbmNlc3RvckNvbnRhaW5lcjtcblx0fVxuXHR3aGlsZSAoY29tbW9uICE9PSBtYWluY29udGFpbmVyKSB7XG5cdFx0bGV0IHRhZyA9IGdldFRhZyhjb21tb24sIHRhZ3MpO1xuXHRcdGlmICh0YWcgIT09IG51bGwpIHtcblx0XHRcdGNvbnRhaW5bdGFnLklkXSA9IHRhZztcblx0XHR9XG5cdFx0Y29tbW9uID0gY29tbW9uLnBhcmVudE5vZGU7XG5cdH1cblx0bGV0IHBsdWdzID0ge307XG5cdGZvciAobGV0IHByb3AgaW4gdGFncykge1xuXHRcdGxldCB0YWcgPSB0YWdzW3Byb3BdO1xuXHRcdGxldCBidXR0b24gPSBtYWluY29udGFpbmVyLnBhcmVudE5vZGUucXVlcnlTZWxlY3RvckFsbChcIltkYXRhLXdyaWl0LWNvbW1hbmRJZD1cIiArIHRhZy5JZCArIFwiXVwiKVswXTtcblx0XHRsZXQgZ2xvdyA9IGZhbHNlO1xuXHRcdGlmICh0YWcgaW5zdGFuY2VvZiBTaW5nbGUpIHtcblx0XHRcdHBsdWdzW3RhZy5JZF0gPSB7XG5cdFx0XHRcdGlzU29ycm91bmRlZDogY29udGFpblt0YWcuSWRdICE9PSB1bmRlZmluZWQsXG5cdFx0XHRcdGlzQ29udGFpbmVkOiBtaWRkbGVbdGFnLklkXSAhPT0gdW5kZWZpbmVkLFxuXHRcdFx0XHRpc09wZW5lZDogcmlnaHRbdGFnLklkXSAhPT0gdW5kZWZpbmVkLFxuXHRcdFx0XHRpc0Nsb3NlZDogbGVmdFt0YWcuSWRdICE9PSB1bmRlZmluZWQsXG5cdFx0XHRcdGRlZXA6IDBcblx0XHRcdH07XG5cdFx0XHRpZiAocGx1Z3NbdGFnLklkXS5pc1NvcnJvdW5kZWQpIHtcblx0XHRcdFx0YnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuXHRcdFx0XHRnbG93PXRydWU7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRidXR0b24uY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICh0YWcgaW5zdGFuY2VvZiBNYW55KSB7XG5cdFx0XHRwbHVnc1t0YWcuU3VwZXJJZF0gPSB7XG5cdFx0XHRcdGlzU29ycm91bmRlZDogcGx1Z3NbdGFnLlN1cGVySWRdICE9PSBudWxsID8gcGx1Z3NbdGFnLlN1cGVySWRdLmlzU29ycm91bmRlZCB8fCBjb250YWluW3RhZy5JZF0gIT09IG51bGwgOiBjb250YWluW3RhZy5JZF0sXG5cdFx0XHRcdGlzQ29udGFpbmVkOiBwbHVnc1t0YWcuU3VwZXJJZF0gIT09IG51bGwgPyBwbHVnc1t0YWcuU3VwZXJJZF0uaXNDb250YWluZWQgfHwgbWlkZGxlW3RhZy5JZF0gIT09IG51bGwgOiBtaWRkbGVbdGFnLklkXSxcblx0XHRcdFx0aXNPcGVuZWQ6IHBsdWdzW3RhZy5TdXBlcklkXSAhPT0gbnVsbCA/IHBsdWdzW3RhZy5TdXBlcklkXS5pc09wZW5lZCB8fCByaWdodFt0YWcuSWRdICE9PSBudWxsIDogcmlnaHRbdGFnLklkXSAhPT0gbnVsbCxcblx0XHRcdFx0aXNDbG9zZWQ6IHBsdWdzW3RhZy5TdXBlcklkXSAhPT0gbnVsbCA/IHBsdWdzW3RhZy5TdXBlcklkXS5pc0Nsb3NlZCB8fCBsZWZ0W3RhZy5JZF0gIT09IG51bGwgOiBsZWZ0W3RhZy5JZF0gIT09IG51bGwsXG5cdFx0XHRcdGRlZXA6IDBcblx0XHRcdH07XG5cdFx0XHRpZiAoY29udGFpblt0YWcuSWRdICE9PSBudWxsKSB7XG5cdFx0XHRcdGdsb3c9dHJ1ZTtcblx0XHRcdFx0YnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0YnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRsZXQgZG9vPXRhZy5NaW1lO1xuXHRcdGlmIChnbG93ICYmIGRvbykge1xuXHRcdFx0YnV0dG9uLnN0eWxlW1wiYm94LXNoYWRvd1wiXSA9IFwiaW5zZXQgIzAwZmYwMCAxcHggMXB4IDUwcHhcIjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YnV0dG9uLnN0eWxlW1wiYm94LXNoYWRvd1wiXSA9IFwiXCI7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBwbHVncztcbn1cbmZ1bmN0aW9uIGFkZHRvdGFnaShlKSB7XG5cdCQodGhpcykucGFyZW50KCkuZmluZCgnLnRhZ2knKS5odG1sKCcnKTtcblx0dmFyIHggPSAkKGRvY3VtZW50LmdldFNlbGVjdGlvbigpLmFuY2hvck5vZGUucGFyZW50Tm9kZSk7XG5cdHZhciBpID0gMDtcblx0d2hpbGUgKHguZ2V0KDApICE9PSB0aGlzKSB7XG5cdFx0dmFyIGxpID0gJCgnPHNwYW4+JyArIHguZ2V0KDApLmxvY2FsTmFtZSArICc8L3NwYW4+Jyk7XG5cdFx0JCh0aGlzKS5wYXJlbnQoKS5maW5kKCcudGFnaScpLnByZXBlbmQobGkpO1xuXHRcdHggPSB4LnBhcmVudCgpO1xuXHR9XG59XG5mdW5jdGlvbiBXcmlpdChwYXJlbnQsIGNmZykge1xuXHRsZXQgcHJpdmF0ZURhdGEgPSBuZXcgV2Vha01hcCgpO1xuXHRsZXQgcHJvcHMgPSB7XG5cdFx0ZGF0YWluZGV4OiBbT2JqZWN0LmNyZWF0ZShudWxsKV0sXG5cdFx0ZGF0YTogT2JqZWN0LmNyZWF0ZShudWxsKVxuXHR9O1xuXHRsZXQgaW5kZXhlcyA9IFtPYmplY3QuY3JlYXRlKG51bGwpXTtcblx0dmFyIGNvbXBpbGVkID0gJCh0ZW1wbGF0ZSk7XG5cdHRoaXMudGV4dGFyZWEgPSBjb21waWxlZC5maW5kKFwiW2RhdGEtd3JpaXQtcm9sZT10ZXh0LWFyZWFdXCIpO1xuXHR0aGlzLnRleHRhcmVhLmh0bWwocGFyZW50Lmh0bWwoKSk7XG5cdHBhcmVudC5yZXBsYWNlV2l0aChjb21waWxlZCk7XG5cdHRoaXMubWVudSA9IGNvbXBpbGVkLmZpbmQoJ21lbnU6ZXEoMCknKTtcblx0dGhpcy5jZmcgPSAkLmV4dGVuZCh7fSwgY2ZnLCB7XG5cdFx0TW9kdWxlczogaW5zdGFsbGVkcGx1Z2luc1xuXHR9KTtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXHR2YXIgcHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHRoYXQpO1xuXHR0aGlzLmh0bWwgPSB7XG5cdFx0Z2V0IHNlbGVjdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLmdldFNlbGVjdGlvbigwKS5jb29yZDtcblx0XHR9LFxuXHRcdGdldFNlbGVjdGlvbjogZnVuY3Rpb24gKG4pIHtcblx0XHRcdG4gPSBuIHx8IDA7XG5cdFx0XHR2YXIgaHRtbCA9IHRoYXQudGV4dGFyZWEuaHRtbCgpO1xuXHRcdFx0dmFyIGNvb3JkID0gdGhhdC50ZXh0YXJlYS5nZXRTZWxlY3Rpb24obik7XG5cdFx0XHR2YXIgcmFuZ2UgPSBjb29yZC5yYW5nO1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0Z2V0IHN0YXJ0KCkge1xuXHRcdFx0XHRcdHJldHVybiBjb29yZC5zdGFydDtcblx0XHRcdFx0fSxcblx0XHRcdFx0Z2V0IGVuZCgpIHtcblx0XHRcdFx0XHRyZXR1cm4gY29vcmQuZW5kO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRnZXQgcHJlKCkge1xuXHRcdFx0XHRcdHJldHVybiBodG1sLnN1YnN0cmluZygwLCBjb29yZC5zdGFydCk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGdldCBzZWwoKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGh0bWwuc3Vic3RyaW5nKGNvb3JkLnN0YXJ0LCBjb29yZC5lbmQpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRnZXQgcG9zdCgpIHtcblx0XHRcdFx0XHRyZXR1cm4gaHRtbC5zdWJzdHJpbmcoY29vcmQuZW5kLCBodG1sLmxlbnRnaCk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGdldCB0ZXh0KCkge1xuXHRcdFx0XHRcdHJldHVybiBodG1sO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRzZXQgdGV4dCh2KSB7XG5cdFx0XHRcdFx0dGhhdC50ZXh0YXJlYS5odG1sKHYpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRnZXQgdmlzdWFsKCkge1xuXHRcdFx0XHRcdHJldHVybiByYW5nZTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHR9XG5cdH07XG5cdHRoaXMuc2VsZWN0aW9uID0gZnVuY3Rpb24gKHRhZ2lkKSB7XG5cdFx0cmV0dXJuIHRoaXMuTW9kdWxlc1t0YWdpZF0uc2VsZWN0aW9uO1xuXHR9O1xuXHR0aGlzLnRleHRhcmVhLktleUhhbmRsZXIoKTsge1xuXHRcdGxldCBibG9jayA9IGZhbHNlO1xuXHRcdGxldCBpbml0aWFsVmFsdWUgPSB0aGlzLnRleHRhcmVhLmh0bWwoKS50cmltKCk7XG5cdFx0bGV0IHN0b3JlSW5mbyA9IGZ1bmN0aW9uIChmb3JjZSkge1xuXHRcdFx0bGV0IGluZGV4ID0gcHJpdmF0ZURhdGEuZ2V0KGNvbXBpbGVkLmdldCgwKSkgfHwgW107XG5cdFx0XHRpZiAoaW5kZXhlcy5sZW5ndGggPT09IDUxKSB7XG5cblx0XHRcdH1cblx0XHRcdGxldCBwcm9wID0gaW5kZXhbaW5kZXgubGVuZ3RoIC0gMV07XG5cdFx0XHRsZXQgdGV4dHZhbHVlID0gdGhhdC50ZXh0YXJlYS5odG1sKCkudHJpbSgpO1xuXHRcdFx0bGV0IGRhdGEgPSBwcml2YXRlRGF0YS5nZXQocHJvcCk7XG5cblx0XHRcdGlmIChkYXRhID09PSB1bmRlZmluZWQgJiYgdGV4dHZhbHVlICE9PSBpbml0aWFsVmFsdWUpIHtcblx0XHRcdFx0cHJvcCA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cdFx0XHRcdHByaXZhdGVEYXRhLnNldChwcm9wLCBpbml0aWFsVmFsdWUpO1xuXHRcdFx0XHRpbmRleC5wdXNoKHByb3ApO1xuXHRcdFx0XHRwcml2YXRlRGF0YS5zZXQoY29tcGlsZWQuZ2V0KDApLCBpbmRleCk7XG5cdFx0XHRcdHRoYXQuYnV0dG9ucy51bmRvLmF0dHIoJ2Rpc2FibGVkJywgZmFsc2UpO1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH0gZWxzZSBpZiAoXG5cblx0XHRcdFx0KGRhdGEgJiYgTWF0aC5hYnModGV4dHZhbHVlLmxlbmd0aCAtIGRhdGEubGVuZ3RoKSA+IDE1KSB8fCAoZm9yY2UgJiYgdGV4dHZhbHVlICE9PSBkYXRhKVxuXHRcdFx0KSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKFwiU3RvcmVcIiwgdGV4dHZhbHVlKTtcblx0XHRcdFx0cHJvcCA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cdFx0XHRcdHByaXZhdGVEYXRhLnNldChwcm9wLCB0ZXh0dmFsdWUpO1xuXHRcdFx0XHRpbmRleC5wdXNoKHByb3ApO1xuXHRcdFx0XHRwcml2YXRlRGF0YS5zZXQoY29tcGlsZWQuZ2V0KDApLCBpbmRleCk7XG5cdFx0XHRcdHRoYXQuYnV0dG9ucy51bmRvLmF0dHIoJ2Rpc2FibGVkJywgZmFsc2UpO1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdHJldHVybiAoZGF0YSAhPT0gdW5kZWZpbmVkKSAmJiAoZGF0YSAmJiBkYXRhICE9PSB0ZXh0dmFsdWUpO1xuXHRcdH07XG5cblx0XHRsZXQgY2xlYXJJbmZvID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0cHJpdmF0ZURhdGEuc2V0KHRoYXQudGV4dGFyZWEuZ2V0KDApLCBbXSk7XG5cdFx0XHR0aGF0LmJ1dHRvbnMucmVkby5hdHRyKCdkaXNhYmxlZCcsIHRydWUpO1xuXHRcdH07XG5cdFx0Y29tcGlsZWQuYmluZCgnc2F2ZWNvbnRlbnQnLCBmdW5jdGlvbiAoZSkge1xuXHRcdFx0d2hpbGUgKGJsb2NrKTtcblx0XHRcdGJsb2NrID0gdHJ1ZTtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGlmIChzdG9yZUluZm8oKSkge1xuXHRcdFx0XHRcdGNsZWFySW5mbygpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRoYXQuYnV0dG9ucy51bmRvLmF0dHIoJ2Rpc2FibGVkJywgdHJ1ZSk7XG5cdFx0XHRcdH1cblx0XHRcdH0gY2F0Y2ggKGV4KSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGV4KTtcblx0XHRcdH1cblx0XHRcdGJsb2NrID0gZmFsc2U7XG5cdFx0fSk7XG5cblx0XHRsZXQgY3RybHogPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHR3aGlsZSAoYmxvY2spO1xuXHRcdFx0YmxvY2sgPSB0cnVlO1xuXHRcdFx0bGV0IHN0b3JlZCA9IHN0b3JlSW5mbyh0cnVlKTtcblx0XHRcdGxldCB1bmRvcyA9IHByaXZhdGVEYXRhLmdldChjb21waWxlZC5nZXQoMCkpO1xuXHRcdFx0bGV0IHJlZG9zID0gcHJpdmF0ZURhdGEuZ2V0KHRoYXQudGV4dGFyZWEuZ2V0KDApKSB8fCBbXTtcblxuXHRcdFx0aWYgKHVuZG9zLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0aWYgKHN0b3JlZCkge1xuXHRcdFx0XHRcdHJlZG9zLnB1c2godW5kb3MucG9wKCkpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGxldCBwcm9wID0gcHJpdmF0ZURhdGEuZ2V0KHVuZG9zW3VuZG9zLmxlbmd0aCAtIDFdKTtcblx0XHRcdFx0cHJpdmF0ZURhdGEuc2V0KHRoYXQudGV4dGFyZWEuZ2V0KDApLCByZWRvcyk7XG5cblx0XHRcdFx0dGhhdC50ZXh0YXJlYS5odG1sKHByb3ApO1xuXHRcdFx0XHRwcml2YXRlRGF0YS5zZXQoY29tcGlsZWQuZ2V0KDApLCB1bmRvcyk7XG5cdFx0XHRcdGxldCBzZWwgPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XG5cdFx0XHRcdHNlbC5yZW1vdmVBbGxSYW5nZXMoKTtcblx0XHRcdFx0bGV0IG5vZGUgPSB0aGF0LnRleHRhcmVhLmdldCgwKTtcblx0XHRcdFx0d2hpbGUgKG5vZGUubGFzdENoaWxkKSB7XG5cdFx0XHRcdFx0bm9kZSA9IG5vZGUubGFzdENoaWxkO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRoYXQuaHRtbC5nZXRTZWxlY3Rpb24oMCkudmlzdWFsLnNldFN0YXJ0QmVmb3JlKG5vZGUpO1xuXHRcdFx0XHR0aGF0Lmh0bWwuZ2V0U2VsZWN0aW9uKDApLnZpc3VhbC5zZXRFbmRCZWZvcmUobm9kZSk7XG5cdFx0XHRcdHNlbC5hZGRSYW5nZSh0aGF0Lmh0bWwuZ2V0U2VsZWN0aW9uKDApLnZpc3VhbCk7XG5cblx0XHRcdFx0dGhhdC5idXR0b25zLnJlZG8uYXR0cignZGlzYWJsZWQnLCBmYWxzZSk7XG5cdFx0XHR9XG5cdFx0XHRibG9jayA9IGZhbHNlO1xuXHRcdFx0Ly9cdFx0JCh0aGlzKS50cmlnZ2VyKCdrZXl1cCcsIGUpO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXG5cdFx0fTtcblx0XHR0aGlzLnRleHRhcmVhLmtleXMuYmluZChcIkNNRCtaXCIsIGN0cmx6KTtcblx0XHRwcm90b3R5cGUudW5kbyA9IHtcblx0XHRcdFNldHVwOiBmdW5jdGlvbiAodG9vbGJhcikge1xuXHRcdFx0XHR0aGlzLkNhbGxiYWNrKHRvb2xiYXIuQWRkQnV0dG9uKG5ldyBTaW5nbGUoXCJ1bmRvXCIsIFwiX3VuZG9cIiwge1xuXHRcdFx0XHRcdHRvb2x0aXA6IFwiVW5kb1wiLFxuXHRcdFx0XHRcdGRpc3BsYXljbGFzczogXCJmYSBmYS11bmRvXCJcblx0XHRcdFx0fSkpLCBjdHJseik7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHRwcm90b3R5cGUucmVkbyA9IHtcblx0XHRcdFNldHVwOiBmdW5jdGlvbiAodG9vbGJhcikge1xuXHRcdFx0XHR0aGlzLkNhbGxiYWNrKHRvb2xiYXIuQWRkQnV0dG9uKG5ldyBTaW5nbGUoXCJyZWRvXCIsIFwiX3JlZG9cIiwge1xuXHRcdFx0XHRcdHRvb2x0aXA6IFwiUmVwZWF0XCIsXG5cdFx0XHRcdFx0ZGlzcGxheWNsYXNzOiBcImZhIGZhLXJlcGVhdFwiXG5cdFx0XHRcdH0pKSwgY3RybHopO1xuXHRcdFx0XHR0aGF0LmJ1dHRvbnMucmVkby5zZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJywgdHJ1ZSk7XG5cdFx0XHR9XG5cdFx0fTtcblx0fVxuXHR0aGlzLnRleHRhcmVhLnRvVGV4dEFyZWEoe1xuXHRcdGNvb3JkOiBmYWxzZSxcblx0XHRkZWJ1ZzogZmFsc2Vcblx0fSk7XG5cblx0dGhpcy5Nb2R1bGVzID0ge307XG5cdHRoaXMuYnV0dG9ucyA9IHt9O1xuXHR0aGlzLnRhZ3MgPSB7fTtcblx0dGhpcy5tZXRhZGF0YSA9IHt9O1xuXHR0aGlzLnRleHRhcmVhLmJpbmQoJ2tleXVwIG1vdXNldXAnLCBhZGR0b3RhZ2kpO1xuXHR0aGlzLnRleHRhcmVhLmJpbmQoJ2tleXVwIG1vdXNldXAnLCBmdW5jdGlvbiAoKSB7XG5cdFx0dGhhdC5Nb2R1bGVzID0gTm9kZUFuYWx5c2lzLmFwcGx5KHRoYXQudGV4dGFyZWEuZ2V0U2VsZWN0aW9uKDApLnJhbmcsIFt0aGF0LnRhZ3MsIHRoYXQudGV4dGFyZWEuZ2V0KDApXSk7XG5cdH0pO1xuXHRzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XG5cdFx0Y29tcGlsZWQudHJpZ2dlcignc2F2ZWNvbnRlbnQnKTtcblx0fSwgMTAwMCk7XG5cdGxldCB0b29sYmFyID0gbmV3IFRvb2xiYXIodGhpcyk7XG5cdE9iamVjdC5mcmVlemUodG9vbGJhcik7XG5cdHRoaXMuY2ZnLk1vZHVsZXMuZm9yRWFjaChmdW5jdGlvbiAocGx1Z2luKSB7XG5cdFx0aWYgKHByb3RvdHlwZVtwbHVnaW5dLlNldHVwICE9PSBudWxsKSB7XG5cdFx0XHRwcm90b3R5cGVbcGx1Z2luXSA9ICQuZXh0ZW5kKG5ldyBNb2R1bGUodGhhdCksIHByb3RvdHlwZVtwbHVnaW5dKTtcblx0XHRcdHByb3RvdHlwZVtwbHVnaW5dLlNldHVwKHRvb2xiYXIpO1xuXHRcdH1cblx0fSk7XG5cdHRoaXMuYnV0dG9uID0gZnVuY3Rpb24gKGlkKSB7XG5cdFx0cmV0dXJuIHRoYXQuYnV0dG9uc1tpZF07XG5cdH07XG59XG5cbmZvcihsZXQgbW9kIGluIG1vZHVsZXMpe1xuXHRpbnN0YWxsZWRwbHVnaW5zLnB1c2gobW9kKTtcblx0V3JpaXQucHJvdG90eXBlW21vZF0gPSBtb2R1bGVzW21vZF07XG59XG4vKldyaWl0LnByb3RvdHlwZS5wYXN0ZUV2ZW50ID0ge1xuXHRTZXR1cDogZnVuY3Rpb24gKCkge1xuXHRcdHZhciB0aGF0ID0gdGhpcztcblx0XHR2YXIgY2xpcGJvYXJkID0gJCgnPHRleHRhcmVhIHN0eWxlPVwiZGlzcGxheTpub25lO1wiPicpO1xuXHRcdGNsaXBib2FyZC5pbnNlcnRBZnRlcigkKHRoaXMudGV4dGFyZWEpKTtcblx0XHQkKHRoaXMudGV4dGFyZWEpLmJpbmQoXCJwYXN0ZVwiLCBmYWxzZSwgZnVuY3Rpb24gKGUpIHtcblx0XHRcdHZhciBwYXN0ZSA9IFwiXCI7XG5cdFx0XHR2YXIgbyA9IGU7XG5cdFx0XHRlID0gZS5vcmlnaW5hbEV2ZW50O1xuXHRcdFx0aWYgKC90ZXh0XFwvaHRtbC8udGVzdChlLmNsaXBib2FyZERhdGEudHlwZXMpKSB7XG5cdFx0XHRcdHBhc3RlID0gZS5jbGlwYm9hcmREYXRhLmdldERhdGEoJ3RleHQvaHRtbCcpO1xuXHRcdFx0XHRwYXN0ZSA9IHBhc3RlLnJlcGxhY2UoXCI8bWV0YSBjaGFyc2V0PSd1dGYtOCc+XCIsIGZ1bmN0aW9uIChzdHIpIHtcblx0XHRcdFx0XHRyZXR1cm4gJyc7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRwYXN0ZSA9IHBhc3RlLnJlcGxhY2UoLzxzcGFuIGNsYXNzPVwiQXBwbGUtY29udmVydGVkLXNwYWNlXCI+LjxcXC9zcGFuPi9nLCBmdW5jdGlvbiAoc3RyKSB7XG5cdFx0XHRcdFx0cmV0dXJuICcgJztcblx0XHRcdFx0fSk7XG5cdFx0XHRcdHBhc3RlID0gcGFzdGUucmVwbGFjZSgvPHNwYW5bXj5dKj4oW148XSopPFxcL3NwYW4+L2csIGZ1bmN0aW9uIChzdHIsIGN0KSB7XG5cdFx0XHRcdFx0cmV0dXJuIGN0O1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0cGFzdGUgPSBwYXN0ZS5yZXBsYWNlKC8gc3R5bGU9XCIuW14+XSpcIi9nLCBmdW5jdGlvbiAoc3RyLCBjdCkge1xuXHRcdFx0XHRcdHJldHVybiAnJztcblx0XHRcdFx0fSk7XG5cdFx0XHRcdGUuY2xpcGJvYXJkRGF0YS5jbGVhckRhdGEoKTtcblx0XHRcdFx0ZS5jbGlwYm9hcmREYXRhLml0ZW1zID0gW107XG5cdFx0XHRcdGNsaXBib2FyZC5odG1sKHBhc3RlKTtcblx0XHRcdFx0cGFzdGUgPSAkKCc8c2VjdGlvbj4nICsgcGFzdGUgKyAnPC9zZWN0aW9uPicpLmdldCgwKTtcblx0XHRcdFx0Ly9cdFx0XHRcdGUuY2xpcGJvYXJkRGF0YS5zZXREYXRhKCd0ZXh0L2h0bWwnLHBhc3RlKTtcblx0XHRcdH0gZWxzZSBpZiAoL3RleHRcXC9wbGFpbi8udGVzdChlLmNsaXBib2FyZERhdGEudHlwZXMpKSB7XG5cdFx0XHRcdHBhc3RlID0gZS5jbGlwYm9hcmREYXRhLmdldERhdGEoJ3RleHQvcGxhaW4nKTtcblx0XHRcdH1cblx0XHRcdHZhciBlbmQgPSBwYXN0ZS5jaGlsZE5vZGVzW3RoYXQubm9kZUFQSS5jaGlsZENvdW50b3JMZW5ndGcocGFzdGUpIC0gMV07XG5cdFx0XHR3aGlsZSAocGFzdGUuY2hpbGROb2Rlcy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdGUudGFyZ2V0LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHBhc3RlLmNoaWxkTm9kZXNbMF0sIGUudGFyZ2V0KTtcblx0XHRcdH1cblx0XHRcdHRoYXQuaHRtbC5nZXRTZWxlY3Rpb24oMCkudmlzdWFsLnNldFN0YXJ0KGVuZCwgdGhhdC5ub2RlQVBJLmNoaWxkQ291bnRvckxlbmd0ZyhlbmQpKTtcblx0XHRcdHRoYXQuaHRtbC5nZXRTZWxlY3Rpb24oMCkudmlzdWFsLnNldEVuZChlbmQsIHRoYXQubm9kZUFQSS5jaGlsZENvdW50b3JMZW5ndGcoZW5kKSk7XG5cdFx0XHR0aGF0LnJlc3RvcmUoKTtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9KTtcblx0fSxcbn07XG5XcmlpdC5wcm90b3R5cGUuYm9sZCA9IHtcblx0U2V0dXA6IGZ1bmN0aW9uICh0b29sYmFyKSB7XG5cdFx0bGV0IGJvbGQgPSBuZXcgU2luZ2xlKFwiYm9sZFwiLCBcInN0cm9uZ1wiLCB7XG5cdFx0XHR0b29sdGlwOiBcIkJvbGRcIixcblx0XHRcdGljb25jbGFzczogXCJmYSBmYS1ib2xkXCIsXG5cdFx0XHRzaG9ydGN1dDogXCJDTUQrU0hJRlQrQlwiXG5cdFx0fSk7XG5cdFx0dG9vbGJhci5BZGRCdXR0b24oYm9sZCk7XG5cdFx0dGhpcy5DYWxsYmFjayhib2xkLCB0aGlzLkluc2VydCk7XG5cdH0sXG59O1xuV3JpaXQucHJvdG90eXBlLnN1YmluZGV4ID0ge1xuXHRTZXR1cDogZnVuY3Rpb24gKHRvb2xiYXIpIHtcblx0XHRsZXQgYnQgPSBuZXcgU2luZ2xlKFwic3ViaW5kZXhcIiwgXCJzdWJcIiwge1xuXHRcdFx0dG9vbHRpcDogXCJTdWJJbmRleFwiLFxuXHRcdFx0ZGlzcGxheWNsYXNzOiBcImZhIGZhLXN1YnNjcmlwdFwiXG5cdFx0fSk7XG5cdFx0dG9vbGJhci5BZGRCdXR0b24oYnQpO1xuXHRcdHRoaXMuQ2FsbGJhY2soYnQsIHRoaXMuSW5zZXJ0KTtcblx0fVxufTtcbldyaWl0LnByb3RvdHlwZS5wb3duID0ge1xuXHRTZXR1cDogZnVuY3Rpb24gKHRvb2xiYXIpIHtcblx0XHR0aGlzLkNhbGxiYWNrKHRvb2xiYXIuQWRkQnV0dG9uKG5ldyBTaW5nbGUoXCJwb3duXCIsIFwic3VwXCIsIHtcblx0XHRcdHRvb2x0aXA6IFwiU3VwZXIgSW5kZXhcIixcblx0XHRcdGRpc3BsYXljbGFzczogXCJmYSBmYS1zdXBlcnNjcmlwdFwiXG5cdFx0fSkpLCB0aGlzLkluc2VydCk7XG5cdH1cbn07XG5XcmlpdC5wcm90b3R5cGUuaXRhbGljID0ge1xuXHRTZXR1cDogZnVuY3Rpb24gKHRvb2xiYXIpIHtcblx0XHR0aGlzLkNhbGxiYWNrKHRvb2xiYXIuQWRkQnV0dG9uKG5ldyBTaW5nbGUoXCJpdGFsaWNcIiwgXCJlbVwiLCB7XG5cdFx0XHR0b29sdGlwOiBcIkl0YWxpY1wiLFxuXHRcdFx0ZGlzcGxheWNsYXNzOiBcImZhIGZhLWl0YWxpY1wiXG5cdFx0fSkpLCB0aGlzLkluc2VydCk7XG5cdH1cbn07XG5XcmlpdC5wcm90b3R5cGUudW5kZXJsaW5lID0ge1xuXHRTZXR1cDogZnVuY3Rpb24gKHRvb2xiYXIpIHtcblx0XHR0aGlzLkNhbGxiYWNrKHRvb2xiYXIuQWRkQnV0dG9uKG5ldyBTaW5nbGUoXCJ1bmRlcmxpbmVcIiwgXCJ1XCIsIHtcblx0XHRcdHRvb2x0aXA6IFwiVW5kZXJsaW5lXCIsXG5cdFx0XHRkaXNwbGF5Y2xhc3M6IFwiZmEgZmEtdW5kZXJsaW5lXCIsXG5cdFx0XHRzaG9ydGN1dDogXCJBTFQrU0hJRlQrVVwiXG5cdFx0fSkpLCB0aGlzLkluc2VydCk7XG5cdH1cbn07XG5XcmlpdC5wcm90b3R5cGUuc3RyaWtldGhyb3VnaCA9IHtcblx0U2V0dXA6IGZ1bmN0aW9uICh0b29sYmFyKSB7XG5cdFx0dGhpcy5DYWxsYmFjayh0b29sYmFyLkFkZEJ1dHRvbihuZXcgU2luZ2xlKFwic3RyaWtldGhyb3VnaFwiLCBcImRlbFwiLCB7XG5cdFx0XHR0b29sdGlwOiBcIlN0cmlrZSBUaHJvdWdoXCIsXG5cdFx0XHRkaXNwbGF5Y2xhc3M6IFwiZmEgZmEtc3RyaWtldGhyb3VnaFwiLFxuXHRcdFx0c2hvcnRjdXQ6IFwiQUxUK1NISUZUK1NcIlxuXHRcdH0pKSwgdGhpcy5JbnNlcnQpO1xuXHR9XG59O1xuLypXcmlpdC5wcm90b3R5cGUucGFyYWdyYXBoID0ge1xuXHRTZXR1cDogZnVuY3Rpb24gKHRvb2xiYXIpIHtcblx0XHRsZXQgZm11bHRpID0gbmV3IE11bHRpQ2xhc3MoJ3BhcmFncmFwaCcsIFwicFwiKTtcblx0XHRmbXVsdGkuQWRkKCdsZWZ0JywgJ3RleHQtbGVmdCcsIHtcblx0XHRcdHRvb2x0aXA6IFwiQWxpZ24gTGVmdFwiLFxuXHRcdFx0ZGlzcGxheWNsYXNzOiBcImZhIGZhLWFsaWduLWxlZnRcIixcblx0XHRcdHNob3J0Y3V0OiBcIkNNRCtTSElGVCtMXCJcblx0XHR9KTtcblx0XHRmbXVsdGkuQWRkKCdjZW50ZXInLCAndGV4dC1jZW50ZXInLCB7XG5cdFx0XHR0b29sdGlwOiBcIkFsaWduIENlbnRlclwiLFxuXHRcdFx0ZGlzcGxheWNsYXNzOiBcImZhIGZhLWFsaWduLWNlbnRlclwiLFxuXHRcdFx0c2hvcnRjdXQ6IFwiQ01EK1NISUZUK0NcIlxuXHRcdH0pO1xuXHRcdGZtdWx0aS5BZGQoJ3JpZ2h0JywgJ3RleHQtcmlnaHQnLCB7XG5cdFx0XHR0b29sdGlwOiBcIkFsaWduIFJpZ2h0XCIsXG5cdFx0XHRkaXNwbGF5Y2xhc3M6IFwiZmEgZmEtYWxpZ24tcmlnaHRcIixcblx0XHRcdHNob3J0Y3V0OiBcIkNNRCtTSElGVCtSXCJcblx0XHR9KTtcblx0XHRmbXVsdGkuQWRkKCdqdXN0aWZ5JywgJ3RleHQtanVzdGlmeScsIHtcblx0XHRcdHRvb2x0aXA6IFwiSnVzdGlmeVwiLFxuXHRcdFx0ZGlzcGxheWNsYXNzOiBcImZhIGZhLWFsaWduLWp1c3RpZnlcIixcblx0XHRcdHNob3J0Y3V0OiBcIkNNRCtTSElGVCtKXCJcblx0XHR9KTtcblx0XHR0b29sYmFyLkFkZEJ1dHRvbihmbXVsdGkpO1xuXHRcdHRoaXMuQ2FsbGJhY2soZm11bHRpLCB0aGlzLkluc2VydCk7XG5cdH1cbn07KiAvXG5XcmlpdC5wcm90b3R5cGUuZm9yZWNvbG9yID0ge1xuXHRTZXR1cDogZnVuY3Rpb24gKHRvb2xiYXIpIHtcblx0XHRsZXQgdGFnID0gbmV3IFN0eWxlVGFnKCdmb3JlY29sb3InKTtcblx0XHRsZXQgcHJvcCA9IHRhZy5uZXdQcm9wZXJ0eShcImNvbG9yXCIpO1xuXHRcdHRhZy5BZGQocHJvcC5LZXlWYWx1ZSgnI0ZGMDAwMCcsJ3JlZCcpICk7XG5cdFx0XG5cdFx0bGV0IGZtdWx0aSA9IG5ldyBTdHlsZUF0dHIoJ2ZvcmVjb2xvcicsIFwic3BhblwiLCBjKTtcblx0XHRmbXVsdGkuQWRkKCdyZWQnLCBjLmFwcGx5KCcjMDBGRjAwJyksIHtcblx0XHRcdGRpc3BsYXljbGFzczogXCJmYSBmYS1mb250XCJcblx0XHR9LHRydWUpO1xuXHRcdHRvb2xiYXIuQWRkQnV0dG9uKGZtdWx0aSk7XG5cdFx0dGhpcy5DYWxsYmFjayhmbXVsdGksIHRoaXMuSW5zZXJ0KTtcblx0fVxufTtcbiovXG4kLmZuLndyaWl0ID0gZnVuY3Rpb24gKGNmZykge1xuXHQkKHRoaXMpLmVhY2goZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiBuZXcgV3JpaXQoJCh0aGlzKSwgY2ZnKTtcblx0fSk7XG59OyJdfQ==
