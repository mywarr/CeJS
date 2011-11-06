
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
require : 'interact.DOM.is_HTML_element|interact.DOM.get_element|interact.DOM.add_listener|interact.DOM.stop_event|interact.DOM.set_text',
code : function(library_namespace, load_arguments) {
'use strict';

//	requiring
var is_HTML_element, get_element, add_listener, stop_event, set_text;
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
				//	IE10 中拖拉外部檔案時，list[i] 可能會 throw "Invalid argument."
				try {
					data = event.dataTransfer.getData(list[i]);
					library_namespace.debug('[' + (i + 1) + '/' + l + '] [' + list[i] + ']: '
							+ (data ? typeof data === 'string' && /^[a-z\d\-]+:\/\//i.test(data) ?
									'<a href="' + data + '">' + decodeURI(data) + '</a>'
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
							library_namespace.debug('<em>' + this.file.name + '</em>: <img title="' + this.file.name + '" src="'
									+ event.target.result + '"/>',
									0, 'set_drop_target.ondrop');
						}, 'url');
					}
				}

				_.read_files(list, function(event){
					var contents = event.target.result;
					library_namespace.debug('[' + this.file.name + '] loaded: ' + contents.length
							+ ' chars starting as [' + contents.slice(0, 30).replace(/</g, '&lt;')
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
				for ( var i in error)
					if (/^[A-Z_\-\d]+$/.test(i)
							&& code === error[i]) {
						message = '<em>' + i + '</em> to read [' + file.name + '].';
						break;
					}
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

	library_namespace.debug('reading [' + file.name + ']' + (encoding ? 'as ' + encoding : '') + '.', 0, 'read_file');
	if (encoding === 'binary'
		//	IE9 沒有 .readAsBinaryString
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




return (
	_// JSDT:_module_
);
}


});

