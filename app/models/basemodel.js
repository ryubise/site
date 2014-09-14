/*!
 * 基底モデル
 * 
 * 継承先でhas : { name: "モデル名" }を定義すること
 * 
 * 2014/05/22 m.hashimoto
 */


// module
var _		= require('lodash');
var async	= require('async');

// database connection
var database	= App.store('postgre');
var Transaction	= require('pg-transaction');
var tx			= new Transaction(database);

var SQL = require('bloom-sql');
SELECT  = SQL.SELECT;
INSERT  = SQL.INSERT;
UPDATE  = SQL.UPDATE;
DELETE  = SQL.DELETE;


module.exports = {
	class : Class({
	
		methods: {

			/*!
			 * 
			 * 
			 */
			 begin: function( callback )
			 {
				database.query( "BEGIN", [], function (err, result) {
					if (err) return callback(err, null);

					return callback(err, {});
				});
			 },

			/*!
			 * 
			 * 
			 */
			 commit: function( callback )
			 {
				database.query( "COMMIT", [], function (err, result) {
					if (err) return callback(err, null);

					return callback(err, {});
				});
			 },

			/*!
			 * 
			 * 
			 */
			 rollback: function( callback )
			 {
				database.query( "ROLLBACK", [], function (err, result) {
					if (err) return callback(err, null);

					return callback(err, {});
				});
			 },

			/*!
			 * インサート
			 * 
			 * 2014/05/28 m.hashimoto
			 */
			insert: function( data, callback ){
				
				var self = this;
				
				var query = INSERT( self.name ).VALUES(data);

				tx.query(query.text, query.values, function (err, result) {
					return callback( err, {} );
				});
			},

			/*!
			 * カウント
			 * 
			 * 2014/05/28 m.hashimoto
			 */
			count: function( where, callback ){
				
				var self = this;
				
				var query = SELECT( "COUNT(*)" ).FROM( self.name ).WHERE( where );

				database.query(query.text, query.values, function (err, result) {
					if (err){ console.log( err ); callback(err, null); return; }

					var data = App.model('common').safeGetCount( result );
					
					return callback(err, data);
				});
			},

			/*!
			 * クエリ
			 * 
			 * 2014/05/28 m.hashimoto
			 */
			query: function( text, values, callback ){
				
				var self = this;
				
				database.query(text, values, function (err, result) {
					if (err){ console.log( err ); callback(err, null); return; }

					var data = App.model('common').safeGetResult( result );
					
					return callback(err, data);
				});
			},

			/*!
			 * １件検索
			 * 
			 * 2014/05/23 m.hashimoto
			 */
			findOne: function( where, callback){
				
				var self = this;
				
				var query = SELECT(  ).FROM( self.name ).WHERE( where ).LIMIT( 1 );

				database.query(query.text, query.values, function (err, result) {
					if (err){ console.log( err ); callback(err, null); return; }

					var data = App.model('common').safeGetResult( result );

					return callback(err, data);
				});
			},
			/*!
			 * 全件検索
			 * 
			 * 2014/05/23 m.hashimoto
			 */
			findAll: function( where, callback){
				
				var self = this;
				
				var query = SELECT(  ).FROM(self.name).WHERE( where );

				database.query(query.text, query.values, function (err, result) {
					if (err) return callback(err, null);

					var data = App.model('common').safeGetResult( result );

					return callback(err, data);
				});
			},
			/*!
			 * 全件検索
			 * 
			 * column-> [ "column" ]
			 * where -> { column : value }
			 * order -> [ { column : "ASC"|"DESC" } ]
			 * 
			 * 2014/05/29 m.hashimoto
			 */
			findAllwithParam: function( param, callback){
				
				var self = this;

				var where = _.has( param, "where" ) ? param.where : {} ;
				var order = _.has( param, "order" ) ? param.order : [] ;
				var column= _.has( param, "column" ) ? param.column : "*" ;

				var query = null;
				
				if( _.isEmpty( where ) ){
					query = SELECT( column ).FROM( self.name );
				}else{
					query = SELECT( column ).FROM( self.name ).WHERE( where );
				}

				_.forEach( order, function( item, key ){
					
					var keys = App.modules.common.allKeys( item );

					_.forEach( keys, function( item2, key2 ){

						query.ORDER_BY( item2, item[item2] );
					} );
				} );

				database.query(query.text, query.values, function (err, result) {
					if (err) return callback(err, null);

					var data = App.model('common').safeGetResult( result );

					return callback(err, data);
				});
			},
			/*!
			 * 全件アップデート
			 * 
			 * 2014/05/23 m.hashimoto
			 */
			updateAll: function( set, where, callback){
				
				var self = this;

				var query = UPDATE( self.name ).SET( set ).WHERE( where );

				database.query(query.text, query.values, function (err, result) {
					if (err) return callback(err, null);

					var data = App.model('common').safeGetResult( result );

					return callback(err, data);
				});
			},
			/*!
			 * デリート
			 * 
			 * 2014/05/23 m.hashimoto
			 */
			deleteAll: function( where, callback){
				
				var self = this;
				
				var query = DELETE( self.name ).WHERE( where );

				tx.query(query.text, query.values, function (err, result) {
					return callback(err, {});
				});
			},

			/*!
			 * 
			 * 2014/05/29 m.hashimoto
			 */
			update_or_insert: function( update_values, insert_values, where, callback )
			{
				var self = this;

				self.count( where, function( err, result )
				{
					if( result <= 0 )
					{
						/// インサート
						self.insert( insert_values, function (err, result) {
							return callback( err, result );
						});
					}
					else
					{
						/// アップデート
						self.updateAll( update_values, where, function (err, result) {
							return callback( err, result );
						});
					}
				});
			}
			
		}
	})
};

