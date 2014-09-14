/*!
 * 基底Controller
 * 
 * 2014/05/23 m.hashimoto
 */

// lib
var _		= require('lodash');
var async	= require('async');
var fs = require('fs');

var pagination = require('pagination');

var database	= App.store('postgre');


module.exports = {
	class : Class({
	has: {
		request: null,
		response: null,
		flash_message : ""
	},

	methods: {
		
		
		
		/*!
		 * 継承先のコントローラーではactionの先頭で呼ぶ
		 * 
		 * 2014/05/23 m.hashimoto
		 */
		init: function( request, response )
		{
			this.request = request;
			this.response = response;
			
			if( _.has( this.request.session, "flash_message" ) )
			{
				this.flash_message = this.request.session.flash_message;
				delete this.request.session.flash_message;
			}
			else
			{
				this.flash_message = "";
			}
		},
		
		/*!
		 * フラッシュメッセージ
		 * 
		 * 2014/05/23 m.hashimoto
		 */
		flash: function( message )
		{
			this.request.session.flash_message = message;
		},
		
		/*!
		 * 
		 * request.filesを入力
		 * 
		 * 2014/06/04 m.hashimoto
		 */
		extractFilesValue: function( request_files )
		{
			var ret = {};
			var keys = _.keys( request_files );
			
			_.forEach( keys, function( item, key ){
				
				ret[item] = request_files[item].name;
				
			});
			
			return App.modules.common.parseDotText2Object( ret );
		},
		
		/*!
		 * 
		 * 
		 * 2014/05/28 m.hashimoto
		 */
		isPost: function()
		{
			if( this.request.method === "POST" )
			{
				return true;
			}
			return false;
		},
		
		/*!
		 * ページャHTMLを組み立て
		 * 
		 * 2014/05/30 m.hashimoto
		 */
		renderPager: function( values )
		{
			var ret = "";
			
			ret += '<ul class="pagination pagination-lg">';

			if( !_.isNull( values.first ) )
			{
				ret += '<li><a id="pagination_a" href="' + values.prelink + "?page=" + (values.current - 1) + '">&laquo;</a></li>';
			}
			
			_.forEach(values.range, function(item, key)
			{
				if( item == values.current )
				{
					ret += '<li class="active"><a id="pagination_a" href="' + values.prelink + "?page=" + item + '">' + item + '<span class="sr-only">(current)</span>' + '</a></li>';
				}
				else
				{
					ret += '<li><a id="pagination_a" href="' + values.prelink + "?page=" + item + '">' + item + '</a></li>';
				}
			});
			
			if( !_.isNull( values.next ) )
			{
				ret += '<li><a id="pagination_a" href="' + values.prelink + "?page=" + (values.current + 1) + '">&raquo;</a></li>';
			}
			
			ret += '</ul>';
			
			return ret;
		},
		/*!
		 * 
		 */
		culcOffset: function( current_page, limit, total_count )
		{
			var ret = { current: 1, offset: 0 };
			
			ret.current = (current_page) * 1;
			ret.offset = (ret.current - 1) * limit;
			
			if( total_count <= ret.offset )
			{
				ret.offset = ret.offset - limit;
				ret.current = total_count / limit;
			}
			
			if( ret.offset < 0 )
			{
				ret.offset = 0;
			}
			
			return ret;
		},
		
		/*!
		 * pager
		 * 
		 * 2014/05/26 m.hashimoto
		 */
		getPager: function( model, pager_args, exit )
		{
			var self = this;
			
			var tmp = _.has( pager_args, "column" ) ? pager_args.column : ["*"];
			var column = _.isString( tmp ) ? tmp : "";
			
			if( _.isArray( tmp ) )
			{
				_.each( tmp, function ( value ) {
					column += value;
					if( _.last( tmp ) !== value )
					{
						column += ",";
					}
				});
			}
			
			var order = _.has( pager_args, "order" ) ? pager_args.order : "";
			order = _.isString( order ) ? order : null;
			
			var current = _.has( pager_args, "current" ) ? pager_args.current : null;
			var limit = _.has( pager_args, "rowsPerPage" ) ? pager_args.rowsPerPage : null;
			var offset_limit = null;
			
			var conditions = _.has( pager_args, "conditions" ) ? pager_args.conditions : null;
			
			var from = _.has( pager_args, "from" ) ? pager_args.from : model.name;
			
			var where = "";
			if( _.isString( conditions ) )
			{
				where = " WHERE " + conditions;
			}
			else if( _.isNull( conditions ) )
			{
				
			}
			
			var countquery = "SELECT COUNT(*) FROM " + from + " " + where;

			database.query( countquery, pager_args.condition_args, function (err, result) {
				if ( err ) { console.log( countquery ); callback(err, null); return; }

				var total_count = _.parseInt( App.model('common').safeGetCount( result ) );
				
				if( !_.isNull( current ) )
				{
					offset_limit = self.culcOffset( current, limit, total_count );
				}

				var arg = {
					prelink		: pager_args.prelink,
					current		: offset_limit.current,//pager_args.current,
					rowsPerPage	: pager_args.rowsPerPage,
					totalResult	: total_count,
					pageLinks	: 20
				};

				var pager = new pagination.SearchPaginator( arg );

				var paginator = {
					page_index : self.renderPager( pager.getPaginationData() ),
					page_detail: pager.getPaginationData()
				};
				
				var valuequery = "SELECT " + column + " FROM " + from + " " + where + ( ( order ) ? " ORDER BY " + order : "" ) + ( ( limit ) ? " LIMIT " + limit : "" ) + ( " OFFSET " + offset_limit.offset );

				database.query( valuequery, pager_args.condition_args, function (err, result) {
					if ( err ) { console.log( valuequery ); callback(err, null); return; }

					var data = App.model('common').safeGetResult( result );
					
					exit( err, { paginator : paginator, data: data } );
				});
			});
		},
		
		
		/*!
		 * render
		 * 
		 * 2014/05/23 m.hashimoto
		 */
		render: function( path, values )
		{
			values.flash_message = ( this.flash_message.length > 0 ) ? this.flash_message : "";

			this.response.render( path, values );
		},
		
	}
	})
};