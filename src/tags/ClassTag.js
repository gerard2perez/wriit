export default class {
	constructor(id, tag) {
		this.Id = id;
		this.TagName = tag;
		this.children = {};
	}
	FindByClass(classname) {
		for (let child in this.children) {
			if (this.children[child].AttrMatch("class", classname)) {
				return this.children[child];
			}
		}
	}
	Add(subid, classname, attributes) {
		attributes = attributes || {};
		attributes.class = classname;
		this.children[subid] = new Many(this.Id + "_" + subid, this.TagName, attributes, "class");
		this.children[subid].SuperId = this.Id;
		this.children[subid].Parent = this;
		Object.freeze(this.children[subid]);
	}
	Remove(clasname) {
		delete this.children[subid];
	}
}