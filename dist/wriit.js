(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*global document,$,Many,MultiAttr*/'use strict';Object.defineProperty(exports,'__esModule',{value:true});var _createClass=(function(){function defineProperties(target,props){for(var i=0;i < props.length;i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};})();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}}var _tags=require('./tags');function test(){alert('click');}function makeChildSiblings(node){var parent=node.parentNode;while(node.childNodes.length > 0) {parent.insertBefore(node.childNodes[0],node);}}var _default=(function(){function _default(editor){_classCallCheck(this,_default);this.Editor = editor;this.Tag = {};this.ApplyValue = null;this.BeforeFormat = undefined;this.AfterFormat = undefined;this.TearDown = undefined;this.Setup = undefined;this.Namespace = null;}_createClass(_default,[{key:'Insert',value:function Insert(e,textarea){var _this=this;var selection=this.Selection;var visual=this.Visual;if(visual.collapsed && selection.isSorrounded){var oldnode=visual.startContainer.parentNode;while(!this.Tag.isInstance(oldnode)) {oldnode = oldnode.parentNode;}if(this.Tag.CanRemove(oldnode,this.Attribute)){makeChildSiblings(oldnode);oldnode.remove();this.Editor.ToolBar.UnSelect(this.Tag);}else {this.Tag.Update(oldnode,this.Attribute);}}else if(selection.isSorrounded){var oldnode=visual.startContainer.parentNode;while(!this.Tag.isInstance(oldnode) && oldnode != textarea) {oldnode = oldnode.parentNode;}if(oldnode != textarea){this.Tag.Update(oldnode,this.Attribute);}this.Editor.ToolBar.Select(this.Tag);}else {(function(){var newel=_this.Tag['new'](_this.Attribute);newel.appendChild(visual.extractContents());visual.insertNode(newel);if(_this.Tag.isInstance(newel.nextSibling)){var sibling=newel.nextSibling;Array.prototype.forEach.call(sibling.childNodes,function(innerchild){newel.appendChild(innerchild);});sibling.remove();}if(_this.Tag.isInstance(newel.previousSibling)){var sibling=newel.previousSibling;Array.prototype.forEach.call(sibling.childNodes,function(innerchild){newel.insertBefore(innerchild,newel.firstChild);});sibling.remove();}if(selection.isContained + selection.isOpened + selection.isClosed){var cleannode=visual.extractContents().firstChild;var inner=cleannode.querySelectorAll(_this.Tag.TagName);for(var i=0;i < inner.length;i++) {makeChildSiblings(inner[i]);inner[i].remove();}visual.insertNode(newel);}var start=newel.childNodes[0];var end=newel.childNodes[newel.childNodes.length - 1]; //visual.selectNodeContents(newel);
visual.setStart(start,0);visual.setEnd(end,end.length);_this.Editor.ToolBar.Select(_this.Tag);})();}this.Editor.RestoreSelection();}},{key:'Callback',value:function Callback(tag,fn){var button=tag.button;var mod=this;function Hanlder(tag,attribute){return function(e,routedevent){mod.Tag = tag;mod.Attribute = attribute;this.event = routedevent || e;if(mod.BeforeFormat !== undefined){mod.BeforeFormat.apply(mod,[routedevent || e]);}var res=fn.apply(mod,[routedevent || e,mod.Editor.textarea.get(0)]);mod.Editor.AddToHistory(mod.Editor.textarea,true);if(mod.AfterFormat !== undefined){mod.AfterFormat.apply(mod,[routedevent || e]);}return res;};}function ManyHandler(minibutton){minibutton.button.addEventListener('click',Hanlder(tag,minibutton));}if(tag instanceof _tags.Single){button.addEventListener('click',Hanlder(tag,null));}else if(tag instanceof _tags.ClassTag){for(var prop in tag.children) {tag.children[prop].button.addEventListener('click',Hanlder(tag,tag.children[prop]));}}else {for(var prop in tag.children) {tag.children[prop].forEach(ManyHandler);}}if(!!tag.Shortcut){this.Editor.textarea.keys.bind(tag.Shortcut,function(e){$(button).trigger('click',e);return false;});}}},{key:'Selection',get:function get(){return this.Tag.SuperId !== undefined?this.Editor.Modules[this.Tag.SuperId]:this.Editor.Modules[this.Tag.Id];}},{key:'Visual',get:function get(){return this.Editor.html.getSelection(0).visual;}}]);return _default;})();exports['default'] = _default;module.exports = exports['default'];
},{"./tags":26}],2:[function(require,module,exports){
'use strict';Object.defineProperty(exports,'__esModule',{value:true});var _createClass=(function(){function defineProperties(target,props){for(var i=0;i < props.length;i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};})();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}}var _tags=require('./tags');var _utils=require('./utils');var mouseenter=function mouseenter(){this.classList.add('hover');};var mouseleave=function mouseleave(){this.classList.remove('hover');};var _default=(function(){function _default(editor){_classCallCheck(this,_default);this.Editor = editor;}_createClass(_default,[{key:'PreRender',value:function PreRender(tag){var button=tag.button;switch(tag.Render){case _tags.Engine.square:case _tags.Engine.list:button.setAttribute("class",tag.IconClass);var preview=document.createElement('span');var menu=document.createElement('menu');var label=document.createElement('span');label.innerHTML = tag.ToolTip;preview.classList.add('preview');button.appendChild(preview);menu.appendChild(label);button.appendChild(menu);return menu;}}},{key:'Render',value:function Render(tag){var button=tag.button;switch(tag.Render){case _tags.Engine.button:button.setAttribute("class",tag.IconClass);button.attributes.tooltip = tag.ToolTip;(0,_utils.tooltip)(button);return button;case _tags.Engine.square:button.classList.add('square');button.style.backgroundColor = tag.value;return button;case _tags.Engine.list:button.classList.add('row');if(tag.Engine['class']){var el=tag.parent['new'](tag);el.innerHTML = tag.Engine.text;button.appendChild(el);}return button;}}},{key:'AddButton',value:function AddButton(tag){var that=this;var button=tag.button;var menu=undefined;switch(tag.instaceName){case "Single":button = this.Render(tag);break;case "ClassTag":menu = this.PreRender(tag) || this.Editor.menu.get(0);for(var id in tag.children) { //				this.Editor.menu.append(this.Render(tag.children[id]));
menu.appendChild(this.Render(tag.children[id]));}break;case "StyleTag":menu = this.PreRender(tag);for(var attr in tag.children) {tag.children[attr].forEach(function(style){menu.appendChild(that.Render(style));});}break;}if(button !== null){if(menu !== this.Editor.menu.get(0)){this.Editor.menu.append(button);}button.addEventListener('mouseenter',mouseenter);button.addEventListener('mouseleave',mouseleave);}this.Editor.tags[tag.Id] = tag; //		if (button !== undefined && button !== null) {
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
}},{key:'Select',value:function Select(tag){var button=tag.button;button.classList.add('active');button.classList.remove('hover');if(tag.highlight && tag.AppliedTag !== null){button.style["box-shadow"] = "inset " + tag.AppliedTag.value + " 1px 1px 50px";}}},{key:'UnSelect',value:function UnSelect(tag){var button=tag.button;button.classList.remove('active');button.classList.add('hover');if(tag.highlight && tag.AppliedTag !== null){button.style["box-shadow"] = "";}}},{key:'Enable',value:function Enable(tag){tag.button.classList.remove('disable');}},{key:'Disable',value:function Disable(tag){var button=tag.button;button.classList.add('disable');button.classList.remove('active');button.classList.remove('hover');if(tag.highlight && tag.AppliedTag !== null){button.style["box-shadow"] = "inset " + tag.AppliedTag.value + " 1px 1px 50px";}}},{key:'InsertSeparator',value:function InsertSeparator(){var separator=document.createElement('span');separator.classList.add('separator');this.Editor.menu.append(separator);}}]);return _default;})();exports['default'] = _default;module.exports = exports['default'];
},{"./tags":26,"./utils":31}],3:[function(require,module,exports){
"use strict";Object.defineProperty(exports,"__esModule",{value:true});var _createClass=(function(){function defineProperties(target,props){for(var i=0;i < props.length;i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if("value" in descriptor)descriptor.writable = true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};})();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var _default=(function(){function _default(gen,property){_classCallCheck(this,_default);this.gen = gen;this.property = property;}_createClass(_default,[{key:"KeyValue",value:function KeyValue(value,label){return new this.gen(this.property,value,label);}}]);return _default;})();exports["default"] = _default;module.exports = exports["default"];
},{}],4:[function(require,module,exports){
'use strict';Object.defineProperty(exports,'__esModule',{value:true});function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}}var _default=function _default(attr,value,tooltip){_classCallCheck(this,_default);this.Id = 'not_set';this.attr = attr;this.value = value;this.tooltip = tooltip;this.button = document.createElement('button');};exports['default'] = _default;module.exports = exports['default'];
},{}],5:[function(require,module,exports){
"use strict";Object.defineProperty(exports,"__esModule",{value:true});var _createClass=(function(){function defineProperties(target,props){for(var i=0;i < props.length;i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if("value" in descriptor)descriptor.writable = true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};})();var _get=function get(_x,_x2,_x3){var _again=true;_function: while(_again) {var object=_x,property=_x2,receiver=_x3;_again = false;if(object === null)object = Function.prototype;var desc=Object.getOwnPropertyDescriptor(object,property);if(desc === undefined){var parent=Object.getPrototypeOf(object);if(parent === null){return undefined;}else {_x = parent;_x2 = property;_x3 = receiver;_again = true;desc = parent = undefined;continue _function;}}else if("value" in desc){return desc.value;}else {var getter=desc.get;if(getter === undefined){return undefined;}return getter.call(receiver);}}};function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}function _inherits(subClass,superClass){if(typeof superClass !== "function" && superClass !== null){throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__ = superClass;}var _attributes=require('../attributes');var ClaseAttr=(function(_BaseAttribute){_inherits(ClaseAttr,_BaseAttribute);function ClaseAttr(parent,id,subid,value,options){_classCallCheck(this,ClaseAttr);_get(Object.getPrototypeOf(ClaseAttr.prototype),"constructor",this).call(this,id,value);delete this.attr;this.parent = parent;this.id = id;this.subid = subid;this.ToolTip = options.tooltip || null;this.IconClass = options.displayclass || null;this.Shortcut = options.shortcut || null;}_createClass(ClaseAttr,[{key:"isInstance",value:function isInstance(node){if(node.classList.contains(this.value)){return true;}return false;}},{key:"Id",get:function get(){return this.id + "." + this.subid;},set:function set(value){}}]);return ClaseAttr;})(_attributes.BaseAttribute);exports["default"] = ClaseAttr;module.exports = exports["default"];
},{"../attributes":7}],6:[function(require,module,exports){
'use strict';Object.defineProperty(exports,'__esModule',{value:true});var _get=function get(_x,_x2,_x3){var _again=true;_function: while(_again) {var object=_x,property=_x2,receiver=_x3;_again = false;if(object === null)object = Function.prototype;var desc=Object.getOwnPropertyDescriptor(object,property);if(desc === undefined){var parent=Object.getPrototypeOf(object);if(parent === null){return undefined;}else {_x = parent;_x2 = property;_x3 = receiver;_again = true;desc = parent = undefined;continue _function;}}else if('value' in desc){return desc.value;}else {var getter=desc.get;if(getter === undefined){return undefined;}return getter.call(receiver);}}};function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}}function _inherits(subClass,superClass){if(typeof superClass !== 'function' && superClass !== null){throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__ = superClass;}var _attributes=require('../attributes');var StyleAttr=(function(_BaseAttribute){_inherits(StyleAttr,_BaseAttribute);function StyleAttr(attr,value){_classCallCheck(this,StyleAttr);_get(Object.getPrototypeOf(StyleAttr.prototype),'constructor',this).call(this,attr,value);}return StyleAttr;})(_attributes.BaseAttribute);exports['default'] = StyleAttr;module.exports = exports['default'];
},{"../attributes":7}],7:[function(require,module,exports){
'use strict';Object.defineProperty(exports,'__esModule',{value:true});function _interopRequire(obj){return obj && obj.__esModule?obj['default']:obj;}var _AttributeGenerator=require('./AttributeGenerator');exports.AttributeGenerator = _interopRequire(_AttributeGenerator);var _BaseAttribute=require('./BaseAttribute');exports.BaseAttribute = _interopRequire(_BaseAttribute);var _ClassAttr=require('./ClassAttr');exports.ClassAttr = _interopRequire(_ClassAttr);var _StyleAttr=require('./StyleAttr');exports.StyleAttr = _interopRequire(_StyleAttr);
},{"./AttributeGenerator":3,"./BaseAttribute":4,"./ClassAttr":5,"./StyleAttr":6}],8:[function(require,module,exports){
'use strict';Object.defineProperty(exports,'__esModule',{value:true});var _createClass=(function(){function defineProperties(target,props){for(var i=0;i < props.length;i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};})();function _interopRequireWildcard(obj){if(obj && obj.__esModule){return obj;}else {var newObj={};if(obj != null){for(var key in obj) {if(Object.prototype.hasOwnProperty.call(obj,key))newObj[key] = obj[key];}}newObj['default'] = obj;return newObj;}}function _interopRequireDefault(obj){return obj && obj.__esModule?obj:{'default':obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}}var _Module=require('./Module');var _Module2=_interopRequireDefault(_Module);var _tags=require('./tags');var _Toolbar=require('./Toolbar');var _Toolbar2=_interopRequireDefault(_Toolbar);var _modules=require('./modules');var modules=_interopRequireWildcard(_modules);var _template=require('./template');var _template2=_interopRequireDefault(_template);var _modulesPrivate=require('./modules/private');var private_namespaces=_interopRequireWildcard(_modulesPrivate);var _utils=require('./utils');var utils=_interopRequireWildcard(_utils);function getTag(node,tags){for(var prop in tags) {var tag=tags[prop];if(tag.isInstance(node)){return tag;}}return null;}function findAllTags(node,container,tags){for(var nname in node.children) {var newnode=node.children[nname];if(newnode.nodeType === 1){var tag=getTag(newnode,tags);if(tag !== null){container[tag.Id] = tag;}findAllTags(newnode,container,tags);}else {return true;}}}function NodeAnalysis(tags,maincontainer){var left={};var middle={};var right={};var contain={};var leftNode=this.startContainer.parentNode;var rightNode=this.endContainer.parentNode;var common=null;if(leftNode === rightNode){common = leftNode;var insider=this.cloneContents();findAllTags(insider,middle,tags);}else {while(leftNode !== this.commonAncestorContainer && leftNode !== maincontainer) {var tag=getTag(leftNode,tags);if(tag !== null){left[tag.Id] = tag;}leftNode = leftNode.parentNode;}while(rightNode !== this.commonAncestorContainer && rightNode !== maincontainer) {var tag=getTag(rightNode,tags);if(tag !== null){right[tag.Id] = tag;}rightNode = rightNode.parentNode;}common = this.commonAncestorContainer;}while(common !== maincontainer) {var tag=getTag(common,tags);if(tag !== null){contain[tag.Id] = tag;}common = common.parentNode;}var plugs={};for(var prop in tags) {var tag=tags[prop];if(tag instanceof _tags.ClassTag){for(var id in tag.children) {tag.children[id].button.classList.remove('active');}}var button=tag.button;var highlight=false;plugs[tag.Id] = {isSorrounded:contain[tag.Id] !== undefined,isContained:middle[tag.Id] !== undefined,isOpened:right[tag.Id] !== undefined,isClosed:left[tag.Id] !== undefined,deep:0,tag:tag.AppliedTag};if(plugs[tag.Id].isSorrounded){button.classList.add('active');highlight = true;}else if(button !== null){button.classList.remove('active');}var doo=tag.highlight;if(highlight && doo){button.style["box-shadow"] = "inset " + tag.AppliedTag.value + " 1px 1px 50px";}else if(button !== null){button.style["box-shadow"] = "";}}return plugs;}function addtotagi(e){$(this).parent().find('.tagi').html('');var x=$(document.getSelection().anchorNode.parentNode);var i=0;while(x.get(0) !== this) {var li=$('<span>' + x.get(0).localName + '</span>');$(this).parent().find('.tagi').prepend(li);x = x.parent();}}var _default=(function(){function _default(parent,cfg){_classCallCheck(this,_default);var that=this;var prototype=Object.getPrototypeOf(that);this.ToolBar = new _Toolbar2['default'](this);Object.freeze(this.ToolBar);var privateData=new WeakMap();var props={dataindex:[Object.create(null)],data:Object.create(null)};var indexes=[Object.create(null)];var compiled=$(_template2['default']);this.textarea = compiled.find("[data-wriit-role=text-area]");this.textarea.html(parent.html());parent.replaceWith(compiled);this.menu = compiled.find('menu:eq(0)');this.html = Object.defineProperties({getSelection:function getSelection(n){n = n || 0;var html=that.textarea.html();var coord=that.textarea.getSelection(n);var range=coord.rang;return Object.defineProperties({},{start:{get:function get(){return coord.start;},configurable:true,enumerable:true},end:{get:function get(){return coord.end;},configurable:true,enumerable:true},pre:{get:function get(){return html.substring(0,coord.start);},configurable:true,enumerable:true},sel:{get:function get(){return html.substring(coord.start,coord.end);},configurable:true,enumerable:true},post:{get:function get(){return html.substring(coord.end,html.lentgh);},configurable:true,enumerable:true},text:{get:function get(){return html;},set:function set(v){that.textarea.html(v);},configurable:true,enumerable:true},visual:{get:function get(){return range;},configurable:true,enumerable:true}});}},{selection:{get:function get(){return this.getSelection(0).coord;},configurable:true,enumerable:true}});this.selection = function(tagid){return this.Modules[tagid].selection;};this.textarea.KeyHandler();this.textarea.toTextArea({coord:false,debug:false});this.Modules = {};this.buttons = {};this.tags = {};this.metadata = {};this.textarea.bind('keyup mouseup',addtotagi);this.textarea.bind('keyup mouseup',function(){that.Modules = NodeAnalysis.apply(that.textarea.getSelection(0).rang,[that.tags,that.textarea.get(0)]);});setInterval(function(){compiled.trigger('savecontent');},1000);var namespaces=[];var exportfn=function exportfn(ns,fn){return function(){fn.apply(ns,arguments);};};for(var _namespace in private_namespaces) {namespaces[_namespace] = new utils.MapManager(privateData);if(private_namespaces[_namespace].MakePublic !== undefined){var publicvars=private_namespaces[_namespace].MakePublic(namespaces[_namespace]);for(var prop in publicvars) {Object.defineProperty(that,publicvars[prop],{enumerable:false,configurable:false,writable:false,value:exportfn(namespaces[_namespace],private_namespaces[_namespace][prop])});}delete private_namespaces[_namespace].MakePublic;}namespaces[_namespace].Register(private_namespaces[_namespace]);}for(var modulename in modules) {var _module2=prototype[modulename];if(_module2.Setup !== null){_module2 = $.extend(new _Module2['default'](that),_module2);_module2.Setup(that.ToolBar,_module2.ExtendedPrivilegies === true?namespaces[_module2.Namespace]:null);}}this.button = function(id){return that.buttons[id];};}_createClass(_default,[{key:'RestoreSelection',value:function RestoreSelection(){this.textarea.get(0).normalize(); //		this.textarea.RestoreRange(this.textarea.getSelection(0));
if(this.Range !== undefined){document.getSelection().removeAllRanges();document.getSelection().addRange(this.Range);}this.textarea.trigger('mouseup');}},{key:'Range',get:function get(){return this.textarea.getSelection(0).rang;}}]);return _default;})();exports['default'] = _default;module.exports = exports['default'];
},{"./Module":1,"./Toolbar":2,"./modules":13,"./modules/private":18,"./tags":26,"./template":27,"./utils":31}],9:[function(require,module,exports){
'use strict';Object.defineProperty(exports,'__esModule',{value:true});var _tags=require('../tags');exports['default'] = {Setup:function Setup(toolbar){var tag=new _tags.ClassTag('alert',"div",{iconclass:'fa fa-bell'}); //		tag.Render = Engine.square;
tag.classList = ['alert'];tag.Add('success','alert-success',{tooltip:"Default Button",displayclass:"fa fa-bell"});tag.Add('danger','alert-danger',{tooltip:"Default Button",displayclass:"fa fa-bell"});toolbar.AddButton(tag);this.Callback(tag,this.Insert);toolbar.InsertSeparator();return tag;}};module.exports = exports['default'];
},{"../tags":26}],10:[function(require,module,exports){
"use strict";Object.defineProperty(exports,"__esModule",{value:true});var _tags=require('../tags');exports["default"] = {Setup:function Setup(toolbar){var bold=new _tags.Single("bold","strong",{tooltip:"Bold",iconclass:"fa fa-bold",shortcut:"CMD+SHIFT+B"});toolbar.AddButton(bold);this.Callback(bold,this.Insert);}};module.exports = exports["default"];
},{"../tags":26}],11:[function(require,module,exports){
'use strict';Object.defineProperty(exports,'__esModule',{value:true});var _tags=require('../tags');exports['default'] = {Setup:function Setup(toolbar){var tag=new _tags.ClassTag('bootstrapbtn',"button",{iconclass:"fa fa-bell",tooltip:"BootStrap Buttons"});tag.Render = _tags.Engine.list;tag.Engine = {'class':true,text:"Sample Text Button",item:'button'};tag.classList = ['btn'];tag.Add('default','btn-default',{tooltip:"Default Button",displayclass:"fa fa-bell"});tag.Add('primary','btn-primary',{tooltip:"Default Button",displayclass:"fa fa-bell"});toolbar.AddButton(tag);this.Callback(tag,this.Insert);toolbar.InsertSeparator();return tag;}};module.exports = exports['default'];
},{"../tags":26}],12:[function(require,module,exports){
'use strict';Object.defineProperty(exports,'__esModule',{value:true});var _tags=require('../tags');exports['default'] = {Setup:function Setup(toolbar){var tag=new _tags.StyleTag('forecolor','fa fa-font','Font Color');tag.Render = _tags.Engine.square;var prop=tag.newProperty("color");tag.Add(prop.KeyValue('#FF0000','red'));tag.Add(prop.KeyValue('#00FF00','green'));toolbar.AddButton(tag);this.Callback(tag,this.Insert);toolbar.InsertSeparator();}};module.exports = exports['default'];
},{"../tags":26}],13:[function(require,module,exports){
'use strict';Object.defineProperty(exports,'__esModule',{value:true});function _interopRequire(obj){return obj && obj.__esModule?obj['default']:obj;}var _alert=require('./alert');exports.alert = _interopRequire(_alert);var _bold=require('./bold');exports.bold = _interopRequire(_bold);var _bootstrapbtn=require('./bootstrapbtn');exports.bootstrapbtn = _interopRequire(_bootstrapbtn);var _forecolor=require('./forecolor');exports.forecolor = _interopRequire(_forecolor);var _italic=require('./italic');exports.italic = _interopRequire(_italic);var _list=require('./list');exports.list = _interopRequire(_list);var _marquer=require('./marquer');exports.marquer = _interopRequire(_marquer);var _paragraph=require('./paragraph');exports.paragraph = _interopRequire(_paragraph);var _underline=require('./underline');exports.underline = _interopRequire(_underline);
},{"./alert":9,"./bold":10,"./bootstrapbtn":11,"./forecolor":12,"./italic":14,"./list":15,"./marquer":16,"./paragraph":17,"./underline":20}],14:[function(require,module,exports){
"use strict";Object.defineProperty(exports,"__esModule",{value:true});var _tags=require('../tags');exports["default"] = {Setup:function Setup(toolbar){var bold=new _tags.Single("Italic","em",{tooltip:"Italic",iconclass:"fa fa-italic",shortcut:"CMD+SHIFT+I"});toolbar.AddButton(bold);this.Callback(bold,this.Insert);}};module.exports = exports["default"];
},{"../tags":26}],15:[function(require,module,exports){
'use strict';Object.defineProperty(exports,'__esModule',{value:true});var _tags=require('../tags');exports['default'] = {Action:function Action(e,textarea){var wrapper=this.Tag['new']();var selection=this.Selection;var visual=this.Visual;var sTag=visual.startContainer.parentNode;var eTag=visual.endContainer.parentNode;if(visual.collapsed){if(!selection.isSorrounded){visual.startContainer.remove();visual.insertNode(wrapper);wrapper.appendChild(document.createElement('li'));visual.setStart(wrapper.firstChild,0);visual.setEnd(wrapper.firstChild,0);}}else {var lastChild=null;while(sTag !== null) {var li=document.createElement('li');while(sTag.childNodes.length > 0) {lastChild = sTag.childNodes[0];li.appendChild(sTag.childNodes[0]);}wrapper.appendChild(li);if(sTag.nextSibling !== null){sTag = sTag.nextSibling;sTag.previousSibling.remove();}else {sTag.remove();sTag = null;}}visual.insertNode(wrapper);visual.setStart(wrapper.firstChild.firstChild,0);visual.setEnd(lastChild,lastChild.length);}this.Editor.RestoreSelection();},Setup:function Setup(toolbar){var list=new _tags.Single('list',"ul",{tooltip:"Unorder List",iconclass:'fa fa-list-ul'});toolbar.InsertSeparator();toolbar.AddButton(list);this.Callback(list,this.Action);}};module.exports = exports['default'];
},{"../tags":26}],16:[function(require,module,exports){
'use strict';Object.defineProperty(exports,'__esModule',{value:true});var _tags=require('../tags');exports['default'] = {Setup:function Setup(toolbar){var tag=new _tags.StyleTag('marquer','fa fa-ship','Highlight');tag.TagName = 'mark';tag.Render = _tags.Engine.square;var prop=tag.newProperty("background-color");tag.Add(prop.KeyValue('#FF0000','red'));tag.Add(prop.KeyValue('#00FF00','green'));tag.Add(prop.KeyValue('#0000FF','blue'));toolbar.AddButton(tag);this.Callback(tag,this.Insert);}};module.exports = exports['default'];
},{"../tags":26}],17:[function(require,module,exports){
'use strict';Object.defineProperty(exports,'__esModule',{value:true});var _tags=require('../tags');exports['default'] = {Setup:function Setup(toolbar){var tag=new _tags.ClassTag('paragraph',"p");tag.Add('left','text-left',{tooltip:"Align Left",displayclass:"fa fa-align-left",shortcut:"CMD+SHIFT+L"});tag.Add('center','text-center',{tooltip:"Center",displayclass:"fa fa-align-center",shortcut:"CMD+SHIFT+L"});tag.Add('right','text-right',{tooltip:"Align Right",displayclass:"fa fa-align-right",shortcut:"CMD+SHIFT+R"});tag.Add('justify','text-justify',{tooltip:"Justify",displayclass:"fa fa-align-justify",shortcut:"CMD+SHIFT+J"});toolbar.AddButton(tag);this.Callback(tag,this.Insert);toolbar.InsertSeparator();}};module.exports = exports['default'];
},{"../tags":26}],18:[function(require,module,exports){
'use strict';Object.defineProperty(exports,'__esModule',{value:true});function _interopRequire(obj){return obj && obj.__esModule?obj['default']:obj;}var _memory=require('./memory');exports.memory = _interopRequire(_memory);
},{"./memory":19}],19:[function(require,module,exports){
'use strict';Object.defineProperty(exports,'__esModule',{value:true});exports['default'] = {block:false,history:[],index:-1,savetriggerid:null,savetrigger_s:5000,onSaved:null,save:function save(textarea){var data=textarea.html().trim();for(var i=this.index + 1;i < this.history.length;i++) {delete this.history[i];}this.index = this.index + 1;this.history[this.index] = {text:data,range:textarea.getSelection(0)};if(this.onSaved !== null){this.onSaved();}},store:function store(textarea,force){if(this.index < 0){this.save(textarea);return true;}var record=this.history[this.index];var text=record.text;var ctext=textarea.html().trim();if(text && Math.abs(ctext.length - text.length) > 15 || ctext !== text && force === true){this.save(textarea);return true;}return ctext !== undefined && ctext && ctext !== text;},clear:function clear(){},updateInterval:function updateInterval(value){this.savetrigger_s = value;},watch:function watch(textarea){var that=this;this.savetriggerid = setTimeout(function(){that.store(textarea);if(that.savetriggerid !== null){that.watch(textarea);}},this.savetrigger_s);},TearDown:function TearDown(){clearTimeout(this.savetriggerid);this.savetriggerid = null;},RestoreSelection:function RestoreSelection(rang,textarea){textarea.RestoreRange(rang); //		let sel = window.getSelection();
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
},MakePublic:function MakePublic(parent){return {store:'AddToHistory'};}};module.exports = exports['default'];
},{}],20:[function(require,module,exports){
"use strict";Object.defineProperty(exports,"__esModule",{value:true});var _tags=require('../tags');exports["default"] = {Setup:function Setup(toolbar){var underline=new _tags.Single("underline","u",{tooltip:"Underline",iconclass:"fa fa-underline",shortcut:"CMD+SHIFT+U"});toolbar.AddButton(underline);this.Callback(underline,this.Insert);}};module.exports = exports["default"];
},{"../tags":26}],21:[function(require,module,exports){
"use strict";Object.defineProperty(exports,"__esModule",{value:true});var _createClass=(function(){function defineProperties(target,props){for(var i=0;i < props.length;i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if("value" in descriptor)descriptor.writable = true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};})();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function");}}var _default=(function(){function _default(id,tag,attributes,highlight){_classCallCheck(this,_default);this.Id = id;this.highlight = highlight;this.TagName = tag;this.Attributes = [];this.Shortcut = attributes.shortcut || null;this.ToolTip = attributes.tooltip || null;this.IconClass = attributes.iconclass || null;this.button = null;this.classList = [];this.Render = 3;}_createClass(_default,[{key:"isCompatible",value:function isCompatible(htmlnode){if(htmlnode === null){return false;}if(htmlnode.nodeType !== 1 || htmlnode.tagName.toLowerCase() !== this.TagName.toLowerCase()){return false;}return true;}},{key:"isInstance",value:function isInstance(htmlnode){return this.isCompatible(htmlnode);}},{key:"new",value:function _new(){var el=document.createElement(this.TagName);var that=this;that.classList.forEach(function(classname){el.classList.add(classname);});return el;}},{key:"CanRemove",value:function CanRemove(node){return true;}},{key:"instaceName",get:function get(){return (/function (.*)\(/g.exec(String(this.constructor))[1]);}}]);return _default;})();exports["default"] = _default;module.exports = exports["default"];
},{}],22:[function(require,module,exports){
'use strict';Object.defineProperty(exports,'__esModule',{value:true});var _createClass=(function(){function defineProperties(target,props){for(var i=0;i < props.length;i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};})();var _get=function get(_x,_x2,_x3){var _again=true;_function: while(_again) {var object=_x,property=_x2,receiver=_x3;_again = false;if(object === null)object = Function.prototype;var desc=Object.getOwnPropertyDescriptor(object,property);if(desc === undefined){var parent=Object.getPrototypeOf(object);if(parent === null){return undefined;}else {_x = parent;_x2 = property;_x3 = receiver;_again = true;desc = parent = undefined;continue _function;}}else if('value' in desc){return desc.value;}else {var getter=desc.get;if(getter === undefined){return undefined;}return getter.call(receiver);}}};function _interopRequireDefault(obj){return obj && obj.__esModule?obj:{'default':obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}}function _inherits(subClass,superClass){if(typeof superClass !== 'function' && superClass !== null){throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__ = superClass;}var _tags=require('../tags');var _attributes=require('../attributes');var _Engine=require('./Engine');var _Engine2=_interopRequireDefault(_Engine);var ClassTag=(function(_Base){_inherits(ClassTag,_Base);function ClassTag(id,tag,opts){_classCallCheck(this,ClassTag);_get(Object.getPrototypeOf(ClassTag.prototype),'constructor',this).call(this,id,tag,opts || {});this.Id = id;this.TagName = tag;this.children = {};this.__button = document.createElement('div');}_createClass(ClassTag,[{key:'FindByClass',value:function FindByClass(classname){for(var child in this.children) {if(this.children[child].AttrMatch("class",classname)){return this.children[child];}}}},{key:'isCompatible',value:function isCompatible(htmlnode){return htmlnode !== null && htmlnode !== undefined && htmlnode.nodeType === 1;}},{key:'isInstance',value:function isInstance(node){if(!this.isCompatible(node)){return false;}for(var id in this.children) {var child=this.children[id];if(node.classList.contains(child.value)){this.AppliedTag = child;return true;}}return false;}},{key:'Add',value:function Add(subid,classname,options){var that=this;var classattr=new _attributes.ClassAttr(this,this.Id,subid,classname,options);classattr.Engine = this.Engine;Object.defineProperty(classattr,'Render',{get:function get(){return that.Render;}}); //		classattr.Render = Engine.button;
this.children[subid] = classattr;}},{key:'CanRemove',value:function CanRemove(node,attribute){return false;}},{key:'Update',value:function Update(node,attribute){for(var id in this.children) {node.classList.remove(this.children[id].value);}node.classList.add(attribute.value);}},{key:'new',value:function _new(attribute){var el=_get(Object.getPrototypeOf(ClassTag.prototype),'new',this).call(this);el.classList.add(attribute.value);return el;}},{key:'button',get:function get(){switch(this.Render){case _Engine2['default'].button:return this.AppliedTag?this.AppliedTag.button:null;default:return this.__button;}},set:function set(value){}}]);return ClassTag;})(_tags.Base);exports['default'] = ClassTag;module.exports = exports['default'];
},{"../attributes":7,"../tags":26,"./Engine":23}],23:[function(require,module,exports){
"use strict";Object.defineProperty(exports,"__esModule",{value:true});var data={square:1,list:2,button:3};exports["default"] = data;module.exports = exports["default"];
},{}],24:[function(require,module,exports){
'use strict';Object.defineProperty(exports,'__esModule',{value:true});var _get=function get(_x,_x2,_x3){var _again=true;_function: while(_again) {var object=_x,property=_x2,receiver=_x3;_again = false;if(object === null)object = Function.prototype;var desc=Object.getOwnPropertyDescriptor(object,property);if(desc === undefined){var parent=Object.getPrototypeOf(object);if(parent === null){return undefined;}else {_x = parent;_x2 = property;_x3 = receiver;_again = true;desc = parent = undefined;continue _function;}}else if('value' in desc){return desc.value;}else {var getter=desc.get;if(getter === undefined){return undefined;}return getter.call(receiver);}}};function _interopRequireDefault(obj){return obj && obj.__esModule?obj:{'default':obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}}function _inherits(subClass,superClass){if(typeof superClass !== 'function' && superClass !== null){throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__ = superClass;}var _Base2=require('./Base');var _Base3=_interopRequireDefault(_Base2);var Single=(function(_Base){_inherits(Single,_Base);function Single(id,tag,options){_classCallCheck(this,Single);_get(Object.getPrototypeOf(Single.prototype),'constructor',this).call(this,id,tag,options,false);this.button = document.createElement('button');}return Single;})(_Base3['default']);exports['default'] = Single;module.exports = exports['default'];
},{"./Base":21}],25:[function(require,module,exports){
'use strict';Object.defineProperty(exports,'__esModule',{value:true});var _createClass=(function(){function defineProperties(target,props){for(var i=0;i < props.length;i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};})();var _get=function get(_x,_x2,_x3){var _again=true;_function: while(_again) {var object=_x,property=_x2,receiver=_x3;_again = false;if(object === null)object = Function.prototype;var desc=Object.getOwnPropertyDescriptor(object,property);if(desc === undefined){var parent=Object.getPrototypeOf(object);if(parent === null){return undefined;}else {_x = parent;_x2 = property;_x3 = receiver;_again = true;desc = parent = undefined;continue _function;}}else if('value' in desc){return desc.value;}else {var getter=desc.get;if(getter === undefined){return undefined;}return getter.call(receiver);}}};function _interopRequireDefault(obj){return obj && obj.__esModule?obj:{'default':obj};}function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}}function _inherits(subClass,superClass){if(typeof superClass !== 'function' && superClass !== null){throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype,{constructor:{value:subClass,enumerable:false,writable:true,configurable:true}});if(superClass)Object.setPrototypeOf?Object.setPrototypeOf(subClass,superClass):subClass.__proto__ = superClass;}var _Base2=require('./Base');var _Base3=_interopRequireDefault(_Base2);var _attributes=require('../attributes');var _utils=require('../utils');var StyleTag=(function(_Base){_inherits(StyleTag,_Base);function StyleTag(id,IconClass,tooltip){_classCallCheck(this,StyleTag);_get(Object.getPrototypeOf(StyleTag.prototype),'constructor',this).call(this,id,'span',{iconclass:IconClass,tooltip:tooltip},true,'background-color');this.children = {};this.Render = 0;this.AppliedTag = null;this.button = document.createElement('div');}_createClass(StyleTag,[{key:'newProperty',value:function newProperty(property,displayengine){return new _attributes.AttributeGenerator(_attributes.StyleAttr,property);}},{key:'Add',value:function Add(attribute){attribute.Id = this.Id;attribute.Render = this.Render;this.children[attribute.attr] = this.children[attribute.attr] || [];this.children[attribute.attr].push(attribute);}},{key:'new',value:function _new(attribute){var tag=_get(Object.getPrototypeOf(StyleTag.prototype),'new',this).call(this);this.AppliedTag = attribute;tag.style[attribute.attr] = attribute.value;return tag;}},{key:'isInstance',value:function isInstance(htmlnode){if(!_get(Object.getPrototypeOf(StyleTag.prototype),'isInstance',this).call(this,htmlnode)){return false;}for(var attr in this.children) {var atributes=this.children[attr];if(htmlnode.style[atributes[0].attr] === ""){return false;}for(var attribute in atributes) {var a=atributes[attribute];var value=(0,_utils.from_rgb)(htmlnode.style[a.attr],false);if(value === a.value){this.AppliedTag = a;}}}return true;}},{key:'Update',value:function Update(element,attribute){element.style[attribute.attr] = attribute.value;}}]);return StyleTag;})(_Base3['default']);exports['default'] = StyleTag;module.exports = exports['default'];
},{"../attributes":7,"../utils":31,"./Base":21}],26:[function(require,module,exports){
'use strict';Object.defineProperty(exports,'__esModule',{value:true});function _interopRequire(obj){return obj && obj.__esModule?obj['default']:obj;}var _Base=require('./Base');exports.Base = _interopRequire(_Base);var _ClassTag=require('./ClassTag');exports.ClassTag = _interopRequire(_ClassTag);var _Engine=require('./Engine');exports.Engine = _interopRequire(_Engine);var _Single=require('./Single');exports.Single = _interopRequire(_Single);var _StyleTag=require('./StyleTag');exports.StyleTag = _interopRequire(_StyleTag);
},{"./Base":21,"./ClassTag":22,"./Engine":23,"./Single":24,"./StyleTag":25}],27:[function(require,module,exports){
'use strict';Object.defineProperty(exports,'__esModule',{value:true});var template='<section class="wriit-box"><menu></menu><div data-wriit-role="text-area"></div><div class="tagi"></div></section>';exports['default'] = template;module.exports = exports['default'];
},{}],28:[function(require,module,exports){
'use strict';Object.defineProperty(exports,'__esModule',{value:true});var _createClass=(function(){function defineProperties(target,props){for(var i=0;i < props.length;i++) {var descriptor=props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if('value' in descriptor)descriptor.writable = true;Object.defineProperty(target,descriptor.key,descriptor);}}return function(Constructor,protoProps,staticProps){if(protoProps)defineProperties(Constructor.prototype,protoProps);if(staticProps)defineProperties(Constructor,staticProps);return Constructor;};})();function _classCallCheck(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError('Cannot call a class as a function');}}var _default=(function(){function _default(map){_classCallCheck(this,_default);Object.defineProperty(this,'keys',{enumerable:false,configurable:false,writable:false,value:{}});Object.defineProperty(this,'__map',{enumerable:false,configurable:false,writable:false,value:map});}_createClass(_default,[{key:'Register',value:function Register(keyvalue){var _this=this;var that=this;if(!Object.isFrozen(this)){var _loop=function(key){var value=keyvalue[key];_this.keys[key] = Object.create({mapmanager:true});Object.freeze(_this.keys[key]);Object.defineProperty(_this,key,{get:function get(){return this.__map.get(that.keys[key]);},set:function set(value){this.__map.set(that.keys[key],value);}});_this[key] = value;};for(var key in keyvalue) {_loop(key);}delete this.Register;Object.freeze(this);}}}]);return _default;})();exports['default'] = _default;module.exports = exports['default'];
},{}],29:[function(require,module,exports){
"use strict";Object.defineProperty(exports,"__esModule",{value:true});exports.from_rgb = from_rgb;exports.inverse = inverse;function hex(x,short){if(short)return parseInt(x).toString(16)[0].toUpperCase();return ("0" + parseInt(x).toString(16)).slice(-2).toUpperCase();}function from_rgb(rgb,short){if(rgb.search("rgb") == -1){if(short)return "#" + (rgb[1] + rgb[3] + rgb[5]).toUpperCase();return rgb.toUpperCase();}else {rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);return "#" + (hex(rgb[1],short) + hex(rgb[2],short) + hex(rgb[3])).toUpperCase();}}function inverse(hex){var hexVdec={"0":0,"1":1,"2":2,"3":3,"4":4,"5":5,"6":6,"7":7,"8":8,"9":9,"A":10,"B":11,"C":12,"D":13,"E":14,"F":15,"a":10,"b":11,"c":12,"d":13,"e":14,"f":15};var decVhex=Array(0,1,2,3,4,5,6,7,8,9,"A","B","C","D","E","F",0);return "#" + decVhex[Math.abs(hexVdec[hex[1]] - 15)] + decVhex[Math.abs(hexVdec[hex[2]] - 15)] + decVhex[Math.abs(hexVdec[hex[3]] - 15)];}
},{}],30:[function(require,module,exports){
/*global $,jQuery*/"use strict";Object.defineProperty(exports,"__esModule",{value:true});function getName(node){if(node === null){return null;}var name=node.id === ""?node.localName:"#" + node.id;return name + (node.className !== ""?"." + node.className.replace(" ","."):"");}function nodeOffset(node){var test=node;var n=0;while(test.previousSibling !== null) {test = test.previousSibling;n++;}return n;}function getSelector(parent,node){var current=node;var selector="";while(current != parent) {switch(current.nodeType){case 1:var sel="";var sibling=getName(current.previousElementSibling);if(sibling !== null){sel = sibling + " + ";}selector = sel + getName(current) + " " + selector;break;case 3:break;}current = current.parentNode;if(current != parent && selector !== ""){selector = " > " + selector;}}return selector;}function taglength(node,full){"use strict";var otext=node.wholeText !== undefined?node.wholeText:node.outerHTML;var itext=node.innerHTML !== undefined?node.innerHTML:node.innerText;var l=otext.indexOf(itext);if(otext.indexOf(itext) !== otext.lastIndexOf(itext)){l = otext.indexOf(itext,itext.length);}return full?otext.length:l === -1?otext.length:l;}function dedeep(parent,common,node,offset){"use strict";var text=node.wholeText !== undefined?node.wholeText:node.outerHTML;var end=-text.substring(offset,text.length).length;do {var prevnode=node.previousSibling;var all=false;do {end += taglength(node,all);prevnode = node.previousSibling;all = prevnode?prevnode.nodeType == 1:false;if(prevnode){node = prevnode;}}while(prevnode !== null);if(node.parentNode != parent){node = node.parentNode;}else {end -= taglength(node);}}while(node.parentNode != parent && node != parent);end += taglength(node);node = node.previousSibling;while(node) {var otext=node.wholeText !== undefined?node.wholeText:node.outerHTML;end += otext.length;node = node.previousSibling;}return end;}function textarea(parent,opts){"use strict";var carea=$('<div class="itextarea-cords"/>');if(opts.coord){carea.insertAfter(parent);}$(parent).bind('keyup mouseup',function(ev){var ini=window.performance.now();var ranges=[];var selection=window.getSelection();for(var i=0;i < selection.rangeCount;i++) {var range=selection.getRangeAt(i);ranges.push({selectors:{start:getSelector(parent,range.startContainer),end:getSelector(parent,range.endContainer),node:{start:nodeOffset(range.startContainer),end:nodeOffset(range.endContainer)},startOffset:range.startOffset,endOffset:range.endOffset},start:dedeep(parent,range.commonAncestorContainer,range.startContainer,range.startOffset),end:dedeep(parent,range.commonAncestorContainer,range.endContainer,range.endOffset),rang:range});}$(parent).data('rang',ranges);var end=window.performance.now();if(opts.performace){console.log("iTextArea analysis:",end - ini,'ms');}if(opts.coord){carea.html(ranges[0].start + "," + ranges[0].end);}if(opts.debug){carea.append('<textarea style="width:600px;display:block;">' + parent.innerHTML.substring(0,ranges[0].start) + '</textarea>');carea.append('<textarea style="width:600px;display:block;">' + parent.innerHTML.substring(ranges[0].start,ranges[0].end) + '</textarea>');carea.append('<textarea style="width:600px;display:block;">' + parent.innerHTML.substring(ranges[0].end,$(parent).html().length) + '</textarea>');}});}exports["default"] = (function($){$.fn.toTextArea = function(cfg){cfg = $.extend({},{coord:false,performace:false,debug:false},cfg);$(this).attr('contenteditable',true);$(this).each(function(){new textarea(this,cfg);return $(this);});};$.fn.getSelection = function(n){if($(this).data('rang')){return $(this).data('rang')[n];}return {};};Object.defineProperty($.fn,"selection",{get:function get(){return $(this).data('rang')[0];}});$.fn.RestoreRange = function(rang){var sel=window.getSelection();sel.removeAllRanges();var range=document.createRange();var selectors=rang.selectors;if(selectors === undefined){return;}var start=this.get(0).querySelector(selectors.start).childNodes[selectors.node.start];var end=this.get(0).querySelector(selectors.end).childNodes[selectors.node.end];if(start.nodeType === 1){start = start.childNodes[0];}if(end.nodeType === 1){end = end.childNodes[end.childNodes.length - 1];}range.setStart(start,selectors.startOffset);range.setEnd(end,selectors.endOffset);sel.addRange(range);};})(jQuery);module.exports = exports["default"];
},{}],31:[function(require,module,exports){
'use strict';Object.defineProperty(exports,'__esModule',{value:true});function _interopExportWildcard(obj,defaults){var newObj=defaults({},obj);delete newObj['default'];return newObj;}function _defaults(obj,defaults){var keys=Object.getOwnPropertyNames(defaults);for(var i=0;i < keys.length;i++) {var key=keys[i];var value=Object.getOwnPropertyDescriptor(defaults,key);if(value && value.configurable && obj[key] === undefined){Object.defineProperty(obj,key,value);}}return obj;}function _interopRequire(obj){return obj && obj.__esModule?obj['default']:obj;}var _MapManager=require('./MapManager');exports.MapManager = _interopRequire(_MapManager);var _hex=require('./hex');_defaults(exports,_interopExportWildcard(_hex,_defaults));var _iTextArea=require('./iTextArea');exports.iTextArea = _interopRequire(_iTextArea);var _keyhandler=require('./keyhandler');exports.keyhandler = _interopRequire(_keyhandler);var _tooltip=require('./tooltip');exports.tooltip = _interopRequire(_tooltip);
},{"./MapManager":28,"./hex":29,"./iTextArea":30,"./keyhandler":32,"./tooltip":33}],32:[function(require,module,exports){
"use strict";Object.defineProperty(exports,"__esModule",{value:true});var keys={"8":"CARRY","13":"ENTER","16":"SHIFT","17":"CTRL","18":"ALT","27":"ESC","37":"LEFT","38":"UP","39":"RIGTH","40":"DOWN","91":"CMD"};for(var i=112;i < 112 + 12;i++) {keys[i.toString()] = "F" + (i - 111);}var routekey={"CTRL":"CMD","CMD":"CTRL"};var KeyHandler=function KeyHandler(el,settings){el.data('events',{});el.bind("keydown",function(e,routedevent){e = routedevent || e;var currkeys=el.data('keys') || {};var currkey=keys[e.which.toString()] || String.fromCharCode(e.which) || e.which || false;currkeys[currkey] = currkey;el.data('keys',currkeys);var trigger=[];for(var i in currkeys) {trigger.push(currkeys[i]);}trigger = trigger.join('+');trigger = el.data('events')[trigger];if(!!trigger){e.preventDefault();if(!trigger(e)){e.stopImmediatePropagation();e.stopPropagation();return false;}return true;}}).bind("keyup",function(e,routedevent){if(!e.which){el.data('keys',{});}else {e = routedevent || e;var currkeys=el.data('keys') || [];var currkey=keys[e.which.toString()] || String.fromCharCode(e.which) || e.which || false;delete currkeys[currkey];el.data('keys',currkeys);switch(currkey){case "CTRL":case "CMD":el.data('keys',[]);break;}}}).bind('blur',function(e){el.data('keys',{});});return el;};exports["default"] = (function($){$.fn.KeyHandler = function(settings){var config={ESC:false,ENTER:false};config = $.extend({},config,settings);$(this).each(function(){return new KeyHandler($(this),settings);});};Object.defineProperty($.fn,"keypressed",{get:function get(){return $(this).data('keys');}});Object.defineProperty($.fn,"keys",{get:function get(){var that=this;return {bind:function bind(keysequence,fn){keysequence = keysequence.toUpperCase();that.data('events')[keysequence] = fn;var cmds=keysequence.split('+');for(var i in cmds) {if(!!routekey[cmds[i]]){cmds[i] = routekey[cmds[i]];that.data('events')[cmds.join('+')] = fn;}}}};}});})(jQuery);module.exports = exports["default"];
},{}],33:[function(require,module,exports){
'use strict';Object.defineProperty(exports,'__esModule',{value:true});exports['default'] = tooltip;function tooltip(element){var container=document.createElement('span');var triangle=document.createElement('canvas');var text=document.createElement('span'); //element.appendChild(container);
container.appendChild(triangle);container.appendChild(text);container.classList.add('tooltip');triangle.width = 14;triangle.height = 8;triangle = triangle.getContext('2d');triangle.beginPath();triangle.moveTo(0,8);triangle.lineTo(7,0);triangle.lineTo(14,8);triangle.closePath();triangle.fillStyle = '#000000';triangle.fill();text.innerHTML = element.attributes.tooltip;element.attributes.tooltip = null;element.addEventListener('mouseenter',function(){container.style.top = element.offsetTop + element.offsetWidth + 5 + 'px';container.style.left = element.offsetLeft + 'px';document.querySelector('body').appendChild(container);});element.addEventListener('mouseleave',function(){document.querySelector('body').removeChild(container);});}module.exports = exports['default'];
},{}],34:[function(require,module,exports){
'use strict';function _interopRequireDefault(obj){return obj && obj.__esModule?obj:{'default':obj};}function _interopRequireWildcard(obj){if(obj && obj.__esModule){return obj;}else {var newObj={};if(obj != null){for(var key in obj) {if(Object.prototype.hasOwnProperty.call(obj,key))newObj[key] = obj[key];}}newObj['default'] = obj;return newObj;}}var _modules=require('./modules');var modules=_interopRequireWildcard(_modules);var _core=require('./core');var _core2=_interopRequireDefault(_core); /*
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
let installedplugins = [];

function getTag(node, tags) {
	for (let prop in tags) {
		let tag = tags[prop];
		if (tag.isInstance(node)) {
			return tag;
		}
	}
	return null;
}

function findAllTags(node, container, tags) {
	for (let nname in node.children) {
		let newnode = node.children[nname];
		if (newnode.nodeType === 1) {
			let tag = getTag(newnode, tags);
			if (tag !== null) {
				container[tag.Id] = tag;
			}
			findAllTags(newnode, container, tags);
		} else {
			return true;
		}
	}
}

function NodeAnalysis(tags, maincontainer) {
	let left = {};
	let middle = {};
	let right = {};
	let contain = {};
	let leftNode = this.startContainer.parentNode;
	let rightNode = this.endContainer.parentNode;
	let common = null;
	if (leftNode === rightNode) {
		common = leftNode;
		let insider = this.cloneContents();
		findAllTags(insider, middle, tags);
	} else {
		while (leftNode !== this.commonAncestorContainer && leftNode !== maincontainer) {
			let tag = getTag(leftNode, tags);
			if (tag !== null) {
				left[tag.Id] = tag;
			}
			leftNode = leftNode.parentNode;
		}
		while (rightNode !== this.commonAncestorContainer && rightNode !== maincontainer) {
			let tag = getTag(rightNode, tags);
			if (tag !== null) {
				right[tag.Id] = tag;
			}
			rightNode = rightNode.parentNode;
		}
		common = this.commonAncestorContainer;
	}
	while (common !== maincontainer) {
		let tag = getTag(common, tags);
		if (tag !== null) {
			contain[tag.Id] = tag;
		}
		common = common.parentNode;
	}
	let plugs = {};
	for (let prop in tags) {
		let tag = tags[prop];
		let button = maincontainer.parentNode.querySelectorAll("[data-wriit-commandId=" + tag.Id + "]")[0];
		let highlight = false;
		plugs[tag.Id] = {
			isSorrounded: contain[tag.Id] !== undefined,
			isContained: middle[tag.Id] !== undefined,
			isOpened: right[tag.Id] !== undefined,
			isClosed: left[tag.Id] !== undefined,
			deep: 0
		};
		if (plugs[tag.Id].isSorrounded) {
			button.classList.add('active');
			highlight = true;
		} else {
			button.classList.remove('active');
		}
		let doo = tag.highlight;
		if (highlight && doo) {
			button.style["box-shadow"] = "inset " + tag.AppliedTag.value + " 1px 1px 50px";
		} else {
			button.style["box-shadow"] = "";
		}
	}
	return plugs;
}

function addtotagi(e) {
	$(this).parent().find('.tagi').html('');
	var x = $(document.getSelection().anchorNode.parentNode);
	var i = 0;
	while (x.get(0) !== this) {
		var li = $('<span>' + x.get(0).localName + '</span>');
		$(this).parent().find('.tagi').prepend(li);
		x = x.parent();
	}
}

function Wriit(parent, cfg) {
	let privateData = new WeakMap();
	let props = {
		dataindex: [Object.create(null)],
		data: Object.create(null)
	};
	let indexes = [Object.create(null)];
	var compiled = $(template);
	this.textarea = compiled.find("[data-wriit-role=text-area]");
	this.textarea.html(parent.html());
	parent.replaceWith(compiled);
	this.menu = compiled.find('menu:eq(0)');
	this.cfg = $.extend({}, cfg, {
		Modules: installedplugins
	});
	var that = this;
	var prototype = Object.getPrototypeOf(that);
	this.html = {
		get selection() {
			return this.getSelection(0).coord;
		},
		getSelection: function (n) {
			n = n || 0;
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
	};
	this.selection = function (tagid) {
		return this.Modules[tagid].selection;
	};
	this.textarea.KeyHandler(); {
		let block = false;
		let initialValue = this.textarea.html().trim();
		let storeInfo = function (force) {
			let index = privateData.get(compiled.get(0)) || [];
			if (indexes.length === 51) {

			}
			let prop = index[index.length - 1];
			let textvalue = that.textarea.html().trim();
			let data = privateData.get(prop);

			if (data === undefined && textvalue !== initialValue) {
				prop = Object.create(null);
				privateData.set(prop, initialValue);
				index.push(prop);
				privateData.set(compiled.get(0), index);
				that.buttons.undo.attr('disabled', false);
				return true;
			} else if (

				(data && Math.abs(textvalue.length - data.length) > 15) || (force && textvalue !== data)
			) {
				console.log("Store", textvalue);
				prop = Object.create(null);
				privateData.set(prop, textvalue);
				index.push(prop);
				privateData.set(compiled.get(0), index);
				that.buttons.undo.attr('disabled', false);
				return true;
			}
			return (data !== undefined) && (data && data !== textvalue);
		};

		let clearInfo = function () {
			privateData.set(that.textarea.get(0), []);
			that.buttons.redo.attr('disabled', true);
		};
		compiled.bind('savecontent', function (e) {
			while (block);
			block = true;
			try {
				if (storeInfo()) {
					clearInfo();
				} else {
					that.buttons.undo.attr('disabled', true);
				}
			} catch (ex) {
				console.log(ex);
			}
			block = false;
		});

		let ctrlz = function () {
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

				that.buttons.redo.attr('disabled', false);
			}
			block = false;
			//		$(this).trigger('keyup', e);
			return false;

		};
		this.textarea.keys.bind("CMD+Z", ctrlz);
		prototype.undo = {
			Setup: function (toolbar) {
				this.Callback(toolbar.AddButton(new Single("undo", "_undo", {
					tooltip: "Undo",
					displayclass: "fa fa-undo"
				})), ctrlz);
			}
		};
		prototype.redo = {
			Setup: function (toolbar) {
				this.Callback(toolbar.AddButton(new Single("redo", "_redo", {
					tooltip: "Repeat",
					displayclass: "fa fa-repeat"
				})), ctrlz);
				that.buttons.redo.setAttribute('disabled', true);
			}
		};
	}
	this.textarea.toTextArea({
		coord: false,
		debug: false
	});

	this.Modules = {};
	this.buttons = {};
	this.tags = {};
	this.metadata = {};
	this.textarea.bind('keyup mouseup', addtotagi);
	this.textarea.bind('keyup mouseup', function () {
		that.Modules = NodeAnalysis.apply(that.textarea.getSelection(0).rang, [that.tags, that.textarea.get(0)]);
	});
	setInterval(function () {
		compiled.trigger('savecontent');
	}, 1000);
	let toolbar = new Toolbar(this);
	Object.freeze(toolbar);
	this.ToolBar = toolbar;
	this.cfg.Modules.forEach(function (plugin) {
		if (prototype[plugin].Setup !== null) {
			prototype[plugin] = $.extend(new Module(that), prototype[plugin]);
			prototype[plugin].Setup(toolbar);
		}
	});
	this.button = function (id) {
		return that.buttons[id];
	};
}*/for(var mod in modules) {_core2['default'].prototype[mod] = modules[mod];} /*Wriit.prototype.pasteEvent = {
	Setup: function () {
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
Wriit.prototype.subindex = {
	Setup: function (toolbar) {
		let bt = new Single("subindex", "sub", {
			tooltip: "SubIndex",
			displayclass: "fa fa-subscript"
		});
		toolbar.AddButton(bt);
		this.Callback(bt, this.Insert);
	}
};
Wriit.prototype.pown = {
	Setup: function (toolbar) {
		this.Callback(toolbar.AddButton(new Single("pown", "sup", {
			tooltip: "Super Index",
			displayclass: "fa fa-superscript"
		})), this.Insert);
	}
};
Wriit.prototype.italic = {
	Setup: function (toolbar) {
		this.Callback(toolbar.AddButton(new Single("italic", "em", {
			tooltip: "Italic",
			displayclass: "fa fa-italic"
		})), this.Insert);
	}
};
Wriit.prototype.underline = {
	Setup: function (toolbar) {
		this.Callback(toolbar.AddButton(new Single("underline", "u", {
			tooltip: "Underline",
			displayclass: "fa fa-underline",
			shortcut: "ALT+SHIFT+U"
		})), this.Insert);
	}
};
Wriit.prototype.strikethrough = {
	Setup: function (toolbar) {
		this.Callback(toolbar.AddButton(new Single("strikethrough", "del", {
			tooltip: "Strike Through",
			displayclass: "fa fa-strikethrough",
			shortcut: "ALT+SHIFT+S"
		})), this.Insert);
	}
};*/$.fn.wriit = function(cfg){$(this).each(function(){return new _core2['default']($(this),cfg);});};
},{"./core":8,"./modules":13}]},{},[1,2,8,27,34,9,10,11,12,13,14,15,16,17,20,18,19,21,22,23,24,25,26,3,4,5,6,7]);
