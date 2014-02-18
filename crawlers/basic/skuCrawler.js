exports.start = function(skuMeta, outercallback){
	
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
					outercallback();
				}
			}).then(callback);
		},

		//open each page to get the sku data
		function(callback){

			callback();
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