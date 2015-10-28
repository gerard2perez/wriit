import Base from './Base';
import AttributeGenerator from './AttributeGenerator';

export default class StyleTag extends Base {
	constructor(...args) {
		super(...args);
	}
	newProperty(property) {
		return new AttributeGenerator(StyleAttr, property);
	}
	Add(attribute) {
		this.Attributes[attribute.attr] = attribute;
	}
}