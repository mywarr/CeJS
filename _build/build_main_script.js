//	<reference/> MUST insert before /* .. */
/// <reference path="../_include/CeL.for_include.js" />

/**
 * @name	CeL base framework build tool using JScript
 * @since	2010/1/9 01:16:35
 * 2010/1/14 20:19:27	整理、簡化。
 */



/*

@ Linux ubuntu:
sudo cp -pru /media/366A99896A994691/USB/cgi-bin/lib/JS /usr/share/javascript/CeL && cd /usr/share/javascript/CeL && find . -type f -exec chmod 644 {} \; && find . -type d -exec chmod 755 {} \;

cd /usr/share/javascript/jquery && sudo wget -O jquery-nightly.js http://code.jquery.com/jquery-nightly.js && sudo chmod go+r jquery-nightly.js

*/

//	[CeL]library_loader_by_registry
try{var o;try{o=new ActiveXObject('Microsoft.XMLHTTP')}catch(e){o=new XMLHttpRequest()}o.open('GET',(new ActiveXObject("WScript.Shell")).RegRead('HKCU\\Software\\Colorless echo\\CeL\\main_script'),false);o.send(null);eval(o.responseText)}catch(e){}
//	[CeL]End

var script_name = 'build_main_script',
library_main_script = 'ce.js',
backup_directory = 'old\\', to_directory = '..\\',
alert_message = function(message) {
	WScript.Echo(script_name + ': ' + message);
},
error_recover = function(message) {
	alert_message(message
			+ '\nTry to recover!\n (Or you can stop the process.)');

	var fso = WScript.CreateObject("Scripting.FileSystemObject");
	try {
		fso.DeleteFile(to_directory + library_main_script, true);
	} catch (e) {
	}
	fso.CopyFile(backup_directory + library_main_script, to_directory + library_main_script);

	WScript.Quit(1);
};

if (typeof CeL === 'undefined') {
	alert_message("Can't load library!\n或許檔案路徑並未設定於 registry 之中？");
	//WScript.Echo((new ActiveXObject("WScript.Shell")).RegRead('HKCU\\Software\\Colorless echo\\CeL\\path'));
	WScript.Quit(1);
}

//WScript.Echo(CeL.env.main_script);
if (CeL.env.main_script)
	library_main_script = CeL.env.main_script;

CeL.cache_code = true;

CeL.set_debug();

//CeL.use('code.log');
//var sl = CeL.log;

//CeL.use('code.reorganize');

//CeL.use('IO.file');
CeL.use('IO.Windows.file');
if (!CeL.is_loaded('IO.Windows.file')) {
	alert_message("Can't load module!\n\nlibrary base path:\n" + CeL.env.registry_path);
	WScript.Quit(1);
}

var structure_directory = '_structure\\',
	main_structure_file = structure_directory + 'structure.js',
	file_list = [ main_structure_file ],
	target_file = CeL.env.registry_path + library_main_script,
	structure_code;

structure_code = CeL.read_file(CeL.env.registry_path + main_structure_file,
	CeL.env.source_encoding)
	.replace(/[\r\n\s]+\/\*((.|\n)*?)\*\/[\r\n\s]+/, '')
	.replace(/\/\/\s*add\s+([a-z]+\.js)/g,
		function($0, $1) {
			file_list.push($1);
			return CeL.read_file(
					CeL.env.registry_path + structure_directory + $1,
					CeL.env.source_encoding)
					.replace(/\/\*((.|\n)*?)\*\//, '');
		}
	)
	//	特殊：第一個 undefined
	.replace(/_undefined/,'undefined');

structure_code =
	[
		'',
		'/*',
		'	本檔案為自動生成，請勿編輯！',
		'	This file is auto created from ' + file_list.join(', '),
		'		by tool: ' + CeL.get_script_name() + '.',
		'*/',
		'',
		'',
		''
	].join(CeL.env.new_line)
	+ structure_code;

if (structure_code !== CeL.read_file(target_file)) {
	//	backup
	CeL.move_1_file(target_file, library_main_script, backup_directory);

	// chmod: change to writeable
	CeL.change_attributes(target_file, -CeL.fso_attributes.ReadOnly);

	//	write contents
	CeL.write_file(target_file, structure_code, CeL.env.source_encoding);

	// chmod
	CeL.change_attributes(target_file, CeL.fso_attributes.ReadOnly);
}

