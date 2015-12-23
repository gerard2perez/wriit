import {
	Single, Base
}
from '../tags';
import {
	ClassAttr
}
from '../attributes';
import Engine from './Engine';
export default class ClassTag extends Base {
	constructor(id, tag, opts) {
		super(id, tag, opts || {});
		this.Id = id;
		this.TagName = tag;
		this.children = {};
		this.__button = document.createElement('div');
	}
	FindByClass(classname) {
		for (let child in this.children) {
			if (this.children[child].AttrMatch("class", classname)) {
				return this.children[child];
			}
		}
	}
	isCompatible(htmlnode) {
			return (htmlnode !== null && htmlnode !== undefined && htmlnode.nodeType === 1);
		}
			get button(){
				switch(this.Render){
					case Engine.button:
						return this.AppliedTag ? this.AppliedTag.button:null;
					default:
						return this.__button;
				}
			}
			set button(value){}
	isInstance(node) {
		if (!this.isCompatible(node)) {
			return false;
		}
		for (let id in this.children) {
			let child = this.children[id];
			if (node.classList.contains(child.value)) {
				this.AppliedTag = child;
				return true;
			}
		}
		return false;
	}
	Add(subid, classname, options) {
		let that = this;
		let classattr = new ClassAttr(this,this.Id, subid, classname, options);
		classattr.Engine = this.Engine;
		Object.defineProperty(classattr, 'Render', {
			get: function () {
				return that.Render;
			}
		});
//		classattr.Render = Engine.button;
		this.children[subid] = classattr;
	}
	CanRemove(node, attribute) {
		return false;
	}
	Update(node, attribute) {
		for (let id in this.children) {
			node.classList.remove(this.children[id].value);
		}
		node.classList.add(attribute.value);
	}
	new(attribute) {
		let el = super.new();
		el.classList.add(attribute.value);
		return el;
	}
}