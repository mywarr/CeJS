

/**
 * @name	CeL file function
 * @fileoverview
 * 本檔案包含了 file functions。
 * @since	
 */




if (typeof CeL === 'function'){

	/**
	 * 本 module 之 name(id)，<span style="text-decoration:line-through;">不設定時會從呼叫時之 path 取得</span>。
	 * @type	String
	 * @constant
	 * @inner
	 * @ignore
	 */
var module_name = 'IO.file';

//===================================================
/**
 * 若欲 include 整個 module 時，需囊括之 code。
 * @type	Function
 * @param	{Function} library_namespace	namespace of library
 * @param	load_arguments	呼叫時之 argument(s)
 * @return
 * @_name	_module_
 * @constant
 * @inner
 * @ignore
 */
var code_for_including = function() {

/**
 * null module constructor
 * @class	檔案操作相關之 function。
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




//	path處理	-------------------------------------------------------

//	path,mode=1:去除檔名，只餘目錄，如輸入http://hostname/aaa/bbb/ccc得到http://hostname/aaa/bbb/	尚未處理：: * ?
//reducePath[generateCode.dLK]='dirSp,dirSpR';
function reducePath(p,m){
 //alert(typeof p+'\n'+p);
 if(!(p=''+p))return;
 var t;
 if(t=p.match(/^"([^"]*)/))p=t[1];
 if(t=p.match(/(.*)\|<>/))p=t[1];
 //Windows environment variables在真實path前,尚未測試！
 if(typeof WinEnvironment=='object'&&(t=p.match(/%(.+)%/g)))for(i in t)
  if(WinEnvironment[i])p.replace(new RegExp(i,"ig"),WinEnvironment[i]);
 p=p.replace(new RegExp(dirSp=='/'?'\\\\':'/',"g"),dirSp);
 if(m&&(t=p.lastIndexOf(dirSp))!=-1&&t+1!=p.length)p=p.slice(0,t+1);//去除檔名：假如輸入sss/ddd，會把ddd除去！需輸入sss/ddd/以標示ddd為目錄
 //p=p.replace(new RegExp(dirSp+dirSp,'g'),dirSp);	//	\\→\，未考慮到'\\pictures\scenic\canyon.bmp'的情況
 return p.replace(new RegExp('^(\\.'+dirSpR+')+'),'')	//	.\→''
 .replace(new RegExp(dirSpR+'(\\.'+dirSpR+')+','g'),dirSp)	//	\.\→\
 .replace(new RegExp('[^.'+dirSpR+']+'+dirSpR+'\\.\\.'+dirSpR,'g'),'');	//	xx\..\→''
}
//alert(reducePath('http://hostname/../aaa/bbb/../ccc/../ddd',1));

//	去除hostname等，如輸入http://hostname/aaa/bbb/ccc得到aaa/bbb/ccc/
//	假如輸入的格式不正確，可能得出不預期的回應值！
/*	對dirSp.length>1的情形（嚴謹）
function getPathOnly(p){
 //discard hash & search
 var i=p.lastIndexOf('?'),j=p.lastIndexOf('#'),dirSpL=dirSp.length;
 if(i==-1)i=j;else if(j!=-1&&i>j)i=j;if(i!=-1)p=p.slice(0,i);
 //	去除http://hostname/等
 if(p.slice(0,5)=='file:///')p=p.substr('file:///'.length);	//	對file:///特別處理！
 else if((i=p.indexOf(':'+dirSp+dirSp))!=-1&&(i=p.indexOf(dirSp,i+(':'+dirSp+dirSp).length))!=-1))p=p.substr(i+dirSpL);	//	http://hostname/path→path
 else if(p.slice(0,dirSpL)==dirSp)
 //	/usr/local/→usr/local/
 if(p.substr(dirSpL,dirSpL)!=dirSp)p=p.substr(dirSpL);
 //	去除\\hostname\
 else if((i=p.indexOf(dirSp,dirSpL+dirSpL))>dirSpL+dirSpL)p=p.substr(i+dirSpL);
 //	\\\zzzz的情形：不合法的路徑
 else if(i!=-1)throw new Error(1,'illegal path:'+p);
 return p;
}
*/
//	對dirSp.length==1的情形簡化
//getPathOnly[generateCode.dLK]='dirSp';//,isFile
function getPathOnly(p){
 //discard hash & search
 var i=p.lastIndexOf('?'),j=p.lastIndexOf('#');
 if(i==-1)i=j;else if(j!=-1&&i>j)i=j;if(i!=-1)p=p.slice(0,i);
 //	去除http://hostname/等
 if(p.slice(0,8)=='file:///')p=p.substr(8);	//	對file:///（應該是file:）特別處理！
 else if((i=p.indexOf(':'+dirSp+dirSp))!=-1&&(i=p.indexOf(dirSp,i+3)!=-1))p=p.substr(i+1);	//	http://hostname/path→path
 else if(p.charAt(0)==dirSp)
  //	/usr/local/→usr/local/
  if(p.charAt(1)!=dirSp)p=p.substr(1);
  //	去除\\hostname\	不去除：.replace(/[^\\]+$/,'')
  else if((i=p.indexOf(dirSp,2))>2)p=p.substr(i+1);
  //	\\\zzzz的情形：不合法的路徑
  else if(i!=-1)throw new Error(1,'illegal path:'+p);
 if(typeof isFile=='function'&&isFile(p))	//	!isWeb()&&~
  p=p.replace(new RegExp(dirSpR+'[^'+dirSpR+']+$'),dirSp);
 return p;
}




/*	2003/10/1 15:57
	pn(path now)相對於bp(base path)之path(增加../等)
*/
//relatePath[generateCode.dLK]='reducePath,is_absolute_path,same_length,dirSp,dirSpR';
//,WScript,WshShell
function relatePath(bp,pn){
 if(!pn)pn=typeof location=='object'?location.href:typeof WScript=='object'?WScript.ScriptFullName:'';
 if(!bp)bp=typeof location=='object'?location.href:typeof WshShell=='object'?WshShell.CurrentDirectory:typeof WScript=='object'?WScript.ScriptFullName:'';
 //alert('relatePath: parse 1\n'+bp+'\n'+pn);
 var p=reducePath(pn);
 if(!p)return;
 var d=reducePath(bp,1);
 if(!d||!is_absolute_path(d))return p;	//	bp需要是絕對路徑

 //alert('relatePath: parse 2\n'+d+'\n'+p);
 if(!is_absolute_path(p)){	//	p非絕對路徑時先處理成絕對路徑
  var q=p.indexOf(dirSp,1);	//	預防第一字元為dirSp
  if(q==-1)q=p;else q=p.slice(0,q);	//	取得第一識別用目錄名
  //alert('relatePath: parse 3\n'+d+'\n'+q);
  q=d.indexOf(q);
  if(q==-1)return p;
  p=d.slice(0,q)+p;

/*
  var i=0,q=p.split(dirSp),s=new Array(q.length),a=-1,P,bigPC=0,bigP;
  //	找出最大連續相同路徑:尚未最佳化
  for(i=0;i<q.length;i++){
   if(a==-1)P=q[i];else P+=dirSp+q[i];
   if(d.indexOf(P)==-1){if(a!=-1&&s[a]>bigPC)bigPC=s[a],bigP=P;a=-1;}
   else{if(a==-1)a=i;++s[a];}
  }
  d=d.indexOf(bigP);
*/
 }
 var s=same_length(p,d);

 //alert('dirSp:	'+dirSp+'\npath now:\n	'+p+'\nbase path:\n	'+d+'\nsame:	'+s);
 //alert(p+'\n'+d+'\n'+s+'\n'+d.substr(s)+'\n'+d.substr(s).match(new RegExp(dirSp,'g')).length);
 //pLog(d.charAt(s-1)+','+d.slice(0,s)+':'+s+','+d.slice(0,s).lastIndexOf(dirSp));
 if(s>0&&d.charAt(s-1)!=dirSp)s=d.slice(0,s).lastIndexOf(dirSp)+1;
 return s>0?d.substr(s).replace(new RegExp('([^'+dirSpR+']+'+dirSpR+')','g'),'..'+dirSp)+p.substr(s):p;
}
//	想要保持 Protocol，但卻是不同機器時	http://nedbatchelder.com/blog/200710.html#e20071017T215538
//alert(relatePath('//lyrics.meicho.com.tw/game/game.pl?seg=diary21','cgi-bin/game/photo/'));WScript.Quit();



/**
 * determine base path.
 * 給定 base path 的結構後，藉由 path_now 推測 base path 的 full path
 * @param {String} base_path_structure	base path 的範本結構
 * @param {String} path_now
 * @return	{String}	推測的 base path full path
 * @example
 * alert(dBasePath('kanashimi/www/cgi-bin/game/'));
 * @requres	reducePath,getPathOnly,dirSp,dirSpR
 */
function dBasePath(base_path_structure, path_now) {
	if (!path_now)
		path_now = library_namespace.get_base_path();

	var p = reducePath(path_now, 1);
	if (!p)
		return;
	if (!base_path_structure)
		return p;

	var i, j, k, t,
	// or use .split()
	d = getPathOnly(reducePath(base_path_structure, 1))
		.match(new RegExp('([^' + dirSpR + ']+' + dirSpR + ')', 'g'));
	if (!d)
		return;

	for (i = 0, t = ''; i < d.length; i++)
		if (p.lastIndexOf(dirSp + d[i]) !== -1) {
			t = dirSp;
			while (d[i] && (k = p.lastIndexOf(t + d[i])) !== -1)
				j = k, t += d[i++];
			while (d[i])
				t += d[i++];
			break;
		}
	if (!t)
		//alert("Can't find base directory of this file!\n" + path_name + '\n\nTreat base directory as:\n' + p);
		return p;

	//alert('dBasePath:\nbp='+bp+'\npn='+pn+'\n\n'+p.slice(0,j)+'\n'+t+'\n'+(t.replace(new RegExp('([^'+dirSpR+']+'+dirSpR+')','g'),' ').length-1));
	return p.slice(0, j) + t;
}


/**
 * cf: getFN()
 * @param {String} path	path name
 * @return
 */
function parse_path(path) {
	if (typeof path !== 'string' || !path)
		return;

	var path_data = {
		oInput : path
	}, m;

	if (m = path.match(/^(([A-Za-z]):\\)(([^\\]+\\)*)([^\\]+)?$/))
		path_data.drive = m[2],
		path_data.path_name = m[3],
		path_data.file_name = m[5];
	else if (m = path
			.match(/^file:\/\/\/([A-Za-z]):\/(([^\/]+\/)*)([^\/]+)?$/))
		path_data.drive = m[1],
		path_data.path_name = m[2].replace(/\//g, '\\'),
		path_data.file_name = m[4].replace(/\//g, '\\');

	path_data.path = path_data.path_name + path_data.file_name;
	path_data.location = path_data.drive + ':\\' + path_data.path;
	path_data.directory = path_data.drive + ':\\' + path_data.path_name;

	return path_data;
};


/**
 * is absolute or relative path, not very good solution
 * @param {String} path
 * @return
 * @requires	dirSp,dirSpR
 */
function is_absolute_path(path) {
	//alert(typeof path + '\n' + path);
	return path
		&& (dirSp === '/' && path.charAt(0) === dirSp || new RegExp(
		'^(\\\\|[A-Za-z]+:)' + dirSpR).test(path))
		// ?true:false
		;
};


//	轉成path（加'\'）
function turnToPath(p){return p?p+(p.slice(-1)=='\\'?'':'\\'):'';}
//	僅取得path部分(包括 dirSp)，不包括檔名。
//getFilePath[generateCode.dLK]='dirSp';
function getFilePath(p){
 var i=p.lastIndexOf(dirSp);
 if(i==-1)p+=dirSp;	//	相對路徑?
 else if(i<p.length-1)p=p.slice(0,i+1);	//	取得path部分
 return p;
}
/*	傳回包括檔名之絕對/相對路徑，假如是資料夾，也會回傳資料夾路徑。可包含'.','..'等	the return value include ? #
	在Win/DOS下輸入'\'..會加上base driver
	若只要相對路徑，可用reducePath()。取得如'..\out'的絕對路徑可用getFP('../out',1)
*/
//getFP[generateCode.dLK]='dBasePath,reducePath,is_absolute_path,getPathOnly,relatePath';
function getFP(p,m,bp){	//	path,mode=0:傳回auto(維持原狀),1:傳回絕對路徑,2:傳回相對路徑,base path
 //old:	return (p.lastIndexOf('\\')==-1&&p.lastIndexOf('/')==-1?getFolder(getScriptFullName()):'')+p;//getF
 if(!p)return'';
 if(p.charAt(0)=='\\'&&dBasePath(bp).match(/^(\\\\|[A-Za-z]+:)/))p=RegExp.$1+p;
 p=reducePath(p);
 if(m==1){
  if(!is_absolute_path(p))p=reducePath((bp?getPathOnly(bp):dBasePath())+p);	//	當為相對路徑時前置base path
 }else if(m==2&&is_absolute_path(p))p=relatePath(dBasePath(bp),p);
 return p;
}
//	傳回檔名部分，the return value include ? #
//getFN[generateCode.dLK]='getFP,dirSp';
function getFN(p,bp,m){	//	path,base path,mode=0:檔名,1:(當輸入為不可信賴的字串時)去除檔名中不允許的字元，割掉? #等
 p=getFP(p,0,bp);
 p=p.slice(p.lastIndexOf(dirSp)+1);	//	不能用.substr(p.lastIndexOf(dirSp))+dirSp,因為p.lastIndexOf(dirSp)可能==-1	//	比起(m=p.lastIndexOf(dirSp))==-1?p:p.substr(m+1);此法比較直接，不過感覺多一道手續…
 if(m){
  if(p.match(/[#?]/))p=p.substr(0,RegExp.lastIndex-1);
  p=p.replace(/[\\\/:*?"<>|]/g,'_');//[ \.]	//	去除檔名中不允許的字元
 }
 return p;
}
//	傳回檔案/資料夾物件	FileSystemObjectのバグ(制限)で、環境によっては2G以上の領域を認識できません。WSH5.6ではこのバグが修正されています。
//getF[generateCode.dLK]='isFile,dealShortcut,getFP,dirSp,getFolder,initWScriptObj';
function getF(p,m,bp){	//	path,mode=0:auto(維持原狀),1:絕對路徑,2:相對路徑,base path
 try{return isFile(p=dealShortcut(getFP(p,m,bp),1))?fso.GetFile(p):fso.GetFolder(p);}
 catch(e){return p.indexOf(dirSp)==-1?getF(getFolder(WScript.ScriptFullName)+p,m,bp):null;}
}
//alert(getFP('\program files\\xxx\\xxx.exe',2));





return (
	_// JSDT:_module_
);
};

//===================================================

CeL.setup_module(module_name, code_for_including);

};
