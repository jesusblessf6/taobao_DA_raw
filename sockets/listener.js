/*

socket listeners

*/

module.exports = function(io){

	var brandCrawler = require('../crawlers/basic/brandCrawler');
	var itemMetaCrawler = require('../crawlers/basic/itemMetaCrawler');
	var skuMetaCrawler = require('../crawlers/basic/skuMetaCrawler');
	var skuCrawler = require('../crawlers/basic/skuCrawler');

	var Brand = require('../models/brand');
	var ItemMeta = require('../models/itemMeta');
	var SkuMeta = require('../models/skuMeta');

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

						case 'itemMeta':
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

						case 'skuMeta':
							ItemMeta.getAllCount(function(err, c){
								async.timesSeries(c/100+1, function(i, callback){
									ItemMeta.getTop100DescBySkuMetaUpdatedTime(function(err, results){
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
								}, callback);
							});
							
						break;

						case 'sku':
							SkuMeta.getAllCount(function(err, c){
								async.timesSeries(c/100 + 1, function(i, callback){
									SkuMeta.getTop100DescBySkuUpdated(function(err, results){
										if(err){
											console.log(err);
											callback();
										}else if(results){
											async.eachSeries(results, function(result, callback){
												skuCrawler.start(result, callback);
											}, function(err){
												if(err){
													console.log(err);
												}
												callback();
											});
										}
									});
								}, callback);
							});
						break;

						case 'trade':

						break;

						case 'shop':

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