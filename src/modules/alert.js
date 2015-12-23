import {ClassTag,Engine} from '../tags';
export default{
	Setup: function (toolbar) {
		let tag = new ClassTag('alert', "div",{iconclass:'fa fa-bell'});
//		tag.Render = Engine.square;
		tag.classList = ['alert'];
		tag.Add('success', 'alert-success', {
			tooltip: "Default Button",
			displayclass: "fa fa-bell",
		});
		tag.Add('danger', 'alert-danger', {
			tooltip: "Default Button",
			displayclass: "fa fa-bell",
		});
		toolbar.AddButton(tag);
		this.Callback(tag, this.Insert);
		toolbar.InsertSeparator();
		return tag;
	}
};