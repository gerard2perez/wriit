"use strict";

function BaseAttr(attr, value) {
	this.attr = attr;
	this.value = value;
}
function S_Attr(attr, value) {
	BaseAttr.call(this, attr, value);
}
function G_Attr(attr, value) {
	BaseAttr.call(this, attr, value);
}
S_Attr.prototype = Object.create(BaseAttr.prototype);
G_Attr.prototype = Object.create(BaseAttr.prototype);
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
	return new G_Attr(this.attr, value);
};
WriitStyle.prototype.apply = function (value) {
	return new S_Attr(this.attr, value);
};
Object.freeze(WriitAttr);
Object.freeze(WriitStyle);
function deepFreeze(obj) {

	// Retrieve the property names defined on obj
	var propNames = Object.getOwnPropertyNames(obj);

	// Freeze properties before freezing self
	propNames.forEach(function (name) {
		var prop = obj[name];

		// Freeze prop if it is an object
		if (typeof prop == 'object' && !Object.isFrozen(prop))
			deepFreeze(prop);
	});

	// Freeze self
	return Object.freeze(obj);
}
function regexp(txt) {
		var f = ["[", "/", "]", "-"],
			r = ["\\[", "\/", "\\]", "."],
			s = txt;
		var ra = r instanceof Array,
			sa = s instanceof Array,
			f = [].concat(f),
			r = [].concat(r),
			i = (s = [].concat(s)).length,
			j = 0;

		while (j = 0, i--) {
			if (s[i]) {
				while (s[i] = (s[i] + '').split(f[j]).join(ra ? r[j] || "" : r[0]), ++j in f) {};
			}
		};
		return RegExp(sa ? s : s[0], "g");
	}
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
			if (atribute instanceof S_Attr) {
				if(htmlnode.style[atribute.attr]==""){return false;}
			} else if (atribute instanceof G_Attr) {
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
			if (atribute instanceof S_Attr) {
				node.style[atribute.attr]=atribute.value;
			} else if (atribute instanceof G_Attr) {
				node.setAttribute(attr, this.Attr[attr]);
			}
		}
	}
}

function Single(id, tag, attributes,blow) {
	Basic.call(this, id, tag, attributes,blow);
	Object.freeze(this.SuperId);
	Object.freeze(this);
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

Single.prototype = Object.create(Basic.prototype);
Many.prototype = Object.create(Basic.prototype);
Object.freeze(Single);
Object.freeze(Many);