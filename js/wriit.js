{
	"use strict";
	//GUI enums
	var GPEGui = {
		engine: {
			micro: 1,
			mini: 2,
			normal: 3,
			extended: 4
		},
		visual: {
			onselection: 1,
			always: 2,
			alternate: 3
		}
	};
	var GPETags = {
		command: 0,
		span: 1,
		id: 2,
		tag: 3,
		paragraph: 10,
		multiSpan: 11,
		multiClass: 12,
		multiName: 13,
		onlyInsert: 21,
		multiOnlyInsert: 31,
		list: 51
	};
	//1-10 Apertura y Cierre
	//11-20 Apertura y Cierre, Múltiples Valores
	//21-30 Apertura
	//31-40 Apertura, Múltiples Valores
	//51-xxx Todas las demás(Definir Independientemente)

	function findNT(txt, tag) {
		var so = regexp("[__Tag__]");
		var x = txt.replace(regexp(tag, "g"), "[__Tag__]");
		x = x.match(so);
		return x ? x.length : 0;
	}

	function str_replace(search, replace, subject) {
		var f = search,
			r = replace,
			s = subject;
		var ra = r instanceof Array,
			sa = s instanceof Array,
			f = [].concat(f),
			r = [].concat(r),
			i = (s = [].concat(s)).length;

		while (j = 0, i--) {
			if (s[i]) {
				while (s[i] = (s[i] + '').split(f[j]).join(ra ? r[j] || "" : r[0]), ++j in f) {};
			}
		};
		return sa ? s : s[0];
	};

	function regexp(txt) {
		var f = ["[", "/", "]", "-"],
			r = ["\\[", "\/", "\\]", "."],
			s = txt;
		var ra = r instanceof Array,
			sa = s instanceof Array,
			f = [].concat(f),
			r = [].concat(r),
			i = (s = [].concat(s)).length;

		while (j = 0, i--) {
			if (s[i]) {
				while (s[i] = (s[i] + '').split(f[j]).join(ra ? r[j] || "" : r[0]), ++j in f) {};
			}
		};
		return RegExp(sa ? s : s[0], "g");
	}

	var totalGPET = 0;
	var _i = '<li id="i" name="em" value="3"></li>';
	var _u = '<li id="u" value="1" extra=\'style:text-decoration:underline\'></li>';
	var _t = '<li id="t" value="1" extra=\'style:text-decoration:line-through\'></li>';
	var _o = '<li id="o" value="1" extra=\'style:text-decoration:overline\'></li>';
	var _sub = '<li id="sub" value="2"></li>';
	var _sup = '<li id="sup" value="2"></li>';
	var _ul = '<li id="ul" value="51"></li>';
	var _ol = '<li id="ol" value="51"></li>';
	var _size = '<li id="fontsize" value="11" extra=\'style:font-size\'></li>';
	var _color = '<li id="color" value="11" extra=\'style:color\' class="cboton"></li>';
	var _highlight = '<li id="highlight" value="11" extra=\'style:background-color\' class="cboton" sCI="background-color"></li>';
	var _shadow = '<li id="textshadow" value="11" extra=\'style:text-shadow:(.*?) 1px 1px 1px\' class="cboton" sCI="text-shadow"></li>';
	var _l = '<li id="L" extra="style:text-align:left" value="10"></li>';
	var _c = '<li id="C" extra="style:text-align:center" value="10"></li>';
	var _r = '<li id="R" extra="style:text-align:right" value="10"></li>';
	var _j = '<li id="J" extra="style:text-align:justify" value="10"></li>';
	var _cite = '<li id="cite" value="2"></li>';
	var _quote = '<li id="quote" name="q" value="3"></li>';
	var _e = '<li id="b" name="strong" value="3"></li>';
	var _emotic = '<li id="emotic" name="span" value="31" extra=\'src\'></li>';
	var _hl = '<li id="hr" name="hr" value="21"></li>';
	var _unformat = '<li id="unformart" value="0"></li>';

	var template = '<section class="wriit-box"><menu></menu><div data-wriit-role="text-area"></div><div class="tagi"></div></section>';
	var installedplugins = [ /*'pasteEvent', 'bold', 'italic', 'underline', 'strikethrough', 'pown', 'subindex'*/, 'undo', 'redo', 'paragraph'];

	function createTAG(parent, button) {
			var data = button.data('tagdata');
			var tag = data.id,
				name = data.tag,
				type = data.kind,
				extra = data.class,
				that = this;
			if (type == GPETags.span || type == GPETags.multiSpan) tag = "span";

			if (type < GPETags.onlyInsert) {
				var fns = that.textarea.data('fns') || {};
				fns[tag] = function () {
					tagAnalysisV3.apply(that, [parent, tag]);
				};
				that.textarea.data('fns', fns);
				that.textarea.bind('keyup mouseup', fns[tag]);
			}
			var tmp = {
				active: false,
				type: type,
				oSeudoHTML: "",
				cSeudoHTML: "",
				eSeudoHTML: "",
				rSeudoHTML: "",
				oHTML: "",
				cHTML: "",
				eHTML: "",
				rHTML: "",
				oPSC: "",
				cPSC: "",
				ePSC: "",
				rPSC: "",
				BBC: "",
				attribute: ""
			}
			if (extra == null) {
				extra = "";
			} else if (extra.indexOf(".") > -1) {
				extra = extra.replace(".", ' class="') + '"';
			}
			switch (type) {
			case GPETags.tag:
				if (!tmp.tag || !name) return null;
				tmp.oSeudoHTML = "<" + name + ">";
				tmp.cSeudoHTML = "</" + name + ">";
				tmp.oHTML = "<" + name + extra + ">";
				tmp.cHTML = "<" + name + ">";
				tmp.oPSC = "[" + tmp.tag + "]";
				tmp.cPSC = "[/" + tmp.tag + "]";

				tmp.eSeudoHTML = regexp("( ?)" + tmp.oSeudoHTML + "( ?)(.*?)( ?)" + tmp.cSeudoHTML + "( ?)");
				tmp.rSeudoHTML = "$1$2" + tmp.oSeudoHTML + "$3" + tmp.cSeudoHTML + "$4$5";
				tmp.rHTML = "$1$2" + tmp.oHTML + "$3" + tmp.cHTML + "$4$5";
				tmp.rPSC = "$1$2" + tmp.oPSC + "$3" + tmp.cPSC + "$4$5";
				break;
			case GPETags.id:
			case GPETags.list:
				if (!id) return null;
				tmp.oSeudoHTML = "<" + id + ">";
				tmp.cSeudoHTML = "</" + id + ">";
				tmp.oHTML = tmp.oSeudoHTML;
				tmp.cHTML = tmp.cSeudoHTML;
				tmp.oPSC = "[" + id + "]";
				tmp.cPSC = "[/" + id + "]";

				tmp.eSeudoHTML = regexp("( ?)" + tmp.oSeudoHTML + "( ?)(.*?)( ?)" + tmp.cSeudoHTML + "( ?)");
				tmp.rSeudoHTML = "$1$2" + tmp.oSeudoHTML + "$3" + tmp.cSeudoHTML + "$4$5";
				tmp.rHTML = "$1$2" + tmp.oHTML + "$3" + tmp.cHTML + "$4$5";
				tmp.rPSC = "$1$2" + tmp.oPSC + "$3" + tmp.cPSC + "$4$5";
				break;
			case GPETags.multiClass:
				if (!name) return null;
				tmp.oSeudoHTML = "<" + name + extra + ">";
				tmp.cSeudoHTML = "</" + name + ">";
				tmp.oHTML = "<" + name + extra + ">";
				tmp.cHTML = tmp.cSeudoHTML;
				tmp.oPSC = "[" + name + ":(.*?)]";
				tmp.cPSC = "[/" + name + "]";

				tmp.eSeudoHTML = regexp("( ?)" + tmp.oSeudoHTML + "( ?)(.*?)( ?)" + tmp.cSeudoHTML + "( ?)");
				tmp.rSeudoHTML = "$1$3" + str_replace("(.*?)", "$2", tmp.oSeudoHTML) + "$4" + tmp.cSeudoHTML + "$5$6";
				tmp.rHTML = "$1$3" + str_replace("(.*?)", "$2", tmp.oHTML) + "$4" + tmp.cHTML + "$5$6";
				tmp.rPSC = "$1$3" + str_replace("(.*?)", "$2", tmp.oPSC) + "$4" + tmp.cPSC + "$5$6";
				break;
			case GPETags.multiOnlyInsert:
				if (!id || !name) return null;
				self.attr('data-button', 'moi');
				tmp.oSeudoHTML = "<" + id + extra + "/>";
				tmp.oHTML = "<" + name + extra + "/>";
				tmp.oPSC = "[" + id + ":(.*?)]";

				tmp.eSeudoHTML = regexp("( ?)" + tmp.oSeudoHTML + "( ?)(.*?)( ?)" + tmp.cSeudoHTML + "( ?)");
				tmp.rSeudoHTML = "$1$3" + str_replace("(.*?)", "$2", tmp.oSeudoHTML) + "$4" + tmp.cSeudoHTML + "$5$6";
				tmp.rHTML = "$1$3" + str_replace("(.*?)", "$2", tmp.oHTML) + "$4" + tmp.cHTML + "$5$6";
				tmp.rPSC = "$1$3" + str_replace("(.*?)", "$2", tmp.oPSC) + "$4" + tmp.cPSC + "$5$6";
				break;
			case GPETags.span:
				if (!id || !tmp.tag) return null;
				tmp.oSeudoHTML = "<" + id + extra + ">";
				tmp.cSeudoHTML = "</" + id + ">"
				tmp.oHTML = "<" + tmp.tag + extra + ">";
				tmp.cHTML = "</" + tmp.tag + ">";
				tmp.oPSC = "[" + id + "]";
				tmp.cPSC = "[/" + id + "]";

				tmp.eSeudoHTML = regexp("( ?)" + tmp.oSeudoHTML + "( ?)(.*?)( ?)" + tmp.cSeudoHTML + "( ?)");
				tmp.rSeudoHTML = "$1$2" + tmp.oSeudoHTML + "$3" + tmp.cSeudoHTML + "$4$5";
				tmp.rHTML = "$1$2" + tmp.oHTML + "$3" + tmp.cHTML + "$4$5";
				tmp.rPSC = "$1$2" + tmp.oPSC + "$3" + tmp.cPSC + "$4$5";
				break;
			case GPETags.multiSpan:
				if (!id || !tag) return null;
				tmp.oSeudoHTML = "<" + id + extra + ">";
				tmp.cSeudoHTML = "</" + id + ">"
				tmp.oHTML = "<" + tmp.tag + extra + ">";
				tmp.cHTML = "</" + tmp.tag + ">";
				tmp.oPSC = "[" + id + ": (.*?)]";
				tmp.cPSC = "[/" + id + "]";

				tmp.eSeudoHTML = regexp("( ?)" + tmp.oSeudoHTML + "( ?)(.*?)( ?)" + tmp.cSeudoHTML + "( ?)");
				tmp.rSeudoHTML = "$1$3" + str_replace("(.*?)", "$2", tmp.oSeudoHTML) + "$4" + tmp.cSeudoHTML + "$5$6";
				tmp.rHTML = "$1$3" + str_replace("(.*?)", "$2", tmp.oHTML) + "$4" + tmp.cHTML + "$5$6";
				tmp.rPSC = "$1$3" + str_replace("(.*?)", "$2", tmp.oPSC) + "$4" + tmp.cPSC + "$5$6";
				break;
			case GPETags.onlyInsert:
				if (!id || !name) return null;
				tmp.oSeudoHTML = "<" + id + extra + "/>";
				tmp.oHTML = "<" + name + extra + "/>";
				tmp.oPSC = "[" + id + "]";

				tmp.eSeudoHTML = regexp("( ?)" + tmp.oSeudoHTML + "( ?)(.*?)( ?)" + tmp.cSeudoHTML + "( ?)");
				tmp.rSeudoHTML = "$1$2" + tmp.oSeudoHTML + "$3" + tmp.cSeudoHTML + "$4$5";
				tmp.rHTML = "$1$2" + tmp.oHTML + "$3" + tmp.cHTML + "$4$5";
				tmp.rPSC = "$1$2" + tmp.oPSC + "$3" + tmp.cPSC + "$4$5";

				break;
			case GPETags.paragraph:
				if (!id || !extra) return null;
				tmp.oSeudoHTML = "<p" + extra + ">";
				tmp.cSeudoHTML = "</p>"
				tmp.oHTML = "<p" + extra + ">";
				tmp.cHTML = "</p>";
				tmp.oPSC = "[" + id + "]";
				tmp.cPSC = "[/" + id + "]";

				tmp.eSeudoHTML = regexp("( ?)" + tmp.oSeudoHTML + "( ?)(.*?)( ?)" + tmp.cSeudoHTML + "( ?)");
				tmp.rSeudoHTML = "$1$2" + tmp.oSeudoHTML + "$3" + tmp.cSeudoHTML + "$4$5";
				tmp.rHTML = "$1$2" + tmp.oHTML + "$3" + tmp.cHTML + "$4$5";
				tmp.rPSC = "$1$2" + tmp.oPSC + "$3" + tmp.cPSC + "$4$5";
				break;
			}
			if (type) {
				if ((type > 10 && type < 21) || (type > 30 && type < 41)) {
					tmp.dataOtag = tmp.oSeudoHTML.replace(/<|>| |\"|=|;|-|\/|\#/g, "").replace(/:.* /g, "REGEXP");
					dO = tmp.oSeudoHTML.replace(/<|>| |\"|=|;|-|\/|\#/g, "").replace(/.*:(.*)/g, "$1");
					//					$(this).attr('data-otag', dataOtag).gvar('dataOtag', dO);
				} else {
					tmp.dataOtag = tmp.oSeudoHTML.replace(/<|>| |\"|=|;|-|\/|\#/g, "").replace(/:/g, "K");
					//$(this).attr('data-otag', dataOtag).gvar('dataOtag', dataOtag);
				}
				this.plugins[tag] = tmp;
				this.metadata[tag] = {
					deep: 0,
					oSeudoHTML: tmp.oSeudoHTML,
					cSeudoHTML: tmp.cSeudoHTML,
					dataOtag: tmp.dataOtag
				};
				//alert( $(this).gvar('dataOtag') );
				//oSeudoHTML=(oSeudoHTML.replace( />/,' data-sel="true" data-ref="'+id+'">') );
				//$(this).gvar('GPEActive', false)
				//$(this).gvar('GPEConfig', tmp);
			}
		}
		/*
				var extra = $(this).attr("extra");
				if ((type >= 1 && type <= 10) || (type >= 21 && type <= 30)) self.addClass("nboton").attr('data-button', 'normal');
				else if ((type > 20 && type < 50) || (type > 10 && type < 20)) self.attr('data-button', 'multi');
				else self.addClass("boton").attr('data-button', 'undefined');
				var tmp = {
					active: false,
					type: type,
					oSeudoHTML: "",
					cSeudoHTML: "",
					eSeudoHTML: "",
					rSeudoHTML: "",
					oHTML: "",
					cHTML: "",
					eHTML: "",
					rHTML: "",
					oPSC: "",
					cPSC: "",
					ePSC: "",
					rPSC: "",
					BBC: "",
					attribute: ""
				}
				with(tmp) {
					if (extra) {
						extra = extra.split(":");
						if (extra[0] == "style") {
							if (extra[2])
								attribute = extra[1] + ": " + extra[2] + ";"
							else
								attribute = extra[1] + ": (.*?);"
							extra = " " + extra[0] + '="' + attribute + '"';
						} else if (extra[0] == "src") {
							extra = attribute = " " + extra[0] + '="(.*?)"';
						}
					} else extra = "";

					switch (type) {
					case GPETags.name:
						if (!id || !name) return null;
						oSeudoHTML = "<" + id + ">";
						cSeudoHTML = "</" + id + ">";
						oHTML = "<" + name + extra + ">";
						cHTML = "<" + name + ">";
						oPSC = "[" + id + "]";
						cPSC = "[/" + id + "]";

						eSeudoHTML = regexp("( ?)" + oSeudoHTML + "( ?)(.*?)( ?)" + cSeudoHTML + "( ?)");
						rSeudoHTML = "$1$2" + oSeudoHTML + "$3" + cSeudoHTML + "$4$5";
						rHTML = "$1$2" + oHTML + "$3" + cHTML + "$4$5";
						rPSC = "$1$2" + oPSC + "$3" + cPSC + "$4$5";
						break;
					case GPETags.id:
					case GPETags.list:
						if (!id) return null;
						oSeudoHTML = "<" + id + ">";
						cSeudoHTML = "</" + id + ">";
						oHTML = oSeudoHTML;
						cHTML = cSeudoHTML;
						oPSC = "[" + id + "]";
						cPSC = "[/" + id + "]";

						eSeudoHTML = regexp("( ?)" + oSeudoHTML + "( ?)(.*?)( ?)" + cSeudoHTML + "( ?)");
						rSeudoHTML = "$1$2" + oSeudoHTML + "$3" + cSeudoHTML + "$4$5";
						rHTML = "$1$2" + oHTML + "$3" + cHTML + "$4$5";
						rPSC = "$1$2" + oPSC + "$3" + cPSC + "$4$5";
						break;
					case GPETags.multiId:
						if (!id) return null;
						oSeudoHTML = "<" + id + extra + ">";
						cSeudoHTML = "</" + id + ">";
						oHTML = "<" + id + extra + ">";
						cHTML = cSeudoHTML;
						oPSC = "[" + id + ":(.*?)]";
						cPSC = "[/" + id + "]";

						eSeudoHTML = regexp("( ?)" + oSeudoHTML + "( ?)(.*?)( ?)" + cSeudoHTML + "( ?)");
						rSeudoHTML = "$1$3" + str_replace("(.*?)", "$2", oSeudoHTML) + "$4" + cSeudoHTML + "$5$6";
						rHTML = "$1$3" + str_replace("(.*?)", "$2", oHTML) + "$4" + cHTML + "$5$6";
						rPSC = "$1$3" + str_replace("(.*?)", "$2", oPSC) + "$4" + cPSC + "$5$6";
						break;
					case GPETags.multiOnlyInsert:
						if (!id || !name) return null;
						self.attr('data-button', 'moi');
						oSeudoHTML = "<" + id + extra + "/>";
						oHTML = "<" + name + extra + "/>";
						oPSC = "[" + id + ":(.*?)]";

						eSeudoHTML = regexp("( ?)" + oSeudoHTML + "( ?)(.*?)( ?)" + cSeudoHTML + "( ?)");
						rSeudoHTML = "$1$3" + str_replace("(.*?)", "$2", oSeudoHTML) + "$4" + cSeudoHTML + "$5$6";
						rHTML = "$1$3" + str_replace("(.*?)", "$2", oHTML) + "$4" + cHTML + "$5$6";
						rPSC = "$1$3" + str_replace("(.*?)", "$2", oPSC) + "$4" + cPSC + "$5$6";
						break;
					case GPETags.span:
						if (!id || !tag) return null;
						oSeudoHTML = "<" + id + extra + ">";
						cSeudoHTML = "</" + id + ">"
						oHTML = "<" + tag + extra + ">";
						cHTML = "</" + tag + ">";
						oPSC = "[" + id + "]";
						cPSC = "[/" + id + "]";

						eSeudoHTML = regexp("( ?)" + oSeudoHTML + "( ?)(.*?)( ?)" + cSeudoHTML + "( ?)");
						rSeudoHTML = "$1$2" + oSeudoHTML + "$3" + cSeudoHTML + "$4$5";
						rHTML = "$1$2" + oHTML + "$3" + cHTML + "$4$5";
						rPSC = "$1$2" + oPSC + "$3" + cPSC + "$4$5";
						break;
					case GPETags.multiSpan:
						if (!id || !tag) return null;
						oSeudoHTML = "<" + id + extra + ">";
						cSeudoHTML = "</" + id + ">"
						oHTML = "<" + tag + extra + ">";
						cHTML = "</" + tag + ">";
						oPSC = "[" + id + ": (.*?)]";
						cPSC = "[/" + id + "]";

						eSeudoHTML = regexp("( ?)" + oSeudoHTML + "( ?)(.*?)( ?)" + cSeudoHTML + "( ?)");
						rSeudoHTML = "$1$3" + str_replace("(.*?)", "$2", oSeudoHTML) + "$4" + cSeudoHTML + "$5$6";
						rHTML = "$1$3" + str_replace("(.*?)", "$2", oHTML) + "$4" + cHTML + "$5$6";
						rPSC = "$1$3" + str_replace("(.*?)", "$2", oPSC) + "$4" + cPSC + "$5$6";
						break;
					case GPETags.onlyInsert:
						if (!id || !name) return null;
						oSeudoHTML = "<" + id + extra + "/>";
						oHTML = "<" + name + extra + "/>";
						oPSC = "[" + id + "]";

						eSeudoHTML = regexp("( ?)" + oSeudoHTML + "( ?)(.*?)( ?)" + cSeudoHTML + "( ?)");
						rSeudoHTML = "$1$2" + oSeudoHTML + "$3" + cSeudoHTML + "$4$5";
						rHTML = "$1$2" + oHTML + "$3" + cHTML + "$4$5";
						rPSC = "$1$2" + oPSC + "$3" + cPSC + "$4$5";

						break;
					case GPETags.paragraph:
						if (!id || !extra) return null;
						oSeudoHTML = "<p" + extra + ">";
						cSeudoHTML = "</p>"
						oHTML = "<p" + extra + ">";
						cHTML = "</p>";
						oPSC = "[" + id + "]";
						cPSC = "[/" + id + "]";

						eSeudoHTML = regexp("( ?)" + oSeudoHTML + "( ?)(.*?)( ?)" + cSeudoHTML + "( ?)");
						rSeudoHTML = "$1$2" + oSeudoHTML + "$3" + cSeudoHTML + "$4$5";
						rHTML = "$1$2" + oHTML + "$3" + cHTML + "$4$5";
						rPSC = "$1$2" + oPSC + "$3" + cPSC + "$4$5";
						break;
					}
					if (type) {
						if ((type > 10 && type < 21) || (type > 30 && type < 41)) {
							dataOtag = tmp.oSeudoHTML.replace(/<|>| |\"|=|;|-|\/|\#/g, "").replace(/:.* /g, "REGEXP");
							dO = tmp.oSeudoHTML.replace(/<|>| |\"|=|;|-|\/|\#/g, "").replace(/.*:(.*)/g, "$1");
							$(this).attr('data-otag', dataOtag).gvar('dataOtag', dO);
						} else {
							dataOtag = tmp.oSeudoHTML.replace(/<|>| |\"|=|;|-|\/|\#/g, "").replace(/:/g, "K");
							$(this).attr('data-otag', dataOtag).gvar('dataOtag', dataOtag);
						}
						//alert( $(this).gvar('dataOtag') );
						//oSeudoHTML=(oSeudoHTML.replace( />/,' data-sel="true" data-ref="'+id+'">') );
						$(this).gvar('GPEActive', false)
						$(this).gvar('GPEConfig', tmp);
					}
				}
		}*/
	function addtotagi(e) {
		$(this).parent().find('.tagi').html('');
		var x = $(document.getSelection().anchorNode.parentNode);
		var i = 0;
		while (x.get(0) != this) {
			var li = $('<span>' + x.get(0).localName + '</span>');
			$(this).parent().find('.tagi').prepend(li);
			x = x.parent();
		}
	}

	function tagAnalysisV3(area, tag) {
		var tagi = area.find('.tagi');
		var cfg = this.plugins[tag];
		var text = this.html.getSelection(0);

		var bo = findNT(text.pre, cfg.oSeudoHTML);
		var bc = findNT(text.pre, cfg.cSeudoHTML);

		var o = findNT(text.sel, cfg.oSeudoHTML);
		var c = findNT(text.sel, cfg.cSeudoHTML);

		var ao = findNT(text.post, cfg.oSeudoHTML);
		var ac = findNT(text.post, cfg.cSeudoHTML);

		this.plugins[tag].selection = {
			tag: tag,
			isSorrounded: bo - bc == ac - ao && bo - bc > 0,
			isContained: o + c > 1,
			isOpened: o - c > 0,
			isClosed: c - o > 0,
			deep: bo
		};
		this.metadata[tag].deep = bo;
		if (this.plugins[tag].selection.isSorrounded) {
			area.find("[data-wriit-commandId=" + tag + "]").addClass('active');
		} else {
			area.find("[data-wriit-commandId=" + tag + "]").removeClass('active');
		}
	}

	function Wriit(parent, cfg) {
		"use strict";
		let privateData = new WeakMap();
		let props = {
			dataindex: [Object()],
			data: Object()
		};
		let indexes = [Object()];
		var compiled = $(template);
		this.textarea = compiled.find("[data-wriit-role=text-area]");
		this.textarea.html(parent.html());
		parent.replaceWith(compiled);
		this.menu = compiled.find('menu:eq(0)');
		this.cfg = $.extend({}, cfg, {
			plugins: installedplugins
		});
		var that = this;
		var prototype = that.__proto__;
		this.html = {
			get text() {
				return this.getSelection(0).text;
			},
			set text(v) {
				this.getSelection(0).text = v;
			},
			get pre() {
				return this.getSelection(0).pre;
			},
			get sel() {
				return this.getSelection(0).sel;
			},
			get post() {
				return this.getSelection(0).post;
			},
			get selection() {
				return this.getSelection(0).coord;
			},
			getSelection: function (n) {
				n = n || 0
				var html = that.textarea.html();
				var coord = that.textarea.getSelection(n);
				var range = coord.rang;
				return {
					get start() {
						return coord.start;
					},
					get end() {
						return coord.end;
					},
					get pre() {
						return html.substring(0, coord.start);
					},
					get sel() {
						return html.substring(coord.start, coord.end);
					},
					get post() {
						return html.substring(coord.end, html.lentgh);
					},
					get text() {
						return html;
					},
					set text(v) {
						that.textarea.html(v);
					},
					get visual() {
						return range;
					}
				};
			}
		}
		this.selection = function (tagid) {
			return this.plugins[tagid].selection;
		};

		this.textarea.keyhandler();

		{
			"use strict";
			let block = false;
			let initialValue = this.textarea.html().trim();

			function storeInfo(force) {
				let index = privateData.get(compiled.get(0)) || [];
				if (indexes.length == 51) {

				}
				let prop = index[index.length - 1];
				let textvalue = that.textarea.html().trim();
				let data = privateData.get(prop);

				if (data == undefined && textvalue != initialValue) {
					prop = Object();
					privateData.set(prop, initialValue);
					index.push(prop);
					privateData.set(compiled.get(0), index);
					that.buttons['undo'].attr('disabled', false);
					return true;
				} else if (

					(data && Math.abs(textvalue.length - data.length) > 15) || (force && textvalue != data)
				) {
					console.log("Store", textvalue);
					prop = Object();
					privateData.set(prop, textvalue);
					index.push(prop);
					privateData.set(compiled.get(0), index);
					that.buttons['undo'].attr('disabled', false);
					return true;
				}
				return (data != undefined) && (data && data != textvalue);
			}

			function clearInfo() {
				privateData.set(that.textarea.get(0), []);
				that.buttons['redo'].attr('disabled', true);
			}
			compiled.bind('savecontent', function (e) {
				"use strict";
				while (block);
				block = true;
				try {
					if (storeInfo()) {
						clearInfo();
					} else {
						that.buttons['undo'].attr('disabled', true);
					}
				} catch (e) {
					console.log(e);
				}
				block = false;
			});

			function ctrlz() {
				"use strict";
				while (block);
				block = true;
				let stored = storeInfo(true);
				let undos = privateData.get(compiled.get(0));
				let redos = privateData.get(that.textarea.get(0)) || [];

				if (undos.length > 1) {
					if (stored) {
						redos.push(undos.pop());
					}
					let prop = privateData.get(undos[undos.length - 1]);
					privateData.set(that.textarea.get(0), redos);

					that.textarea.html(prop);
					privateData.set(compiled.get(0), undos);
					let sel = window.getSelection();
					sel.removeAllRanges();
					let node = that.textarea.get(0);
					while (node.lastChild) {
						node = node.lastChild;
					}
					that.html.getSelection(0).visual.setStartBefore(node);
					that.html.getSelection(0).visual.setEndBefore(node);
					sel.addRange(that.html.getSelection(0).visual);

					that.buttons['redo'].attr('disabled', false);
				}
				block = false;
				//		$(this).trigger('keyup', e);
				return false;

			}
			this.textarea.keys.bind("CMD+Z", ctrlz);
			prototype.undo = {
				setup: function () {
					this.button('undo', 'fa fa-undo', 'Undo');
					that.buttons['undo'].attr('disabled', true);
					this.callback('undo', ctrlz);
				}
			};
			prototype.redo = {
				setup: function () {
					this.button('redo', 'fa fa-repeat', 'Repeat');
					that.buttons['redo'].attr('disabled', true);
				}
			};
		}

		this.textarea.toTextArea({
			coord: false,
			debug: false
		});
		this.plugins = {};
		this.buttons = {};
		this.metadata = {};
		this.textarea.bind('keyup mouseup', addtotagi);

		setInterval(function () {
			compiled.trigger('savecontent');
		}, 1000);

		this.cfg.plugins.forEach(function (plugin) {
			prototype[plugin] = $.extend({
				dFR: function (txt, tag) {
					let tmp = txt.split(tag);
					tmp[tmp.length - 2] += tmp[tmp.length - 1];
					tmp.pop();
					txt = tmp[0];
					for (let i = 1; tmp[i]; i++) txt += tag + tmp[i];
					return txt;
				},
				dFL: function (txt, tag) {
					let tmp = txt.split(tag);
					tmp[1] = tmp[0] + tmp[1];
					tmp.shift();
					txt = tmp[0];
					for (let i = 1; tmp[i]; i++) txt += tag + tmp[i];
					return txt;
				},
				rFR: function (txt, tag, newtag) {
					let tmp = txt.split(tag);
					tmp[tmp.length - 2] += newtag + tmp[tmp.length - 1];
					tmp.pop();
					txt = tmp[0];
					for (let i = 1; tmp[i]; i++) txt += tag + tmp[i];
					return txt;
				},
				rFL: function (txt, tag, newtag) {
					let tmp = txt.split(tag);
					tmp[1] = tmp[0] + newtag + tmp[1];
					tmp.shift();
					txt = tmp[0];
					for (let i = 1; tmp[i]; i++) txt += tag + tmp[i];
					return txt;
				},
				deleteTag: function (txt, tag) {
					return str_replace(tag, "", txt);
				},
				tagid: null,
				event: null,
				get selection() {
					return that.plugins[this.tagid].selection;
				},
				get nodeAPI() {
					return {
						childCountorLengtg: function (node) {
							return node.childNodes.length == 0 ? node.textContent.length : node.childNodes.length;
						},
						parentNodeOfType: function (node, tag) {
							while (node && node.localName != that.plugins[tag].dataOtag) {
								node = node.parentNode;
							}
							return node;
						},
						splitTextNode: function (node, x0, x1) {
							var a = document.createTextNode(node.textContent.substring(x0, x1));
							var b = document.createTextNode(node.textContent.substring(x1, node.textContent.length));
							//						node.parentNode.replaceChild(b, node);
							//						b.parentNode.insertBefore(a, b);
							return [a, b];
							//						node.parentNode.removeChild(node);
						},
						makeChildSiblings: function (node) {
							var parent = node.parentNode;
							while (node.childNodes.length > 0) {
								parent.insertBefore(node.childNodes[0], node);
							}
						}
					}
				},
				restore: function () {
					"use strict";
					this.textarea.normalize();
					let sel = window.getSelection();
					sel.removeAllRanges();
					sel.addRange(this.html.getSelection(0).visual);
					$(this.textarea).trigger('keyup', this.event);
				},
				setup: function () {
					return null;
				},
				get metadata() {
					return that.metadata[this.tagid];
				},
				tag: function (id, kind, tag, cclass) {
					this.tagid = id;
					var button = that.menu.find("[data-wriit-commandId=" + id + "]");
					if (button.length == 0) {
						console.debug("Wriit: tag funcition can only be called after .button()");
					} else {
						button.data('tagdata', {
							id: id,
							kind: kind,
							tag: tag,
							class: cclass
						});
						createTAG.apply(that, [compiled, button]);
					}
				},
				button: function (id, _class, tooltip, data) {
					var self = this;
					var button = $('<button data-wriit-commandId="' + id + '" class="' + _class + '"><span>' + tooltip + '</span></button>');
					that.menu.append(button);
					this.tagid = id;
					that.buttons[id] = button;
				},
				callback: function (fnid, fn, shortcut) {
					this.tagid = fnid;
					var button = that.menu.find("[data-wriit-commandId=" + fnid + "]");
					var self = this;
					var fns = button.data('fns') || {};
					fns[fnid] = fn;
					button.data('fns', fns);
					button.bind('click', function (e, routedevent) {
						this.event = routedevent || e;
						return fn.apply(self, [routedevent || e]);
					});
					if (!!shortcut) {
						that.textarea.keys.bind(shortcut, function (e) {
							var button = that.menu.find("[data-wriit-commandId=" + fnid + "]");
							button.trigger('click', e);
							return false;
						});
					}
				},
				compareNodes: function (original, modified, tag) {
					"use strict";
					if (original.childNodes.length === 0) {
						return;
						original
					}
					if (original.childNodes.length == modified.childNodes.length) {
						let uglyduck = false;
						for (let i in original.childNodes) {
							if (!original.childNodes[i].isEqualNode(modified.childNodes[i])) {
								original.replaceChild(modified.childNodes[i], original.childNodes[i]);
								return;
							}
						}
					}

					if (original.childNodes.length != modified.childNodes.length) {
						original.parentNode.replaceChild(modified, original);
						for (let i in modified.childNodes) {
							if (modified.childNodes[i].localName === tag) {
								return modified.childNodes[i];
							}
						}
					} else {
						for (let i in original.childNodes) {
							var nnode = this.compareNodes(original.childNodes[i], modified.childNodes[i]);
							if (nnode != null) {
								return nnode;
							}
						}
					}
					return null;
				},
				get textarea() {
					return that.textarea.get(0);
				},
				insert: function (e) {
					"use strict";
					let selection = this.selection;
					let text = this.html.getSelection(0);
					let visual = text.visual;
					let metadata = this.metadata;
					let ini = text.pre,
						sel = text.sel,
						end = text.post;
					if (selection.isSorrounded && !sel) {
						ini = this.dFR(ini, metadata.oSeudoHTML);
						end = this.dFL(end, metadata.cSeudoHTML);
					} else if (selection.isSorrounded && sel && (selection.isContained + selection.isOpened + selection.isClosed)) {
						sel = this.deleteTag(sel, metadata.oSeudoHTML);
						sel = this.deleteTag(sel, metadata.cSeudoHTML);
					} else if (selection.isSorrounded && sel) {
						ini = this.dFR(ini, metadata.oSeudoHTML);
						end = this.dFL(end, metadata.cSeudoHTML);
					} else if (sel) {
						sel = this.deleteTag(sel, metadata.oSeudoHTML);
						sel = this.deleteTag(sel, metadata.cSeudoHTML);
						if (selection.isOpened) {
							ini = ini + metadata.oSeudoHTML;
						} else if (selection.isClosed) {
							end = metadata.cSeudoHTML + end;
						} else if (selection.isContained) {
							ini = ini + metadata.oSeudoHTML;
							end = metadata.cSeudoHTML + end;
						} else {
							ini += metadata.oSeudoHTML;
							end = metadata.cSeudoHTML + end;
						}
					}
					if (sel.length + selection.isSorrounded + selection.isClosed + selection.isContained + selection.isOpened) {
						let node = visual.commonAncestorContainer;
						while (node.parentNode != this.textarea) {
							node = node.parentNode;
						}
						var newnode = $('<section>' + ini + '<sel>' + sel + '</sel>' + end + '</section>').get(0);
						this.compareNodes(this.textarea, newnode, metadata.dataOtag);
						let selectnode = $(this.textarea).find('sel').get(0);
						if (selectnode.childNodes.length > 0) {
							this.nodeAPI.makeChildSiblings(selectnode);
							let parent = selectnode.parentNode;
							parent.removeChild(selectnode);
							visual.setStart(parent.childNodes[0], 0);
							let n = this.nodeAPI.childCountorLengtg(parent);
							visual.setEnd(parent.childNodes[n - 1], this.nodeAPI.childCountorLengtg(parent.childNodes[n - 1]));
						} else {
							visual.setStart(selectnode.nextSibling || selectnode.previousSibling || selectnode, 0);
							visual.setEnd(selectnode.nextSibling || selectnode.previousSibling || selectnode, 0);
							selectnode.parentNode.removeChild(selectnode);
						}
					}
					this.restore();
				},
				html: that.html
			}, prototype[plugin]);
			prototype[plugin].setup();
		});

	};
	Wriit.prototype.pasteEvent = {
		setup: function () {
			var that = this;
			var clipboard = $('<textarea style="display:none;">');
			clipboard.insertAfter($(this.textarea));
			$(this.textarea).bind("paste", false, function (e) {
				var paste = "";
				var o = e;
				e = e.originalEvent;
				if (/text\/html/.test(e.clipboardData.types)) {
					paste = e.clipboardData.getData('text/html');
					paste = paste.replace("<meta charset='utf-8'>", function (str) {
						return '';
					});
					paste = paste.replace(/<span class="Apple-converted-space">.<\/span>/g, function (str) {
						return ' ';
					});
					paste = paste.replace(/<span[^>]*>([^<]*)<\/span>/g, function (str, ct) {
						return ct;
					});
					paste = paste.replace(/ style=".[^>]*"/g, function (str, ct) {
						return '';
					});
					e.clipboardData.clearData();
					e.clipboardData.items = [];
					clipboard.html(paste);
					paste = $('<section>' + paste + '</section>').get(0);
					//				e.clipboardData.setData('text/html',paste);
				} else if (/text\/plain/.test(e.clipboardData.types)) {
					paste = e.clipboardData.getData('text/plain');
				}
				var end = paste.childNodes[that.nodeAPI.childCountorLengtg(paste) - 1];
				while (paste.childNodes.length > 0) {
					e.target.parentNode.insertBefore(paste.childNodes[0], e.target);
				}
				that.html.getSelection(0).visual.setStart(end, that.nodeAPI.childCountorLengtg(end));
				that.html.getSelection(0).visual.setEnd(end, that.nodeAPI.childCountorLengtg(end));
				that.restore();
				return false;
			});
		},
	};
	Wriit.prototype.bold = {
		setup: function () {
			this.button('bold', 'fa fa-bold', "Bold");
			this.tag('bold', GPETags.tag, 'strong', null);
			this.callback('bold', this.insert);
		},
		destroy: function () {}
	};
	Wriit.prototype.subindex = {
		setup: function () {
			this.button('subindex', 'fa fa-subscript', 'Sub Index');
			this.tag('subindex', GPETags.tag, 'sub', null);
			this.callback('subindex', this.insert);
		}
	};
	Wriit.prototype.pown = {
		setup: function () {
			this.button('pown', 'fa fa-superscript', 'Super Index');
			this.tag('pown', GPETags.tag, 'sup', null);
			this.callback('pown', this.insert);
		}
	};
	Wriit.prototype.italic = {
		setup: function () {
			this.button('italic', 'fa fa-italic', 'Italic');
			this.tag('italic', GPETags.tag, 'em', null);
			this.callback('italic', this.insert);
		}
	};
	Wriit.prototype.underline = {
		setup: function () {
			this.button('underline', 'fa fa-underline', 'Underline');
			this.tag('underline', GPETags.tag, 'u', null);
			this.callback('underline', this.insert, "ALT+SHIFT+U");
		}
	};
	Wriit.prototype.strikethrough = {
		setup: function () {
			this.button('strikethrough', 'fa fa-strikethrough', 'Strike Through');
			this.tag('strikethrough', GPETags.tag, 'del', null);
			this.callback('strikethrough', this.insert, "ALT+SHIFT+S");
		}
	};

	Wriit.prototype.paragraph = {
		setup: function () {
			this.button('paragraph', 'fa fa-align-left', 'Aling Left');
			this.tag('paragraph', GPETags.multiClass, 'p', '.text-left');
			this.callback('paragraph', this.insert, "ALT+SHIFT+L");
		}
	};
}
$.fn.wriit = function (cfg) {
	$(this).each(function () {
		return new Wriit($(this), cfg);
	});
};