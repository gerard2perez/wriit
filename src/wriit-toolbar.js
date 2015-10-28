import {Single,StyleTag} from './wriit-tags';

export default function (that) {
	let add = function (button) {
		let newB = document.createElement('button');
		newB.setAttribute("data-wriit-commandId", button.Id);
		newB.setAttribute("class", button.IconClass);
		
		if( button.ToolTip !== null){
			let span = document.createElement('span');
			span.innerHTML = button.ToolTip;
			newB.appendChild(span);
		}
		
		that.buttons[button.Id] = newB;
		that.tags[button.Id] = button;
		that.menu.append(newB);
		return button.Id;
	};
	this.AddButton = function (tag) {
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
		}else if(tag instanceof StyleTag){
			
		}
		//return button;
	};
	Object.defineProperty(this, 'AddButton', {
		writable: false,
		enumerable: true,
		configurable: true
	});
}