
/**
 * @name	CeL log function
 * @fileoverview
 * 本檔案包含了 log functions。
 * @since	2009/11/17
 * @see
 * <a href="http://getfirebug.com/lite.html" accessdate="2010/1/1 14:54">Firebug Lite</a>,
 * <a href="http://www.mozilla.org/projects/venkman/" accessdate="2010/1/1 16:43">Venkman JavaScript Debugger project page</a>
 */

/*
TODO:
emergency/urgent situation alert
會盡量以網頁上方/頂部黄色的導航條/警告條展示
「不再顯示」功能
.format()
	將 div format 成 log panel。
分群
*/



//WScript.Echo(this.Class);

//	若 library base 尚未 load 或本 module 已經 loaded 則跳過。
if (typeof CeL === 'function'){

/**
 * 本 module 之 name(id)，<span style="text-decoration:line-through;">不設定時會從呼叫時之 path 取得</span>。
 * @type	String
 * @constant
 * @inner
 * @ignore
 */
var module_name = 'code.log';

//var do_before_including = function() {};

/*	to include:
	include code_for_including
	<div id="debug_panel"></div>
	var SL=new Debug.log('debug_panel'),sl=function(){SL.log.apply(SL,arguments);},err=function(){SL.err.apply(SL,arguments);},warn=function(){SL.warn.apply(SL,arguments);};

	http://www.comsharp.com/GetKnowledge/zh-CN/TeamBlogTimothyPage_K742.aspx

	if possible, use Firebug Lite instead.
	http://benalman.com/projects/javascript-debug-console-log/
*/


//	===================================================
/**
 * 若欲 include 整個 module 時，需囊括之 code。通常即 CeL。
 * @type	Function
 * @param	{Function} library_namespace	namespace of library
 * @param	load_arguments	呼叫時之 argument(s)
 * @return
 * @constant
 * @inner
 * @ignore
 */
var code_for_including = function(library_namespace, load_arguments) {
//WScript.Echo(this);

var

//	class private	-----------------------------------

//	class name, 需要用到這個都不是好方法。
//cn='Debug.log',

/**
 * private storage pool
 * @ignore
 */
p=[],

log_data = function(m, l) {
	this.m = m;
	this.l = l;
	return this;
},

/**
 * default write/show log function
 * @ignore
 * @param	{string} id	element id
 */
w = function(id) {
	var o, m, c, _p = p[id], _t = _p.instance,
	/**
	 * buffer
	 * @inner
	 * @ignore
	 */
	b = _p.buf,
	B = _p.board, F = _p.do_function, level;

	if (_p.clean)
		_t.clear(), _p.clean = 0;

	if (!B && !F)
		return;

	while (b.length){
		// 預防 MP 時重複顯示
		m = b.shift();

		if (F)
			F(m);

		//	IE8: 'constructor' 是 null 或不是一個物件
		try {
			c = m.constructor;
			// alert((m.constructor === log_data) + '\n' + m.constructor + '\n' + m);
		} catch (e) {
		}
		if (c === log_data) {
			if (!isNaN(m.l) && m.l < library_namespace.set_debug())
				continue;
			c = m.l in _t.className_set ? m.l : 0;
			m = m.m;
			if (c in _t.message_prefix)
				m = _t.message_prefix[c] + m;
			c = _t.className_set[c];
		} else {
			//	add default style set
			if (c = _t.message_prefix.log)
				m = c + m;
			c = _t.className_set.log || 0;
		}
		_p.lbuf.push(m);

		if (B) { // && typeof document==='object'
			o = _p.instance.log_tag;
			if (o) {
				o = document.createElement(o);
				if (c)
					o.className = c;

				o.innerHTML = typeof m === 'string' ?
						// for character (null)
						m.replace(/\x00/g,
						'<span class="control_character">\\x00</span>')
						//	'­' (hyphen) 這符號(連字符)可以自動斷行，並在斷行時自動加上個橫槓。在顯示長整數時較有用。
						.replace(/(\d{20})/g,'$1­')
						: m;
			} else
				o = document.createTextNode(m);
			B.appendChild(o);
		}
	}

	//if(_t.auto_hide)B.style.display=B.innerHTML?'block':'none';
	if (B && _t.auto_scroll)
		with (B)
			scrollTop = scrollHeight - clientHeight;
},


/**
 * save log
 * @ignore
 * @param	m	message
 * @param	{string} id	element id
 * @param	force	force to clean the message area
 */
s = function(m, id, force) {
	var _p = p[id], _t = _p.instance, f = _p.logF, s = _t.save_log;
	if (!s || typeof s === 'function' && !s(m, l))
		return;

	if (m)
		_p.sbuf
				.push(m = (_t.save_date && typeof gDate == 'function' ? _t.save_new_line
						+ gDate() + _t.save_new_line
						: '')
						+ m);

	if (force || _t.flush || _p.sbufL > _t.save_limit)
		try {
			if (f
					|| _t.log_file
					&& (f = _p.logF = fso.OpenTextFile(_t.log_file,
							8/* ForAppending */, true/* create */,
							_t.log_encoding)))
				f.Write(_p.sbuf.join(_t.save_new_line)), _p.sbuf = [],
						_p.sbufL = 0, _t.error_message = 0;
		} catch (e) {
			_t.error_message = e;// err(e);
		}
	else if (m)
		_p.sbufL += m.length;
},

//	instance constructor	---------------------------
//	(document object)
/*

_=this


TODO:
set class in each input
input array
show file path & directory functional	可從 FSO operation.hta 移植
增加 group 以便在多次輸入時亦可 trigger 或排版

count
c.f.: GLog

dependency:

*/
/**
 * initial a log tool's instance/object
 * @class	log function
 * @_see	usage: <a href="#.extend">_module_.extend</a>
 * @since	2008/8/20 23:9:48
 * @requires	gDate(),NewLine,fso

 * @constructor
 * @_name	_module_
 * @param	{String, object HTMLElement} obj	log target: message area element or id
 * @param	{Object} [className_set]	class name set
 */
_// JSDT:_tmp;_module_
= function(obj, className_set) {
	// Initial instance object. You can set it yourself.
	/**
	 * log 時 warning/error message 之 className
	 * @_name	_module_.prototype.className_set
	 */
	this.className_set = className_set || {
			/**
			 * @_description	當呼叫 {@link _module_.prototype.log} 時使用的 className, DEFAULT className.
			 * @_name	_module_.prototype.className_set.log
			 */
			log : 'debug_log',
			/**
			 * @_description	當呼叫 {@link _module_.prototype.warn} 時使用的 className
			 * @_name	_module_.prototype.className_set.warn
			 */
			warn : 'debug_warn',
			/**
			 * @_description	當呼叫 {@link _module_.prototype.err} 時使用的 className
			 * @_name	_module_.prototype.className_set.err
			 */
			err : 'debug_err',
			/**
			 * @_description	當呼叫 {@link _module_.prototype.set_board} 時設定 log panel 使用的 className
			 * @_name	_module_.prototype.className_set.panel
			 */
			panel : 'debug_panel'
	};

	/**
	 * log 時 warning/error message 之 prefix
	 * @_name	_module_.prototype.message_prefix
	 */
	this.message_prefix = {
			/**
			 * @_description	當呼叫 {@link _module_.prototype.log} 時使用的 prefix, DEFAULT prefix.
			 * @_name	_module_.prototype.message_prefix.log
			 */
			log : '',
			/**
			 * @_description	當呼叫 {@link _module_.prototype.warn} 時使用的 prefix
			 * @_name	_module_.prototype.message_prefix.warn
			 */
			warn : '',
			/**
			 * @_description	表示當呼叫 {@link _module_.prototype.err}, 是錯誤 error message 時使用的 prefix
			 * @_name	_module_.prototype.message_prefix.err
			 */
			err : '<em>!! Error !!</em> '
	};

	this.id = p.length;
	p.push( {
		instance : this,
		/**
		 * write buffer
		 */
		buf : [],
		/**
		 * save buffer when we need to save the messages
		 */
		sbuf : [],
		/**
		 * length of save buffer
		 */
		sbufL : 0,
		/**
		 * now logged buffer
		 */
		lbuf : []
	}); 
	this.set_board(obj);
};



//	class public interface	---------------------------

_// JSDT:_module_
.
/**
 * do the log action
 * @_memberOf	_module_
 * @private
 */
do_log = function(id) {
/*	這段應該只在 module namespace 重複定義時才會發生
 var I=p[id];
 if(!I){
  alert('.do_log: not exist: ['+id+']');
  return;
 }
 I=I.instance;
*/
	var I = p[id].instance;
	if (I.do_log)
		I.do_log();
};


_// JSDT:_module_
.
/**
 * 對各種不同 error object 作應對，獲得可理解的 error message。
 * @param	e	error object
 * @param	new_line	new_line
 * @param	caller	function caller
 * @_memberOf	_module_
 * @see
 * http://msdn.microsoft.com/en-us/library/ms976144.aspx
 * The facility code establishes who originated the error. For example, all internal script engine errors generated by the JScript engine have a facility code of "A".
 * http://msdn.microsoft.com/en-us/library/ms690088(VS.85).aspx
 * 
 * http://msdn.microsoft.com/en-us/library/t9zk6eay.aspx
 * http://msdn.microsoft.com/en-us/library/microsoft.jscript.errorobject.aspx
 * Specifies the name of the type of the error.
 * Possible values include Error, EvalError, RangeError, ReferenceError, SyntaxError, TypeError, and URIError.
 */
get_error_message = function(e, new_line, caller) {
	if (!new_line)
		new_line = _.prototype.save_new_line;

	if (!caller)
		//	TODO: do not use arguments
		caller = arguments.callee.caller;

	// from popErr()
	//	type
	var T = library_namespace.is_type(e),
	//	message
	m = T === 'Error' ?
			'Error '
			+ (caller === null ? 'from the top level: ' : '@' + library_namespace.Class + ': ')
			+ (e.number & 0xFFFF) + (e.name ? ' [' + e.name + '] ' : ' ')
			+ '(facility code ' + (e.number >> 16 & 0x1FFF) + '): '
			+ new_line
			+ (e.message || '').replace(/\r?\n/g, '<br/>')
			//	.message 為主，.description 是舊的。
			+ (!e.description || e.description === e.message ?
				'' :
				new_line
					+ new_line
					+ ('' + e.description).replace(/\r?\n/g, '<br/>')
			)
			//	Firefox has (new Error).stack

		: T === 'DOMException'?
			//	http://www.w3.org/TR/DOM-Level-3-Core/core.html#ID-17189187
			'[' + T + '] ' + e.code + ': ' + e.message

		: !e || T === 'string' ? e

		: '[' + T + '] ' + (e.message || e);


	if (library_namespace.is_debug(2) && typeof e === 'object' && e)
		for (T in e)
			try{
				m += '<br/> <span class="debug_debug">' + T + '</span>: '
						+ (T === 'stack' ? ('' + e[T]).replace(
							/[\r\n]+$/, '').replace(/\n/g, '<br/>- ') : e[T]);
			}catch (e) {}

	//m += ' (' + arguments.callee.caller + ')';
	return m;
};


_// JSDT:_module_
.
/**
 * get node description
 * @param	node	HTML node
 * @_memberOf	_module_
 */
node_description = function(node, flag) {
	if (typeof node === 'string')
		node = document.getElementById(node);
	if (!node)
		return;

	var description = '';

	if (node.id)
		description += '#' + node.id;

	if (node.className)
		description += '.' + node.className;

	if (node.tagName)
		description = '&lt;' + node.tagName + description + '&gt;';

	if (!description && node.innerHTML) {
		description = node.innerHTML;
		if (description.length > 40)
			description = description.slice(0, 40);
		description = description.replace(/</g, '&lt;');
	}

	return description || '(null description node)';
};


//預設以訊息框代替
_.default_log_target=
	new Function('m',
		(typeof JSalert === 'function' ? 'JSalert':
			typeof WScript === 'object' ? 'WScript.Echo':
		'alert') +
		"(typeof m==='object'?'['+m.l+'] '+m.m:m);");

_// JSDT:_module_
.
/**
 * get new extend instance
 * @param	{String, object HTMLElement} [obj]	message area element or id
 * @return	{Array} [ instance of this module, log function, warning function, error function ]
 * @_example
 * 
 * //	status logger
 * var SL=new _module_('log'),sl=SL[1],warn=SL[2],err=SL[3];
 * sl(msg);
 * sl(msg,clear);
 * 
 * //	general log
 * function_set = new _module_.extend('panel',{});
 * // 1.
 * function_set = new CeL.code.log.extend('panel',{});
 * logger = function_set[1];
 * // 2.
 * log_only = (new CeL.code.log.extend('panel',{}))[1];
 * 
 * @_memberOf	_module_
 * @since	2009/8/24 20:15:31
 */
extend = function(obj, className_set) {
	//CeL.Log=new CeL.code.log(function(m){var F=typeof JSalert==='function'?JSalert:typeof alert==='function'?alert:WScript.Echo;F(typeof m==='object'?'['+m.l+'] '+m.m:m);});
	/**
	 * new instance
	 * @_type	_module_
	 * @inner
	 * @ignore
	 */
	var o = new _// JSDT:_module_
			(obj || _.default_log_target, className_set);

	return [ o, function() {
		o.log.apply(o, arguments);
	}, function() {
		o.warn.apply(o, arguments);
	}, function() {
		o.err.apply(o, arguments);
	} ];

};


/*
_.option_open=function(p){

};

_.option_file=function(p){
};

_.option_folder=function(p){
};
*/

//	class constructor	---------------------------


_// JSDT:_module_
.prototype = {

//	instance public interface	-------------------

/**
 * 當執行寫檔案或任何錯誤發生時之錯誤訊息。<br/>
 * while error occurred.. should read only
 * @_name	_module_.prototype.error_message
 */
error_message : '',

/**
 * 超過這長度才 save。<=0 表示 autoflash，非數字則不紀錄。
 * @_name	_module_.prototype.save_limit
 * @type	Number
 */
save_limit : 4000,

/**
 * 在 log 結束時執行，相當於 VB 中 DoEvent() 或 。
 * @_name	_module_.prototype.do_event
 */
do_event : library_namespace.DoNoting || null,


/**
 * log 時使用之 tagName, 可用 div / span 等。若不設定會用 document.createTextNode
 * @_name	_module_.prototype.log_tag
 */
log_tag : 'div',


/**
 * boolean or function(message, log level) return save or not
 * 
 * @_name _module_.prototype.save_log
 * @type Boolean
 */
save_log : false,
/**
 * save log to this file path
 * 
 * @_name _module_.prototype.log_file
 * @type Boolean
 */
log_file : false,
/**
 * auto save log. 若未設定，記得在 onunload 時 .save()
 * 
 * @_name _module_.prototype.flush
 * @type Boolean
 */
flush : false,
/**
 * 在 save log 時 add date
 * 
 * @_name _module_.prototype.save_date
 * @type Boolean
 */
save_date : true,
/**
 * 在 save log 時的換行
 * 
 * @_name _module_.prototype.save_new_line
 * @type string
 */
save_new_line : library_namespace.env.new_line || '\r\n',
/**
 * 在 save log 時的 encoding
 * 
 * @_name _module_.prototype.log_encoding
 */
log_encoding : -1,//TristateTrue


/**
 * 自動捲動
 * 
 * @_name _module_.prototype.auto_scroll
 * @type Boolean
 */
auto_scroll : true,
/**
 * 沒有內容時自動隱藏
 * 
 * @deprecated TODO
 * @_name _module_.prototype.auto_hide
 * @type Boolean
 */
auto_hide : false,

/**
 * 等待多久才顯示 log。若為 0 則直接顯示。<br/>
 * (WScript 沒有 setTimeout)
 * @_name	_module_.prototype.interval
 */
interval : typeof setTimeout === 'undefined' ? 0 : 1,

/**
 * log function (no delay)
 * @_name	_module_.prototype.do_log
 */
do_log : function(level) {
	// if(p[this.id].th)clearTimeout(p[this.id].th);

	// reset timeout handle
	p[this.id].th = 0;

	w(this.id);
},

/**
 * class instance 預設作 log 之 function
 * @param {String} m	message
 * @param clean	clean message area
 * @param level	log level
 * @return
 * @_name	_module_.prototype.log
 */
log : function(m, clean, level) {
	var t = this, _p = p[t.id];
	//var msg_head=(arguments.callee.caller+'').match(/function\s([^\(]+)/);if(msg_head)msg_head=msg_head[1]+' ';
	s(m, t.id, level);

	// window.status = m;
	if (level)
		m = new log_data(m, level);

	if (clean)
		// clean log next time
		_p.clean = 1, _p.buf = [ m ];
	else
		_p.buf.push(m);

	if (!t.interval)
		t.do_log();
	else if (!_p.th)
		if (typeof window.setTimeout === 'undefined')
			t.interval = 0, t.do_log();
		else
			// _p.th=setTimeout(cn+'.do_log('+t.id+');',t.interval);
			_p.th = window.setTimeout(function() {
				_.do_log(t.id);
			}, t.interval);

	if (t.do_event)
		t.do_event();
},

/*
TODO:
other methods: INFO,DEBUG,WARNING,ERROR,FATAL,UNKNOWN
*/

/**
 * save message
 * @_name	_module_.prototype.save
 */
save : function() {
	s('', this.id, 1/* force */);
},

//	** important ** 這邊不能作 object 之 initialization，否則因為 object 只會 copy reference，因此 new 時東西會一樣。initialization 得在 _() 中作！
//className_set:{},

/**
 * log a warning
 * @_name	_module_.prototype.warn
 */
warn : function(m, clean) {
	this.log(m, clean, 'warn');
},

/**
 * deal with error message
 * @_name	_module_.prototype.err
 */
err : function(e, clean) {
	this.log(_.get_error_message(e, this.save_new_line,
			//	TODO: do not use arguments
			arguments.callee.caller), clean, 'err');
},


/**
 * 設定寫入到哪<br/>set log board for each instance (document object)
 * @_name	_module_.prototype.set_board
 */
set_board : function(o) {
	var _t = this, _p = p[_t.id];
	if (o)
		if (typeof o === 'function')
			_p.do_function = o;

		else {
			if (typeof o !== 'object'
				&& typeof document === 'object')
				o = document.getElementById(o);
			if (o
					// TODO
					// && library_namespace.is_HTML_obj(o)
				) {
				_p.board = o;
				if (_t = _t.className_set.panel)
					o.className += _t;
				delete _p.do_function;
			}
		}

	return _p.board;
},

/**
 * 獲取當前 buffer 中的 log
 * @_name	_module_.prototype.get_log
 */
get_log : function() {
	return p[this.id].lbuf;
},

/**
 * show/hide log board
 * @_name	_module_.prototype.trigger
 */
trigger : function(s) {
	var _s = p[this.id].board.style;
	if (_s) {
		if (typeof s === 'undefined')
			s = _s.display === 'none';
		return _s.display = s ? 'block' : 'none';
	}
},

/**
 * clear log board
 * @_name	_module_.prototype.clear_board
 */
clear_board : function(b) {
	b.innerHTML = '';
},

/**
 * 清除全部訊息 clear message
 * @_name	_module_.prototype.clear
 */
clear : function() {
	var _p = p[this.id];
	if (_p.board)
		this.clear_board(_p.board);
	_p.lbuf = [];
}

};


/**
 * 不 extend 的 member
 * @ignore
 */
_// JSDT:_module_
.no_extend = 'this,do_log,extend';

return (
	_// JSDT:_module_
);
};

//	===================================================


//	為 modele log 所作的初始化工作

/**
 * modele namespace
 * @_type	_module_
 * @inner
 * @ignore
 */
var ns = CeL.setup_module(module_name, code_for_including);

//WScript.Echo(n.extend);

//code_for_including[generateCode.dLK]='*var Debug={log:code_for_including()};';

CeL.include_module_resource('log.css', module_name);

//	為本 library 用
if (!CeL.Log) {
	var o = ns.extend(), i,
		l = {
			/*
			 * WHITE SMILING FACE (U+263A).
			 * http://decodeunicode.org/en/u+263a
			 */
			'log' : '☺',
			/*
			 * U+26A1 HIGH VOLTAGE SIGN
			 */
			'em' : '⚡',
			/*
			 * WARNING SIGN (U+26A0).
			 */
			'warn' : '⚠',
			/*
			 * U+2620 SKULL AND CROSSBONES
			 */
			'err' : '☠',
			/*
			 * U+2689 BLACK CIRCLE WITH TWO WHITE DOTS
			 */
			'debug' : '⚉'
		},
		t = '<img class="debug_icon" src="' + CeL.get_module_path(module_name, '') + 'icon/';

	// override CeL.log
	CeL.Log = o[0];
	CeL.Log.className_set.em = 'debug_em';
	CeL.Log.className_set.debug = 'debug_debug';

	for(i in l)
		CeL.Log.message_prefix[i] = t + i + '.png" alt="[' + l[i]
			+ ']" title="' + l[i] + ' ' + i + '"/> ';


	l = CeL.log && CeL.log.buffer;

	CeL.log = o[1];
	CeL.warn = o[2];
	CeL.err = o[3];
	CeL.em = function(m, c) {
		CeL.Log.log.call(CeL.Log, m, c, 'em');
	};
	CeL.debug = function(m, l, caller, c) {
		//alert(CeL.is_debug() + ',' + l + '(' + (l === undefined) + '),' + m);
		if (CeL.is_debug(l)){
			if(!caller)
				//	TODO: do not use arguments
				caller = CeL.get_Function_name(arguments.callee.caller);

			CeL.Log.log.call(
					CeL.Log,
					caller ?
							'<span class="debug_caller">'
							+ caller//(caller.charAt(0) === '.' ? CeL.Class + caller : caller)
							+ '</span>: ' + m
						: m
					, c, 'debug'
			);
		}
	};

	if (l)
		for (i in l)
			CeL.debug('(before loading ' + module_name + ') ' + l[i]);
}

}

