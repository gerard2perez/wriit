import {
	Single, Engine
}
from '../tags';
export default {
	Action: function (e, textarea) {

		let wrapper = this.Tag.new();
		let selection = this.Selection;
		let visual = this.Visual;
		let sTag = visual.startContainer.parentNode;
		let eTag = visual.endContainer.parentNode;

		if (visual.collapsed) {
			if(!selection.isSorrounded){
				visual.startContainer.remove();
				visual.insertNode(wrapper);
				wrapper.appendChild(document.createElement('li'));
				visual.setStart(wrapper.firstChild, 0);
				visual.setEnd(wrapper.firstChild,0);
			}
		} else {
			let lastChild = null;
			while (sTag !== null) {
				let li = document.createElement('li');
				while (sTag.childNodes.length > 0) {
					lastChild = sTag.childNodes[0];
					li.appendChild(sTag.childNodes[0]);
				}
				wrapper.appendChild(li);
				if (sTag.nextSibling !== null) {
					sTag = sTag.nextSibling;
					sTag.previousSibling.remove();
				} else {
					sTag.remove();
					sTag = null;
				}


			}
			visual.insertNode(wrapper);
			visual.setStart(wrapper.firstChild.firstChild, 0);
			visual.setEnd(lastChild, lastChild.length);
		}
		this.Editor.RestoreSelection();
	},
	Setup: function (toolbar) {
		let list = new Single('list', "ul", {
			tooltip: "Unorder List",
			iconclass: 'fa fa-list-ul'
		});
		toolbar.InsertSeparator();
		toolbar.AddButton(list);
		this.Callback(list, this.Action);
	}
};