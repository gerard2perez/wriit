/*global document,window,$,console,setInterval,Basic,Many,Single,MultiAttr,MultiClass,WriitStyle,regexp,StyleTag*/
import {Single,StyleTag} from './wriit-tags';
function makeChildSiblings(node) {
	var parent = node.parentNode;
	while (node.childNodes.length > 0) {
		parent.insertBefore(node.childNodes[0], node);
	}
}
let Module = function (that) {
	let mod = this;
	this.Tag=null;
	this.visual=null;
	this.Editor = that;
	Object.defineProperty(this, "Selection", {
		get: function () {
			return mod.Tag.SuperId !== undefined ? that.Modules[mod.Tag.SuperId] : that.Modules[mod.Tag.Id];
		},
	});
	Object.defineProperty(this, "Visual", {
		get: function () {
			return that.html.getSelection(0).visual;
		},
	});
};
Module.prototype = {
	Editor: undefined,
	TearDown: undefined,
	IMany: function (textarea) {
		let selection = this.Selection;
		let visual = this.Visual;
		let node = visual.commonAncestorContainer;
		if (node.nodeType !== 1) {
			node = node.parentNode;
		}
		if (selection.isSorrounded) {
			for (let t in this.Tag.Parent.children) {
				let tag = this.Tag.Parent.children[t];
				this.Editor.button(tag.Id).classList.remove('active');
			}
			while (node.tagName.toLowerCase() !== this.Tag.TagName.toLowerCase()) {
				node = node.parentNode;
			}
			if (this.Tag.isCompatible(node)) {
				for (let attr in this.Tag.Attr) {
					this.Tag.UpdateAttributes(node);
					//node.setAttribute(attr, this.Tag.Attr[attr]);
				}
				this.Editor.button(this.Tag.Id).classList.add('active');
			}
		} else if (!(this.Tag.Parent instanceof MultiClass)) {
			let newel = this.Tag.new();
			newel.appendChild(visual.extractContents());
			visual.insertNode(newel);
			textarea.normalize();
		}
		document.getSelection().removeAllRanges();
		document.getSelection().addRange(visual);
	},
	ISingle: function (textarea) {
		let selection = this.Selection;
		let visual = this.Visual;
		if (visual.collapsed && selection.isSorrounded) {
			let oldnode = visual.startContainer.parentNode;
			while (!this.Tag.isInstance(oldnode)) {
				oldnode = oldnode.parentNode;
			}
			makeChildSiblings(oldnode);
			oldnode.remove();
		} else {
			let newel = this.Tag.new();
			newel.appendChild(visual.extractContents());
			visual.insertNode(newel);
			if (this.Tag.isInstance(newel.nextSibling)) {
				let sibling = newel.nextSibling;
				Array.prototype.forEach.call(sibling.childNodes, function (innerchild) {
					newel.appendChild(innerchild);
				});
				sibling.remove();
			}
			if (this.Tag.isInstance(newel.previousSibling)) {
				let sibling = newel.previousSibling;
				Array.prototype.forEach.call(sibling.childNodes, function (innerchild) {
					newel.insertBefore(innerchild, newel.firstChild);
				});
				sibling.remove();
			}
			if (selection.isContained + selection.isOpened + selection.isClosed) {
				let cleannode = visual.extractContents().firstChild;
				let inner = cleannode.querySelectorAll(this.Tag.TagName);
				for (let i = 0; i < inner.length; i++) {
					makeChildSiblings(inner[i]);
					inner[i].remove();
				}
				visual.insertNode(newel);
			}
		}
		textarea.parentNode.querySelectorAll("[data-wriit-commandId=" + this.Tag.Id + "]")[0].classList.toggle('active');
		textarea.normalize();
		document.getSelection().removeAllRanges();
		document.getSelection().addRange(visual);
	},
	Insert: function (e, textarea) {
		if (this.Tag instanceof Single) {
			this.ISingle.apply(this, [textarea]);
		} else if (this.Tag instanceof Many) {
			this.IMany.apply(this, [textarea]);
		}
	},
	Callback: function (tag, fn) {
		let apply = function (tag) {
			let button = this.Editor.buttons[tag.Id];
			let mod = this;
			button.addEventListener('click', function (e, routedevent) {
				mod.Tag = tag;
				this.event = routedevent || e;
				if (this.BeforeFormat !== undefined) {
					mod.BeforeFormat.apply(mod, [routedevent || e]);
				}
				let res = fn.apply(mod, [routedevent || e, mod.Editor.textarea.get(0)]);
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
		if (tag instanceof Single) {
			apply.apply(this, [tag]);
		} else if (tag instanceof MultiClass) {
			for (let i in tag.children) {
				apply.apply(this, [tag.children[i]]);
			}
		} else if (tag instanceof MultiAttr) {
			for (let i in tag.children) {
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
export default Module;