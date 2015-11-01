import {StyleTag,StyleAttr} from '../tags';

export default {
	Setup: function (toolbar) {
		let tag = new StyleTag('forecolor');
		let prop = tag.newProperty("color");
		tag.Add(prop.KeyValue('#FF0000', 'red'));
		toolbar.AddButton(tag);
		this.Callback(tag, this.Insert);
	}
};