(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*global document,$,Many,MultiAttr*/
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
			} else if (!(this.Tag.Parent instanceof _tags.ClassTag)) {
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
			} else if (tag instanceof _tags.ClassTag) {} else if (tag instanceof _tags.StyleTag) {
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

},{"./tags":15}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _tags = require('./tags');

var _default = (function () {
	_createClass(_default, [{
		key: 'add',
		value: function add(button) {
			var newB = document.createElement('button');
			newB.setAttribute("data-wriit-commandId", button.Id);
			newB.setAttribute("class", button.IconClass);

			if (button.ToolTip !== null) {
				var span = document.createElement('span');
				span.innerHTML = button.ToolTip;
				newB.appendChild(span);
			}

			this.Editor.buttons[button.Id] = newB;
			this.Editor.tags[button.Id] = button;
			this.Editor.menu.append(newB);
			return button.Id;
		}
	}]);

	function _default(editor) {
		_classCallCheck(this, _default);

		this.Editor = editor;
	}

	_createClass(_default, [{
		key: 'AddButton',
		value: function AddButton(tag) {
			if (tag instanceof _tags.Single) {
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
			} else if (tag instanceof _tags.StyleTag) {}
			//return button;
		}
	}]);

	return _default;
})();

exports['default'] = _default;
module.exports = exports['default'];

},{"./tags":15}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{"../tags":15}],6:[function(require,module,exports){
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
		toolbar.AddButton(tag);
		this.Callback(tag, this.Insert);
	}
};
module.exports = exports['default'];

},{"../tags":15}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequire(obj) { return obj && obj.__esModule ? obj['default'] : obj; }

var _forecolor = require('./forecolor');

exports.forecolor = _interopRequire(_forecolor);

var _bold = require('./bold');

exports.bold = _interopRequire(_bold);

},{"./bold":5,"./forecolor":6}],8:[function(require,module,exports){
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
			return new this.gen(this.property, value, label);
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

},{}],10:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _default = function _default(attr, value, tooltip) {
	_classCallCheck(this, _default);

	this.attr = attr;
	this.value = value;
	this.tooltip = tooltip;
};

exports["default"] = _default;
module.exports = exports["default"];

},{}],11:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _default = (function () {
	function _default(id, tag) {
		_classCallCheck(this, _default);

		this.Id = id;
		this.TagName = tag;
		this.children = {};
	}

	_createClass(_default, [{
		key: "FindByClass",
		value: function FindByClass(classname) {
			for (var child in this.children) {
				if (this.children[child].AttrMatch("class", classname)) {
					return this.children[child];
				}
			}
		}
	}, {
		key: "Add",
		value: function Add(subid, classname, attributes) {
			attributes = attributes || {};
			attributes["class"] = classname;
			this.children[subid] = new Many(this.Id + "_" + subid, this.TagName, attributes, "class");
			this.children[subid].SuperId = this.Id;
			this.children[subid].Parent = this;
			Object.freeze(this.children[subid]);
		}
	}, {
		key: "Remove",
		value: function Remove(clasname) {
			delete this.children[subid];
		}
	}]);

	return _default;
})();

exports["default"] = _default;
module.exports = exports["default"];

},{}],12:[function(require,module,exports){
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

},{"./Base":9}],13:[function(require,module,exports){
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

},{"./BaseAttribute":10}],14:[function(require,module,exports){
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

var _StyleAttr = require('./StyleAttr');

var _StyleAttr2 = _interopRequireDefault(_StyleAttr);

var StyleTag = (function (_Base) {
	_inherits(StyleTag, _Base);

	function StyleTag(id) {
		_classCallCheck(this, StyleTag);

		_get(Object.getPrototypeOf(StyleTag.prototype), 'constructor', this).call(this, id, 'span', {}, 'background-color');
		this.children = {};
	}

	_createClass(StyleTag, [{
		key: 'newProperty',
		value: function newProperty(property) {
			return new _AttributeGenerator2['default'](_StyleAttr2['default'], property);
		}
	}, {
		key: 'Add',
		value: function Add(attribute) {
			this.children[attribute.attr] = attribute;
		}
	}]);

	return StyleTag;
})(_Base3['default']);

exports['default'] = StyleTag;
module.exports = exports['default'];

},{"./AttributeGenerator":8,"./Base":9,"./StyleAttr":13}],15:[function(require,module,exports){
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

var _AttributeGenerator = require('./AttributeGenerator');

exports.AttributeGenerator = _interopRequire(_AttributeGenerator);

var _ClassTag = require('./ClassTag');

exports.ClassTag = _interopRequire(_ClassTag);

},{"./AttributeGenerator":8,"./ClassTag":11,"./Single":12,"./StyleAttr":13,"./StyleTag":14}],16:[function(require,module,exports){
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
 */

	_createClass(AttrGenerator, [{
		key: "KeyValue",
		value: function KeyValue(value, label) {
			return new this.gen(this.property, value);
		}
	}]);

	return AttrGenerator;
})();

},{}],17:[function(require,module,exports){
/*global document,window,$,console,setInterval,Basic,Many,WriitStyle,regexp*/
'use strict';

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _Module = require('./Module');

var _Module2 = _interopRequireDefault(_Module);

var _tags = require('./tags');

var _Toolbar = require('./Toolbar');

var _Toolbar2 = _interopRequireDefault(_Toolbar);

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
	var toolbar = new _Toolbar2['default'](this);
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

},{"./Module":1,"./Toolbar":2,"./iTextArea":3,"./keyhandler":4,"./modules":7,"./tags":15}]},{},[1,2,3,4,16,17,5,6,7,8,9,10,11,12,13,14,15])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvZ2VyYXJkMnAvZGV2ZWxvcG1lbnQvYmFja2VuZC93cmlpdC9zcmMvTW9kdWxlLmpzIiwiL1VzZXJzL2dlcmFyZDJwL2RldmVsb3BtZW50L2JhY2tlbmQvd3JpaXQvc3JjL1Rvb2xiYXIuanMiLCIvVXNlcnMvZ2VyYXJkMnAvZGV2ZWxvcG1lbnQvYmFja2VuZC93cmlpdC9zcmMvaVRleHRBcmVhLmpzIiwiL1VzZXJzL2dlcmFyZDJwL2RldmVsb3BtZW50L2JhY2tlbmQvd3JpaXQvc3JjL2tleWhhbmRsZXIuanMiLCIvVXNlcnMvZ2VyYXJkMnAvZGV2ZWxvcG1lbnQvYmFja2VuZC93cmlpdC9zcmMvbW9kdWxlcy9ib2xkLmpzIiwiL1VzZXJzL2dlcmFyZDJwL2RldmVsb3BtZW50L2JhY2tlbmQvd3JpaXQvc3JjL21vZHVsZXMvZm9yZWNvbG9yLmpzIiwiL1VzZXJzL2dlcmFyZDJwL2RldmVsb3BtZW50L2JhY2tlbmQvd3JpaXQvc3JjL21vZHVsZXMvaW5kZXguanMiLCIvVXNlcnMvZ2VyYXJkMnAvZGV2ZWxvcG1lbnQvYmFja2VuZC93cmlpdC9zcmMvdGFncy9BdHRyaWJ1dGVHZW5lcmF0b3IuanMiLCIvVXNlcnMvZ2VyYXJkMnAvZGV2ZWxvcG1lbnQvYmFja2VuZC93cmlpdC9zcmMvdGFncy9CYXNlLmpzIiwiL1VzZXJzL2dlcmFyZDJwL2RldmVsb3BtZW50L2JhY2tlbmQvd3JpaXQvc3JjL3RhZ3MvQmFzZUF0dHJpYnV0ZS5qcyIsIi9Vc2Vycy9nZXJhcmQycC9kZXZlbG9wbWVudC9iYWNrZW5kL3dyaWl0L3NyYy90YWdzL0NsYXNzVGFnLmpzIiwiL1VzZXJzL2dlcmFyZDJwL2RldmVsb3BtZW50L2JhY2tlbmQvd3JpaXQvc3JjL3RhZ3MvU2luZ2xlLmpzIiwiL1VzZXJzL2dlcmFyZDJwL2RldmVsb3BtZW50L2JhY2tlbmQvd3JpaXQvc3JjL3RhZ3MvU3R5bGVBdHRyLmpzIiwiL1VzZXJzL2dlcmFyZDJwL2RldmVsb3BtZW50L2JhY2tlbmQvd3JpaXQvc3JjL3RhZ3MvU3R5bGVUYWcuanMiLCIvVXNlcnMvZ2VyYXJkMnAvZGV2ZWxvcG1lbnQvYmFja2VuZC93cmlpdC9zcmMvdGFncy9pbmRleC5qcyIsIi9Vc2Vycy9nZXJhcmQycC9kZXZlbG9wbWVudC9iYWNrZW5kL3dyaWl0L3NyYy93cmlpdC10YWdzLmpzIiwiL1VzZXJzL2dlcmFyZDJwL2RldmVsb3BtZW50L2JhY2tlbmQvd3JpaXQvc3JjL3dyaWl0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7b0JDQzJDLFFBQVE7O0FBRW5ELFNBQVMsaUJBQWlCLENBQUMsSUFBSSxFQUFFO0FBQ2hDLEtBQUksTUFBTSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUM7QUFDN0IsUUFBTyxJQUFJLENBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7QUFDbEMsUUFBTSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0VBQzlDO0NBQ0Q7OztBQUVXLG1CQUFDLE1BQU0sRUFBRTs7O0FBQ25CLE1BQUksQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDO0FBQ3JCLE1BQUksQ0FBQyxHQUFHLEdBQUcsRUFBRSxDQUFDO0FBQ2QsTUFBSSxDQUFDLFlBQVksR0FBRyxTQUFTLENBQUM7QUFDOUIsTUFBSSxDQUFDLFdBQVcsR0FBRyxTQUFTLENBQUM7QUFDN0IsTUFBSSxDQUFDLFFBQVEsR0FBRyxTQUFTLENBQUM7QUFDMUIsTUFBSSxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUM7RUFDdkI7Ozs7U0FPSSxlQUFDLFFBQVEsRUFBRTtBQUNmLE9BQUksU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7QUFDL0IsT0FBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztBQUN6QixPQUFJLElB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c291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKmdsb2JhbCBkb2N1bWVudCwkLE1hbnksTXVsdGlBdHRyKi9cbmltcG9ydCB7IFNpbmdsZSwgU3R5bGVUYWcsIENsYXNzVGFnIH0gZnJvbSAnLi90YWdzJztcblxuZnVuY3Rpb24gbWFrZUNoaWxkU2libGluZ3Mobm9kZSkge1xuXHR2YXIgcGFyZW50ID0gbm9kZS5wYXJlbnROb2RlO1xuXHR3aGlsZSAobm9kZS5jaGlsZE5vZGVzLmxlbmd0aCA+IDApIHtcblx0XHRwYXJlbnQuaW5zZXJ0QmVmb3JlKG5vZGUuY2hpbGROb2Rlc1swXSwgbm9kZSk7XG5cdH1cbn1cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIHtcblx0Y29uc3RydWN0b3IoZWRpdG9yKSB7XG5cdFx0dGhpcy5FZGl0b3IgPSBlZGl0b3I7XG5cdFx0dGhpcy5UYWcgPSB7fTtcblx0XHR0aGlzLkJlZm9yZUZvcm1hdCA9IHVuZGVmaW5lZDtcblx0XHR0aGlzLkFmdGVyRm9ybWF0ID0gdW5kZWZpbmVkO1xuXHRcdHRoaXMuVGVhckRvd24gPSB1bmRlZmluZWQ7XG5cdFx0dGhpcy5TZXR1cCA9IHVuZGVmaW5lZDtcblx0fVxuXHRnZXQgU2VsZWN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLlRhZy5TdXBlcklkICE9PSB1bmRlZmluZWQgPyB0aGlzLkVkaXRvci5Nb2R1bGVzW3RoaXMuVGFnLlN1cGVySWRdIDogdGhpcy5FZGl0b3IuTW9kdWxlc1t0aGlzLlRhZy5JZF07XG5cdH1cblx0Z2V0IFZpc3VhbCgpIHtcblx0XHRyZXR1cm4gdGhpcy5FZGl0b3IuaHRtbC5nZXRTZWxlY3Rpb24oMCkudmlzdWFsO1xuXHR9XG5cdElNYW55KHRleHRhcmVhKSB7XG5cdFx0bGV0IHNlbGVjdGlvbiA9IHRoaXMuU2VsZWN0aW9uO1xuXHRcdGxldCB2aXN1YWwgPSB0aGlzLlZpc3VhbDtcblx0XHRsZXQgbm9kZSA9IHZpc3VhbC5jb21tb25BbmNlc3RvckNvbnRhaW5lcjtcblx0XHRpZiAobm9kZS5ub2RlVHlwZSAhPT0gMSkge1xuXHRcdFx0bm9kZSA9IG5vZGUucGFyZW50Tm9kZTtcblx0XHR9XG5cdFx0aWYgKHNlbGVjdGlvbi5pc1NvcnJvdW5kZWQpIHtcblx0XHRcdGZvciAobGV0IHQgaW4gdGhpcy5UYWcuUGFyZW50LmNoaWxkcmVuKSB7XG5cdFx0XHRcdGxldCB0YWcgPSB0aGlzLlRhZy5QYXJlbnQuY2hpbGRyZW5bdF07XG5cdFx0XHRcdHRoaXMuRWRpdG9yLmJ1dHRvbih0YWcuSWQpLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuXHRcdFx0fVxuXHRcdFx0d2hpbGUgKG5vZGUudGFnTmFtZS50b0xvd2VyQ2FzZSgpICE9PSB0aGlzLlRhZy5UYWdOYW1lLnRvTG93ZXJDYXNlKCkpIHtcblx0XHRcdFx0bm9kZSA9IG5vZGUucGFyZW50Tm9kZTtcblx0XHRcdH1cblx0XHRcdGlmICh0aGlzLlRhZy5pc0NvbXBhdGlibGUobm9kZSkpIHtcblx0XHRcdFx0Zm9yIChsZXQgYXR0ciBpbiB0aGlzLlRhZy5BdHRyKSB7XG5cdFx0XHRcdFx0dGhpcy5UYWcuVXBkYXRlQXR0cmlidXRlcyhub2RlKTtcblx0XHRcdFx0XHQvL25vZGUuc2V0QXR0cmlidXRlKGF0dHIsIHRoaXMuVGFnLkF0dHJbYXR0cl0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRoaXMuRWRpdG9yLmJ1dHRvbih0aGlzLlRhZy5JZCkuY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICghKHRoaXMuVGFnLlBhcmVudCBpbnN0YW5jZW9mIENsYXNzVGFnKSkge1xuXHRcdFx0bGV0IG5ld2VsID0gdGhpcy5UYWcubmV3KCk7XG5cdFx0XHRuZXdlbC5hcHBlbmRDaGlsZCh2aXN1YWwuZXh0cmFjdENvbnRlbnRzKCkpO1xuXHRcdFx0dmlzdWFsLmluc2VydE5vZGUobmV3ZWwpO1xuXHRcdFx0dGV4dGFyZWEubm9ybWFsaXplKCk7XG5cdFx0fVxuXHRcdGRvY3VtZW50LmdldFNlbGVjdGlvbigpLnJlbW92ZUFsbFJhbmdlcygpO1xuXHRcdGRvY3VtZW50LmdldFNlbGVjdGlvbigpLmFkZFJhbmdlKHZpc3VhbCk7XG5cdH1cblx0SVNpbmdsZSh0ZXh0YXJlYSkge1xuXHRcdGxldCBzZWxlY3Rpb24gPSB0aGlzLlNlbGVjdGlvbjtcblx0XHRsZXQgdmlzdWFsID0gdGhpcy5WaXN1YWw7XG5cdFx0aWYgKHZpc3VhbC5jb2xsYXBzZWQgJiYgc2VsZWN0aW9uLmlzU29ycm91bmRlZCkge1xuXHRcdFx0bGV0IG9sZG5vZGUgPSB2aXN1YWwuc3RhcnRDb250YWluZXIucGFyZW50Tm9kZTtcblx0XHRcdHdoaWxlICghdGhpcy5UYWcuaXNJbnN0YW5jZShvbGRub2RlKSkge1xuXHRcdFx0XHRvbGRub2RlID0gb2xkbm9kZS5wYXJlbnROb2RlO1xuXHRcdFx0fVxuXHRcdFx0bWFrZUNoaWxkU2libGluZ3Mob2xkbm9kZSk7XG5cdFx0XHRvbGRub2RlLnJlbW92ZSgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRsZXQgbmV3ZWwgPSB0aGlzLlRhZy5uZXcoKTtcblx0XHRcdG5ld2VsLmFwcGVuZENoaWxkKHZpc3VhbC5leHRyYWN0Q29udGVudHMoKSk7XG5cdFx0XHR2aXN1YWwuaW5zZXJ0Tm9kZShuZXdlbCk7XG5cdFx0XHRpZiAodGhpcy5UYWcuaXNJbnN0YW5jZShuZXdlbC5uZXh0U2libGluZykpIHtcblx0XHRcdFx0bGV0IHNpYmxpbmcgPSBuZXdlbC5uZXh0U2libGluZztcblx0XHRcdFx0QXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbChzaWJsaW5nLmNoaWxkTm9kZXMsIGZ1bmN0aW9uIChpbm5lcmNoaWxkKSB7XG5cdFx0XHRcdFx0bmV3ZWwuYXBwZW5kQ2hpbGQoaW5uZXJjaGlsZCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRzaWJsaW5nLnJlbW92ZSgpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHRoaXMuVGFnLmlzSW5zdGFuY2UobmV3ZWwucHJldmlvdXNTaWJsaW5nKSkge1xuXHRcdFx0XHRsZXQgc2libGluZyA9IG5ld2VsLnByZXZpb3VzU2libGluZztcblx0XHRcdFx0QXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbChzaWJsaW5nLmNoaWxkTm9kZXMsIGZ1bmN0aW9uIChpbm5lcmNoaWxkKSB7XG5cdFx0XHRcdFx0bmV3ZWwuaW5zZXJ0QmVmb3JlKGlubmVyY2hpbGQsIG5ld2VsLmZpcnN0Q2hpbGQpO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0c2libGluZy5yZW1vdmUoKTtcblx0XHRcdH1cblx0XHRcdGlmIChzZWxlY3Rpb24uaXNDb250YWluZWQgKyBzZWxlY3Rpb24uaXNPcGVuZWQgKyBzZWxlY3Rpb24uaXNDbG9zZWQpIHtcblx0XHRcdFx0bGV0IGNsZWFubm9kZSA9IHZpc3VhbC5leHRyYWN0Q29udGVudHMoKS5maXJzdENoaWxkO1xuXHRcdFx0XHRsZXQgaW5uZXIgPSBjbGVhbm5vZGUucXVlcnlTZWxlY3RvckFsbCh0aGlzLlRhZy5UYWdOYW1lKTtcblx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBpbm5lci5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdG1ha2VDaGlsZFNpYmxpbmdzKGlubmVyW2ldKTtcblx0XHRcdFx0XHRpbm5lcltpXS5yZW1vdmUoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHR2aXN1YWwuaW5zZXJ0Tm9kZShuZXdlbCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHRleHRhcmVhLnBhcmVudE5vZGUucXVlcnlTZWxlY3RvckFsbChcIltkYXRhLXdyaWl0LWNvbW1hbmRJZD1cIiArIHRoaXMuVGFnLklkICsgXCJdXCIpWzBdLmNsYXNzTGlzdC50b2dnbGUoJ2FjdGl2ZScpO1xuXHRcdHRleHRhcmVhLm5vcm1hbGl6ZSgpO1xuXHRcdGRvY3VtZW50LmdldFNlbGVjdGlvbigpLnJlbW92ZUFsbFJhbmdlcygpO1xuXHRcdGRvY3VtZW50LmdldFNlbGVjdGlvbigpLmFkZFJhbmdlKHZpc3VhbCk7XG5cdH1cblx0SW5zZXJ0KGUsIHRleHRhcmVhKSB7XG5cdFx0aWYgKHRoaXMuVGFnIGluc3RhbmNlb2YgU2luZ2xlKSB7XG5cdFx0XHR0aGlzLklTaW5nbGUuYXBwbHkodGhpcywgW3RleHRhcmVhXSk7XG5cdFx0fSBlbHNlIGlmICh0aGlzLlRhZyBpbnN0YW5jZW9mIE1hbnkpIHtcblx0XHRcdHRoaXMuSU1hbnkuYXBwbHkodGhpcywgW3RleHRhcmVhXSk7XG5cdFx0fVxuXHR9XG5cdENhbGxiYWNrKHRhZywgZm4pIHtcblx0XHRsZXQgYXBwbHkgPSBmdW5jdGlvbiAodGFnKSB7XG5cdFx0XHRsZXQgYnV0dG9uID0gdGhpcy5FZGl0b3IuYnV0dG9uc1t0YWcuSWRdO1xuXHRcdFx0bGV0IG1vZCA9IHRoaXM7XG5cdFx0XHRidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoZSwgcm91dGVkZXZlbnQpIHtcblx0XHRcdFx0bW9kLlRhZyA9IHRhZztcblx0XHRcdFx0dGhpcy5ldmVudCA9IHJvdXRlZGV2ZW50IHx8IGU7XG5cdFx0XHRcdGlmICh0aGlzLkJlZm9yZUZvcm1hdCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0bW9kLkJlZm9yZUZvcm1hdC5hcHBseShtb2QsIFtyb3V0ZWRldmVudCB8fCBlXSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0bGV0IHJlcyA9IGZuLmFwcGx5KG1vZCwgW3JvdXRlZGV2ZW50IHx8IGUsIG1vZC5FZGl0b3IudGV4dGFyZWEuZ2V0KDApXSk7XG5cdFx0XHRcdGlmICh0aGlzLkFmdGVyRm9ybWF0ICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHR0aGlzLkFmdGVyRm9ybWF0LmFwcGx5KG1vZCwgW3JvdXRlZGV2ZW50IHx8IGVdKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gcmVzO1xuXHRcdFx0fSk7XG5cdFx0XHRpZiAoISF0YWcuU2hvcnRjdXQpIHtcblx0XHRcdFx0dGhpcy5FZGl0b3IudGV4dGFyZWEua2V5cy5iaW5kKHRhZy5TaG9ydGN1dCwgZnVuY3Rpb24gKGUpIHtcblx0XHRcdFx0XHQkKGJ1dHRvbikudHJpZ2dlcignY2xpY2snLCBlKTtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0aWYgKHRhZyBpbnN0YW5jZW9mIFNpbmdsZSkge1xuXHRcdFx0YXBwbHkuYXBwbHkodGhpcywgW3RhZ10pO1xuXHRcdH0gZWxzZSBpZiAodGFnIGluc3RhbmNlb2YgQ2xhc3NUYWcpIHtcblx0XHR9IGVsc2UgaWYgKHRhZyBpbnN0YW5jZW9mIFN0eWxlVGFnKSB7XG5cdFx0XHRmb3IgKGxldCBpIGluIHRhZy5jaGlsZHJlbikge1xuXHRcdFx0XHRhcHBseS5hcHBseSh0aGlzLCBbdGFnLmNoaWxkcmVuW2ldXSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59IiwiaW1wb3J0IHsgU2luZ2xlLCBTdHlsZVRhZyB9IGZyb20gJy4vdGFncyc7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIHtcblx0YWRkIChidXR0b24pIHtcblx0XHRsZXQgbmV3QiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuXHRcdG5ld0Iuc2V0QXR0cmlidXRlKFwiZGF0YS13cmlpdC1jb21tYW5kSWRcIiwgYnV0dG9uLklkKTtcblx0XHRuZXdCLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIGJ1dHRvbi5JY29uQ2xhc3MpO1xuXG5cdFx0aWYgKGJ1dHRvbi5Ub29sVGlwICE9PSBudWxsKSB7XG5cdFx0XHRsZXQgc3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcblx0XHRcdHNwYW4uaW5uZXJIVE1MID0gYnV0dG9uLlRvb2xUaXA7XG5cdFx0XHRuZXdCLmFwcGVuZENoaWxkKHNwYW4pO1xuXHRcdH1cblxuXHRcdHRoaXMuRWRpdG9yLmJ1dHRvbnNbYnV0dG9uLklkXSA9IG5ld0I7XG5cdFx0dGhpcy5FZGl0b3IudGFnc1tidXR0b24uSWRdID0gYnV0dG9uO1xuXHRcdHRoaXMuRWRpdG9yLm1lbnUuYXBwZW5kKG5ld0IpO1xuXHRcdHJldHVybiBidXR0b24uSWQ7XG5cdH1cblx0Y29uc3RydWN0b3IoZWRpdG9yKSB7XG5cdFx0dGhpcy5FZGl0b3IgPSBlZGl0b3I7XG5cdH1cblx0QWRkQnV0dG9uKHRhZykge1xuXHRcdGlmICh0YWcgaW5zdGFuY2VvZiBTaW5nbGUpIHtcblx0XHRcdGFkZCh0YWcpO1xuXHRcdFx0Lyp9IGVsc2UgaWYgKGJ1dHRvbiBpbnN0YW5jZW9mIE11bHRpQ2xhc3MpIHtcblx0XHRcdFx0Zm9yIChsZXQgcHJvcCBpbiBidXR0b24uY2hpbGRyZW4pIHtcblx0XHRcdFx0XHRhZGQoYnV0dG9uLmNoaWxkcmVuW3Byb3BdKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmIChidXR0b24gaW5zdGFuY2VvZiBNdWx0aUF0dHIpIHtcblx0XHRcdFx0Zm9yIChsZXQgcHJvcCBpbiBidXR0b24uY2hpbGRyZW4pIHtcblx0XHRcdFx0XHRhZGQoYnV0dG9uLmNoaWxkcmVuW3Byb3BdKTtcblx0XHRcdFx0fVxuXHRcdFx0fSovXG5cdFx0fSBlbHNlIGlmICh0YWcgaW5zdGFuY2VvZiBTdHlsZVRhZykge1xuXG5cdFx0fVxuXHRcdC8vcmV0dXJuIGJ1dHRvbjtcblx0fVxufSIsIi8qZ2xvYmFsICQsalF1ZXJ5Ki9cbmZ1bmN0aW9uIHRhZ2xlbmd0aChub2RlLCBmdWxsKSB7XG5cdFwidXNlIHN0cmljdFwiO1xuXHRsZXQgb3RleHQgPSBub2RlLndob2xlVGV4dCAhPT0gdW5kZWZpbmVkID8gbm9kZS53aG9sZVRleHQgOiBub2RlLm91dGVySFRNTDtcblx0bGV0IGl0ZXh0ID0gbm9kZS5pbm5lckhUTUwgIT09IHVuZGVmaW5lZCA/IG5vZGUuaW5uZXJIVE1MIDogbm9kZS5pbm5lclRleHQ7XG5cdGxldCBsID0gb3RleHQuaW5kZXhPZihpdGV4dCk7XG5cdGlmIChvdGV4dC5pbmRleE9mKGl0ZXh0KSAhPT0gb3RleHQubGFzdEluZGV4T2YoaXRleHQpKSB7XG5cdFx0bCA9IG90ZXh0LmluZGV4T2YoaXRleHQsIGl0ZXh0Lmxlbmd0aCk7XG5cdH1cblx0cmV0dXJuIGZ1bGwgPyBvdGV4dC5sZW5ndGggOiAobCA9PT0gLTEgPyBvdGV4dC5sZW5ndGggOiBsKTtcbn1cblxuZnVuY3Rpb24gZGVkZWVwKHBhcmVudCwgY29tbW9uLCBub2RlLCBvZmZzZXQpIHtcblx0XCJ1c2Ugc3RyaWN0XCI7XG5cdGxldCB0ZXh0ID0gbm9kZS53aG9sZVRleHQgIT09IHVuZGVmaW5lZCA/IG5vZGUud2hvbGVUZXh0IDogbm9kZS5vdXRlckhUTUw7XG5cdGxldCBlbmQgPSAtdGV4dC5zdWJzdHJpbmcob2Zmc2V0LCB0ZXh0Lmxlbmd0aCkubGVuZ3RoO1xuXHRkbyB7XG5cdFx0bGV0IHByZXZub2RlID0gbm9kZS5wcmV2aW91c1NpYmxpbmc7XG5cdFx0bGV0IGFsbCA9IGZhbHNlO1xuXHRcdGRvIHtcblx0XHRcdGVuZCArPSB0YWdsZW5ndGgobm9kZSwgYWxsKTtcblx0XHRcdHByZXZub2RlID0gbm9kZS5wcmV2aW91c1NpYmxpbmc7XG5cdFx0XHRhbGwgPSBwcmV2bm9kZSA/IHByZXZub2RlLm5vZGVUeXBlID09IDEgOiBmYWxzZTtcblx0XHRcdGlmIChwcmV2bm9kZSkge1xuXHRcdFx0XHRub2RlID0gcHJldm5vZGU7XG5cdFx0XHR9XG5cdFx0fSB3aGlsZSAocHJldm5vZGUgIT09IG51bGwpO1xuXHRcdGlmIChub2RlLnBhcmVudE5vZGUgIT0gcGFyZW50KSB7XG5cdFx0XHRub2RlID0gbm9kZS5wYXJlbnROb2RlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRlbmQgLT0gdGFnbGVuZ3RoKG5vZGUpO1xuXHRcdH1cblx0fSB3aGlsZSAobm9kZS5wYXJlbnROb2RlICE9IHBhcmVudCAmJiBub2RlICE9IHBhcmVudCk7XG5cdGVuZCArPSB0YWdsZW5ndGgobm9kZSk7XG5cdG5vZGUgPSBub2RlLnByZXZpb3VzU2libGluZztcblx0d2hpbGUgKG5vZGUpIHtcblx0XHRsZXQgb3RleHQgPSBub2RlLndob2xlVGV4dCAhPT0gdW5kZWZpbmVkID8gbm9kZS53aG9sZVRleHQgOiBub2RlLm91dGVySFRNTDtcblx0XHRlbmQgKz0gb3RleHQubGVuZ3RoO1xuXHRcdG5vZGUgPSBub2RlLnByZXZpb3VzU2libGluZztcblx0fVxuXHRyZXR1cm4gZW5kO1xufVxuXG5mdW5jdGlvbiB0ZXh0YXJlYShwYXJlbnQsIG9wdHMpIHtcblx0XCJ1c2Ugc3RyaWN0XCI7XG5cdHZhciBjYXJlYSA9ICQoJzxkaXYgY2xhc3M9XCJpdGV4dGFyZWEtY29yZHNcIi8+Jyk7XG5cdGlmIChvcHRzLmNvb3JkKSB7XG5cdFx0Y2FyZWEuaW5zZXJ0QWZ0ZXIocGFyZW50KTtcblx0fVxuXHQkKHBhcmVudCkuYmluZCgna2V5dXAgbW91c2V1cCcsIGZ1bmN0aW9uIChldikge1xuXHRcdGxldCBpbmkgPSB3aW5kb3cucGVyZm9ybWFuY2Uubm93KCk7XG5cdFx0dmFyIHJhbmdlcyA9IFtdO1xuXHRcdHZhciBzZWxlY3Rpb24gPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBzZWxlY3Rpb24ucmFuZ2VDb3VudDsgaSsrKSB7XG5cdFx0XHRsZXQgcmFuZ2UgPSBzZWxlY3Rpb24uZ2V0UmFuZ2VBdChpKTtcblx0XHRcdHJhbmdlcy5wdXNoKHtcblx0XHRcdFx0c3RhcnQ6IGRlZGVlcChwYXJlbnQsIHJhbmdlLmNvbW1vbkFuY2VzdG9yQ29udGFpbmVyLCByYW5nZS5zdGFydENvbnRhaW5lciwgcmFuZ2Uuc3RhcnRPZmZzZXQpLFxuXHRcdFx0XHRlbmQ6IGRlZGVlcChwYXJlbnQsIHJhbmdlLmNvbW1vbkFuY2VzdG9yQ29udGFpbmVyLCByYW5nZS5lbmRDb250YWluZXIsIHJhbmdlLmVuZE9mZnNldCksXG5cdFx0XHRcdHJhbmc6IHJhbmdlXG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0JChwYXJlbnQpLmRhdGEoJ3JhbmcnLCByYW5nZXMpO1xuXHRcdGxldCBlbmQgPSB3aW5kb3cucGVyZm9ybWFuY2Uubm93KCk7XG5cdFx0aWYgKG9wdHMucGVyZm9ybWFjZSkge1xuXHRcdFx0Y29uc29sZS5sb2coXCJpVGV4dEFyZWEgYW5hbHlzaXM6XCIsIGVuZCAtIGluaSwgJ21zJyk7XG5cdFx0fVxuXHRcdGlmIChvcHRzLmNvb3JkKSB7XG5cdFx0XHRjYXJlYS5odG1sKHJhbmdlc1swXS5zdGFydCArIFwiLFwiICsgcmFuZ2VzWzBdLmVuZCk7XG5cdFx0fVxuXHRcdGlmIChvcHRzLmRlYnVnKSB7XG5cdFx0XHRjYXJlYS5hcHBlbmQoJzx0ZXh0YXJlYSBzdHlsZT1cIndpZHRoOjYwMHB4O2Rpc3BsYXk6YmxvY2s7XCI+JyArIHBhcmVudC5pbm5lckhUTUwuc3Vic3RyaW5nKDAsIHJhbmdlc1swXS5zdGFydCkgKyAnPC90ZXh0YXJlYT4nKTtcblx0XHRcdGNhcmVhLmFwcGVuZCgnPHRleHRhcmVhIHN0eWxlPVwid2lkdGg6NjAwcHg7ZGlzcGxheTpibG9jaztcIj4nICsgcGFyZW50LmlubmVySFRNTC5zdWJzdHJpbmcocmFuZ2VzWzBdLnN0YXJ0LCByYW5nZXNbMF0uZW5kKSArICc8L3RleHRhcmVhPicpO1xuXHRcdFx0Y2FyZWEuYXBwZW5kKCc8dGV4dGFyZWEgc3R5bGU9XCJ3aWR0aDo2MDBweDtkaXNwbGF5OmJsb2NrO1wiPicgKyBwYXJlbnQuaW5uZXJIVE1MLnN1YnN0cmluZyhyYW5nZXNbMF0uZW5kLCAkKHBhcmVudCkuaHRtbCgpLmxlbmd0aCkgKyAnPC90ZXh0YXJlYT4nKTtcblx0XHR9XG5cdH0pO1xufVxuZXhwb3J0IGRlZmF1bHQgKGZ1bmN0aW9uICgkKSB7XG5cdCQuZm4udG9UZXh0QXJlYSA9IGZ1bmN0aW9uIChjZmcpIHtcblx0XHRjZmcgPSAkLmV4dGVuZCh7fSwge1xuXHRcdFx0Y29vcmQ6IGZhbHNlLFxuXHRcdFx0cGVyZm9ybWFjZTogZmFsc2UsXG5cdFx0XHRkZWJ1ZzogZmFsc2Vcblx0XHR9LCBjZmcpO1xuXHRcdCQodGhpcykuYXR0cignY29udGVudGVkaXRhYmxlJywgdHJ1ZSk7XG5cdFx0JCh0aGlzKS5lYWNoKGZ1bmN0aW9uICgpIHtcblx0XHRcdG5ldyB0ZXh0YXJlYSh0aGlzLCBjZmcpO1xuXHRcdFx0cmV0dXJuICQodGhpcyk7XG5cdFx0fSk7XG5cdH07XG5cdCQuZm4uZ2V0U2VsZWN0aW9uID0gZnVuY3Rpb24gKG4pIHtcblx0XHRpZiAoJCh0aGlzKS5kYXRhKCdyYW5nJykpIHtcblx0XHRcdHJldHVybiAkKHRoaXMpLmRhdGEoJ3JhbmcnKVtuXTtcblx0XHR9XG5cdH07XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSgkLmZuLCBcInNlbGVjdGlvblwiLCB7XG5cdFx0Z2V0OiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gJCh0aGlzKS5kYXRhKCdyYW5nJylbMF07XG5cdFx0fVxuXHR9KTtcbn0pKGpRdWVyeSk7IiwibGV0IGtleXMgPSB7XG5cdFwiOFwiOiBcIkNBUlJZXCIsXG5cdFwiMTNcIjogXCJFTlRFUlwiLFxuXHRcIjE2XCI6IFwiU0hJRlRcIixcblx0XCIxN1wiOiBcIkNUUkxcIixcblx0XCIxOFwiOiBcIkFMVFwiLFxuXHRcIjI3XCI6IFwiRVNDXCIsXG5cdFwiMzdcIjogXCJMRUZUXCIsXG5cdFwiMzhcIjogXCJVUFwiLFxuXHRcIjM5XCI6IFwiUklHVEhcIixcblx0XCI0MFwiOiBcIkRPV05cIixcblx0XCI5MVwiOiBcIkNNRFwiXG59O1xuZm9yIChsZXQgaSA9IDExMjsgaSA8ICgxMTIgKyAxMik7IGkrKykge1xuXHRrZXlzW2kudG9TdHJpbmcoKV0gPSBcIkZcIiArIChpIC0gMTExKTtcbn1cbmxldCByb3V0ZWtleSA9IHtcblx0XCJDVFJMXCI6IFwiQ01EXCIsXG5cdFwiQ01EXCI6IFwiQ1RSTFwiXG59O1xubGV0IEtleUhhbmRsZXIgPSBmdW5jdGlvbiAoZWwsIHNldHRpbmdzKSB7XG5cdGVsLmRhdGEoJ2V2ZW50cycsIHt9KTtcblx0ZWwuYmluZChcImtleWRvd25cIiwgZnVuY3Rpb24gKGUsIHJvdXRlZGV2ZW50KSB7XG5cdFx0ZSA9IHJvdXRlZGV2ZW50IHx8IGU7XG5cdFx0bGV0IGN1cnJrZXlzID0gZWwuZGF0YSgna2V5cycpIHx8IHt9O1xuXHRcdGxldCBjdXJya2V5ID0ga2V5c1tlLndoaWNoLnRvU3RyaW5nKCldIHx8IFN0cmluZy5mcm9tQ2hhckNvZGUoZS53aGljaCkgfHwgZS53aGljaCB8fCBmYWxzZTtcblx0XHRjdXJya2V5c1tjdXJya2V5XSA9IGN1cnJrZXk7XG5cdFx0ZWwuZGF0YSgna2V5cycsIGN1cnJrZXlzKTtcblx0XHRsZXQgdHJpZ2dlciA9IFtdO1xuXHRcdGZvciAobGV0IGkgaW4gY3VycmtleXMpIHtcblx0XHRcdHRyaWdnZXIucHVzaChjdXJya2V5c1tpXSk7XG5cdFx0fVxuXHRcdHRyaWdnZXIgPSB0cmlnZ2VyLmpvaW4oJysnKTtcblx0XHR0cmlnZ2VyID0gZWwuZGF0YSgnZXZlbnRzJylbdHJpZ2dlcl07XG5cdFx0aWYgKCEhdHJpZ2dlcikge1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0aWYgKCF0cmlnZ2VyKGUpKSB7XG5cdFx0XHRcdGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG5cdFx0XHRcdGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0fSkuYmluZChcImtleXVwXCIsIGZ1bmN0aW9uIChlLCByb3V0ZWRldmVudCkge1xuXHRcdGlmICghZS53aGljaCkge1xuXHRcdFx0ZWwuZGF0YSgna2V5cycsIHt9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZSA9IHJvdXRlZGV2ZW50IHx8IGU7XG5cdFx0XHRsZXQgY3VycmtleXMgPSBlbC5kYXRhKCdrZXlzJykgfHwgW107XG5cdFx0XHRsZXQgY3VycmtleSA9IGtleXNbZS53aGljaC50b1N0cmluZygpXSB8fCBTdHJpbmcuZnJvbUNoYXJDb2RlKGUud2hpY2gpIHx8IGUud2hpY2ggfHwgZmFsc2U7XG5cdFx0XHRkZWxldGUgY3VycmtleXNbY3VycmtleV07XG5cdFx0XHRlbC5kYXRhKCdrZXlzJywgY3VycmtleXMpO1xuXHRcdFx0c3dpdGNoKGN1cnJrZXkpe1xuXHRcdFx0XHRjYXNlIFwiQ1RSTFwiOmNhc2UgXCJDTURcIjpcblx0XHRcdFx0XHRlbC5kYXRhKCdrZXlzJywgW10pO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXG5cdFx0fVxuXHR9KS5iaW5kKCdibHVyJywgZnVuY3Rpb24gKGUpIHtcblx0XHRlbC5kYXRhKCdrZXlzJywge30pO1xuXHR9KTtcblx0cmV0dXJuIGVsO1xufTtcbmV4cG9ydCBkZWZhdWx0IChmdW5jdGlvbiAoJCkge1xuXHQkLmZuLktleUhhbmRsZXIgPSBmdW5jdGlvbiAoc2V0dGluZ3MpIHtcblx0XHRsZXQgY29uZmlnID0ge1xuXHRcdFx0RVNDOiBmYWxzZSxcblx0XHRcdEVOVEVSOiBmYWxzZVxuXHRcdH07XG5cdFx0Y29uZmlnID0gJC5leHRlbmQoe30sIGNvbmZpZywgc2V0dGluZ3MpO1xuXHRcdCQodGhpcykuZWFjaChmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gbmV3IEtleUhhbmRsZXIoJCh0aGlzKSwgc2V0dGluZ3MpO1xuXHRcdH0pO1xuXHR9O1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoJC5mbiwgXCJrZXlwcmVzc2VkXCIsIHtcblx0XHRnZXQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiAkKHRoaXMpLmRhdGEoJ2tleXMnKTtcblx0XHR9XG5cdH0pO1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoJC5mbiwgXCJrZXlzXCIsIHtcblx0XHRnZXQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcdGxldCB0aGF0ID0gdGhpcztcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGJpbmQ6IGZ1bmN0aW9uIChrZXlzZXF1ZW5jZSwgZm4pIHtcblx0XHRcdFx0XHRrZXlzZXF1ZW5jZSA9IGtleXNlcXVlbmNlLnRvVXBwZXJDYXNlKCk7XG5cdFx0XHRcdFx0dGhhdC5kYXRhKCdldmVudHMnKVtrZXlzZXF1ZW5jZV0gPSBmbjtcblx0XHRcdFx0XHR2YXIgY21kcyA9IGtleXNlcXVlbmNlLnNwbGl0KCcrJyk7XG5cdFx0XHRcdFx0Zm9yIChsZXQgaSBpbiBjbWRzKSB7XG5cdFx0XHRcdFx0XHRpZiAoISFyb3V0ZWtleVtjbWRzW2ldXSkge1xuXHRcdFx0XHRcdFx0XHRjbWRzW2ldID0gcm91dGVrZXlbY21kc1tpXV07XG5cdFx0XHRcdFx0XHRcdHRoYXQuZGF0YSgnZXZlbnRzJylbY21kcy5qb2luKCcrJyldID0gZm47XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdH1cblx0fSk7XG59KShqUXVlcnkpOyIsImltcG9ydCB7U2luZ2xlfSBmcm9tICcuLi90YWdzJztcbmV4cG9ydCBkZWZhdWx0IHtcblx0U2V0dXA6IGZ1bmN0aW9uICh0b29sYmFyKSB7XG5cdFx0bGV0IGJvbGQgPSBuZXcgU2luZ2xlKFwiYm9sZFwiLCBcInN0cm9uZ1wiLCB7XG5cdFx0XHR0b29sdGlwOiBcIkJvbGRcIixcblx0XHRcdGljb25jbGFzczogXCJmYSBmYS1ib2xkXCIsXG5cdFx0XHRzaG9ydGN1dDogXCJDTUQrU0hJRlQrQlwiXG5cdFx0fSk7XG5cdFx0dG9vbGJhci5BZGRCdXR0b24oYm9sZCk7XG5cdFx0dGhpcy5DYWxsYmFjayhib2xkLCB0aGlzLkluc2VydCk7XG5cdH1cbn07IiwiaW1wb3J0IHtTdHlsZVRhZyxTdHlsZUF0dHJ9IGZyb20gJy4uL3RhZ3MnO1xuXG5leHBvcnQgZGVmYXVsdCB7XG5cdFNldHVwOiBmdW5jdGlvbiAodG9vbGJhcikge1xuXHRcdGxldCB0YWcgPSBuZXcgU3R5bGVUYWcoJ2ZvcmVjb2xvcicpO1xuXHRcdGxldCBwcm9wID0gdGFnLm5ld1Byb3BlcnR5KFwiY29sb3JcIik7XG5cdFx0dGFnLkFkZChwcm9wLktleVZhbHVlKCcjRkYwMDAwJywgJ3JlZCcpKTtcblx0XHR0b29sYmFyLkFkZEJ1dHRvbih0YWcpO1xuXHRcdHRoaXMuQ2FsbGJhY2sodGFnLCB0aGlzLkluc2VydCk7XG5cdH1cbn07IiwiZXhwb3J0IHtkZWZhdWx0IGFzIGZvcmVjb2xvcn0gZnJvbSAnLi9mb3JlY29sb3InO1xuZXhwb3J0IHtkZWZhdWx0IGFzIGJvbGR9IGZyb20gJy4vYm9sZCc7IiwiZXhwb3J0IGRlZmF1bHQgY2xhc3N7XG5cdGNvbnN0cnVjdG9yKGdlbiwgcHJvcGVydHkpIHtcblx0XHR0aGlzLmdlbiA9IGdlbjtcblx0XHR0aGlzLnByb3BlcnR5ID0gcHJvcGVydHk7XG5cdH1cblx0S2V5VmFsdWUodmFsdWUsIGxhYmVsKSB7XG5cdFx0cmV0dXJuIG5ldyB0aGlzLmdlbih0aGlzLnByb3BlcnR5LCB2YWx1ZSxsYWJlbCk7XG5cdH1cbn0iLCJleHBvcnQgZGVmYXVsdCBjbGFzcyB7XG5cdGNvbnN0cnVjdG9yKGlkLCB0YWcsIGF0dHJpYnV0ZXMsIGhpZ2hsaWdodCkge1xuXHRcdHRoaXMuSWQgPSBpZDtcblx0XHR0aGlzLmhpZ2hsaWdodCA9IHRydWU7XG5cdFx0dGhpcy5UYWdOYW1lID0gdGFnO1xuXHRcdHRoaXMuQXR0cmlidXRlcyA9IFtdO1xuXHRcdHRoaXMuU2hvcnRjdXQgPSBhdHRyaWJ1dGVzLnNob3J0Y3V0IHx8IG51bGw7XG5cdFx0dGhpcy5Ub29sVGlwID0gYXR0cmlidXRlcy50b29sdGlwIHx8IG51bGw7XG5cdFx0dGhpcy5JY29uQ2xhc3MgPSBhdHRyaWJ1dGVzLmljb25jbGFzcyB8fCBudWxsO1xuXHR9XG5cdGlzQ29tcGF0aWJsZShodG1sbm9kZSkge1xuXHRcdGlmIChodG1sbm9kZS5ub2RlVHlwZSAhPT0gMSB8fCBodG1sbm9kZS50YWdOYW1lLnRvTG93ZXJDYXNlKCkgIT09IHRoaXMuVGFnTmFtZS50b0xvd2VyQ2FzZSgpKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cdGlzSW5zdGFuY2UoaHRtbG5vZGUpIHtcblx0XHRpZiAoIXRoaXMuaXNDb21wYXRpYmxlKGh0bWxub2RlKSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRmb3IgKGxldCBhdHRyIGluIHRoaXMuQXR0cikge1xuXHRcdFx0bGV0IGF0cmlidXRlID0gdGhpcy5BdHRyW2F0dHJdO1xuXHRcdFx0aWYgKGF0cmlidXRlIGluc3RhbmNlb2YgU3R5bGVBdHRyKSB7XG5cdFx0XHRcdGlmIChodG1sbm9kZS5zdHlsZVthdHJpYnV0ZS5hdHRyXSA9PT0gXCJcIikge1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmIChhdHJpYnV0ZSBpbnN0YW5jZW9mIEdlbmVyYWxBdHRyKSB7XG5cdFx0XHRcdGlmIChodG1sbm9kZS5hdHRyaWJ1dGVzW2F0dHJdLnZhbHVlICE9PSB0aGlzLkF0dHJbYXR0cl0pIHJldHVybiBmYWxzZTtcblx0XHRcdH0gZWxzZSBpZiAoYXRyaWJ1dGUgaW5zdGFuY2VvZiBDbGFzc0F0dHIpIHtcblx0XHRcdFx0aWYgKGh0bWxub2RlLmNsYXNzTGlzdCkge1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXHRuZXcoKSB7XG5cdFx0bGV0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0aGlzLlRhZ05hbWUpO1xuXHRcdC8vdGhpcy5VcGRhdGVBdHRyaWJ1dGVzKGVsKTtcblx0XHRyZXR1cm4gZWw7XG5cdH1cbn0iLCJleHBvcnQgZGVmYXVsdCBjbGFzc3tcblx0Y29uc3RydWN0b3IoYXR0ciwgdmFsdWUsdG9vbHRpcCl7XG5cdFx0dGhpcy5hdHRyID0gYXR0cjtcblx0XHR0aGlzLnZhbHVlID0gdmFsdWU7XG5cdFx0dGhpcy50b29sdGlwID10b29sdGlwO1xuXHR9XG59IiwiZXhwb3J0IGRlZmF1bHQgY2xhc3Mge1xuXHRjb25zdHJ1Y3RvcihpZCwgdGFnKSB7XG5cdFx0dGhpcy5JZCA9IGlkO1xuXHRcdHRoaXMuVGFnTmFtZSA9IHRhZztcblx0XHR0aGlzLmNoaWxkcmVuID0ge307XG5cdH1cblx0RmluZEJ5Q2xhc3MoY2xhc3NuYW1lKSB7XG5cdFx0Zm9yIChsZXQgY2hpbGQgaW4gdGhpcy5jaGlsZHJlbikge1xuXHRcdFx0aWYgKHRoaXMuY2hpbGRyZW5bY2hpbGRdLkF0dHJNYXRjaChcImNsYXNzXCIsIGNsYXNzbmFtZSkpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuY2hpbGRyZW5bY2hpbGRdO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRBZGQoc3ViaWQsIGNsYXNzbmFtZSwgYXR0cmlidXRlcykge1xuXHRcdGF0dHJpYnV0ZXMgPSBhdHRyaWJ1dGVzIHx8IHt9O1xuXHRcdGF0dHJpYnV0ZXMuY2xhc3MgPSBjbGFzc25hbWU7XG5cdFx0dGhpcy5jaGlsZHJlbltzdWJpZF0gPSBuZXcgTWFueSh0aGlzLklkICsgXCJfXCIgKyBzdWJpZCwgdGhpcy5UYWdOYW1lLCBhdHRyaWJ1dGVzLCBcImNsYXNzXCIpO1xuXHRcdHRoaXMuY2hpbGRyZW5bc3ViaWRdLlN1cGVySWQgPSB0aGlzLklkO1xuXHRcdHRoaXMuY2hpbGRyZW5bc3ViaWRdLlBhcmVudCA9IHRoaXM7XG5cdFx0T2JqZWN0LmZyZWV6ZSh0aGlzLmNoaWxkcmVuW3N1YmlkXSk7XG5cdH1cblx0UmVtb3ZlKGNsYXNuYW1lKSB7XG5cdFx0ZGVsZXRlIHRoaXMuY2hpbGRyZW5bc3ViaWRdO1xuXHR9XG59IiwiaW1wb3J0IEJhc2UgZnJvbSAnLi9CYXNlJztcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFNpbmdsZSBleHRlbmRzIEJhc2Uge1xuXHRjb25zdHJ1Y3RvcihpZCwgdGFnLCBvcHRpb25zKSB7XG5cdFx0c3VwZXIoaWQsIHRhZywgb3B0aW9ucywgZmFsc2UpO1xuXHR9XG59IiwiaW1wb3J0IEJhc2VBdHRyaWJ1dGUgZnJvbSAnLi9CYXNlQXR0cmlidXRlJztcblxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTdHlsZUF0dHIgZXh0ZW5kcyBCYXNlQXR0cmlidXRlIHtcblx0Y29uc3RydWN0b3IoYXR0cix2YWx1ZSl7XG5cdFx0c3VwZXIoYXR0cix2YWx1ZSk7XG5cdH1cbn0iLCJpbXBvcnQgQmFzZSBmcm9tICcuL0Jhc2UnO1xuaW1wb3J0IEF0dHJpYnV0ZUdlbmVyYXRvciBmcm9tICcuL0F0dHJpYnV0ZUdlbmVyYXRvcic7XG5pbXBvcnQgU3R5bGVBdHRyIGZyb20gJy4vU3R5bGVBdHRyJztcblx0XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFN0eWxlVGFnIGV4dGVuZHMgQmFzZSB7XG5cdGNvbnN0cnVjdG9yKGlkKSB7XG5cdFx0c3VwZXIoaWQsJ3NwYW4nLHt9LCdiYWNrZ3JvdW5kLWNvbG9yJyk7XG5cdFx0dGhpcy5jaGlsZHJlbj17fTtcblx0fVxuXHRuZXdQcm9wZXJ0eShwcm9wZXJ0eSkge1xuXHRcdHJldHVybiBuZXcgQXR0cmlidXRlR2VuZXJhdG9yKFN0eWxlQXR0ciwgcHJvcGVydHkpO1xuXHR9XG5cdEFkZChhdHRyaWJ1dGUpIHtcblx0XHR0aGlzLmNoaWxkcmVuW2F0dHJpYnV0ZS5hdHRyXSA9IGF0dHJpYnV0ZTtcblx0fVxufSIsImV4cG9ydCB7ZGVmYXVsdCBhcyBTaW5nbGV9IGZyb20gJy4vU2luZ2xlJztcbmV4cG9ydCB7ZGVmYXVsdCBhcyBTdHlsZVRhZ30gZnJvbSAnLi9TdHlsZVRhZyc7XG5leHBvcnQge2RlZmF1bHQgYXMgU3R5bGVBdHRyfSBmcm9tICcuL1N0eWxlQXR0cic7XG5leHBvcnQge2RlZmF1bHQgYXMgQXR0cmlidXRlR2VuZXJhdG9yfSBmcm9tICcuL0F0dHJpYnV0ZUdlbmVyYXRvcic7XG5leHBvcnQge2RlZmF1bHQgYXMgQ2xhc3NUYWd9IGZyb20gJy4vQ2xhc3NUYWcnOyIsIi8qZ2xvYmFsIGRvY3VtZW50Ki9cbi8qIGpzaGludCAtVzA5NyAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbmZ1bmN0aW9uIEJhc2VBdHRyKGF0dHIsIHZhbHVlKSB7XG5cdHRoaXMuYXR0ciA9IGF0dHI7XG5cdHRoaXMudmFsdWUgPSB2YWx1ZTtcbn1cblxuZXhwb3J0IGNsYXNzIENsYXNzQXR0ciB7XG5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFN0eWxlQXR0cihhdHRyLCB2YWx1ZSkge1xuXHRCYXNlQXR0ci5jYWxsKHRoaXMsIGF0dHIsIHZhbHVlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEdlbmVyYWxBdHRyKGF0dHIsIHZhbHVlKSB7XG5cdEJhc2VBdHRyLmNhbGwodGhpcywgYXR0ciwgdmFsdWUpO1xufVxuU3R5bGVBdHRyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFzZUF0dHIucHJvdG90eXBlKTtcbkdlbmVyYWxBdHRyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFzZUF0dHIucHJvdG90eXBlKTtcblxuZnVuY3Rpb24gQmFzZVRhZyhpZCwgdGFnLCBhdHRyaWJ1dGVzLCBibG93KSB7XG5cdHRoaXMuTWltZSA9IGJsb3cgPT09IHRydWU7XG5cdGF0dHJpYnV0ZXMgPSBhdHRyaWJ1dGVzIHx8IHt9O1xuXHR0aGlzLklkID0gaWQ7XG5cdHRoaXMuU3VwZXJJZCA9IG51bGw7XG5cdHRoaXMuUGFyZW50ID0gbnVsbDtcblx0dGhpcy5UYWdOYW1lID0gdGFnO1xuXHR0aGlzLlNob3J0Y3V0ID0gYXR0cmlidXRlcy5zaG9ydGN1dCB8fCBudWxsO1xuXHRkZWxldGUgYXR0cmlidXRlcy5zaG9ydGN1dDtcblx0dGhpcy5Ub29sVGlwID0gYXR0cmlidXRlcy50b29sdGlwIHx8IG51bGw7XG5cdGRlbGV0ZSBhdHRyaWJ1dGVzLnRvb2x0aXA7XG5cdHRoaXMuRGlzcGxheUNsYXNzID0gYXR0cmlidXRlcy5kaXNwbGF5Y2xhc3MgfHwgbnVsbDtcblx0ZGVsZXRlIGF0dHJpYnV0ZXMuZGlzcGxheWNsYXNzO1xuXHR0aGlzLkF0dHIgPSBhdHRyaWJ1dGVzO1xuXG59XG5CYXNlVGFnLnByb3RvdHlwZS5BdHRyTWF0Y2ggPSBmdW5jdGlvbiAoYXR0ciwgdmFsdWUpIHtcblx0cmV0dXJuIHRoaXMuQXR0clthdHRyXSA9PT0gdmFsdWU7XG59O1xuXG5CYXNlVGFnLnByb3RvdHlwZS5pc0luc3RhbmNlID0gZnVuY3Rpb24gKGh0bWxub2RlKSB7XG5cdGlmIChodG1sbm9kZS5ub2RlVHlwZSAhPT0gMSkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXHRpZiAoaHRtbG5vZGUudGFnTmFtZS50b0xvd2VyQ2FzZSgpICE9PSB0aGlzLlRhZ05hbWUudG9Mb3dlckNhc2UoKSkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXHRmb3IgKGxldCBhdHRyIGluIHRoaXMuQXR0cikge1xuXHRcdGxldCBhdHJpYnV0ZSA9IHRoaXMuQXR0clthdHRyXTtcblx0XHRpZiAoYXRyaWJ1dGUgaW5zdGFuY2VvZiBTdHlsZUF0dHIpIHtcblx0XHRcdGlmIChodG1sbm9kZS5zdHlsZVthdHJpYnV0ZS5hdHRyXSA9PT0gXCJcIikge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmIChhdHJpYnV0ZSBpbnN0YW5jZW9mIEdlbmVyYWxBdHRyKSB7XG5cdFx0XHRpZiAoaHRtbG5vZGUuYXR0cmlidXRlc1thdHRyXS52YWx1ZSAhPT0gdGhpcy5BdHRyW2F0dHJdKSByZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHR9XG5cdHJldHVybiB0cnVlO1xufTtcbkJhc2VUYWcucHJvdG90eXBlLm5ldyA9IGZ1bmN0aW9uICgpIHtcblx0bGV0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0aGlzLlRhZ05hbWUpO1xuXHR0aGlzLlVwZGF0ZUF0dHJpYnV0ZXMoZWwpO1xuXHRyZXR1cm4gZWw7XG59O1xuQmFzZVRhZy5wcm90b3R5cGUuVXBkYXRlQXR0cmlidXRlcyA9IGZ1bmN0aW9uIChub2RlKSB7XG5cdGZvciAobGV0IGF0dHIgaW4gdGhpcy5BdHRyKSB7XG5cdFx0bGV0IGF0cmlidXRlID0gdGhpcy5BdHRyW2F0dHJdO1xuXHRcdGlmIChhdHJpYnV0ZSBpbnN0YW5jZW9mIFN0eWxlQXR0cikge1xuXHRcdFx0bm9kZS5zdHlsZVthdHJpYnV0ZS5hdHRyXSA9IGF0cmlidXRlLnZhbHVlO1xuXHRcdH0gZWxzZSBpZiAoYXRyaWJ1dGUgaW5zdGFuY2VvZiBHZW5lcmFsQXR0cikge1xuXHRcdFx0bm9kZS5zZXRBdHRyaWJ1dGUoYXR0ciwgdGhpcy5BdHRyW2F0dHJdKTtcblx0XHR9XG5cdH1cbn07XG5CYXNlVGFnLnByb3RvdHlwZS5BdHRyTWF0Y2ggPSBmdW5jdGlvbiAoYXR0ciwgdmFsdWUpIHtcblx0cmV0dXJuIHRoaXMuQXR0clthdHRyXSA9PT0gdmFsdWU7XG59O1xuQmFzZVRhZy5wcm90b3R5cGUuaXNDb21wYXRpYmxlID0gZnVuY3Rpb24gKGh0bWxub2RlKSB7XG5cdGlmIChodG1sbm9kZS5ub2RlVHlwZSAhPT0gMSB8fCBodG1sbm9kZS50YWdOYW1lLnRvTG93ZXJDYXNlKCkgIT09IHRoaXMuVGFnTmFtZS50b0xvd2VyQ2FzZSgpKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cdHJldHVybiB0cnVlO1xufTtcbi8qZXhwb3J0IGZ1bmN0aW9uIFN0eWxlVGFnKGlkKSB7XG5cdEJhc2VUYWcuY2FsbCh0aGlzLCBpZCxcInNwYW5cIixudWxsLHRydWUpO1xufSovXG5jbGFzcyBBdHRyR2VuZXJhdG9yIHtcblx0Y29uc3RydWN0b3IoZ2VuLCBwcm9wZXJ0eSkge1xuXHRcdHRoaXMuZ2VuID0gZ2VuO1xuXHRcdHRoaXMucHJvcGVydHkgPSBwcm9wZXJ0eTtcblx0fVxuXHRLZXlWYWx1ZSh2YWx1ZSwgbGFiZWwpIHtcblx0XHRyZXR1cm4gbmV3IHRoaXMuZ2VuKHRoaXMucHJvcGVydHksIHZhbHVlKTtcblx0fVxufVxuLypcbmZ1bmN0aW9uIFdyaWl0QXR0cihhdHRyKSB7XG5cdHRoaXMuYXR0ciA9IGF0dHI7XG59XG5mdW5jdGlvbiBBcHBseUF0dHIodmFsdWUpIHtcblx0dGhpcy52YWx1ZSA9IHZhbHVlO1xuXHRyZXR1cm4gdGhpcztcbn1cbmZ1bmN0aW9uIFdyaWl0U3R5bGUoYXR0cikge1xuXHR0aGlzLmF0dHIgPSBhdHRyO1xufVxuXG5XcmlpdEF0dHIucHJvdG90eXBlLmFwcGx5ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG5cdHJldHVybiBuZXcgR2VuZXJhbEF0dHIodGhpcy5hdHRyLCB2YWx1ZSk7XG59O1xuV3JpaXRTdHlsZS5wcm90b3R5cGUuYXBwbHkgPSBmdW5jdGlvbiAodmFsdWUpIHtcblx0cmV0dXJuIG5ldyBTdHlsZUF0dHIodGhpcy5hdHRyLCB2YWx1ZSk7XG59O1xuT2JqZWN0LmZyZWV6ZShXcmlpdEF0dHIpO1xuT2JqZWN0LmZyZWV6ZShXcmlpdFN0eWxlKTtcbmZ1bmN0aW9uIE1hbnkoaWQsIHRhZywgYXR0cmlidXRlcywgYmxvdykge1xuXHR0aGlzLmlzQ29tcGF0aWJsZSA9IGZ1bmN0aW9uIChub2RlKSB7XG5cdFx0aWYgKG5vZGUubm9kZVR5cGUgIT0gMSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRpZiAobm9kZS50YWdOYW1lLnRvTG93ZXJDYXNlKCkgIT0gdGhpcy5UYWdOYW1lLnRvTG93ZXJDYXNlKCkpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0cmV0dXJuIHRydWU7XG5cdH07XG5cdEJhc2ljLmNhbGwodGhpcywgaWQsIHRhZywgYXR0cmlidXRlcyxibG93KTtcblx0Ly9cdE9iamVjdC5mcmVlemUodGhpcyk7XG59XG5mdW5jdGlvbiBNdWx0aUF0dHIoaWQsIHRhZykge1xuXHR0aGlzLklkID0gaWQ7XG5cdHRoaXMuVGFnTmFtZSA9IHRhZztcblx0dGhpcy5jaGlsZHJlbiA9IHt9O1xuXHR0aGlzLkZpbmRCeUNsYXNzID0gZnVuY3Rpb24gKGNsYXNzbmFtZSkge1xuXHRcdGZvciAobGV0IGNoaWxkIGluIHRoaXMuY2hpbGRyZW4pIHtcblx0XHRcdGlmICh0aGlzLmNoaWxkcmVuW2NoaWxkXS5BdHRyTWF0Y2goXCJjbGFzc1wiLCBjbGFzc25hbWUpKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLmNoaWxkcmVuW2NoaWxkXTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0dGhpcy5BZGQgPSBmdW5jdGlvbiAoc3ViaWQsIHZhbHVlLCBhdHRyaWJ1dGVzLG1pbWUpIHtcblx0XHRhdHRyaWJ1dGVzID0gYXR0cmlidXRlcyB8fCB7fTtcblx0XHRhdHRyaWJ1dGVzW3ZhbHVlLmF0dHJdID0gdmFsdWU7XG5cdFx0dGhpcy5jaGlsZHJlbltzdWJpZF0gPSBuZXcgTWFueSh0aGlzLklkICsgXCJfXCIgKyBzdWJpZCwgdGhpcy5UYWdOYW1lLCBhdHRyaWJ1dGVzLCBtaW1lKTtcblx0XHR0aGlzLmNoaWxkcmVuW3N1YmlkXS5TdXBlcklkID0gdGhpcy5JZDtcblx0XHR0aGlzLmNoaWxkcmVuW3N1YmlkXS5QYXJlbnQgPSB0aGlzO1xuXHRcdE9iamVjdC5mcmVlemUodGhpcy5jaGlsZHJlbltzdWJpZF0pO1xuXHR9XG5cdHRoaXMuUmVtb3ZlID0gZnVuY3Rpb24gKGNsYXNuYW1lKSB7XG5cdFx0ZGVsZXRlIHRoaXMuY2hpbGRyZW5bc3ViaWRdO1xuXHR9O1xufVxuLy89PT09PT09PT09PT09PUV4cGVyaW1lbnRhbFxuZnVuY3Rpb24gTXVsdGlTdHlsZShpZCwgdGFnKSB7XG5cdHRoaXMuSWQgPSBpZDtcblx0dGhpcy5UYWdOYW1lID0gdGFnO1xuXHR0aGlzLmNoaWxkcmVuID0ge307XG5cdHRoaXMuRmluZEJ5Q2xhc3MgPSBmdW5jdGlvbiAoY2xhc3NuYW1lKSB7XG5cdFx0Zm9yIChsZXQgY2hpbGQgaW4gdGhpcy5jaGlsZHJlbikge1xuXHRcdFx0aWYgKHRoaXMuY2hpbGRyZW5bY2hpbGRdLkF0dHJNYXRjaChcImNsYXNzXCIsIGNsYXNzbmFtZSkpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuY2hpbGRyZW5bY2hpbGRdO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHR0aGlzLkFkZCA9IGZ1bmN0aW9uIChzdWJpZCwgdmFsdWUsIGF0dHJpYnV0ZXMsbWltZSkge1xuXHRcdGF0dHJpYnV0ZXMgPSBhdHRyaWJ1dGVzIHx8IHt9O1xuXHRcdGF0dHJpYnV0ZXNbdmFsdWUuYXR0cl0gPSB2YWx1ZTtcblx0XHR0aGlzLmNoaWxkcmVuW3N1YmlkXSA9IG5ldyBNYW55KHRoaXMuSWQgKyBcIl9cIiArIHN1YmlkLCB0aGlzLlRhZ05hbWUsIGF0dHJpYnV0ZXMsIG1pbWUpO1xuXHRcdHRoaXMuY2hpbGRyZW5bc3ViaWRdLlN1cGVySWQgPSB0aGlzLklkO1xuXHRcdHRoaXMuY2hpbGRyZW5bc3ViaWRdLlBhcmVudCA9IHRoaXM7XG5cdFx0T2JqZWN0LmZyZWV6ZSh0aGlzLmNoaWxkcmVuW3N1YmlkXSk7XG5cdH1cblx0dGhpcy5SZW1vdmUgPSBmdW5jdGlvbiAoc3ViaWQpIHtcblx0XHRkZWxldGUgdGhpcy5jaGlsZHJlbltzdWJpZF07XG5cdH07XG59XG4qLyIsIi8qZ2xvYmFsIGRvY3VtZW50LHdpbmRvdywkLGNvbnNvbGUsc2V0SW50ZXJ2YWwsQmFzaWMsTWFueSxXcmlpdFN0eWxlLHJlZ2V4cCovXG5pbXBvcnQgTW9kdWxlIGZyb20gJy4vTW9kdWxlJztcbmltcG9ydCB7U2luZ2xlLFN0eWxlVGFnLFN0eWxlQXR0cn0gZnJvbSAnLi90YWdzJztcbmltcG9ydCBUb29sYmFyIGZyb20gJy4vVG9vbGJhcic7XG5pbXBvcnQgaVRleHRBcmVhIGZyb20gJy4vaVRleHRBcmVhJztcbmltcG9ydCBLZXlIYW5kbGVyIGZyb20gJy4va2V5aGFuZGxlcic7XG5pbXBvcnQgKiBhcyBtb2R1bGVzIGZyb20gJy4vbW9kdWxlcyc7XG5cbnZhciBHUEVHdWkgPSB7XG5cdGVuZ2luZToge1xuXHRcdG1pY3JvOiAxLFxuXHRcdG1pbmk6IDIsXG5cdFx0bm9ybWFsOiAzLFxuXHRcdGV4dGVuZGVkOiA0XG5cdH0sXG5cdHZpc3VhbDoge1xuXHRcdG9uc2VsZWN0aW9uOiAxLFxuXHRcdGFsd2F5czogMixcblx0XHRhbHRlcm5hdGU6IDNcblx0fVxufTtcbnZhciBHUEVUYWdzID0ge1xuXHRjb21tYW5kOiAwLFxuXHRzcGFuOiAxLFxuXHRpZDogMixcblx0dGFnOiAzLFxuXHRwYXJhZ3JhcGg6IDEwLFxuXHRtdWx0aVNwYW46IDExLFxuXHRtdWx0aUNsYXNzOiAxMixcblx0bXVsdGlOYW1lOiAxMyxcblx0b25seUluc2VydDogMjEsXG5cdG11bHRpT25seUluc2VydDogMzEsXG5cdGxpc3Q6IDUxXG59O1xuLy8xLTEwIEFwZXJ0dXJhIHkgQ2llcnJlXG4vLzExLTIwIEFwZXJ0dXJhIHkgQ2llcnJlLCBNw7psdGlwbGVzIFZhbG9yZXNcbi8vMjEtMzAgQXBlcnR1cmFcbi8vMzEtNDAgQXBlcnR1cmEsIE3Dumx0aXBsZXMgVmFsb3Jlc1xuLy81MS14eHggVG9kYXMgbGFzIGRlbcOhcyhEZWZpbmlyIEluZGVwZW5kaWVudGVtZW50ZSlcbmZ1bmN0aW9uIE1hdGNoTlQodGV4dCwgdGFnKSB7XG5cdGxldCB4ID0gdGV4dC5tYXRjaCh0YWcpO1xuXHRyZXR1cm4geCA/IHgubGVuZ3RoIDogMDtcbn1cbmZ1bmN0aW9uIGZpbmROVCh0eHQsIHRhZykge1xuXHR2YXIgc28gPSByZWdleHAoXCJbX19UYWdfX11cIik7XG5cdHZhciB4ID0gdHh0LnJlcGxhY2UocmVnZXhwKHRhZywgXCJnXCIpLCBcIltfX1RhZ19fXVwiKTtcblx0eCA9IHgubWF0Y2goc28pO1xuXHRyZXR1cm4geCA/IHgubGVuZ3RoIDogMDtcbn1cblxuZnVuY3Rpb24gc3RyX3JlcGxhY2Uoc2VhcmNoLCByZXBsYWNlLCBzdWJqZWN0KSB7XG5cdHZhciBzID0gc3ViamVjdDtcblx0dmFyIHJhID0gciBpbnN0YW5jZW9mIEFycmF5LFxuXHRcdHNhID0gcyBpbnN0YW5jZW9mIEFycmF5LFxuXHRcdGYgPSBbXS5jb25jYXQoc2VhcmNoKSxcblx0XHRyID0gW10uY29uY2F0KHJlcGxhY2UpLFxuXHRcdGkgPSAocyA9IFtdLmNvbmNhdChzKSkubGVuZ3RoLFxuXHRcdGogPSAwO1xuXG5cdHdoaWxlIChqID0gMCwgaS0tKSB7XG5cdFx0aWYgKHNbaV0pIHtcblx0XHRcdHdoaWxlIChzW2ldID0gKHNbaV0gKyAnJykuc3BsaXQoZltqXSkuam9pbihyYSA/IHJbal0gfHwgXCJcIiA6IHJbMF0pLCArK2ogaW4gZikge31cblx0XHR9XG5cdH1cblx0cmV0dXJuIHNhID8gcyA6IHNbMF07XG59XG5cbnZhciB0b3RhbEdQRVQgPSAwO1xudmFyIF9pID0gJzxsaSBpZD1cImlcIiBuYW1lPVwiZW1cIiB2YWx1ZT1cIjNcIj48L2xpPic7XG52YXIgX3UgPSAnPGxpIGlkPVwidVwiIHZhbHVlPVwiMVwiIGV4dHJhPVxcJ3N0eWxlOnRleHQtZGVjb3JhdGlvbjp1bmRlcmxpbmVcXCc+PC9saT4nO1xudmFyIF90ID0gJzxsaSBpZD1cInRcIiB2YWx1ZT1cIjFcIiBleHRyYT1cXCdzdHlsZTp0ZXh0LWRlY29yYXRpb246bGluZS10aHJvdWdoXFwnPjwvbGk+JztcbnZhciBfbyA9ICc8bGkgaWQ9XCJvXCIgdmFsdWU9XCIxXCIgZXh0cmE9XFwnc3R5bGU6dGV4dC1kZWNvcmF0aW9uOm92ZXJsaW5lXFwnPjwvbGk+JztcbnZhciBfc3ViID0gJzxsaSBpZD1cInN1YlwiIHZhbHVlPVwiMlwiPjwvbGk+JztcbnZhciBfc3VwID0gJzxsaSBpZD1cInN1cFwiIHZhbHVlPVwiMlwiPjwvbGk+JztcbnZhciBfdWwgPSAnPGxpIGlkPVwidWxcIiB2YWx1ZT1cIjUxXCI+PC9saT4nO1xudmFyIF9vbCA9ICc8bGkgaWQ9XCJvbFwiIHZhbHVlPVwiNTFcIj48L2xpPic7XG52YXIgX3NpemUgPSAnPGxpIGlkPVwiZm9udHNpemVcIiB2YWx1ZT1cIjExXCIgZXh0cmE9XFwnc3R5bGU6Zm9udC1zaXplXFwnPjwvbGk+JztcbnZhciBfY29sb3IgPSAnPGxpIGlkPVwiY29sb3JcIiB2YWx1ZT1cIjExXCIgZXh0cmE9XFwnc3R5bGU6Y29sb3JcXCcgY2xhc3M9XCJjYm90b25cIj48L2xpPic7XG52YXIgX2hpZ2hsaWdodCA9ICc8bGkgaWQ9XCJoaWdobGlnaHRcIiB2YWx1ZT1cIjExXCIgZXh0cmE9XFwnc3R5bGU6YmFja2dyb3VuZC1jb2xvclxcJyBjbGFzcz1cImNib3RvblwiIHNDST1cImJhY2tncm91bmQtY29sb3JcIj48L2xpPic7XG52YXIgX3NoYWRvdyA9ICc8bGkgaWQ9XCJ0ZXh0c2hhZG93XCIgdmFsdWU9XCIxMVwiIGV4dHJhPVxcJ3N0eWxlOnRleHQtc2hhZG93OiguKj8pIDFweCAxcHggMXB4XFwnIGNsYXNzPVwiY2JvdG9uXCIgc0NJPVwidGV4dC1zaGFkb3dcIj48L2xpPic7XG52YXIgX2wgPSAnPGxpIGlkPVwiTFwiIGV4dHJhPVwic3R5bGU6dGV4dC1hbGlnbjpsZWZ0XCIgdmFsdWU9XCIxMFwiPjwvbGk+JztcbnZhciBfYyA9ICc8bGkgaWQ9XCJDXCIgZXh0cmE9XCJzdHlsZTp0ZXh0LWFsaWduOmNlbnRlclwiIHZhbHVlPVwiMTBcIj48L2xpPic7XG52YXIgX3IgPSAnPGxpIGlkPVwiUlwiIGV4dHJhPVwic3R5bGU6dGV4dC1hbGlnbjpyaWdodFwiIHZhbHVlPVwiMTBcIj48L2xpPic7XG52YXIgX2ogPSAnPGxpIGlkPVwiSlwiIGV4dHJhPVwic3R5bGU6dGV4dC1hbGlnbjpqdXN0aWZ5XCIgdmFsdWU9XCIxMFwiPjwvbGk+JztcbnZhciBfY2l0ZSA9ICc8bGkgaWQ9XCJjaXRlXCIgdmFsdWU9XCIyXCI+PC9saT4nO1xudmFyIF9xdW90ZSA9ICc8bGkgaWQ9XCJxdW90ZVwiIG5hbWU9XCJxXCIgdmFsdWU9XCIzXCI+PC9saT4nO1xudmFyIF9lID0gJzxsaSBpZD1cImJcIiBuYW1lPVwic3Ryb25nXCIgdmFsdWU9XCIzXCI+PC9saT4nO1xudmFyIF9lbW90aWMgPSAnPGxpIGlkPVwiZW1vdGljXCIgbmFtZT1cInNwYW5cIiB2YWx1ZT1cIjMxXCIgZXh0cmE9XFwnc3JjXFwnPjwvbGk+JztcbnZhciBfaGwgPSAnPGxpIGlkPVwiaHJcIiBuYW1lPVwiaHJcIiB2YWx1ZT1cIjIxXCI+PC9saT4nO1xudmFyIF91bmZvcm1hdCA9ICc8bGkgaWQ9XCJ1bmZvcm1hcnRcIiB2YWx1ZT1cIjBcIj48L2xpPic7XG5cbnZhciB0ZW1wbGF0ZSA9ICc8c2VjdGlvbiBjbGFzcz1cIndyaWl0LWJveFwiPjxtZW51PjwvbWVudT48ZGl2IGRhdGEtd3JpaXQtcm9sZT1cInRleHQtYXJlYVwiPjwvZGl2PjxkaXYgY2xhc3M9XCJ0YWdpXCI+PC9kaXY+PC9zZWN0aW9uPic7XG5sZXQgaW5zdGFsbGVkcGx1Z2lucyA9IFtdO1xuXG5mdW5jdGlvbiBnZXRUYWcobm9kZSwgdGFncykge1xuXHRmb3IgKGxldCBwcm9wIGluIHRhZ3MpIHtcblx0XHRsZXQgdGFnID0gdGFnc1twcm9wXTtcblx0XHRpZiAodGFnLmlzSW5zdGFuY2Uobm9kZSkpIHtcblx0XHRcdHJldHVybiB0YWc7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBudWxsO1xufVxuZnVuY3Rpb24gZmluZEFsbFRhZ3Mobm9kZSwgY29udGFpbmVyLCB0YWdzKSB7XG5cdGZvciAobGV0IG5uYW1lIGluIG5vZGUuY2hpbGRyZW4pIHtcblx0XHRsZXQgbmV3bm9kZSA9IG5vZGUuY2hpbGRyZW5bbm5hbWVdO1xuXHRcdGlmIChuZXdub2RlLm5vZGVUeXBlID09PSAxKSB7XG5cdFx0XHRsZXQgdGFnID0gZ2V0VGFnKG5ld25vZGUsIHRhZ3MpO1xuXHRcdFx0aWYgKHRhZyAhPT0gbnVsbCkge1xuXHRcdFx0XHRjb250YWluZXJbdGFnLklkXSA9IHRhZztcblx0XHRcdH1cblx0XHRcdGZpbmRBbGxUYWdzKG5ld25vZGUsIGNvbnRhaW5lciwgdGFncyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0fVxufVxuZnVuY3Rpb24gTm9kZUFuYWx5c2lzKHRhZ3MsIG1haW5jb250YWluZXIpIHtcblx0bGV0IGxlZnQgPSB7fTtcblx0bGV0IG1pZGRsZSA9IHt9O1xuXHRsZXQgcmlnaHQgPSB7fTtcblx0bGV0IGNvbnRhaW4gPSB7fTtcblx0bGV0IGxlZnROb2RlID0gdGhpcy5zdGFydENvbnRhaW5lci5wYXJlbnROb2RlO1xuXHRsZXQgcmlnaHROb2RlID0gdGhpcy5lbmRDb250YWluZXIucGFyZW50Tm9kZTtcblx0bGV0IGNvbW1vbiA9IG51bGw7XG5cdGlmIChsZWZ0Tm9kZSA9PT0gcmlnaHROb2RlKSB7XG5cdFx0Y29tbW9uID0gbGVmdE5vZGU7XG5cdFx0bGV0IGluc2lkZXIgPSB0aGlzLmNsb25lQ29udGVudHMoKTtcblx0XHRmaW5kQWxsVGFncyhpbnNpZGVyLCBtaWRkbGUsIHRhZ3MpO1xuXHR9IGVsc2Uge1xuXHRcdHdoaWxlIChsZWZ0Tm9kZSAhPT0gdGhpcy5jb21tb25BbmNlc3RvckNvbnRhaW5lcikge1xuXHRcdFx0bGV0IHRhZyA9IGdldFRhZyhsZWZ0Tm9kZSwgdGFncyk7XG5cdFx0XHRpZiAodGFnICE9PSBudWxsKSB7XG5cdFx0XHRcdGxlZnRbdGFnLklkXSA9IHRhZztcblx0XHRcdH1cblx0XHRcdGxlZnROb2RlID0gbGVmdE5vZGUucGFyZW50Tm9kZTtcblx0XHR9XG5cdFx0d2hpbGUgKHJpZ2h0Tm9kZSAhPT0gdGhpcy5jb21tb25BbmNlc3RvckNvbnRhaW5lcikge1xuXHRcdFx0bGV0IHRhZyA9IGdldFRhZyhyaWdodE5vZGUsIHRhZ3MpO1xuXHRcdFx0aWYgKHRhZyAhPT0gbnVsbCkge1xuXHRcdFx0XHRyaWdodFt0YWcuSWRdID0gdGFnO1xuXHRcdFx0fVxuXHRcdFx0cmlnaHROb2RlID0gcmlnaHROb2RlLnBhcmVudE5vZGU7XG5cdFx0fVxuXHRcdGNvbW1vbiA9IHRoaXMuY29tbW9uQW5jZXN0b3JDb250YWluZXI7XG5cdH1cblx0d2hpbGUgKGNvbW1vbiAhPT0gbWFpbmNvbnRhaW5lcikge1xuXHRcdGxldCB0YWcgPSBnZXRUYWcoY29tbW9uLCB0YWdzKTtcblx0XHRpZiAodGFnICE9PSBudWxsKSB7XG5cdFx0XHRjb250YWluW3RhZy5JZF0gPSB0YWc7XG5cdFx0fVxuXHRcdGNvbW1vbiA9IGNvbW1vbi5wYXJlbnROb2RlO1xuXHR9XG5cdGxldCBwbHVncyA9IHt9O1xuXHRmb3IgKGxldCBwcm9wIGluIHRhZ3MpIHtcblx0XHRsZXQgdGFnID0gdGFnc1twcm9wXTtcblx0XHRsZXQgYnV0dG9uID0gbWFpbmNvbnRhaW5lci5wYXJlbnROb2RlLnF1ZXJ5U2VsZWN0b3JBbGwoXCJbZGF0YS13cmlpdC1jb21tYW5kSWQ9XCIgKyB0YWcuSWQgKyBcIl1cIilbMF07XG5cdFx0bGV0IGdsb3cgPSBmYWxzZTtcblx0XHRpZiAodGFnIGluc3RhbmNlb2YgU2luZ2xlKSB7XG5cdFx0XHRwbHVnc1t0YWcuSWRdID0ge1xuXHRcdFx0XHRpc1NvcnJvdW5kZWQ6IGNvbnRhaW5bdGFnLklkXSAhPT0gdW5kZWZpbmVkLFxuXHRcdFx0XHRpc0NvbnRhaW5lZDogbWlkZGxlW3RhZy5JZF0gIT09IHVuZGVmaW5lZCxcblx0XHRcdFx0aXNPcGVuZWQ6IHJpZ2h0W3RhZy5JZF0gIT09IHVuZGVmaW5lZCxcblx0XHRcdFx0aXNDbG9zZWQ6IGxlZnRbdGFnLklkXSAhPT0gdW5kZWZpbmVkLFxuXHRcdFx0XHRkZWVwOiAwXG5cdFx0XHR9O1xuXHRcdFx0aWYgKHBsdWdzW3RhZy5JZF0uaXNTb3Jyb3VuZGVkKSB7XG5cdFx0XHRcdGJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcblx0XHRcdFx0Z2xvdz10cnVlO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0YnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoJ2FjdGl2ZScpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAodGFnIGluc3RhbmNlb2YgTWFueSkge1xuXHRcdFx0cGx1Z3NbdGFnLlN1cGVySWRdID0ge1xuXHRcdFx0XHRpc1NvcnJvdW5kZWQ6IHBsdWdzW3RhZy5TdXBlcklkXSAhPT0gbnVsbCA/IHBsdWdzW3RhZy5TdXBlcklkXS5pc1NvcnJvdW5kZWQgfHwgY29udGFpblt0YWcuSWRdICE9PSBudWxsIDogY29udGFpblt0YWcuSWRdLFxuXHRcdFx0XHRpc0NvbnRhaW5lZDogcGx1Z3NbdGFnLlN1cGVySWRdICE9PSBudWxsID8gcGx1Z3NbdGFnLlN1cGVySWRdLmlzQ29udGFpbmVkIHx8IG1pZGRsZVt0YWcuSWRdICE9PSBudWxsIDogbWlkZGxlW3RhZy5JZF0sXG5cdFx0XHRcdGlzT3BlbmVkOiBwbHVnc1t0YWcuU3VwZXJJZF0gIT09IG51bGwgPyBwbHVnc1t0YWcuU3VwZXJJZF0uaXNPcGVuZWQgfHwgcmlnaHRbdGFnLklkXSAhPT0gbnVsbCA6IHJpZ2h0W3RhZy5JZF0gIT09IG51bGwsXG5cdFx0XHRcdGlzQ2xvc2VkOiBwbHVnc1t0YWcuU3VwZXJJZF0gIT09IG51bGwgPyBwbHVnc1t0YWcuU3VwZXJJZF0uaXNDbG9zZWQgfHwgbGVmdFt0YWcuSWRdICE9PSBudWxsIDogbGVmdFt0YWcuSWRdICE9PSBudWxsLFxuXHRcdFx0XHRkZWVwOiAwXG5cdFx0XHR9O1xuXHRcdFx0aWYgKGNvbnRhaW5bdGFnLklkXSAhPT0gbnVsbCkge1xuXHRcdFx0XHRnbG93PXRydWU7XG5cdFx0XHRcdGJ1dHRvbi5jbGFzc0xpc3QuYWRkKCdhY3RpdmUnKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGJ1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0bGV0IGRvbz10YWcuTWltZTtcblx0XHRpZiAoZ2xvdyAmJiBkb28pIHtcblx0XHRcdGJ1dHRvbi5zdHlsZVtcImJveC1zaGFkb3dcIl0gPSBcImluc2V0ICMwMGZmMDAgMXB4IDFweCA1MHB4XCI7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGJ1dHRvbi5zdHlsZVtcImJveC1zaGFkb3dcIl0gPSBcIlwiO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gcGx1Z3M7XG59XG5mdW5jdGlvbiBhZGR0b3RhZ2koZSkge1xuXHQkKHRoaXMpLnBhcmVudCgpLmZpbmQoJy50YWdpJykuaHRtbCgnJyk7XG5cdHZhciB4ID0gJChkb2N1bWVudC5nZXRTZWxlY3Rpb24oKS5hbmNob3JOb2RlLnBhcmVudE5vZGUpO1xuXHR2YXIgaSA9IDA7XG5cdHdoaWxlICh4LmdldCgwKSAhPT0gdGhpcykge1xuXHRcdHZhciBsaSA9ICQoJzxzcGFuPicgKyB4LmdldCgwKS5sb2NhbE5hbWUgKyAnPC9zcGFuPicpO1xuXHRcdCQodGhpcykucGFyZW50KCkuZmluZCgnLnRhZ2knKS5wcmVwZW5kKGxpKTtcblx0XHR4ID0geC5wYXJlbnQoKTtcblx0fVxufVxuZnVuY3Rpb24gV3JpaXQocGFyZW50LCBjZmcpIHtcblx0bGV0IHByaXZhdGVEYXRhID0gbmV3IFdlYWtNYXAoKTtcblx0bGV0IHByb3BzID0ge1xuXHRcdGRhdGFpbmRleDogW09iamVjdC5jcmVhdGUobnVsbCldLFxuXHRcdGRhdGE6IE9iamVjdC5jcmVhdGUobnVsbClcblx0fTtcblx0bGV0IGluZGV4ZXMgPSBbT2JqZWN0LmNyZWF0ZShudWxsKV07XG5cdHZhciBjb21waWxlZCA9ICQodGVtcGxhdGUpO1xuXHR0aGlzLnRleHRhcmVhID0gY29tcGlsZWQuZmluZChcIltkYXRhLXdyaWl0LXJvbGU9dGV4dC1hcmVhXVwiKTtcblx0dGhpcy50ZXh0YXJlYS5odG1sKHBhcmVudC5odG1sKCkpO1xuXHRwYXJlbnQucmVwbGFjZVdpdGgoY29tcGlsZWQpO1xuXHR0aGlzLm1lbnUgPSBjb21waWxlZC5maW5kKCdtZW51OmVxKDApJyk7XG5cdHRoaXMuY2ZnID0gJC5leHRlbmQoe30sIGNmZywge1xuXHRcdE1vZHVsZXM6IGluc3RhbGxlZHBsdWdpbnNcblx0fSk7XG5cdHZhciB0aGF0ID0gdGhpcztcblx0dmFyIHByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZih0aGF0KTtcblx0dGhpcy5odG1sID0ge1xuXHRcdGdldCBzZWxlY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5nZXRTZWxlY3Rpb24oMCkuY29vcmQ7XG5cdFx0fSxcblx0XHRnZXRTZWxlY3Rpb246IGZ1bmN0aW9uIChuKSB7XG5cdFx0XHRuID0gbiB8fCAwO1xuXHRcdFx0dmFyIGh0bWwgPSB0aGF0LnRleHRhcmVhLmh0bWwoKTtcblx0XHRcdHZhciBjb29yZCA9IHRoYXQudGV4dGFyZWEuZ2V0U2VsZWN0aW9uKG4pO1xuXHRcdFx0dmFyIHJhbmdlID0gY29vcmQucmFuZztcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGdldCBzdGFydCgpIHtcblx0XHRcdFx0XHRyZXR1cm4gY29vcmQuc3RhcnQ7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGdldCBlbmQoKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGNvb3JkLmVuZDtcblx0XHRcdFx0fSxcblx0XHRcdFx0Z2V0IHByZSgpIHtcblx0XHRcdFx0XHRyZXR1cm4gaHRtbC5zdWJzdHJpbmcoMCwgY29vcmQuc3RhcnQpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRnZXQgc2VsKCkge1xuXHRcdFx0XHRcdHJldHVybiBodG1sLnN1YnN0cmluZyhjb29yZC5zdGFydCwgY29vcmQuZW5kKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0Z2V0IHBvc3QoKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGh0bWwuc3Vic3RyaW5nKGNvb3JkLmVuZCwgaHRtbC5sZW50Z2gpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRnZXQgdGV4dCgpIHtcblx0XHRcdFx0XHRyZXR1cm4gaHRtbDtcblx0XHRcdFx0fSxcblx0XHRcdFx0c2V0IHRleHQodikge1xuXHRcdFx0XHRcdHRoYXQudGV4dGFyZWEuaHRtbCh2KTtcblx0XHRcdFx0fSxcblx0XHRcdFx0Z2V0IHZpc3VhbCgpIHtcblx0XHRcdFx0XHRyZXR1cm4gcmFuZ2U7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0fVxuXHR9O1xuXHR0aGlzLnNlbGVjdGlvbiA9IGZ1bmN0aW9uICh0YWdpZCkge1xuXHRcdHJldHVybiB0aGlzLk1vZHVsZXNbdGFnaWRdLnNlbGVjdGlvbjtcblx0fTtcblx0dGhpcy50ZXh0YXJlYS5LZXlIYW5kbGVyKCk7IHtcblx0XHRsZXQgYmxvY2sgPSBmYWxzZTtcblx0XHRsZXQgaW5pdGlhbFZhbHVlID0gdGhpcy50ZXh0YXJlYS5odG1sKCkudHJpbSgpO1xuXHRcdGxldCBzdG9yZUluZm8gPSBmdW5jdGlvbiAoZm9yY2UpIHtcblx0XHRcdGxldCBpbmRleCA9IHByaXZhdGVEYXRhLmdldChjb21waWxlZC5nZXQoMCkpIHx8IFtdO1xuXHRcdFx0aWYgKGluZGV4ZXMubGVuZ3RoID09PSA1MSkge1xuXG5cdFx0XHR9XG5cdFx0XHRsZXQgcHJvcCA9IGluZGV4W2luZGV4Lmxlbmd0aCAtIDFdO1xuXHRcdFx0bGV0IHRleHR2YWx1ZSA9IHRoYXQudGV4dGFyZWEuaHRtbCgpLnRyaW0oKTtcblx0XHRcdGxldCBkYXRhID0gcHJpdmF0ZURhdGEuZ2V0KHByb3ApO1xuXG5cdFx0XHRpZiAoZGF0YSA9PT0gdW5kZWZpbmVkICYmIHRleHR2YWx1ZSAhPT0gaW5pdGlhbFZhbHVlKSB7XG5cdFx0XHRcdHByb3AgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXHRcdFx0XHRwcml2YXRlRGF0YS5zZXQocHJvcCwgaW5pdGlhbFZhbHVlKTtcblx0XHRcdFx0aW5kZXgucHVzaChwcm9wKTtcblx0XHRcdFx0cHJpdmF0ZURhdGEuc2V0KGNvbXBpbGVkLmdldCgwKSwgaW5kZXgpO1xuXHRcdFx0XHR0aGF0LmJ1dHRvbnMudW5kby5hdHRyKCdkaXNhYmxlZCcsIGZhbHNlKTtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9IGVsc2UgaWYgKFxuXG5cdFx0XHRcdChkYXRhICYmIE1hdGguYWJzKHRleHR2YWx1ZS5sZW5ndGggLSBkYXRhLmxlbmd0aCkgPiAxNSkgfHwgKGZvcmNlICYmIHRleHR2YWx1ZSAhPT0gZGF0YSlcblx0XHRcdCkge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhcIlN0b3JlXCIsIHRleHR2YWx1ZSk7XG5cdFx0XHRcdHByb3AgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXHRcdFx0XHRwcml2YXRlRGF0YS5zZXQocHJvcCwgdGV4dHZhbHVlKTtcblx0XHRcdFx0aW5kZXgucHVzaChwcm9wKTtcblx0XHRcdFx0cHJpdmF0ZURhdGEuc2V0KGNvbXBpbGVkLmdldCgwKSwgaW5kZXgpO1xuXHRcdFx0XHR0aGF0LmJ1dHRvbnMudW5kby5hdHRyKCdkaXNhYmxlZCcsIGZhbHNlKTtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gKGRhdGEgIT09IHVuZGVmaW5lZCkgJiYgKGRhdGEgJiYgZGF0YSAhPT0gdGV4dHZhbHVlKTtcblx0XHR9O1xuXG5cdFx0bGV0IGNsZWFySW5mbyA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdHByaXZhdGVEYXRhLnNldCh0aGF0LnRleHRhcmVhLmdldCgwKSwgW10pO1xuXHRcdFx0dGhhdC5idXR0b25zLnJlZG8uYXR0cignZGlzYWJsZWQnLCB0cnVlKTtcblx0XHR9O1xuXHRcdGNvbXBpbGVkLmJpbmQoJ3NhdmVjb250ZW50JywgZnVuY3Rpb24gKGUpIHtcblx0XHRcdHdoaWxlIChibG9jayk7XG5cdFx0XHRibG9jayA9IHRydWU7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRpZiAoc3RvcmVJbmZvKCkpIHtcblx0XHRcdFx0XHRjbGVhckluZm8oKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aGF0LmJ1dHRvbnMudW5kby5hdHRyKCdkaXNhYmxlZCcsIHRydWUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGNhdGNoIChleCkge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhleCk7XG5cdFx0XHR9XG5cdFx0XHRibG9jayA9IGZhbHNlO1xuXHRcdH0pO1xuXG5cdFx0bGV0IGN0cmx6ID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0d2hpbGUgKGJsb2NrKTtcblx0XHRcdGJsb2NrID0gdHJ1ZTtcblx0XHRcdGxldCBzdG9yZWQgPSBzdG9yZUluZm8odHJ1ZSk7XG5cdFx0XHRsZXQgdW5kb3MgPSBwcml2YXRlRGF0YS5nZXQoY29tcGlsZWQuZ2V0KDApKTtcblx0XHRcdGxldCByZWRvcyA9IHByaXZhdGVEYXRhLmdldCh0aGF0LnRleHRhcmVhLmdldCgwKSkgfHwgW107XG5cblx0XHRcdGlmICh1bmRvcy5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdGlmIChzdG9yZWQpIHtcblx0XHRcdFx0XHRyZWRvcy5wdXNoKHVuZG9zLnBvcCgpKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRsZXQgcHJvcCA9IHByaXZhdGVEYXRhLmdldCh1bmRvc1t1bmRvcy5sZW5ndGggLSAxXSk7XG5cdFx0XHRcdHByaXZhdGVEYXRhLnNldCh0aGF0LnRleHRhcmVhLmdldCgwKSwgcmVkb3MpO1xuXG5cdFx0XHRcdHRoYXQudGV4dGFyZWEuaHRtbChwcm9wKTtcblx0XHRcdFx0cHJpdmF0ZURhdGEuc2V0KGNvbXBpbGVkLmdldCgwKSwgdW5kb3MpO1xuXHRcdFx0XHRsZXQgc2VsID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xuXHRcdFx0XHRzZWwucmVtb3ZlQWxsUmFuZ2VzKCk7XG5cdFx0XHRcdGxldCBub2RlID0gdGhhdC50ZXh0YXJlYS5nZXQoMCk7XG5cdFx0XHRcdHdoaWxlIChub2RlLmxhc3RDaGlsZCkge1xuXHRcdFx0XHRcdG5vZGUgPSBub2RlLmxhc3RDaGlsZDtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGF0Lmh0bWwuZ2V0U2VsZWN0aW9uKDApLnZpc3VhbC5zZXRTdGFydEJlZm9yZShub2RlKTtcblx0XHRcdFx0dGhhdC5odG1sLmdldFNlbGVjdGlvbigwKS52aXN1YWwuc2V0RW5kQmVmb3JlKG5vZGUpO1xuXHRcdFx0XHRzZWwuYWRkUmFuZ2UodGhhdC5odG1sLmdldFNlbGVjdGlvbigwKS52aXN1YWwpO1xuXG5cdFx0XHRcdHRoYXQuYnV0dG9ucy5yZWRvLmF0dHIoJ2Rpc2FibGVkJywgZmFsc2UpO1xuXHRcdFx0fVxuXHRcdFx0YmxvY2sgPSBmYWxzZTtcblx0XHRcdC8vXHRcdCQodGhpcykudHJpZ2dlcigna2V5dXAnLCBlKTtcblx0XHRcdHJldHVybiBmYWxzZTtcblxuXHRcdH07XG5cdFx0dGhpcy50ZXh0YXJlYS5rZXlzLmJpbmQoXCJDTUQrWlwiLCBjdHJseik7XG5cdFx0cHJvdG90eXBlLnVuZG8gPSB7XG5cdFx0XHRTZXR1cDogZnVuY3Rpb24gKHRvb2xiYXIpIHtcblx0XHRcdFx0dGhpcy5DYWxsYmFjayh0b29sYmFyLkFkZEJ1dHRvbihuZXcgU2luZ2xlKFwidW5kb1wiLCBcIl91bmRvXCIsIHtcblx0XHRcdFx0XHR0b29sdGlwOiBcIlVuZG9cIixcblx0XHRcdFx0XHRkaXNwbGF5Y2xhc3M6IFwiZmEgZmEtdW5kb1wiXG5cdFx0XHRcdH0pKSwgY3RybHopO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0cHJvdG90eXBlLnJlZG8gPSB7XG5cdFx0XHRTZXR1cDogZnVuY3Rpb24gKHRvb2xiYXIpIHtcblx0XHRcdFx0dGhpcy5DYWxsYmFjayh0b29sYmFyLkFkZEJ1dHRvbihuZXcgU2luZ2xlKFwicmVkb1wiLCBcIl9yZWRvXCIsIHtcblx0XHRcdFx0XHR0b29sdGlwOiBcIlJlcGVhdFwiLFxuXHRcdFx0XHRcdGRpc3BsYXljbGFzczogXCJmYSBmYS1yZXBlYXRcIlxuXHRcdFx0XHR9KSksIGN0cmx6KTtcblx0XHRcdFx0dGhhdC5idXR0b25zLnJlZG8uc2V0QXR0cmlidXRlKCdkaXNhYmxlZCcsIHRydWUpO1xuXHRcdFx0fVxuXHRcdH07XG5cdH1cblx0dGhpcy50ZXh0YXJlYS50b1RleHRBcmVhKHtcblx0XHRjb29yZDogZmFsc2UsXG5cdFx0ZGVidWc6IGZhbHNlXG5cdH0pO1xuXG5cdHRoaXMuTW9kdWxlcyA9IHt9O1xuXHR0aGlzLmJ1dHRvbnMgPSB7fTtcblx0dGhpcy50YWdzID0ge307XG5cdHRoaXMubWV0YWRhdGEgPSB7fTtcblx0dGhpcy50ZXh0YXJlYS5iaW5kKCdrZXl1cCBtb3VzZXVwJywgYWRkdG90YWdpKTtcblx0dGhpcy50ZXh0YXJlYS5iaW5kKCdrZXl1cCBtb3VzZXVwJywgZnVuY3Rpb24gKCkge1xuXHRcdHRoYXQuTW9kdWxlcyA9IE5vZGVBbmFseXNpcy5hcHBseSh0aGF0LnRleHRhcmVhLmdldFNlbGVjdGlvbigwKS5yYW5nLCBbdGhhdC50YWdzLCB0aGF0LnRleHRhcmVhLmdldCgwKV0pO1xuXHR9KTtcblx0c2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuXHRcdGNvbXBpbGVkLnRyaWdnZXIoJ3NhdmVjb250ZW50Jyk7XG5cdH0sIDEwMDApO1xuXHRsZXQgdG9vbGJhciA9IG5ldyBUb29sYmFyKHRoaXMpO1xuXHRPYmplY3QuZnJlZXplKHRvb2xiYXIpO1xuXHR0aGlzLmNmZy5Nb2R1bGVzLmZvckVhY2goZnVuY3Rpb24gKHBsdWdpbikge1xuXHRcdGlmIChwcm90b3R5cGVbcGx1Z2luXS5TZXR1cCAhPT0gbnVsbCkge1xuXHRcdFx0cHJvdG90eXBlW3BsdWdpbl0gPSAkLmV4dGVuZChuZXcgTW9kdWxlKHRoYXQpLCBwcm90b3R5cGVbcGx1Z2luXSk7XG5cdFx0XHRwcm90b3R5cGVbcGx1Z2luXS5TZXR1cCh0b29sYmFyKTtcblx0XHR9XG5cdH0pO1xuXHR0aGlzLmJ1dHRvbiA9IGZ1bmN0aW9uIChpZCkge1xuXHRcdHJldHVybiB0aGF0LmJ1dHRvbnNbaWRdO1xuXHR9O1xufVxuXG5mb3IobGV0IG1vZCBpbiBtb2R1bGVzKXtcblx0aW5zdGFsbGVkcGx1Z2lucy5wdXNoKG1vZCk7XG5cdFdyaWl0LnByb3RvdHlwZVttb2RdID0gbW9kdWxlc1ttb2RdO1xufVxuLypXcmlpdC5wcm90b3R5cGUucGFzdGVFdmVudCA9IHtcblx0U2V0dXA6IGZ1bmN0aW9uICgpIHtcblx0XHR2YXIgdGhhdCA9IHRoaXM7XG5cdFx0dmFyIGNsaXBib2FyZCA9ICQoJzx0ZXh0YXJlYSBzdHlsZT1cImRpc3BsYXk6bm9uZTtcIj4nKTtcblx0XHRjbGlwYm9hcmQuaW5zZXJ0QWZ0ZXIoJCh0aGlzLnRleHRhcmVhKSk7XG5cdFx0JCh0aGlzLnRleHRhcmVhKS5iaW5kKFwicGFzdGVcIiwgZmFsc2UsIGZ1bmN0aW9uIChlKSB7XG5cdFx0XHR2YXIgcGFzdGUgPSBcIlwiO1xuXHRcdFx0dmFyIG8gPSBlO1xuXHRcdFx0ZSA9IGUub3JpZ2luYWxFdmVudDtcblx0XHRcdGlmICgvdGV4dFxcL2h0bWwvLnRlc3QoZS5jbGlwYm9hcmREYXRhLnR5cGVzKSkge1xuXHRcdFx0XHRwYXN0ZSA9IGUuY2xpcGJvYXJkRGF0YS5nZXREYXRhKCd0ZXh0L2h0bWwnKTtcblx0XHRcdFx0cGFzdGUgPSBwYXN0ZS5yZXBsYWNlKFwiPG1ldGEgY2hhcnNldD0ndXRmLTgnPlwiLCBmdW5jdGlvbiAoc3RyKSB7XG5cdFx0XHRcdFx0cmV0dXJuICcnO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0cGFzdGUgPSBwYXN0ZS5yZXBsYWNlKC88c3BhbiBjbGFzcz1cIkFwcGxlLWNvbnZlcnRlZC1zcGFjZVwiPi48XFwvc3Bhbj4vZywgZnVuY3Rpb24gKHN0cikge1xuXHRcdFx0XHRcdHJldHVybiAnICc7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRwYXN0ZSA9IHBhc3RlLnJlcGxhY2UoLzxzcGFuW14+XSo+KFtePF0qKTxcXC9zcGFuPi9nLCBmdW5jdGlvbiAoc3RyLCBjdCkge1xuXHRcdFx0XHRcdHJldHVybiBjdDtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdHBhc3RlID0gcGFzdGUucmVwbGFjZSgvIHN0eWxlPVwiLltePl0qXCIvZywgZnVuY3Rpb24gKHN0ciwgY3QpIHtcblx0XHRcdFx0XHRyZXR1cm4gJyc7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRlLmNsaXBib2FyZERhdGEuY2xlYXJEYXRhKCk7XG5cdFx0XHRcdGUuY2xpcGJvYXJkRGF0YS5pdGVtcyA9IFtdO1xuXHRcdFx0XHRjbGlwYm9hcmQuaHRtbChwYXN0ZSk7XG5cdFx0XHRcdHBhc3RlID0gJCgnPHNlY3Rpb24+JyArIHBhc3RlICsgJzwvc2VjdGlvbj4nKS5nZXQoMCk7XG5cdFx0XHRcdC8vXHRcdFx0XHRlLmNsaXBib2FyZERhdGEuc2V0RGF0YSgndGV4dC9odG1sJyxwYXN0ZSk7XG5cdFx0XHR9IGVsc2UgaWYgKC90ZXh0XFwvcGxhaW4vLnRlc3QoZS5jbGlwYm9hcmREYXRhLnR5cGVzKSkge1xuXHRcdFx0XHRwYXN0ZSA9IGUuY2xpcGJvYXJkRGF0YS5nZXREYXRhKCd0ZXh0L3BsYWluJyk7XG5cdFx0XHR9XG5cdFx0XHR2YXIgZW5kID0gcGFzdGUuY2hpbGROb2Rlc1t0aGF0Lm5vZGVBUEkuY2hpbGRDb3VudG9yTGVuZ3RnKHBhc3RlKSAtIDFdO1xuXHRcdFx0d2hpbGUgKHBhc3RlLmNoaWxkTm9kZXMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRlLnRhcmdldC5wYXJlbnROb2RlLmluc2VydEJlZm9yZShwYXN0ZS5jaGlsZE5vZGVzWzBdLCBlLnRhcmdldCk7XG5cdFx0XHR9XG5cdFx0XHR0aGF0Lmh0bWwuZ2V0U2VsZWN0aW9uKDApLnZpc3VhbC5zZXRTdGFydChlbmQsIHRoYXQubm9kZUFQSS5jaGlsZENvdW50b3JMZW5ndGcoZW5kKSk7XG5cdFx0XHR0aGF0Lmh0bWwuZ2V0U2VsZWN0aW9uKDApLnZpc3VhbC5zZXRFbmQoZW5kLCB0aGF0Lm5vZGVBUEkuY2hpbGRDb3VudG9yTGVuZ3RnKGVuZCkpO1xuXHRcdFx0dGhhdC5yZXN0b3JlKCk7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fSk7XG5cdH0sXG59O1xuV3JpaXQucHJvdG90eXBlLnN1YmluZGV4ID0ge1xuXHRTZXR1cDogZnVuY3Rpb24gKHRvb2xiYXIpIHtcblx0XHRsZXQgYnQgPSBuZXcgU2luZ2xlKFwic3ViaW5kZXhcIiwgXCJzdWJcIiwge1xuXHRcdFx0dG9vbHRpcDogXCJTdWJJbmRleFwiLFxuXHRcdFx0ZGlzcGxheWNsYXNzOiBcImZhIGZhLXN1YnNjcmlwdFwiXG5cdFx0fSk7XG5cdFx0dG9vbGJhci5BZGRCdXR0b24oYnQpO1xuXHRcdHRoaXMuQ2FsbGJhY2soYnQsIHRoaXMuSW5zZXJ0KTtcblx0fVxufTtcbldyaWl0LnByb3RvdHlwZS5wb3duID0ge1xuXHRTZXR1cDogZnVuY3Rpb24gKHRvb2xiYXIpIHtcblx0XHR0aGlzLkNhbGxiYWNrKHRvb2xiYXIuQWRkQnV0dG9uKG5ldyBTaW5nbGUoXCJwb3duXCIsIFwic3VwXCIsIHtcblx0XHRcdHRvb2x0aXA6IFwiU3VwZXIgSW5kZXhcIixcblx0XHRcdGRpc3BsYXljbGFzczogXCJmYSBmYS1zdXBlcnNjcmlwdFwiXG5cdFx0fSkpLCB0aGlzLkluc2VydCk7XG5cdH1cbn07XG5XcmlpdC5wcm90b3R5cGUuaXRhbGljID0ge1xuXHRTZXR1cDogZnVuY3Rpb24gKHRvb2xiYXIpIHtcblx0XHR0aGlzLkNhbGxiYWNrKHRvb2xiYXIuQWRkQnV0dG9uKG5ldyBTaW5nbGUoXCJpdGFsaWNcIiwgXCJlbVwiLCB7XG5cdFx0XHR0b29sdGlwOiBcIkl0YWxpY1wiLFxuXHRcdFx0ZGlzcGxheWNsYXNzOiBcImZhIGZhLWl0YWxpY1wiXG5cdFx0fSkpLCB0aGlzLkluc2VydCk7XG5cdH1cbn07XG5XcmlpdC5wcm90b3R5cGUudW5kZXJsaW5lID0ge1xuXHRTZXR1cDogZnVuY3Rpb24gKHRvb2xiYXIpIHtcblx0XHR0aGlzLkNhbGxiYWNrKHRvb2xiYXIuQWRkQnV0dG9uKG5ldyBTaW5nbGUoXCJ1bmRlcmxpbmVcIiwgXCJ1XCIsIHtcblx0XHRcdHRvb2x0aXA6IFwiVW5kZXJsaW5lXCIsXG5cdFx0XHRkaXNwbGF5Y2xhc3M6IFwiZmEgZmEtdW5kZXJsaW5lXCIsXG5cdFx0XHRzaG9ydGN1dDogXCJBTFQrU0hJRlQrVVwiXG5cdFx0fSkpLCB0aGlzLkluc2VydCk7XG5cdH1cbn07XG5XcmlpdC5wcm90b3R5cGUuc3RyaWtldGhyb3VnaCA9IHtcblx0U2V0dXA6IGZ1bmN0aW9uICh0b29sYmFyKSB7XG5cdFx0dGhpcy5DYWxsYmFjayh0b29sYmFyLkFkZEJ1dHRvbihuZXcgU2luZ2xlKFwic3RyaWtldGhyb3VnaFwiLCBcImRlbFwiLCB7XG5cdFx0XHR0b29sdGlwOiBcIlN0cmlrZSBUaHJvdWdoXCIsXG5cdFx0XHRkaXNwbGF5Y2xhc3M6IFwiZmEgZmEtc3RyaWtldGhyb3VnaFwiLFxuXHRcdFx0c2hvcnRjdXQ6IFwiQUxUK1NISUZUK1NcIlxuXHRcdH0pKSwgdGhpcy5JbnNlcnQpO1xuXHR9XG59O1xuLypXcmlpdC5wcm90b3R5cGUucGFyYWdyYXBoID0ge1xuXHRTZXR1cDogZnVuY3Rpb24gKHRvb2xiYXIpIHtcblx0XHRsZXQgZm11bHRpID0gbmV3IE11bHRpQ2xhc3MoJ3BhcmFncmFwaCcsIFwicFwiKTtcblx0XHRmbXVsdGkuQWRkKCdsZWZ0JywgJ3RleHQtbGVmdCcsIHtcblx0XHRcdHRvb2x0aXA6IFwiQWxpZ24gTGVmdFwiLFxuXHRcdFx0ZGlzcGxheWNsYXNzOiBcImZhIGZhLWFsaWduLWxlZnRcIixcblx0XHRcdHNob3J0Y3V0OiBcIkNNRCtTSElGVCtMXCJcblx0XHR9KTtcblx0XHRmbXVsdGkuQWRkKCdjZW50ZXInLCAndGV4dC1jZW50ZXInLCB7XG5cdFx0XHR0b29sdGlwOiBcIkFsaWduIENlbnRlclwiLFxuXHRcdFx0ZGlzcGxheWNsYXNzOiBcImZhIGZhLWFsaWduLWNlbnRlclwiLFxuXHRcdFx0c2hvcnRjdXQ6IFwiQ01EK1NISUZUK0NcIlxuXHRcdH0pO1xuXHRcdGZtdWx0aS5BZGQoJ3JpZ2h0JywgJ3RleHQtcmlnaHQnLCB7XG5cdFx0XHR0b29sdGlwOiBcIkFsaWduIFJpZ2h0XCIsXG5cdFx0XHRkaXNwbGF5Y2xhc3M6IFwiZmEgZmEtYWxpZ24tcmlnaHRcIixcblx0XHRcdHNob3J0Y3V0OiBcIkNNRCtTSElGVCtSXCJcblx0XHR9KTtcblx0XHRmbXVsdGkuQWRkKCdqdXN0aWZ5JywgJ3RleHQtanVzdGlmeScsIHtcblx0XHRcdHRvb2x0aXA6IFwiSnVzdGlmeVwiLFxuXHRcdFx0ZGlzcGxheWNsYXNzOiBcImZhIGZhLWFsaWduLWp1c3RpZnlcIixcblx0XHRcdHNob3J0Y3V0OiBcIkNNRCtTSElGVCtKXCJcblx0XHR9KTtcblx0XHR0b29sYmFyLkFkZEJ1dHRvbihmbXVsdGkpO1xuXHRcdHRoaXMuQ2FsbGJhY2soZm11bHRpLCB0aGlzLkluc2VydCk7XG5cdH1cbn07KiAvXG5XcmlpdC5wcm90b3R5cGUuZm9yZWNvbG9yID0ge1xuXHRTZXR1cDogZnVuY3Rpb24gKHRvb2xiYXIpIHtcblx0XHRsZXQgdGFnID0gbmV3IFN0eWxlVGFnKCdmb3JlY29sb3InKTtcblx0XHRsZXQgcHJvcCA9IHRhZy5uZXdQcm9wZXJ0eShcImNvbG9yXCIpO1xuXHRcdHRhZy5BZGQocHJvcC5LZXlWYWx1ZSgnI0ZGMDAwMCcsJ3JlZCcpICk7XG5cdFx0XG5cdFx0bGV0IGZtdWx0aSA9IG5ldyBTdHlsZUF0dHIoJ2ZvcmVjb2xvcicsIFwic3BhblwiLCBjKTtcblx0XHRmbXVsdGkuQWRkKCdyZWQnLCBjLmFwcGx5KCcjMDBGRjAwJyksIHtcblx0XHRcdGRpc3BsYXljbGFzczogXCJmYSBmYS1mb250XCJcblx0XHR9LHRydWUpO1xuXHRcdHRvb2xiYXIuQWRkQnV0dG9uKGZtdWx0aSk7XG5cdFx0dGhpcy5DYWxsYmFjayhmbXVsdGksIHRoaXMuSW5zZXJ0KTtcblx0fVxufTtcbiovXG4kLmZuLndyaWl0ID0gZnVuY3Rpb24gKGNmZykge1xuXHQkKHRoaXMpLmVhY2goZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiBuZXcgV3JpaXQoJCh0aGlzKSwgY2ZnKTtcblx0fSk7XG59OyJdfQ==
