import {StyleTag,Engine} from '../tags';
export default {
	Setup: function (toolbar) {
		let tag = new StyleTag('forecolor','fa fa-font','Font Color');
		tag.Render = Engine.square;
		let prop = tag.newProperty("color");
		tag.Add(prop.KeyValue('#FF0000', 'red'));
		tag.Add(prop.KeyValue('#00FF00', 'green'));
		toolbar.AddButton(tag);
		this.Callback(tag, this.Insert);
		toolbar.InsertSeparator();
	}
};