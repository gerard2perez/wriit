import {
	BaseAttribute
}
from '../attributes';


export default class ClaseAttr extends BaseAttribute {
	constructor(parent,id, subid, value, options) {
		super(id, value);
		delete this.attr;
		this.parent = parent;
		this.id = id;
		this.subid = subid;
		this.ToolTip = options.tooltip || null;
		this.IconClass = options.displayclass || null;
		this.Shortcut = options.shortcut || null;
	}
	get Id() {
		return this.id + "." + this.subid;
	}
	set Id(value) {}
	isInstance(node) {
		if (node.classList.contains(this.value)) {
			return true;
		}
		return false;
	}
}