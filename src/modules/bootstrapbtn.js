import {ClassTag,Engine} from '../tags';
export default{
	Setup: function (toolbar) {
		let tag = new ClassTag('bootstrapbtn', "button",{iconclass:"fa fa-bell",tooltip:"BootStrap Buttons"});
		tag.Render = Engine.list;
		tag.Engine = {
			class:true,
			text:"Sample Text Button",
			item: 'button'
		};
		tag.classList = ['btn'];
		tag.Add('default', 'btn-default', {
			tooltip: "Default Button",
			displayclass: "fa fa-bell",
		});
		tag.Add('primary', 'btn-primary', {
			tooltip: "Default Button",
			displayclass: "fa fa-bell",
		});
		toolbar.AddButton(tag);
		this.Callback(tag, this.Insert);
		toolbar.InsertSeparator();
		return tag;
	}
};