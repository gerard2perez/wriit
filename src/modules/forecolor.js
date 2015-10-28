import {StyleTag,StyleAttr} from '../tags';

export default {
	Setup: function (toolbar) {
		let tag = new StyleTag('forecolor');
		let prop = tag.newProperty("color");
		tag.Add(prop.KeyValue('#FF0000', 'red'));
		let fmulti = new StyleAttr('forecolor', "span", c);
		fmulti.Add('red', c.apply('#00FF00'), {
			displayclass: "fa fa-font"
		}, true);
		toolbar.AddButton(fmulti);
		this.Callback(fmulti, this.Insert);
	}
};