export default class{
	constructor(attr, value,tooltip){
		this.Id = 'not_set';
		this.attr = attr;
		this.value = value;
		this.tooltip =tooltip;
		this.button = document.createElement('button');
	}
}