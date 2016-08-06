/**
 * @name CeL function for checking archive sites
 * 
 * @fileoverview 本檔案包含了 checking archive sites 用的程式庫。
 * 
 * TODO:<code>

Memento API
https://en.wikipedia.org/wiki/Memento_Project

http://www.webcitation.org/archive

</code>
 * 
 * @since 2016/8/6 10:4:5
 * @see https://en.wikipedia.org/wiki/Archive_site
 */

'use strict';

// --------------------------------------------------------------------------------------------

// 不採用 if 陳述式，可以避免 Eclipse JSDoc 與 format 多縮排一層。
typeof CeL === 'function' && CeL.run({
	// module name.
	name : 'application.net.archive',
	// .includes() @ data.code.compatibility
	// .between() @ data.native
	require : 'data.code.compatibility.|data.native.'
	// optional 選用:
	+ '|application.net.Ajax.get_URL',
	// 為了方便格式化程式碼，因此將 module 函式主體另外抽出。
	code : module_code,
	// 設定不匯出的子函式。
	no_extend : '*'
});

function module_code(library_namespace) {

	// requiring
	var get_URL = this.r('get_URL');

	function archive_sites() {
	}

	/**
	 * Check if the status is OK.
	 * 
	 * @param status
	 *            status to check
	 * 
	 * @returns {Boolean}the status is OK.
	 */
	function status_is_OK(status) {
		return status >= 200 && status < 300;
	}

	// --------------------------------------------------------------------------------------------

	// archive_org_queue = [ [ URL, {Array}callback_list ] ]
	var archive_org_queue = [], archive_org_last_call,
	// running now. token. 表示是否正執行中。
	archive_org_running;

	function archive_org_operator(checking_now) {
		if (archive_org_running && !checking_now) {
			return;
		}

		if (!checking_now) {
			archive_org_running = checking_now = archive_org_queue.shift();
		}

		function to_wait() {
			library_namespace.debug('Wait ' + need_wait + ' ms: [' + URL + ']',
					3, 'archive_org');
			setTimeout(function() {
				archive_org_operator(checking_now);
			}, need_wait);
		}

		var need_wait = archive_org.lag_interval
				- (Date.now() - archive_org_last_call);
		if (need_wait > 0) {
			to_wait();
			return;
		}
		archive_org_last_call = Date.now();

		var URL = checking_now[0];
		function do_callback(data, error) {
			// 若正執行者，必須負責執行完註銷掉 archive_org_running。
			archive_org_running = null;
			// 登記 result。
			archive_org.cached[URL] = [ data, error ];
			checking_now[1].forEach(function(callback) {
				callback.apply(null, arguments);
			});
		}

		get_URL(archive_org.API_URL + URL, function(data, error) {
			if (library_namespace.is_debug(2)) {
				library_namespace.debug(URL + ': '
				//
				+ (error ? 'Error: ' + error : 'OK'), 0, 'archive_org');
				console.log(data);
			}

			// 短時間內call過多次(應間隔 .5 s?)將503?
			if (!error && data.status === 503) {
				need_wait = archive_org.lag_interval;
				library_namespace.debug('Get status ' + data.status
						+ '. Try again.', 3, 'archive_org');
				to_wait();
				return;
			}

			if (error || !status_is_OK(data.status)) {
				do_callback(undefined, error || data.status || true);
				return;
			}

			data = JSON.parse(data.responseText);
			if (!data || !(data = data.archived_snapshots.closest)
					|| !data.available || !data.url) {
				// 經嘗試未能取得 snapshots。
				do_callback(undefined, data);
				return;
			}

			if (!data.url.startsWith(archive_org.URL_prefix)) {
				library_namespace.warn('archive_org: ' + URL
						+ ': archived URL does not starts with "'
						+ archive_org.URL_prefix + '": ' + data.url + '.');
			}

			var archived_url = data.archived_url = data.url.slice(
					archive_org.URL_prefix.length).between('/');
			if (URL !== archived_url
			// 可能自動加 port。
			&& URL !== (archived_url = archived_url.replace(/:\d+\//, '/'))
			// 可能自動轉 https。
			&& URL !== archived_url.replace('http://', 'https://')) {
				library_namespace.warn('archive_org: [' + URL + '] != ['
						+ data.archived_url + '].');
			}

			do_callback(data);

		}, null, null, {
			// use new agent
			agent : true
		});
	}

	/**
	 * use Wayback Availability JSON API to check if there is any archived
	 * snapshot.
	 * 
	 * archive.org 此 API 只能檢查是否有 snapshot，不能製造 snapshot。
	 * 
	 * @param {String}URL
	 *            請求目的URL
	 * @param {Function}[callback]
	 *            回調函數。 callback({Object|Undefined}closest_snapshot_data,
	 *            error);
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 * 
	 * @see https://archive.org/help/wayback_api.php
	 */
	function archive_org(URL, callback, options) {
		var cached_data = archive_org.cached[URL];
		// 看能不能直接處理掉。
		if (cached_data && !cached_data.checking) {
			library_namespace.debug('已登記 [' + URL + ']。直接處理掉。', 3,
					'archive_org');
			callback.apply(null, cached_data);
			return;
		}

		// 登記 callback。
		if (cached_data) {
			cached_data[1].push(callback);
		} else {
			// 登記 URL，表示正處理中。
			var checking_now = [ URL, [ callback ] ];
			checking_now.checking = true;
			archive_org.cached[URL] = checking_now;
			archive_org_queue.push(checking_now);
		}

		archive_org_operator();
	}

	/** {Natural} 延遲 time in ms。 */
	archive_org.lag_interval = 500;

	archive_org.API_URL = 'http://archive.org/wayback/available?url=';

	/** {String}URL prefix of cached snapshot. */
	archive_org.URL_prefix = 'http://web.archive.org/web/';

	/** {Object} cached[URL] = [ return of archived data, error ] */
	archive_org.cached = library_namespace.null_Object();

	// --------------------------------------------------------------------------------------------

	/**
	 * 檢查 URL 之 access 狀態。若不可得，則預先測試 archive sites 是否有 cached data。
	 * 
	 * @param {String}URL
	 *            請求目的URL
	 * @param {Function}[callback]
	 *            回調函數。 callback(link_status, cached_data);
	 * @param {Object}[options]
	 *            附加參數/設定選擇性/特殊功能與選項
	 */
	function check_URL(URL, callback, options) {
		library_namespace.debug('check external link of [' + URL + ']', 3,
				'check_URL');

		function do_callback(status, OK) {
			if (!checked_URL) {
				// register URL status
				check_URL.link_status[URL] = status;
			}

			if (OK) {
				callback(status);

			} else {
				archive_org(URL, function(closest_snapshot_data, error) {
					// 會先 check archive site 再註銷此 URL，
					// 確保之後處理時已經有 archived data。
					callback(status, closest_snapshot_data);
				});
			}
		}

		var checked_URL;
		if (URL in check_URL.link_status) {
			checked_URL = URL;
		} else if ((checked_URL = URL.replace(':80/', '/')) in check_URL.link_status) {
			// 去掉 port 80。
			URL = checked_URL;
		} else {
			checked_URL = null;
		}

		if (checked_URL) {
			checked_URL = check_URL.link_status[URL];
			do_callback(checked_URL, status_is_OK(checked_URL));
			return;
		}

		get_URL(URL, function(data, error) {

			if (error || typeof data !== 'object'
					|| typeof data.responseText !== 'string') {
				do_callback(error || 'check_URL: Unknown error');

			} else if (!status_is_OK(data.status)) {
				do_callback(data.status);

			} else if (data.responseText.trim()
			//
			|| (options && options.ignore_empty)) {
				do_callback(data.status, true);

			} else {
				do_callback('check_URL: Contents is empty');
			}

		}, null, null, {
			// use new agent
			agent : true
		});
	}

	/** {Object}check_URL.link_status[URL] = status/error */
	check_URL.link_status = library_namespace.null_Object();

	// --------------------------------------------------------------------------------------------

	// export 導出.
	Object.assign(archive_sites, {
		status_is_OK : status_is_OK,

		archive_org : archive_org,

		check_URL : check_URL
	});

	return archive_sites;
}
