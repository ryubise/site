// lib
var _		= require('lodash');
var async	= require('async');
var moment	= require('moment');

// module
//var auth	= App.modules.auth;

// model


module.exports = {

	values : {
		title : "",
		left_menu : {
			/// アクティブなメニュー
			active_menu : "",
			name : "",
			subname : "",
		},
		header : {
			member : 0,
			new_member : 0,
			business : 0,
			purifura : 0,
			wait_order : 0,
			new_order : 0
		},
		flash_message: "",
		view : {},
	},

	/*!
	 * ヘッダに表示する、会員数受注などの値取得
	 *
	 * 2014/05/20 m.hashimoto
	 */
	prepareHeaderVars : function( request, exit )
	{
		exit();
	},

	/*!
	 * basic
	 */
	basic_auth : function( request, response, exit )
	{
		var auth, login;
		var session = request.session;

		if (!response.headers.authorization)
		{
			request.writeHead(401, {
				'WWW-Authenticate': 'Basic realm="Preserved-Flower.Com Authentication System""'
			});
			exit( null, {} );
			return;
		}

		console.log('response.headers.authorization:' + response.headers.authorization);

		auth = response.headers.authorization.replace(/^Basic /, '');
		auth = (new Buffer(auth, 'base64')).toString('utf-8');
		login = auth.split(':');

		async.waterfall([
			/// 準備
			function( callback ) {
				var arg = {};
				callback( null, arg );
			},
			/// アカウント取得
			function( arg, callback ) {
				var where = { id: login[0], pass: login[1], status: 0 };
				adminuser_model.findOne( where, function( err, result ) {
					arg.account = {};
					if( _.isEmpty( result ) ) {
						err = "認証に失敗しました。1度ブラウザを閉じてから再アクセスして下さい。";
						callback( err, arg );
					}
					else {
						arg.account = _.first( result );
						callback( err, arg );
					}
				});
			},
			/// ログイン日時更新
			function( arg, callback ) {
				var set = { logindate: moment().unix() };
				var up_where = { id: arg.account.id };
				adminuser_model.updateAll( set, up_where, function( err, result ){
					arg.is_update = result;
					callback( err, arg );
				});
			}

		], function( err, result ) {
			if( _.isNull( err ) ) {
				// ログインアカウントのIDをセッションに保存
				session.account_id = result.account.id;
				exit( null, {} );
			}
			else {
				exit( err, {} );
			}
		});


	},

	/*!
	 * メニューの名前など全ての画面で使う変数の準備
	 *
	 * 2014/05/20 m.hashimoto
	 */
	prepareValues : function( request )
	{
		var ctrl = request.request.route.controller.split( "_" );
		var controllers = {
			home	:	"玄関"
		};

		this.values.left_menu.name	= _.has( controllers, ctrl[0] ) ? controllers[ctrl[0]] : "";
		this.values.left_menu.active_menu = ctrl[0];
		this.values.title = App.settings.app.app.title_tag;
	},

	/*!
	 * viewに渡す変数を返す
	 *
	 * 2014/05/20 m.hashimoto
	 */
	getViewValue: function( request, exit )
	{
		var self = this;

		async.waterfall([
			function(callback)
			{
				self.prepareHeaderVars( request, function(){ self.prepareValues( request ); callback(); } );
			},
		], function(err, results)
		{
			exit( self.values );
		});
	},

	'.*': function(method, response, request)
	{
		var session = request.session;

		var self = App.modules.auth;

		self.getViewValue( request, function( values ) {
			request.auth_value = values;
			method( response, request );
		} );
	}

};