import Module from './Module';
import {
	Single, StyleTag, StyleAttr, ClassTag
}
	
from './tags';
import Toolbar from './Toolbar';
import * as modules from './modules';
import template from './template';
import * as private_namespaces from './modules/private';
import * as utils from './utils';

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
		if(tag instanceof ClassTag){
			for(let id in tag.children){
				tag.children[id].button.classList.remove('active');
			}
		}
		let button = tag.button;
		let highlight = false;
		plugs[tag.Id] = {
			isSorrounded: contain[tag.Id] !== undefined,
			isContained: middle[tag.Id] !== undefined,
			isOpened: right[tag.Id] !== undefined,
			isClosed: left[tag.Id] !== undefined,
			deep: 0,
			tag: tag.AppliedTag
		};
		if (plugs[tag.Id].isSorrounded) {
			button.classList.add('active');
			highlight = true;
		} else if(button!==null){
			button.classList.remove('active');
		}
		let doo = tag.highlight;
		if (highlight && doo) {
			button.style["box-shadow"] = "inset " + tag.AppliedTag.value + " 1px 1px 50px";
		} else if(button!==null) {
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
export default class {
	constructor(parent, cfg) {
		let that = this;
		let prototype = Object.getPrototypeOf(that);

		this.ToolBar = new Toolbar(this);
		Object.freeze(this.ToolBar);

		let privateData = new WeakMap();
		let props = {
			dataindex: [Object.create(null)],
			data: Object.create(null)
		};
		let indexes = [Object.create(null)];
		let compiled = $(template);
		this.textarea = compiled.find("[data-wriit-role=text-area]");
		this.textarea.html(parent.html());
		parent.replaceWith(compiled);
		this.menu = compiled.find('menu:eq(0)');

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
		this.textarea.KeyHandler();
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

		let namespaces = [];
		let exportfn = function (ns, fn) {
			return function () {
				fn.apply(ns, arguments);
			};
		};
		for (let _namespace in private_namespaces) {
			namespaces[_namespace] = new utils.MapManager(privateData);
			if (private_namespaces[_namespace].MakePublic !== undefined) {
				let publicvars = private_namespaces[_namespace].MakePublic(namespaces[_namespace]);
				for (let prop in publicvars) {
					Object.defineProperty(that, publicvars[prop], {
						enumerable: false,
						configurable: false,
						writable: false,
						value: exportfn(namespaces[_namespace], private_namespaces[_namespace][prop])
					});
				}
				delete private_namespaces[_namespace].MakePublic;
			}
			namespaces[_namespace].Register(private_namespaces[_namespace]);
		}

		for (let modulename in modules) {
			let module = prototype[modulename];
			if (module.Setup !== null) {
				module = $.extend(new Module(that), module);
				module.Setup(that.ToolBar, module.ExtendedPrivilegies === true ? namespaces[module.Namespace] : null);
			}
		}
		this.button = function (id) {
			return that.buttons[id];
		};
	}
	get Range() {
		return this.textarea.getSelection(0).rang;
	}
	RestoreSelection() {
		this.textarea.get(0).normalize();
//		this.textarea.RestoreRange(this.textarea.getSelection(0));
		if (this.Range !== undefined) {
			document.getSelection().removeAllRanges();
			document.getSelection().addRange(this.Range);
		}
		this.textarea.trigger('mouseup');
	}
}