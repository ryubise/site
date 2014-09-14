// lib
var _		= require('lodash');
var async	= require('async');
var moment	= require('moment');

var base_controller	= require('./base.js');

// module
var auth	= App.modules.auth;
var common	= App.modules.common;

// model

var HomeController = Class({
	isa: base_controller.class,
	call : auth,

	has:{
	},

	methods: {
		index: function(request, response)
		{
			var self = this;
			self.init( request, response );

			var session = request.session;

			var values = response.auth_value;

			values.view = {
			};

			self.render( "game/index", values );
		}
	}
});

module.exports = new HomeController();