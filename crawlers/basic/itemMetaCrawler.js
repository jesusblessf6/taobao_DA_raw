exports.start = function(brand, outercallback){
	
	var settings = require('../crawler_settings');
	var webdriver = require('selenium-webdriver');
	var async = require('async');
	var Brand = require('../../models/brand');
	var ItemMeta = require('../../models/itemMeta');
	var driver = new webdriver.Builder().
			   	withCapabilities(webdriver.Capabilities.chrome()).
			   	build();
	var pageIndexes = [];

	async.series([

		function(callback){
			driver.get(settings.brandDetailPageUrl + brand.tid).then(function(){
				driver.findElements({className : 'vm-page-text'}).then(function(pageTags){
					async.eachSeries(pageTags, function(pageTag, callback){
						pageTag.getInnerHtml().then(function(t){
							console.log(t);
							if(t.indexOf("共") >=0 && t.indexOf("页") >= 0){
								t = t.replace("共", "");
								t = t.replace("页", "");
								console.log(t);
								var pageCount = Number(t);
								for(var i = 1; i <= pageCount; i++){
									pageIndexes.push(i);
								}
							}
						}).then(callback);
					}, function(err){
						if(err){
							console.log(err);
						}
					})
					console.log(pageIndexes);
				}).then(callback);
			});
		},

		function(callback){
			async.eachSeries(pageIndexes, function(pageindex, callback){
				driver.get(settings.brandDetailPageUrl + brand.tid + "&page=" + pageindex).then(function(){
					driver.isElementPresent({className : 'choices-item'}).then(function(existed){
						if(existed){
							driver.findElement({className : 'choices-item'}).then(function(itemPanel){
								itemPanel.findElements({tagName : 'li'}).then(function(thumbs){

									async.eachLimit(thumbs, 2, 
										function(thumb, callback){
											
											var im = new ItemMeta({
												brandTid : brand.tid,
												comments : []
											});
											console.log('im: ');
											console.log(im);

											async.series([
												function(callback){
													thumb.findElement({className : 'title'}).then(function(titleDiv){
														titleDiv.findElement({tagName : 'a'}).then(function(atag){
															
															atag.getAttribute('href').then(function(href){
																im.url = href;
																console.log(href);
															});

															atag.getText().then(function(t){
																im.name = t;
															});
														}).then(callback);
													});
												},

												function(callback){
													var linkParts = im.url.split('&');
													for(var i = 0; i < linkParts.length; i ++){
														var kvpair = linkParts[i].split('=');
														if(kvpair[0] == "spuid"){
															im.tid = kvpair[1];
															break;
														}else{
															continue;
														}
													}
													callback();
												},

												function(callback){
													thumb.isElementPresent({className : 'comments'}).then(function(present){
														if(present){
															thumb.findElement({className : 'comments'}).then(function(commentsDiv){
																commentsDiv.findElements({tagName : 'a'}).then(function(commentTags){

																	for(var x in commentTags){
																		commentTags[x].getInnerHtml().then(function(commentText){
																			im.comments.push(commentText);
																		});
																	}
																});
															});												
														}
													}).then(callback);
												}, 

												function(callback){
													//var itemmeta = new ItemMeta(im);
													im.save(function(err, result){
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

										}, 
										function(err){
											if(err){
												console.log(err);									
											}
											callback();
										}
									);
								})
							});
						}
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
			Brand.updateUpdatedTime({
				tid : brand.tid,
				target : 'itemMeta',
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
			callback();
		}

	], function(err){
		outercallback();
	});
};