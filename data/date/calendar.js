
/**
 * @name	CeL function for calendrical calculations.
 * @fileoverview
 * 本檔案包含了曆法轉換的功能。
 * @since
 * 2014/4/12 15:37:56
 */

'use strict';
if (typeof CeL === 'function')
CeL.run(
{
name : 'data.date.calendar',
require : 'data.code.compatibility.|data.native.set_bind|data.date.String_to_Date',

code : function(library_namespace) {

//	requiring
var set_bind, String_to_Date;
eval(this.use());


/**
 * null module constructor
 * @class	calendars 的 functions
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



// copy from data.date.
// 一整天的 time 值。should be 24 * 60 * 60 * 1000 = 86400000.
var ONE_DAY_LENGTH_VALUE = new Date(0, 0, 2) - new Date(0, 0, 1);


//----------------------------------------------------------------------------------------------------------------------------------------------------------//
// 長曆: 中美洲長紀曆/馬雅長紀曆
// <a href="https://en.wikipedia.org/wiki/Mesoamerican_Long_Count_calendar" accessdate="2014/4/28 22:15" title="Mesoamerican Long Count calendar">中美洲長紀曆</a>

// GMT correlation: starting-point is equivalent to August 11, 3114 BCE in the proleptic Gregorian calendar
var Maya_epoch = (new Date(-3114 + 1, 8 - 1, 11)).getTime();

function Maya_Date(date) {
	if (typeof date === 'string')
		date = date.split(/[,.]/);
	else if (!Array.isArray(date))
		return new Date(NaN);

	var days = 0, length = date.length - 2, i = 0;
	while (i < length)
		days = days * 20 + (date[i++] | 0);
	days = (days * 18 + (date[i] | 0)) * 20 + (date[++i] | 0);
	return new Date(days * ONE_DAY_LENGTH_VALUE + Maya_epoch);
}

Maya_Date.to_Long_Count = function(date, to_Array) {
	var days = Math.floor((date - Maya_epoch) / ONE_DAY_LENGTH_VALUE),
	// Mesoamerican Long Count calendar
	Long_Count;
	if (!Number.isFinite(days) || days < 0)
		// NaN
		return Long_Count;
	Long_Count = [ days % 20 ];
	days = Math.floor(days / 20);
	Long_Count.unshift(days % 18);
	days = Math.floor(days / 18) | 0;
	while (days > 0 || Long_Count.length < 5) {
		Long_Count.unshift(days % 20);
		days = days / 20 | 0;
	}
	return to_Array ? Long_Count : Long_Count.join('.');
};


// TODO: 卓爾金曆(Tzolkin), Haab
_.Maya_Date = Maya_Date;


//----------------------------------------------------------------------------------------------------------------------------------------------------------//
// 長曆: 伊斯蘭曆

//Tabular Islamic calendar / Hijri calendar / التقويم الهجري المجدول /
//http://en.wikipedia.org/wiki/Tabular_Islamic_calendar
//伊斯蘭曆(回回曆)
//陳垣編的《中西回史日曆》(中華書局1962年修訂重印)。
//陈氏中西回史日历冬至订误，鲁实先


/*

CeL.run('data.date');

// 正解
CeL.assert(["-1/12/29",'622/7/15'.to_Date('CE').to_Tabular().slice(0,3).join('/')]);
CeL.assert(["1/1/1",'622/7/16'.to_Date('CE').to_Tabular().slice(0,3).join('/')]);
CeL.assert(["1/1/2",'622/7/17'.to_Date('CE').to_Tabular().slice(0,3).join('/')]);

CeL.assert(["1/1/30",'622/8/14'.to_Date('CE').to_Tabular().slice(0,3).join('/')]);
CeL.assert(["1/2/1",'622/8/15'.to_Date('CE').to_Tabular().slice(0,3).join('/')]);

CeL.assert(["1/12/29",'623/7/4'.to_Date('CE').to_Tabular().slice(0,3).join('/')]);
CeL.assert(["2/1/1",'623/7/5'.to_Date('CE').to_Tabular().slice(0,3).join('/')]);

CeL.assert(["30/12/29",'651/8/23'.to_Date('CE').to_Tabular().slice(0,3).join('/')]);
CeL.assert(["31/1/1",'651/8/24'.to_Date('CE').to_Tabular().slice(0,3).join('/')]);

// 反解
CeL.assert(["-1,12,29",CeL.Tabular_to_Date(-1,12,29).to_Tabular().slice(0,3).join(',')]);
CeL.assert(["1,1,1",CeL.Tabular_to_Date(1,1,1).to_Tabular().slice(0,3).join(',')]);
CeL.assert(["1,1,2",CeL.Tabular_to_Date(1,1,2).to_Tabular().slice(0,3).join(',')]);

CeL.assert(["1,1,30",CeL.Tabular_to_Date(1,1,30).to_Tabular().slice(0,3).join(',')]);
CeL.assert(["1,2,1",CeL.Tabular_to_Date(1,2,1).to_Tabular().slice(0,3).join(',')]);

CeL.assert(["1,12,29",CeL.Tabular_to_Date(1,12,29).to_Tabular().slice(0,3).join(',')]);
CeL.assert(["2,1,1",CeL.Tabular_to_Date(2,1,1).to_Tabular().slice(0,3).join(',')]);

CeL.assert(["30,12,29",CeL.Tabular_to_Date(30,12,29).to_Tabular().slice(0,3).join(',')]);
CeL.assert(["31,1,1",CeL.Tabular_to_Date(31,1,1).to_Tabular().slice(0,3).join(',')]);

*/


var Tabular_cycle_years = 30, Tabular_half_cycle = 15,
//平年日數。6=(12 / 2)
//每年有12個月。奇數個月有30天，偶數個月有29天，除第12/最後一個月在閏年有30天。
Tabular_common_year_days = (30 + 29) * 6,
//每一30年周期內設11閏年。
Tabular_leaps_in_cycle = 11,
//
Tabular_cycle_days = Tabular_common_year_days * Tabular_cycle_years
		+ Tabular_leaps_in_cycle,
//622/7/15 18:0 Tabular start offset
//伊斯蘭曆每日以日落時分日。例如 AH 1/1/1 可與公元 622/7/16 互換，
//但 AH 1/1/1 事實上是從 622/7/15 的日落時算起，一直到 622/7/16 的日落前為止。
//'622/7/16'.to_Date('CE').format(): '622/7/19' === new Date(622, 6, 19)
Tabular_epoch = String_to_Date('622/7/16', {
	parser : 'CE'
}).getTime(),
//Tabular_leap_count[shift + Tabular_cycle_years]
//= new Array( 30 : [ 各年於30年周期內已累積 leap days ] )
Tabular_leap_count = [],
//各月累積日數。[0, 30, 30+29, 30+29+30, ..]
Tabular_month_days = [ 0 ];

(function() {
	for (var month = 0, count = 0; month < 12;)
		Tabular_month_days.push(count += (month++ % 2 === 0 ? 30 : 29));
	// assert: Tabular_common_year_days === Tabular_month_days.pop();
})();

function list_leap() {
	for (var s = -Tabular_cycle_years; s <= Tabular_cycle_years; s++) {
		for (var year = 1, shift = s, leap = []; year <= Tabular_cycle_years; year++)
			if ((shift += Tabular_leaps_in_cycle) > Tabular_half_cycle)
				shift -= Tabular_cycle_years, leap.push(year);
		library_namespace.log(s + ': ' + leap);
	}
}

// 0: 2,5,7,10,13,16,18,21,24,26,29
// -3: 2,5,8,10,13,16,19,21,24,27,29
// 1: 2,5,7,10,13,15,18,21,24,26,29
// -5: 2,5,8,11,13,16,19,21,24,27,30

// shift: 小餘, -30－30.
function get_Tabular_leap_count(shift, year_serial) {
	if (0 < (shift |= 0))
		shift %= Tabular_cycle_years;
	else
		shift = 0;
	// + Tabular_cycle_years: 預防有負數。
	if (!((shift + Tabular_cycle_years) in Tabular_leap_count))
		// 計算各年於30年周期內已累積 leap days。
		for (var year = 0, count = 0,
		// new Array(Tabular_cycle_years)
		leap_days_count = Tabular_leap_count[shift + Tabular_cycle_years] = [ 0 ];
		//
		year < Tabular_cycle_years; year++) {
			if ((shift += Tabular_leaps_in_cycle) > Tabular_half_cycle)
				shift -= Tabular_cycle_years, count++;
			leap_days_count.push(count);
		}

	return Tabular_leap_count[shift + Tabular_cycle_years][year_serial];
}

function Tabular_to_Date(year, month, date, shift) {
	return new Date(Tabular_epoch +
	// 計算距離 Tabular_epoch 日數。
	(Math.floor((year = year < 0 ? year | 0 : year > 0 ? year - 1 : 0)
	//
	/ Tabular_cycle_years) * Tabular_cycle_days
	// 添上閏年數。
	+ get_Tabular_leap_count(shift,
	// 確認 year >=0。
	(year %= Tabular_cycle_years) < 0 ? (year += Tabular_cycle_years) : year)
	// 添上年之日數。
	+ year * Tabular_common_year_days
	// 添上月之日數。
	+ Tabular_month_days[(month || 1) - 1]
	// 添上日數。
	+ (date || 1) - 1) * ONE_DAY_LENGTH_VALUE);
}

// [ year, month, date, 餘下時間值(單位:日) ]
function Date_to_Tabular(date, shift) {
	var month,
	// 距離 Tabular_epoch 的日數。
	tmp = (date - Tabular_epoch) / ONE_DAY_LENGTH_VALUE,
	//
	delta = tmp - (date = Math.floor(tmp)),
	// 距離 Tabular_epoch 的30年周期之年數。
	year = Math.floor(date / Tabular_cycle_days) * Tabular_cycle_years;

	// 本30年周期內之日數。
	date %= Tabular_cycle_days;
	// 保證 date >=0。
	if (date < 0)
		date += Tabular_cycle_days;

	// 本30年周期內之年數: 0－30。
	// 30: 第29年年底。
	tmp = (date / Tabular_common_year_days) | 0;
	year += tmp;
	date %= Tabular_common_year_days;

	// 求出為本年第幾天之序數。
	// 減去累積到第 tmp 年首日，應該有幾個閏日。
	date -= get_Tabular_leap_count(shift, tmp);
	if (date < 0)
		// 退位
		year--, date += Tabular_common_year_days;

	// 至此確定年序數與求出本年第幾天之序數。

	// 這邊的計算法為 Tabular Islamic calendar 特殊設計過，並不普適。
	// 理據: 每月日數 >=29 && 末月累積日數 - 29*月數 < 29 (不會 overflow)

	// tmp 可能是本月，或是下月累積日數。
	tmp = Tabular_month_days[month = (date / 29) | 0];
	if (date < tmp)
		// tmp 是下月累積日數。
		tmp = Tabular_month_days[--month];
	// 本月日數。
	date -= tmp;

	// 序數→日期名
	return [ year + (year < 0 ? 0 : 1), month + 1, date + 1, delta ];
}

_.Tabular_to_Date = Tabular_to_Date;


//----------------------------------------------------------------------------------------------------------------------------------------------------------//
// 長曆: הַלּוּחַ הָעִבְרִי / Hebrew calendar / Jewish Calendar / 希伯來曆/猶太曆計算
// http://www.stevemorse.org/jcal/rules.htm


//Hour is divided into 1080 parts called halaqim
var Hebrew_1_HOUR = 1080,
// 1 hour of CE / 1 hour of Hebrew calendar.
Hebrew_to_CE_rate = (Date.parse('1/1/1 2:0') - Date.parse('1/1/1 1:0'))
		/ Hebrew_1_HOUR,
//
Hebrew_1_DAY = 24 * Hebrew_1_HOUR,
// 29dy, 12hr, 793hq
Hebrew_1_MONTH = 29 * Hebrew_1_DAY + 12 * Hebrew_1_HOUR + 793,
// Metonic cycle = 235 months: Hebrew calendar 採十九年七閏法
Hebrew_1_cycle = (19 * 12 + 7) * Hebrew_1_MONTH,
//
Hebrew_epoch = String_to_Date('-3761/9/9', {
	parser : 'Julian'
}).getTime()
// Molad of Tishri in year 1 occurred on Monday at 5hr, 204hq (5hr, 11mn, 20 sc)
+ (2 * Hebrew_1_DAY + 5 * Hebrew_1_HOUR + 204) * Hebrew_to_CE_rate;

function Hebrew_Date(year, month, date) {
	var date = Hebrew_Date.new_year_days(year),
	//
	days = Hebrew_Date.new_year_days(year + 1) - date;

	TODO;
	return date;
}

/*

for (y = 0; y < 19; y++)
	if (Hebrew_Date.is_leap(y))
		console.log(y);

*/
// the years 3, 6, 8, 11, 14, 17, and 19 are the long (13-month) years of the
// Metonic cycle
Hebrew_Date.is_leap = function(year) {
	return (1 + 7 * year | 0) % 19 < 7;
};

function get_this_day_time(date) {
	var day_start = new Date(date.getTime());
	day_start.setHour(0, 0, 0, 0);
	return date - day_start;
}

Hebrew_Date.new_year_days = function(year) {
	var halaqim = (12 * year + (((7 * (year - 1) - 6) / 19) + 2 | 0))
			* Hebrew_1_MONTH,
	//
	date = Hebrew_epoch + halaqim * Hebrew_to_CE_rate,
	//
	delay_days = Hebrew_Date.delay_days(year, new Date(date));
	date = Math.floor(date / ONE_DAY_LENGTH_VALUE);
	if (delay_days)
		date += delay_days;
	return date;
};

Hebrew_Date.delay_days = function(year, date) {
	var delay_days = 0, hour = date.getHour(), week_day = date.getDay();
	if (hour >= 18)
		// If molad Tishri occurs at 18 hr (i.e., noon) or later, Tishri 1 must
		// be delayed by one day.
		delay_days = 1;
	else if (week_day === 1) {
		// If molad Tishri following a leap year falls on Monday at 15 hr 589 hq
		// (9:32:43 1/3 AM) or later, Tishri 1 is delayed by one day
		if (hour > 15
				|| hour === 15
				&& get_this_day_time(date) > (15 * Hebrew_1_HOUR + 589)
						* Hebrew_to_CE_rate)
			delay_days = 1;
	} else if (week_day === 4) {
		// If molad Tishri in a common year falls on Tuesday at 9 hr 204 hq
		// (i.e., 3:11:20 AM) or later, then Tishri 1 is delayed
		if (hour > 9
				|| hour === 9
				&& get_this_day_time(date) >= (9 * Hebrew_1_HOUR + 204)
						* Hebrew_to_CE_rate)
			delay_days = 1;
	}

	if (delay_days)
		week_day = (week_day + 1) % 7;

	if (year > 3 && (week_day === 0 || week_day === 3 || week_day === 5))
		// If molad Tishri occurs on Sunday, Wednesday, or Friday, Tishri 1 must
		// be delayed by one day

		// since the molad Tishri of year 2 falls on a Friday, Tishri 1 of that
		// year should have been delayed by rule 1 so that Yom Kippor wouldn't
		// be on the day after the Sabbath. However Adam and Eve would not yet
		// have sinned as of the start of that year, so there was no
		// predetermined need for them to fast on that first Yom Kippor, and the
		// delay rule would not have been needed. And if year 2 was not delayed,
		// the Sunday to Friday of creation would not have been from 24-29 Elul
		// but rather from 25 Elul to 1 Tishri. In other words, Tishri 1 in the
		// year 2 is not the first Sabbath, but rather it is the day that Adam
		// and Eve were created.

		// year 3 wants to start on Wed according to its molad, so delaying year
		// 3 by the WFS rule would require too many days in year 2, therefore
		// WFS must be suspended for year 3 as well
		delay_days++;

	return delay_days;
};



//----------------------------------------------------------------------------------------------------------------------------------------------------------//
// 長曆: 西雙版納傣曆計算
// 適用範圍: 傣曆 0－103295 年。

/*

基本上按张公瑾:《西双版纳傣文〈历法星卜要略〉历法部分译注》、《傣历中的纪元纪时法》計算公式推算，加上過去暦書多有出入，因此與實暦恐有一兩天差距。
《中国天文学史文集 第三集》


http://blog.sina.com.cn/s/blog_4131e58f0101fikx.html
傣曆和農曆一樣，用干支紀年和紀日。傣曆干支約於東漢時由漢地傳入，使用年代早於紀元紀時的方法。不過傣族十二地支所代表的對象和漢族不完全相同，如「子」不以表鼠而代表大象，「辰」不代表龍，而代表蛟或大蛇。


[张公瑾,陈久金] 傣历中的干支及其与汉历的关系 (傣曆中的干支及其與漢曆的關係, 《中央民族学院学报》1977年第04期)
值得注意的是, 傣历中称干支日为“腕乃” 或‘婉傣” , 意思是“ 里面的日子” 或“傣族的日子” , 而一周一匕日的周日, 明显地是从外面传进来的, 则称为“腕诺” 或,’m 命” , 即“外面的日子· 或“ 你的日子’, , 两者你我相对, 内外有8lJ, 是很清楚的。很明显, 傣历甲的干支纪年与纪日是从汉历中吸收过来的, 而且已经成了傣历中不可分害少的组成部分。在傣文的两本最基本的推算历法书‘苏定》和《苏力牙》中, 干支纪年与纪日的名称冠全书之首, 可见汉历成份在傣历中的重要性。


《中央民族學院學報》 1979年03期
傣曆中的紀元紀時法
張公瑾
傣曆中的紀元紀時法,與公曆的紀時法相近似,即以某一個時間為傣曆紀元開始累計的時間,以後就順此按年月日往下記,至今年(1979年)10月1日(農曆己未年八月十一)為傣曆1341年12月月出11日,這是一種情況。
還有一種情況是:公元1979年10月1日又是傣曆紀元的第1341年、傣曆紀元的第16592月,並是傣曆紀元的第489982日。對這種年月日的累計數,現譯稱為傣曆紀元年數、紀元積月數和紀元積日數。

*/


/*
year:
傣曆紀元年數。

應可處理元旦，空日，除夕，閏月，後六月，後七月等。

Dai_Date(紀元積日數)
Dai_Date(紀元年數, 特殊日期)
	特殊日期: 元旦/除夕/空1/空2
Dai_Date(紀元年數, 0, 當年日序數)
Dai_Date(紀元年數, 月, 日)
	月: 1－12/閏/後6/後7

元旦：
	Dai_Date(year, 0)
	Dai_Date(year, '元旦')
當年日序 n：
	Dai_Date(year, 0, n)
空日（當年元旦之前的）：
	Dai_Date(year, '空1日')
	Dai_Date(year, '空2日')
	Dai_Date(year, 0, -1)
	Dai_Date(year, 0, -2)
除夕（當年元旦之前的）：
	Dai_Date(year, '除夕')
閏月：
	Dai_Date(year, '閏9', date)
	Dai_Date(year, '雙9', date)
	Dai_Date(year, '閏', date)

後六月：
	Dai_Date(year, '後6', date)

後七月：
	Dai_Date(year, '後7', date)


注意：由於傣曆元旦不固定在某月某日，因此同一年可能出現相同月分與日期的日子。例如傣曆1376年（公元2014年）就有兩個六月下五日。

為了維持獨一性，此處以"後六月"稱第二次出現的六月同日。

*/
function Dai_Date(year, month, date, get_days) {
	if (isNaN(year = Dai_Date.to_valid_year(year)))
		return get_days ? NaN : new Date(NaN);

	var days = typeof date === 'string'
			&& (date = date.trim()).match(/^([^\d]*)(\d+)/), is_leap;
	// 處理如「六月下一日」或「六月月下一日」即傣曆6月16日。
	if (days) {
		date = days[2] | 0;
		if (/月?上/.test(days[1]))
			date += 15;
	} else
		date |= 0;

	if (typeof month === 'string')
		if (/^[閏雙後][9九]?月?$/.test(month))
			month = 9, is_leap = true;
		else if (days = month.match(/^後([67])/))
			month = days[1];

	if (isNaN(month) || month < 1 || 12 < month) {
		// 確定元旦之前的空日數目。
		days = Dai_Date.null_days(year - 1);
		switch (month) {
		case '空2日':
			// 若有空2日，其必為元旦前一日。
			date--;
		case '空日':
		case '空1日':
			date -= days;
		case '除夕':
			date -= days + 1;
		}

		// 當作當年日序。
		days = Dai_Date.new_year_days(year) + date | 0;

	} else {
		// 將 (month) 轉成月序：
		// 6月 → 0
		// 7月 → 1
		// ...
		// 12月 → 6
		// 1月 → 7
		if ((month -= 6) < 0
		// 後6月, 後7月
		|| days)
			month += 12;

		// 處理應為年末之6月, 7月的情況。
		if (month < 2 && 0 < date
		// 七月: 7/1 → 6/30, 7/2 → 6/31..
		&& (month === 0 ? date : 29 + date) <
		//
		Dai_Date.new_year_date_serial(year))
			month += 12;

		days = Dai_Date.days_6_1(year) + date - 1
		//
		+ (month >> 1) * (29 + 30) | 0;
		if (month % 2 === 1)
			days += 29;

		if ((month > 3 || month === 3 && is_leap)
		// 處理閏月。
		&& Dai_Date.is_leap(year))
			days += 30;
		if (month > 2 && Dai_Date.is_full8(year))
			days++;
	}

	return get_days ? days : new Date(Dai_Date.epoch + days
			* ONE_DAY_LENGTH_VALUE);
}

// 適用範圍: 傣曆 0－103295 年
Dai_Date.to_valid_year = function(year, ignore_range) {
	if (false && year < 0)
		library_namespace.warn('Dai_Date.to_valid_year: 公式不適用於過小之年分：' + year);
	return !isNaN(year) && (ignore_range ||
	// 一般情況
	// -1e2 < year && year < 103296
	// from new_year_date_serial()
	0 <= year && (year < 2 || 714 <= year && year <= 3190)
	//
	) && year == (year | 0) ? year | 0 : NaN;
};

// 傣曆採十九年七閏法，平年有12個月，閏年有13個月。閏月固定在9月，所以閏年又稱為「雙九月」年
// 閏9月, 閏九月。
// 適用範圍: 傣曆 0－ 年
Dai_Date.is_leap = function(year) {
	// 傣曆零年當年九月置閏月。
	return year == 0 ||
	// 攝 = (year + 1) % 19;
	((7 * year | 0) - 6) % 19 < 7;
};


// 當年日數。365 or 366.
Dai_Date.year_days = function(year) {
	return Dai_Date.new_year_days(year + 1) - Dai_Date.new_year_days(year);
};

// 當年空日數目。1 or 2.
// 注意：這邊之年分，指的是當年除夕後，即明年（隔年）元旦之前的空日數目。與 Dai_Date() 不同！
// e.g., Dai_Date.null_days(100) 指的是傣曆100年除夕後，即傣曆101年元旦之前的空日數目。
// 依 Dai_Date.date_of_days() 的做法，空日本身會被算在前一年內。
Dai_Date.null_days = function(year) {
	// 傣曆潑水節末日之元旦（新年的第一天）與隔年元旦間，一般為365日（有「宛腦」一天）或366日（有「宛腦」兩天）。
	return Dai_Date.year_days(year) - 364;
};

/*

傣历算法剖析

原法@曆法星卜要略, 傣曆中的紀元紀時法：
x := year + 1
y := Floor[(year + 4)/9]
z := Floor[(year - y)/3]
r := Floor[(x - z)/2]
R := year - r + 49049
S := Floor[(36525875 year + R)/100000]
d := S + 1
Simplify[d]

1 + Floor[(
  49049 + 36525876 year - 
   Floor[1/2 (1 + year - Floor[1/3 (year - Floor[(4 + year)/9])])])/
  100000]


簡化法：
x := year + 1
y := ((year + 4)/9)
z := ((year - y)/3)
r := ((x - z)/2)
R := year - r + 49049
S := ((36525875 year + R)/100000)
d := S + 1
Simplify[d]

(1609723 + 394479457 year)/1080000


// test 簡化法 @ Javascript:
for (var year = -1000000, days; year <= 1000000; year++) {
	if (CeL.Dai_Date.new_year_days(year) !== CeL.Dai_Date
			.new_year_days_original(year))
		console.error('new_year_days: ' + year);
	var days = CeL.Dai_Date.new_year_days(year);
	if (CeL.Dai_Date.year_of_days(days) !== year
			|| CeL.Dai_Date.year_of_days(days - 1) !== year - 1)
		console.error('year_of_days: ' + year);
}


// get:
-976704
-803518
-630332
-523297
-350111
-176925
-69890
103296
276482
449668
556703
729889
903075

*/

// 元旦紀元積日數, accumulated days
// 原法@曆法星卜要略：
Dai_Date.new_year_days_original = function(year) {
	return 1 + Math
			.floor((49049 + 36525876 * year - Math.floor((1 + year - Math
					.floor((year - Math.floor((4 + year) / 9)) / 3)) / 2)) / 100000);
};


// 元旦紀元積日數, accumulated days
// 簡化法：適用於 -69889－103295 年
Dai_Date.new_year_days = function(year, get_remainder) {
	// 防止 overflow。但效果相同。
	// var v = 365 * year + 1 + (279457 * year + 529723) / 1080000,
	var v = (394479457 * year + 1609723) / 1080000 | 0,
	//
	f = Math.floor(v);
	// 餘數
	return get_remainder ? v - f : f;
};

// 簡化法：適用於 -3738－1000000 年
Dai_Date.year_of_days = function(days) {
	return Math.floor((1080000 * (days + 1) - 1609723) / 394479457) | 0;
};


// 紀元積月數, accumulated month


/*

原法@傣曆中的紀元紀時法：
day = 元旦紀元積日數

b := 11 day + 633
c := Floor[(day + 7368)/8878]
d := Floor[(b - c)/692]
dd := day + d
e := Floor[dd/30]
f := Mod[dd, 30]
Simplify[e]
Simplify[f]

e:
Floor[1/30 (day + 
    Floor[1/692 (633 + 11 day - Floor[(7368 + day)/8878])])]

f:
Mod[day + Floor[1/692 (633 + 11 day - Floor[(7368 + day)/8878])], 30]

*/


// cache
var new_year_date_serial = [ 30 ];

// 元旦之當月日序基數
// d = 30－35: 7/(d-29)
// others: 6/d
Dai_Date.new_year_date_serial = function(year, days, ignore_year_limit) {
	if (year in new_year_date_serial)
		return new_year_date_serial[year];

	if (isNaN(year = Dai_Date.to_valid_year(year, ignore_year_limit)))
		return NaN;

	// days: 元旦紀元積日數。
	if (isNaN(days))
		days = Dai_Date.new_year_days(year) | 0;

	// 參考用元旦之當月日序基數：常常須作調整。
	var date = (days +
	// 小月補足日數
	Math.floor((633 + 11 * days - Math.floor((7368 + days) / 8878)) / 692)
	// (date / 30 | 0) 是元旦所在月的紀元積月數
	) % 30 | 0;

	// 年初之6/1累積日數
	var days_diff
	// 平年年初累積日數
	= year * 354
	// 閏月年初累積日數 = 30 * (年初累積閏月數 (7r-6)/19+1=(7r+13)/19)
	+ 30 * (((7 * (year - 1) - 6) / 19) + 2 | 0)
	// 八月滿月年初累積日數。.194: 經手動測試，誤差=0 or 1日@部分0~1400年
	+ (.194 * year | 0)
	// 為傣曆紀元始於 7/1，而非 6/1；以及 date 由 6/1 而非 6/0 起始而調整。
	- 30
	// 至上方為年初之6/1累積日數，因此需要再加上元旦之當月日序基數，才是元旦紀元積日數。
	+ date
	// 計算兩者差距。
	- days | 0;

	// assert: -31 < days_diff < 2
	// for (var i = 0, j, y; i < 1200; i++) if ((j = CeL.Dai_Date.new_year_date_serial(i)) > 1 || j < -31) y = i;
	// 599
	// for (var i = 1200, j, y; i < 103296; i++) if ((j = CeL.Dai_Date.new_year_date_serial(i)) > 1 || j < -31) throw i;
	// 3191
	// return days_diff;
	if (false && library_namespace.is_debug(3)
			&& !(-31 < days_diff && days_diff < 2))
		library_namespace.warn('days_diff of ' + year + ': ' + days_diff);

	// 判斷 date 在 6月 或 7月：選擇與應有日數差距較小的。
	if (Math.abs(days_diff) > Math.abs(days_diff + 30))
		// 七月. 7/date0 → 6/30, 7/date1 → 6/31..
		date += 30;

	// 微調：當前後年 6/1 間不是指定的日數時，應當前後移動一兩日。但據調查發現，除前一年是雙九月暨八月滿月外，毋須微調。
	// 六月出一日與隔年六月出一日間，平年354天（八月小月）或355天（八月滿月），雙九月之年384天。
	if (Dai_Date.is_leap(year - 1)) {
		var last_days = Dai_Date.new_year_days(year - 1);
		if ((days - date) - (
		// 前一年是雙九月暨八月滿月，則將八月滿月推移至本年，元旦之當月日序基數後調一日。
		last_days - Dai_Date.new_year_date_serial(year - 1, last_days, true)) === 354 + 30 + 1)
			date++;
	}

	// cache
	return new_year_date_serial[year] = date | 0;
};


// 6/1 紀元積日數, accumulated days
// 簡化法：適用於 -69889－103295 年
Dai_Date.days_6_1 = function(year, days) {
	// days: 元旦紀元積日數。
	if (isNaN(days))
		days = Dai_Date.new_year_days(year) | 0;

	var date = Dai_Date.new_year_date_serial(year, days) | 0;

	return days - date + 1 | 0;
};


/*





// 求取反函數 caculator[-1](result)
function get_boundary(caculator, result, down, up, limit) {
	if (up - down === 0)
		return up;

	var boundary, value, increase;
	// assert: caculator(down) ~ caculator(up) 為嚴格遞增/嚴格遞減函數。
	if (caculator(up) - caculator(down) < 0)
		// swap.
		boundary = up, up = down, down = boundary;

	// assert: caculator(down)<caculator(up)
	increase = down < up;
	if (!(limit > 0))
		limit = 800;

	do {
		boundary = (up + down) / 2;
		// console.log(down + ' ~ ' + boundary + ' ~ ' + up);
		if (boundary === down || boundary === up)
			return boundary;
		value = result - caculator(boundary);
		if (value === 0) {
			if (result - caculator(down) === 0)
				down = boundary, value = true;
			if (result - caculator(up) === 0)
				up = boundary, value = true;
			if (value && (increase ? up - down > 0 : up - down < 0))
				continue;
			return boundary;
		}
		if (value > 0)
			down = boundary;
		else
			up = boundary;
	} while (--limit > 0 && (increase ? up - down > 0 : up - down < 0));

	throw 'get_boundary: caculator is not either strictly increasing or decreasing?';
}






(394479457 * 19) / 1080000
=
7495109683/1080000
=
6939.916373148^_  (period 3)


354*19+30*7
=
6936


19/(7495109683/1080000-6936)
=
20520000/4229683
=
4.851427400114854943030009577549901493799889968113449636769469...

「八月滿月」 4.8514274 年一次?


→
(year+k)/4.85142740011485494303|0 = 累積八月滿月?
0<=k<4.85142740011485494303

八月滿月 years:
1166~:
1167, 1172, 1176, 


d := 20520000/4229683
Floor[(1168+k)/d]-Floor[(1167+k)/d]==1





var d = 20520000 / 4229683, year;
function get_diff(k){return ((year+1+k)/d|0)-((year+k)/d|0);}

for(var i=0,last=-1,v,a=[];i<d;i+=.01,last=v)if(last!==(v=get_diff(i)))a.push(String(i).slice(0,7)+': '+v);a.join('\n');

function get_full8_range(full8_years) {
	var range = [ 0, Infinity ];

	// 八月滿月 years
	full8_years.forEach(function(y) {
		year = y;

		var low, high, b = 1;
		if (y > 1200 && y < 1280)
			b = 0;
		if (get_diff(b) == get_diff(b + 1)
				|| get_diff(b + 1) == get_diff(b + 2))
			throw '1==2 or 2==3 on ' + y;

		low = get_boundary(get_diff, 1, b, b + 1);
		y = (low - 1) * 4229683;
		if (Math.abs(y - Math.round(y)) > 1e-5)
			throw 'Error low on ' + year;
		if (range[0] < y)
			range[0] = Math.round(y);

		high = get_boundary(get_diff, 1, b + 1, b + 2);
		if (Math.abs(high - low - 1) > 1e-5)
			throw 'high-low!=1 on ' + year;
		y = (high - 2) * 4229683;
		if (Math.abs(y - Math.round(y)) > 1e-5)
			throw 'Error high on ' + year;
		if (range[1] > y)
			range[1] = Math.round(y);
	});

	range.push('function full8_days(year){return (4229683*year+'
			+ (4229683 + ((range[0] + range[1]) >> 1)) + ')/20520000|0;}');
	return range;
}


get_full8_range([ 1167, 1172, 1176, 1207, 1216, 1221, 1226, 1281, 1295 ])



year = 1167;
get_boundary(get_diff, 1, 1, 2);
// 1.1940034276800588=1+820573/4229683
get_boundary(get_diff, 1, 2, 3);
// 2.194003427680059=2+820573/4229683

.194003427680059~~820573/4229683

1+820573/4229683
<=k<
2+820573/4229683



year = 1172;
get_boundary(get_diff, 1, 1, 2);
// 1.045430827794803=1+192158/4229683
get_boundary(get_diff, 1, 2, 3);
// 2.045430827794803=2+192158/4229683


year = 1176;
get_boundary(get_diff, 1, 1, 2);
// 1.8968582279097745=1+3793426/4229683
get_boundary(get_diff, 1, 2, 3);
// 2.8968582279097745=2+3793426/4229683


1+820573/4229683
<=k<
2+192158/4229683




function _get_diff(k){return ((4229683*(year+1)+k)/20520000|0)-((4229683*(year)+k)/20520000|0);}

八月滿月 year:


year = 1207;
get_diff(1) != get_diff(2) && (get_boundary(get_diff, 1, 1, 2) - 1) * 4229683
// 3793426
get_diff(2) != get_diff(3) && (get_boundary(get_diff, 1, 2, 3) - 2) * 4229683
// 3793426


year = 1216;
(get_boundary(get_diff, 1, 1, 2) - 1) * 4229683
// 2995789
(get_boundary(get_diff, 1, 2, 3) - 2) * 4229683

year = 1221;
(get_boundary(get_diff, 1, 1, 2) - 1) * 4229683
// 2367374

year = 1226;
(get_boundary(get_diff, 1, 1, 2) - 1) * 4229683
// 1738959

year = 1281;
(get_boundary(get_diff, 1, 1, 2) - 1) * 4229683
// 4229683

year = 1295;
(get_boundary(get_diff, 1, 1, 2) - 1) * 4229683
// 4229683



1+820573/4229683
<=k<
2+1738959/4229683

(1+820573/4229683+2+1738959/4229683)/2


Math.floor(year / 19) * (19 * 354 + 7 * 30) + (7 * y / 19)

但由前面幾組即可發現，不存在此k值。

事實上，1398年年初累積八月滿月日數為271。
因此另設
年初累積八月滿月日數為:
Math.floor(a*year+b)

1397年為八月滿月，
1397年年初累積八月滿月日數為270
1398年年初累積八月滿月日數為271
→
(271-2)/1397<a<(271+1)/(1397+1)
-(271+1)/(1397+1)<b<(1397-4*(271-2))/1397


// 八月滿月 full8_years: { full8_year : 隔年年初累積八月滿月日數 }
function get_full8_range(full8_years) {
	var range = [ 0, 1, -1, 1 ], days, boundary;

	for ( var year in full8_years) {
		days = full8_years[year |= 0] | 0;
		// range[0]<a<range[1]
		// range[2]<b<range[3]
		boundary = (days - 2) / year;
		if (range[0] < boundary)
			range[0] = boundary;
		boundary = (days + 1) / (year + 1);
		if (range[1] > boundary)
			range[1] = boundary;
		boundary = -boundary;
		if (range[2] < boundary)
			range[2] = boundary;
		boundary = (year - 4 * (days - 2)) / year;
		if (range[3] > boundary)
			range[3] = boundary;
	}

	return range;
}

get_full8_range({
	1184 : 230,
	1207 : 234,
	1216 : 236,
	1221 : 237,
	1226 : 238,
	1397 : 271
});
[0.19256756756756757, 0.1945364238410596, -0.1945364238410596, 0.22972972972972974]


*/

// 當年是否為八月滿月。
Dai_Date.is_full8 = function(year) {
	if (year == 0)
		// 0年 days_diff = 29，排成無八月滿月較合適。
		return 0;
	var days_diff = Dai_Date.days_6_1(year + 1) - Dai_Date.days_6_1(year) - 354
			| 0;
	// assert: 0: 無閏月, 30: 閏9月.
	// assert: 雙九月與八月滿月不置在同一年。
	if (days_diff >= 30)
		days_diff -= 30;
	// assert: days_diff == 0 || 1
	return days_diff;
};

/*

CeL.Dai_Date(0).format({
	parser : 'CE',
	format : '%Y/%m/%d %年干支年%日干支日',
	locale : 'cmn-Hant-TW'
});

for (var y = 1233, i = 0, m; i < 12; i++) {
	m = i + 6 > 12 ? i - 6 : i + 6;
	console.log(y + '/' + m + '/' + 1 + ': ' + CeL.Dai_Date(y, m, 1).format({
		parser : 'CE',
		format : '%年干支年%日干支日',
		locale : 'cmn-Hant-TW'
	}));
}

*/

Dai_Date.date_name = function(date) {
	return date > 15 ? '下' + (date - 15) : date === 15 ? '望' : '出' + date;
};

// 當年日序 : 節日名
var Dai_festivals = {
	1 : '潑水節 元旦',
	364 : '潑水節 除夕',
	365 : '潑水節 空1日',
	366 : '潑水節 空2日'
};

// return 紀元積日數之 [ year, month, date, festival ];
Dai_Date.date_of_days = function(days, options) {
	// 前置處理。
	if (!library_namespace.is_Object(options))
		options = library_namespace.null_Object();

	var date, festival,
	//
	year = Dai_Date.to_valid_year(Dai_Date.year_of_days(days),
			options.ignore_year_limit),
	//
	date_name = options.numerical_date ? function(d) {
		return d;
	} : Dai_Date.date_name;
	if (isNaN(year))
		return [];

	date = Dai_Date.new_year_days(year) | 0;
	// 節日
	festival = Dai_festivals[days - date + 1];
	// 取得自 6/1 起之日數(當年日序數)
	date = days - Dai_Date.days_6_1(year, date);
	if (date >= (29 + 30 + 29)) {
		if (Dai_Date.is_full8(year)) {
			if (date === (29 + 30 + 29))
				return [ year, 8, date_name(30), festival ];
			date--;
		}
		if (date >= 2 * (29 + 30) && Dai_Date.is_leap(year)) {
			if (date < 2 * (29 + 30) + 30) {
				if ((date -= 2 * (29 + 30) - 1) === 15)
					festival = '關門節';
				return [ year, '閏9', date_name(date), festival ];
			}
			date -= 30;
		}
	}

	// month starts @ 6.
	var month = 6 + ((date / (29 + 30) | 0) << 1) | 0;
	if ((date %= 29 + 30) >= 29)
		month++, date -= 29;
	date++;
	if (month > 12) {
		month -= 12;
		if (month >= 6 && ((month > 6 ? date + 29 : date)
		// 在 date < 今年元旦日序的情況下，由於仍具有獨一性，因此不加上'後'。
		>= Dai_Date.new_year_date_serial(year)))
			// 會將空日視為前面的一年。
			month = '後' + month;
	}
	if (!festival && date === 15)
		if (month === 12)
			festival = '開門節';
		else if (month === 9 && !Dai_Date.is_leap(year))
			festival = '關門節';

	return [ year, month, date_name(date), festival ];
};


// 傣曆紀元起算日期。
Dai_Date.epoch = String_to_Date('638/3/22', {
	parser : 'Julian'
}).getTime()
// 傣曆紀元積日數 = JDN - 1954166
- Dai_Date.new_year_days(0) * ONE_DAY_LENGTH_VALUE;



// test: 經過正反轉換運算，應該回到相同的日子。
Dai_Date.test = function(start_Date, end_Date, error_limit) {
	start_Date = typeof start_Date === 'number' ? CeL.Dai_Date.epoch
			+ (start_Date | 0) * ONE_DAY_LENGTH_VALUE : start_Date - 0;
	var tmp = typeof end_Date === 'string'
			&& end_Date.trim().match(/^\+(\d+)$/);
	end_Date = tmp || typeof end_Date === 'number' ? (tmp ? start_Date
			: CeL.Dai_Date.epoch)
			+ end_Date * ONE_DAY_LENGTH_VALUE : end_Date - 0;
	if (isNaN(start_Date) || isNaN(end_Date))
		return;

	function get_month_serial(month) {
		if (isNaN(month)) {
			var matched = month.match(/^[^\d](\d{1,2})$/);
			if (!matched)
				throw 'Illegal month name: ' + month;
			month = matched[1] | 0;
		}
		return month;
	}

	var start = new Date, date_name, old_date_name, error = [];
	if (!(0 < error_limit && error_limit < 1e9))
		error_limit = 800;

	for (; start_Date < end_Date && error.length < error_limit; start_Date += ONE_DAY_LENGTH_VALUE) {
		date_name = (new Date(start_Date)).to_Dai({
			ignore_year_limit : true,
			numerical_date : true
		});
		if (old_date_name
				//
				&& (date_name[2] - old_date_name[2] !== 1 || old_date_name[1] !== date_name[1])) {
			if (false)
				library_namespace.log((start_Date - CeL.Dai_Date.epoch)
						/ ONE_DAY_LENGTH_VALUE + ': ' + date_name.join());
			// 確定 old_date_name 的下一個天為 date_name。
			// 月差距
			tmp = get_month_serial(date_name[1])
					- get_month_serial(old_date_name[1]);
			// 隔日
			if (date_name[2] - old_date_name[2] === 1 ? tmp !== 0
			// 隔月/隔年
			: date_name[2] !== 1 || old_date_name[2] !== 29
					&& old_date_name[2] !== 30 || tmp !== 0 && tmp !== 1
					&& (old_date_name[1] !== 12 || date_name[1] !== 1))
				error.push('日期名未接續: ' + old_date_name.join('/') + ' ⇨ '
						+ date_name.join('/') + ' ('
						+ (new Date(start_Date)).format({
							parser : 'CE',
							format : '%Y/%m/%d'
						}) + ' CE)');
		}
		old_date_name = date_name;

		if (start_Date - CeL.Dai_Date(date_name[0], date_name[1], date_name[2]) !== 0)
			error.push(start_Date + ' (' + (start_Date - CeL.Dai_Date.epoch)
					/ ONE_DAY_LENGTH_VALUE + '): ' + date_name.join('/'));
	}

	library_namespace.debug((new Date - start) + ' ms, error ' + error.length
			+ '/' + error_limit);
	return error;
};


_.Dai_Date = Dai_Date;

/*

console.error(CeL.Dai_Date.test(-20 * 366, 20000 * 366).join('\n'));
console.error(CeL.Dai_Date.test('699/3/21'.to_Date('CE'), 4).join('\n'));

console.error(CeL.Dai_Date.test(1000 * 366, 2000 * 366).join('\n'));
console.error(CeL.Dai_Date.test(new Date('1845/4/11'), 4).join('\n'));

// get:
-42657868800000 (-7304): -20/6/20
-42626332800000 (-6939): -19/6/1
-42594796800000 (-6574): -18/6/12
-42563174400000 (-6208): -17/6/24
-42531638400000 (-5843): -16/6/5
-42500102400000 (-5478): -15/6/15
-42468566400000 (-5113): -14/6/26
-42436944000000 (-4747): -13/6/8
-42405408000000 (-4382): -12/6/19
-42342336000000 (-3652): -10/6/10
-42310713600000 (-3286): -9/6/22
-42279177600000 (-2921): -8/6/3
-42247641600000 (-2556): -7/6/14
-42216105600000 (-2191): -6/6/25
-42184483200000 (-1825): -5/6/6
-42152947200000 (-1460): -4/6/17
-42121411200000 (-1095): -3/6/28
-42089875200000 (-730): -2/6/9
-42058252800000 (-364): -1/6/21


2014/4/27 13:44:6
CeL.Dai_Date.test(CeL.Dai_Date.new_year_days(0,0,1),CeL.Dai_Date.new_year_days(3192,0,1)).join('\n')
日期名未接續: 0/6/9/潑水節 空1日 ⇨ 1/6/12/潑水節 元旦 (639/3/22 CE)
日期名未接續: 1/5/22/潑水節 空2日 ⇨ 2/6/0/潑水節 元旦 (640/3/22 CE)
...

CeL.Dai_Date.test(CeL.Dai_Date.new_year_days(712,0,1),CeL.Dai_Date.new_year_days(3192,0,1)).join('\n')
...
日期名未接續: 712/5/9/潑水節 空1日 ⇨ 713/6/0/潑水節 元旦 (1351/3/28 CE)
...
日期名未接續: 3190/後7/29/潑水節 空2日 ⇨ 3191/6/0/潑水節 元旦 (3829/5/16 CE)
...

CeL.Dai_Date.test(CeL.Dai_Date.new_year_days(714,0,1),CeL.Dai_Date.new_year_days(3191,0,1)).join('\n')
// ""

*/


//----------------------------------------------------------------------------------------------------------------------------------------------------------//



library_namespace.extend({
	to_Long_Count : set_bind(Maya_Date.to_Long_Count),
	to_Tabular : set_bind(Date_to_Tabular),
	to_Dai : function(options) {
		// 轉成紀元積日數。
		return Dai_Date.date_of_days((this - Dai_Date.epoch)
				/ ONE_DAY_LENGTH_VALUE | 0, options);
	}
}, Date.prototype, null, 'function');


return (
	_// JSDT:_module_
);
}


});

