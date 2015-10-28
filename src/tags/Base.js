export default class {
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