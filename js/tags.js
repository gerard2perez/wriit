"use strict";

function regexp(txt) {
	var f = ["[", "/", "]", "-"],
		r = ["\\[", "\/", "\\]", "."],
		s = txt;
	var ra = r instanceof Array,
		sa = s instanceof Array,
		f = [].concat(f),
		r = [].concat(r),
		i = (s = [].concat(s)).length,
		j = 0;

	while (j = 0, i--) {
		if (s[i]) {
			while (s[i] = (s[i] + '').split(f[j]).join(ra ? r[j] || "" : r[0]), ++j in f) {};
		}
	};
	return RegExp(sa ? s : s[0], "g");
}
/*
Object.defineProperty($.fn, "keypressed", {
		get: function () {
			return $(this).data('keys');
		}
	});
*/
function Basic(id, tag, attributes) {
	attributes = attributes || {};
	this.Id = id;
	this.TagName = tag;
	
	this.Shortcut = attributes.shortcut || null;
	delete attributes["shortcut"];
	
	this.ToolTip = attributes.tooltip || null;
	delete attributes["tooltip"];
	
	this.DisplayClass = attributes.displayclass || null;
	delete attributes["displayclass"];
	
	this.Attr = attributes;
	this.CloseTag = '</' + tag + '>';
	
	let reg = "<"+tag;
	for (let prop in attributes) {
		tag += ' ' + prop + '="' + attributes[prop] + '"';
		reg += ' ' + prop + '="(.*?)"' ;
	}
//	rSeudoHTML = "$1$2" + oSeudoHTML + "$3" + cSeudoHTML + "$4$5";
	this.MatchTag = regexp(reg+'>(.*?)'+this.CloseTag);
	this.FullMatch = regexp('<' + tag + '>(.*?)'+this.CloseTag)
	this.OpenTag = '<' + tag + '>';
	
	this.AttrMatch=function(attr,value){
		return this.Attr[attr] === value;
	}
	
	this.isInstance=function(htmlnode){
		if(htmlnode.tagName.toLowerCase() != this.TagName.toLowerCase()){
			return false;
		}
		for(let prop in this.Attr){
			if( htmlnode.attributes[prop].value != this.Attr[prop] )return false;
		}
		return true;
	}
	
}

function MultiClass(id, tag) {
	this.Id = id;
	this.TagName = tag;
	this.MatchTag = regexp('<'+tag+' class="(.*?)">(.*?)</'+tag+'>');
	this.children = {};
	this.FindByClass=function(classname){
		for(let child in this.children){
			if(this.children[child].AttrMatch("class",classname)){
				return this.children[child];
			}
		}
	}
	this.Add = function (subid, classname, attributes) {
		attributes = attributes || {};
		attributes.class = classname;
		this.children[subid] = new Basic(this.Id + "_" + subid, this.TagName, attributes);
		//Object.defineProperty(this, subid, new Basic(this.Id, this.TagName, {class: classname}) );
	}
	this.Remove = function (clasname) {
		delete this.children[subid];
	}
}