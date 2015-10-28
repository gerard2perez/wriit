import {Single} from '../tags';
export default {
	Setup: function (toolbar) {
		let bold = new Single("bold", "strong", {
			tooltip: "Bold",
			iconclass: "fa fa-bold",
			shortcut: "CMD+SHIFT+B"
		});
		toolbar.AddButton(bold);
		this.Callback(bold, this.Insert);
	}
};