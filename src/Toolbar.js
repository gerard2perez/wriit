import { Single, StyleTag } from './tags';

export default class {
	add (button) {
		let newB = document.createElement('button');
		newB.setAttribute("data-wriit-commandId", button.Id);
		newB.setAttribute("class", button.IconClass);

		if (button.ToolTip !== null) {
			let span = document.createElement('span');
			span.innerHTML = button.ToolTip;
			newB.appendChild(span);
		}

		this.Editor.buttons[button.Id] = newB;
		this.Editor.tags[button.Id] = button;
		this.Editor.menu.append(newB);
		return button.Id;
	}
	constructor(editor) {
		this.Editor = editor;
	}
	AddButton(tag) {
		if (tag instanceof Single) {
			add(tag);
			/*} else if (button instanceof MultiClass) {
				for (let prop in button.children) {
					add(button.children[prop]);
				}
			} else if (button instanceof MultiAttr) {
				for (let prop in button.children) {
					add(button.children[prop]);
				}
			}*/
		} else if (tag instanceof StyleTag) {

		}
		//return button;
	}
}