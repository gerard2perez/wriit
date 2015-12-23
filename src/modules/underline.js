import {Single}
from '../tags';
export default {
	Setup: function (toolbar) {
		let underline = new Single("underline", "u", {
			tooltip: "Underline",
			iconclass: "fa fa-underline",
			shortcut: "CMD+SHIFT+U"
		});
		toolbar.AddButton(underline);
		this.Callback(underline, this.Insert);
	}
};