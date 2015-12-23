/*global $,jQuery*/
function getName(node) {
	if (node === null) {
		return null;
	}
	let name = node.id === "" ? node.localName : "#" + node.id;
	return name + (node.className !== "" ? "." + node.className.replace(" ", ".") : "");
}

function nodeOffset(node) {
	let test = node;
	let n = 0;
	while (test.previousSibling !== null) {
		test = test.previousSibling;
		n++;
	}
	return n;

}

function getSelector(parent, node) {
	let current = node;
	let selector = "";
	while (current != parent) {
		switch (current.nodeType) {
		case 1:
			let sel = "";
			let sibling = getName(current.previousElementSibling);
			if (sibling !== null) {
				sel = sibling + " + ";
			}
			selector = sel + getName(current) + " " + selector;
			break;
		case 3:
			break;
		}
		current = current.parentNode;
		if (current != parent && selector !== "") {
			selector = " > " + selector;
		}
	}
	return selector;
}

function taglength(node, full) {
	"use strict";
	let otext = node.wholeText !== undefined ? node.wholeText : node.outerHTML;
	let itext = node.innerHTML !== undefined ? node.innerHTML : node.innerText;
	let l = otext.indexOf(itext);
	if (otext.indexOf(itext) !== otext.lastIndexOf(itext)) {
		l = otext.indexOf(itext, itext.length);
	}
	return full ? otext.length : (l === -1 ? otext.length : l);
}

function dedeep(parent, common, node, offset) {
	"use strict";
	let text = node.wholeText !== undefined ? node.wholeText : node.outerHTML;
	let end = -text.substring(offset, text.length).length;
	do {
		let prevnode = node.previousSibling;
		let all = false;
		do {
			end += taglength(node, all);
			prevnode = node.previousSibling;
			all = prevnode ? prevnode.nodeType == 1 : false;
			if (prevnode) {
				node = prevnode;
			}
		} while (prevnode !== null);
		if (node.parentNode != parent) {
			node = node.parentNode;
		} else {
			end -= taglength(node);
		}
	} while (node.parentNode != parent && node != parent);
	end += taglength(node);
	node = node.previousSibling;
	while (node) {
		let otext = node.wholeText !== undefined ? node.wholeText : node.outerHTML;
		end += otext.length;
		node = node.previousSibling;
	}
	return end;
}

function textarea(parent, opts) {
	"use strict";
	var carea = $('<div class="itextarea-cords"/>');
	if (opts.coord) {
		carea.insertAfter(parent);
	}
	$(parent).bind('keyup mouseup', function (ev) {
		let ini = window.performance.now();
		var ranges = [];
		var selection = window.getSelection();
		for (let i = 0; i < selection.rangeCount; i++) {
			let range = selection.getRangeAt(i);
			ranges.push({
				selectors: {
					start: getSelector(parent, range.startContainer),
					end: getSelector(parent, range.endContainer),
					node: {
						start: nodeOffset(range.startContainer),
						end: nodeOffset(range.endContainer)
					},
					startOffset: range.startOffset,
					endOffset: range.endOffset
				},
				start: dedeep(parent, range.commonAncestorContainer, range.startContainer, range.startOffset),
				end: dedeep(parent, range.commonAncestorContainer, range.endContainer, range.endOffset),
				rang: range
			});
		}
		$(parent).data('rang', ranges);
		let end = window.performance.now();
		if (opts.performace) {
			console.log("iTextArea analysis:", end - ini, 'ms');
		}
		if (opts.coord) {
			carea.html(ranges[0].start + "," + ranges[0].end);
		}
		if (opts.debug) {
			carea.append('<textarea style="width:600px;display:block;">' + parent.innerHTML.substring(0, ranges[0].start) + '</textarea>');
			carea.append('<textarea style="width:600px;display:block;">' + parent.innerHTML.substring(ranges[0].start, ranges[0].end) + '</textarea>');
			carea.append('<textarea style="width:600px;display:block;">' + parent.innerHTML.substring(ranges[0].end, $(parent).html().length) + '</textarea>');
		}
	});
}
export default (function ($) {
	$.fn.toTextArea = function (cfg) {
		cfg = $.extend({}, {
			coord: false,
			performace: false,
			debug: false
		}, cfg);
		$(this).attr('contenteditable', true);
		$(this).each(function () {
			new textarea(this, cfg);
			return $(this);
		});
	};
	$.fn.getSelection = function (n) {
		if ($(this).data('rang')) {
			return $(this).data('rang')[n];
		}
		return {};
	};
	Object.defineProperty($.fn, "selection", {
		get: function () {
			return $(this).data('rang')[0];
		}
	});
	$.fn.RestoreRange = function (rang) {
		let sel = window.getSelection();
		sel.removeAllRanges();
		let range = document.createRange();
		let selectors = rang.selectors;
		if (selectors === undefined) {
			return;
		}
		let start = this.get(0).querySelector(selectors.start).childNodes[selectors.node.start];
		let end = this.get(0).querySelector(selectors.end).childNodes[selectors.node.end];

		if (start.nodeType === 1) {
			start = start.childNodes[0];
		}
		if (end.nodeType === 1) {
			end = end.childNodes[end.childNodes.length - 1];
		}
		range.setStart(start, selectors.startOffset);
		range.setEnd(end, selectors.endOffset);
		sel.addRange(range);
	};
})(jQuery);