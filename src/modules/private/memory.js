export default {
	block: false,
	history: [],
	index: -1,
	savetriggerid: null,
	savetrigger_s: 5000,
	onSaved: null,
	save: function (textarea) {
		let data = textarea.html().trim();
		for (let i = this.index + 1; i < this.history.length; i++) {
			delete this.history[i];
		}
		this.index = this.index + 1;
		this.history[this.index] = {
			text: data,
			range: textarea.getSelection(0)
		};
		if (this.onSaved !== null) {
			this.onSaved();
		}
	},
	store: function (textarea, force) {
		if(this.index<0){
			this.save(textarea);
			return true;
		}
		let record = this.history[this.index];
		let text = record.text;
		let ctext = textarea.html().trim();
		if (
			(text && Math.abs(ctext.length - text.length) > 15) || (ctext !== text && force === true)
		) {
			this.save(textarea);
			return true;
		}
		return (ctext !== undefined) && (ctext && ctext !== text);
	},
	clear: function () {},
	updateInterval: function (value) {
		this.savetrigger_s = value;
	},
	watch: function (textarea) {
		let that = this;
		this.savetriggerid = setTimeout(function () {
			that.store(textarea);
			if (that.savetriggerid !== null) {
				that.watch(textarea);
			}
		}, this.savetrigger_s);
	},
	TearDown: function () {
		clearTimeout(this.savetriggerid);
		this.savetriggerid = null;
	},
	RestoreSelection: function (rang,textarea) {
		textarea.RestoreRange(rang);
//		let sel = window.getSelection();
//		sel.removeAllRanges();
//		let range = document.createRange();
//		let selectors = rang.selectors;
//		if(selectors===undefined){return;}
//		let start = textarea.querySelector(selectors.start).childNodes[selectors.node.start];
//		let end = textarea.querySelector(selectors.end).childNodes[selectors.node.end];
//
//		if(start.nodeType===1){
//			start=start.childNodes[0];
//		}
//		if(end.nodeType===1){
//			end=end.childNodes[end.childNodes.length-1];
//		}
//		range.setStart(start, selectors.startOffset);
//		range.setEnd(end, selectors.endOffset);
//
//		sel.addRange(range);
	},
	MakePublic: function (parent) {
		return {
			store:'AddToHistory'
		};
	}
};