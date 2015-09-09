function taglength(node, full) {
	"use strict";
	let otext = node.wholeText != undefined ? node.wholeText : node.outerHTML;
	let itext = node.innerHTML != undefined ? node.innerHTML : node.innerText;
	let l = otext.indexOf(itext);;
	if (otext.indexOf(itext) != otext.lastIndexOf(itext)) {
		l = otext.indexOf(itext, itext.length);
	}
	return full ? otext.length : (l == -1 ? otext.length : l);
}

function dedeep(parent, common, node, offset) {
	"use strict";
	let text = node.wholeText != undefined ? node.wholeText : node.outerHTML;
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
		} while (prevnode != null);
		if (node.parentNode != parent) {
			node = node.parentNode;
		} else {
			end -= taglength(node);
		}
	} while (node.parentNode != parent && node != parent);
	end += taglength(node);
	node = node.previousSibling;
	while (node) {
		let otext = node.wholeText != undefined ? node.wholeText : node.outerHTML;
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
					start:	dedeep(parent, range.commonAncestorContainer, range.startContainer, range.startOffset),
					end:	dedeep(parent, range.commonAncestorContainer, range.endContainer, range.endOffset),
					rang:	range
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
	(function ($) {
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
		}
		$.fn.getSelection = function (n) {
			if ($(this).data('rang')) {
				return $(this).data('rang')[n];
			}
		}
		Object.defineProperty($.fn, "selection", {
			get: function () {
				return $(this).data('rang')[0];
			}
		});
	})(jQuery);
