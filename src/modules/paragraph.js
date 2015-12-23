import {ClassTag} from '../tags';
export default{
	Setup: function (toolbar) {
		let tag = new ClassTag('paragraph', "p");
		tag.Add('left', 'text-left', {
			tooltip: "Align Left",
			displayclass: "fa fa-align-left",
			shortcut: "CMD+SHIFT+L"
		});
		tag.Add('center', 'text-center', {
			tooltip: "Center",
			displayclass: "fa fa-align-center",
			shortcut: "CMD+SHIFT+L"
		});
		tag.Add('right', 'text-right', {
			tooltip: "Align Right",
			displayclass: "fa fa-align-right",
			shortcut: "CMD+SHIFT+R"
		});
		tag.Add('justify', 'text-justify', {
			tooltip: "Justify",
			displayclass: "fa fa-align-justify",
			shortcut: "CMD+SHIFT+J"
		});
		toolbar.AddButton(tag);
		this.Callback(tag, this.Insert);
		toolbar.InsertSeparator();
	},
};