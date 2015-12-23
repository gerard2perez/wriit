/*global document,$,Many,MultiAttr*/
import {
	Single, StyleTag, ClassTag
}
from './tags';

function test() {
	alert('click');
}

function makeChildSiblings(node) {
	var parent = node.parentNode;
	while (node.childNodes.length > 0) {
		parent.insertBefore(node.childNodes[0], node);
	}
}
export default class {
	constructor(editor) {
		this.Editor = editor;
		this.Tag = {};
		this.ApplyValue = null;
		this.BeforeFormat = undefined;
		this.AfterFormat = undefined;
		this.TearDown = undefined;
		this.Setup = undefined;
		this.Namespace = null;
	}
	get Selection() {
		return this.Tag.SuperId !== undefined ? this.Editor.Modules[this.Tag.SuperId] : this.Editor.Modules[this.Tag.Id];
	}
	get Visual() {
		return this.Editor.html.getSelection(0).visual;
	}
	Insert(e, textarea) {
		let selection = this.Selection;
		let visual = this.Visual;
		if (visual.collapsed && selection.isSorrounded) {
			let oldnode = visual.startContainer.parentNode;
			while (!this.Tag.isInstance(oldnode)) {
					oldnode = oldnode.parentNode;
				}
			if (this.Tag.CanRemove(oldnode,this.Attribute)) {
				makeChildSiblings(oldnode);
				oldnode.remove();
				this.Editor.ToolBar.UnSelect(this.Tag);
			}else{
				this.Tag.Update(oldnode,this.Attribute);
			}
		} else if (selection.isSorrounded) {
			let oldnode = visual.startContainer.parentNode;
			while (!this.Tag.isInstance(oldnode) && oldnode != textarea) {
				oldnode = oldnode.parentNode;
			}
			if (oldnode != textarea) {
				this.Tag.Update(oldnode, this.Attribute);
			}
			this.Editor.ToolBar.Select(this.Tag);
		} else {
			let newel = this.Tag.new(this.Attribute);
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
			let start = newel.childNodes[0];
			let end = newel.childNodes[newel.childNodes.length - 1];
			//visual.selectNodeContents(newel);
			visual.setStart(start, 0);
			visual.setEnd(end, end.length);
			this.Editor.ToolBar.Select(this.Tag);
		}
		this.Editor.RestoreSelection();
	}
	Callback(tag, fn) {
		let button = tag.button;
		let mod = this;

		function Hanlder(tag, attribute) {
			return function (e, routedevent) {
				mod.Tag = tag;
				mod.Attribute = attribute;
				this.event = routedevent || e;
				if (mod.BeforeFormat !== undefined) {
					mod.BeforeFormat.apply(mod, [routedevent || e]);
				}
				let res = fn.apply(mod, [routedevent || e, mod.Editor.textarea.get(0)]);
				mod.Editor.AddToHistory(mod.Editor.textarea, true);
				if (mod.AfterFormat !== undefined) {
					mod.AfterFormat.apply(mod, [routedevent || e]);
				}
				return res;
			};
		}

		function ManyHandler(minibutton) {
			minibutton.button.addEventListener('click', Hanlder(tag, minibutton));
		}
		if (tag instanceof Single) {
			button.addEventListener('click', Hanlder(tag, null));
		} else if (tag instanceof ClassTag) {
			for (let prop in tag.children) {
				tag.children[prop].button.addEventListener('click', Hanlder(tag, tag.children[prop]));
			}
		} else {
			for (let prop in tag.children) {
				tag.children[prop].forEach(ManyHandler);
			}
		}
		if (!!tag.Shortcut) {
			this.Editor.textarea.keys.bind(tag.Shortcut, function (e) {
				$(button).trigger('click', e);
				return false;
			});
		}
	}
}