// lib
var _		= require('lodash');
var async	= require('async');
var mailer		= require("nodemailer");
var qs          = require('querystring');
var fs = require('fs');

// module
//var auth	= App.modules.auth;

// model
//var member_model		= App.model('member');


module.exports = {

	generate_randomx: function(count){
		var generated		= [];
		var generatedCount	= generated.length;

		for(var i = 0 ; i < 5; i++){
			var candidate = Math.floor(Math.random() * count);
			for(var j = 0; j < generatedCount; j++) {
				if(candidate == generated[j]){
					candidate = Math.floor(Math.random() * count);
					j= -1;
				}
			}
			generated[i] = candidate;
			generatedCount++;
		}

		return generated;
	},
	
	/*!
	 * 
	 */
	parsePaginationPage: function( query )
	{
		var q = qs.parse( query );
		return _.has( q, "page" ) ? Number( q.page ) : 1;
	},
	
	
	/*!
	 * 店舗設定ファイルを書き込む
	 * 
	 * 2014/05/22 m.hashimoto
	 */
	writeShopini: function( data, callback )
	{
		var fs = require('fs');
		var file = './shopini.json';

		fs.writeFile( file, JSON.stringify( data, null, "	" ) ,function (err) {
			callback( err );
		});
	},
	
	/*!
	 * 店舗設定ファイルを読み込む
	 * 
	 * 2014/05/22 m.hashimoto
	 */
	readShopini: function( data, callback )
	{
//		var json = require('./shopini.json');

		var json = 
			JSON.parse(
				require('fs').readFileSync(
					require('path').resolve(
						__dirname, 
						'../shopini.json'),
					'utf8'));

		return json;
	},

	/*!
	 * 
	 * 2014/05/23 m.hashimoto
	 */
	safeToInt: function( x )
	{
		var int = _.parseInt( x );
		if( _.isNaN( int ) )
		{
			return 0;
		}
		return int;
	},

	/*!
	 * 
	 * 2014/05/22 m.hashimoto
	 */
	allKeys: function(obj)
	{
		var keys = [];
		for(var key in obj){
		   keys.push(key);
		}
		return keys;
	},
	
	/*!
	 * .区切りの文字列を連想配列に変換
	 * 
	 * { aaa.bbb.ccc : "hogehoge", ddd.eee.fff : 0123 }
	 * 
	 * 2014/05/22 m.hashimoto
	 */
	parseDotText2Object: function( data )
	{
		var ret = {};
		
		_.forEach(data, function(item, key)
		{
			var splited = key.split( "." );

			/// aaa.bbb.ccc
			var lastkey = _.last( splited );
			var text = "";
			
			_.forEach(splited, function(item1, key1)
			{
				text += "[\"" + item1 + "\"]";
				eval( "if( !ret" + text + " ) ret" + text + " = {};" );
			});
			
			
			text = "ret" + text + " = item;";
			eval( text );
		});
		
		
		return ret;
	},
	
	/*!
	*
	*/
	stripslashes: function(str) {
	  //       discuss at: http://phpjs.org/functions/stripslashes/
	  //      original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
	  //      improved by: Ates Goral (http://magnetiq.com)
	  //      improved by: marrtins
	  //      improved by: rezna
	  //         fixed by: Mick@el
	  //      bugfixed by: Onno Marsman
	  //      bugfixed by: Brett Zamir (http://brett-zamir.me)
	  //         input by: Rick Waldron
	  //         input by: Brant Messenger (http://www.brantmessenger.com/)
	  // reimplemented by: Brett Zamir (http://brett-zamir.me)
	  //        example 1: stripslashes('Kevin\'s code');
	  //        returns 1: "Kevin's code"
	  //        example 2: stripslashes('Kevin\\\'s code');
	  //        returns 2: "Kevin\'s code"

	  return (str + '')
		.replace(/\\(.?)/g, function(s, n1) {
		  switch (n1) {
			case '\\':
			  return '\\';
			case '0':
			  return '\u0000';
			case '':
			  return '';
			default:
			  return n1;
		  }
		});
	},

	/*!
	 * 
	 */
	htmlspecialchars: function (string, quote_style, charset, double_encode) {
		//       discuss at: http://phpjs.org/functions/htmlspecialchars/
		//      original by: Mirek Slugen
		//      improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
		//      bugfixed by: Nathan
		//      bugfixed by: Arno
		//      bugfixed by: Brett Zamir (http://brett-zamir.me)
		//      bugfixed by: Brett Zamir (http://brett-zamir.me)
		//       revised by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
		//         input by: Ratheous
		//         input by: Mailfaker (http://www.weedem.fr/)
		//         input by: felix
		// reimplemented by: Brett Zamir (http://brett-zamir.me)
		//             note: charset argument not supported
		//        example 1: htmlspecialchars("<a href='test'>Test</a>", 'ENT_QUOTES');
		//        returns 1: '&lt;a href=&#039;test&#039;&gt;Test&lt;/a&gt;'
		//        example 2: htmlspecialchars("ab\"c'd", ['ENT_NOQUOTES', 'ENT_QUOTES']);
		//        returns 2: 'ab"c&#039;d'
		//        example 3: htmlspecialchars('my "&entity;" is still here', null, null, false);
		//        returns 3: 'my &quot;&entity;&quot; is still here'

		var optTemp = 0,
		  i = 0,
		  noquotes = false;
		if (typeof quote_style === 'undefined' || quote_style === null) {
		  quote_style = 2;
		}
		string = string.toString();
		if (double_encode !== false) { // Put this first to avoid double-encoding
		  string = string.replace(/&/g, '&amp;');
		}
		string = string.replace(/</g, '&lt;')
		  .replace(/>/g, '&gt;');

		var OPTS = {
		  'ENT_NOQUOTES': 0,
		  'ENT_HTML_QUOTE_SINGLE': 1,
		  'ENT_HTML_QUOTE_DOUBLE': 2,
		  'ENT_COMPAT': 2,
		  'ENT_QUOTES': 3,
		  'ENT_IGNORE': 4
		};
		if (quote_style === 0) {
		  noquotes = true;
		}
		if (typeof quote_style !== 'number') { // Allow for a single string or an array of string flags
		  quote_style = [].concat(quote_style);
		  for (i = 0; i < quote_style.length; i++) {
			// Resolve string input to bitwise e.g. 'ENT_IGNORE' becomes 4
			if (OPTS[quote_style[i]] === 0) {
			  noquotes = true;
			} else if (OPTS[quote_style[i]]) {
			  optTemp = optTemp | OPTS[quote_style[i]];
			}
		  }
		  quote_style = optTemp;
		}
		if (quote_style & OPTS.ENT_HTML_QUOTE_SINGLE) {
		  string = string.replace(/'/g, '&#039;');
		}
		if (!noquotes) {
		  string = string.replace(/"/g, '&quot;');
		}

		return string;
	},
		
	/*!
	 * 
	 * 
	 * 2014/06/04 m.hashimoto
	 */
	imageupload: function( files, target_path, exit )
	{
		var keys = _.keys( files );
		
		async.map( keys, function( item, callback ){

			var tmp_path = files[item].path;

			/// 同名のファイルがあれば削除しておく
			fs.unlink( target_path, function() {
				/// ファイル移動
				fs.rename( tmp_path, target_path, function(err) {
					/// テンポラリ削除
					fs.unlink( tmp_path, function() {
						callback( err, {} );
					});
				});
			});

		}, function( err, result ){

			if( err ){ console.log('err -', err); }

			exit( err );
		});
	},
	
	
	/*!
	 * メール送信
	 * 
	 * data.sendTo
	 * data.body
	 * 
	 * 2014/05/23 m.hashimoto
	 */
	sendMail: function( data, callback )
	{
		if( !App.get( "mail_send_flg" ) )
		{
			callback( null, callback );
			return;
		}
		
		// メール送信
		var setting = { host: "127.0.0.1", port: "25" };

		// メールデータのセット
		var mailOptions = {
			from	: App.get('mail_from'),	// 送信者
			to		: data.sendTo,				// 送信先
			subject	: data.title,	// タイトル
			text	: data.body,					// HTML body
			cc		: data.cc,
			bcc		: data.bcc,
			replyTo	: data.replyTo,
		};

		// SMTP接続のプールを開きます smtpは再利用可能
		var smtp = mailer.createTransport("SMTP", setting);

		// 送信します
		smtp.sendMail(mailOptions, function(error, res){
			if (error) {
				console.log(error);
			}
			else {
				console.log("Message sent: " + res.message);
			}

			// smtpをもう使わないなら閉じる
			smtp.close();

			callback( err, callback );
		});
	}
};