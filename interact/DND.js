
/**
 * @name	CeL function for drag-and-drop
 * @fileoverview
 * 本檔案包含了 web 物件的拖曳 functions。
 * @since	
 */

/*
http://www.w3.org/TR/html5/dnd.html#dnd
http://www.whatwg.org/specs/web-apps/current-work/multipage/dnd.html
https://developer.mozilla.org/en/Using_files_from_web_applications
http://html5demos.com/drag
http://d.hatena.ne.jp/ksy_dev/20100731/p1?sid=810f738005e991c6

*/

if (typeof CeL === 'function')
CeL.setup_module('interact.DND',
{
require : 'interact.DOM.is_HTML_element|interact.DOM.get_element|interact.DOM.add_listener|interact.DOM.stop_event|interact.DOM.set_text|data.swap_key_value',
code : function(library_namespace, load_arguments) {
'use strict';

//	requiring
var is_HTML_element, get_element, add_listener, stop_event, set_text, swap_key_value;
eval(library_namespace.use_function(this));



/**
 * null module constructor
 * @class	web drag_and_drop 的 functions
 */
var _// JSDT:_module_
= function() {
	//	null module constructor
};

/**
 * for JSDT: 有 prototype 才會將之當作 Class
 */
_// JSDT:_module_
.prototype = {
};



_// JSDT:_module_
.
move_element = function(element, target) {
	target.appendChild(element.parentNode.removeChild(element));
};




_// JSDT:_module_
.
set_drop_target = function(element, drop_handler, drag_in_handler) {
	if (!is_HTML_element(element)
			&& !is_HTML_element(element = get_element(element)))
		return;

	//if(element.id) library_namespace.debug(element.id, 0, 'set_drop_target');

	add_listener( {
		//	拖進 target。
		//	阻止 dragover 預定動作方能觸發 ondrop。
		//	http://fillano.blog.ithome.com.tw/post/257/81723
		dragover : stop_event,
		//	在 target 上拖動。
		dragenter : stop_event,
		//	在 target 上拖完放開滑鼠。
		drop : function(event) {
			//	處理 types: 將所有設定的 type 一一列出。IE9 沒有 dataTransfer.types。
			var i = 0, list = event.dataTransfer.types || ['text', 'url'], l = list.length, data;
			for (; i < l; i++) {
				try {
					//	IE10 中拖拉外部檔案時，dataTransfer.getData(list[i]) 可能會 throw "Invalid argument."
					data = event.dataTransfer.getData(list[i]);
					library_namespace.debug('[' + (i + 1) + '/' + l + '] [' + list[i] + ']: '
							+ (data ? typeof data === 'string' && /^[a-z\d\-]+:\/\//i.test(data) ?
									'<a href="' + data + '" target="_blank">' + decodeURI(data) + '</a>'
									: data
								: '[' + typeof data + '] ' + (String(data) || '<span class="gray">(null)</span>')),
							0, 'set_drop_target.ondrop');
				} catch (e) {
					library_namespace.debug('Error to get data of [' + list[i] + ']: ' + e,
							0, 'set_drop_target.ondrop');
					//library_namespace.err(e);
				}
			}

			//	處理 files. IE9 沒有 dataTransfer.files。
			//	http://www.html5rocks.com/en/tutorials/file/dndfiles/
			if((list = event.dataTransfer.files)
					&& (l = list.length)){
				library_namespace.debug('Drop ' + l + ' file object(s).', 0, 'set_drop_target.ondrop');
				for (i = 0; i < l; i++) {
					data = list[i];
					library_namespace.debug('[' + (i + 1) + '/' + l + '] <em>'
							+ data.name + '</em>' + (data.type ? ' (' + data.type + ')' : '') + ': ' + data.size + ' bytes.',
							0, 'set_drop_target.ondrop');

					//	若是小圖，則直接顯示出來。
					if (/^image\//.test(data.type) && data.size < 1000000) {
						_.read_file(data, function(event) {
							var contents = event.target.result;
							library_namespace.debug('<em>' + this.file.name + '</em>: <img title="' + this.file.name + '" src="'
									+ contents + '"/>' + contents.length
									+ ' chars starting with [' + contents.slice(0, 30).replace(/</g, '&lt;') + ']',
									0, 'set_drop_target.ondrop');
						}, 'url');
					}
				}

				_.read_files(list, function(event){
					var contents = event.target.result;
					library_namespace.debug('[' + this.file.name + '] loaded: ' + contents.length
							+ ' chars starting with [' + contents.slice(0, 30).replace(/</g, '&lt;')
							+ ']', 0, 'set_drop_target');
				});
			}

			return stop_event(event);
		}
	}, element);

	if (library_namespace.is_Object(drop_handler)) {
		;
	}

	return element;
};


//	<a href="http://www.w3.org/TR/FileAPI/" accessdate="2011/11/5 15:33">File API</a>
_// JSDT:_module_
.
read_files = function(files, handler, index) {
	//	check files type
	if (!library_namespace.is_type(files, 'FileList')) {
		if(handler && typeof handler.error === 'function')
			//handler.error.call(null);
			handler.error();
		return;
	}

	if(isNaN(index)){
		//	初始化 initialization
		handler = _.read_file.regular_handler(handler);

		index = 0;
	}

	//	依序讀入個別檔案內容。
	_.read_file(files[index], [ handler, {
		loadend : function() {
			if (++index < files.length)
				_.read_files(files, handler, index);
		}
	} ]);
};


//	<a href="http://www.w3.org/TR/FileAPI/" accessdate="2011/11/5 15:33">File API</a>
_// JSDT:_module_
.
read_file = function(file, handler, encoding, start, end) {
	if(!window.FileReader){
		library_namespace.err('read_file: This browser does not support FileReader.');
		return;
	}

	//	check file type
	if (!library_namespace.is_type(file, 'File')) {
		if(handler && typeof handler.error === 'function')
			//handler.error.call(null);
			handler.error();
		return;
	}

	var blob, reader = new window.FileReader();
	//	非標準! 但這樣設定後，event handler 中即可使用 this.file 取得相關資訊。
	reader.file = file;

	add_listener( [ _.read_file.regular_handler(handler), {
		error : function(event) {
			var error = event.target.error, code = error.code, message;
			switch (code) {
			case error.NOT_FOUND_ERR:
				message = 'File [' + file.name + '] Not Found!';
				break;
			case error.NOT_READABLE_ERR:
				message = 'File [' + file.name + '] is not readable!';
				break;
			case error.ABORT_ERR:
				message = 'User aborted reading [' + file.name + '].';
				break;
			case error.SECURITY_ERR:
				message = 'Security error to read [' + file.name + '].';
				break;
			default:
				error = _.read_file.code_to_name || (_.read_file.code_to_name = swap_key_value(error, [], /^[A-Z_\-\d]+$/));
				if (code in error)
					message = '<em>' + error[code] + '</em> to read [' + file.name + '].';
			}
			library_namespace.warn('read_file: ' + (message || 'Error ' + code + ' to read [' + file.name + '].'));
		},
		loadend : function() {
			//	預防 memory leak.
			delete reader.file;
			//library_namespace.debug('reader.file deleted.', 2, 'read_file');
		}
	} ], reader);

	if (start || end) {
		if (isNaN(start = parseInt(start))
				|| start < 0)
			start = 0;
		if (!isNaN(end = parseInt(end))
				&& end > start && end < file.size)
			blob = file.slice ? file.slice(start, end)
					: file.webkitSlice ? file.webkitSlice(start, end)
					: file.mozSlice ? file.mozSlice(start, end)
					: null;
	}

	if(!blob)
		blob = file;

	library_namespace.debug('read-in [' + file.name + ']' + (encoding ? ' as ' + encoding : '') + '.', 0, 'read_file');
	if ((!encoding || encoding === 'binary')
		//	IE10 沒有 .readAsBinaryString
		&& reader.readAsBinaryString)
		reader.readAsBinaryString(blob);
	else if(encoding === 'url')
		reader.readAsDataURL(blob);
	else
		//	UTF-8 is assumed if this parameter is not specified.
		//	https://developer.mozilla.org/en/DOM/FileReader
		reader.readAsText(blob, encoding || 'UTF-8');
};

_// JSDT:_module_
.
read_file.regular_handler = function(handler) {
	if (typeof handler === 'function')
		handler = {
			load : handler
		};

	if (library_namespace.is_Object(handler)) {
		if (typeof handler.status === 'string')
			handler.status = get_element(handler.status);

		if (is_HTML_element(handler.status)) {
			// progress bar
			var progress_bar = handler.status;
			if(!handler.progress)
				handler.progress = function(event) {
					if (event.lengthComputable) {
						//	讀取比例
						//var percent_loaded;
						set_text(progress_bar, '[' + this.file.name + '] ' +
								(progress_bar.style.width = Math.round(event.loaded / event.total * 100) + '%'));
					}
				};
			if(!handler.load)
				handler.load = function(event) {
					set_text(progress_bar, '[' + this.file.name + '] loaded.');
				};

			delete handler.status;
		}

	}

	return handler;
};







//	about drag-and-drop @ IE6	---------------------------

/*
2008/1/24 0:51:17
*/

//CSS of body
getDragPath.bCSS = 'margin:0;padding:.2em;color:#e42;background-color:#eff;';
// default contents in HTML
getDragPath.dC = '<em>Drop Here</em> （不能拖曳多個物件）';
// show infomation after every drag
getDragPath.show = 1;
// drag object
getDragPath.o = 'dropT';
// 每次執行完是否應顯示
getDragPath.shouldShow = function(o) {
	return o == showM.so;
};

// href Object & Array
getDragPath.hO = {};
getDragPath.hA = [];

//	未設定目錄。拖曳功能只在 IE6 有效。
getDragPath.able = function() {
	var n = window ? window.navigator : 0;
	try {
		return n && (n = n.appVersion) && (n = n.match(/MSIE (\d+)/))
				&& n[1] == 6;
	} catch (e) {
		//	呼叫 navigator.* 可能有 -2147024882 "存放裝置空間不足，無法完成此操作。"
		//	http://www.dotblogs.com.tw/alonstar/archive/2008/10/09/5625.aspx
		//	結果原來是我的機碼不知道為什麼多了一大堆.NET CLR 3.0的版本，找了一台正常的比對之後，把多的機碼刪除就好了。
		//	HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Internet Settings\5.0\User Agent\Post Platform
		return !!this.hA;
	}
};

getDragPath.add = function(p) {
	// sl('getDragPath: add path ['+p+']');

	// 不能計算數目：不準 可能會有 file:///, http:// 等
	this.hO[this.href = p] = 1;
};

//	每 getDragPath.interval 執行一次
function getDragPath() {
	var _s = arguments.callee,
	// 或者直接用 dropT.location.href，不透過 document.getElementById.
	o = document.getElementById(_s.o), w = o.contentWindow, bU = 'about:blank', i, t = [];

	if (w.location.href != _s.href || w.location.href != bU) {
		// 處理中隱藏，預防此時再被拖進。
		o.style.display = 'none';
		if (w.location.href != bU) {
			// sl('getDragPath: get href ['+w.location.href+']');
			i = unescape(getPathOnly(w.location.href));
			// sl('getDragPath: get unescaped href ['+i+']');
			// NOT GOOD: if(!i.indexOf('file:///'))i=getFP(getPathOnly(i));
			//	drag 的都是完整 path。getPathOnly 應該先於 unescape，預防 # 等字元。
			if (/^[a-z]:\//i.test(i))
				i = getFP(i.replace(/\//g, '\\'));

			_s.add(i);

			w.location.href = bU;
			if (_s.show)
				_s.d(), _s.afterAdd && _s.afterAdd();
		}
		if (bU == w.location.href)
			// 用 try: 有時 about:blank 還沒設定好
			try {
				// 無法用 className
				var s = w.document.body;
				s.style.cssText = _s.bCSS;
				//	只能在 about:blank 設定
				s.innerHTML = _s.dC;
				var s = _s.shouldShow;
				o.style.display = (typeof s === 'function' ? s(_s.o) : s) ? 'block'
						: 'none';
			} catch (e) {
			}
	}
	return _s.href;
}
//	delete url in collection
getDragPath.d = function(u) {
	if (u === 1) {
		this.hO = {};
		return;
	} else if (u in this.hO)
		delete this.hO[u];
	this.hA = [];
	var t = [];
	for (i in this.hO){
		this.hA.push(i);
		t.push('<div><b style="cursor:pointer;color:#e22;" onclick="getDragPath.d(this.parentNode.childNodes[2].innerHTML);">[delete]</b> <span>'
				+ i + '</span></div>');
	}
	// this.hA=this.hA.sort();
	sl('last dragged: '
			+ this.href
			+ (t.length > 1 ? '<hr/>[' + t.length + '] getDragPath.hA:<br/>'
					+ t.join('') : ''));
	return this.hA;
};

//getDragPath.afterAdd = function() {};






return (
	_// JSDT:_module_
);
}


});

