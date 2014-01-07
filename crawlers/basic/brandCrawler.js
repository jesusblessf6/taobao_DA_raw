

exports.start = function(outercallback){

	var settings = require('../crawler_settings');
	var webdriver = require('selenium-webdriver');
	var async = require('async');
	var Brand = require('../../models/brand');
	var driver = new webdriver.Builder().
			   	withCapabilities(webdriver.Capabilities.chrome()).
			   	build();

	async.series([

		function(callback){
			driver.get(settings.brandListPageUrl);
			driver.findElement({id : '_data_brand_json'}).getInnerHtml().then(function(t){
				var brands = JSON.parse(t);
				//console.log(t);
				for(var x in brands){
					var cats = brands[x].data;
					console.log(cats);
					for(var y in cats){

						var b = new Brand({
							tid : cats[y].id,
							name : cats[y].name
						});

						b.save(function(err, result){
							if(err){
								console.log(err);
							}
							else{
								console.log('brand saved successfully');
							}
						});
					}
				}
			}).then(callback);
		}, 

		function(callback){
			driver.close();
			driver.quit();
			callback();
		}

	], function(err){
		outercallback();
	});

	
};