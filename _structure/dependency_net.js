/**
 * @name CeL function for dependency net
 * @fileoverview 本檔案包含了相依, dependency relation, dependency net 用的 functions。
 *               TODO: 增加效率。這可能得更動架構設計。
 * @since
 * @example <code>
 * </code>
 * @see
 */

'use strict';
if (typeof CeL === 'function') {

	// hash 處理。

	CeL.object_hash = (function(library_namespace) {

		function object_hash() {
			this.list_of_hash_to_object = {};
		}

		function hash_of_object(object, add_it) {
			if (arguments.length === 0)
				return;

			var hash, type = typeof object, list_of_hash_to_object = this.list_of_hash_to_object;
			// https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Operators/typeof
			switch (type) {
			case 'boolean':
			case 'number':
			case 'undefined':
			case 'string':
				hash = String(object);
				break;
			// 對純量，無法判別個別 instance。

			case 'function':
				if (library_namespace.is_Function(object)) {
					// 若設定 function.toString，僅能得到 object.toString()。
					hash = String(object);
					hash = hash.length + '|' + hash;
					break;
				}
			case 'object':
				if (Array.isArray(object)) {
					hash = (2 * object.length < this.max_hash_length ? object
							: object.slice(0, this.max_hash_length / 2))
							.toString();
					break;
				}
				if (library_namespace.is_Object(object)) {
					hash = '{';
					var i;
					for (i in object) {
						hash += i + ':' + object[i];
						// 不須過長。
						if (hash.length > this.max_hash_length) {
							i = null;
							break;
						}
					}
					if (i !== null)
						hash += '}';
					break;
				}
			case 'xml':
			case 'date':
			default:
				hash = library_namespace.is_type(object) + object;
				break;
			}

			// 正規化。
			hash = hash.slice(0, this.max_hash_length)
					.replace(/_(\d+)$/, '-$1');
			if (library_namespace.is_debug(2) && library_namespace.is_WWW())
				library_namespace.debug('hash: [' + hash + ']', 1,
						'hash_of_object');

			if (hash in list_of_hash_to_object) {
				var list = list_of_hash_to_object[hash],
				//
				index = list.indexOf(object);

				if (library_namespace.is_debug(2) && library_namespace.is_WWW())
					library_namespace.debug('衝突(collision) @ hash [' + hash
							+ '], index ' + index + ' / ' + list.length, 1,
							'hash_of_object');

				if (index === -1) {
					// TODO: 偵測 ELEMENT_NODE.isSameNode, Array 之深度檢測等。
					// incase NaN. 但不可用 isNaN(object), 因為 isNaN(undefined) ===
					// true.
					if (object !== object) {
						index = 0;
					} else if (add_it)
						index = list.push(object) - 1;
					else
						hash = undefined;
				}

			} else if (add_it) {
				// add new one.
				list_of_hash_to_object[hash] = [ object ];
				index = 0;
			} else
				hash = undefined;

			return hash && [ hash, index ];
		}

		function object_of_hash(hash, allow_throw) {
			try {
				var list, match = hash.match(/_(\d+)$/);
				if (match) {
					match = parseInt(match[1]);
					list = this.list_of_hash_to_object[hash
							.replace(/_\d+$/, '')];
					return match in list && list[match];
				}

			} catch (e) {
				if (allow_throw)
					throw e;
			}
		}

		function remove_object(object) {
			var hash = this.hash_of_object(object), list_of_hash_to_object, list, key;
			if (hash) {
				list_of_hash_to_object = this.list_of_hash_to_object;
				list = list_of_hash_to_object[key = hash[0]];
				if (list.length < 2)
					delete list_of_hash_to_object[key];
				else
					delete list[hash[1]];
			}
		}

		function remove_hash(hash) {
			if (hash)
				delete this.list_of_hash_to_object[hash];
		}

		function for_each(handle, thisArg) {
			var list_of_hash_to_object = this.list_of_hash_to_object, hash;
			for (hash in list_of_hash_to_object)
				list_of_hash_to_object[hash].forEach(function(object, index) {
					handle.call(thisArg, object, hash + '_' + index);
				});
		}

		library_namespace.extend({
			item : object_of_hash,
			hash_of_object : hash_of_object,
			add : function(object, add_it) {
				var hash = this.hash_of_object(object, add_it);
				return hash && hash.join('_');
			},
			each : for_each,
			max_hash_length : 200
		}, object_hash.prototype);

		return (object_hash// JSDT:_module_
		);
	})(CeL);

	// -----------------------------------------------------------

	// dependency 處理。

	CeL.dependency_net = (function(library_namespace) {

		function dependency_net() {
			this.hashs = new library_namespace.object_hash();
			// hashs_needs[hash key] = [所有需要此 hash 的; 所有依賴此 hash 者]。
			this.hashs_needs = {};
			// hashs_required_by[hash key] = [所有此 hash 需要的; 所有此 hash 依賴者]。
			this.hashs_required_by = {};
		}

		function has_hash(hash) {
			if (arguments.length)
				return hash in this.hashs_needs;

			for (hash in this.hashs_needs)
				return true;
			return false;
		}

		// independent → dependent
		function add_need(independent_hash, dependent_hash) {
			// 維護雙向指標。
			var list = this.hashs_needs;
			if (!(independent_hash in list))
				list[independent_hash] = [ dependent_hash ];
			else if (list[independent_hash].indexOf(dependent_hash) === -1)
				list[independent_hash].push(dependent_hash);

			list = this.hashs_required_by;
			if (!(dependent_hash in list))
				list[dependent_hash] = [ independent_hash ];
			else if (list[dependent_hash].indexOf(independent_hash) === -1)
				list[dependent_hash].push(independent_hash);

		}

		// 設定 hash 無須任何 requires。
		function set_free(hash) {
			var hashs_required_by = this.hashs_required_by;
			if (hash in hashs_required_by) {
				// 維護雙向指標。
				hashs_required_by[hash].forEach(function(o) {
					var l = this.hashs_needs[o],
					// Array.prototype.indexOf()
					i = l.indexOf(o);
					if (i === -1)
						throw 'data error!';
					// remove specified index from Array
					delete l[i];
				}, this);
				delete hashs_required_by[hash];
			}
		}

		// get need of
		function get_need(object) {
			var hash = this.hashs.add(object);

			if (hash && (hash in this.hashs_required_by))
				return this.hashs_required_by[hash];
		}

		// set need of
		// 解決順序: needs__object_list → object → needed_by__object_list
		function set_need(needs__object_list, object, needed_by__object_list) {
			var hashs = this.hashs, hash = hashs.add(object, true);

			if (hash) {
				if (needs__object_list) {
					if (!Array.isArray(needs__object_list))
						needs__object_list = [ needs__object_list ];
					needs__object_list.forEach(function(o) {
						this.add_need(hashs.add(o, true), hash);
					}, this);
				}

				if (needed_by__object_list) {
					if (!Array.isArray(needed_by__object_list))
						needed_by__object_list = [ needed_by__object_list ];
					needed_by__object_list.forEach(function(o) {
						this.add_need(hash, hashs.add(o, true));
					}, this);
				}
			} else
				return true;
		}

		function get_independent(object, return_hash) {
			if (typeof object === 'undefined')
				try {
					this.hashs.each(function(object, hash) {
						if (object = this.get_independent(object, return_hash))
							throw object;
					}, this);
					return;
				} catch (e) {
					return e;
				}

			var hashs_needs = this.hashs_needs, hash = this.hashs.add(object);
			if (hash) {
				var dependent_hash = {}, independent_hash = {}, hashs_required_by = this.hashs_required_by,
				//
				add_hash_to_pool = function(hash, parent_serial) {
					if (!(hash in hashs_required_by))
						// 沒有需要的。
						independent_hash[hash] = parent_serial.length;

					else if (!(hash in dependent_hash)) {
						// 處理所有上層。
						dependent_hash[hash] = parent_serial.length;
						// parent_serial.append(hash);
						parent_serial = parent_serial.concat(hash);
						hashs_required_by[hash].forEach(function(h) {
							add_hash_to_pool(h, parent_serial);
						});

					} else if (parent_serial.indexOf(hash) !== -1) {
						// 循環參照(circular dependencies)。將之改作 independent。
						delete dependent_hash[hash];
						independent_hash[hash] = null;
					}

				};

				add_hash_to_pool(hash, []);
				if (return_hash)
					return independent_hash;

				object = [];
				for (hash in independent_hash)
					object.push(this.hashs.item(hash));
				if (object.length)
					return object;
			}
		}

		// private method.
		var daemon_is_running = false;
		function handle_daemon(options, object) {
			if (typeof this.daemon_handle !== 'function' || daemon_is_running)
				return;

			daemon_is_running = true;
			// 開始測試是否有獨立 object 可直接處理/解決。
			var independent_list = get_independent(object, true);
			if (!independent_list || !independent_list.length) {
				if (this.has_hash())
					library_namespace.warn('已無獨立元素，卻仍有元素未處理。');
				daemon_is_running = false;
				return;
			}

			// 開始處理。
			independent_list.forEach(function(h) {
				try {
					// 最後確認，independent_list 元素獨立才處理。
					if (!(h in this.hashs_required_by))
						this.daemon_handle.call(options || {}, this.hashs
								.item(h));
				} catch (e) {
				}
			}, this);

			setTimeout(handle_daemon.bind(options), options.wait || 0);
		}

		// public interface.
		library_namespace.extend({
			item : function(hash) {
				return this.hashs.item(hash);
			},
			add : function(object) {
				return this.hashs.add(object, true);
			},
			add_need : add_need,
			'delete' : set_free,
			get_need : get_need,
			set_need : set_need,
			get_independent : get_independent,
			handle_daemon : handle_daemon
		}, dependency_net.prototype);

		return (dependency_net// JSDT:_module_
		);

	})(CeL);

	// -----------------------------------------------------------

	// 載入處理。

	(function(_) {
		var need_net = new _.dependency_net(),
		// status{hash : [major status of object, 詳細 status]}
		status = {},
		// 計數用。
		CONST_COUNT = 0,

		// const: 程序處理方法。
		PARALLEL = CONST_COUNT++, SEQUENTIAL = CONST_COUNT++,

		// const: major status of object.
		UNKNOWN = undefined,
		// LOADING, INCLUDING, reloading, reincluding.
		WORKING = ++CONST_COUNT,
		// 主要的兩種處理結果。
		OK = ++CONST_COUNT, FAILURE = ++CONST_COUNT,

		// const: 詳細 status/detailed information of object.
		LOADING = ++CONST_COUNT, LOAD_FAILED = ++CONST_COUNT,
		//
		INCLUDING = ++CONST_COUNT, INCLUDE_FAILED = ++CONST_COUNT,
		// included: path 已嵌入/掛上/module registered/函數已執行。
		INCLUDED = ++CONST_COUNT;

		// 設定主要處理程序。
		need_net.daemon_handle = function(item) {
			if (item === PARALLEL || item === SEQUENTIAL)
				this.parallel = item === PARALLEL;

			if (typeof item === 'function')
				try {
					// 已經過鑑別，這邊的應該都是 function。
					item();

				} catch (e) {
					_.err('run: ' + e.message);
					_.debug('<code>'
							+ ('' + item).replace(/</g, '&lt;').replace(/\n/g,
									'<br />') + '</code>');
				}
		};

		function is_done(item) {
			return;
		}

		function _run(sequence, options) {
			var item = sequence[0];

			if (typeof item === 'string' && item) {
				if (_.match_module_name_pattern(item)) {
					_.debug('treat resource [' + item + '] as module.', 2,
							'_run');
					item = {
						module : item
					};
				} else {
					_
							.debug('treat resource [' + item + '] as path.', 2,
									'_run');
					item = {
						path : item
					};
				}
			}

			if (typeof item === 'function') {
				try {
					// 直接執行。
					item();

				} catch (e) {
					_.err('run: ' + e.message);
					_.debug('<code>'
							+ ('' + item).replace(/</g, '&lt;').replace(/\n/g,
									'<br />') + '</code>');
				}

				// 已處理完畢，destroy item。
				item = null;

			} else if (Array.isArray(item)) {
				if (item.length)
					// 登記相依性。
					need_net.set_need(item, item);
				else
					// 已處理完畢，destroy item。
					item = null;

			} else if (library_namespace.is_Object(item)) {
				if (item.module || item.path) {
					_.extend(options, item);
					if (!item.type)
						item.type = 'once';

					if (item.module) {
						// 判別 path.
					}

					if (item.type !== 'once') {
						// 預防這兩個也被複製了。
						delete item.module;
						delete item.path;
					}
				}

				if (item.type === 'reset') {
					delete item.type;
					options = item;
					// 已處理完畢，destroy item。
					item = null;
				} else if (item.type !== 'once') {
					_.extend(item, options);
					// 已處理完畢，destroy item。
					item = null;
				}

			} else if (item === PARALLEL || item === SEQUENTIAL) {
				options.parallel = item === PARALLEL;
				// 已處理完畢，destroy item。
				item = null;

			} else {
				// 其他都將被忽略!
				_.warn('_run: Unknown item: [' + item + ']!');
				// 已處理完畢，destroy item。
				item = null;
			}

			// current item is done.
			item = true;
			if (options.path) {
				// 判別 path.
				item = false;
			}
			// need_net.handle_daemon(options, item);

			if (item || options.parallel) {
				// 移到下一 group。
				sequence.shift();
			}

			if (sequence.length)
				setTimeout(
				// 為求相容，不用 .bind()。
				function() {
					_run(sequence, options);
				}, 0);
			else {
				// 確認沒有其他在 queue 中的。
			}
		}

		// 處理程序之內部 front-end。
		function run(sequence, options) {
			if (!Array.isArray(sequence)) {
				// _.debug('未輸入可處理之序列！', 3, 'run');
				// return;
				sequence = [ sequence ];
			}

			var default_options = {
				// 預設 options 為平行處理, simultaneously。
				parallel : true,
				// millisecond after options.wait
				timeout : 8000
			};

			// 設定好 options。
			if (_.is_Object(options))
				_.extend(default_options, options);
			else
				options = default_options;

			_run(sequence, options);
			/*
			 * // 依序執行，對每一項都先找出獨立不依賴它者的，先處理。 sequence.forEach( // function(item,
			 * index) { // 登記相依性。 if (index) need_net.set_need(sequence[index -
			 * 1], item); // 找出獨立不依賴它者的，先處理。 while (this.parallel) { // hold it
			 * if the resource is not included. need_net.handle_daemon(this,
			 * item); } }, options);
			 */

		}

		// 處理程序之對外 front-end。
		// running sequence:
		// {Integer} PARALLEL (平行處理), SEQUENTIAL (依序執行).
		// {Array} 另一組同時 loading set: [{String|Function|Integer}, ..] → 拆開全部當作同時
		// loading.
		// {String} module, path.
		// {Function} function to run/欲執行之 function → change .to_run。
		// {Object} options: loading with additional config. {module, path,
		// parallel, timeout, wait, reload, skip_error, type}. reload: force to
		// load
		// even it's
		// included.
		_.run = function() {
			var sequence = Array.prototype.slice.call(arguments);
			if (sequence.length > 1)
				// 預設為按順序先後執行。
				sequence.unshift(SEQUENTIAL);
			run(sequence);
		};
	})(CeL);

}

/*******************************************************************************
 * 
 * <code>

 CeL.set_debug(2);
 var need = new CeL.dependency_net;
 var a=function(){};need.add(a);
 CeL.assert(['13|function (){}_1',need.add(function(){})]);
 need.add(a);
 </code>
 * 
 * <code>

 CeL.set_debug(2);
 var need = new CeL.dependency_net;
 need.set_need([ '1_1', '1_2', '1-1', '1:1' ], '2_1');
 need.set_need('2_1', '3_1');
 need.set_need([ '1_1', '1-1' ], '2_2');
 need.set_need([ '3_1', '3_2' ], '4_1');
 need.set_need('4_1', '1_1');
 //	test
 CeL.assert([ , need.get_need('3_2') ]);
 //	test
 need.get_independent();
 //	test
 need.get_independent('2_1');
 //	test
 need.get_independent('4_1');

 </code>
 * 
 * <code>

 CeL.run(_1st(), _2nd(), _3rd());

 //	TODO:
 CeL.run({ option_1 : option_1, timeout : timeout }, _1st(), _2nd(), { timeout : timeout }, _3rd());

 CeL.run([ module_name_1, module_name_2 ], dependent());

 CeL.run(module_name, [ _1_dependent(), _2_dependent() ]);

 CeL.run(module_name, dependent_1(), [
 [ 1, module_name_1, [ _1_dependent(), _2_dependent() ] ],
 [ 1, module_name_2, [ _1_dependent(), _2_dependent() ] ] ], last());


 </code>
 * 
 */

