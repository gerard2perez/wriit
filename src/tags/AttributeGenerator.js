export default class{
	constructor(gen, property) {
		this.gen = gen;
		this.property = property;
	}
	KeyValue(value, label) {
		return new this.gen(this.property, value);
	}
}