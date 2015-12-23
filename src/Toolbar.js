import {
	Single, StyleTag, Engine, ClassTag
}
from './tags';
import {
	tooltip
}
from './utils';
let mouseenter = function () {
	this.classList.add('hover');
	
};
let mouseleave = function () {
	this.classList.remove('hover');
};
export default class {
	constructor(editor) {
		this.Editor = editor;
	}
	PreRender(tag) {
		let button = tag.button;
		switch (tag.Render) {
			case Engine.square:
			case Engine.list:
				button.setAttribute("class", tag.IconClass);
				let preview = document.createElement('span');
				let menu = document.createElement('menu');
				let label = document.createElement('span');
				label.innerHTML = tag.ToolTip;
				preview.classList.add('preview');
				button.appendChild(preview);
				menu.appendChild(label);
				button.appendChild(menu);
				return menu;
		}
	}
	Render(tag) {
		let button = tag.button;
		switch (tag.Render) {
		case Engine.button:
			button.setAttribute("class", tag.IconClass);
			button.attributes.tooltip = tag.ToolTip;
			tooltip(button);
			return button;
		case Engine.square:
			button.classList.add('square');
			button.style.backgroundColor = tag.value;
			return button;
			case Engine.list:
				button.classList.add('row');
				if(tag.Engine.class){
					let el = tag.parent.new(tag);
					el.innerHTML = tag.Engine.text;	
					button.appendChild(el);
				}
				return button;
		}
	}
	AddButton(tag) {
		let that = this;
		let button = tag.button;
		let menu;
		switch (tag.instaceName) {
		case "Single":
			button = this.Render(tag);
			break;
		case "ClassTag":
			menu = this.PreRender(tag) || this.Editor.menu.get(0);
			for (let id in tag.children) {
				//				this.Editor.menu.append(this.Render(tag.children[id]));
				menu.appendChild(this.Render(tag.children[id]));
			}
			break;
		case "StyleTag":
			menu = this.PreRender(tag);
			for (let attr in tag.children) {
				tag.children[attr].forEach(function (style) {
					menu.appendChild(that.Render(style));
				});
			}
			break;
		}
		if (button !== null) {
			if (menu !== this.Editor.menu.get(0)) {
				this.Editor.menu.append(button);
			}
			button.addEventListener('mouseenter', mouseenter);
			button.addEventListener('mouseleave', mouseleave);
		}
		this.Editor.tags[tag.Id] = tag;
		//		if (button !== undefined && button !== null) {
		//			button.addEventListener('mouseenter', mouseenter);
		//			button.addEventListener('mouseleave', mouseleave);
		//		}
		//		if (tag instanceof ClassTag) {
		//			this.Editor.tags[tag.Id] = tag;
		//			for (let id in tag.children) {
		//				this.Editor.menu.append(this.Render(tag.children[id]));
		//			}
		//			return;
		//		} else if (tag instanceof Single) {
		//			button.setAttribute("class", tag.IconClass);
		//			button.attributes.tooltip = tag.ToolTip;
		//			tooltip(button);
		//			this.Editor.menu.append(button);
		//			this.Editor.tags[tag.Id] = tag;
		//		} else if (tag instanceof StyleTag) {
		//			button.setAttribute("class", tag.IconClass);
		//			for (let attr in tag.children) {
		//				switch (tag.Render) {
		//				case Engine.square:
		//					let preview = document.createElement('span');
		//					let menu = document.createElement('menu');
		//					let label = document.createElement('span');
		//					label.innerHTML = tag.ToolTip;
		//
		//					preview.classList.add('preview');
		//					button.appendChild(preview);
		//
		//					menu.appendChild(label);
		//					button.appendChild(menu);
		//					tag.children[attr].forEach(function (style) {
		//						style.button.classList.add('square');
		//						style.button.style.backgroundColor = style.value;
		//						menu.appendChild(style.button);
		//					});
		//					break;
		//				}
		//			}
		//			this.Editor.menu.append(button);
		//			this.Editor.tags[tag.Id] = tag;
		//		}
	}
	Select(tag) {
		let button = tag.button;
		button.classList.add('active');
		button.classList.remove('hover');
		if (tag.highlight && tag.AppliedTag !== null) {
			button.style["box-shadow"] = "inset " + tag.AppliedTag.value + " 1px 1px 50px";
		}
	}
	UnSelect(tag) {
		let button = tag.button;
		button.classList.remove('active');
		button.classList.add('hover');
		if (tag.highlight && tag.AppliedTag !== null) {
			button.style["box-shadow"] = "";
		}
	}
	Enable(tag) {
		tag.button.classList.remove('disable');
	}
	Disable(tag) {
		let button = tag.button;
		button.classList.add('disable');
		button.classList.remove('active');
		button.classList.remove('hover');
		if (tag.highlight && tag.AppliedTag !== null) {
			button.style["box-shadow"] = "inset " + tag.AppliedTag.value + " 1px 1px 50px";
		}
	}
	InsertSeparator() {
		let separator = document.createElement('span');
		separator.classList.add('separator');
		this.Editor.menu.append(separator);
	}
}