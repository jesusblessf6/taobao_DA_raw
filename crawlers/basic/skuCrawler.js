exports.start = function(skuMeta, outercallback){
	
	var urlParser = require('url');
	var settings = require('../crawler_settings');
	var webdriver = require('selenium-webdriver');
	var async = require('async');
	var SkuMeta = require('../../models/skuMeta');
	var Sku = require('../../models/sku');
	var pageCount = 1;

	var driver = new webdriver.Builder().withCapabilities(webdriver.Capabilities.chrome()).build();

	async.series([

		//open the sku meta page
		function(callback){
			driver.get(settings.itemMetaDetailPageUrl + "&spuid=" + skuMeta.itemMetaTid + "&spec=" + skuMeta.tid).then(callback);
		},

		//get the page info
		function(callback){
			driver.isElementPresent({className : "vm-page-text"}).then(function(existed){
				if(existed){
					//normal page.
					driver.findElements({className : "vm-page-text"}).then(function(elements){
						async.eachSeries(elements, function(element, callback){
							element.getText().then(function(text){
								if(text.indexOf("共") >= 0 && text.indexOf("页") >= 0){
									text = text.replace("共", "").replace("页", "");
									pageCount = Number(text);
								}
								callback();
							});
						}, function(err){
							if(err){
								console.log(err);
							}
							callback();
						});
					});
				}else{
					//abnormal page
					driver.close();
					driver.quit();
					driver = null;
					SkuMeta.updateUpdatedTime({
						target : "sku",
						tid : skuMeta.tid,
						itemMetaTid : skuMeta.itemMetaTid,
						value : new Date()
					}, function(err, result){
						if(err){
							console.log(err);
						}
						outercallback();
					});
					
				}
			}).then(callback);
		},

		//open each page to get the sku data
		function(callback){
			// var pageIndexes = [];
			// for(var i = 1; i <= pageCount; i ++){
			// 	pageIndexes.push(i);
			// }

			async.timesSeries(pageCount, function(index, callback){
				driver.get(settings.itemMetaDetailPageUrl + "&spuid=" + skuMeta.itemMetaTid + "&spec=" + skuMeta.tid + "&auction_page=" + index).then(function(){
					driver.findElements({className : "list-item"}).then(function(list){
						//console.log(list);
						async.eachSeries(list, function(item, callback){
							
							var tmpSku = {
								skuMetaTid : skuMeta.tid,
								itemMetaTid : skuMeta.itemMetaTid
							};
							async.series([

								//sellerId
								function(callback){
									item.getAttribute("sellerid").then(function(sid){
										tmpSku.sellerId = sid;
										console.log("sellerId : " + sid);
									}).then(callback);	
								},

								//tid and url
								function(callback){
									item.findElement({className : "img"}).then(function(img){
										img.findElement({tagName : "a"}).then(function(a){
											a.getAttribute("href").then(function(link){
												tmpSku.url = link;
												var parsedUrl = urlParser.parse(link, true);
												
												tmpSku.tid = parsedUrl.query.id;
												console.log("url : " + link);
												console.log("tid : " + parsedUrl.query.id);
											});
										});
									}).then(callback);
								},

								function(callback){
									item.findElement({className : "s-title"}).then(function(t){
										//get title
										t.findElement({tagName : "h3"}).then(function(h){
											h.getText().then(function(text){
												tmpSku.title = text;
												console.log("title : " + text);
											});
										});
										//get seller name
										// t.findElement({className : "ww-light"}).then(function(tt){
										// 	tt.getAttribute("data-nick").then(function(nick){
										// 		tmpSku.sellerName = nick;
										// 		console.log("sellerName : "+nick);
										// 	});
										// });
									}).then(callback);
								},

								//save the sku
								function(callback){
									var sku = new Sku(tmpSku);
									sku.tradeUpdated = new Date();
									sku.skuDetailUpdated = new Date();
									sku.shopUpdated = new Date();
									sku.otherUpdated = new Date();
									
									sku.save(function(err, result){
										if(err){
											console.log(err);					
										}
										callback();
									});
								},

								//update the updated time of sku meta
								function(callback){
									SkuMeta.updateUpdatedTime({
										target : "sku",
										tid : tmpSku.skuMetaTid,
										itemMetaTid : tmpSku.itemMetaTid,
										value : new Date()
									}, function(err, result){
										if(err){
											console.log(err);
										}
										callback();
									});
								}

							], function(err){
								if(err){
									console.log(err);
								}
								callback();
							});
							
						}, function(err){
							if(err){
								console.log(err);
							}
							callback();
						});
					});
				});

			}, function(err){
				if(err){
					console.log(err);
				}
				callback();
			});
			
		},

		function(callback){
			driver.close();
			driver.quit();
			driver = null;
			callback();
		}

	], function(err){
		if(err){
			console.log(err);
		}

		outercallback();
	});

};