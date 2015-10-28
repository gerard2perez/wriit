import Base from './Base';
export default class StyleTag extends Base {
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