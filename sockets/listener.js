/*

socket listeners

*/

module.exports = function(io){

	var brandCrawler = require('../crawlers/brandCrawler');
	var itemMetaCrawler = require('../crawlers/itemMetaCrawler');
	var skuMetaCrawler = require('../crawlers/skuMetaCrawler');

	var Brand = require('../models/brand');
	var ItemMeta = require('../models/itemMeta');

	var async = require('async');
	var mom = require('moment');

	io.sockets.on('connection', function (socket) {

		//connected
		socket.emit('log', {type: 'info', target: 'global', content: 'connected', time: mom().format('YYYY-MM-DD HH:mm:ss')});

		//start a crawler
		socket.on('start crawler', function(data){
			
			async.series([

				function(callback){
					socket.emit("log", {type: 'info', target: data.type, content: 'start crawling', time: mom().format('YYYY-MM-DD HH:mm:ss')});
					callback();
				},

				function(callback){
					console.log(data.type);
					switch(data.type){
						case 'brand':
							brandCrawler.start(callback);
						break;

						case 'product':
							Brand.getAllDescByItemUpdatedTime(function(err, results){
								if(err){
									console.log(err);
									callback();
									
								}else if(results){
									async.eachSeries(results, function(result, callback){
										itemMetaCrawler.start(result, callback);
									}, function(err){
										if(err){
											console.log(err);
										}
										callback();
									});
								}
							});
						break;

						case 'SKU':
							ItemMeta.getAllDescBySkuMetaUpdatedTime(function(err, results){
								if(err){
									console.log(err);
									callback();
								}else if(results){
									async.eachSeries(results, function(result, callback){
										skuMetaCrawler.start(result.tid, result.brandTid, callback);
									}, function(err){
										if(err){
											console.log(err);
										}
										callback();
									});
								}
							});
						break;
					}
					
				}

			], function(err){
				if(err){
					socket.emit("log", {type: 'err', target: data.type, content: 'end crawling', time: mom().format('YYYY-MM-DD HH:mm:ss')});
				}else{
					socket.emit("log", {type: 'info', target: data.type, content: 'end crawling', time: mom().format('YYYY-MM-DD HH:mm:ss')});
				}
			});
			
		});

	});  
};