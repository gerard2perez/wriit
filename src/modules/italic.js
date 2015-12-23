import {Single} from '../tags';
export default {
	Setup: function (toolbar) {
		let bold = new Single("Italic", "em", {
			tooltip: "Italic",
			iconclass: "fa fa-italic",
			shortcut: "CMD+SHIFT+I"
		});
		toolbar.AddButton(bold);
		this.Callback(bold, this.Insert);
	}
};
