"use strict";
let keys = {
	"8": "CARRY",
	"13": "ENTER",
	"16": "SHIFT",
	"17": "CTRL",
	"18": "ALT",
	"27": "ESC",
	"37": "LEFT",
	"38": "UP",
	"39": "RIGTH",
	"40": "DOWN",
	"91": "CMD"
};
for (let i = 112; i < (112 + 12); i++) {
	keys[i.toString()] = "F" + (i - 111);
}
let routekey = {
	"CTRL": "CMD",
	"CMD": "CTRL"
};
let keyhandler = function (el, settings) {
	el.data('events', {});
	el.bind("keydown", function (e, routedevent) {
		e = routedevent || e;
		let currkeys = el.data('keys') || {};
		let currkey = keys[e.which.toString()] || String.fromCharCode(e.which) || e.which || false;
		currkeys[currkey] = currkey;
		el.data('keys', currkeys);
		let trigger = [];
		for (let i in currkeys) {
			trigger.push(currkeys[i])
		};
		trigger = trigger.join('+');
		console.log(trigger);
		trigger = el.data('events')[trigger];
		if (!!trigger) {
			e.preventDefault();
			if (!trigger(e)) {
				e.stopImmediatePropagation();
				e.stopPropagation();
				return false;
			}
			return true;
		}
	}).bind("keyup", function (e, routedevent) {
		if (!e.which) {
			el.data('keys', {});
		} else {
			e = routedevent || e;
			let currkeys = el.data('keys') || [];
			let currkey = keys[e.which.toString()] || String.fromCharCode(e.which) || e.which || false;
			delete currkeys[currkey];
			el.data('keys', currkeys);
			switch(currkey){
				case "CTRL":case "CMD":
					el.data('keys', []);
					break;
			}

		}
	}).bind('blur', function (e) {
		console.log("LOST FOCUS");
		el.data('keys', {});
	});
	return el;
};
(function ($) {
	"use strict";
	$.fn.keyhandler = function (settings) {
		var config = {
			ESC: false,
			ENTER: false
		}
		config = $.extend({}, config, settings);
		$(this).each(function () {
			return new keyhandler($(this), settings);
		});
	}
	Object.defineProperty($.fn, "keypressed", {
		get: function () {
			return $(this).data('keys');
		}
	});
	Object.defineProperty($.fn, "keys", {
		get: function () {
			let that = this;
			return {
				bind: function (keysequence, fn) {
					keysequence = keysequence.toUpperCase();
					that.data('events')[keysequence] = fn;
					var cmds = keysequence.split('+');
					for (let i in cmds) {
						if (!!routekey[cmds[i]]) {
							cmds[i] = routekey[cmds[i]];
							console.log("ROUTING: " + cmds.join('+'));
							that.data('events')[cmds.join('+')] = fn;
						}
					}
				}
			};
		}
	});
})(jQuery);
