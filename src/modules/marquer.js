import {StyleTag,StyleAttr,Engine} from '../tags';

export default {
	Setup: function (toolbar) {
		let tag = new StyleTag('marquer','fa fa-ship','Highlight');
		tag.TagName = 'mark';
		tag.Render = Engine.square;
		let prop = tag.newProperty("background-color");
		
		tag.Add(prop.KeyValue('#FF0000', 'red'));
		tag.Add(prop.KeyValue('#00FF00', 'green'));
		tag.Add(prop.KeyValue('#0000FF', 'blue'));
		
		toolbar.AddButton(tag);
		this.Callback(tag, this.Insert);
	}
};