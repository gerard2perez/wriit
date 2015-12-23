import Base from './Base';
import {StyleAttr, AttributeGenerator} from '../attributes';
import {from_rgb} from '../utils';

export default class StyleTag extends Base {
	constructor(id, IconClass, tooltip) {
		super(id, 'span', {
			iconclass: IconClass,
			tooltip: tooltip
		}, true,'background-color');
		this.children = {};
		this.Render = 0;
		this.AppliedTag = null;
		this.button = document.createElement('div');
	}
	newProperty(property, displayengine) {
		return new AttributeGenerator(StyleAttr, property);
	}
	Add(attribute) {
		attribute.Id = this.Id;
		attribute.Render = this.Render;
		this.children[attribute.attr] = this.children[attribute.attr] || [];
		this.children[attribute.attr].push(attribute);
	}
	new(attribute) {
		let tag = super.new();
		this.AppliedTag = attribute;
		tag.style[attribute.attr] = attribute.value;
		return tag;
	}
	isInstance(htmlnode) {
		if (!super.isInstance(htmlnode)) {
			return false;
		}
		for (let attr in this.children) {
			let atributes = this.children[attr];

			if (htmlnode.style[atributes[0].attr] === "") {
				return false;
			}

			for (let attribute in atributes) {
				let a = atributes[attribute];
				let value = from_rgb(htmlnode.style[a.attr],false);
				if (value === a.value) {
					this.AppliedTag = a;
				}
			}
		}
		return true;
	}
	Update(element, attribute) {
		element.style[attribute.attr] = attribute.value;
	}
}