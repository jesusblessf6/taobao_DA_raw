exports.start = function(tid, brandTid, outercallback){
	var settings = require('../crawler_settings');
	var webdriver = require('selenium-webdriver');
	var async = require('async');
	var SkuMeta = require('../../models/skuMeta');
	var ItemMeta = require('../../models/itemMeta');
	var driver = new webdriver.Builder().
			   	withCapabilities(webdriver.Capabilities.chrome()).
			   	build();
	var skus = [];
	var tmpItemMeta = {};

	async.series([
		function(callback){
			driver.get(settings.itemMetaDetailPageUrl + "&spuid=" + tid).then(callback);
		},

		//update the category info of the Item Meta
		function(callback){
			driver.findElement({id : 'spuDetailList'}).then(function(catDiv){
				catDiv.findElements({tagName : 'a'}).then(function(cats){
					async.each(cats, function(cat, callback){
						var catIndex = 0;
						cat.getAttribute('href').then(function(link){
							var parts = link.split("&");
							for(var x in parts){
								var kvpair = parts[x].split("=");
								if(kvpair[0] == "cat" && !kvpair[1].contains(",")){
									if(kvpair[1] == "1801" || kvpair[1] == "50010788" || kvpair[1] == "50071436"){
										tmpItemMeta.cate1Id = Number(kvpair[1]);
										catIndex = 1;
									}else{
										tmpItemMeta.cate2Id = Number(kvpair[1]);
										catIndex = 2;
									}
								}
							}
						}).then(function(){
							cat.getInnerHtml().then(function(t){
								if(catIndex == 1){
									tmpItemMeta.cate1 = t;
								}
								else if(catIndex == 2){
									tmpItemMeta.cate2 = t;
								}
							});
						}).then(callback);
					}, function(err){
						if(err){
							console.log(err);
						}
					});
				});
			}).then(function(){
				ItemMeta.saveCateInfo(tid, tmpItemMeta.cate1, tmpItemMeta.cate2, null, tmpItemMeta.cate1Id, tmpItemMeta.cate2Id, null, function(err, result){
					if(err){
						console.log(err);
					}
				});
			}).then(callback);
		},

		function(callback){
			driver.findElement({className : "J_guiGe"}).then(function(specDiv){
				specDiv.findElements({tagName : 'span'}).then(function(specSpans){
					async.eachSeries(specSpans, function(specSpan, callback){
						var tmpSku = {
							itemMetaTid : tid, 
							brandTid : brandTid
						};
						specSpan.getAttribute('data-price').then(function(strPrice){
							tmpSku.refPrice = Number(strPrice);
						}).then(function(){

							specSpan.findElements({tagName : 'a'}).then(function(skuLinks){
								console.log(skuLinks.length);
								if(skuLinks.length > 0){
									var skuLink = skuLinks[0];
									skuLink.getAttribute("href").then(function(href){
										var parts = href.split("&").filter(function(element){
											return element.indexOf("spec=") >=0;
										});
										var specIdStr = parts[0].replace("spec=", "");
										tmpSku.tid = Number(specIdStr);
									}).then(function(){
										skuLink.getInnerHtml().then(function(spectitle){
											tmpSku.title = spectitle;
										});
									});
								}
								
							});
						}).then(function(){
							console.log(tmpSku);
							var s = new SkuMeta(tmpSku);
							console.log(s);
							s.save(function(err, result){
								if(err){
									console.log(err);
								}
							});
						}).then(callback);
					}, function(err){
						console.log(err);
					});
				});
			}).then(callback);
		},

		function(callback){
			ItemMeta.updateUpdatedTime({
				tid : tid,
				target : 'skuMeta',
				value : new Date()
			}, function(err, result){
				if(err){
					console.log(err);
				}
				callback();
			})
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