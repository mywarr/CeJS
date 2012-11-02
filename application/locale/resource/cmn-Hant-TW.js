'use strict';
if (typeof CeL === 'function')
	CeL.application.locale.gettext.set_text({
		'Loading..' : '載入中…',
		'Loading %1%..' : '已載入 %1%…',

		// for auto_TOC()
		'Contents of [%1]' : '[%1]的目錄',
		Contents : '目錄',
		'↑Back to TOC' : '↑回到目錄',
		//展開/收起
		show : '顯示',
		hide : '隱藏',

		// interact.integrate.SVG
		number : '數字',
		'function' : '函數',
		date : '日期',
		time : '時間',
		constructor : '建構式',
		// 'class' : '類別',
		// 有問題/無效/不合理的
		'Illegal %1: [%2]' : '有問題（無效或不合理）的%1：[%2]',

		// debug level @ application.debug.log
		log : '記錄',
		em : '重要',
		warn : '警告',
		err : '錯誤',
		info : '訊息',
		debug : '偵錯'
	}, 'cmn-Hant-TW');
