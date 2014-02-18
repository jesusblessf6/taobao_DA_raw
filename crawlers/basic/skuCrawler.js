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
						async.each(elements, function(element, callback){
							element.getTetx().then(function(text){
								if(text.indexOf("共") >= 0 && text.indexOf("页") >= 0){
									text = text.replace("共", "").replace("页", "");
									pageCount = Number(text);
								}
								callback();
							});
						}, function(err){
							if(err){http://spu.taobao.com/spu/detail.htm?spm=5133.117242.a2107.173.Doe1PC&cat=1801,50010788,50071436&spuid=49033934&spec=75475851&auction_page=2
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
					outercallback();
				}
			}).then(callback);
		},

		//open each page to get the sku data
		function(callback){
			var pageIndexes = [];
			for(var i = 1; i <= pageCount; i ++){
				pageIndexes.push(i);
			}

			async.eachSeries(pageIndexes, function(index, callback){
				driver.get(settings.itemMetaDetailPageUrl + "&spuid=" + skuMeta.itemMetaTid + "&spec=" + skuMeta.tid + "&auction_page=" + index).then(function(){
					driver.findElements({className : "list-item"}).then(function(list){
						async.each(list, function(item, callback){
							
							var tmpSku = {};
							async.series([

								//sellerId
								function(callback){
									item.getAttribute("sellerid").then(function(sid){
										tmpSku.sellerId = sid;
									}).then(callback);	
								},

								//tid and url
								function(callback){
									item.findElement({className : "img"}).then(function(img){
										img.findElement({tagName : "a"}).then(function(a){
											a.getAttribute("href").then(function(link){
												tmpSku.url = link;
												var parsedUrl = urlParser.parse(link, true);
												console.log(parsedUrl);
											});
										});
									}).then(callback);
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