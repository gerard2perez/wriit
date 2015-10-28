(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _wriitTags = require('../wriit-tags');

exports["default"] = {
	Setup: function Setup(toolbar) {
		var bold = new _wriitTags.Single("bold", "strong", {
			tooltip: "Bold",
			iconclass: "fa fa-bold",
			shortcut: "CMD+SHIFT+B"
		});
		toolbar.AddButton(bold);
		this.Callback(bold, this.Insert);
	}
};
module.exports = exports["default"];

},{"../wriit-tags":11}],4:[function(require,module,exports){
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

},{"../tags":9}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequire(obj) { return obj && obj.__esModule ? obj['default'] : obj; }

var _forecolor = require('./forecolor');

exports.forecolor = _interopRequire(_forecolor);

var _bold = require('./bold');

exports.bold = _interopRequire(_bold);

},{"./bold":3,"./forecolor":4}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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

},{"./Base":6}],8:[function(require,module,exports){
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
			return new AttrGenerator(StyleAttr, property);
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

},{"./Base":6}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequire(obj) { return obj && obj.__esModule ? obj['default'] : obj; }

var _Single = require('./Single');

exports.Single = _interopRequire(_Single);

var _StyleTag = require('./StyleTag');

exports.StyleTag = _interopRequire(_StyleTag);

},{"./Single":7,"./StyleTag":8}],10:[function(require,module,exports){
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

},{"./wriit-tags":11}],11:[function(require,module,exports){
/*global document*/
/* jshint -W097 */
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

exports.StyleAttr = StyleAttr;
exports.GeneralAttr = GeneralAttr;

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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

var Base = (function () {
	function Base(id, tag, attributes, highlight) {
		_classCallCheck(this, Base);

		this.Id = id;
		this.highlight = true;
		this.TagName = tag;
		this.Attributes = [];
		this.Shortcut = attributes.shortcut || null;
		this.ToolTip = attributes.tooltip || null;
		this.IconClass = attributes.iconclass || null;
	}

	_createClass(Base, [{
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

	return Base;
})();

var AttrGenerator = (function () {
	function AttrGenerator(gen, property) {
		_classCallCheck(this, AttrGenerator);

		this.gen = gen;
		this.property = property;
	}

	_createClass(AttrGenerator, [{
		key: "KeyValue",
		value: function KeyValue(value, label) {
			return new this.gen(this.property, value);
		}
	}]);

	return AttrGenerator;
})();

var StyleTag = (function (_Base) {
	_inherits(StyleTag, _Base);

	function StyleTag() {
		_classCallCheck(this, StyleTag);

		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		_get(Object.getPrototypeOf(StyleTag.prototype), "constructor", this).apply(this, args);
	}

	_createClass(StyleTag, [{
		key: "newProperty",
		value: function newProperty(property) {
			return new AttrGenerator(StyleAttr, property);
		}
	}, {
		key: "Add",
		value: function Add(attribute) {
			this.Attributes[attribute.attr] = attribute;
		}
	}]);

	return StyleTag;
})(Base);

exports.StyleTag = StyleTag;

var Single = (function (_Base2) {
	_inherits(Single, _Base2);

	function Single(id, tag, options) {
		_classCallCheck(this, Single);

		_get(Object.getPrototypeOf(Single.prototype), "constructor", this).call(this, id, tag, options, false);
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
	return Single;
})(Base);

exports.Single = Single;

},{}],12:[function(require,module,exports){
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

},{"./wriit-tags":11}],13:[function(require,module,exports){
/*global document,window,$,console,setInterval,Basic,Many,MultiClass,WriitStyle,regexp*/
'use strict';

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _wriitModules = require('./wriit-modules');

var _wriitModules2 = _interopRequireDefault(_wriitModules);

var _wriitTags = require('./wriit-tags');

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
		if (tag instanceof _wriitTags.Single) {
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
					this.Callback(toolbar.AddButton(new _wriitTags.Single("undo", "_undo", {
						tooltip: "Undo",
						displayclass: "fa fa-undo"
					})), ctrlz);
				}
			};
			prototype.redo = {
				Setup: function Setup(toolbar) {
					this.Callback(toolbar.AddButton(new _wriitTags.Single("redo", "_redo", {
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
			prototype[plugin] = $.extend(new _wriitModules2['default'](that), prototype[plugin]);
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

},{"./iTextArea":1,"./keyhandler":2,"./modules":5,"./wriit-modules":10,"./wriit-tags":11,"./wriit-toolbar":12}]},{},[1,2,10,11,12,13,3,4,5,6,7,8,9])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvZ2VyYXJkMnAvZGV2ZWxvcG1lbnQvYmFja2VuZC93cmlpdC9zcmMvaVRleHRBcmVhLmpzIiwiL1VzZXJzL2dlcmFyZDJwL2RldmVsb3BtZW50L2JhY2tlbmQvd3JpaXQvc3JjL2tleWhhbmRsZXIuanMiLCIvVXNlcnMvZ2VyYXJkMnAvZGV2ZWxvcG1lbnQvYmFja2VuZC93cmlpdC9zcmMvbW9kdWxlcy9ib2xkLmpzIiwiL1VzZXJzL2dlcmFyZDJwL2RldmVsb3BtZW50L2JhY2tlbmQvd3JpaXQvc3JjL21vZHVsZXMvZm9yZWNvbG9yLmpzIiwiL1VzZXJzL2dlcmFyZDJwL2RldmVsb3BtZW50L2JhY2tlbmQvd3JpaXQvc3JjL21vZHVsZXMvaW5kZXguanMiLCIvVXNlcnMvZ2VyYXJkMnAvZGV2ZWxvcG1lbnQvYmFja2VuZC93cmlpdC9zcmMvdGFncy9CYXNlLmpzIiwiL1VzZXJzL2dlcmFyZDJwL2RldmVsb3BtZW50L2JhY2tlbmQvd3JpaXQvc3JjL3RhZ3MvU2luZ2xlLmpzIiwiL1VzZXJzL2dlcmFyZDJwL2RldmVsb3BtZW50L2JhY2tlbmQvd3JpaXQvc3JjL3RhZ3MvU3R5bGVUYWcuanMiLCIvVXNlcnMvZ2VyYXJkMnAvZGV2ZWxvcG1lbnQvYmFja2VuZC93cmlpdC9zcmMvdGFncy9pbmRleC5qcyIsIi9Vc2Vycy9nZXJhcmQycC9kZXZlbG9wbWVudC9iYWNrZW5kL3dyaWl0L3NyYy93cmlpdC1tb2R1bGVzLmpzIiwiL1VzZXJzL2dlcmFyZDJwL2RldmVsb3BtZW50L2JhY2tlbmQvd3JpaXQvc3JjL3dyaWl0LXRhZ3MuanMiLCIvVXNlcnMvZ2VyYXJkMnAvZGV2ZWxvcG1lbnQvYmFja2VuZC93cmlpdC9zcmMvd3JpaXQtdG9vbGJhci5qcyIsIi9Vc2Vycy9nZXJhcmQycC9kZXZlbG9wbWVudC9iYWNrZW5kL3dyaWl0L3NyYy93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QyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKmdsb2JhbCAkLGpRdWVyeSovXG5mdW5jdGlvbiB0YWdsZW5ndGgobm9kZSwgZnVsbCkge1xuXHRcInVzZSBzdHJpY3RcIjtcblx0bGV0IG90ZXh0ID0gbm9kZS53aG9sZVRleHQgIT09IHVuZGVmaW5lZCA/IG5vZGUud2hvbGVUZXh0IDogbm9kZS5vdXRlckhUTUw7XG5cdGxldCBpdGV4dCA9IG5vZGUuaW5uZXJIVE1MICE9PSB1bmRlZmluZWQgPyBub2RlLmlubmVySFRNTCA6IG5vZGUuaW5uZXJUZXh0O1xuXHRsZXQgbCA9IG90ZXh0LmluZGV4T2YoaXRleHQpO1xuXHRpZiAob3RleHQuaW5kZXhPZihpdGV4dCkgIT09IG90ZXh0Lmxhc3RJbmRleE9mKGl0ZXh0KSkge1xuXHRcdGwgPSBvdGV4dC5pbmRleE9mKGl0ZXh0LCBpdGV4dC5sZW5ndGgpO1xuXHR9XG5cdHJldHVybiBmdWxsID8gb3RleHQubGVuZ3RoIDogKGwgPT09IC0xID8gb3RleHQubGVuZ3RoIDogbCk7XG59XG5cbmZ1bmN0aW9uIGRlZGVlcChwYXJlbnQsIGNvbW1vbiwgbm9kZSwgb2Zmc2V0KSB7XG5cdFwidXNlIHN0cmljdFwiO1xuXHRsZXQgdGV4dCA9IG5vZGUud2hvbGVUZXh0ICE9PSB1bmRlZmluZWQgPyBub2RlLndob2xlVGV4dCA6IG5vZGUub3V0ZXJIVE1MO1xuXHRsZXQgZW5kID0gLXRleHQuc3Vic3RyaW5nKG9mZnNldCwgdGV4dC5sZW5ndGgpLmxlbmd0aDtcblx0ZG8ge1xuXHRcdGxldCBwcmV2bm9kZSA9IG5vZGUucHJldmlvdXNTaWJsaW5nO1xuXHRcdGxldCBhbGwgPSBmYWxzZTtcblx0XHRkbyB7XG5cdFx0XHRlbmQgKz0gdGFnbGVuZ3RoKG5vZGUsIGFsbCk7XG5cdFx0XHRwcmV2bm9kZSA9IG5vZGUucHJldmlvdXNTaWJsaW5nO1xuXHRcdFx0YWxsID0gcHJldm5vZGUgPyBwcmV2bm9kZS5ub2RlVHlwZSA9PSAxIDogZmFsc2U7XG5cdFx0XHRpZiAocHJldm5vZGUpIHtcblx0XHRcdFx0bm9kZSA9IHByZXZub2RlO1xuXHRcdFx0fVxuXHRcdH0gd2hpbGUgKHByZXZub2RlICE9PSBudWxsKTtcblx0XHRpZiAobm9kZS5wYXJlbnROb2RlICE9IHBhcmVudCkge1xuXHRcdFx0bm9kZSA9IG5vZGUucGFyZW50Tm9kZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZW5kIC09IHRhZ2xlbmd0aChub2RlKTtcblx0XHR9XG5cdH0gd2hpbGUgKG5vZGUucGFyZW50Tm9kZSAhPSBwYXJlbnQgJiYgbm9kZSAhPSBwYXJlbnQpO1xuXHRlbmQgKz0gdGFnbGVuZ3RoKG5vZGUpO1xuXHRub2RlID0gbm9kZS5wcmV2aW91c1NpYmxpbmc7XG5cdHdoaWxlIChub2RlKSB7XG5cdFx0bGV0IG90ZXh0ID0gbm9kZS53aG9sZVRleHQgIT09IHVuZGVmaW5lZCA/IG5vZGUud2hvbGVUZXh0IDogbm9kZS5vdXRlckhUTUw7XG5cdFx0ZW5kICs9IG90ZXh0Lmxlbmd0aDtcblx0XHRub2RlID0gbm9kZS5wcmV2aW91c1NpYmxpbmc7XG5cdH1cblx0cmV0dXJuIGVuZDtcbn1cblxuZnVuY3Rpb24gdGV4dGFyZWEocGFyZW50LCBvcHRzKSB7XG5cdFwidXNlIHN0cmljdFwiO1xuXHR2YXIgY2FyZWEgPSAkKCc8ZGl2IGNsYXNzPVwiaXRleHRhcmVhLWNvcmRzXCIvPicpO1xuXHRpZiAob3B0cy5jb29yZCkge1xuXHRcdGNhcmVhLmluc2VydEFmdGVyKHBhcmVudCk7XG5cdH1cblx0JChwYXJlbnQpLmJpbmQoJ2tleXVwIG1vdXNldXAnLCBmdW5jdGlvbiAoZXYpIHtcblx0XHRsZXQgaW5pID0gd2luZG93LnBlcmZvcm1hbmNlLm5vdygpO1xuXHRcdHZhciByYW5nZXMgPSBbXTtcblx0XHR2YXIgc2VsZWN0aW9uID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgc2VsZWN0aW9uLnJhbmdlQ291bnQ7IGkrKykge1xuXHRcdFx0bGV0IHJhbmdlID0gc2VsZWN0aW9uLmdldFJhbmdlQXQoaSk7XG5cdFx0XHRyYW5nZXMucHVzaCh7XG5cdFx0XHRcdHN0YXJ0OiBkZWRlZXAocGFyZW50LCByYW5nZS5jb21tb25BbmNlc3RvckNvbnRhaW5lciwgcmFuZ2Uuc3RhcnRDb250YWluZXIsIHJhbmdlLnN0YXJ0T2Zmc2V0KSxcblx0XHRcdFx0ZW5kOiBkZWRlZXAocGFyZW50LCByYW5nZS5jb21tb25BbmNlc3RvckNvbnRhaW5lciwgcmFuZ2UuZW5kQ29udGFpbmVyLCByYW5nZS5lbmRPZmZzZXQpLFxuXHRcdFx0XHRyYW5nOiByYW5nZVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdCQocGFyZW50KS5kYXRhKCdyYW5nJywgcmFuZ2VzKTtcblx0XHRsZXQgZW5kID0gd2luZG93LnBlcmZvcm1hbmNlLm5vdygpO1xuXHRcdGlmIChvcHRzLnBlcmZvcm1hY2UpIHtcblx0XHRcdGNvbnNvbGUubG9nKFwiaVRleHRBcmVhIGFuYWx5c2lzOlwiLCBlbmQgLSBpbmksICdtcycpO1xuXHRcdH1cblx0XHRpZiAob3B0cy5jb29yZCkge1xuXHRcdFx0Y2FyZWEuaHRtbChyYW5nZXNbMF0uc3RhcnQgKyBcIixcIiArIHJhbmdlc1swXS5lbmQpO1xuXHRcdH1cblx0XHRpZiAob3B0cy5kZWJ1Zykge1xuXHRcdFx0Y2FyZWEuYXBwZW5kKCc8dGV4dGFyZWEgc3R5bGU9XCJ3aWR0aDo2MDBweDtkaXNwbGF5OmJsb2NrO1wiPicgKyBwYXJlbnQuaW5uZXJIVE1MLnN1YnN0cmluZygwLCByYW5nZXNbMF0uc3RhcnQpICsgJzwvdGV4dGFyZWE+Jyk7XG5cdFx0XHRjYXJlYS5hcHBlbmQoJzx0ZXh0YXJlYSBzdHlsZT1cIndpZHRoOjYwMHB4O2Rpc3BsYXk6YmxvY2s7XCI+JyArIHBhcmVudC5pbm5lckhUTUwuc3Vic3RyaW5nKHJhbmdlc1swXS5zdGFydCwgcmFuZ2VzWzBdLmVuZCkgKyAnPC90ZXh0YXJlYT4nKTtcblx0XHRcdGNhcmVhLmFwcGVuZCgnPHRleHRhcmVhIHN0eWxlPVwid2lkdGg6NjAwcHg7ZGlzcGxheTpibG9jaztcIj4nICsgcGFyZW50LmlubmVySFRNTC5zdWJzdHJpbmcocmFuZ2VzWzBdLmVuZCwgJChwYXJlbnQpLmh0bWwoKS5sZW5ndGgpICsgJzwvdGV4dGFyZWE+Jyk7XG5cdFx0fVxuXHR9KTtcbn1cbmV4cG9ydCBkZWZhdWx0IChmdW5jdGlvbiAoJCkge1xuXHQkLmZuLnRvVGV4dEFyZWEgPSBmdW5jdGlvbiAoY2ZnKSB7XG5cdFx0Y2ZnID0gJC5leHRlbmQoe30sIHtcblx0XHRcdGNvb3JkOiBmYWxzZSxcblx0XHRcdHBlcmZvcm1hY2U6IGZhbHNlLFxuXHRcdFx0ZGVidWc6IGZhbHNlXG5cdFx0fSwgY2ZnKTtcblx0XHQkKHRoaXMpLmF0dHIoJ2NvbnRlbnRlZGl0YWJsZScsIHRydWUpO1xuXHRcdCQodGhpcykuZWFjaChmdW5jdGlvbiAoKSB7XG5cdFx0XHRuZXcgdGV4dGFyZWEodGhpcywgY2ZnKTtcblx0XHRcdHJldHVybiAkKHRoaXMpO1xuXHRcdH0pO1xuXHR9O1xuXHQkLmZuLmdldFNlbGVjdGlvbiA9IGZ1bmN0aW9uIChuKSB7XG5cdFx0aWYgKCQodGhpcykuZGF0YSgncmFuZycpKSB7XG5cdFx0XHRyZXR1cm4gJCh0aGlzKS5kYXRhKCdyYW5nJylbbl07XG5cdFx0fVxuXHR9O1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoJC5mbiwgXCJzZWxlY3Rpb25cIiwge1xuXHRcdGdldDogZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuICQodGhpcykuZGF0YSgncmFuZycpWzBdO1xuXHRcdH1cblx0fSk7XG59KShqUXVlcnkpOyIsImxldCBrZXlzID0ge1xuXHRcIjhcIjogXCJDQVJSWVwiLFxuXHRcIjEzXCI6IFwiRU5URVJcIixcblx0XCIxNlwiOiBcIlNISUZUXCIsXG5cdFwiMTdcIjogXCJDVFJMXCIsXG5cdFwiMThcIjogXCJBTFRcIixcblx0XCIyN1wiOiBcIkVTQ1wiLFxuXHRcIjM3XCI6IFwiTEVGVFwiLFxuXHRcIjM4XCI6IFwiVVBcIixcblx0XCIzOVwiOiBcIlJJR1RIXCIsXG5cdFwiNDBcIjogXCJET1dOXCIsXG5cdFwiOTFcIjogXCJDTURcIlxufTtcbmZvciAobGV0IGkgPSAxMTI7IGkgPCAoMTEyICsgMTIpOyBpKyspIHtcblx0a2V5c1tpLnRvU3RyaW5nKCldID0gXCJGXCIgKyAoaSAtIDExMSk7XG59XG5sZXQgcm91dGVrZXkgPSB7XG5cdFwiQ1RSTFwiOiBcIkNNRFwiLFxuXHRcIkNNRFwiOiBcIkNUUkxcIlxufTtcbmxldCBLZXlIYW5kbGVyID0gZnVuY3Rpb24gKGVsLCBzZXR0aW5ncykge1xuXHRlbC5kYXRhKCdldmVudHMnLCB7fSk7XG5cdGVsLmJpbmQoXCJrZXlkb3duXCIsIGZ1bmN0aW9uIChlLCByb3V0ZWRldmVudCkge1xuXHRcdGUgPSByb3V0ZWRldmVudCB8fCBlO1xuXHRcdGxldCBjdXJya2V5cyA9IGVsLmRhdGEoJ2tleXMnKSB8fCB7fTtcblx0XHRsZXQgY3VycmtleSA9IGtleXNbZS53aGljaC50b1N0cmluZygpXSB8fCBTdHJpbmcuZnJvbUNoYXJDb2RlKGUud2hpY2gpIHx8IGUud2hpY2ggfHwgZmFsc2U7XG5cdFx0Y3VycmtleXNbY3VycmtleV0gPSBjdXJya2V5O1xuXHRcdGVsLmRhdGEoJ2tleXMnLCBjdXJya2V5cyk7XG5cdFx0bGV0IHRyaWdnZXIgPSBbXTtcblx0XHRmb3IgKGxldCBpIGluIGN1cnJrZXlzKSB7XG5cdFx0XHR0cmlnZ2VyLnB1c2goY3VycmtleXNbaV0pO1xuXHRcdH1cblx0XHR0cmlnZ2VyID0gdHJpZ2dlci5qb2luKCcrJyk7XG5cdFx0dHJpZ2dlciA9IGVsLmRhdGEoJ2V2ZW50cycpW3RyaWdnZXJdO1xuXHRcdGlmICghIXRyaWdnZXIpIHtcblx0XHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRcdGlmICghdHJpZ2dlcihlKSkge1xuXHRcdFx0XHRlLnN0b3BJbW1lZGlhdGVQcm9wYWdhdGlvbigpO1xuXHRcdFx0XHRlLnN0b3BQcm9wYWdhdGlvbigpO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdH0pLmJpbmQoXCJrZXl1cFwiLCBmdW5jdGlvbiAoZSwgcm91dGVkZXZlbnQpIHtcblx0XHRpZiAoIWUud2hpY2gpIHtcblx0XHRcdGVsLmRhdGEoJ2tleXMnLCB7fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGUgPSByb3V0ZWRldmVudCB8fCBlO1xuXHRcdFx0bGV0IGN1cnJrZXlzID0gZWwuZGF0YSgna2V5cycpIHx8IFtdO1xuXHRcdFx0bGV0IGN1cnJrZXkgPSBrZXlzW2Uud2hpY2gudG9TdHJpbmcoKV0gfHwgU3RyaW5nLmZyb21DaGFyQ29kZShlLndoaWNoKSB8fCBlLndoaWNoIHx8IGZhbHNlO1xuXHRcdFx0ZGVsZXRlIGN1cnJrZXlzW2N1cnJrZXldO1xuXHRcdFx0ZWwuZGF0YSgna2V5cycsIGN1cnJrZXlzKTtcblx0XHRcdHN3aXRjaChjdXJya2V5KXtcblx0XHRcdFx0Y2FzZSBcIkNUUkxcIjpjYXNlIFwiQ01EXCI6XG5cdFx0XHRcdFx0ZWwuZGF0YSgna2V5cycsIFtdKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdH1cblxuXHRcdH1cblx0fSkuYmluZCgnYmx1cicsIGZ1bmN0aW9uIChlKSB7XG5cdFx0ZWwuZGF0YSgna2V5cycsIHt9KTtcblx0fSk7XG5cdHJldHVybiBlbDtcbn07XG5leHBvcnQgZGVmYXVsdCAoZnVuY3Rpb24gKCQpIHtcblx0JC5mbi5LZXlIYW5kbGVyID0gZnVuY3Rpb24gKHNldHRpbmdzKSB7XG5cdFx0bGV0IGNvbmZpZyA9IHtcblx0XHRcdEVTQzogZmFsc2UsXG5cdFx0XHRFTlRFUjogZmFsc2Vcblx0XHR9O1xuXHRcdGNvbmZpZyA9ICQuZXh0ZW5kKHt9LCBjb25maWcsIHNldHRpbmdzKTtcblx0XHQkKHRoaXMpLmVhY2goZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIG5ldyBLZXlIYW5kbGVyKCQodGhpcyksIHNldHRpbmdzKTtcblx0XHR9KTtcblx0fTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KCQuZm4sIFwia2V5cHJlc3NlZFwiLCB7XG5cdFx0Z2V0OiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gJCh0aGlzKS5kYXRhKCdrZXlzJyk7XG5cdFx0fVxuXHR9KTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KCQuZm4sIFwia2V5c1wiLCB7XG5cdFx0Z2V0OiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRsZXQgdGhhdCA9IHRoaXM7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRiaW5kOiBmdW5jdGlvbiAoa2V5c2VxdWVuY2UsIGZuKSB7XG5cdFx0XHRcdFx0a2V5c2VxdWVuY2UgPSBrZXlzZXF1ZW5jZS50b1VwcGVyQ2FzZSgpO1xuXHRcdFx0XHRcdHRoYXQuZGF0YSgnZXZlbnRzJylba2V5c2VxdWVuY2VdID0gZm47XG5cdFx0XHRcdFx0dmFyIGNtZHMgPSBrZXlzZXF1ZW5jZS5zcGxpdCgnKycpO1xuXHRcdFx0XHRcdGZvciAobGV0IGkgaW4gY21kcykge1xuXHRcdFx0XHRcdFx0aWYgKCEhcm91dGVrZXlbY21kc1tpXV0pIHtcblx0XHRcdFx0XHRcdFx0Y21kc1tpXSA9IHJvdXRla2V5W2NtZHNbaV1dO1xuXHRcdFx0XHRcdFx0XHR0aGF0LmRhdGEoJ2V2ZW50cycpW2NtZHMuam9pbignKycpXSA9IGZuO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHR9XG5cdH0pO1xufSkoalF1ZXJ5KTsiLCJpbXBvcnQge1NpbmdsZX0gZnJvbSAnLi4vd3JpaXQtdGFncyc7XG5leHBvcnQgZGVmYXVsdCB7XG5cdFNldHVwOiBmdW5jdGlvbiAodG9vbGJhcikge1xuXHRcdGxldCBib2xkID0gbmV3IFNpbmdsZShcImJvbGRcIiwgXCJzdHJvbmdcIiwge1xuXHRcdFx0dG9vbHRpcDogXCJCb2xkXCIsXG5cdFx0XHRpY29uY2xhc3M6IFwiZmEgZmEtYm9sZFwiLFxuXHRcdFx0c2hvcnRjdXQ6IFwiQ01EK1NISUZUK0JcIlxuXHRcdH0pO1xuXHRcdHRvb2xiYXIuQWRkQnV0dG9uKGJvbGQpO1xuXHRcdHRoaXMuQ2FsbGJhY2soYm9sZCwgdGhpcy5JbnNlcnQpO1xuXHR9XG59OyIsImltcG9ydCB7U3R5bGVUYWcsU3R5bGVBdHRyfSBmcm9tICcuLi90YWdzJztcblxuZXhwb3J0IGRlZmF1bHQge1xuXHRTZXR1cDogZnVuY3Rpb24gKHRvb2xiYXIpIHtcblx0XHRsZXQgdGFnID0gbmV3IFN0eWxlVGFnKCdmb3JlY29sb3InKTtcblx0XHRsZXQgcHJvcCA9IHRhZy5uZXdQcm9wZXJ0eShcImNvbG9yXCIpO1xuXHRcdHRhZy5BZGQocHJvcC5LZXlWYWx1ZSgnI0ZGMDAwMCcsICdyZWQnKSk7XG5cdFx0bGV0IGZtdWx0aSA9IG5ldyBTdHlsZUF0dHIoJ2ZvcmVjb2xvcicsIFwic3BhblwiLCBjKTtcblx0XHRmbXVsdGkuQWRkKCdyZWQnLCBjLmFwcGx5KCcjMDBGRjAwJyksIHtcblx0XHRcdGRpc3BsYXljbGFzczogXCJmYSBmYS1mb250XCJcblx0XHR9LCB0cnVlKTtcblx0XHR0b29sYmFyLkFkZEJ1dHRvbihmbXVsdGkpO1xuXHRcdHRoaXMuQ2FsbGJhY2soZm11bHRpLCB0aGlzLkluc2VydCk7XG5cdH1cbn07IiwiZXhwb3J0IHtkZWZhdWx0IGFzIGZvcmVjb2xvcn0gZnJvbSAnLi9mb3JlY29sb3InO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGJvbGR9IGZyb20gJy4vYm9sZCc7IiwiZXhwb3J0IGRlZmF1bHQgY2xhc3Mge1xuXHRjb25zdHJ1Y3RvcihpZCwgdGFnLCBhdHRyaWJ1dGVzLCBoaWdobGlnaHQpIHtcblx0XHR0aGlzLklkID0gaWQ7XG5cdFx0dGhpcy5oaWdobGlnaHQgPSB0cnVlO1xuXHRcdHRoaXMuVGFnTmFtZSA9IHRhZztcblx0XHR0aGlzLkF0dHJpYnV0ZXMgPSBbXTtcblx0XHR0aGlzLlNob3J0Y3V0ID0gYXR0cmlidXRlcy5zaG9ydGN1dCB8fCBudWxsO1xuXHRcdHRoaXMuVG9vbFRpcCA9IGF0dHJpYnV0ZXMudG9vbHRpcCB8fCBudWxsO1xuXHRcdHRoaXMuSWNvbkNsYXNzID0gYXR0cmlidXRlcy5pY29uY2xhc3MgfHwgbnVsbDtcblx0fVxuXHRpc0NvbXBhdGlibGUoaHRtbG5vZGUpIHtcblx0XHRpZiAoaHRtbG5vZGUubm9kZVR5cGUgIT09IDEgfHwgaHRtbG5vZGUudGFnTmFtZS50b0xvd2VyQ2FzZSgpICE9PSB0aGlzLlRhZ05hbWUudG9Mb3dlckNhc2UoKSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXHRpc0luc3RhbmNlKGh0bWxub2RlKSB7XG5cdFx0aWYgKCF0aGlzLmlzQ29tcGF0aWJsZShodG1sbm9kZSkpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0Zm9yIChsZXQgYXR0ciBpbiB0aGlzLkF0dHIpIHtcblx0XHRcdGxldCBhdHJpYnV0ZSA9IHRoaXMuQXR0clthdHRyXTtcblx0XHRcdGlmIChhdHJpYnV0ZSBpbnN0YW5jZW9mIFN0eWxlQXR0cikge1xuXHRcdFx0XHRpZiAoaHRtbG5vZGUuc3R5bGVbYXRyaWJ1dGUuYXR0cl0gPT09IFwiXCIpIHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAoYXRyaWJ1dGUgaW5zdGFuY2VvZiBHZW5lcmFsQXR0cikge1xuXHRcdFx0XHRpZiAoaHRtbG5vZGUuYXR0cmlidXRlc1thdHRyXS52YWx1ZSAhPT0gdGhpcy5BdHRyW2F0dHJdKSByZXR1cm4gZmFsc2U7XG5cdFx0XHR9IGVsc2UgaWYgKGF0cmlidXRlIGluc3RhbmNlb2YgQ2xhc3NBdHRyKSB7XG5cdFx0XHRcdGlmIChodG1sbm9kZS5jbGFzc0xpc3QpIHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblx0bmV3KCkge1xuXHRcdGxldCBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGhpcy5UYWdOYW1lKTtcblx0XHQvL3RoaXMuVXBkYXRlQXR0cmlidXRlcyhlbCk7XG5cdFx0cmV0dXJuIGVsO1xuXHR9XG59IiwiaW1wb3J0IEJhc2UgZnJvbSAnLi9CYXNlJztcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNpbmdsZSBleHRlbmRzIEJhc2Uge1xuXHRjb25zdHJ1Y3RvcihpZCwgdGFnLCBvcHRpb25zKSB7XG5cdFx0c3VwZXIoaWQsIHRhZywgb3B0aW9ucywgZmFsc2UpO1xuXHR9XG59IiwiaW1wb3J0IEJhc2UgZnJvbSAnLi9CYXNlJztcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0eWxlVGFnIGV4dGVuZHMgQmFzZSB7XG5cdGNvbnN0cnVjdG9yKC4uLmFyZ3MpIHtcblx0XHRzdXBlciguLi5hcmdzKTtcblx0fVxuXHRuZXdQcm9wZXJ0eShwcm9wZXJ0eSkge1xuXHRcdHJldHVybiBuZXcgQXR0ckdlbmVyYXRvcihTdHlsZUF0dHIsIHByb3BlcnR5KTtcblx0fVxuXHRBZGQoYXR0cmlidXRlKSB7XG5cdFx0dGhpcy5BdHRyaWJ1dGVzW2F0dHJpYnV0ZS5hdHRyXSA9IGF0dHJpYnV0ZTtcblx0fVxufSIsImV4cG9ydCB7ZGVmYXVsdCBhcyBTaW5nbGV9IGZyb20gJy4vU2luZ2xlJztcbmV4cG9ydCB7ZGVmYXVsdCBhcyBTdHlsZVRhZ30gZnJvbSAnLi9TdHlsZVRhZyc7IiwiLypnbG9iYWwgZG9jdW1lbnQsd2luZG93LCQsY29uc29sZSxzZXRJbnRlcnZhbCxCYXNpYyxNYW55LFNpbmdsZSxNdWx0aUF0dHIsTXVsdGlDbGFzcyxXcmlpdFN0eWxlLHJlZ2V4cCxTdHlsZVRhZyovXG5pbXBvcnQge1NpbmdsZSxTdHlsZVRhZ30gZnJvbSAnLi93cmlpdC10YWdzJztcbmZ1bmN0aW9uIG1ha2VDaGlsZFNpYmxpbmdzKG5vZGUpIHtcblx0dmFyIHBhcmVudCA9IG5vZGUucGFyZW50Tm9kZTtcblx0d2hpbGUgKG5vZGUuY2hpbGROb2Rlcy5sZW5ndGggPiAwKSB7XG5cdFx0cGFyZW50Lmluc2VydEJlZm9yZShub2RlLmNoaWxkTm9kZXNbMF0sIG5vZGUpO1xuXHR9XG59XG5sZXQgTW9kdWxlID0gZnVuY3Rpb24gKHRoYXQpIHtcblx0bGV0IG1vZCA9IHRoaXM7XG5cdHRoaXMuVGFnPW51bGw7XG5cdHRoaXMudmlzdWFsPW51bGw7XG5cdHRoaXMuRWRpdG9yID0gdGhhdDtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIFwiU2VsZWN0aW9uXCIsIHtcblx0XHRnZXQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiBtb2QuVGFnLlN1cGVySWQgIT09IHVuZGVmaW5lZCA/IHRoYXQuTW9kdWxlc1ttb2QuVGFnLlN1cGVySWRdIDogdGhhdC5Nb2R1bGVzW21vZC5UYWcuSWRdO1xuXHRcdH0sXG5cdH0pO1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgXCJWaXN1YWxcIiwge1xuXHRcdGdldDogZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIHRoYXQuaHRtbC5nZXRTZWxlY3Rpb24oMCkudmlzdWFsO1xuXHRcdH0sXG5cdH0pO1xufTtcbk1vZHVsZS5wcm90b3R5cGUgPSB7XG5cdEVkaXRvcjogdW5kZWZpbmVkLFxuXHRUZWFyRG93bjogdW5kZWZpbmVkLFxuXHRJTWFueTogZnVuY3Rpb24gKHRleHRhcmVhKSB7XG5cdFx0bGV0IHNlbGVjdGlvbiA9IHRoaXMuU2VsZWN0aW9uO1xuXHRcdGxldCB2aXN1YWwgPSB0aGlzLlZpc3VhbDtcblx0XHRsZXQgbm9kZSA9IHZpc3VhbC5jb21tb25BbmNlc3RvckNvbnRhaW5lcjtcblx0XHRpZiAobm9kZS5ub2RlVHlwZSAhPT0gMSkge1xuXHRcdFx0bm9kZSA9IG5vZGUucGFyZW50Tm9kZTtcblx0XHR9XG5cdFx0aWYgKHNlbGVjdGlvbi5pc1NvcnJvdW5kZWQpIHtcblx0XHRcdGZvciAobGV0IHQgaW4gdGhpcy5UYWcuUGFyZW50LmNoaWxkcmVuKSB7XG5cdFx0XHRcdGxldCB0YWcgPSB0aGlzLlRhZy5QYXJlbnQuY2hpbGRyZW5bdF07XG5cdFx0XHRcdHRoaXMuRWRpdG9yLmJ1dHRvbih0YWcuSWQpLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuXHRcdFx0fVxuXHRcdFx0d2hpbGUgKG5vZGUudGFnTmFtZS50b0xvd2VyQ2FzZSgpICE9PSB0aGlzLlRhZy5UYWdOYW1lLnRvTG93ZXJDYXNlKCkpIHtcblx0XHRcdFx0bm9kZSA9IG5vZGUucGFyZW50Tm9kZTtcblx0XHRcdH1cblx0XHRcdGlmICh0aGlzLlRhZy5pc0NvbXBhdGlibGUobm9kZSkpIHtcblx0XHRcdFx0Zm9yIChsZXQgYXR0ciBpbiB0aGlzLlRhZy5BdHRyKSB7XG5cdFx0XHRcdFx0dGhpcy5UYWcuVXBkYXRlQXR0cmlidXRlcyhub2RlKTtcblx0XHRcdFx0XHQvL25vZGUuc2V0QXR0cmlidXRlKGF0dHIsIHRoaXMuVGFnLkF0dHJbYXR0cl0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRoaXMuRWRpdG9yLmJ1dHRvbih0aGlzLlRhZy5JZCkuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICghKHRoaXMuVGFnLlBhcmVudCBpbnN0YW5jZW9mIE11bHRpQ2xhc3MpKSB7XG5cdFx0XHRsZXQgbmV3ZWwgPSB0aGlzLlRhZy5uZXcoKTtcblx0XHRcdG5ld2VsLmFwcGVuZENoaWxkKHZpc3VhbC5leHRyYWN0Q29udGVudHMoKSk7XG5cdFx0XHR2aXN1YWwuaW5zZXJ0Tm9kZShuZXdlbCk7XG5cdFx0XHR0ZXh0YXJlYS5ub3JtYWxpemUoKTtcblx0XHR9XG5cdFx0ZG9jdW1lbnQuZ2V0U2VsZWN0aW9uKCkucmVtb3ZlQWxsUmFuZ2VzKCk7XG5cdFx0ZG9jdW1lbnQuZ2V0U2VsZWN0aW9uKCkuYWRkUmFuZ2UodmlzdWFsKTtcblx0fSxcblx0SVNpbmdsZTogZnVuY3Rpb24gKHRleHRhcmVhKSB7XG5cdFx0bGV0IHNlbGVjdGlvbiA9IHRoaXMuU2VsZWN0aW9uO1xuXHRcdGxldCB2aXN1YWwgPSB0aGlzLlZpc3VhbDtcblx0XHRpZiAodmlzdWFsLmNvbGxhcHNlZCAmJiBzZWxlY3Rpb24uaXNTb3Jyb3VuZGVkKSB7XG5cdFx0XHRsZXQgb2xkbm9kZSA9IHZpc3VhbC5zdGFydENvbnRhaW5lci5wYXJlbnROb2RlO1xuXHRcdFx0d2hpbGUgKCF0aGlzLlRhZy5pc0luc3RhbmNlKG9sZG5vZGUpKSB7XG5cdFx0XHRcdG9sZG5vZGUgPSBvbGRub2RlLnBhcmVudE5vZGU7XG5cdFx0XHR9XG5cdFx0XHRtYWtlQ2hpbGRTaWJsaW5ncyhvbGRub2RlKTtcblx0XHRcdG9sZG5vZGUucmVtb3ZlKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGxldCBuZXdlbCA9IHRoaXMuVGFnLm5ldygpO1xuXHRcdFx0bmV3ZWwuYXBwZW5kQ2hpbGQodmlzdWFsLmV4dHJhY3RDb250ZW50cygpKTtcblx0XHRcdHZpc3VhbC5pbnNlcnROb2RlKG5ld2VsKTtcblx0XHRcdGlmICh0aGlzLlRhZy5pc0luc3RhbmNlKG5ld2VsLm5leHRTaWJsaW5nKSkge1xuXHRcdFx0XHRsZXQgc2libGluZyA9IG5ld2VsLm5leHRTaWJsaW5nO1xuXHRcdFx0XHRBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKHNpYmxpbmcuY2hpbGROb2RlcywgZnVuY3Rpb24gKGlubmVyY2hpbGQpIHtcblx0XHRcdFx0XHRuZXdlbC5hcHBlbmRDaGlsZChpbm5lcmNoaWxkKTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdHNpYmxpbmcucmVtb3ZlKCk7XG5cdFx0XHR9XG5cdFx0XHRpZiAodGhpcy5UYWcuaXNJbnN0YW5jZShuZXdlbC5wcmV2aW91c1NpYmxpbmcpKSB7XG5cdFx0XHRcdGxldCBzaWJsaW5nID0gbmV3ZWwucHJldmlvdXNTaWJsaW5nO1xuXHRcdFx0XHRBcnJheS5wcm90b3R5cGUuZm9yRWFjaC5jYWxsKHNpYmxpbmcuY2hpbGROb2RlcywgZnVuY3Rpb24gKGlubmVyY2hpbGQpIHtcblx0XHRcdFx0XHRuZXdlbC5pbnNlcnRCZWZvcmUoaW5uZXJjaGlsZCwgbmV3ZWwuZmlyc3RDaGlsZCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRzaWJsaW5nLnJlbW92ZSgpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHNlbGVjdGlvbi5pc0NvbnRhaW5lZCArIHNlbGVjdGlvbi5pc09wZW5lZCArIHNlbGVjdGlvbi5pc0Nsb3NlZCkge1xuXHRcdFx0XHRsZXQgY2xlYW5ub2RlID0gdmlzdWFsLmV4dHJhY3RDb250ZW50cygpLmZpcnN0Q2hpbGQ7XG5cdFx0XHRcdGxldCBpbm5lciA9IGNsZWFubm9kZS5xdWVyeVNlbGVjdG9yQWxsKHRoaXMuVGFnLlRhZ05hbWUpO1xuXHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGlubmVyLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0bWFrZUNoaWxkU2libGluZ3MoaW5uZXJbaV0pO1xuXHRcdFx0XHRcdGlubmVyW2ldLnJlbW92ZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHZpc3VhbC5pbnNlcnROb2RlKG5ld2VsKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0dGV4dGFyZWEucGFyZW50Tm9kZS5xdWVyeVNlbGVjdG9yQWxsKFwiW2RhdGEtd3JpaXQtY29tbWFuZElkPVwiICsgdGhpcy5UYWcuSWQgKyBcIl1cIilbMF0uY2xhc3NMaXN0LnRvZ2dsZSgnYWN0aXZlJyk7XG5cdFx0dGV4dGFyZWEubm9ybWFsaXplKCk7XG5cdFx0ZG9jdW1lbnQuZ2V0U2VsZWN0aW9uKCkucmVtb3ZlQWxsUmFuZ2VzKCk7XG5cdFx0ZG9jdW1lbnQuZ2V0U2VsZWN0aW9uKCkuYWRkUmFuZ2UodmlzdWFsKTtcblx0fSxcblx0SW5zZXJ0OiBmdW5jdGlvbiAoZSwgdGV4dGFyZWEpIHtcblx0XHRpZiAodGhpcy5UYWcgaW5zdGFuY2VvZiBTaW5nbGUpIHtcblx0XHRcdHRoaXMuSVNpbmdsZS5hcHBseSh0aGlzLCBbdGV4dGFyZWFdKTtcblx0XHR9IGVsc2UgaWYgKHRoaXMuVGFnIGluc3RhbmNlb2YgTWFueSkge1xuXHRcdFx0dGhpcy5JTWFueS5hcHBseSh0aGlzLCBbdGV4dGFyZWFdKTtcblx0XHR9XG5cdH0sXG5cdENhbGxiYWNrOiBmdW5jdGlvbiAodGFnLCBmbikge1xuXHRcdGxldCBhcHBseSA9IGZ1bmN0aW9uICh0YWcpIHtcblx0XHRcdGxldCBidXR0b24gPSB0aGlzLkVkaXRvci5idXR0b25zW3RhZy5JZF07XG5cdFx0XHRsZXQgbW9kID0gdGhpcztcblx0XHRcdGJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uIChlLCByb3V0ZWRldmVudCkge1xuXHRcdFx0XHRtb2QuVGFnID0gdGFnO1xuXHRcdFx0XHR0aGlzLmV2ZW50ID0gcm91dGVkZXZlbnQgfHwgZTtcblx0XHRcdFx0aWYgKHRoaXMuQmVmb3JlRm9ybWF0ICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRtb2QuQmVmb3JlRm9ybWF0LmFwcGx5KG1vZCwgW3JvdXRlZGV2ZW50IHx8IGVdKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRsZXQgcmVzID0gZm4uYXBwbHkobW9kLCBbcm91dGVkZXZlbnQgfHwgZSwgbW9kLkVkaXRvci50ZXh0YXJlYS5nZXQoMCldKTtcblx0XHRcdFx0aWYgKHRoaXMuQWZ0ZXJGb3JtYXQgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdHRoaXMuQWZ0ZXJGb3JtYXQuYXBwbHkobW9kLCBbcm91dGVkZXZlbnQgfHwgZV0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiByZXM7XG5cdFx0XHR9KTtcblx0XHRcdGlmICghIXRhZy5TaG9ydGN1dCkge1xuXHRcdFx0XHR0aGlzLkVkaXRvci50ZXh0YXJlYS5rZXlzLmJpbmQodGFnLlNob3J0Y3V0LCBmdW5jdGlvbiAoZSkge1xuXHRcdFx0XHRcdCQoYnV0dG9uKS50cmlnZ2VyKCdjbGljaycsIGUpO1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHRpZiAodGFnIGluc3RhbmNlb2YgU2luZ2xlKSB7XG5cdFx0XHRhcHBseS5hcHBseSh0aGlzLCBbdGFnXSk7XG5cdFx0fSBlbHNlIGlmICh0YWcgaW5zdGFuY2VvZiBNdWx0aUNsYXNzKSB7XG5cdFx0XHRmb3IgKGxldCBpIGluIHRhZy5jaGlsZHJlbikge1xuXHRcdFx0XHRhcHBseS5hcHBseSh0aGlzLCBbdGFnLmNoaWxkcmVuW2ldXSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICh0YWcgaW5zdGFuY2VvZiBNdWx0aUF0dHIpIHtcblx0XHRcdGZvciAobGV0IGkgaW4gdGFnLmNoaWxkcmVuKSB7XG5cdFx0XHRcdGFwcGx5LmFwcGx5KHRoaXMsIFt0YWcuY2hpbGRyZW5baV1dKTtcblx0XHRcdH1cblx0XHR9XG5cblx0fSxcblx0QmVmb3JlRm9ybWF0OiB1bmRlZmluZWQsXG5cdEFmdGVyRm9ybWF0OiB1bmRlZmluZWQsXG5cdFNldHVwOiB1bmRlZmluZWRcbn07XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTW9kdWxlLCAnSU1hbnknLCB7XG5cdHdyaXRhYmxlOiBmYWxzZSxcblx0ZW51bWVyYWJsZTogZmFsc2Vcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1vZHVsZSwgJ0luc2VydCcsIHtcblx0d3JpdGFibGU6IGZhbHNlLFxuXHRlbnVtZXJhYmxlOiBmYWxzZVxufSk7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoTW9kdWxlLCAnSVNpbmdsZScsIHtcblx0d3JpdGFibGU6IGZhbHNlLFxuXHRlbnVtZXJhYmxlOiBmYWxzZVxufSk7XG5leHBvcnQgZGVmYXVsdCBNb2R1bGU7IiwiLypnbG9iYWwgZG9jdW1lbnQqL1xuLyoganNoaW50IC1XMDk3ICovXG5cInVzZSBzdHJpY3RcIjtcblxuZnVuY3Rpb24gQmFzZUF0dHIoYXR0ciwgdmFsdWUpIHtcblx0dGhpcy5hdHRyID0gYXR0cjtcblx0dGhpcy52YWx1ZSA9IHZhbHVlO1xufVxuXG5leHBvcnQgY2xhc3MgQ2xhc3NBdHRyIHtcblxufVxuXG5leHBvcnQgZnVuY3Rpb24gU3R5bGVBdHRyKGF0dHIsIHZhbHVlKSB7XG5cdEJhc2VBdHRyLmNhbGwodGhpcywgYXR0ciwgdmFsdWUpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gR2VuZXJhbEF0dHIoYXR0ciwgdmFsdWUpIHtcblx0QmFzZUF0dHIuY2FsbCh0aGlzLCBhdHRyLCB2YWx1ZSk7XG59XG5TdHlsZUF0dHIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXNlQXR0ci5wcm90b3R5cGUpO1xuR2VuZXJhbEF0dHIucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXNlQXR0ci5wcm90b3R5cGUpO1xuXG5mdW5jdGlvbiBCYXNlVGFnKGlkLCB0YWcsIGF0dHJpYnV0ZXMsIGJsb3cpIHtcblx0dGhpcy5NaW1lID0gYmxvdyA9PT0gdHJ1ZTtcblx0YXR0cmlidXRlcyA9IGF0dHJpYnV0ZXMgfHwge307XG5cdHRoaXMuSWQgPSBpZDtcblx0dGhpcy5TdXBlcklkID0gbnVsbDtcblx0dGhpcy5QYXJlbnQgPSBudWxsO1xuXHR0aGlzLlRhZ05hbWUgPSB0YWc7XG5cdHRoaXMuU2hvcnRjdXQgPSBhdHRyaWJ1dGVzLnNob3J0Y3V0IHx8IG51bGw7XG5cdGRlbGV0ZSBhdHRyaWJ1dGVzLnNob3J0Y3V0O1xuXHR0aGlzLlRvb2xUaXAgPSBhdHRyaWJ1dGVzLnRvb2x0aXAgfHwgbnVsbDtcblx0ZGVsZXRlIGF0dHJpYnV0ZXMudG9vbHRpcDtcblx0dGhpcy5EaXNwbGF5Q2xhc3MgPSBhdHRyaWJ1dGVzLmRpc3BsYXljbGFzcyB8fCBudWxsO1xuXHRkZWxldGUgYXR0cmlidXRlcy5kaXNwbGF5Y2xhc3M7XG5cdHRoaXMuQXR0ciA9IGF0dHJpYnV0ZXM7XG5cbn1cbkJhc2VUYWcucHJvdG90eXBlLkF0dHJNYXRjaCA9IGZ1bmN0aW9uIChhdHRyLCB2YWx1ZSkge1xuXHRyZXR1cm4gdGhpcy5BdHRyW2F0dHJdID09PSB2YWx1ZTtcbn07XG5cbkJhc2VUYWcucHJvdG90eXBlLmlzSW5zdGFuY2UgPSBmdW5jdGlvbiAoaHRtbG5vZGUpIHtcblx0aWYgKGh0bWxub2RlLm5vZGVUeXBlICE9PSAxKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cdGlmIChodG1sbm9kZS50YWdOYW1lLnRvTG93ZXJDYXNlKCkgIT09IHRoaXMuVGFnTmFtZS50b0xvd2VyQ2FzZSgpKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cdGZvciAobGV0IGF0dHIgaW4gdGhpcy5BdHRyKSB7XG5cdFx0bGV0IGF0cmlidXRlID0gdGhpcy5BdHRyW2F0dHJdO1xuXHRcdGlmIChhdHJpYnV0ZSBpbnN0YW5jZW9mIFN0eWxlQXR0cikge1xuXHRcdFx0aWYgKGh0bWxub2RlLnN0eWxlW2F0cmlidXRlLmF0dHJdID09PSBcIlwiKSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKGF0cmlidXRlIGluc3RhbmNlb2YgR2VuZXJhbEF0dHIpIHtcblx0XHRcdGlmIChodG1sbm9kZS5hdHRyaWJ1dGVzW2F0dHJdLnZhbHVlICE9PSB0aGlzLkF0dHJbYXR0cl0pIHJldHVybiBmYWxzZTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHRydWU7XG59O1xuQmFzZVRhZy5wcm90b3R5cGUubmV3ID0gZnVuY3Rpb24gKCkge1xuXHRsZXQgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRoaXMuVGFnTmFtZSk7XG5cdHRoaXMuVXBkYXRlQXR0cmlidXRlcyhlbCk7XG5cdHJldHVybiBlbDtcbn07XG5CYXNlVGFnLnByb3RvdHlwZS5VcGRhdGVBdHRyaWJ1dGVzID0gZnVuY3Rpb24gKG5vZGUpIHtcblx0Zm9yIChsZXQgYXR0ciBpbiB0aGlzLkF0dHIpIHtcblx0XHRsZXQgYXRyaWJ1dGUgPSB0aGlzLkF0dHJbYXR0cl07XG5cdFx0aWYgKGF0cmlidXRlIGluc3RhbmNlb2YgU3R5bGVBdHRyKSB7XG5cdFx0XHRub2RlLnN0eWxlW2F0cmlidXRlLmF0dHJdID0gYXRyaWJ1dGUudmFsdWU7XG5cdFx0fSBlbHNlIGlmIChhdHJpYnV0ZSBpbnN0YW5jZW9mIEdlbmVyYWxBdHRyKSB7XG5cdFx0XHRub2RlLnNldEF0dHJpYnV0ZShhdHRyLCB0aGlzLkF0dHJbYXR0cl0pO1xuXHRcdH1cblx0fVxufTtcbkJhc2VUYWcucHJvdG90eXBlLkF0dHJNYXRjaCA9IGZ1bmN0aW9uIChhdHRyLCB2YWx1ZSkge1xuXHRyZXR1cm4gdGhpcy5BdHRyW2F0dHJdID09PSB2YWx1ZTtcbn07XG5CYXNlVGFnLnByb3RvdHlwZS5pc0NvbXBhdGlibGUgPSBmdW5jdGlvbiAoaHRtbG5vZGUpIHtcblx0aWYgKGh0bWxub2RlLm5vZGVUeXBlICE9PSAxIHx8IGh0bWxub2RlLnRhZ05hbWUudG9Mb3dlckNhc2UoKSAhPT0gdGhpcy5UYWdOYW1lLnRvTG93ZXJDYXNlKCkpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblx0cmV0dXJuIHRydWU7XG59O1xuXG4vKmV4cG9ydCBmdW5jdGlvbiBTdHlsZVRhZyhpZCkge1xuXHRCYXNlVGFnLmNhbGwodGhpcywgaWQsXCJzcGFuXCIsbnVsbCx0cnVlKTtcbn0qL1xuXG5jbGFzcyBCYXNlIHtcblx0Y29uc3RydWN0b3IoaWQsIHRhZywgYXR0cmlidXRlcywgaGlnaGxpZ2h0KSB7XG5cdFx0dGhpcy5JZCA9IGlkO1xuXHRcdHRoaXMuaGlnaGxpZ2h0ID0gdHJ1ZTtcblx0XHR0aGlzLlRhZ05hbWUgPSB0YWc7XG5cdFx0dGhpcy5BdHRyaWJ1dGVzID0gW107XG5cdFx0dGhpcy5TaG9ydGN1dCA9IGF0dHJpYnV0ZXMuc2hvcnRjdXQgfHwgbnVsbDtcblx0XHR0aGlzLlRvb2xUaXAgPSBhdHRyaWJ1dGVzLnRvb2x0aXAgfHwgbnVsbDtcblx0XHR0aGlzLkljb25DbGFzcyA9IGF0dHJpYnV0ZXMuaWNvbmNsYXNzIHx8IG51bGw7XG5cdH1cblx0aXNDb21wYXRpYmxlKGh0bWxub2RlKSB7XG5cdFx0aWYgKGh0bWxub2RlLm5vZGVUeXBlICE9PSAxIHx8IGh0bWxub2RlLnRhZ05hbWUudG9Mb3dlckNhc2UoKSAhPT0gdGhpcy5UYWdOYW1lLnRvTG93ZXJDYXNlKCkpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblx0aXNJbnN0YW5jZShodG1sbm9kZSkge1xuXHRcdGlmICghdGhpcy5pc0NvbXBhdGlibGUoaHRtbG5vZGUpKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdGZvciAobGV0IGF0dHIgaW4gdGhpcy5BdHRyKSB7XG5cdFx0XHRsZXQgYXRyaWJ1dGUgPSB0aGlzLkF0dHJbYXR0cl07XG5cdFx0XHRpZiAoYXRyaWJ1dGUgaW5zdGFuY2VvZiBTdHlsZUF0dHIpIHtcblx0XHRcdFx0aWYgKGh0bWxub2RlLnN0eWxlW2F0cmlidXRlLmF0dHJdID09PSBcIlwiKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2UgaWYgKGF0cmlidXRlIGluc3RhbmNlb2YgR2VuZXJhbEF0dHIpIHtcblx0XHRcdFx0aWYgKGh0bWxub2RlLmF0dHJpYnV0ZXNbYXR0cl0udmFsdWUgIT09IHRoaXMuQXR0clthdHRyXSkgcmV0dXJuIGZhbHNlO1xuXHRcdFx0fSBlbHNlIGlmIChhdHJpYnV0ZSBpbnN0YW5jZW9mIENsYXNzQXR0cikge1xuXHRcdFx0XHRpZiAoaHRtbG5vZGUuY2xhc3NMaXN0KSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cdG5ldygpIHtcblx0XHRsZXQgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRoaXMuVGFnTmFtZSk7XG5cdFx0Ly90aGlzLlVwZGF0ZUF0dHJpYnV0ZXMoZWwpO1xuXHRcdHJldHVybiBlbDtcblx0fVxufVxuY2xhc3MgQXR0ckdlbmVyYXRvciB7XG5cdGNvbnN0cnVjdG9yKGdlbiwgcHJvcGVydHkpIHtcblx0XHR0aGlzLmdlbiA9IGdlbjtcblx0XHR0aGlzLnByb3BlcnR5ID0gcHJvcGVydHk7XG5cdH1cblx0S2V5VmFsdWUodmFsdWUsIGxhYmVsKSB7XG5cdFx0cmV0dXJuIG5ldyB0aGlzLmdlbih0aGlzLnByb3BlcnR5LCB2YWx1ZSk7XG5cdH1cbn1cblxuZXhwb3J0IGNsYXNzIFN0eWxlVGFnIGV4dGVuZHMgQmFzZSB7XG5cdGNvbnN0cnVjdG9yKC4uLmFyZ3MpIHtcblx0XHRzdXBlciguLi5hcmdzKTtcblx0fVxuXHRuZXdQcm9wZXJ0eShwcm9wZXJ0eSkge1xuXHRcdHJldHVybiBuZXcgQXR0ckdlbmVyYXRvcihTdHlsZUF0dHIsIHByb3BlcnR5KTtcblx0fVxuXHRBZGQoYXR0cmlidXRlKSB7XG5cdFx0dGhpcy5BdHRyaWJ1dGVzW2F0dHJpYnV0ZS5hdHRyXSA9IGF0dHJpYnV0ZTtcblx0fVxufVxuZXhwb3J0IGNsYXNzIFNpbmdsZSBleHRlbmRzIEJhc2Uge1xuXHRjb25zdHJ1Y3RvcihpZCwgdGFnLCBvcHRpb25zKSB7XG5cdFx0c3VwZXIoaWQsIHRhZywgb3B0aW9ucywgZmFsc2UpO1xuXHR9XG59XG5cbi8qXG5mdW5jdGlvbiBXcmlpdEF0dHIoYXR0cikge1xuXHR0aGlzLmF0dHIgPSBhdHRyO1xufVxuZnVuY3Rpb24gQXBwbHlBdHRyKHZhbHVlKSB7XG5cdHRoaXMudmFsdWUgPSB2YWx1ZTtcblx0cmV0dXJuIHRoaXM7XG59XG5mdW5jdGlvbiBXcmlpdFN0eWxlKGF0dHIpIHtcblx0dGhpcy5hdHRyID0gYXR0cjtcbn1cblxuV3JpaXRBdHRyLnByb3RvdHlwZS5hcHBseSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuXHRyZXR1cm4gbmV3IEdlbmVyYWxBdHRyKHRoaXMuYXR0ciwgdmFsdWUpO1xufTtcbldyaWl0U3R5bGUucHJvdG90eXBlLmFwcGx5ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG5cdHJldHVybiBuZXcgU3R5bGVBdHRyKHRoaXMuYXR0ciwgdmFsdWUpO1xufTtcbk9iamVjdC5mcmVlemUoV3JpaXRBdHRyKTtcbk9iamVjdC5mcmVlemUoV3JpaXRTdHlsZSk7XG5cblxuXG5cbmZ1bmN0aW9uIEJhc2ljKGlkLCB0YWcsIGF0dHJpYnV0ZXMsYmxvdykge1xuXHR0aGlzLk1pbWUgPSBibG93ID09PSB0cnVlO1xuXHRhdHRyaWJ1dGVzID0gYXR0cmlidXRlcyB8fCB7fTtcblx0dGhpcy5JZCA9IGlkO1xuXHR0aGlzLlN1cGVySWQgPSBudWxsO1xuXHR0aGlzLlBhcmVudCA9IG51bGw7XG5cdHRoaXMuVGFnTmFtZSA9IHRhZztcblx0dGhpcy5TaG9ydGN1dCA9IGF0dHJpYnV0ZXMuc2hvcnRjdXQgfHwgbnVsbDtcblx0ZGVsZXRlIGF0dHJpYnV0ZXNbXCJzaG9ydGN1dFwiXTtcblx0dGhpcy5Ub29sVGlwID0gYXR0cmlidXRlcy50b29sdGlwIHx8IG51bGw7XG5cdGRlbGV0ZSBhdHRyaWJ1dGVzW1widG9vbHRpcFwiXTtcblx0dGhpcy5EaXNwbGF5Q2xhc3MgPSBhdHRyaWJ1dGVzLmRpc3BsYXljbGFzcyB8fCBudWxsO1xuXHRkZWxldGUgYXR0cmlidXRlc1tcImRpc3BsYXljbGFzc1wiXTtcblx0dGhpcy5BdHRyID0gYXR0cmlidXRlcztcblx0dGhpcy5BdHRyTWF0Y2ggPSBmdW5jdGlvbiAoYXR0ciwgdmFsdWUpIHtcblx0XHRyZXR1cm4gdGhpcy5BdHRyW2F0dHJdID09PSB2YWx1ZTtcblx0fVxuXHR0aGlzLmlzSW5zdGFuY2UgPSBmdW5jdGlvbiAoaHRtbG5vZGUpIHtcblx0XHRpZiAoaHRtbG5vZGUubm9kZVR5cGUgIT0gMSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRpZiAoaHRtbG5vZGUudGFnTmFtZS50b0xvd2VyQ2FzZSgpICE9IHRoaXMuVGFnTmFtZS50b0xvd2VyQ2FzZSgpKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdGZvciAobGV0IGF0dHIgaW4gdGhpcy5BdHRyKSB7XG5cdFx0XHRsZXQgYXRyaWJ1dGUgPSB0aGlzLkF0dHJbYXR0cl07XG5cdFx0XHRpZiAoYXRyaWJ1dGUgaW5zdGFuY2VvZiBTdHlsZUF0dHIpIHtcblx0XHRcdFx0aWYoaHRtbG5vZGUuc3R5bGVbYXRyaWJ1dGUuYXR0cl09PVwiXCIpe3JldHVybiBmYWxzZTt9XG5cdFx0XHR9IGVsc2UgaWYgKGF0cmlidXRlIGluc3RhbmNlb2YgR2VuZXJhbEF0dHIpIHtcblx0XHRcdFx0aWYgKGh0bWxub2RlLmF0dHJpYnV0ZXNbcHJvcF0udmFsdWUgIT0gdGhpcy5BdHRyW3Byb3BdKSByZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cdHRoaXMubmV3ID0gZnVuY3Rpb24gKCkge1xuXHRcdGxldCBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQodGhpcy5UYWdOYW1lKTtcblx0XHR0aGlzLlVwZGF0ZUF0dHJpYnV0ZXMoZWwpO1xuXHRcdHJldHVybiBlbDtcblx0fVxuXHR0aGlzLlVwZGF0ZUF0dHJpYnV0ZXMgPSBmdW5jdGlvbiAobm9kZSkge1xuXHRcdGZvciAobGV0IGF0dHIgaW4gdGhpcy5BdHRyKSB7XG5cdFx0XHRsZXQgYXRyaWJ1dGUgPSB0aGlzLkF0dHJbYXR0cl07XG5cdFx0XHRpZiAoYXRyaWJ1dGUgaW5zdGFuY2VvZiBTdHlsZUF0dHIpIHtcblx0XHRcdFx0bm9kZS5zdHlsZVthdHJpYnV0ZS5hdHRyXT1hdHJpYnV0ZS52YWx1ZTtcblx0XHRcdH0gZWxzZSBpZiAoYXRyaWJ1dGUgaW5zdGFuY2VvZiBHZW5lcmFsQXR0cikge1xuXHRcdFx0XHRub2RlLnNldEF0dHJpYnV0ZShhdHRyLCB0aGlzLkF0dHJbYXR0cl0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufVxuXG5mdW5jdGlvbiBNYW55KGlkLCB0YWcsIGF0dHJpYnV0ZXMsIGJsb3cpIHtcblx0dGhpcy5pc0NvbXBhdGlibGUgPSBmdW5jdGlvbiAobm9kZSkge1xuXHRcdGlmIChub2RlLm5vZGVUeXBlICE9IDEpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0aWYgKG5vZGUudGFnTmFtZS50b0xvd2VyQ2FzZSgpICE9IHRoaXMuVGFnTmFtZS50b0xvd2VyQ2FzZSgpKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdHJldHVybiB0cnVlO1xuXHR9O1xuXHRCYXNpYy5jYWxsKHRoaXMsIGlkLCB0YWcsIGF0dHJpYnV0ZXMsYmxvdyk7XG5cdC8vXHRPYmplY3QuZnJlZXplKHRoaXMpO1xufVxuZnVuY3Rpb24gTXVsdGlBdHRyKGlkLCB0YWcpIHtcblx0dGhpcy5JZCA9IGlkO1xuXHR0aGlzLlRhZ05hbWUgPSB0YWc7XG5cdHRoaXMuY2hpbGRyZW4gPSB7fTtcblx0dGhpcy5GaW5kQnlDbGFzcyA9IGZ1bmN0aW9uIChjbGFzc25hbWUpIHtcblx0XHRmb3IgKGxldCBjaGlsZCBpbiB0aGlzLmNoaWxkcmVuKSB7XG5cdFx0XHRpZiAodGhpcy5jaGlsZHJlbltjaGlsZF0uQXR0ck1hdGNoKFwiY2xhc3NcIiwgY2xhc3NuYW1lKSkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5jaGlsZHJlbltjaGlsZF07XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHRoaXMuQWRkID0gZnVuY3Rpb24gKHN1YmlkLCB2YWx1ZSwgYXR0cmlidXRlcyxtaW1lKSB7XG5cdFx0YXR0cmlidXRlcyA9IGF0dHJpYnV0ZXMgfHwge307XG5cdFx0YXR0cmlidXRlc1t2YWx1ZS5hdHRyXSA9IHZhbHVlO1xuXHRcdHRoaXMuY2hpbGRyZW5bc3ViaWRdID0gbmV3IE1hbnkodGhpcy5JZCArIFwiX1wiICsgc3ViaWQsIHRoaXMuVGFnTmFtZSwgYXR0cmlidXRlcywgbWltZSk7XG5cdFx0dGhpcy5jaGlsZHJlbltzdWJpZF0uU3VwZXJJZCA9IHRoaXMuSWQ7XG5cdFx0dGhpcy5jaGlsZHJlbltzdWJpZF0uUGFyZW50ID0gdGhpcztcblx0XHRPYmplY3QuZnJlZXplKHRoaXMuY2hpbGRyZW5bc3ViaWRdKTtcblx0fVxuXHR0aGlzLlJlbW92ZSA9IGZ1bmN0aW9uIChjbGFzbmFtZSkge1xuXHRcdGRlbGV0ZSB0aGlzLmNoaWxkcmVuW3N1YmlkXTtcblx0fTtcbn1cbmZ1bmN0aW9uIE11bHRpQ2xhc3MoaWQsIHRhZykge1xuXHR0aGlzLklkID0gaWQ7XG5cdHRoaXMuVGFnTmFtZSA9IHRhZztcblx0dGhpcy5jaGlsZHJlbiA9IHt9O1xuXHR0aGlzLkZpbmRCeUNsYXNzID0gZnVuY3Rpb24gKGNsYXNzbmFtZSkge1xuXHRcdGZvciAobGV0IGNoaWxkIGluIHRoaXMuY2hpbGRyZW4pIHtcblx0XHRcdGlmICh0aGlzLmNoaWxkcmVuW2NoaWxkXS5BdHRyTWF0Y2goXCJjbGFzc1wiLCBjbGFzc25hbWUpKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLmNoaWxkcmVuW2NoaWxkXTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0dGhpcy5BZGQgPSBmdW5jdGlvbiAoc3ViaWQsIGNsYXNzbmFtZSwgYXR0cmlidXRlcykge1xuXHRcdGF0dHJpYnV0ZXMgPSBhdHRyaWJ1dGVzIHx8IHt9O1xuXHRcdGF0dHJpYnV0ZXMuY2xhc3MgPSBjbGFzc25hbWU7XG5cdFx0dGhpcy5jaGlsZHJlbltzdWJpZF0gPSBuZXcgTWFueSh0aGlzLklkICsgXCJfXCIgKyBzdWJpZCwgdGhpcy5UYWdOYW1lLCBhdHRyaWJ1dGVzLCBcImNsYXNzXCIpO1xuXHRcdHRoaXMuY2hpbGRyZW5bc3ViaWRdLlN1cGVySWQgPSB0aGlzLklkO1xuXHRcdHRoaXMuY2hpbGRyZW5bc3ViaWRdLlBhcmVudCA9IHRoaXM7XG5cdFx0T2JqZWN0LmZyZWV6ZSh0aGlzLmNoaWxkcmVuW3N1YmlkXSk7XG5cdH1cblx0dGhpcy5SZW1vdmUgPSBmdW5jdGlvbiAoY2xhc25hbWUpIHtcblx0XHRkZWxldGUgdGhpcy5jaGlsZHJlbltzdWJpZF07XG5cdH1cbn1cblxuXG4vLz09PT09PT09PT09PT09RXhwZXJpbWVudGFsXG5mdW5jdGlvbiBNdWx0aVN0eWxlKGlkLCB0YWcpIHtcblx0dGhpcy5JZCA9IGlkO1xuXHR0aGlzLlRhZ05hbWUgPSB0YWc7XG5cdHRoaXMuY2hpbGRyZW4gPSB7fTtcblx0dGhpcy5GaW5kQnlDbGFzcyA9IGZ1bmN0aW9uIChjbGFzc25hbWUpIHtcblx0XHRmb3IgKGxldCBjaGlsZCBpbiB0aGlzLmNoaWxkcmVuKSB7XG5cdFx0XHRpZiAodGhpcy5jaGlsZHJlbltjaGlsZF0uQXR0ck1hdGNoKFwiY2xhc3NcIiwgY2xhc3NuYW1lKSkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5jaGlsZHJlbltjaGlsZF07XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHRoaXMuQWRkID0gZnVuY3Rpb24gKHN1YmlkLCB2YWx1ZSwgYXR0cmlidXRlcyxtaW1lKSB7XG5cdFx0YXR0cmlidXRlcyA9IGF0dHJpYnV0ZXMgfHwge307XG5cdFx0YXR0cmlidXRlc1t2YWx1ZS5hdHRyXSA9IHZhbHVlO1xuXHRcdHRoaXMuY2hpbGRyZW5bc3ViaWRdID0gbmV3IE1hbnkodGhpcy5JZCArIFwiX1wiICsgc3ViaWQsIHRoaXMuVGFnTmFtZSwgYXR0cmlidXRlcywgbWltZSk7XG5cdFx0dGhpcy5jaGlsZHJlbltzdWJpZF0uU3VwZXJJZCA9IHRoaXMuSWQ7XG5cdFx0dGhpcy5jaGlsZHJlbltzdWJpZF0uUGFyZW50ID0gdGhpcztcblx0XHRPYmplY3QuZnJlZXplKHRoaXMuY2hpbGRyZW5bc3ViaWRdKTtcblx0fVxuXHR0aGlzLlJlbW92ZSA9IGZ1bmN0aW9uIChzdWJpZCkge1xuXHRcdGRlbGV0ZSB0aGlzLmNoaWxkcmVuW3N1YmlkXTtcblx0fTtcbn1cblxuU2luZ2xlLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFzaWMucHJvdG90eXBlKTtcbk1hbnkucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShCYXNpYy5wcm90b3R5cGUpO1xuT2JqZWN0LmZyZWV6ZShTaW5nbGUpO1xuT2JqZWN0LmZyZWV6ZShNYW55KTtcbiovIiwiaW1wb3J0IHtTaW5nbGUsU3R5bGVUYWd9IGZyb20gJy4vd3JpaXQtdGFncyc7XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uICh0aGF0KSB7XG5cdGxldCBhZGQgPSBmdW5jdGlvbiAoYnV0dG9uKSB7XG5cdFx0bGV0IG5ld0IgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcblx0XHRuZXdCLnNldEF0dHJpYnV0ZShcImRhdGEtd3JpaXQtY29tbWFuZElkXCIsIGJ1dHRvbi5JZCk7XG5cdFx0bmV3Qi5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBidXR0b24uSWNvbkNsYXNzKTtcblx0XHRcblx0XHRpZiggYnV0dG9uLlRvb2xUaXAgIT09IG51bGwpe1xuXHRcdFx0bGV0IHNwYW4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG5cdFx0XHRzcGFuLmlubmVySFRNTCA9IGJ1dHRvbi5Ub29sVGlwO1xuXHRcdFx0bmV3Qi5hcHBlbmRDaGlsZChzcGFuKTtcblx0XHR9XG5cdFx0XG5cdFx0dGhhdC5idXR0b25zW2J1dHRvbi5JZF0gPSBuZXdCO1xuXHRcdHRoYXQudGFnc1tidXR0b24uSWRdID0gYnV0dG9uO1xuXHRcdHRoYXQubWVudS5hcHBlbmQobmV3Qik7XG5cdFx0cmV0dXJuIGJ1dHRvbi5JZDtcblx0fTtcblx0dGhpcy5BZGRCdXR0b24gPSBmdW5jdGlvbiAodGFnKSB7XG5cdFx0aWYgKHRhZyBpbnN0YW5jZW9mIFNpbmdsZSkge1xuXHRcdFx0YWRkKHRhZyk7XG5cdFx0Lyp9IGVsc2UgaWYgKGJ1dHRvbiBpbnN0YW5jZW9mIE11bHRpQ2xhc3MpIHtcblx0XHRcdGZvciAobGV0IHByb3AgaW4gYnV0dG9uLmNoaWxkcmVuKSB7XG5cdFx0XHRcdGFkZChidXR0b24uY2hpbGRyZW5bcHJvcF0pO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoYnV0dG9uIGluc3RhbmNlb2YgTXVsdGlBdHRyKSB7XG5cdFx0XHRmb3IgKGxldCBwcm9wIGluIGJ1dHRvbi5jaGlsZHJlbikge1xuXHRcdFx0XHRhZGQoYnV0dG9uLmNoaWxkcmVuW3Byb3BdKTtcblx0XHRcdH1cblx0XHR9Ki9cblx0XHR9ZWxzZSBpZih0YWcgaW5zdGFuY2VvZiBTdHlsZVRhZyl7XG5cdFx0XHRcblx0XHR9XG5cdFx0Ly9yZXR1cm4gYnV0dG9uO1xuXHR9O1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ0FkZEJ1dHRvbicsIHtcblx0XHR3cml0YWJsZTogZmFsc2UsXG5cdFx0ZW51bWVyYWJsZTogdHJ1ZSxcblx0XHRjb25maWd1cmFibGU6IHRydWVcblx0fSk7XG59IiwiLypnbG9iYWwgZG9jdW1lbnQsd2luZG93LCQsY29uc29sZSxzZXRJbnRlcnZhbCxCYXNpYyxNYW55LE11bHRpQ2xhc3MsV3JpaXRTdHlsZSxyZWdleHAqL1xuaW1wb3J0IE1vZHVsZSBmcm9tICcuL3dyaWl0LW1vZHVsZXMnO1xuaW1wb3J0IHtTaW5nbGUsU3R5bGVUYWcsU3R5bGVBdHRyfSBmcm9tICcuL3dyaWl0LXRhZ3MnO1xuaW1wb3J0IFRvb2xiYXIgZnJvbSAnLi93cmlpdC10b29sYmFyJztcbmltcG9ydCBpVGV4dEFyZWEgZnJvbSAnLi9pVGV4dEFyZWEnO1xuaW1wb3J0IEtleUhhbmRsZXIgZnJvbSAnLi9rZXloYW5kbGVyJztcbmltcG9ydCAqIGFzIG1vZHVsZXMgZnJvbSAnLi9tb2R1bGVzJztcblxudmFyIEdQRUd1aSA9IHtcblx0ZW5naW5lOiB7XG5cdFx0bWljcm86IDEsXG5cdFx0bWluaTogMixcblx0XHRub3JtYWw6IDMsXG5cdFx0ZXh0ZW5kZWQ6IDRcblx0fSxcblx0dmlzdWFsOiB7XG5cdFx0b25zZWxlY3Rpb246IDEsXG5cdFx0YWx3YXlzOiAyLFxuXHRcdGFsdGVybmF0ZTogM1xuXHR9XG59O1xudmFyIEdQRVRhZ3MgPSB7XG5cdGNvbW1hbmQ6IDAsXG5cdHNwYW46IDEsXG5cdGlkOiAyLFxuXHR0YWc6IDMsXG5cdHBhcmFncmFwaDogMTAsXG5cdG11bHRpU3BhbjogMTEsXG5cdG11bHRpQ2xhc3M6IDEyLFxuXHRtdWx0aU5hbWU6IDEzLFxuXHRvbmx5SW5zZXJ0OiAyMSxcblx0bXVsdGlPbmx5SW5zZXJ0OiAzMSxcblx0bGlzdDogNTFcbn07XG4vLzEtMTAgQXBlcnR1cmEgeSBDaWVycmVcbi8vMTEtMjAgQXBlcnR1cmEgeSBDaWVycmUsIE3Dumx0aXBsZXMgVmFsb3Jlc1xuLy8yMS0zMCBBcGVydHVyYVxuLy8zMS00MCBBcGVydHVyYSwgTcO6bHRpcGxlcyBWYWxvcmVzXG4vLzUxLXh4eCBUb2RhcyBsYXMgZGVtw6FzKERlZmluaXIgSW5kZXBlbmRpZW50ZW1lbnRlKVxuZnVuY3Rpb24gTWF0Y2hOVCh0ZXh0LCB0YWcpIHtcblx0bGV0IHggPSB0ZXh0Lm1hdGNoKHRhZyk7XG5cdHJldHVybiB4ID8geC5sZW5ndGggOiAwO1xufVxuZnVuY3Rpb24gZmluZE5UKHR4dCwgdGFnKSB7XG5cdHZhciBzbyA9IHJlZ2V4cChcIltfX1RhZ19fXVwiKTtcblx0dmFyIHggPSB0eHQucmVwbGFjZShyZWdleHAodGFnLCBcImdcIiksIFwiW19fVGFnX19dXCIpO1xuXHR4ID0geC5tYXRjaChzbyk7XG5cdHJldHVybiB4ID8geC5sZW5ndGggOiAwO1xufVxuXG5mdW5jdGlvbiBzdHJfcmVwbGFjZShzZWFyY2gsIHJlcGxhY2UsIHN1YmplY3QpIHtcblx0dmFyIHMgPSBzdWJqZWN0O1xuXHR2YXIgcmEgPSByIGluc3RhbmNlb2YgQXJyYXksXG5cdFx0c2EgPSBzIGluc3RhbmNlb2YgQXJyYXksXG5cdFx0ZiA9IFtdLmNvbmNhdChzZWFyY2gpLFxuXHRcdHIgPSBbXS5jb25jYXQocmVwbGFjZSksXG5cdFx0aSA9IChzID0gW10uY29uY2F0KHMpKS5sZW5ndGgsXG5cdFx0aiA9IDA7XG5cblx0d2hpbGUgKGogPSAwLCBpLS0pIHtcblx0XHRpZiAoc1tpXSkge1xuXHRcdFx0d2hpbGUgKHNbaV0gPSAoc1tpXSArICcnKS5zcGxpdChmW2pdKS5qb2luKHJhID8gcltqXSB8fCBcIlwiIDogclswXSksICsraiBpbiBmKSB7fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gc2EgPyBzIDogc1swXTtcbn1cblxudmFyIHRvdGFsR1BFVCA9IDA7XG52YXIgX2kgPSAnPGxpIGlkPVwiaVwiIG5hbWU9XCJlbVwiIHZhbHVlPVwiM1wiPjwvbGk+JztcbnZhciBfdSA9ICc8bGkgaWQ9XCJ1XCIgdmFsdWU9XCIxXCIgZXh0cmE9XFwnc3R5bGU6dGV4dC1kZWNvcmF0aW9uOnVuZGVybGluZVxcJz48L2xpPic7XG52YXIgX3QgPSAnPGxpIGlkPVwidFwiIHZhbHVlPVwiMVwiIGV4dHJhPVxcJ3N0eWxlOnRleHQtZGVjb3JhdGlvbjpsaW5lLXRocm91Z2hcXCc+PC9saT4nO1xudmFyIF9vID0gJzxsaSBpZD1cIm9cIiB2YWx1ZT1cIjFcIiBleHRyYT1cXCdzdHlsZTp0ZXh0LWRlY29yYXRpb246b3ZlcmxpbmVcXCc+PC9saT4nO1xudmFyIF9zdWIgPSAnPGxpIGlkPVwic3ViXCIgdmFsdWU9XCIyXCI+PC9saT4nO1xudmFyIF9zdXAgPSAnPGxpIGlkPVwic3VwXCIgdmFsdWU9XCIyXCI+PC9saT4nO1xudmFyIF91bCA9ICc8bGkgaWQ9XCJ1bFwiIHZhbHVlPVwiNTFcIj48L2xpPic7XG52YXIgX29sID0gJzxsaSBpZD1cIm9sXCIgdmFsdWU9XCI1MVwiPjwvbGk+JztcbnZhciBfc2l6ZSA9ICc8bGkgaWQ9XCJmb250c2l6ZVwiIHZhbHVlPVwiMTFcIiBleHRyYT1cXCdzdHlsZTpmb250LXNpemVcXCc+PC9saT4nO1xudmFyIF9jb2xvciA9ICc8bGkgaWQ9XCJjb2xvclwiIHZhbHVlPVwiMTFcIiBleHRyYT1cXCdzdHlsZTpjb2xvclxcJyBjbGFzcz1cImNib3RvblwiPjwvbGk+JztcbnZhciBfaGlnaGxpZ2h0ID0gJzxsaSBpZD1cImhpZ2hsaWdodFwiIHZhbHVlPVwiMTFcIiBleHRyYT1cXCdzdHlsZTpiYWNrZ3JvdW5kLWNvbG9yXFwnIGNsYXNzPVwiY2JvdG9uXCIgc0NJPVwiYmFja2dyb3VuZC1jb2xvclwiPjwvbGk+JztcbnZhciBfc2hhZG93ID0gJzxsaSBpZD1cInRleHRzaGFkb3dcIiB2YWx1ZT1cIjExXCIgZXh0cmE9XFwnc3R5bGU6dGV4dC1zaGFkb3c6KC4qPykgMXB4IDFweCAxcHhcXCcgY2xhc3M9XCJjYm90b25cIiBzQ0k9XCJ0ZXh0LXNoYWRvd1wiPjwvbGk+JztcbnZhciBfbCA9ICc8bGkgaWQ9XCJMXCIgZXh0cmE9XCJzdHlsZTp0ZXh0LWFsaWduOmxlZnRcIiB2YWx1ZT1cIjEwXCI+PC9saT4nO1xudmFyIF9jID0gJzxsaSBpZD1cIkNcIiBleHRyYT1cInN0eWxlOnRleHQtYWxpZ246Y2VudGVyXCIgdmFsdWU9XCIxMFwiPjwvbGk+JztcbnZhciBfciA9ICc8bGkgaWQ9XCJSXCIgZXh0cmE9XCJzdHlsZTp0ZXh0LWFsaWduOnJpZ2h0XCIgdmFsdWU9XCIxMFwiPjwvbGk+JztcbnZhciBfaiA9ICc8bGkgaWQ9XCJKXCIgZXh0cmE9XCJzdHlsZTp0ZXh0LWFsaWduOmp1c3RpZnlcIiB2YWx1ZT1cIjEwXCI+PC9saT4nO1xudmFyIF9jaXRlID0gJzxsaSBpZD1cImNpdGVcIiB2YWx1ZT1cIjJcIj48L2xpPic7XG52YXIgX3F1b3RlID0gJzxsaSBpZD1cInF1b3RlXCIgbmFtZT1cInFcIiB2YWx1ZT1cIjNcIj48L2xpPic7XG52YXIgX2UgPSAnPGxpIGlkPVwiYlwiIG5hbWU9XCJzdHJvbmdcIiB2YWx1ZT1cIjNcIj48L2xpPic7XG52YXIgX2Vtb3RpYyA9ICc8bGkgaWQ9XCJlbW90aWNcIiBuYW1lPVwic3BhblwiIHZhbHVlPVwiMzFcIiBleHRyYT1cXCdzcmNcXCc+PC9saT4nO1xudmFyIF9obCA9ICc8bGkgaWQ9XCJoclwiIG5hbWU9XCJoclwiIHZhbHVlPVwiMjFcIj48L2xpPic7XG52YXIgX3VuZm9ybWF0ID0gJzxsaSBpZD1cInVuZm9ybWFydFwiIHZhbHVlPVwiMFwiPjwvbGk+JztcblxudmFyIHRlbXBsYXRlID0gJzxzZWN0aW9uIGNsYXNzPVwid3JpaXQtYm94XCI+PG1lbnU+PC9tZW51PjxkaXYgZGF0YS13cmlpdC1yb2xlPVwidGV4dC1hcmVhXCI+PC9kaXY+PGRpdiBjbGFzcz1cInRhZ2lcIj48L2Rpdj48L3NlY3Rpb24+JztcbmxldCBpbnN0YWxsZWRwbHVnaW5zID0gW107XG5cbmZ1bmN0aW9uIGdldFRhZyhub2RlLCB0YWdzKSB7XG5cdGZvciAobGV0IHByb3AgaW4gdGFncykge1xuXHRcdGxldCB0YWcgPSB0YWdzW3Byb3BdO1xuXHRcdGlmICh0YWcuaXNJbnN0YW5jZShub2RlKSkge1xuXHRcdFx0cmV0dXJuIHRhZztcblx0XHR9XG5cdH1cblx0cmV0dXJuIG51bGw7XG59XG5mdW5jdGlvbiBmaW5kQWxsVGFncyhub2RlLCBjb250YWluZXIsIHRhZ3MpIHtcblx0Zm9yIChsZXQgbm5hbWUgaW4gbm9kZS5jaGlsZHJlbikge1xuXHRcdGxldCBuZXdub2RlID0gbm9kZS5jaGlsZHJlbltubmFtZV07XG5cdFx0aWYgKG5ld25vZGUubm9kZVR5cGUgPT09IDEpIHtcblx0XHRcdGxldCB0YWcgPSBnZXRUYWcobmV3bm9kZSwgdGFncyk7XG5cdFx0XHRpZiAodGFnICE9PSBudWxsKSB7XG5cdFx0XHRcdGNvbnRhaW5lclt0YWcuSWRdID0gdGFnO1xuXHRcdFx0fVxuXHRcdFx0ZmluZEFsbFRhZ3MobmV3bm9kZSwgY29udGFpbmVyLCB0YWdzKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHR9XG59XG5mdW5jdGlvbiBOb2RlQW5hbHlzaXModGFncywgbWFpbmNvbnRhaW5lcikge1xuXHRsZXQgbGVmdCA9IHt9O1xuXHRsZXQgbWlkZGxlID0ge307XG5cdGxldCByaWdodCA9IHt9O1xuXHRsZXQgY29udGFpbiA9IHt9O1xuXHRsZXQgbGVmdE5vZGUgPSB0aGlzLnN0YXJ0Q29udGFpbmVyLnBhcmVudE5vZGU7XG5cdGxldCByaWdodE5vZGUgPSB0aGlzLmVuZENvbnRhaW5lci5wYXJlbnROb2RlO1xuXHRsZXQgY29tbW9uID0gbnVsbDtcblx0aWYgKGxlZnROb2RlID09PSByaWdodE5vZGUpIHtcblx0XHRjb21tb24gPSBsZWZ0Tm9kZTtcblx0XHRsZXQgaW5zaWRlciA9IHRoaXMuY2xvbmVDb250ZW50cygpO1xuXHRcdGZpbmRBbGxUYWdzKGluc2lkZXIsIG1pZGRsZSwgdGFncyk7XG5cdH0gZWxzZSB7XG5cdFx0d2hpbGUgKGxlZnROb2RlICE9PSB0aGlzLmNvbW1vbkFuY2VzdG9yQ29udGFpbmVyKSB7XG5cdFx0XHRsZXQgdGFnID0gZ2V0VGFnKGxlZnROb2RlLCB0YWdzKTtcblx0XHRcdGlmICh0YWcgIT09IG51bGwpIHtcblx0XHRcdFx0bGVmdFt0YWcuSWRdID0gdGFnO1xuXHRcdFx0fVxuXHRcdFx0bGVmdE5vZGUgPSBsZWZ0Tm9kZS5wYXJlbnROb2RlO1xuXHRcdH1cblx0XHR3aGlsZSAocmlnaHROb2RlICE9PSB0aGlzLmNvbW1vbkFuY2VzdG9yQ29udGFpbmVyKSB7XG5cdFx0XHRsZXQgdGFnID0gZ2V0VGFnKHJpZ2h0Tm9kZSwgdGFncyk7XG5cdFx0XHRpZiAodGFnICE9PSBudWxsKSB7XG5cdFx0XHRcdHJpZ2h0W3RhZy5JZF0gPSB0YWc7XG5cdFx0XHR9XG5cdFx0XHRyaWdodE5vZGUgPSByaWdodE5vZGUucGFyZW50Tm9kZTtcblx0XHR9XG5cdFx0Y29tbW9uID0gdGhpcy5jb21tb25BbmNlc3RvckNvbnRhaW5lcjtcblx0fVxuXHR3aGlsZSAoY29tbW9uICE9PSBtYWluY29udGFpbmVyKSB7XG5cdFx0bGV0IHRhZyA9IGdldFRhZyhjb21tb24sIHRhZ3MpO1xuXHRcdGlmICh0YWcgIT09IG51bGwpIHtcblx0XHRcdGNvbnRhaW5bdGFnLklkXSA9IHRhZztcblx0XHR9XG5cdFx0Y29tbW9uID0gY29tbW9uLnBhcmVudE5vZGU7XG5cdH1cblx0bGV0IHBsdWdzID0ge307XG5cdGZvciAobGV0IHByb3AgaW4gdGFncykge1xuXHRcdGxldCB0YWcgPSB0YWdzW3Byb3BdO1xuXHRcdGxldCBidXR0b24gPSBtYWluY29udGFpbmVyLnBhcmVudE5vZGUucXVlcnlTZWxlY3RvckFsbChcIltkYXRhLXdyaWl0LWNvbW1hbmRJZD1cIiArIHRhZy5JZCArIFwiXVwiKVswXTtcblx0XHRsZXQgZ2xvdyA9IGZhbHNlO1xuXHRcdGlmICh0YWcgaW5zdGFuY2VvZiBTaW5nbGUpIHtcblx0XHRcdHBsdWdzW3RhZy5JZF0gPSB7XG5cdFx0XHRcdGlzU29ycm91bmRlZDogY29udGFpblt0YWcuSWRdICE9PSB1bmRlZmluZWQsXG5cdFx0XHRcdGlzQ29udGFpbmVkOiBtaWRkbGVbdGFnLklkXSAhPT0gdW5kZWZpbmVkLFxuXHRcdFx0XHRpc09wZW5lZDogcmlnaHRbdGFnLklkXSAhPT0gdW5kZWZpbmVkLFxuXHRcdFx0XHRpc0Nsb3NlZDogbGVmdFt0YWcuSWRdICE9PSB1bmRlZmluZWQsXG5cdFx0XHRcdGRlZXA6IDBcblx0XHRcdH07XG5cdFx0XHRpZiAocGx1Z3NbdGFnLklkXS5pc1NvcnJvdW5kZWQpIHtcblx0XHRcdFx0YnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuXHRcdFx0XHRnbG93PXRydWU7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRidXR0b24uY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICh0YWcgaW5zdGFuY2VvZiBNYW55KSB7XG5cdFx0XHRwbHVnc1t0YWcuU3VwZXJJZF0gPSB7XG5cdFx0XHRcdGlzU29ycm91bmRlZDogcGx1Z3NbdGFnLlN1cGVySWRdICE9PSBudWxsID8gcGx1Z3NbdGFnLlN1cGVySWRdLmlzU29ycm91bmRlZCB8fCBjb250YWluW3RhZy5JZF0gIT09IG51bGwgOiBjb250YWluW3RhZy5JZF0sXG5cdFx0XHRcdGlzQ29udGFpbmVkOiBwbHVnc1t0YWcuU3VwZXJJZF0gIT09IG51bGwgPyBwbHVnc1t0YWcuU3VwZXJJZF0uaXNDb250YWluZWQgfHwgbWlkZGxlW3RhZy5JZF0gIT09IG51bGwgOiBtaWRkbGVbdGFnLklkXSxcblx0XHRcdFx0aXNPcGVuZWQ6IHBsdWdzW3RhZy5TdXBlcklkXSAhPT0gbnVsbCA/IHBsdWdzW3RhZy5TdXBlcklkXS5pc09wZW5lZCB8fCByaWdodFt0YWcuSWRdICE9PSBudWxsIDogcmlnaHRbdGFnLklkXSAhPT0gbnVsbCxcblx0XHRcdFx0aXNDbG9zZWQ6IHBsdWdzW3RhZy5TdXBlcklkXSAhPT0gbnVsbCA/IHBsdWdzW3RhZy5TdXBlcklkXS5pc0Nsb3NlZCB8fCBsZWZ0W3RhZy5JZF0gIT09IG51bGwgOiBsZWZ0W3RhZy5JZF0gIT09IG51bGwsXG5cdFx0XHRcdGRlZXA6IDBcblx0XHRcdH07XG5cdFx0XHRpZiAoY29udGFpblt0YWcuSWRdICE9PSBudWxsKSB7XG5cdFx0XHRcdGdsb3c9dHJ1ZTtcblx0XHRcdFx0YnV0dG9uLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0YnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRsZXQgZG9vPXRhZy5NaW1lO1xuXHRcdGlmIChnbG93ICYmIGRvbykge1xuXHRcdFx0YnV0dG9uLnN0eWxlW1wiYm94LXNoYWRvd1wiXSA9IFwiaW5zZXQgIzAwZmYwMCAxcHggMXB4IDUwcHhcIjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YnV0dG9uLnN0eWxlW1wiYm94LXNoYWRvd1wiXSA9IFwiXCI7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBwbHVncztcbn1cbmZ1bmN0aW9uIGFkZHRvdGFnaShlKSB7XG5cdCQodGhpcykucGFyZW50KCkuZmluZCgnLnRhZ2knKS5odG1sKCcnKTtcblx0dmFyIHggPSAkKGRvY3VtZW50LmdldFNlbGVjdGlvbigpLmFuY2hvck5vZGUucGFyZW50Tm9kZSk7XG5cdHZhciBpID0gMDtcblx0d2hpbGUgKHguZ2V0KDApICE9PSB0aGlzKSB7XG5cdFx0dmFyIGxpID0gJCgnPHNwYW4+JyArIHguZ2V0KDApLmxvY2FsTmFtZSArICc8L3NwYW4+Jyk7XG5cdFx0JCh0aGlzKS5wYXJlbnQoKS5maW5kKCcudGFnaScpLnByZXBlbmQobGkpO1xuXHRcdHggPSB4LnBhcmVudCgpO1xuXHR9XG59XG5mdW5jdGlvbiBXcmlpdChwYXJlbnQsIGNmZykge1xuXHRsZXQgcHJpdmF0ZURhdGEgPSBuZXcgV2Vha01hcCgpO1xuXHRsZXQgcHJvcHMgPSB7XG5cdFx0ZGF0YWluZGV4OiBbT2JqZWN0LmNyZWF0ZShudWxsKV0sXG5cdFx0ZGF0YTogT2JqZWN0LmNyZWF0ZShudWxsKVxuXHR9O1xuXHRsZXQgaW5kZXhlcyA9IFtPYmplY3QuY3JlYXRlKG51bGwpXTtcblx0dmFyIGNvbXBpbGVkID0gJCh0ZW1wbGF0ZSk7XG5cdHRoaXMudGV4dGFyZWEgPSBjb21waWxlZC5maW5kKFwiW2RhdGEtd3JpaXQtcm9sZT10ZXh0LWFyZWFdXCIpO1xuXHR0aGlzLnRleHRhcmVhLmh0bWwocGFyZW50Lmh0bWwoKSk7XG5cdHBhcmVudC5yZXBsYWNlV2l0aChjb21waWxlZCk7XG5cdHRoaXMubWVudSA9IGNvbXBpbGVkLmZpbmQoJ21lbnU6ZXEoMCknKTtcblx0dGhpcy5jZmcgPSAkLmV4dGVuZCh7fSwgY2ZnLCB7XG5cdFx0TW9kdWxlczogaW5zdGFsbGVkcGx1Z2luc1xuXHR9KTtcblx0dmFyIHRoYXQgPSB0aGlzO1xuXHR2YXIgcHJvdG90eXBlID0gT2JqZWN0LmdldFByb3RvdHlwZU9mKHRoYXQpO1xuXHR0aGlzLmh0bWwgPSB7XG5cdFx0Z2V0IHNlbGVjdGlvbigpIHtcblx0XHRcdHJldHVybiB0aGlzLmdldFNlbGVjdGlvbigwKS5jb29yZDtcblx0XHR9LFxuXHRcdGdldFNlbGVjdGlvbjogZnVuY3Rpb24gKG4pIHtcblx0XHRcdG4gPSBuIHx8IDA7XG5cdFx0XHR2YXIgaHRtbCA9IHRoYXQudGV4dGFyZWEuaHRtbCgpO1xuXHRcdFx0dmFyIGNvb3JkID0gdGhhdC50ZXh0YXJlYS5nZXRTZWxlY3Rpb24obik7XG5cdFx0XHR2YXIgcmFuZ2UgPSBjb29yZC5yYW5nO1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0Z2V0IHN0YXJ0KCkge1xuXHRcdFx0XHRcdHJldHVybiBjb29yZC5zdGFydDtcblx0XHRcdFx0fSxcblx0XHRcdFx0Z2V0IGVuZCgpIHtcblx0XHRcdFx0XHRyZXR1cm4gY29vcmQuZW5kO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRnZXQgcHJlKCkge1xuXHRcdFx0XHRcdHJldHVybiBodG1sLnN1YnN0cmluZygwLCBjb29yZC5zdGFydCk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGdldCBzZWwoKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGh0bWwuc3Vic3RyaW5nKGNvb3JkLnN0YXJ0LCBjb29yZC5lbmQpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRnZXQgcG9zdCgpIHtcblx0XHRcdFx0XHRyZXR1cm4gaHRtbC5zdWJzdHJpbmcoY29vcmQuZW5kLCBodG1sLmxlbnRnaCk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGdldCB0ZXh0KCkge1xuXHRcdFx0XHRcdHJldHVybiBodG1sO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRzZXQgdGV4dCh2KSB7XG5cdFx0XHRcdFx0dGhhdC50ZXh0YXJlYS5odG1sKHYpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRnZXQgdmlzdWFsKCkge1xuXHRcdFx0XHRcdHJldHVybiByYW5nZTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHR9XG5cdH07XG5cdHRoaXMuc2VsZWN0aW9uID0gZnVuY3Rpb24gKHRhZ2lkKSB7XG5cdFx0cmV0dXJuIHRoaXMuTW9kdWxlc1t0YWdpZF0uc2VsZWN0aW9uO1xuXHR9O1xuXHR0aGlzLnRleHRhcmVhLktleUhhbmRsZXIoKTsge1xuXHRcdGxldCBibG9jayA9IGZhbHNlO1xuXHRcdGxldCBpbml0aWFsVmFsdWUgPSB0aGlzLnRleHRhcmVhLmh0bWwoKS50cmltKCk7XG5cdFx0bGV0IHN0b3JlSW5mbyA9IGZ1bmN0aW9uIChmb3JjZSkge1xuXHRcdFx0bGV0IGluZGV4ID0gcHJpdmF0ZURhdGEuZ2V0KGNvbXBpbGVkLmdldCgwKSkgfHwgW107XG5cdFx0XHRpZiAoaW5kZXhlcy5sZW5ndGggPT09IDUxKSB7XG5cblx0XHRcdH1cblx0XHRcdGxldCBwcm9wID0gaW5kZXhbaW5kZXgubGVuZ3RoIC0gMV07XG5cdFx0XHRsZXQgdGV4dHZhbHVlID0gdGhhdC50ZXh0YXJlYS5odG1sKCkudHJpbSgpO1xuXHRcdFx0bGV0IGRhdGEgPSBwcml2YXRlRGF0YS5nZXQocHJvcCk7XG5cblx0XHRcdGlmIChkYXRhID09PSB1bmRlZmluZWQgJiYgdGV4dHZhbHVlICE9PSBpbml0aWFsVmFsdWUpIHtcblx0XHRcdFx0cHJvcCA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cdFx0XHRcdHByaXZhdGVEYXRhLnNldChwcm9wLCBpbml0aWFsVmFsdWUpO1xuXHRcdFx0XHRpbmRleC5wdXNoKHByb3ApO1xuXHRcdFx0XHRwcml2YXRlRGF0YS5zZXQoY29tcGlsZWQuZ2V0KDApLCBpbmRleCk7XG5cdFx0XHRcdHRoYXQuYnV0dG9ucy51bmRvLmF0dHIoJ2Rpc2FibGVkJywgZmFsc2UpO1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH0gZWxzZSBpZiAoXG5cblx0XHRcdFx0KGRhdGEgJiYgTWF0aC5hYnModGV4dHZhbHVlLmxlbmd0aCAtIGRhdGEubGVuZ3RoKSA+IDE1KSB8fCAoZm9yY2UgJiYgdGV4dHZhbHVlICE9PSBkYXRhKVxuXHRcdFx0KSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKFwiU3RvcmVcIiwgdGV4dHZhbHVlKTtcblx0XHRcdFx0cHJvcCA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG5cdFx0XHRcdHByaXZhdGVEYXRhLnNldChwcm9wLCB0ZXh0dmFsdWUpO1xuXHRcdFx0XHRpbmRleC5wdXNoKHByb3ApO1xuXHRcdFx0XHRwcml2YXRlRGF0YS5zZXQoY29tcGlsZWQuZ2V0KDApLCBpbmRleCk7XG5cdFx0XHRcdHRoYXQuYnV0dG9ucy51bmRvLmF0dHIoJ2Rpc2FibGVkJywgZmFsc2UpO1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdHJldHVybiAoZGF0YSAhPT0gdW5kZWZpbmVkKSAmJiAoZGF0YSAmJiBkYXRhICE9PSB0ZXh0dmFsdWUpO1xuXHRcdH07XG5cblx0XHRsZXQgY2xlYXJJbmZvID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0cHJpdmF0ZURhdGEuc2V0KHRoYXQudGV4dGFyZWEuZ2V0KDApLCBbXSk7XG5cdFx0XHR0aGF0LmJ1dHRvbnMucmVkby5hdHRyKCdkaXNhYmxlZCcsIHRydWUpO1xuXHRcdH07XG5cdFx0Y29tcGlsZWQuYmluZCgnc2F2ZWNvbnRlbnQnLCBmdW5jdGlvbiAoZSkge1xuXHRcdFx0d2hpbGUgKGJsb2NrKTtcblx0XHRcdGJsb2NrID0gdHJ1ZTtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGlmIChzdG9yZUluZm8oKSkge1xuXHRcdFx0XHRcdGNsZWFySW5mbygpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRoYXQuYnV0dG9ucy51bmRvLmF0dHIoJ2Rpc2FibGVkJywgdHJ1ZSk7XG5cdFx0XHRcdH1cblx0XHRcdH0gY2F0Y2ggKGV4KSB7XG5cdFx0XHRcdGNvbnNvbGUubG9nKGV4KTtcblx0XHRcdH1cblx0XHRcdGJsb2NrID0gZmFsc2U7XG5cdFx0fSk7XG5cblx0XHRsZXQgY3RybHogPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHR3aGlsZSAoYmxvY2spO1xuXHRcdFx0YmxvY2sgPSB0cnVlO1xuXHRcdFx0bGV0IHN0b3JlZCA9IHN0b3JlSW5mbyh0cnVlKTtcblx0XHRcdGxldCB1bmRvcyA9IHByaXZhdGVEYXRhLmdldChjb21waWxlZC5nZXQoMCkpO1xuXHRcdFx0bGV0IHJlZG9zID0gcHJpdmF0ZURhdGEuZ2V0KHRoYXQudGV4dGFyZWEuZ2V0KDApKSB8fCBbXTtcblxuXHRcdFx0aWYgKHVuZG9zLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0aWYgKHN0b3JlZCkge1xuXHRcdFx0XHRcdHJlZG9zLnB1c2godW5kb3MucG9wKCkpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGxldCBwcm9wID0gcHJpdmF0ZURhdGEuZ2V0KHVuZG9zW3VuZG9zLmxlbmd0aCAtIDFdKTtcblx0XHRcdFx0cHJpdmF0ZURhdGEuc2V0KHRoYXQudGV4dGFyZWEuZ2V0KDApLCByZWRvcyk7XG5cblx0XHRcdFx0dGhhdC50ZXh0YXJlYS5odG1sKHByb3ApO1xuXHRcdFx0XHRwcml2YXRlRGF0YS5zZXQoY29tcGlsZWQuZ2V0KDApLCB1bmRvcyk7XG5cdFx0XHRcdGxldCBzZWwgPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XG5cdFx0XHRcdHNlbC5yZW1vdmVBbGxSYW5nZXMoKTtcblx0XHRcdFx0bGV0IG5vZGUgPSB0aGF0LnRleHRhcmVhLmdldCgwKTtcblx0XHRcdFx0d2hpbGUgKG5vZGUubGFzdENoaWxkKSB7XG5cdFx0XHRcdFx0bm9kZSA9IG5vZGUubGFzdENoaWxkO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRoYXQuaHRtbC5nZXRTZWxlY3Rpb24oMCkudmlzdWFsLnNldFN0YXJ0QmVmb3JlKG5vZGUpO1xuXHRcdFx0XHR0aGF0Lmh0bWwuZ2V0U2VsZWN0aW9uKDApLnZpc3VhbC5zZXRFbmRCZWZvcmUobm9kZSk7XG5cdFx0XHRcdHNlbC5hZGRSYW5nZSh0aGF0Lmh0bWwuZ2V0U2VsZWN0aW9uKDApLnZpc3VhbCk7XG5cblx0XHRcdFx0dGhhdC5idXR0b25zLnJlZG8uYXR0cignZGlzYWJsZWQnLCBmYWxzZSk7XG5cdFx0XHR9XG5cdFx0XHRibG9jayA9IGZhbHNlO1xuXHRcdFx0Ly9cdFx0JCh0aGlzKS50cmlnZ2VyKCdrZXl1cCcsIGUpO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXG5cdFx0fTtcblx0XHR0aGlzLnRleHRhcmVhLmtleXMuYmluZChcIkNNRCtaXCIsIGN0cmx6KTtcblx0XHRwcm90b3R5cGUudW5kbyA9IHtcblx0XHRcdFNldHVwOiBmdW5jdGlvbiAodG9vbGJhcikge1xuXHRcdFx0XHR0aGlzLkNhbGxiYWNrKHRvb2xiYXIuQWRkQnV0dG9uKG5ldyBTaW5nbGUoXCJ1bmRvXCIsIFwiX3VuZG9cIiwge1xuXHRcdFx0XHRcdHRvb2x0aXA6IFwiVW5kb1wiLFxuXHRcdFx0XHRcdGRpc3BsYXljbGFzczogXCJmYSBmYS11bmRvXCJcblx0XHRcdFx0fSkpLCBjdHJseik7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHRwcm90b3R5cGUucmVkbyA9IHtcblx0XHRcdFNldHVwOiBmdW5jdGlvbiAodG9vbGJhcikge1xuXHRcdFx0XHR0aGlzLkNhbGxiYWNrKHRvb2xiYXIuQWRkQnV0dG9uKG5ldyBTaW5nbGUoXCJyZWRvXCIsIFwiX3JlZG9cIiwge1xuXHRcdFx0XHRcdHRvb2x0aXA6IFwiUmVwZWF0XCIsXG5cdFx0XHRcdFx0ZGlzcGxheWNsYXNzOiBcImZhIGZhLXJlcGVhdFwiXG5cdFx0XHRcdH0pKSwgY3RybHopO1xuXHRcdFx0XHR0aGF0LmJ1dHRvbnMucmVkby5zZXRBdHRyaWJ1dGUoJ2Rpc2FibGVkJywgdHJ1ZSk7XG5cdFx0XHR9XG5cdFx0fTtcblx0fVxuXHR0aGlzLnRleHRhcmVhLnRvVGV4dEFyZWEoe1xuXHRcdGNvb3JkOiBmYWxzZSxcblx0XHRkZWJ1ZzogZmFsc2Vcblx0fSk7XG5cblx0dGhpcy5Nb2R1bGVzID0ge307XG5cdHRoaXMuYnV0dG9ucyA9IHt9O1xuXHR0aGlzLnRhZ3MgPSB7fTtcblx0dGhpcy5tZXRhZGF0YSA9IHt9O1xuXHR0aGlzLnRleHRhcmVhLmJpbmQoJ2tleXVwIG1vdXNldXAnLCBhZGR0b3RhZ2kpO1xuXHR0aGlzLnRleHRhcmVhLmJpbmQoJ2tleXVwIG1vdXNldXAnLCBmdW5jdGlvbiAoKSB7XG5cdFx0dGhhdC5Nb2R1bGVzID0gTm9kZUFuYWx5c2lzLmFwcGx5KHRoYXQudGV4dGFyZWEuZ2V0U2VsZWN0aW9uKDApLnJhbmcsIFt0aGF0LnRhZ3MsIHRoYXQudGV4dGFyZWEuZ2V0KDApXSk7XG5cdH0pO1xuXHRzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XG5cdFx0Y29tcGlsZWQudHJpZ2dlcignc2F2ZWNvbnRlbnQnKTtcblx0fSwgMTAwMCk7XG5cdGxldCB0b29sYmFyID0gbmV3IFRvb2xiYXIodGhpcyk7XG5cdE9iamVjdC5mcmVlemUodG9vbGJhcik7XG5cdHRoaXMuY2ZnLk1vZHVsZXMuZm9yRWFjaChmdW5jdGlvbiAocGx1Z2luKSB7XG5cdFx0aWYgKHByb3RvdHlwZVtwbHVnaW5dLlNldHVwICE9PSBudWxsKSB7XG5cdFx0XHRwcm90b3R5cGVbcGx1Z2luXSA9ICQuZXh0ZW5kKG5ldyBNb2R1bGUodGhhdCksIHByb3RvdHlwZVtwbHVnaW5dKTtcblx0XHRcdHByb3RvdHlwZVtwbHVnaW5dLlNldHVwKHRvb2xiYXIpO1xuXHRcdH1cblx0fSk7XG5cdHRoaXMuYnV0dG9uID0gZnVuY3Rpb24gKGlkKSB7XG5cdFx0cmV0dXJuIHRoYXQuYnV0dG9uc1tpZF07XG5cdH07XG59XG5cbmZvcihsZXQgbW9kIGluIG1vZHVsZXMpe1xuXHRpbnN0YWxsZWRwbHVnaW5zLnB1c2gobW9kKTtcblx0V3JpaXQucHJvdG90eXBlW21vZF0gPSBtb2R1bGVzW21vZF07XG59XG4vKldyaWl0LnByb3RvdHlwZS5wYXN0ZUV2ZW50ID0ge1xuXHRTZXR1cDogZnVuY3Rpb24gKCkge1xuXHRcdHZhciB0aGF0ID0gdGhpcztcblx0XHR2YXIgY2xpcGJvYXJkID0gJCgnPHRleHRhcmVhIHN0eWxlPVwiZGlzcGxheTpub25lO1wiPicpO1xuXHRcdGNsaXBib2FyZC5pbnNlcnRBZnRlcigkKHRoaXMudGV4dGFyZWEpKTtcblx0XHQkKHRoaXMudGV4dGFyZWEpLmJpbmQoXCJwYXN0ZVwiLCBmYWxzZSwgZnVuY3Rpb24gKGUpIHtcblx0XHRcdHZhciBwYXN0ZSA9IFwiXCI7XG5cdFx0XHR2YXIgbyA9IGU7XG5cdFx0XHRlID0gZS5vcmlnaW5hbEV2ZW50O1xuXHRcdFx0aWYgKC90ZXh0XFwvaHRtbC8udGVzdChlLmNsaXBib2FyZERhdGEudHlwZXMpKSB7XG5cdFx0XHRcdHBhc3RlID0gZS5jbGlwYm9hcmREYXRhLmdldERhdGEoJ3RleHQvaHRtbCcpO1xuXHRcdFx0XHRwYXN0ZSA9IHBhc3RlLnJlcGxhY2UoXCI8bWV0YSBjaGFyc2V0PSd1dGYtOCc+XCIsIGZ1bmN0aW9uIChzdHIpIHtcblx0XHRcdFx0XHRyZXR1cm4gJyc7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRwYXN0ZSA9IHBhc3RlLnJlcGxhY2UoLzxzcGFuIGNsYXNzPVwiQXBwbGUtY29udmVydGVkLXNwYWNlXCI+LjxcXC9zcGFuPi9nLCBmdW5jdGlvbiAoc3RyKSB7XG5cdFx0XHRcdFx0cmV0dXJuICcgJztcblx0XHRcdFx0fSk7XG5cdFx0XHRcdHBhc3RlID0gcGFzdGUucmVwbGFjZSgvPHNwYW5bXj5dKj4oW148XSopPFxcL3NwYW4+L2csIGZ1bmN0aW9uIChzdHIsIGN0KSB7XG5cdFx0XHRcdFx0cmV0dXJuIGN0O1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0cGFzdGUgPSBwYXN0ZS5yZXBsYWNlKC8gc3R5bGU9XCIuW14+XSpcIi9nLCBmdW5jdGlvbiAoc3RyLCBjdCkge1xuXHRcdFx0XHRcdHJldHVybiAnJztcblx0XHRcdFx0fSk7XG5cdFx0XHRcdGUuY2xpcGJvYXJkRGF0YS5jbGVhckRhdGEoKTtcblx0XHRcdFx0ZS5jbGlwYm9hcmREYXRhLml0ZW1zID0gW107XG5cdFx0XHRcdGNsaXBib2FyZC5odG1sKHBhc3RlKTtcblx0XHRcdFx0cGFzdGUgPSAkKCc8c2VjdGlvbj4nICsgcGFzdGUgKyAnPC9zZWN0aW9uPicpLmdldCgwKTtcblx0XHRcdFx0Ly9cdFx0XHRcdGUuY2xpcGJvYXJkRGF0YS5zZXREYXRhKCd0ZXh0L2h0bWwnLHBhc3RlKTtcblx0XHRcdH0gZWxzZSBpZiAoL3RleHRcXC9wbGFpbi8udGVzdChlLmNsaXBib2FyZERhdGEudHlwZXMpKSB7XG5cdFx0XHRcdHBhc3RlID0gZS5jbGlwYm9hcmREYXRhLmdldERhdGEoJ3RleHQvcGxhaW4nKTtcblx0XHRcdH1cblx0XHRcdHZhciBlbmQgPSBwYXN0ZS5jaGlsZE5vZGVzW3RoYXQubm9kZUFQSS5jaGlsZENvdW50b3JMZW5ndGcocGFzdGUpIC0gMV07XG5cdFx0XHR3aGlsZSAocGFzdGUuY2hpbGROb2Rlcy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdGUudGFyZ2V0LnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKHBhc3RlLmNoaWxkTm9kZXNbMF0sIGUudGFyZ2V0KTtcblx0XHRcdH1cblx0XHRcdHRoYXQuaHRtbC5nZXRTZWxlY3Rpb24oMCkudmlzdWFsLnNldFN0YXJ0KGVuZCwgdGhhdC5ub2RlQVBJLmNoaWxkQ291bnRvckxlbmd0ZyhlbmQpKTtcblx0XHRcdHRoYXQuaHRtbC5nZXRTZWxlY3Rpb24oMCkudmlzdWFsLnNldEVuZChlbmQsIHRoYXQubm9kZUFQSS5jaGlsZENvdW50b3JMZW5ndGcoZW5kKSk7XG5cdFx0XHR0aGF0LnJlc3RvcmUoKTtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9KTtcblx0fSxcbn07XG5XcmlpdC5wcm90b3R5cGUuYm9sZCA9IHtcblx0U2V0dXA6IGZ1bmN0aW9uICh0b29sYmFyKSB7XG5cdFx0bGV0IGJvbGQgPSBuZXcgU2luZ2xlKFwiYm9sZFwiLCBcInN0cm9uZ1wiLCB7XG5cdFx0XHR0b29sdGlwOiBcIkJvbGRcIixcblx0XHRcdGljb25jbGFzczogXCJmYSBmYS1ib2xkXCIsXG5cdFx0XHRzaG9ydGN1dDogXCJDTUQrU0hJRlQrQlwiXG5cdFx0fSk7XG5cdFx0dG9vbGJhci5BZGRCdXR0b24oYm9sZCk7XG5cdFx0dGhpcy5DYWxsYmFjayhib2xkLCB0aGlzLkluc2VydCk7XG5cdH0sXG59O1xuV3JpaXQucHJvdG90eXBlLnN1YmluZGV4ID0ge1xuXHRTZXR1cDogZnVuY3Rpb24gKHRvb2xiYXIpIHtcblx0XHRsZXQgYnQgPSBuZXcgU2luZ2xlKFwic3ViaW5kZXhcIiwgXCJzdWJcIiwge1xuXHRcdFx0dG9vbHRpcDogXCJTdWJJbmRleFwiLFxuXHRcdFx0ZGlzcGxheWNsYXNzOiBcImZhIGZhLXN1YnNjcmlwdFwiXG5cdFx0fSk7XG5cdFx0dG9vbGJhci5BZGRCdXR0b24oYnQpO1xuXHRcdHRoaXMuQ2FsbGJhY2soYnQsIHRoaXMuSW5zZXJ0KTtcblx0fVxufTtcbldyaWl0LnByb3RvdHlwZS5wb3duID0ge1xuXHRTZXR1cDogZnVuY3Rpb24gKHRvb2xiYXIpIHtcblx0XHR0aGlzLkNhbGxiYWNrKHRvb2xiYXIuQWRkQnV0dG9uKG5ldyBTaW5nbGUoXCJwb3duXCIsIFwic3VwXCIsIHtcblx0XHRcdHRvb2x0aXA6IFwiU3VwZXIgSW5kZXhcIixcblx0XHRcdGRpc3BsYXljbGFzczogXCJmYSBmYS1zdXBlcnNjcmlwdFwiXG5cdFx0fSkpLCB0aGlzLkluc2VydCk7XG5cdH1cbn07XG5XcmlpdC5wcm90b3R5cGUuaXRhbGljID0ge1xuXHRTZXR1cDogZnVuY3Rpb24gKHRvb2xiYXIpIHtcblx0XHR0aGlzLkNhbGxiYWNrKHRvb2xiYXIuQWRkQnV0dG9uKG5ldyBTaW5nbGUoXCJpdGFsaWNcIiwgXCJlbVwiLCB7XG5cdFx0XHR0b29sdGlwOiBcIkl0YWxpY1wiLFxuXHRcdFx0ZGlzcGxheWNsYXNzOiBcImZhIGZhLWl0YWxpY1wiXG5cdFx0fSkpLCB0aGlzLkluc2VydCk7XG5cdH1cbn07XG5XcmlpdC5wcm90b3R5cGUudW5kZXJsaW5lID0ge1xuXHRTZXR1cDogZnVuY3Rpb24gKHRvb2xiYXIpIHtcblx0XHR0aGlzLkNhbGxiYWNrKHRvb2xiYXIuQWRkQnV0dG9uKG5ldyBTaW5nbGUoXCJ1bmRlcmxpbmVcIiwgXCJ1XCIsIHtcblx0XHRcdHRvb2x0aXA6IFwiVW5kZXJsaW5lXCIsXG5cdFx0XHRkaXNwbGF5Y2xhc3M6IFwiZmEgZmEtdW5kZXJsaW5lXCIsXG5cdFx0XHRzaG9ydGN1dDogXCJBTFQrU0hJRlQrVVwiXG5cdFx0fSkpLCB0aGlzLkluc2VydCk7XG5cdH1cbn07XG5XcmlpdC5wcm90b3R5cGUuc3RyaWtldGhyb3VnaCA9IHtcblx0U2V0dXA6IGZ1bmN0aW9uICh0b29sYmFyKSB7XG5cdFx0dGhpcy5DYWxsYmFjayh0b29sYmFyLkFkZEJ1dHRvbihuZXcgU2luZ2xlKFwic3RyaWtldGhyb3VnaFwiLCBcImRlbFwiLCB7XG5cdFx0XHR0b29sdGlwOiBcIlN0cmlrZSBUaHJvdWdoXCIsXG5cdFx0XHRkaXNwbGF5Y2xhc3M6IFwiZmEgZmEtc3RyaWtldGhyb3VnaFwiLFxuXHRcdFx0c2hvcnRjdXQ6IFwiQUxUK1NISUZUK1NcIlxuXHRcdH0pKSwgdGhpcy5JbnNlcnQpO1xuXHR9XG59O1xuLypXcmlpdC5wcm90b3R5cGUucGFyYWdyYXBoID0ge1xuXHRTZXR1cDogZnVuY3Rpb24gKHRvb2xiYXIpIHtcblx0XHRsZXQgZm11bHRpID0gbmV3IE11bHRpQ2xhc3MoJ3BhcmFncmFwaCcsIFwicFwiKTtcblx0XHRmbXVsdGkuQWRkKCdsZWZ0JywgJ3RleHQtbGVmdCcsIHtcblx0XHRcdHRvb2x0aXA6IFwiQWxpZ24gTGVmdFwiLFxuXHRcdFx0ZGlzcGxheWNsYXNzOiBcImZhIGZhLWFsaWduLWxlZnRcIixcblx0XHRcdHNob3J0Y3V0OiBcIkNNRCtTSElGVCtMXCJcblx0XHR9KTtcblx0XHRmbXVsdGkuQWRkKCdjZW50ZXInLCAndGV4dC1jZW50ZXInLCB7XG5cdFx0XHR0b29sdGlwOiBcIkFsaWduIENlbnRlclwiLFxuXHRcdFx0ZGlzcGxheWNsYXNzOiBcImZhIGZhLWFsaWduLWNlbnRlclwiLFxuXHRcdFx0c2hvcnRjdXQ6IFwiQ01EK1NISUZUK0NcIlxuXHRcdH0pO1xuXHRcdGZtdWx0aS5BZGQoJ3JpZ2h0JywgJ3RleHQtcmlnaHQnLCB7XG5cdFx0XHR0b29sdGlwOiBcIkFsaWduIFJpZ2h0XCIsXG5cdFx0XHRkaXNwbGF5Y2xhc3M6IFwiZmEgZmEtYWxpZ24tcmlnaHRcIixcblx0XHRcdHNob3J0Y3V0OiBcIkNNRCtTSElGVCtSXCJcblx0XHR9KTtcblx0XHRmbXVsdGkuQWRkKCdqdXN0aWZ5JywgJ3RleHQtanVzdGlmeScsIHtcblx0XHRcdHRvb2x0aXA6IFwiSnVzdGlmeVwiLFxuXHRcdFx0ZGlzcGxheWNsYXNzOiBcImZhIGZhLWFsaWduLWp1c3RpZnlcIixcblx0XHRcdHNob3J0Y3V0OiBcIkNNRCtTSElGVCtKXCJcblx0XHR9KTtcblx0XHR0b29sYmFyLkFkZEJ1dHRvbihmbXVsdGkpO1xuXHRcdHRoaXMuQ2FsbGJhY2soZm11bHRpLCB0aGlzLkluc2VydCk7XG5cdH1cbn07KiAvXG5XcmlpdC5wcm90b3R5cGUuZm9yZWNvbG9yID0ge1xuXHRTZXR1cDogZnVuY3Rpb24gKHRvb2xiYXIpIHtcblx0XHRsZXQgdGFnID0gbmV3IFN0eWxlVGFnKCdmb3JlY29sb3InKTtcblx0XHRsZXQgcHJvcCA9IHRhZy5uZXdQcm9wZXJ0eShcImNvbG9yXCIpO1xuXHRcdHRhZy5BZGQocHJvcC5LZXlWYWx1ZSgnI0ZGMDAwMCcsJ3JlZCcpICk7XG5cdFx0XG5cdFx0bGV0IGZtdWx0aSA9IG5ldyBTdHlsZUF0dHIoJ2ZvcmVjb2xvcicsIFwic3BhblwiLCBjKTtcblx0XHRmbXVsdGkuQWRkKCdyZWQnLCBjLmFwcGx5KCcjMDBGRjAwJyksIHtcblx0XHRcdGRpc3BsYXljbGFzczogXCJmYSBmYS1mb250XCJcblx0XHR9LHRydWUpO1xuXHRcdHRvb2xiYXIuQWRkQnV0dG9uKGZtdWx0aSk7XG5cdFx0dGhpcy5DYWxsYmFjayhmbXVsdGksIHRoaXMuSW5zZXJ0KTtcblx0fVxufTtcbiovXG4kLmZuLndyaWl0ID0gZnVuY3Rpb24gKGNmZykge1xuXHQkKHRoaXMpLmVhY2goZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiBuZXcgV3JpaXQoJCh0aGlzKSwgY2ZnKTtcblx0fSk7XG59OyJdfQ==
