import Base from './Base';
import AttributeGenerator from './AttributeGenerator';
import StyleAttr from './StyleAttr';
	

export default class StyleTag extends Base {
	constructor(id) {
		super(id,'span',{},'background-color');
		this.children={};
	}
	newProperty(property) {
		return new AttributeGenerator(StyleAttr, property);
	}
	Add(attribute) {
		this.children[attribute.attr] = attribute;
	}
}