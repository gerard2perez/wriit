import * as modules from './modules';
import core from './core';
/*
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
let installedplugins = [];

function getTag(node, tags) {
	for (let prop in tags) {
		let tag = tags[prop];
		if (tag.isInstance(node)) {
			return tag;
		}
	}
	return null;
}

function findAllTags(node, container, tags) {
	for (let nname in node.children) {
		let newnode = node.children[nname];
		if (newnode.nodeType === 1) {
			let tag = getTag(newnode, tags);
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
	let left = {};
	let middle = {};
	let right = {};
	let contain = {};
	let leftNode = this.startContainer.parentNode;
	let rightNode = this.endContainer.parentNode;
	let common = null;
	if (leftNode === rightNode) {
		common = leftNode;
		let insider = this.cloneContents();
		findAllTags(insider, middle, tags);
	} else {
		while (leftNode !== this.commonAncestorContainer && leftNode !== maincontainer) {
			let tag = getTag(leftNode, tags);
			if (tag !== null) {
				left[tag.Id] = tag;
			}
			leftNode = leftNode.parentNode;
		}
		while (rightNode !== this.commonAncestorContainer && rightNode !== maincontainer) {
			let tag = getTag(rightNode, tags);
			if (tag !== null) {
				right[tag.Id] = tag;
			}
			rightNode = rightNode.parentNode;
		}
		common = this.commonAncestorContainer;
	}
	while (common !== maincontainer) {
		let tag = getTag(common, tags);
		if (tag !== null) {
			contain[tag.Id] = tag;
		}
		common = common.parentNode;
	}
	let plugs = {};
	for (let prop in tags) {
		let tag = tags[prop];
		let button = maincontainer.parentNode.querySelectorAll("[data-wriit-commandId=" + tag.Id + "]")[0];
		let highlight = false;
		plugs[tag.Id] = {
			isSorrounded: contain[tag.Id] !== undefined,
			isContained: middle[tag.Id] !== undefined,
			isOpened: right[tag.Id] !== undefined,
			isClosed: left[tag.Id] !== undefined,
			deep: 0
		};
		if (plugs[tag.Id].isSorrounded) {
			button.classList.add('active');
			highlight = true;
		} else {
			button.classList.remove('active');
		}
		let doo = tag.highlight;
		if (highlight && doo) {
			button.style["box-shadow"] = "inset " + tag.AppliedTag.value + " 1px 1px 50px";
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
	let privateData = new WeakMap();
	let props = {
		dataindex: [Object.create(null)],
		data: Object.create(null)
	};
	let indexes = [Object.create(null)];
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
	this.html = {
		get selection() {
			return this.getSelection(0).coord;
		},
		getSelection: function (n) {
			n = n || 0;
			var html = that.textarea.html();
			var coord = that.textarea.getSelection(n);
			var range = coord.rang;
			return {
				get start() {
					return coord.start;
				},
				get end() {
					return coord.end;
				},
				get pre() {
					return html.substring(0, coord.start);
				},
				get sel() {
					return html.substring(coord.start, coord.end);
				},
				get post() {
					return html.substring(coord.end, html.lentgh);
				},
				get text() {
					return html;
				},
				set text(v) {
					that.textarea.html(v);
				},
				get visual() {
					return range;
				}
			};
		}
	};
	this.selection = function (tagid) {
		return this.Modules[tagid].selection;
	};
	this.textarea.KeyHandler(); {
		let block = false;
		let initialValue = this.textarea.html().trim();
		let storeInfo = function (force) {
			let index = privateData.get(compiled.get(0)) || [];
			if (indexes.length === 51) {

			}
			let prop = index[index.length - 1];
			let textvalue = that.textarea.html().trim();
			let data = privateData.get(prop);

			if (data === undefined && textvalue !== initialValue) {
				prop = Object.create(null);
				privateData.set(prop, initialValue);
				index.push(prop);
				privateData.set(compiled.get(0), index);
				that.buttons.undo.attr('disabled', false);
				return true;
			} else if (

				(data && Math.abs(textvalue.length - data.length) > 15) || (force && textvalue !== data)
			) {
				console.log("Store", textvalue);
				prop = Object.create(null);
				privateData.set(prop, textvalue);
				index.push(prop);
				privateData.set(compiled.get(0), index);
				that.buttons.undo.attr('disabled', false);
				return true;
			}
			return (data !== undefined) && (data && data !== textvalue);
		};

		let clearInfo = function () {
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

		let ctrlz = function () {
			while (block);
			block = true;
			let stored = storeInfo(true);
			let undos = privateData.get(compiled.get(0));
			let redos = privateData.get(that.textarea.get(0)) || [];

			if (undos.length > 1) {
				if (stored) {
					redos.push(undos.pop());
				}
				let prop = privateData.get(undos[undos.length - 1]);
				privateData.set(that.textarea.get(0), redos);

				that.textarea.html(prop);
				privateData.set(compiled.get(0), undos);
				let sel = window.getSelection();
				sel.removeAllRanges();
				let node = that.textarea.get(0);
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
		this.textarea.keys.bind("CMD+Z", ctrlz);
		prototype.undo = {
			Setup: function (toolbar) {
				this.Callback(toolbar.AddButton(new Single("undo", "_undo", {
					tooltip: "Undo",
					displayclass: "fa fa-undo"
				})), ctrlz);
			}
		};
		prototype.redo = {
			Setup: function (toolbar) {
				this.Callback(toolbar.AddButton(new Single("redo", "_redo", {
					tooltip: "Repeat",
					displayclass: "fa fa-repeat"
				})), ctrlz);
				that.buttons.redo.setAttribute('disabled', true);
			}
		};
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
	let toolbar = new Toolbar(this);
	Object.freeze(toolbar);
	this.ToolBar = toolbar;
	this.cfg.Modules.forEach(function (plugin) {
		if (prototype[plugin].Setup !== null) {
			prototype[plugin] = $.extend(new Module(that), prototype[plugin]);
			prototype[plugin].Setup(toolbar);
		}
	});
	this.button = function (id) {
		return that.buttons[id];
	};
}*/

for (let mod in modules) {
	core.prototype[mod] = modules[mod];
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
};*/
$.fn.wriit = function (cfg) {
	$(this).each(function () {
		return new core($(this), cfg);
	});
};