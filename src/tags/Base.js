export default class {
	constructor(id, tag, attributes, highlight) {
		this.Id = id;
		this.highlight = highlight;
		this.TagName = tag;
		this.Attributes = [];
		this.Shortcut = attributes.shortcut || null;
		this.ToolTip = attributes.tooltip || null;
		this.IconClass = attributes.iconclass || null;
		this.button = null;
		this.classList = [];
		this.Render = 3;
	}
	isCompatible(htmlnode) {
		if(htmlnode===null){return false;}
		if (htmlnode.nodeType !== 1 || htmlnode.tagName.toLowerCase() !== this.TagName.toLowerCase()) {
			return false;
		}
		return true;
	}
	isInstance(htmlnode) {
		return this.isCompatible(htmlnode);
	}
	new() {
		let el = document.createElement(this.TagName);
		let that = this;
		that.classList.forEach(function(classname){
			el.classList.add(classname);
		});
		return el;
	}
	CanRemove(node){
		return true;
	}
	
	get instaceName(){
		return (/function (.*)\(/g).exec(String(this.constructor))[1];
	}
}