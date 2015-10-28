/*global document*/
/* jshint -W097 */
"use strict";

function BaseAttr(attr, value) {
	this.attr = attr;
	this.value = value;
}

export class ClassAttr {

}

export function StyleAttr(attr, value) {
	BaseAttr.call(this, attr, value);
}

export function GeneralAttr(attr, value) {
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
	for (let attr in this.Attr) {
		let atribute = this.Attr[attr];
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
BaseTag.prototype.new = function () {
	let el = document.createElement(this.TagName);
	this.UpdateAttributes(el);
	return el;
};
BaseTag.prototype.UpdateAttributes = function (node) {
	for (let attr in this.Attr) {
		let atribute = this.Attr[attr];
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

class Base {
	constructor(id, tag, attributes, highlight) {
		this.Id = id;
		this.highlight = true;
		this.TagName = tag;
		this.Attributes = [];
		this.Shortcut = attributes.shortcut || null;
		this.ToolTip = attributes.tooltip || null;
		this.IconClass = attributes.iconclass || null;
	}
	isCompatible(htmlnode) {
		if (htmlnode.nodeType !== 1 || htmlnode.tagName.toLowerCase() !== this.TagName.toLowerCase()) {
			return false;
		}
		return true;
	}
	isInstance(htmlnode) {
		if (!this.isCompatible(htmlnode)) {
			return false;
		}
		for (let attr in this.Attr) {
			let atribute = this.Attr[attr];
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
	new() {
		let el = document.createElement(this.TagName);
		//this.UpdateAttributes(el);
		return el;
	}
}
class AttrGenerator {
	constructor(gen, property) {
		this.gen = gen;
		this.property = property;
	}
	KeyValue(value, label) {
		return new this.gen(this.property, value);
	}
}

export class StyleTag extends Base {
	constructor(...args) {
		super(...args);
	}
	newProperty(property) {
		return new AttrGenerator(StyleAttr, property);
	}
	Add(attribute) {
		this.Attributes[attribute.attr] = attribute;
	}
}
export class Single extends Base {
	constructor(id, tag, options) {
		super(id, tag, options, false);
	}
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