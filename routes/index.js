
/*
 * GET home page.
 */

var sys_settings = require('../system_settings');
var Brand = require('../models/brand');
var ItemMeta = require('../models/itemMeta');
var SkuMeta = require('../models/skuMeta');
var async = require('async');

module.exports = function(app){
	app.get('/', function(req, res){
		res.render('index', {title : 'Crawler Monitor', server : sys_settings.server, port : sys_settings.port});
	});

};