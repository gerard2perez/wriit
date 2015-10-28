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

},{"./wriit-tags":4}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{"./wriit-tags":4}],6:[function(require,module,exports){
/*global document,window,$,console,setInterval,Basic,Many,MultiClass,WriitStyle,regexp*/
'use strict';

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
var installedplugins = ['bold'];

//	'pasteEvent',
//	'italic',
//	'underline',
//	'strikethrough',
//	'pown',
//	'subindex',
//	'undo',
//	'redo',
//	'paragraph',
//	'forecolor'
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
Wriit.prototype.pasteEvent = {
	Setup: function Setup() {
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
	}
};
Wriit.prototype.bold = {
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
Wriit.prototype.subindex = {
	Setup: function Setup(toolbar) {
		var bt = new _wriitTags.Single("subindex", "sub", {
			tooltip: "SubIndex",
			displayclass: "fa fa-subscript"
		});
		toolbar.AddButton(bt);
		this.Callback(bt, this.Insert);
	}
};
Wriit.prototype.pown = {
	Setup: function Setup(toolbar) {
		this.Callback(toolbar.AddButton(new _wriitTags.Single("pown", "sup", {
			tooltip: "Super Index",
			displayclass: "fa fa-superscript"
		})), this.Insert);
	}
};
Wriit.prototype.italic = {
	Setup: function Setup(toolbar) {
		this.Callback(toolbar.AddButton(new _wriitTags.Single("italic", "em", {
			tooltip: "Italic",
			displayclass: "fa fa-italic"
		})), this.Insert);
	}
};
Wriit.prototype.underline = {
	Setup: function Setup(toolbar) {
		this.Callback(toolbar.AddButton(new _wriitTags.Single("underline", "u", {
			tooltip: "Underline",
			displayclass: "fa fa-underline",
			shortcut: "ALT+SHIFT+U"
		})), this.Insert);
	}
};
Wriit.prototype.strikethrough = {
	Setup: function Setup(toolbar) {
		this.Callback(toolbar.AddButton(new _wriitTags.Single("strikethrough", "del", {
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
};*/
Wriit.prototype.forecolor = {
	Setup: function Setup(toolbar) {
		var tag = new _wriitTags.StyleTag('forecolor');
		var prop = tag.newProperty("color");
		tag.Add(prop.KeyValue('#FF0000', 'red'));

		var fmulti = new _wriitTags.StyleAttr('forecolor', "span", c);
		fmulti.Add('red', c.apply('#00FF00'), {
			displayclass: "fa fa-font"
		}, true);
		toolbar.AddButton(fmulti);
		this.Callback(fmulti, this.Insert);
	}
};
$.fn.wriit = function (cfg) {
	$(this).each(function () {
		return new Wriit($(this), cfg);
	});
};

},{"./iTextArea":1,"./keyhandler":2,"./wriit-modules":3,"./wriit-tags":4,"./wriit-toolbar":5}]},{},[1,2,3,4,5,6])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvZ2VyYXJkMnAvZGV2ZWxvcG1lbnQvYmFja2VuZC93cmlpdC9zcmMvaVRleHRBcmVhLmpzIiwiL1VzZXJzL2dlcmFyZDJwL2RldmVsb3BtZW50L2JhY2tlbmQvd3JpaXQvc3JjL2tleWhhbmRsZXIuanMiLCIvVXNlcnMvZ2VyYXJkMnAvZGV2ZWxvcG1lbnQvYmFja2VuZC93cmlpdC9zcmMvd3JpaXQtbW9kdWxlcy5qcyIsIi9Vc2Vycy9nZXJhcmQycC9kZXZlbG9wbWVudC9iYWNrZW5kL3dyaWl0L3NyYy93cmlpdC10YWdzLmpzIiwiL1VzZXJzL2dlcmFyZDJwL2RldmVsb3BtZW50L2JhY2tlbmQvd3JpaXQvc3JjL3dyaWl0LXRvb2xiYXIuanMiLCIvVXNlcnMvZ2VyYXJkMnAvZGV2ZWxvcG1lbnQvYmFja2VuZC93cmlpdC9zcmMvd3JpaXQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7QUNDQSxTQUFTLFNBQVMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFO0FBQzlCLGFBQVksQ0FBQztBQUNiLEtBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLEtBQUssU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQztBQUMzRSxLQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsU0FBUyxLQUFLLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUM7QUFDM0UsS0FBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUM3QixLQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssS0FBSyxDQUFDLFdBQVcsQ0FBQyxLQUFLLENBQUMsRUFBRTtBQUN0RCxHQUFDLEdBQUcsS0FBSyxDQUFDLE9BQU8s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QUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsRUFBQyxLQUFLLENBQUMsQ0FBRSxDQUFDOztBQUV6QyxNQUFJLE1BQU0sR0FBRyx5QkFBYyxXQUFXLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ25ELFFBQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLEVBQUU7QUFDckMsZUFBWSxFQUFFLFlBQVk7R0FDMUIsRUFBQyxJQUFJLENBQUMsQ0FBQztBQUNSLFNBQU8sQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDMUIsTUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0VBQ25DO0NBQ0QsQ0FBQztBQUNGLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxHQUFHLFVBQVUsR0FBRyxFQUFFO0FBQzNCLEVBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBWTtBQUN4QixTQUFPLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQztFQUMvQixDQUFDLENBQUM7Q0FDSCxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qZ2xvYmFsICQsalF1ZXJ5Ki9cbmZ1bmN0aW9uIHRhZ2xlbmd0aChub2RlLCBmdWxsKSB7XG5cdFwidXNlIHN0cmljdFwiO1xuXHRsZXQgb3RleHQgPSBub2RlLndob2xlVGV4dCAhPT0gdW5kZWZpbmVkID8gbm9kZS53aG9sZVRleHQgOiBub2RlLm91dGVySFRNTDtcblx0bGV0IGl0ZXh0ID0gbm9kZS5pbm5lckhUTUwgIT09IHVuZGVmaW5lZCA/IG5vZGUuaW5uZXJIVE1MIDogbm9kZS5pbm5lclRleHQ7XG5cdGxldCBsID0gb3RleHQuaW5kZXhPZihpdGV4dCk7XG5cdGlmIChvdGV4dC5pbmRleE9mKGl0ZXh0KSAhPT0gb3RleHQubGFzdEluZGV4T2YoaXRleHQpKSB7XG5cdFx0bCA9IG90ZXh0LmluZGV4T2YoaXRleHQsIGl0ZXh0Lmxlbmd0aCk7XG5cdH1cblx0cmV0dXJuIGZ1bGwgPyBvdGV4dC5sZW5ndGggOiAobCA9PT0gLTEgPyBvdGV4dC5sZW5ndGggOiBsKTtcbn1cblxuZnVuY3Rpb24gZGVkZWVwKHBhcmVudCwgY29tbW9uLCBub2RlLCBvZmZzZXQpIHtcblx0XCJ1c2Ugc3RyaWN0XCI7XG5cdGxldCB0ZXh0ID0gbm9kZS53aG9sZVRleHQgIT09IHVuZGVmaW5lZCA/IG5vZGUud2hvbGVUZXh0IDogbm9kZS5vdXRlckhUTUw7XG5cdGxldCBlbmQgPSAtdGV4dC5zdWJzdHJpbmcob2Zmc2V0LCB0ZXh0Lmxlbmd0aCkubGVuZ3RoO1xuXHRkbyB7XG5cdFx0bGV0IHByZXZub2RlID0gbm9kZS5wcmV2aW91c1NpYmxpbmc7XG5cdFx0bGV0IGFsbCA9IGZhbHNlO1xuXHRcdGRvIHtcblx0XHRcdGVuZCArPSB0YWdsZW5ndGgobm9kZSwgYWxsKTtcblx0XHRcdHByZXZub2RlID0gbm9kZS5wcmV2aW91c1NpYmxpbmc7XG5cdFx0XHRhbGwgPSBwcmV2bm9kZSA/IHByZXZub2RlLm5vZGVUeXBlID09IDEgOiBmYWxzZTtcblx0XHRcdGlmIChwcmV2bm9kZSkge1xuXHRcdFx0XHRub2RlID0gcHJldm5vZGU7XG5cdFx0XHR9XG5cdFx0fSB3aGlsZSAocHJldm5vZGUgIT09IG51bGwpO1xuXHRcdGlmIChub2RlLnBhcmVudE5vZGUgIT0gcGFyZW50KSB7XG5cdFx0XHRub2RlID0gbm9kZS5wYXJlbnROb2RlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRlbmQgLT0gdGFnbGVuZ3RoKG5vZGUpO1xuXHRcdH1cblx0fSB3aGlsZSAobm9kZS5wYXJlbnROb2RlICE9IHBhcmVudCAmJiBub2RlICE9IHBhcmVudCk7XG5cdGVuZCArPSB0YWdsZW5ndGgobm9kZSk7XG5cdG5vZGUgPSBub2RlLnByZXZpb3VzU2libGluZztcblx0d2hpbGUgKG5vZGUpIHtcblx0XHRsZXQgb3RleHQgPSBub2RlLndob2xlVGV4dCAhPT0gdW5kZWZpbmVkID8gbm9kZS53aG9sZVRleHQgOiBub2RlLm91dGVySFRNTDtcblx0XHRlbmQgKz0gb3RleHQubGVuZ3RoO1xuXHRcdG5vZGUgPSBub2RlLnByZXZpb3VzU2libGluZztcblx0fVxuXHRyZXR1cm4gZW5kO1xufVxuXG5mdW5jdGlvbiB0ZXh0YXJlYShwYXJlbnQsIG9wdHMpIHtcblx0XCJ1c2Ugc3RyaWN0XCI7XG5cdHZhciBjYXJlYSA9ICQoJzxkaXYgY2xhc3M9XCJpdGV4dGFyZWEtY29yZHNcIi8+Jyk7XG5cdGlmIChvcHRzLmNvb3JkKSB7XG5cdFx0Y2FyZWEuaW5zZXJ0QWZ0ZXIocGFyZW50KTtcblx0fVxuXHQkKHBhcmVudCkuYmluZCgna2V5dXAgbW91c2V1cCcsIGZ1bmN0aW9uIChldikge1xuXHRcdGxldCBpbmkgPSB3aW5kb3cucGVyZm9ybWFuY2Uubm93KCk7XG5cdFx0dmFyIHJhbmdlcyA9IFtdO1xuXHRcdHZhciBzZWxlY3Rpb24gPSB3aW5kb3cuZ2V0U2VsZWN0aW9uKCk7XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBzZWxlY3Rpb24ucmFuZ2VDb3VudDsgaSsrKSB7XG5cdFx0XHRsZXQgcmFuZ2UgPSBzZWxlY3Rpb24uZ2V0UmFuZ2VBdChpKTtcblx0XHRcdHJhbmdlcy5wdXNoKHtcblx0XHRcdFx0c3RhcnQ6IGRlZGVlcChwYXJlbnQsIHJhbmdlLmNvbW1vbkFuY2VzdG9yQ29udGFpbmVyLCByYW5nZS5zdGFydENvbnRhaW5lciwgcmFuZ2Uuc3RhcnRPZmZzZXQpLFxuXHRcdFx0XHRlbmQ6IGRlZGVlcChwYXJlbnQsIHJhbmdlLmNvbW1vbkFuY2VzdG9yQ29udGFpbmVyLCByYW5nZS5lbmRDb250YWluZXIsIHJhbmdlLmVuZE9mZnNldCksXG5cdFx0XHRcdHJhbmc6IHJhbmdlXG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0JChwYXJlbnQpLmRhdGEoJ3JhbmcnLCByYW5nZXMpO1xuXHRcdGxldCBlbmQgPSB3aW5kb3cucGVyZm9ybWFuY2Uubm93KCk7XG5cdFx0aWYgKG9wdHMucGVyZm9ybWFjZSkge1xuXHRcdFx0Y29uc29sZS5sb2coXCJpVGV4dEFyZWEgYW5hbHlzaXM6XCIsIGVuZCAtIGluaSwgJ21zJyk7XG5cdFx0fVxuXHRcdGlmIChvcHRzLmNvb3JkKSB7XG5cdFx0XHRjYXJlYS5odG1sKHJhbmdlc1swXS5zdGFydCArIFwiLFwiICsgcmFuZ2VzWzBdLmVuZCk7XG5cdFx0fVxuXHRcdGlmIChvcHRzLmRlYnVnKSB7XG5cdFx0XHRjYXJlYS5hcHBlbmQoJzx0ZXh0YXJlYSBzdHlsZT1cIndpZHRoOjYwMHB4O2Rpc3BsYXk6YmxvY2s7XCI+JyArIHBhcmVudC5pbm5lckhUTUwuc3Vic3RyaW5nKDAsIHJhbmdlc1swXS5zdGFydCkgKyAnPC90ZXh0YXJlYT4nKTtcblx0XHRcdGNhcmVhLmFwcGVuZCgnPHRleHRhcmVhIHN0eWxlPVwid2lkdGg6NjAwcHg7ZGlzcGxheTpibG9jaztcIj4nICsgcGFyZW50LmlubmVySFRNTC5zdWJzdHJpbmcocmFuZ2VzWzBdLnN0YXJ0LCByYW5nZXNbMF0uZW5kKSArICc8L3RleHRhcmVhPicpO1xuXHRcdFx0Y2FyZWEuYXBwZW5kKCc8dGV4dGFyZWEgc3R5bGU9XCJ3aWR0aDo2MDBweDtkaXNwbGF5OmJsb2NrO1wiPicgKyBwYXJlbnQuaW5uZXJIVE1MLnN1YnN0cmluZyhyYW5nZXNbMF0uZW5kLCAkKHBhcmVudCkuaHRtbCgpLmxlbmd0aCkgKyAnPC90ZXh0YXJlYT4nKTtcblx0XHR9XG5cdH0pO1xufVxuZXhwb3J0IGRlZmF1bHQgKGZ1bmN0aW9uICgkKSB7XG5cdCQuZm4udG9UZXh0QXJlYSA9IGZ1bmN0aW9uIChjZmcpIHtcblx0XHRjZmcgPSAkLmV4dGVuZCh7fSwge1xuXHRcdFx0Y29vcmQ6IGZhbHNlLFxuXHRcdFx0cGVyZm9ybWFjZTogZmFsc2UsXG5cdFx0XHRkZWJ1ZzogZmFsc2Vcblx0XHR9LCBjZmcpO1xuXHRcdCQodGhpcykuYXR0cignY29udGVudGVkaXRhYmxlJywgdHJ1ZSk7XG5cdFx0JCh0aGlzKS5lYWNoKGZ1bmN0aW9uICgpIHtcblx0XHRcdG5ldyB0ZXh0YXJlYSh0aGlzLCBjZmcpO1xuXHRcdFx0cmV0dXJuICQodGhpcyk7XG5cdFx0fSk7XG5cdH07XG5cdCQuZm4uZ2V0U2VsZWN0aW9uID0gZnVuY3Rpb24gKG4pIHtcblx0XHRpZiAoJCh0aGlzKS5kYXRhKCdyYW5nJykpIHtcblx0XHRcdHJldHVybiAkKHRoaXMpLmRhdGEoJ3JhbmcnKVtuXTtcblx0XHR9XG5cdH07XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSgkLmZuLCBcInNlbGVjdGlvblwiLCB7XG5cdFx0Z2V0OiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gJCh0aGlzKS5kYXRhKCdyYW5nJylbMF07XG5cdFx0fVxuXHR9KTtcbn0pKGpRdWVyeSk7IiwibGV0IGtleXMgPSB7XG5cdFwiOFwiOiBcIkNBUlJZXCIsXG5cdFwiMTNcIjogXCJFTlRFUlwiLFxuXHRcIjE2XCI6IFwiU0hJRlRcIixcblx0XCIxN1wiOiBcIkNUUkxcIixcblx0XCIxOFwiOiBcIkFMVFwiLFxuXHRcIjI3XCI6IFwiRVNDXCIsXG5cdFwiMzdcIjogXCJMRUZUXCIsXG5cdFwiMzhcIjogXCJVUFwiLFxuXHRcIjM5XCI6IFwiUklHVEhcIixcblx0XCI0MFwiOiBcIkRPV05cIixcblx0XCI5MVwiOiBcIkNNRFwiXG59O1xuZm9yIChsZXQgaSA9IDExMjsgaSA8ICgxMTIgKyAxMik7IGkrKykge1xuXHRrZXlzW2kudG9TdHJpbmcoKV0gPSBcIkZcIiArIChpIC0gMTExKTtcbn1cbmxldCByb3V0ZWtleSA9IHtcblx0XCJDVFJMXCI6IFwiQ01EXCIsXG5cdFwiQ01EXCI6IFwiQ1RSTFwiXG59O1xubGV0IEtleUhhbmRsZXIgPSBmdW5jdGlvbiAoZWwsIHNldHRpbmdzKSB7XG5cdGVsLmRhdGEoJ2V2ZW50cycsIHt9KTtcblx0ZWwuYmluZChcImtleWRvd25cIiwgZnVuY3Rpb24gKGUsIHJvdXRlZGV2ZW50KSB7XG5cdFx0ZSA9IHJvdXRlZGV2ZW50IHx8IGU7XG5cdFx0bGV0IGN1cnJrZXlzID0gZWwuZGF0YSgna2V5cycpIHx8IHt9O1xuXHRcdGxldCBjdXJya2V5ID0ga2V5c1tlLndoaWNoLnRvU3RyaW5nKCldIHx8IFN0cmluZy5mcm9tQ2hhckNvZGUoZS53aGljaCkgfHwgZS53aGljaCB8fCBmYWxzZTtcblx0XHRjdXJya2V5c1tjdXJya2V5XSA9IGN1cnJrZXk7XG5cdFx0ZWwuZGF0YSgna2V5cycsIGN1cnJrZXlzKTtcblx0XHRsZXQgdHJpZ2dlciA9IFtdO1xuXHRcdGZvciAobGV0IGkgaW4gY3VycmtleXMpIHtcblx0XHRcdHRyaWdnZXIucHVzaChjdXJya2V5c1tpXSk7XG5cdFx0fVxuXHRcdHRyaWdnZXIgPSB0cmlnZ2VyLmpvaW4oJysnKTtcblx0XHR0cmlnZ2VyID0gZWwuZGF0YSgnZXZlbnRzJylbdHJpZ2dlcl07XG5cdFx0aWYgKCEhdHJpZ2dlcikge1xuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXHRcdFx0aWYgKCF0cmlnZ2VyKGUpKSB7XG5cdFx0XHRcdGUuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG5cdFx0XHRcdGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0fSkuYmluZChcImtleXVwXCIsIGZ1bmN0aW9uIChlLCByb3V0ZWRldmVudCkge1xuXHRcdGlmICghZS53aGljaCkge1xuXHRcdFx0ZWwuZGF0YSgna2V5cycsIHt9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0ZSA9IHJvdXRlZGV2ZW50IHx8IGU7XG5cdFx0XHRsZXQgY3VycmtleXMgPSBlbC5kYXRhKCdrZXlzJykgfHwgW107XG5cdFx0XHRsZXQgY3VycmtleSA9IGtleXNbZS53aGljaC50b1N0cmluZygpXSB8fCBTdHJpbmcuZnJvbUNoYXJDb2RlKGUud2hpY2gpIHx8IGUud2hpY2ggfHwgZmFsc2U7XG5cdFx0XHRkZWxldGUgY3VycmtleXNbY3VycmtleV07XG5cdFx0XHRlbC5kYXRhKCdrZXlzJywgY3VycmtleXMpO1xuXHRcdFx0c3dpdGNoKGN1cnJrZXkpe1xuXHRcdFx0XHRjYXNlIFwiQ1RSTFwiOmNhc2UgXCJDTURcIjpcblx0XHRcdFx0XHRlbC5kYXRhKCdrZXlzJywgW10pO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXG5cdFx0fVxuXHR9KS5iaW5kKCdibHVyJywgZnVuY3Rpb24gKGUpIHtcblx0XHRlbC5kYXRhKCdrZXlzJywge30pO1xuXHR9KTtcblx0cmV0dXJuIGVsO1xufTtcbmV4cG9ydCBkZWZhdWx0IChmdW5jdGlvbiAoJCkge1xuXHQkLmZuLktleUhhbmRsZXIgPSBmdW5jdGlvbiAoc2V0dGluZ3MpIHtcblx0XHRsZXQgY29uZmlnID0ge1xuXHRcdFx0RVNDOiBmYWxzZSxcblx0XHRcdEVOVEVSOiBmYWxzZVxuXHRcdH07XG5cdFx0Y29uZmlnID0gJC5leHRlbmQoe30sIGNvbmZpZywgc2V0dGluZ3MpO1xuXHRcdCQodGhpcykuZWFjaChmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gbmV3IEtleUhhbmRsZXIoJCh0aGlzKSwgc2V0dGluZ3MpO1xuXHRcdH0pO1xuXHR9O1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoJC5mbiwgXCJrZXlwcmVzc2VkXCIsIHtcblx0XHRnZXQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiAkKHRoaXMpLmRhdGEoJ2tleXMnKTtcblx0XHR9XG5cdH0pO1xuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoJC5mbiwgXCJrZXlzXCIsIHtcblx0XHRnZXQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcdGxldCB0aGF0ID0gdGhpcztcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGJpbmQ6IGZ1bmN0aW9uIChrZXlzZXF1ZW5jZSwgZm4pIHtcblx0XHRcdFx0XHRrZXlzZXF1ZW5jZSA9IGtleXNlcXVlbmNlLnRvVXBwZXJDYXNlKCk7XG5cdFx0XHRcdFx0dGhhdC5kYXRhKCdldmVudHMnKVtrZXlzZXF1ZW5jZV0gPSBmbjtcblx0XHRcdFx0XHR2YXIgY21kcyA9IGtleXNlcXVlbmNlLnNwbGl0KCcrJyk7XG5cdFx0XHRcdFx0Zm9yIChsZXQgaSBpbiBjbWRzKSB7XG5cdFx0XHRcdFx0XHRpZiAoISFyb3V0ZWtleVtjbWRzW2ldXSkge1xuXHRcdFx0XHRcdFx0XHRjbWRzW2ldID0gcm91dGVrZXlbY21kc1tpXV07XG5cdFx0XHRcdFx0XHRcdHRoYXQuZGF0YSgnZXZlbnRzJylbY21kcy5qb2luKCcrJyldID0gZm47XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdH1cblx0fSk7XG59KShqUXVlcnkpOyIsIi8qZ2xvYmFsIGRvY3VtZW50LHdpbmRvdywkLGNvbnNvbGUsc2V0SW50ZXJ2YWwsQmFzaWMsTWFueSxTaW5nbGUsTXVsdGlBdHRyLE11bHRpQ2xhc3MsV3JpaXRTdHlsZSxyZWdleHAsU3R5bGVUYWcqL1xuaW1wb3J0IHtTaW5nbGUsU3R5bGVUYWd9IGZyb20gJy4vd3JpaXQtdGFncyc7XG5mdW5jdGlvbiBtYWtlQ2hpbGRTaWJsaW5ncyhub2RlKSB7XG5cdHZhciBwYXJlbnQgPSBub2RlLnBhcmVudE5vZGU7XG5cdHdoaWxlIChub2RlLmNoaWxkTm9kZXMubGVuZ3RoID4gMCkge1xuXHRcdHBhcmVudC5pbnNlcnRCZWZvcmUobm9kZS5jaGlsZE5vZGVzWzBdLCBub2RlKTtcblx0fVxufVxubGV0IE1vZHVsZSA9IGZ1bmN0aW9uICh0aGF0KSB7XG5cdGxldCBtb2QgPSB0aGlzO1xuXHR0aGlzLlRhZz1udWxsO1xuXHR0aGlzLnZpc3VhbD1udWxsO1xuXHR0aGlzLkVkaXRvciA9IHRoYXQ7XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCBcIlNlbGVjdGlvblwiLCB7XG5cdFx0Z2V0OiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gbW9kLlRhZy5TdXBlcklkICE9PSB1bmRlZmluZWQgPyB0aGF0Lk1vZHVsZXNbbW9kLlRhZy5TdXBlcklkXSA6IHRoYXQuTW9kdWxlc1ttb2QuVGFnLklkXTtcblx0XHR9LFxuXHR9KTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIFwiVmlzdWFsXCIsIHtcblx0XHRnZXQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiB0aGF0Lmh0bWwuZ2V0U2VsZWN0aW9uKDApLnZpc3VhbDtcblx0XHR9LFxuXHR9KTtcbn07XG5Nb2R1bGUucHJvdG90eXBlID0ge1xuXHRFZGl0b3I6IHVuZGVmaW5lZCxcblx0VGVhckRvd246IHVuZGVmaW5lZCxcblx0SU1hbnk6IGZ1bmN0aW9uICh0ZXh0YXJlYSkge1xuXHRcdGxldCBzZWxlY3Rpb24gPSB0aGlzLlNlbGVjdGlvbjtcblx0XHRsZXQgdmlzdWFsID0gdGhpcy5WaXN1YWw7XG5cdFx0bGV0IG5vZGUgPSB2aXN1YWwuY29tbW9uQW5jZXN0b3JDb250YWluZXI7XG5cdFx0aWYgKG5vZGUubm9kZVR5cGUgIT09IDEpIHtcblx0XHRcdG5vZGUgPSBub2RlLnBhcmVudE5vZGU7XG5cdFx0fVxuXHRcdGlmIChzZWxlY3Rpb24uaXNTb3Jyb3VuZGVkKSB7XG5cdFx0XHRmb3IgKGxldCB0IGluIHRoaXMuVGFnLlBhcmVudC5jaGlsZHJlbikge1xuXHRcdFx0XHRsZXQgdGFnID0gdGhpcy5UYWcuUGFyZW50LmNoaWxkcmVuW3RdO1xuXHRcdFx0XHR0aGlzLkVkaXRvci5idXR0b24odGFnLklkKS5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcblx0XHRcdH1cblx0XHRcdHdoaWxlIChub2RlLnRhZ05hbWUudG9Mb3dlckNhc2UoKSAhPT0gdGhpcy5UYWcuVGFnTmFtZS50b0xvd2VyQ2FzZSgpKSB7XG5cdFx0XHRcdG5vZGUgPSBub2RlLnBhcmVudE5vZGU7XG5cdFx0XHR9XG5cdFx0XHRpZiAodGhpcy5UYWcuaXNDb21wYXRpYmxlKG5vZGUpKSB7XG5cdFx0XHRcdGZvciAobGV0IGF0dHIgaW4gdGhpcy5UYWcuQXR0cikge1xuXHRcdFx0XHRcdHRoaXMuVGFnLlVwZGF0ZUF0dHJpYnV0ZXMobm9kZSk7XG5cdFx0XHRcdFx0Ly9ub2RlLnNldEF0dHJpYnV0ZShhdHRyLCB0aGlzLlRhZy5BdHRyW2F0dHJdKTtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLkVkaXRvci5idXR0b24odGhpcy5UYWcuSWQpLmNsYXNzTGlzdC5hZGQoJ2FjdGl2ZScpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoISh0aGlzLlRhZy5QYXJlbnQgaW5zdGFuY2VvZiBNdWx0aUNsYXNzKSkge1xuXHRcdFx0bGV0IG5ld2VsID0gdGhpcy5UYWcubmV3KCk7XG5cdFx0XHRuZXdlbC5hcHBlbmRDaGlsZCh2aXN1YWwuZXh0cmFjdENvbnRlbnRzKCkpO1xuXHRcdFx0dmlzdWFsLmluc2VydE5vZGUobmV3ZWwpO1xuXHRcdFx0dGV4dGFyZWEubm9ybWFsaXplKCk7XG5cdFx0fVxuXHRcdGRvY3VtZW50LmdldFNlbGVjdGlvbigpLnJlbW92ZUFsbFJhbmdlcygpO1xuXHRcdGRvY3VtZW50LmdldFNlbGVjdGlvbigpLmFkZFJhbmdlKHZpc3VhbCk7XG5cdH0sXG5cdElTaW5nbGU6IGZ1bmN0aW9uICh0ZXh0YXJlYSkge1xuXHRcdGxldCBzZWxlY3Rpb24gPSB0aGlzLlNlbGVjdGlvbjtcblx0XHRsZXQgdmlzdWFsID0gdGhpcy5WaXN1YWw7XG5cdFx0aWYgKHZpc3VhbC5jb2xsYXBzZWQgJiYgc2VsZWN0aW9uLmlzU29ycm91bmRlZCkge1xuXHRcdFx0bGV0IG9sZG5vZGUgPSB2aXN1YWwuc3RhcnRDb250YWluZXIucGFyZW50Tm9kZTtcblx0XHRcdHdoaWxlICghdGhpcy5UYWcuaXNJbnN0YW5jZShvbGRub2RlKSkge1xuXHRcdFx0XHRvbGRub2RlID0gb2xkbm9kZS5wYXJlbnROb2RlO1xuXHRcdFx0fVxuXHRcdFx0bWFrZUNoaWxkU2libGluZ3Mob2xkbm9kZSk7XG5cdFx0XHRvbGRub2RlLnJlbW92ZSgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRsZXQgbmV3ZWwgPSB0aGlzLlRhZy5uZXcoKTtcblx0XHRcdG5ld2VsLmFwcGVuZENoaWxkKHZpc3VhbC5leHRyYWN0Q29udGVudHMoKSk7XG5cdFx0XHR2aXN1YWwuaW5zZXJ0Tm9kZShuZXdlbCk7XG5cdFx0XHRpZiAodGhpcy5UYWcuaXNJbnN0YW5jZShuZXdlbC5uZXh0U2libGluZykpIHtcblx0XHRcdFx0bGV0IHNpYmxpbmcgPSBuZXdlbC5uZXh0U2libGluZztcblx0XHRcdFx0QXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbChzaWJsaW5nLmNoaWxkTm9kZXMsIGZ1bmN0aW9uIChpbm5lcmNoaWxkKSB7XG5cdFx0XHRcdFx0bmV3ZWwuYXBwZW5kQ2hpbGQoaW5uZXJjaGlsZCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRzaWJsaW5nLnJlbW92ZSgpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHRoaXMuVGFnLmlzSW5zdGFuY2UobmV3ZWwucHJldmlvdXNTaWJsaW5nKSkge1xuXHRcdFx0XHRsZXQgc2libGluZyA9IG5ld2VsLnByZXZpb3VzU2libGluZztcblx0XHRcdFx0QXJyYXkucHJvdG90eXBlLmZvckVhY2guY2FsbChzaWJsaW5nLmNoaWxkTm9kZXMsIGZ1bmN0aW9uIChpbm5lcmNoaWxkKSB7XG5cdFx0XHRcdFx0bmV3ZWwuaW5zZXJ0QmVmb3JlKGlubmVyY2hpbGQsIG5ld2VsLmZpcnN0Q2hpbGQpO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0c2libGluZy5yZW1vdmUoKTtcblx0XHRcdH1cblx0XHRcdGlmIChzZWxlY3Rpb24uaXNDb250YWluZWQgKyBzZWxlY3Rpb24uaXNPcGVuZWQgKyBzZWxlY3Rpb24uaXNDbG9zZWQpIHtcblx0XHRcdFx0bGV0IGNsZWFubm9kZSA9IHZpc3VhbC5leHRyYWN0Q29udGVudHMoKS5maXJzdENoaWxkO1xuXHRcdFx0XHRsZXQgaW5uZXIgPSBjbGVhbm5vZGUucXVlcnlTZWxlY3RvckFsbCh0aGlzLlRhZy5UYWdOYW1lKTtcblx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBpbm5lci5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdG1ha2VDaGlsZFNpYmxpbmdzKGlubmVyW2ldKTtcblx0XHRcdFx0XHRpbm5lcltpXS5yZW1vdmUoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHR2aXN1YWwuaW5zZXJ0Tm9kZShuZXdlbCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHRleHRhcmVhLnBhcmVudE5vZGUucXVlcnlTZWxlY3RvckFsbChcIltkYXRhLXdyaWl0LWNvbW1hbmRJZD1cIiArIHRoaXMuVGFnLklkICsgXCJdXCIpWzBdLmNsYXNzTGlzdC50b2dnbGUoJ2FjdGl2ZScpO1xuXHRcdHRleHRhcmVhLm5vcm1hbGl6ZSgpO1xuXHRcdGRvY3VtZW50LmdldFNlbGVjdGlvbigpLnJlbW92ZUFsbFJhbmdlcygpO1xuXHRcdGRvY3VtZW50LmdldFNlbGVjdGlvbigpLmFkZFJhbmdlKHZpc3VhbCk7XG5cdH0sXG5cdEluc2VydDogZnVuY3Rpb24gKGUsIHRleHRhcmVhKSB7XG5cdFx0aWYgKHRoaXMuVGFnIGluc3RhbmNlb2YgU2luZ2xlKSB7XG5cdFx0XHR0aGlzLklTaW5nbGUuYXBwbHkodGhpcywgW3RleHRhcmVhXSk7XG5cdFx0fSBlbHNlIGlmICh0aGlzLlRhZyBpbnN0YW5jZW9mIE1hbnkpIHtcblx0XHRcdHRoaXMuSU1hbnkuYXBwbHkodGhpcywgW3RleHRhcmVhXSk7XG5cdFx0fVxuXHR9LFxuXHRDYWxsYmFjazogZnVuY3Rpb24gKHRhZywgZm4pIHtcblx0XHRsZXQgYXBwbHkgPSBmdW5jdGlvbiAodGFnKSB7XG5cdFx0XHRsZXQgYnV0dG9uID0gdGhpcy5FZGl0b3IuYnV0dG9uc1t0YWcuSWRdO1xuXHRcdFx0bGV0IG1vZCA9IHRoaXM7XG5cdFx0XHRidXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoZSwgcm91dGVkZXZlbnQpIHtcblx0XHRcdFx0bW9kLlRhZyA9IHRhZztcblx0XHRcdFx0dGhpcy5ldmVudCA9IHJvdXRlZGV2ZW50IHx8IGU7XG5cdFx0XHRcdGlmICh0aGlzLkJlZm9yZUZvcm1hdCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0bW9kLkJlZm9yZUZvcm1hdC5hcHBseShtb2QsIFtyb3V0ZWRldmVudCB8fCBlXSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0bGV0IHJlcyA9IGZuLmFwcGx5KG1vZCwgW3JvdXRlZGV2ZW50IHx8IGUsIG1vZC5FZGl0b3IudGV4dGFyZWEuZ2V0KDApXSk7XG5cdFx0XHRcdGlmICh0aGlzLkFmdGVyRm9ybWF0ICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHR0aGlzLkFmdGVyRm9ybWF0LmFwcGx5KG1vZCwgW3JvdXRlZGV2ZW50IHx8IGVdKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gcmVzO1xuXHRcdFx0fSk7XG5cdFx0XHRpZiAoISF0YWcuU2hvcnRjdXQpIHtcblx0XHRcdFx0dGhpcy5FZGl0b3IudGV4dGFyZWEua2V5cy5iaW5kKHRhZy5TaG9ydGN1dCwgZnVuY3Rpb24gKGUpIHtcblx0XHRcdFx0XHQkKGJ1dHRvbikudHJpZ2dlcignY2xpY2snLCBlKTtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0aWYgKHRhZyBpbnN0YW5jZW9mIFNpbmdsZSkge1xuXHRcdFx0YXBwbHkuYXBwbHkodGhpcywgW3RhZ10pO1xuXHRcdH0gZWxzZSBpZiAodGFnIGluc3RhbmNlb2YgTXVsdGlDbGFzcykge1xuXHRcdFx0Zm9yIChsZXQgaSBpbiB0YWcuY2hpbGRyZW4pIHtcblx0XHRcdFx0YXBwbHkuYXBwbHkodGhpcywgW3RhZy5jaGlsZHJlbltpXV0pO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAodGFnIGluc3RhbmNlb2YgTXVsdGlBdHRyKSB7XG5cdFx0XHRmb3IgKGxldCBpIGluIHRhZy5jaGlsZHJlbikge1xuXHRcdFx0XHRhcHBseS5hcHBseSh0aGlzLCBbdGFnLmNoaWxkcmVuW2ldXSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdH0sXG5cdEJlZm9yZUZvcm1hdDogdW5kZWZpbmVkLFxuXHRBZnRlckZvcm1hdDogdW5kZWZpbmVkLFxuXHRTZXR1cDogdW5kZWZpbmVkXG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1vZHVsZSwgJ0lNYW55Jywge1xuXHR3cml0YWJsZTogZmFsc2UsXG5cdGVudW1lcmFibGU6IGZhbHNlXG59KTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShNb2R1bGUsICdJbnNlcnQnLCB7XG5cdHdyaXRhYmxlOiBmYWxzZSxcblx0ZW51bWVyYWJsZTogZmFsc2Vcbn0pO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KE1vZHVsZSwgJ0lTaW5nbGUnLCB7XG5cdHdyaXRhYmxlOiBmYWxzZSxcblx0ZW51bWVyYWJsZTogZmFsc2Vcbn0pO1xuZXhwb3J0IGRlZmF1bHQgTW9kdWxlOyIsIi8qZ2xvYmFsIGRvY3VtZW50Ki9cbi8qIGpzaGludCAtVzA5NyAqL1xuXCJ1c2Ugc3RyaWN0XCI7XG5cbmZ1bmN0aW9uIEJhc2VBdHRyKGF0dHIsIHZhbHVlKSB7XG5cdHRoaXMuYXR0ciA9IGF0dHI7XG5cdHRoaXMudmFsdWUgPSB2YWx1ZTtcbn1cblxuZXhwb3J0IGNsYXNzIENsYXNzQXR0ciB7XG5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFN0eWxlQXR0cihhdHRyLCB2YWx1ZSkge1xuXHRCYXNlQXR0ci5jYWxsKHRoaXMsIGF0dHIsIHZhbHVlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIEdlbmVyYWxBdHRyKGF0dHIsIHZhbHVlKSB7XG5cdEJhc2VBdHRyLmNhbGwodGhpcywgYXR0ciwgdmFsdWUpO1xufVxuU3R5bGVBdHRyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFzZUF0dHIucHJvdG90eXBlKTtcbkdlbmVyYWxBdHRyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFzZUF0dHIucHJvdG90eXBlKTtcblxuZnVuY3Rpb24gQmFzZVRhZyhpZCwgdGFnLCBhdHRyaWJ1dGVzLCBibG93KSB7XG5cdHRoaXMuTWltZSA9IGJsb3cgPT09IHRydWU7XG5cdGF0dHJpYnV0ZXMgPSBhdHRyaWJ1dGVzIHx8IHt9O1xuXHR0aGlzLklkID0gaWQ7XG5cdHRoaXMuU3VwZXJJZCA9IG51bGw7XG5cdHRoaXMuUGFyZW50ID0gbnVsbDtcblx0dGhpcy5UYWdOYW1lID0gdGFnO1xuXHR0aGlzLlNob3J0Y3V0ID0gYXR0cmlidXRlcy5zaG9ydGN1dCB8fCBudWxsO1xuXHRkZWxldGUgYXR0cmlidXRlcy5zaG9ydGN1dDtcblx0dGhpcy5Ub29sVGlwID0gYXR0cmlidXRlcy50b29sdGlwIHx8IG51bGw7XG5cdGRlbGV0ZSBhdHRyaWJ1dGVzLnRvb2x0aXA7XG5cdHRoaXMuRGlzcGxheUNsYXNzID0gYXR0cmlidXRlcy5kaXNwbGF5Y2xhc3MgfHwgbnVsbDtcblx0ZGVsZXRlIGF0dHJpYnV0ZXMuZGlzcGxheWNsYXNzO1xuXHR0aGlzLkF0dHIgPSBhdHRyaWJ1dGVzO1xuXG59XG5CYXNlVGFnLnByb3RvdHlwZS5BdHRyTWF0Y2ggPSBmdW5jdGlvbiAoYXR0ciwgdmFsdWUpIHtcblx0cmV0dXJuIHRoaXMuQXR0clthdHRyXSA9PT0gdmFsdWU7XG59O1xuXG5CYXNlVGFnLnByb3RvdHlwZS5pc0luc3RhbmNlID0gZnVuY3Rpb24gKGh0bWxub2RlKSB7XG5cdGlmIChodG1sbm9kZS5ub2RlVHlwZSAhPT0gMSkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXHRpZiAoaHRtbG5vZGUudGFnTmFtZS50b0xvd2VyQ2FzZSgpICE9PSB0aGlzLlRhZ05hbWUudG9Mb3dlckNhc2UoKSkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXHRmb3IgKGxldCBhdHRyIGluIHRoaXMuQXR0cikge1xuXHRcdGxldCBhdHJpYnV0ZSA9IHRoaXMuQXR0clthdHRyXTtcblx0XHRpZiAoYXRyaWJ1dGUgaW5zdGFuY2VvZiBTdHlsZUF0dHIpIHtcblx0XHRcdGlmIChodG1sbm9kZS5zdHlsZVthdHJpYnV0ZS5hdHRyXSA9PT0gXCJcIikge1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmIChhdHJpYnV0ZSBpbnN0YW5jZW9mIEdlbmVyYWxBdHRyKSB7XG5cdFx0XHRpZiAoaHRtbG5vZGUuYXR0cmlidXRlc1thdHRyXS52YWx1ZSAhPT0gdGhpcy5BdHRyW2F0dHJdKSByZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHR9XG5cdHJldHVybiB0cnVlO1xufTtcbkJhc2VUYWcucHJvdG90eXBlLm5ldyA9IGZ1bmN0aW9uICgpIHtcblx0bGV0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0aGlzLlRhZ05hbWUpO1xuXHR0aGlzLlVwZGF0ZUF0dHJpYnV0ZXMoZWwpO1xuXHRyZXR1cm4gZWw7XG59O1xuQmFzZVRhZy5wcm90b3R5cGUuVXBkYXRlQXR0cmlidXRlcyA9IGZ1bmN0aW9uIChub2RlKSB7XG5cdGZvciAobGV0IGF0dHIgaW4gdGhpcy5BdHRyKSB7XG5cdFx0bGV0IGF0cmlidXRlID0gdGhpcy5BdHRyW2F0dHJdO1xuXHRcdGlmIChhdHJpYnV0ZSBpbnN0YW5jZW9mIFN0eWxlQXR0cikge1xuXHRcdFx0bm9kZS5zdHlsZVthdHJpYnV0ZS5hdHRyXSA9IGF0cmlidXRlLnZhbHVlO1xuXHRcdH0gZWxzZSBpZiAoYXRyaWJ1dGUgaW5zdGFuY2VvZiBHZW5lcmFsQXR0cikge1xuXHRcdFx0bm9kZS5zZXRBdHRyaWJ1dGUoYXR0ciwgdGhpcy5BdHRyW2F0dHJdKTtcblx0XHR9XG5cdH1cbn07XG5CYXNlVGFnLnByb3RvdHlwZS5BdHRyTWF0Y2ggPSBmdW5jdGlvbiAoYXR0ciwgdmFsdWUpIHtcblx0cmV0dXJuIHRoaXMuQXR0clthdHRyXSA9PT0gdmFsdWU7XG59O1xuQmFzZVRhZy5wcm90b3R5cGUuaXNDb21wYXRpYmxlID0gZnVuY3Rpb24gKGh0bWxub2RlKSB7XG5cdGlmIChodG1sbm9kZS5ub2RlVHlwZSAhPT0gMSB8fCBodG1sbm9kZS50YWdOYW1lLnRvTG93ZXJDYXNlKCkgIT09IHRoaXMuVGFnTmFtZS50b0xvd2VyQ2FzZSgpKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cdHJldHVybiB0cnVlO1xufTtcblxuLypleHBvcnQgZnVuY3Rpb24gU3R5bGVUYWcoaWQpIHtcblx0QmFzZVRhZy5jYWxsKHRoaXMsIGlkLFwic3BhblwiLG51bGwsdHJ1ZSk7XG59Ki9cblxuY2xhc3MgQmFzZSB7XG5cdGNvbnN0cnVjdG9yKGlkLCB0YWcsIGF0dHJpYnV0ZXMsIGhpZ2hsaWdodCkge1xuXHRcdHRoaXMuSWQgPSBpZDtcblx0XHR0aGlzLmhpZ2hsaWdodCA9IHRydWU7XG5cdFx0dGhpcy5UYWdOYW1lID0gdGFnO1xuXHRcdHRoaXMuQXR0cmlidXRlcyA9IFtdO1xuXHRcdHRoaXMuU2hvcnRjdXQgPSBhdHRyaWJ1dGVzLnNob3J0Y3V0IHx8IG51bGw7XG5cdFx0dGhpcy5Ub29sVGlwID0gYXR0cmlidXRlcy50b29sdGlwIHx8IG51bGw7XG5cdFx0dGhpcy5JY29uQ2xhc3MgPSBhdHRyaWJ1dGVzLmljb25jbGFzcyB8fCBudWxsO1xuXHR9XG5cdGlzQ29tcGF0aWJsZShodG1sbm9kZSkge1xuXHRcdGlmIChodG1sbm9kZS5ub2RlVHlwZSAhPT0gMSB8fCBodG1sbm9kZS50YWdOYW1lLnRvTG93ZXJDYXNlKCkgIT09IHRoaXMuVGFnTmFtZS50b0xvd2VyQ2FzZSgpKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cdGlzSW5zdGFuY2UoaHRtbG5vZGUpIHtcblx0XHRpZiAoIXRoaXMuaXNDb21wYXRpYmxlKGh0bWxub2RlKSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRmb3IgKGxldCBhdHRyIGluIHRoaXMuQXR0cikge1xuXHRcdFx0bGV0IGF0cmlidXRlID0gdGhpcy5BdHRyW2F0dHJdO1xuXHRcdFx0aWYgKGF0cmlidXRlIGluc3RhbmNlb2YgU3R5bGVBdHRyKSB7XG5cdFx0XHRcdGlmIChodG1sbm9kZS5zdHlsZVthdHJpYnV0ZS5hdHRyXSA9PT0gXCJcIikge1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmIChhdHJpYnV0ZSBpbnN0YW5jZW9mIEdlbmVyYWxBdHRyKSB7XG5cdFx0XHRcdGlmIChodG1sbm9kZS5hdHRyaWJ1dGVzW2F0dHJdLnZhbHVlICE9PSB0aGlzLkF0dHJbYXR0cl0pIHJldHVybiBmYWxzZTtcblx0XHRcdH0gZWxzZSBpZiAoYXRyaWJ1dGUgaW5zdGFuY2VvZiBDbGFzc0F0dHIpIHtcblx0XHRcdFx0aWYgKGh0bWxub2RlLmNsYXNzTGlzdCkge1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXHRuZXcoKSB7XG5cdFx0bGV0IGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCh0aGlzLlRhZ05hbWUpO1xuXHRcdC8vdGhpcy5VcGRhdGVBdHRyaWJ1dGVzKGVsKTtcblx0XHRyZXR1cm4gZWw7XG5cdH1cbn1cbmNsYXNzIEF0dHJHZW5lcmF0b3Ige1xuXHRjb25zdHJ1Y3RvcihnZW4sIHByb3BlcnR5KSB7XG5cdFx0dGhpcy5nZW4gPSBnZW47XG5cdFx0dGhpcy5wcm9wZXJ0eSA9IHByb3BlcnR5O1xuXHR9XG5cdEtleVZhbHVlKHZhbHVlLCBsYWJlbCkge1xuXHRcdHJldHVybiBuZXcgdGhpcy5nZW4odGhpcy5wcm9wZXJ0eSwgdmFsdWUpO1xuXHR9XG59XG5cbmV4cG9ydCBjbGFzcyBTdHlsZVRhZyBleHRlbmRzIEJhc2Uge1xuXHRjb25zdHJ1Y3RvciguLi5hcmdzKSB7XG5cdFx0c3VwZXIoLi4uYXJncyk7XG5cdH1cblx0bmV3UHJvcGVydHkocHJvcGVydHkpIHtcblx0XHRyZXR1cm4gbmV3IEF0dHJHZW5lcmF0b3IoU3R5bGVBdHRyLCBwcm9wZXJ0eSk7XG5cdH1cblx0QWRkKGF0dHJpYnV0ZSkge1xuXHRcdHRoaXMuQXR0cmlidXRlc1thdHRyaWJ1dGUuYXR0cl0gPSBhdHRyaWJ1dGU7XG5cdH1cbn1cbmV4cG9ydCBjbGFzcyBTaW5nbGUgZXh0ZW5kcyBCYXNlIHtcblx0Y29uc3RydWN0b3IoaWQsIHRhZywgb3B0aW9ucykge1xuXHRcdHN1cGVyKGlkLCB0YWcsIG9wdGlvbnMsIGZhbHNlKTtcblx0fVxufVxuXG4vKlxuZnVuY3Rpb24gV3JpaXRBdHRyKGF0dHIpIHtcblx0dGhpcy5hdHRyID0gYXR0cjtcbn1cbmZ1bmN0aW9uIEFwcGx5QXR0cih2YWx1ZSkge1xuXHR0aGlzLnZhbHVlID0gdmFsdWU7XG5cdHJldHVybiB0aGlzO1xufVxuZnVuY3Rpb24gV3JpaXRTdHlsZShhdHRyKSB7XG5cdHRoaXMuYXR0ciA9IGF0dHI7XG59XG5cbldyaWl0QXR0ci5wcm90b3R5cGUuYXBwbHkgPSBmdW5jdGlvbiAodmFsdWUpIHtcblx0cmV0dXJuIG5ldyBHZW5lcmFsQXR0cih0aGlzLmF0dHIsIHZhbHVlKTtcbn07XG5XcmlpdFN0eWxlLnByb3RvdHlwZS5hcHBseSA9IGZ1bmN0aW9uICh2YWx1ZSkge1xuXHRyZXR1cm4gbmV3IFN0eWxlQXR0cih0aGlzLmF0dHIsIHZhbHVlKTtcbn07XG5PYmplY3QuZnJlZXplKFdyaWl0QXR0cik7XG5PYmplY3QuZnJlZXplKFdyaWl0U3R5bGUpO1xuXG5cblxuXG5mdW5jdGlvbiBCYXNpYyhpZCwgdGFnLCBhdHRyaWJ1dGVzLGJsb3cpIHtcblx0dGhpcy5NaW1lID0gYmxvdyA9PT0gdHJ1ZTtcblx0YXR0cmlidXRlcyA9IGF0dHJpYnV0ZXMgfHwge307XG5cdHRoaXMuSWQgPSBpZDtcblx0dGhpcy5TdXBlcklkID0gbnVsbDtcblx0dGhpcy5QYXJlbnQgPSBudWxsO1xuXHR0aGlzLlRhZ05hbWUgPSB0YWc7XG5cdHRoaXMuU2hvcnRjdXQgPSBhdHRyaWJ1dGVzLnNob3J0Y3V0IHx8IG51bGw7XG5cdGRlbGV0ZSBhdHRyaWJ1dGVzW1wic2hvcnRjdXRcIl07XG5cdHRoaXMuVG9vbFRpcCA9IGF0dHJpYnV0ZXMudG9vbHRpcCB8fCBudWxsO1xuXHRkZWxldGUgYXR0cmlidXRlc1tcInRvb2x0aXBcIl07XG5cdHRoaXMuRGlzcGxheUNsYXNzID0gYXR0cmlidXRlcy5kaXNwbGF5Y2xhc3MgfHwgbnVsbDtcblx0ZGVsZXRlIGF0dHJpYnV0ZXNbXCJkaXNwbGF5Y2xhc3NcIl07XG5cdHRoaXMuQXR0ciA9IGF0dHJpYnV0ZXM7XG5cdHRoaXMuQXR0ck1hdGNoID0gZnVuY3Rpb24gKGF0dHIsIHZhbHVlKSB7XG5cdFx0cmV0dXJuIHRoaXMuQXR0clthdHRyXSA9PT0gdmFsdWU7XG5cdH1cblx0dGhpcy5pc0luc3RhbmNlID0gZnVuY3Rpb24gKGh0bWxub2RlKSB7XG5cdFx0aWYgKGh0bWxub2RlLm5vZGVUeXBlICE9IDEpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0aWYgKGh0bWxub2RlLnRhZ05hbWUudG9Mb3dlckNhc2UoKSAhPSB0aGlzLlRhZ05hbWUudG9Mb3dlckNhc2UoKSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRmb3IgKGxldCBhdHRyIGluIHRoaXMuQXR0cikge1xuXHRcdFx0bGV0IGF0cmlidXRlID0gdGhpcy5BdHRyW2F0dHJdO1xuXHRcdFx0aWYgKGF0cmlidXRlIGluc3RhbmNlb2YgU3R5bGVBdHRyKSB7XG5cdFx0XHRcdGlmKGh0bWxub2RlLnN0eWxlW2F0cmlidXRlLmF0dHJdPT1cIlwiKXtyZXR1cm4gZmFsc2U7fVxuXHRcdFx0fSBlbHNlIGlmIChhdHJpYnV0ZSBpbnN0YW5jZW9mIEdlbmVyYWxBdHRyKSB7XG5cdFx0XHRcdGlmIChodG1sbm9kZS5hdHRyaWJ1dGVzW3Byb3BdLnZhbHVlICE9IHRoaXMuQXR0cltwcm9wXSkgcmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXHR0aGlzLm5ldyA9IGZ1bmN0aW9uICgpIHtcblx0XHRsZXQgZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KHRoaXMuVGFnTmFtZSk7XG5cdFx0dGhpcy5VcGRhdGVBdHRyaWJ1dGVzKGVsKTtcblx0XHRyZXR1cm4gZWw7XG5cdH1cblx0dGhpcy5VcGRhdGVBdHRyaWJ1dGVzID0gZnVuY3Rpb24gKG5vZGUpIHtcblx0XHRmb3IgKGxldCBhdHRyIGluIHRoaXMuQXR0cikge1xuXHRcdFx0bGV0IGF0cmlidXRlID0gdGhpcy5BdHRyW2F0dHJdO1xuXHRcdFx0aWYgKGF0cmlidXRlIGluc3RhbmNlb2YgU3R5bGVBdHRyKSB7XG5cdFx0XHRcdG5vZGUuc3R5bGVbYXRyaWJ1dGUuYXR0cl09YXRyaWJ1dGUudmFsdWU7XG5cdFx0XHR9IGVsc2UgaWYgKGF0cmlidXRlIGluc3RhbmNlb2YgR2VuZXJhbEF0dHIpIHtcblx0XHRcdFx0bm9kZS5zZXRBdHRyaWJ1dGUoYXR0ciwgdGhpcy5BdHRyW2F0dHJdKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gTWFueShpZCwgdGFnLCBhdHRyaWJ1dGVzLCBibG93KSB7XG5cdHRoaXMuaXNDb21wYXRpYmxlID0gZnVuY3Rpb24gKG5vZGUpIHtcblx0XHRpZiAobm9kZS5ub2RlVHlwZSAhPSAxKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdGlmIChub2RlLnRhZ05hbWUudG9Mb3dlckNhc2UoKSAhPSB0aGlzLlRhZ05hbWUudG9Mb3dlckNhc2UoKSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fTtcblx0QmFzaWMuY2FsbCh0aGlzLCBpZCwgdGFnLCBhdHRyaWJ1dGVzLGJsb3cpO1xuXHQvL1x0T2JqZWN0LmZyZWV6ZSh0aGlzKTtcbn1cbmZ1bmN0aW9uIE11bHRpQXR0cihpZCwgdGFnKSB7XG5cdHRoaXMuSWQgPSBpZDtcblx0dGhpcy5UYWdOYW1lID0gdGFnO1xuXHR0aGlzLmNoaWxkcmVuID0ge307XG5cdHRoaXMuRmluZEJ5Q2xhc3MgPSBmdW5jdGlvbiAoY2xhc3NuYW1lKSB7XG5cdFx0Zm9yIChsZXQgY2hpbGQgaW4gdGhpcy5jaGlsZHJlbikge1xuXHRcdFx0aWYgKHRoaXMuY2hpbGRyZW5bY2hpbGRdLkF0dHJNYXRjaChcImNsYXNzXCIsIGNsYXNzbmFtZSkpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuY2hpbGRyZW5bY2hpbGRdO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHR0aGlzLkFkZCA9IGZ1bmN0aW9uIChzdWJpZCwgdmFsdWUsIGF0dHJpYnV0ZXMsbWltZSkge1xuXHRcdGF0dHJpYnV0ZXMgPSBhdHRyaWJ1dGVzIHx8IHt9O1xuXHRcdGF0dHJpYnV0ZXNbdmFsdWUuYXR0cl0gPSB2YWx1ZTtcblx0XHR0aGlzLmNoaWxkcmVuW3N1YmlkXSA9IG5ldyBNYW55KHRoaXMuSWQgKyBcIl9cIiArIHN1YmlkLCB0aGlzLlRhZ05hbWUsIGF0dHJpYnV0ZXMsIG1pbWUpO1xuXHRcdHRoaXMuY2hpbGRyZW5bc3ViaWRdLlN1cGVySWQgPSB0aGlzLklkO1xuXHRcdHRoaXMuY2hpbGRyZW5bc3ViaWRdLlBhcmVudCA9IHRoaXM7XG5cdFx0T2JqZWN0LmZyZWV6ZSh0aGlzLmNoaWxkcmVuW3N1YmlkXSk7XG5cdH1cblx0dGhpcy5SZW1vdmUgPSBmdW5jdGlvbiAoY2xhc25hbWUpIHtcblx0XHRkZWxldGUgdGhpcy5jaGlsZHJlbltzdWJpZF07XG5cdH07XG59XG5mdW5jdGlvbiBNdWx0aUNsYXNzKGlkLCB0YWcpIHtcblx0dGhpcy5JZCA9IGlkO1xuXHR0aGlzLlRhZ05hbWUgPSB0YWc7XG5cdHRoaXMuY2hpbGRyZW4gPSB7fTtcblx0dGhpcy5GaW5kQnlDbGFzcyA9IGZ1bmN0aW9uIChjbGFzc25hbWUpIHtcblx0XHRmb3IgKGxldCBjaGlsZCBpbiB0aGlzLmNoaWxkcmVuKSB7XG5cdFx0XHRpZiAodGhpcy5jaGlsZHJlbltjaGlsZF0uQXR0ck1hdGNoKFwiY2xhc3NcIiwgY2xhc3NuYW1lKSkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5jaGlsZHJlbltjaGlsZF07XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHRoaXMuQWRkID0gZnVuY3Rpb24gKHN1YmlkLCBjbGFzc25hbWUsIGF0dHJpYnV0ZXMpIHtcblx0XHRhdHRyaWJ1dGVzID0gYXR0cmlidXRlcyB8fCB7fTtcblx0XHRhdHRyaWJ1dGVzLmNsYXNzID0gY2xhc3NuYW1lO1xuXHRcdHRoaXMuY2hpbGRyZW5bc3ViaWRdID0gbmV3IE1hbnkodGhpcy5JZCArIFwiX1wiICsgc3ViaWQsIHRoaXMuVGFnTmFtZSwgYXR0cmlidXRlcywgXCJjbGFzc1wiKTtcblx0XHR0aGlzLmNoaWxkcmVuW3N1YmlkXS5TdXBlcklkID0gdGhpcy5JZDtcblx0XHR0aGlzLmNoaWxkcmVuW3N1YmlkXS5QYXJlbnQgPSB0aGlzO1xuXHRcdE9iamVjdC5mcmVlemUodGhpcy5jaGlsZHJlbltzdWJpZF0pO1xuXHR9XG5cdHRoaXMuUmVtb3ZlID0gZnVuY3Rpb24gKGNsYXNuYW1lKSB7XG5cdFx0ZGVsZXRlIHRoaXMuY2hpbGRyZW5bc3ViaWRdO1xuXHR9XG59XG5cblxuLy89PT09PT09PT09PT09PUV4cGVyaW1lbnRhbFxuZnVuY3Rpb24gTXVsdGlTdHlsZShpZCwgdGFnKSB7XG5cdHRoaXMuSWQgPSBpZDtcblx0dGhpcy5UYWdOYW1lID0gdGFnO1xuXHR0aGlzLmNoaWxkcmVuID0ge307XG5cdHRoaXMuRmluZEJ5Q2xhc3MgPSBmdW5jdGlvbiAoY2xhc3NuYW1lKSB7XG5cdFx0Zm9yIChsZXQgY2hpbGQgaW4gdGhpcy5jaGlsZHJlbikge1xuXHRcdFx0aWYgKHRoaXMuY2hpbGRyZW5bY2hpbGRdLkF0dHJNYXRjaChcImNsYXNzXCIsIGNsYXNzbmFtZSkpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuY2hpbGRyZW5bY2hpbGRdO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHR0aGlzLkFkZCA9IGZ1bmN0aW9uIChzdWJpZCwgdmFsdWUsIGF0dHJpYnV0ZXMsbWltZSkge1xuXHRcdGF0dHJpYnV0ZXMgPSBhdHRyaWJ1dGVzIHx8IHt9O1xuXHRcdGF0dHJpYnV0ZXNbdmFsdWUuYXR0cl0gPSB2YWx1ZTtcblx0XHR0aGlzLmNoaWxkcmVuW3N1YmlkXSA9IG5ldyBNYW55KHRoaXMuSWQgKyBcIl9cIiArIHN1YmlkLCB0aGlzLlRhZ05hbWUsIGF0dHJpYnV0ZXMsIG1pbWUpO1xuXHRcdHRoaXMuY2hpbGRyZW5bc3ViaWRdLlN1cGVySWQgPSB0aGlzLklkO1xuXHRcdHRoaXMuY2hpbGRyZW5bc3ViaWRdLlBhcmVudCA9IHRoaXM7XG5cdFx0T2JqZWN0LmZyZWV6ZSh0aGlzLmNoaWxkcmVuW3N1YmlkXSk7XG5cdH1cblx0dGhpcy5SZW1vdmUgPSBmdW5jdGlvbiAoc3ViaWQpIHtcblx0XHRkZWxldGUgdGhpcy5jaGlsZHJlbltzdWJpZF07XG5cdH07XG59XG5cblNpbmdsZS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEJhc2ljLnByb3RvdHlwZSk7XG5NYW55LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoQmFzaWMucHJvdG90eXBlKTtcbk9iamVjdC5mcmVlemUoU2luZ2xlKTtcbk9iamVjdC5mcmVlemUoTWFueSk7XG4qLyIsImltcG9ydCB7U2luZ2xlLFN0eWxlVGFnfSBmcm9tICcuL3dyaWl0LXRhZ3MnO1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiAodGhhdCkge1xuXHRsZXQgYWRkID0gZnVuY3Rpb24gKGJ1dHRvbikge1xuXHRcdGxldCBuZXdCID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG5cdFx0bmV3Qi5zZXRBdHRyaWJ1dGUoXCJkYXRhLXdyaWl0LWNvbW1hbmRJZFwiLCBidXR0b24uSWQpO1xuXHRcdG5ld0Iuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgYnV0dG9uLkljb25DbGFzcyk7XG5cdFx0XG5cdFx0aWYoIGJ1dHRvbi5Ub29sVGlwICE9PSBudWxsKXtcblx0XHRcdGxldCBzcGFuID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuXHRcdFx0c3Bhbi5pbm5lckhUTUwgPSBidXR0b24uVG9vbFRpcDtcblx0XHRcdG5ld0IuYXBwZW5kQ2hpbGQoc3Bhbik7XG5cdFx0fVxuXHRcdFxuXHRcdHRoYXQuYnV0dG9uc1tidXR0b24uSWRdID0gbmV3Qjtcblx0XHR0aGF0LnRhZ3NbYnV0dG9uLklkXSA9IGJ1dHRvbjtcblx0XHR0aGF0Lm1lbnUuYXBwZW5kKG5ld0IpO1xuXHRcdHJldHVybiBidXR0b24uSWQ7XG5cdH07XG5cdHRoaXMuQWRkQnV0dG9uID0gZnVuY3Rpb24gKHRhZykge1xuXHRcdGlmICh0YWcgaW5zdGFuY2VvZiBTaW5nbGUpIHtcblx0XHRcdGFkZCh0YWcpO1xuXHRcdC8qfSBlbHNlIGlmIChidXR0b24gaW5zdGFuY2VvZiBNdWx0aUNsYXNzKSB7XG5cdFx0XHRmb3IgKGxldCBwcm9wIGluIGJ1dHRvbi5jaGlsZHJlbikge1xuXHRcdFx0XHRhZGQoYnV0dG9uLmNoaWxkcmVuW3Byb3BdKTtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKGJ1dHRvbiBpbnN0YW5jZW9mIE11bHRpQXR0cikge1xuXHRcdFx0Zm9yIChsZXQgcHJvcCBpbiBidXR0b24uY2hpbGRyZW4pIHtcblx0XHRcdFx0YWRkKGJ1dHRvbi5jaGlsZHJlbltwcm9wXSk7XG5cdFx0XHR9XG5cdFx0fSovXG5cdFx0fWVsc2UgaWYodGFnIGluc3RhbmNlb2YgU3R5bGVUYWcpe1xuXHRcdFx0XG5cdFx0fVxuXHRcdC8vcmV0dXJuIGJ1dHRvbjtcblx0fTtcblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdBZGRCdXR0b24nLCB7XG5cdFx0d3JpdGFibGU6IGZhbHNlLFxuXHRcdGVudW1lcmFibGU6IHRydWUsXG5cdFx0Y29uZmlndXJhYmxlOiB0cnVlXG5cdH0pO1xufSIsIi8qZ2xvYmFsIGRvY3VtZW50LHdpbmRvdywkLGNvbnNvbGUsc2V0SW50ZXJ2YWwsQmFzaWMsTWFueSxNdWx0aUNsYXNzLFdyaWl0U3R5bGUscmVnZXhwKi9cbmltcG9ydCBNb2R1bGUgZnJvbSAnLi93cmlpdC1tb2R1bGVzJztcbmltcG9ydCB7U2luZ2xlLFN0eWxlVGFnLFN0eWxlQXR0cn0gZnJvbSAnLi93cmlpdC10YWdzJztcbmltcG9ydCBUb29sYmFyIGZyb20gJy4vd3JpaXQtdG9vbGJhcic7XG5pbXBvcnQgaVRleHRBcmVhIGZyb20gJy4vaVRleHRBcmVhJztcbmltcG9ydCBLZXlIYW5kbGVyIGZyb20gJy4va2V5aGFuZGxlcic7XG5cbnZhciBHUEVHdWkgPSB7XG5cdGVuZ2luZToge1xuXHRcdG1pY3JvOiAxLFxuXHRcdG1pbmk6IDIsXG5cdFx0bm9ybWFsOiAzLFxuXHRcdGV4dGVuZGVkOiA0XG5cdH0sXG5cdHZpc3VhbDoge1xuXHRcdG9uc2VsZWN0aW9uOiAxLFxuXHRcdGFsd2F5czogMixcblx0XHRhbHRlcm5hdGU6IDNcblx0fVxufTtcbnZhciBHUEVUYWdzID0ge1xuXHRjb21tYW5kOiAwLFxuXHRzcGFuOiAxLFxuXHRpZDogMixcblx0dGFnOiAzLFxuXHRwYXJhZ3JhcGg6IDEwLFxuXHRtdWx0aVNwYW46IDExLFxuXHRtdWx0aUNsYXNzOiAxMixcblx0bXVsdGlOYW1lOiAxMyxcblx0b25seUluc2VydDogMjEsXG5cdG11bHRpT25seUluc2VydDogMzEsXG5cdGxpc3Q6IDUxXG59O1xuLy8xLTEwIEFwZXJ0dXJhIHkgQ2llcnJlXG4vLzExLTIwIEFwZXJ0dXJhIHkgQ2llcnJlLCBNw7psdGlwbGVzIFZhbG9yZXNcbi8vMjEtMzAgQXBlcnR1cmFcbi8vMzEtNDAgQXBlcnR1cmEsIE3Dumx0aXBsZXMgVmFsb3Jlc1xuLy81MS14eHggVG9kYXMgbGFzIGRlbcOhcyhEZWZpbmlyIEluZGVwZW5kaWVudGVtZW50ZSlcbmZ1bmN0aW9uIE1hdGNoTlQodGV4dCwgdGFnKSB7XG5cdGxldCB4ID0gdGV4dC5tYXRjaCh0YWcpO1xuXHRyZXR1cm4geCA/IHgubGVuZ3RoIDogMDtcbn1cbmZ1bmN0aW9uIGZpbmROVCh0eHQsIHRhZykge1xuXHR2YXIgc28gPSByZWdleHAoXCJbX19UYWdfX11cIik7XG5cdHZhciB4ID0gdHh0LnJlcGxhY2UocmVnZXhwKHRhZywgXCJnXCIpLCBcIltfX1RhZ19fXVwiKTtcblx0eCA9IHgubWF0Y2goc28pO1xuXHRyZXR1cm4geCA/IHgubGVuZ3RoIDogMDtcbn1cblxuZnVuY3Rpb24gc3RyX3JlcGxhY2Uoc2VhcmNoLCByZXBsYWNlLCBzdWJqZWN0KSB7XG5cdHZhciBzID0gc3ViamVjdDtcblx0dmFyIHJhID0gciBpbnN0YW5jZW9mIEFycmF5LFxuXHRcdHNhID0gcyBpbnN0YW5jZW9mIEFycmF5LFxuXHRcdGYgPSBbXS5jb25jYXQoc2VhcmNoKSxcblx0XHRyID0gW10uY29uY2F0KHJlcGxhY2UpLFxuXHRcdGkgPSAocyA9IFtdLmNvbmNhdChzKSkubGVuZ3RoLFxuXHRcdGogPSAwO1xuXG5cdHdoaWxlIChqID0gMCwgaS0tKSB7XG5cdFx0aWYgKHNbaV0pIHtcblx0XHRcdHdoaWxlIChzW2ldID0gKHNbaV0gKyAnJykuc3BsaXQoZltqXSkuam9pbihyYSA/IHJbal0gfHwgXCJcIiA6IHJbMF0pLCArK2ogaW4gZikge31cblx0XHR9XG5cdH1cblx0cmV0dXJuIHNhID8gcyA6IHNbMF07XG59XG5cbnZhciB0b3RhbEdQRVQgPSAwO1xudmFyIF9pID0gJzxsaSBpZD1cImlcIiBuYW1lPVwiZW1cIiB2YWx1ZT1cIjNcIj48L2xpPic7XG52YXIgX3UgPSAnPGxpIGlkPVwidVwiIHZhbHVlPVwiMVwiIGV4dHJhPVxcJ3N0eWxlOnRleHQtZGVjb3JhdGlvbjp1bmRlcmxpbmVcXCc+PC9saT4nO1xudmFyIF90ID0gJzxsaSBpZD1cInRcIiB2YWx1ZT1cIjFcIiBleHRyYT1cXCdzdHlsZTp0ZXh0LWRlY29yYXRpb246bGluZS10aHJvdWdoXFwnPjwvbGk+JztcbnZhciBfbyA9ICc8bGkgaWQ9XCJvXCIgdmFsdWU9XCIxXCIgZXh0cmE9XFwnc3R5bGU6dGV4dC1kZWNvcmF0aW9uOm92ZXJsaW5lXFwnPjwvbGk+JztcbnZhciBfc3ViID0gJzxsaSBpZD1cInN1YlwiIHZhbHVlPVwiMlwiPjwvbGk+JztcbnZhciBfc3VwID0gJzxsaSBpZD1cInN1cFwiIHZhbHVlPVwiMlwiPjwvbGk+JztcbnZhciBfdWwgPSAnPGxpIGlkPVwidWxcIiB2YWx1ZT1cIjUxXCI+PC9saT4nO1xudmFyIF9vbCA9ICc8bGkgaWQ9XCJvbFwiIHZhbHVlPVwiNTFcIj48L2xpPic7XG52YXIgX3NpemUgPSAnPGxpIGlkPVwiZm9udHNpemVcIiB2YWx1ZT1cIjExXCIgZXh0cmE9XFwnc3R5bGU6Zm9udC1zaXplXFwnPjwvbGk+JztcbnZhciBfY29sb3IgPSAnPGxpIGlkPVwiY29sb3JcIiB2YWx1ZT1cIjExXCIgZXh0cmE9XFwnc3R5bGU6Y29sb3JcXCcgY2xhc3M9XCJjYm90b25cIj48L2xpPic7XG52YXIgX2hpZ2hsaWdodCA9ICc8bGkgaWQ9XCJoaWdobGlnaHRcIiB2YWx1ZT1cIjExXCIgZXh0cmE9XFwnc3R5bGU6YmFja2dyb3VuZC1jb2xvclxcJyBjbGFzcz1cImNib3RvblwiIHNDST1cImJhY2tncm91bmQtY29sb3JcIj48L2xpPic7XG52YXIgX3NoYWRvdyA9ICc8bGkgaWQ9XCJ0ZXh0c2hhZG93XCIgdmFsdWU9XCIxMVwiIGV4dHJhPVxcJ3N0eWxlOnRleHQtc2hhZG93OiguKj8pIDFweCAxcHggMXB4XFwnIGNsYXNzPVwiY2JvdG9uXCIgc0NJPVwidGV4dC1zaGFkb3dcIj48L2xpPic7XG52YXIgX2wgPSAnPGxpIGlkPVwiTFwiIGV4dHJhPVwic3R5bGU6dGV4dC1hbGlnbjpsZWZ0XCIgdmFsdWU9XCIxMFwiPjwvbGk+JztcbnZhciBfYyA9ICc8bGkgaWQ9XCJDXCIgZXh0cmE9XCJzdHlsZTp0ZXh0LWFsaWduOmNlbnRlclwiIHZhbHVlPVwiMTBcIj48L2xpPic7XG52YXIgX3IgPSAnPGxpIGlkPVwiUlwiIGV4dHJhPVwic3R5bGU6dGV4dC1hbGlnbjpyaWdodFwiIHZhbHVlPVwiMTBcIj48L2xpPic7XG52YXIgX2ogPSAnPGxpIGlkPVwiSlwiIGV4dHJhPVwic3R5bGU6dGV4dC1hbGlnbjpqdXN0aWZ5XCIgdmFsdWU9XCIxMFwiPjwvbGk+JztcbnZhciBfY2l0ZSA9ICc8bGkgaWQ9XCJjaXRlXCIgdmFsdWU9XCIyXCI+PC9saT4nO1xudmFyIF9xdW90ZSA9ICc8bGkgaWQ9XCJxdW90ZVwiIG5hbWU9XCJxXCIgdmFsdWU9XCIzXCI+PC9saT4nO1xudmFyIF9lID0gJzxsaSBpZD1cImJcIiBuYW1lPVwic3Ryb25nXCIgdmFsdWU9XCIzXCI+PC9saT4nO1xudmFyIF9lbW90aWMgPSAnPGxpIGlkPVwiZW1vdGljXCIgbmFtZT1cInNwYW5cIiB2YWx1ZT1cIjMxXCIgZXh0cmE9XFwnc3JjXFwnPjwvbGk+JztcbnZhciBfaGwgPSAnPGxpIGlkPVwiaHJcIiBuYW1lPVwiaHJcIiB2YWx1ZT1cIjIxXCI+PC9saT4nO1xudmFyIF91bmZvcm1hdCA9ICc8bGkgaWQ9XCJ1bmZvcm1hcnRcIiB2YWx1ZT1cIjBcIj48L2xpPic7XG5cbnZhciB0ZW1wbGF0ZSA9ICc8c2VjdGlvbiBjbGFzcz1cIndyaWl0LWJveFwiPjxtZW51PjwvbWVudT48ZGl2IGRhdGEtd3JpaXQtcm9sZT1cInRleHQtYXJlYVwiPjwvZGl2PjxkaXYgY2xhc3M9XCJ0YWdpXCI+PC9kaXY+PC9zZWN0aW9uPic7XG52YXIgaW5zdGFsbGVkcGx1Z2lucyA9IFtcblx0J2JvbGQnLFxuLy9cdCdwYXN0ZUV2ZW50Jyxcbi8vXHQnaXRhbGljJyxcbi8vXHQndW5kZXJsaW5lJyxcbi8vXHQnc3RyaWtldGhyb3VnaCcsXG4vL1x0J3Bvd24nLFxuLy9cdCdzdWJpbmRleCcsXG4vL1x0J3VuZG8nLFxuLy9cdCdyZWRvJyxcbi8vXHQncGFyYWdyYXBoJyxcbi8vXHQnZm9yZWNvbG9yJ1xuXTtcblxuZnVuY3Rpb24gZ2V0VGFnKG5vZGUsIHRhZ3MpIHtcblx0Zm9yIChsZXQgcHJvcCBpbiB0YWdzKSB7XG5cdFx0bGV0IHRhZyA9IHRhZ3NbcHJvcF07XG5cdFx0aWYgKHRhZy5pc0luc3RhbmNlKG5vZGUpKSB7XG5cdFx0XHRyZXR1cm4gdGFnO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gbnVsbDtcbn1cbmZ1bmN0aW9uIGZpbmRBbGxUYWdzKG5vZGUsIGNvbnRhaW5lciwgdGFncykge1xuXHRmb3IgKGxldCBubmFtZSBpbiBub2RlLmNoaWxkcmVuKSB7XG5cdFx0bGV0IG5ld25vZGUgPSBub2RlLmNoaWxkcmVuW25uYW1lXTtcblx0XHRpZiAobmV3bm9kZS5ub2RlVHlwZSA9PT0gMSkge1xuXHRcdFx0bGV0IHRhZyA9IGdldFRhZyhuZXdub2RlLCB0YWdzKTtcblx0XHRcdGlmICh0YWcgIT09IG51bGwpIHtcblx0XHRcdFx0Y29udGFpbmVyW3RhZy5JZF0gPSB0YWc7XG5cdFx0XHR9XG5cdFx0XHRmaW5kQWxsVGFncyhuZXdub2RlLCBjb250YWluZXIsIHRhZ3MpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdH1cbn1cbmZ1bmN0aW9uIE5vZGVBbmFseXNpcyh0YWdzLCBtYWluY29udGFpbmVyKSB7XG5cdGxldCBsZWZ0ID0ge307XG5cdGxldCBtaWRkbGUgPSB7fTtcblx0bGV0IHJpZ2h0ID0ge307XG5cdGxldCBjb250YWluID0ge307XG5cdGxldCBsZWZ0Tm9kZSA9IHRoaXMuc3RhcnRDb250YWluZXIucGFyZW50Tm9kZTtcblx0bGV0IHJpZ2h0Tm9kZSA9IHRoaXMuZW5kQ29udGFpbmVyLnBhcmVudE5vZGU7XG5cdGxldCBjb21tb24gPSBudWxsO1xuXHRpZiAobGVmdE5vZGUgPT09IHJpZ2h0Tm9kZSkge1xuXHRcdGNvbW1vbiA9IGxlZnROb2RlO1xuXHRcdGxldCBpbnNpZGVyID0gdGhpcy5jbG9uZUNvbnRlbnRzKCk7XG5cdFx0ZmluZEFsbFRhZ3MoaW5zaWRlciwgbWlkZGxlLCB0YWdzKTtcblx0fSBlbHNlIHtcblx0XHR3aGlsZSAobGVmdE5vZGUgIT09IHRoaXMuY29tbW9uQW5jZXN0b3JDb250YWluZXIpIHtcblx0XHRcdGxldCB0YWcgPSBnZXRUYWcobGVmdE5vZGUsIHRhZ3MpO1xuXHRcdFx0aWYgKHRhZyAhPT0gbnVsbCkge1xuXHRcdFx0XHRsZWZ0W3RhZy5JZF0gPSB0YWc7XG5cdFx0XHR9XG5cdFx0XHRsZWZ0Tm9kZSA9IGxlZnROb2RlLnBhcmVudE5vZGU7XG5cdFx0fVxuXHRcdHdoaWxlIChyaWdodE5vZGUgIT09IHRoaXMuY29tbW9uQW5jZXN0b3JDb250YWluZXIpIHtcblx0XHRcdGxldCB0YWcgPSBnZXRUYWcocmlnaHROb2RlLCB0YWdzKTtcblx0XHRcdGlmICh0YWcgIT09IG51bGwpIHtcblx0XHRcdFx0cmlnaHRbdGFnLklkXSA9IHRhZztcblx0XHRcdH1cblx0XHRcdHJpZ2h0Tm9kZSA9IHJpZ2h0Tm9kZS5wYXJlbnROb2RlO1xuXHRcdH1cblx0XHRjb21tb24gPSB0aGlzLmNvbW1vbkFuY2VzdG9yQ29udGFpbmVyO1xuXHR9XG5cdHdoaWxlIChjb21tb24gIT09IG1haW5jb250YWluZXIpIHtcblx0XHRsZXQgdGFnID0gZ2V0VGFnKGNvbW1vbiwgdGFncyk7XG5cdFx0aWYgKHRhZyAhPT0gbnVsbCkge1xuXHRcdFx0Y29udGFpblt0YWcuSWRdID0gdGFnO1xuXHRcdH1cblx0XHRjb21tb24gPSBjb21tb24ucGFyZW50Tm9kZTtcblx0fVxuXHRsZXQgcGx1Z3MgPSB7fTtcblx0Zm9yIChsZXQgcHJvcCBpbiB0YWdzKSB7XG5cdFx0bGV0IHRhZyA9IHRhZ3NbcHJvcF07XG5cdFx0bGV0IGJ1dHRvbiA9IG1haW5jb250YWluZXIucGFyZW50Tm9kZS5xdWVyeVNlbGVjdG9yQWxsKFwiW2RhdGEtd3JpaXQtY29tbWFuZElkPVwiICsgdGFnLklkICsgXCJdXCIpWzBdO1xuXHRcdGxldCBnbG93ID0gZmFsc2U7XG5cdFx0aWYgKHRhZyBpbnN0YW5jZW9mIFNpbmdsZSkge1xuXHRcdFx0cGx1Z3NbdGFnLklkXSA9IHtcblx0XHRcdFx0aXNTb3Jyb3VuZGVkOiBjb250YWluW3RhZy5JZF0gIT09IHVuZGVmaW5lZCxcblx0XHRcdFx0aXNDb250YWluZWQ6IG1pZGRsZVt0YWcuSWRdICE9PSB1bmRlZmluZWQsXG5cdFx0XHRcdGlzT3BlbmVkOiByaWdodFt0YWcuSWRdICE9PSB1bmRlZmluZWQsXG5cdFx0XHRcdGlzQ2xvc2VkOiBsZWZ0W3RhZy5JZF0gIT09IHVuZGVmaW5lZCxcblx0XHRcdFx0ZGVlcDogMFxuXHRcdFx0fTtcblx0XHRcdGlmIChwbHVnc1t0YWcuSWRdLmlzU29ycm91bmRlZCkge1xuXHRcdFx0XHRidXR0b24uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG5cdFx0XHRcdGdsb3c9dHJ1ZTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGJ1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKCdhY3RpdmUnKTtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKHRhZyBpbnN0YW5jZW9mIE1hbnkpIHtcblx0XHRcdHBsdWdzW3RhZy5TdXBlcklkXSA9IHtcblx0XHRcdFx0aXNTb3Jyb3VuZGVkOiBwbHVnc1t0YWcuU3VwZXJJZF0gIT09IG51bGwgPyBwbHVnc1t0YWcuU3VwZXJJZF0uaXNTb3Jyb3VuZGVkIHx8IGNvbnRhaW5bdGFnLklkXSAhPT0gbnVsbCA6IGNvbnRhaW5bdGFnLklkXSxcblx0XHRcdFx0aXNDb250YWluZWQ6IHBsdWdzW3RhZy5TdXBlcklkXSAhPT0gbnVsbCA/IHBsdWdzW3RhZy5TdXBlcklkXS5pc0NvbnRhaW5lZCB8fCBtaWRkbGVbdGFnLklkXSAhPT0gbnVsbCA6IG1pZGRsZVt0YWcuSWRdLFxuXHRcdFx0XHRpc09wZW5lZDogcGx1Z3NbdGFnLlN1cGVySWRdICE9PSBudWxsID8gcGx1Z3NbdGFnLlN1cGVySWRdLmlzT3BlbmVkIHx8IHJpZ2h0W3RhZy5JZF0gIT09IG51bGwgOiByaWdodFt0YWcuSWRdICE9PSBudWxsLFxuXHRcdFx0XHRpc0Nsb3NlZDogcGx1Z3NbdGFnLlN1cGVySWRdICE9PSBudWxsID8gcGx1Z3NbdGFnLlN1cGVySWRdLmlzQ2xvc2VkIHx8IGxlZnRbdGFnLklkXSAhPT0gbnVsbCA6IGxlZnRbdGFnLklkXSAhPT0gbnVsbCxcblx0XHRcdFx0ZGVlcDogMFxuXHRcdFx0fTtcblx0XHRcdGlmIChjb250YWluW3RhZy5JZF0gIT09IG51bGwpIHtcblx0XHRcdFx0Z2xvdz10cnVlO1xuXHRcdFx0XHRidXR0b24uY2xhc3NMaXN0LmFkZCgnYWN0aXZlJyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRidXR0b24uY2xhc3NMaXN0LnJlbW92ZSgnYWN0aXZlJyk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGxldCBkb289dGFnLk1pbWU7XG5cdFx0aWYgKGdsb3cgJiYgZG9vKSB7XG5cdFx0XHRidXR0b24uc3R5bGVbXCJib3gtc2hhZG93XCJdID0gXCJpbnNldCAjMDBmZjAwIDFweCAxcHggNTBweFwiO1xuXG5cdFx0fSBlbHNlIHtcblx0XHRcdGJ1dHRvbi5zdHlsZVtcImJveC1zaGFkb3dcIl0gPSBcIlwiO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gcGx1Z3M7XG59XG5mdW5jdGlvbiBhZGR0b3RhZ2koZSkge1xuXHQkKHRoaXMpLnBhcmVudCgpLmZpbmQoJy50YWdpJykuaHRtbCgnJyk7XG5cdHZhciB4ID0gJChkb2N1bWVudC5nZXRTZWxlY3Rpb24oKS5hbmNob3JOb2RlLnBhcmVudE5vZGUpO1xuXHR2YXIgaSA9IDA7XG5cdHdoaWxlICh4LmdldCgwKSAhPT0gdGhpcykge1xuXHRcdHZhciBsaSA9ICQoJzxzcGFuPicgKyB4LmdldCgwKS5sb2NhbE5hbWUgKyAnPC9zcGFuPicpO1xuXHRcdCQodGhpcykucGFyZW50KCkuZmluZCgnLnRhZ2knKS5wcmVwZW5kKGxpKTtcblx0XHR4ID0geC5wYXJlbnQoKTtcblx0fVxufVxuZnVuY3Rpb24gV3JpaXQocGFyZW50LCBjZmcpIHtcblx0bGV0IHByaXZhdGVEYXRhID0gbmV3IFdlYWtNYXAoKTtcblx0bGV0IHByb3BzID0ge1xuXHRcdGRhdGFpbmRleDogW09iamVjdC5jcmVhdGUobnVsbCldLFxuXHRcdGRhdGE6IE9iamVjdC5jcmVhdGUobnVsbClcblx0fTtcblx0bGV0IGluZGV4ZXMgPSBbT2JqZWN0LmNyZWF0ZShudWxsKV07XG5cdHZhciBjb21waWxlZCA9ICQodGVtcGxhdGUpO1xuXHR0aGlzLnRleHRhcmVhID0gY29tcGlsZWQuZmluZChcIltkYXRhLXdyaWl0LXJvbGU9dGV4dC1hcmVhXVwiKTtcblx0dGhpcy50ZXh0YXJlYS5odG1sKHBhcmVudC5odG1sKCkpO1xuXHRwYXJlbnQucmVwbGFjZVdpdGgoY29tcGlsZWQpO1xuXHR0aGlzLm1lbnUgPSBjb21waWxlZC5maW5kKCdtZW51OmVxKDApJyk7XG5cdHRoaXMuY2ZnID0gJC5leHRlbmQoe30sIGNmZywge1xuXHRcdE1vZHVsZXM6IGluc3RhbGxlZHBsdWdpbnNcblx0fSk7XG5cdHZhciB0aGF0ID0gdGhpcztcblx0dmFyIHByb3RvdHlwZSA9IE9iamVjdC5nZXRQcm90b3R5cGVPZih0aGF0KTtcblx0dGhpcy5odG1sID0ge1xuXHRcdGdldCBzZWxlY3Rpb24oKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5nZXRTZWxlY3Rpb24oMCkuY29vcmQ7XG5cdFx0fSxcblx0XHRnZXRTZWxlY3Rpb246IGZ1bmN0aW9uIChuKSB7XG5cdFx0XHRuID0gbiB8fCAwO1xuXHRcdFx0dmFyIGh0bWwgPSB0aGF0LnRleHRhcmVhLmh0bWwoKTtcblx0XHRcdHZhciBjb29yZCA9IHRoYXQudGV4dGFyZWEuZ2V0U2VsZWN0aW9uKG4pO1xuXHRcdFx0dmFyIHJhbmdlID0gY29vcmQucmFuZztcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGdldCBzdGFydCgpIHtcblx0XHRcdFx0XHRyZXR1cm4gY29vcmQuc3RhcnQ7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGdldCBlbmQoKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGNvb3JkLmVuZDtcblx0XHRcdFx0fSxcblx0XHRcdFx0Z2V0IHByZSgpIHtcblx0XHRcdFx0XHRyZXR1cm4gaHRtbC5zdWJzdHJpbmcoMCwgY29vcmQuc3RhcnQpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRnZXQgc2VsKCkge1xuXHRcdFx0XHRcdHJldHVybiBodG1sLnN1YnN0cmluZyhjb29yZC5zdGFydCwgY29vcmQuZW5kKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0Z2V0IHBvc3QoKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGh0bWwuc3Vic3RyaW5nKGNvb3JkLmVuZCwgaHRtbC5sZW50Z2gpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRnZXQgdGV4dCgpIHtcblx0XHRcdFx0XHRyZXR1cm4gaHRtbDtcblx0XHRcdFx0fSxcblx0XHRcdFx0c2V0IHRleHQodikge1xuXHRcdFx0XHRcdHRoYXQudGV4dGFyZWEuaHRtbCh2KTtcblx0XHRcdFx0fSxcblx0XHRcdFx0Z2V0IHZpc3VhbCgpIHtcblx0XHRcdFx0XHRyZXR1cm4gcmFuZ2U7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0fVxuXHR9O1xuXHR0aGlzLnNlbGVjdGlvbiA9IGZ1bmN0aW9uICh0YWdpZCkge1xuXHRcdHJldHVybiB0aGlzLk1vZHVsZXNbdGFnaWRdLnNlbGVjdGlvbjtcblx0fTtcblx0dGhpcy50ZXh0YXJlYS5LZXlIYW5kbGVyKCk7IHtcblx0XHRsZXQgYmxvY2sgPSBmYWxzZTtcblx0XHRsZXQgaW5pdGlhbFZhbHVlID0gdGhpcy50ZXh0YXJlYS5odG1sKCkudHJpbSgpO1xuXHRcdGxldCBzdG9yZUluZm8gPSBmdW5jdGlvbiAoZm9yY2UpIHtcblx0XHRcdGxldCBpbmRleCA9IHByaXZhdGVEYXRhLmdldChjb21waWxlZC5nZXQoMCkpIHx8IFtdO1xuXHRcdFx0aWYgKGluZGV4ZXMubGVuZ3RoID09PSA1MSkge1xuXG5cdFx0XHR9XG5cdFx0XHRsZXQgcHJvcCA9IGluZGV4W2luZGV4Lmxlbmd0aCAtIDFdO1xuXHRcdFx0bGV0IHRleHR2YWx1ZSA9IHRoYXQudGV4dGFyZWEuaHRtbCgpLnRyaW0oKTtcblx0XHRcdGxldCBkYXRhID0gcHJpdmF0ZURhdGEuZ2V0KHByb3ApO1xuXG5cdFx0XHRpZiAoZGF0YSA9PT0gdW5kZWZpbmVkICYmIHRleHR2YWx1ZSAhPT0gaW5pdGlhbFZhbHVlKSB7XG5cdFx0XHRcdHByb3AgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXHRcdFx0XHRwcml2YXRlRGF0YS5zZXQocHJvcCwgaW5pdGlhbFZhbHVlKTtcblx0XHRcdFx0aW5kZXgucHVzaChwcm9wKTtcblx0XHRcdFx0cHJpdmF0ZURhdGEuc2V0KGNvbXBpbGVkLmdldCgwKSwgaW5kZXgpO1xuXHRcdFx0XHR0aGF0LmJ1dHRvbnMudW5kby5hdHRyKCdkaXNhYmxlZCcsIGZhbHNlKTtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9IGVsc2UgaWYgKFxuXG5cdFx0XHRcdChkYXRhICYmIE1hdGguYWJzKHRleHR2YWx1ZS5sZW5ndGggLSBkYXRhLmxlbmd0aCkgPiAxNSkgfHwgKGZvcmNlICYmIHRleHR2YWx1ZSAhPT0gZGF0YSlcblx0XHRcdCkge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhcIlN0b3JlXCIsIHRleHR2YWx1ZSk7XG5cdFx0XHRcdHByb3AgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuXHRcdFx0XHRwcml2YXRlRGF0YS5zZXQocHJvcCwgdGV4dHZhbHVlKTtcblx0XHRcdFx0aW5kZXgucHVzaChwcm9wKTtcblx0XHRcdFx0cHJpdmF0ZURhdGEuc2V0KGNvbXBpbGVkLmdldCgwKSwgaW5kZXgpO1xuXHRcdFx0XHR0aGF0LmJ1dHRvbnMudW5kby5hdHRyKCdkaXNhYmxlZCcsIGZhbHNlKTtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gKGRhdGEgIT09IHVuZGVmaW5lZCkgJiYgKGRhdGEgJiYgZGF0YSAhPT0gdGV4dHZhbHVlKTtcblx0XHR9O1xuXG5cdFx0bGV0IGNsZWFySW5mbyA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdHByaXZhdGVEYXRhLnNldCh0aGF0LnRleHRhcmVhLmdldCgwKSwgW10pO1xuXHRcdFx0dGhhdC5idXR0b25zLnJlZG8uYXR0cignZGlzYWJsZWQnLCB0cnVlKTtcblx0XHR9O1xuXHRcdGNvbXBpbGVkLmJpbmQoJ3NhdmVjb250ZW50JywgZnVuY3Rpb24gKGUpIHtcblx0XHRcdHdoaWxlIChibG9jayk7XG5cdFx0XHRibG9jayA9IHRydWU7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRpZiAoc3RvcmVJbmZvKCkpIHtcblx0XHRcdFx0XHRjbGVhckluZm8oKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aGF0LmJ1dHRvbnMudW5kby5hdHRyKCdkaXNhYmxlZCcsIHRydWUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGNhdGNoIChleCkge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhleCk7XG5cdFx0XHR9XG5cdFx0XHRibG9jayA9IGZhbHNlO1xuXHRcdH0pO1xuXG5cdFx0bGV0IGN0cmx6ID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0d2hpbGUgKGJsb2NrKTtcblx0XHRcdGJsb2NrID0gdHJ1ZTtcblx0XHRcdGxldCBzdG9yZWQgPSBzdG9yZUluZm8odHJ1ZSk7XG5cdFx0XHRsZXQgdW5kb3MgPSBwcml2YXRlRGF0YS5nZXQoY29tcGlsZWQuZ2V0KDApKTtcblx0XHRcdGxldCByZWRvcyA9IHByaXZhdGVEYXRhLmdldCh0aGF0LnRleHRhcmVhLmdldCgwKSkgfHwgW107XG5cblx0XHRcdGlmICh1bmRvcy5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdGlmIChzdG9yZWQpIHtcblx0XHRcdFx0XHRyZWRvcy5wdXNoKHVuZG9zLnBvcCgpKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRsZXQgcHJvcCA9IHByaXZhdGVEYXRhLmdldCh1bmRvc1t1bmRvcy5sZW5ndGggLSAxXSk7XG5cdFx0XHRcdHByaXZhdGVEYXRhLnNldCh0aGF0LnRleHRhcmVhLmdldCgwKSwgcmVkb3MpO1xuXG5cdFx0XHRcdHRoYXQudGV4dGFyZWEuaHRtbChwcm9wKTtcblx0XHRcdFx0cHJpdmF0ZURhdGEuc2V0KGNvbXBpbGVkLmdldCgwKSwgdW5kb3MpO1xuXHRcdFx0XHRsZXQgc2VsID0gd2luZG93LmdldFNlbGVjdGlvbigpO1xuXHRcdFx0XHRzZWwucmVtb3ZlQWxsUmFuZ2VzKCk7XG5cdFx0XHRcdGxldCBub2RlID0gdGhhdC50ZXh0YXJlYS5nZXQoMCk7XG5cdFx0XHRcdHdoaWxlIChub2RlLmxhc3RDaGlsZCkge1xuXHRcdFx0XHRcdG5vZGUgPSBub2RlLmxhc3RDaGlsZDtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGF0Lmh0bWwuZ2V0U2VsZWN0aW9uKDApLnZpc3VhbC5zZXRTdGFydEJlZm9yZShub2RlKTtcblx0XHRcdFx0dGhhdC5odG1sLmdldFNlbGVjdGlvbigwKS52aXN1YWwuc2V0RW5kQmVmb3JlKG5vZGUpO1xuXHRcdFx0XHRzZWwuYWRkUmFuZ2UodGhhdC5odG1sLmdldFNlbGVjdGlvbigwKS52aXN1YWwpO1xuXG5cdFx0XHRcdHRoYXQuYnV0dG9ucy5yZWRvLmF0dHIoJ2Rpc2FibGVkJywgZmFsc2UpO1xuXHRcdFx0fVxuXHRcdFx0YmxvY2sgPSBmYWxzZTtcblx0XHRcdC8vXHRcdCQodGhpcykudHJpZ2dlcigna2V5dXAnLCBlKTtcblx0XHRcdHJldHVybiBmYWxzZTtcblxuXHRcdH07XG5cdFx0dGhpcy50ZXh0YXJlYS5rZXlzLmJpbmQoXCJDTUQrWlwiLCBjdHJseik7XG5cdFx0cHJvdG90eXBlLnVuZG8gPSB7XG5cdFx0XHRTZXR1cDogZnVuY3Rpb24gKHRvb2xiYXIpIHtcblx0XHRcdFx0dGhpcy5DYWxsYmFjayh0b29sYmFyLkFkZEJ1dHRvbihuZXcgU2luZ2xlKFwidW5kb1wiLCBcIl91bmRvXCIsIHtcblx0XHRcdFx0XHR0b29sdGlwOiBcIlVuZG9cIixcblx0XHRcdFx0XHRkaXNwbGF5Y2xhc3M6IFwiZmEgZmEtdW5kb1wiXG5cdFx0XHRcdH0pKSwgY3RybHopO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0cHJvdG90eXBlLnJlZG8gPSB7XG5cdFx0XHRTZXR1cDogZnVuY3Rpb24gKHRvb2xiYXIpIHtcblx0XHRcdFx0dGhpcy5DYWxsYmFjayh0b29sYmFyLkFkZEJ1dHRvbihuZXcgU2luZ2xlKFwicmVkb1wiLCBcIl9yZWRvXCIsIHtcblx0XHRcdFx0XHR0b29sdGlwOiBcIlJlcGVhdFwiLFxuXHRcdFx0XHRcdGRpc3BsYXljbGFzczogXCJmYSBmYS1yZXBlYXRcIlxuXHRcdFx0XHR9KSksIGN0cmx6KTtcblx0XHRcdFx0dGhhdC5idXR0b25zLnJlZG8uc2V0QXR0cmlidXRlKCdkaXNhYmxlZCcsIHRydWUpO1xuXHRcdFx0fVxuXHRcdH07XG5cdH1cblx0dGhpcy50ZXh0YXJlYS50b1RleHRBcmVhKHtcblx0XHRjb29yZDogZmFsc2UsXG5cdFx0ZGVidWc6IGZhbHNlXG5cdH0pO1xuXG5cdHRoaXMuTW9kdWxlcyA9IHt9O1xuXHR0aGlzLmJ1dHRvbnMgPSB7fTtcblx0dGhpcy50YWdzID0ge307XG5cdHRoaXMubWV0YWRhdGEgPSB7fTtcblx0dGhpcy50ZXh0YXJlYS5iaW5kKCdrZXl1cCBtb3VzZXVwJywgYWRkdG90YWdpKTtcblx0dGhpcy50ZXh0YXJlYS5iaW5kKCdrZXl1cCBtb3VzZXVwJywgZnVuY3Rpb24gKCkge1xuXHRcdHRoYXQuTW9kdWxlcyA9IE5vZGVBbmFseXNpcy5hcHBseSh0aGF0LnRleHRhcmVhLmdldFNlbGVjdGlvbigwKS5yYW5nLCBbdGhhdC50YWdzLCB0aGF0LnRleHRhcmVhLmdldCgwKV0pO1xuXHR9KTtcblx0c2V0SW50ZXJ2YWwoZnVuY3Rpb24gKCkge1xuXHRcdGNvbXBpbGVkLnRyaWdnZXIoJ3NhdmVjb250ZW50Jyk7XG5cdH0sIDEwMDApO1xuXHRsZXQgdG9vbGJhciA9IG5ldyBUb29sYmFyKHRoaXMpO1xuXHRPYmplY3QuZnJlZXplKHRvb2xiYXIpO1xuXHR0aGlzLmNmZy5Nb2R1bGVzLmZvckVhY2goZnVuY3Rpb24gKHBsdWdpbikge1xuXHRcdGlmIChwcm90b3R5cGVbcGx1Z2luXS5TZXR1cCAhPT0gbnVsbCkge1xuXHRcdFx0cHJvdG90eXBlW3BsdWdpbl0gPSAkLmV4dGVuZChuZXcgTW9kdWxlKHRoYXQpLCBwcm90b3R5cGVbcGx1Z2luXSk7XG5cdFx0XHRwcm90b3R5cGVbcGx1Z2luXS5TZXR1cCh0b29sYmFyKTtcblx0XHR9XG5cdH0pO1xuXHR0aGlzLmJ1dHRvbiA9IGZ1bmN0aW9uIChpZCkge1xuXHRcdHJldHVybiB0aGF0LmJ1dHRvbnNbaWRdO1xuXHR9O1xufVxuV3JpaXQucHJvdG90eXBlLnBhc3RlRXZlbnQgPSB7XG5cdFNldHVwOiBmdW5jdGlvbiAoKSB7XG5cdFx0dmFyIHRoYXQgPSB0aGlzO1xuXHRcdHZhciBjbGlwYm9hcmQgPSAkKCc8dGV4dGFyZWEgc3R5bGU9XCJkaXNwbGF5Om5vbmU7XCI+Jyk7XG5cdFx0Y2xpcGJvYXJkLmluc2VydEFmdGVyKCQodGhpcy50ZXh0YXJlYSkpO1xuXHRcdCQodGhpcy50ZXh0YXJlYSkuYmluZChcInBhc3RlXCIsIGZhbHNlLCBmdW5jdGlvbiAoZSkge1xuXHRcdFx0dmFyIHBhc3RlID0gXCJcIjtcblx0XHRcdHZhciBvID0gZTtcblx0XHRcdGUgPSBlLm9yaWdpbmFsRXZlbnQ7XG5cdFx0XHRpZiAoL3RleHRcXC9odG1sLy50ZXN0KGUuY2xpcGJvYXJkRGF0YS50eXBlcykpIHtcblx0XHRcdFx0cGFzdGUgPSBlLmNsaXBib2FyZERhdGEuZ2V0RGF0YSgndGV4dC9odG1sJyk7XG5cdFx0XHRcdHBhc3RlID0gcGFzdGUucmVwbGFjZShcIjxtZXRhIGNoYXJzZXQ9J3V0Zi04Jz5cIiwgZnVuY3Rpb24gKHN0cikge1xuXHRcdFx0XHRcdHJldHVybiAnJztcblx0XHRcdFx0fSk7XG5cdFx0XHRcdHBhc3RlID0gcGFzdGUucmVwbGFjZSgvPHNwYW4gY2xhc3M9XCJBcHBsZS1jb252ZXJ0ZWQtc3BhY2VcIj4uPFxcL3NwYW4+L2csIGZ1bmN0aW9uIChzdHIpIHtcblx0XHRcdFx0XHRyZXR1cm4gJyAnO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0cGFzdGUgPSBwYXN0ZS5yZXBsYWNlKC88c3BhbltePl0qPihbXjxdKik8XFwvc3Bhbj4vZywgZnVuY3Rpb24gKHN0ciwgY3QpIHtcblx0XHRcdFx0XHRyZXR1cm4gY3Q7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRwYXN0ZSA9IHBhc3RlLnJlcGxhY2UoLyBzdHlsZT1cIi5bXj5dKlwiL2csIGZ1bmN0aW9uIChzdHIsIGN0KSB7XG5cdFx0XHRcdFx0cmV0dXJuICcnO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0ZS5jbGlwYm9hcmREYXRhLmNsZWFyRGF0YSgpO1xuXHRcdFx0XHRlLmNsaXBib2FyZERhdGEuaXRlbXMgPSBbXTtcblx0XHRcdFx0Y2xpcGJvYXJkLmh0bWwocGFzdGUpO1xuXHRcdFx0XHRwYXN0ZSA9ICQoJzxzZWN0aW9uPicgKyBwYXN0ZSArICc8L3NlY3Rpb24+JykuZ2V0KDApO1xuXHRcdFx0XHQvL1x0XHRcdFx0ZS5jbGlwYm9hcmREYXRhLnNldERhdGEoJ3RleHQvaHRtbCcscGFzdGUpO1xuXHRcdFx0fSBlbHNlIGlmICgvdGV4dFxcL3BsYWluLy50ZXN0KGUuY2xpcGJvYXJkRGF0YS50eXBlcykpIHtcblx0XHRcdFx0cGFzdGUgPSBlLmNsaXBib2FyZERhdGEuZ2V0RGF0YSgndGV4dC9wbGFpbicpO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGVuZCA9IHBhc3RlLmNoaWxkTm9kZXNbdGhhdC5ub2RlQVBJLmNoaWxkQ291bnRvckxlbmd0ZyhwYXN0ZSkgLSAxXTtcblx0XHRcdHdoaWxlIChwYXN0ZS5jaGlsZE5vZGVzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0ZS50YXJnZXQucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUocGFzdGUuY2hpbGROb2Rlc1swXSwgZS50YXJnZXQpO1xuXHRcdFx0fVxuXHRcdFx0dGhhdC5odG1sLmdldFNlbGVjdGlvbigwKS52aXN1YWwuc2V0U3RhcnQoZW5kLCB0aGF0Lm5vZGVBUEkuY2hpbGRDb3VudG9yTGVuZ3RnKGVuZCkpO1xuXHRcdFx0dGhhdC5odG1sLmdldFNlbGVjdGlvbigwKS52aXN1YWwuc2V0RW5kKGVuZCwgdGhhdC5ub2RlQVBJLmNoaWxkQ291bnRvckxlbmd0ZyhlbmQpKTtcblx0XHRcdHRoYXQucmVzdG9yZSgpO1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0pO1xuXHR9LFxufTtcbldyaWl0LnByb3RvdHlwZS5ib2xkID0ge1xuXHRTZXR1cDogZnVuY3Rpb24gKHRvb2xiYXIpIHtcblx0XHRsZXQgYm9sZCA9IG5ldyBTaW5nbGUoXCJib2xkXCIsIFwic3Ryb25nXCIsIHtcblx0XHRcdHRvb2x0aXA6IFwiQm9sZFwiLFxuXHRcdFx0aWNvbmNsYXNzOiBcImZhIGZhLWJvbGRcIixcblx0XHRcdHNob3J0Y3V0OiBcIkNNRCtTSElGVCtCXCJcblx0XHR9KTtcblx0XHR0b29sYmFyLkFkZEJ1dHRvbihib2xkKTtcblx0XHR0aGlzLkNhbGxiYWNrKGJvbGQsIHRoaXMuSW5zZXJ0KTtcblx0fSxcbn07XG5XcmlpdC5wcm90b3R5cGUuc3ViaW5kZXggPSB7XG5cdFNldHVwOiBmdW5jdGlvbiAodG9vbGJhcikge1xuXHRcdGxldCBidCA9IG5ldyBTaW5nbGUoXCJzdWJpbmRleFwiLCBcInN1YlwiLCB7XG5cdFx0XHR0b29sdGlwOiBcIlN1YkluZGV4XCIsXG5cdFx0XHRkaXNwbGF5Y2xhc3M6IFwiZmEgZmEtc3Vic2NyaXB0XCJcblx0XHR9KTtcblx0XHR0b29sYmFyLkFkZEJ1dHRvbihidCk7XG5cdFx0dGhpcy5DYWxsYmFjayhidCwgdGhpcy5JbnNlcnQpO1xuXHR9XG59O1xuV3JpaXQucHJvdG90eXBlLnBvd24gPSB7XG5cdFNldHVwOiBmdW5jdGlvbiAodG9vbGJhcikge1xuXHRcdHRoaXMuQ2FsbGJhY2sodG9vbGJhci5BZGRCdXR0b24obmV3IFNpbmdsZShcInBvd25cIiwgXCJzdXBcIiwge1xuXHRcdFx0dG9vbHRpcDogXCJTdXBlciBJbmRleFwiLFxuXHRcdFx0ZGlzcGxheWNsYXNzOiBcImZhIGZhLXN1cGVyc2NyaXB0XCJcblx0XHR9KSksIHRoaXMuSW5zZXJ0KTtcblx0fVxufTtcbldyaWl0LnByb3RvdHlwZS5pdGFsaWMgPSB7XG5cdFNldHVwOiBmdW5jdGlvbiAodG9vbGJhcikge1xuXHRcdHRoaXMuQ2FsbGJhY2sodG9vbGJhci5BZGRCdXR0b24obmV3IFNpbmdsZShcIml0YWxpY1wiLCBcImVtXCIsIHtcblx0XHRcdHRvb2x0aXA6IFwiSXRhbGljXCIsXG5cdFx0XHRkaXNwbGF5Y2xhc3M6IFwiZmEgZmEtaXRhbGljXCJcblx0XHR9KSksIHRoaXMuSW5zZXJ0KTtcblx0fVxufTtcbldyaWl0LnByb3RvdHlwZS51bmRlcmxpbmUgPSB7XG5cdFNldHVwOiBmdW5jdGlvbiAodG9vbGJhcikge1xuXHRcdHRoaXMuQ2FsbGJhY2sodG9vbGJhci5BZGRCdXR0b24obmV3IFNpbmdsZShcInVuZGVybGluZVwiLCBcInVcIiwge1xuXHRcdFx0dG9vbHRpcDogXCJVbmRlcmxpbmVcIixcblx0XHRcdGRpc3BsYXljbGFzczogXCJmYSBmYS11bmRlcmxpbmVcIixcblx0XHRcdHNob3J0Y3V0OiBcIkFMVCtTSElGVCtVXCJcblx0XHR9KSksIHRoaXMuSW5zZXJ0KTtcblx0fVxufTtcbldyaWl0LnByb3RvdHlwZS5zdHJpa2V0aHJvdWdoID0ge1xuXHRTZXR1cDogZnVuY3Rpb24gKHRvb2xiYXIpIHtcblx0XHR0aGlzLkNhbGxiYWNrKHRvb2xiYXIuQWRkQnV0dG9uKG5ldyBTaW5nbGUoXCJzdHJpa2V0aHJvdWdoXCIsIFwiZGVsXCIsIHtcblx0XHRcdHRvb2x0aXA6IFwiU3RyaWtlIFRocm91Z2hcIixcblx0XHRcdGRpc3BsYXljbGFzczogXCJmYSBmYS1zdHJpa2V0aHJvdWdoXCIsXG5cdFx0XHRzaG9ydGN1dDogXCJBTFQrU0hJRlQrU1wiXG5cdFx0fSkpLCB0aGlzLkluc2VydCk7XG5cdH1cbn07XG4vKldyaWl0LnByb3RvdHlwZS5wYXJhZ3JhcGggPSB7XG5cdFNldHVwOiBmdW5jdGlvbiAodG9vbGJhcikge1xuXHRcdGxldCBmbXVsdGkgPSBuZXcgTXVsdGlDbGFzcygncGFyYWdyYXBoJywgXCJwXCIpO1xuXHRcdGZtdWx0aS5BZGQoJ2xlZnQnLCAndGV4dC1sZWZ0Jywge1xuXHRcdFx0dG9vbHRpcDogXCJBbGlnbiBMZWZ0XCIsXG5cdFx0XHRkaXNwbGF5Y2xhc3M6IFwiZmEgZmEtYWxpZ24tbGVmdFwiLFxuXHRcdFx0c2hvcnRjdXQ6IFwiQ01EK1NISUZUK0xcIlxuXHRcdH0pO1xuXHRcdGZtdWx0aS5BZGQoJ2NlbnRlcicsICd0ZXh0LWNlbnRlcicsIHtcblx0XHRcdHRvb2x0aXA6IFwiQWxpZ24gQ2VudGVyXCIsXG5cdFx0XHRkaXNwbGF5Y2xhc3M6IFwiZmEgZmEtYWxpZ24tY2VudGVyXCIsXG5cdFx0XHRzaG9ydGN1dDogXCJDTUQrU0hJRlQrQ1wiXG5cdFx0fSk7XG5cdFx0Zm11bHRpLkFkZCgncmlnaHQnLCAndGV4dC1yaWdodCcsIHtcblx0XHRcdHRvb2x0aXA6IFwiQWxpZ24gUmlnaHRcIixcblx0XHRcdGRpc3BsYXljbGFzczogXCJmYSBmYS1hbGlnbi1yaWdodFwiLFxuXHRcdFx0c2hvcnRjdXQ6IFwiQ01EK1NISUZUK1JcIlxuXHRcdH0pO1xuXHRcdGZtdWx0aS5BZGQoJ2p1c3RpZnknLCAndGV4dC1qdXN0aWZ5Jywge1xuXHRcdFx0dG9vbHRpcDogXCJKdXN0aWZ5XCIsXG5cdFx0XHRkaXNwbGF5Y2xhc3M6IFwiZmEgZmEtYWxpZ24tanVzdGlmeVwiLFxuXHRcdFx0c2hvcnRjdXQ6IFwiQ01EK1NISUZUK0pcIlxuXHRcdH0pO1xuXHRcdHRvb2xiYXIuQWRkQnV0dG9uKGZtdWx0aSk7XG5cdFx0dGhpcy5DYWxsYmFjayhmbXVsdGksIHRoaXMuSW5zZXJ0KTtcblx0fVxufTsqL1xuV3JpaXQucHJvdG90eXBlLmZvcmVjb2xvciA9IHtcblx0U2V0dXA6IGZ1bmN0aW9uICh0b29sYmFyKSB7XG5cdFx0bGV0IHRhZyA9IG5ldyBTdHlsZVRhZygnZm9yZWNvbG9yJyk7XG5cdFx0bGV0IHByb3AgPSB0YWcubmV3UHJvcGVydHkoXCJjb2xvclwiKTtcblx0XHR0YWcuQWRkKHByb3AuS2V5VmFsdWUoJyNGRjAwMDAnLCdyZWQnKSApO1xuXHRcdFxuXHRcdGxldCBmbXVsdGkgPSBuZXcgU3R5bGVBdHRyKCdmb3JlY29sb3InLCBcInNwYW5cIiwgYyk7XG5cdFx0Zm11bHRpLkFkZCgncmVkJywgYy5hcHBseSgnIzAwRkYwMCcpLCB7XG5cdFx0XHRkaXNwbGF5Y2xhc3M6IFwiZmEgZmEtZm9udFwiXG5cdFx0fSx0cnVlKTtcblx0XHR0b29sYmFyLkFkZEJ1dHRvbihmbXVsdGkpO1xuXHRcdHRoaXMuQ2FsbGJhY2soZm11bHRpLCB0aGlzLkluc2VydCk7XG5cdH1cbn07XG4kLmZuLndyaWl0ID0gZnVuY3Rpb24gKGNmZykge1xuXHQkKHRoaXMpLmVhY2goZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiBuZXcgV3JpaXQoJCh0aGlzKSwgY2ZnKTtcblx0fSk7XG59OyJdfQ==
